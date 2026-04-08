#!/usr/bin/env node
import 'dotenv/config';
import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { uploadToStrapi, createOrUpdateStrapiEntry, ensureAuthor, ensureCategory } from './lib/strapi.js';
import { htmlToStrapiBlocks } from './lib/blocks.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dryRun = process.argv.includes('--dry-run');
const extractOnly = process.argv.includes('--extract-only');

const cfg = {
  mysql: {
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port: parseInt(process.env.MYSQL_PORT || '3307', 10),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || 'root',
    database: process.env.MYSQL_DATABASE || 'wp_wastetrade',
  },
  strapiUrl: process.env.STRAPI_URL?.replace(/\/$/, '') || 'http://localhost:1337',
  apiToken: process.env.STRAPI_API_TOKEN || null,
  email: process.env.STRAPI_EMAIL || null,
  password: process.env.STRAPI_PASSWORD || null,
  uploadsPath: process.env.UPLOADS_PATH
    ? path.resolve(__dirname, process.env.UPLOADS_PATH)
    : null,
};

const mediaCache = new Map();
const authorCache = new Map();
const categoryCache = new Map();
const DELAY_MS = 150;

function log(...args) { console.log('[sql-migrate]', ...args); }
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }

function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#039;/g, "'")
    .replace(/\s+/g, ' ').trim();
}

function sanitizeSlug(slug) {
  if (!slug) return '';
  return slug
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9\-_.~]/g, '-')
    .replace(/-{2,}/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
}

/**
 * Map a WordPress media URL path (e.g. 2024/01/image.jpg) to a local file.
 */
function uploadsLocalPath(relPath) {
  if (!cfg.uploadsPath) return null;
  const full = path.join(cfg.uploadsPath, relPath);
  return fs.existsSync(full) ? full : null;
}

// ---------- MySQL queries ----------

async function getPostsByType(db, postType) {
  const [rows] = await db.execute(
    `SELECT p.ID, p.post_title, p.post_name, p.post_content, p.post_excerpt,
            p.post_date, p.post_status, p.post_author,
            u.display_name AS author_name
     FROM wp_posts p
     LEFT JOIN wp_users u ON p.post_author = u.ID
     WHERE p.post_type = ? AND p.post_status = 'publish'
     ORDER BY p.post_date DESC`,
    [postType]
  );
  return rows;
}

async function getPostMeta(db, postId) {
  const [rows] = await db.execute(
    `SELECT meta_key, meta_value FROM wp_postmeta WHERE post_id = ?`,
    [postId]
  );
  const meta = {};
  for (const r of rows) meta[r.meta_key] = r.meta_value;
  return meta;
}

async function getPostCategories(db, postId) {
  const [rows] = await db.execute(
    `SELECT t.name, t.slug
     FROM wp_terms t
     JOIN wp_term_taxonomy tt ON t.term_id = tt.term_id
     JOIN wp_term_relationships tr ON tt.term_taxonomy_id = tr.term_taxonomy_id
     WHERE tr.object_id = ? AND tt.taxonomy = 'category'`,
    [postId]
  );
  return rows;
}

async function getPostTags(db, postId) {
  const [rows] = await db.execute(
    `SELECT t.name
     FROM wp_terms t
     JOIN wp_term_taxonomy tt ON t.term_id = tt.term_id
     JOIN wp_term_relationships tr ON tt.term_taxonomy_id = tr.term_taxonomy_id
     WHERE tr.object_id = ? AND tt.taxonomy = 'post_tag'`,
    [postId]
  );
  return rows.map(r => r.name);
}

async function getResourceCategories(db, postId) {
  const [rows] = await db.execute(
    `SELECT t.name, t.slug
     FROM wp_terms t
     JOIN wp_term_taxonomy tt ON t.term_id = tt.term_id
     JOIN wp_term_relationships tr ON tt.term_taxonomy_id = tr.term_taxonomy_id
     WHERE tr.object_id = ?
       AND tt.taxonomy IN ('resource-categories', 'resource_category', 'category', 'resource-category', 'resources_category')`,
    [postId]
  );
  return rows;
}

async function getAttachmentUrl(db, attachmentId) {
  if (!attachmentId || attachmentId === '0') return null;
  const [rows] = await db.execute(
    `SELECT meta_value FROM wp_postmeta WHERE post_id = ? AND meta_key = '_wp_attached_file'`,
    [parseInt(attachmentId, 10)]
  );
  return rows[0]?.meta_value || null;
}

// ---------- Media helpers ----------

async function uploadLocalMedia(strapiCfg, relPath, filename) {
  const cacheKey = relPath;
  if (mediaCache.has(cacheKey)) return mediaCache.get(cacheKey);

  const localPath = uploadsLocalPath(relPath);
  if (!localPath) {
    log(`  Media not found locally: ${relPath}`);
    return null;
  }

  if (dryRun || extractOnly) {
    const fake = { id: -1, url: `/uploads/${filename}`, name: filename };
    mediaCache.set(cacheKey, fake);
    return fake;
  }

  try {
    const buffer = fs.readFileSync(localPath);
    const file = await uploadToStrapi(strapiCfg, buffer, filename);
    const result = {
      id: file?.id ?? file?.documentId,
      url: file?.url,
      name: file?.name || filename,
      alternativeText: file?.alternativeText || '',
      width: file?.width || 0,
      height: file?.height || 0,
      formats: file?.formats || {},
      hash: file?.hash || '',
      ext: file?.ext || '',
      mime: file?.mime || 'image/jpeg',
      size: file?.size || 0,
      provider: file?.provider || 'local',
      createdAt: file?.createdAt || new Date().toISOString(),
      updatedAt: file?.updatedAt || new Date().toISOString(),
    };
    mediaCache.set(cacheKey, result);
    log(`  Uploaded media: ${filename}`);
    return result;
  } catch (err) {
    log(`  Failed to upload ${filename}:`, err.response?.data?.error?.message || err.message);
    return null;
  }
}

function extractContentImagePaths(html) {
  if (!html) return [];
  const paths = [];
  const regex = /wp-content\/uploads\/([^"'\s<>)]+\.(jpg|jpeg|png|gif|webp|svg))/gi;
  let m;
  while ((m = regex.exec(html)) !== null) {
    paths.push(m[1]);
  }
  return [...new Set(paths)];
}

function replaceContentImageUrls(html, urlMap) {
  if (!html) return html;
  return html.replace(
    /https?:\/\/[^"'\s<>)]*?wp-content\/uploads\/([^"'\s<>)]+\.(jpg|jpeg|png|gif|webp|svg))/gi,
    (fullMatch, relPath) => urlMap.get(relPath) || fullMatch
  );
}

// ---------- Migration functions ----------

async function migrateArticles(db, strapiCfg) {
  log('\n=== Migrating Blog Posts → Articles ===');
  const posts = await getPostsByType(db, 'post');
  log(`Found ${posts.length} published posts`);

  let created = 0, failed = 0;
  for (const post of posts) {
    try {
      const meta = await getPostMeta(db, post.ID);
      const categories = await getPostCategories(db, post.ID);

      // Featured image
      let featuredImageId = null;
      const thumbnailId = meta._thumbnail_id;
      if (thumbnailId) {
        const attachedFile = await getAttachmentUrl(db, thumbnailId);
        if (attachedFile) {
          const filename = path.basename(attachedFile);
          const media = await uploadLocalMedia(strapiCfg, attachedFile, filename);
          featuredImageId = media?.id ?? null;
        }
      }

      // Content images
      const contentImagePaths = extractContentImagePaths(post.post_content);
      const urlMap = new Map();
      const mediaMetaMap = new Map();
      for (const relPath of contentImagePaths) {
        const media = await uploadLocalMedia(strapiCfg, relPath, path.basename(relPath));
        if (media?.url) {
          const strapiUrl = media.url.startsWith('http') ? media.url : `${cfg.strapiUrl}${media.url}`;
          urlMap.set(relPath, strapiUrl);
          mediaMetaMap.set(strapiUrl, media);
        }
        await sleep(50);
      }

      const processedContent = replaceContentImageUrls(post.post_content, urlMap);
      const blocks = htmlToStrapiBlocks(processedContent, url => url, mediaMetaMap);

      // Author
      let authorId = null;
      if (post.author_name) {
        if (!extractOnly && !dryRun) {
          authorId = await ensureAuthor(strapiCfg, post.author_name, authorCache);
        }
      }

      // Category
      let categoryId = null;
      if (categories.length > 0) {
        if (!extractOnly && !dryRun) {
          categoryId = await ensureCategory(strapiCfg, categories[0].name, categoryCache);
        }
      }

      const data = {
        title: stripHtml(post.post_title),
        slug: sanitizeSlug(post.post_name) || post.ID.toString(),
        excerpt: post.post_excerpt ? stripHtml(post.post_excerpt) : undefined,
        content: blocks,
        publishedDate: post.post_date ? post.post_date.toISOString().split('T')[0] : undefined,
        featuredImage: featuredImageId,
        author: authorId,
        category: categoryId,
      };

      if (extractOnly) {
        log(`  [extract] Article: "${data.title}" (slug: ${data.slug}, images: ${contentImagePaths.length})`);
        created++;
      } else if (dryRun) {
        log(`  [dry-run] Would create article: "${data.title}"`);
        created++;
      } else {
        await createOrUpdateStrapiEntry(strapiCfg, 'articles', data);
        created++;
        log(`  Created article ${created}/${posts.length}: "${data.title}"`);
      }
    } catch (err) {
      failed++;
      log(`  Failed "${stripHtml(post.post_title)}":`, err.response?.data?.error?.message || err.message);
    }
    await sleep(DELAY_MS);
  }
  log(`Articles done. Success: ${created}, Failed: ${failed}`);
  return { created, failed };
}

async function migrateVacancies(db, strapiCfg) {
  log('\n=== Migrating Vacancies → Jobs ===');
  const vacancies = await getPostsByType(db, 'wt_vacancies');
  log(`Found ${vacancies.length} published vacancies`);

  let created = 0, failed = 0;
  for (const post of vacancies) {
    try {
      const meta = await getPostMeta(db, post.ID);

      const contentImagePaths = extractContentImagePaths(post.post_content);
      const urlMap = new Map();
      const mediaMetaMap = new Map();
      for (const relPath of contentImagePaths) {
        const media = await uploadLocalMedia(strapiCfg, relPath, path.basename(relPath));
        if (media?.url) {
          const strapiUrl = media.url.startsWith('http') ? media.url : `${cfg.strapiUrl}${media.url}`;
          urlMap.set(relPath, strapiUrl);
          mediaMetaMap.set(strapiUrl, media);
        }
        await sleep(50);
      }

      const processedContent = replaceContentImageUrls(post.post_content, urlMap);
      const blocks = htmlToStrapiBlocks(processedContent, url => url, mediaMetaMap);

      const location = meta.location || meta._location || null;
      const salaryPerYear = meta.salary_per_year || meta._salary_per_year || meta.salary || null;
      const acfType = meta.type || meta._type || null;

      let employmentType = null;
      if (acfType) {
        const t = acfType.toLowerCase();
        if (t === 'full time' || t === 'full-time') employmentType = 'Full-time';
        else if (t === 'part time' || t === 'part-time') employmentType = 'Part-time';
        else if (t === 'contract') employmentType = 'Contract';
        else if (t === 'temporary') employmentType = 'Temporary';
        else if (t === 'internship') employmentType = 'Internship';
      }

      let type = null;
      if (acfType) {
        const t = acfType.toLowerCase();
        if (t === 'full time' || t === 'full-time') type = 'Full Time';
        else if (t === 'part time' || t === 'part-time') type = 'Part Time';
      }

      const data = {
        title: stripHtml(post.post_title),
        slug: sanitizeSlug(post.post_name) || post.ID.toString(),
        description: blocks,
        location,
        employmentType,
        salaryPerYear: salaryPerYear ? String(salaryPerYear) : undefined,
        type: type || undefined,
      };

      if (extractOnly) {
        log(`  [extract] Job: "${data.title}" (location: ${data.location}, type: ${data.type})`);
        created++;
      } else if (dryRun) {
        log(`  [dry-run] Would create job: "${data.title}"`);
        created++;
      } else {
        await createOrUpdateStrapiEntry(strapiCfg, 'jobs', data);
        created++;
        log(`  Created job ${created}/${vacancies.length}: "${data.title}"`);
      }
    } catch (err) {
      failed++;
      log(`  Failed "${stripHtml(post.post_title)}":`, err.response?.data?.error?.message || err.message);
    }
    await sleep(DELAY_MS);
  }
  log(`Jobs done. Success: ${created}, Failed: ${failed}`);
  return { created, failed };
}

/**
 * Assemble HTML content from ACF custom fields for resources that use
 * a structured layout instead of post_content.
 *
 * Field pattern:
 *   content_section_1..4, sub_heading_2..4, image_1..3
 *   properties_sub_heading, properties_content_section, properties_image
 *   applications_sub_heading, applications_content_section, applications_image
 *   recyclability_sub_heading, recyclability_content_section
 *   cta_sub_heading, cta_content_section
 */
function assembleResourceHtml(meta) {
  const sections = [];

  const acfSections = [
    { heading: null, content: 'content_section_1', image: 'image_1' },
    { heading: 'sub_heading_2', content: 'content_section_2', image: 'image_2' },
    { heading: 'sub_heading_3', content: 'content_section_3', image: 'image_3' },
    { heading: 'sub_heading_4', content: 'content_section_4', image: null },
    { heading: 'properties_sub_heading', content: 'properties_content_section', image: 'properties_image' },
    { heading: 'applications_sub_heading', content: 'applications_content_section', image: 'applications_image' },
    { heading: 'recyclability_sub_heading', content: 'recyclability_content_section', image: null },
    { heading: 'cta_sub_heading', content: 'cta_content_section', image: null },
  ];

  for (const sec of acfSections) {
    const heading = sec.heading ? (meta[sec.heading] || '').trim() : '';
    const content = (meta[sec.content] || '').trim();
    const image = sec.image ? (meta[sec.image] || '').trim() : '';

    if (!content && !heading) continue;

    if (heading) sections.push(`<h2>${heading}</h2>`);
    if (content) {
      const wrapped = content.startsWith('<') ? content : `<p>${content}</p>`;
      sections.push(wrapped);
    }
    if (image) sections.push(`<img src="${image}" alt="">`);
  }

  return sections.join('\n');
}

async function migrateResources(db, strapiCfg) {
  log('\n=== Migrating Resources → Resources ===');
  const resources = await getPostsByType(db, 'resources');
  log(`Found ${resources.length} published resources`);

  if (resources.length === 0) {
    log('  Trying alternate post type "resource"...');
    const alt = await getPostsByType(db, 'resource');
    if (alt.length > 0) {
      resources.push(...alt);
      log(`  Found ${alt.length} published resources (as "resource")`);
    }
  }

  const resourceCategoryMap = {
    'wastetrade guides': 'WasteTrade Guides',
    'wastetrade-guides': 'WasteTrade Guides',
    'plastics': 'Plastics',
    'types of plastics': 'Plastics',
    'applications of plastics': 'Plastics',
    'introduction to plastics': 'Plastics',
    'plastic waste management': 'Plastics',
    'paper': 'Paper',
    'metals': 'Metals',
    'rubber': 'Rubber',
    'recycling': 'Recycling',
    'waste logistics': 'Waste Logistics',
    'waste-logistics': 'Waste Logistics',
    'environmental': 'Environmental',
    'regulations': 'Regulations',
  };

  let created = 0, failed = 0;
  for (const post of resources) {
    try {
      const meta = await getPostMeta(db, post.ID);
      const cats = await getResourceCategories(db, post.ID);

      // Featured image
      let featuredImageId = null;
      const thumbnailId = meta._thumbnail_id;
      if (thumbnailId) {
        const attachedFile = await getAttachmentUrl(db, thumbnailId);
        if (attachedFile) {
          const filename = path.basename(attachedFile);
          const media = await uploadLocalMedia(strapiCfg, attachedFile, filename);
          featuredImageId = media?.id ?? null;
        }
      }

      // Build content: use post_content if available, otherwise assemble from ACF fields
      let htmlContent = post.post_content || '';

      if (!htmlContent.trim()) {
        htmlContent = assembleResourceHtml(meta);
      }

      // Content images (from assembled HTML)
      const contentImagePaths = extractContentImagePaths(htmlContent);
      const urlMap = new Map();
      const mediaMetaMap = new Map();
      for (const relPath of contentImagePaths) {
        const media = await uploadLocalMedia(strapiCfg, relPath, path.basename(relPath));
        if (media?.url) {
          const strapiUrl = media.url.startsWith('http') ? media.url : `${cfg.strapiUrl}${media.url}`;
          urlMap.set(relPath, strapiUrl);
          mediaMetaMap.set(strapiUrl, media);
        }
        await sleep(50);
      }

      const processedContent = replaceContentImageUrls(htmlContent, urlMap);
      const blocks = htmlToStrapiBlocks(processedContent, url => url, mediaMetaMap);

      // Map category
      let resourceCategory = undefined;
      if (cats.length > 0) {
        const catName = cats[0].name.toLowerCase();
        const catSlug = cats[0].slug.toLowerCase();
        resourceCategory = resourceCategoryMap[catName] || resourceCategoryMap[catSlug] || undefined;
      }

      const data = {
        title: stripHtml(post.post_title),
        slug: sanitizeSlug(post.post_name) || post.ID.toString(),
        excerpt: post.post_excerpt ? stripHtml(post.post_excerpt) : undefined,
        content: blocks,
        featuredImage: featuredImageId,
        resourceCategory,
      };

      if (extractOnly) {
        log(`  [extract] Resource: "${data.title}" (category: ${data.resourceCategory || 'none'}, images: ${contentImagePaths.length})`);
        created++;
      } else if (dryRun) {
        log(`  [dry-run] Would create resource: "${data.title}"`);
        created++;
      } else {
        await createOrUpdateStrapiEntry(strapiCfg, 'resources', data);
        created++;
        log(`  Created resource ${created}/${resources.length}: "${data.title}"`);
      }
    } catch (err) {
      failed++;
      log(`  Failed "${stripHtml(post.post_title)}":`, err.response?.data?.error?.message || err.message);
    }
    await sleep(DELAY_MS);
  }
  log(`Resources done. Success: ${created}, Failed: ${failed}`);
  return { created, failed };
}

// ---------- Main ----------

async function run() {
  log('Connecting to MySQL:', `${cfg.mysql.host}:${cfg.mysql.port}/${cfg.mysql.database}`);
  log('Strapi:', cfg.strapiUrl);
  log('Uploads:', cfg.uploadsPath || '(none)');
  log('Mode:', extractOnly ? 'EXTRACT ONLY' : dryRun ? 'DRY RUN' : 'LIVE MIGRATION');
  log('');

  const db = await mysql.createConnection(cfg.mysql);
  log('Connected to MySQL');

  // Quick sanity check
  const [postTypes] = await db.execute(
    `SELECT post_type, COUNT(*) as cnt
     FROM wp_posts
     WHERE post_status = 'publish'
     GROUP BY post_type
     ORDER BY cnt DESC`
  );
  log('Published post types in WordPress:');
  for (const pt of postTypes) {
    log(`  ${pt.post_type}: ${pt.cnt}`);
  }

  const strapiCfg = {
    baseUrl: cfg.strapiUrl,
    apiToken: cfg.apiToken,
    email: cfg.email,
    password: cfg.password,
  };

  const results = {};
  results.articles = await migrateArticles(db, strapiCfg);
  results.jobs = await migrateVacancies(db, strapiCfg);
  results.resources = await migrateResources(db, strapiCfg);

  await db.end();

  log('\n========== MIGRATION SUMMARY ==========');
  log(`Articles:  ${results.articles.created} created, ${results.articles.failed} failed`);
  log(`Jobs:      ${results.jobs.created} created, ${results.jobs.failed} failed`);
  log(`Resources: ${results.resources.created} created, ${results.resources.failed} failed`);
  log(`Media uploaded: ${mediaCache.size} files`);
  log('=========================================\n');
}

run().catch(err => {
  console.error('[sql-migrate] Fatal error:', err);
  process.exit(1);
});
