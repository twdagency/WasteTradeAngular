#!/usr/bin/env node
import 'dotenv/config';
import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { wpToStrapiMapping, DELAY_MS } from './config.js';
import {
  fetchAllWpItems,
  extractMediaFromContent,
  resolveMediaIds,
} from './lib/wordpress.js';
import {
  uploadToStrapi,
  createStrapiEntry,
  createOrUpdateStrapiEntry,
  ensureAuthor,
  ensureCategory,
} from './lib/strapi.js';
import { htmlToSimpleBlocks } from './lib/blocks.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dryRun = process.argv.includes('--dry-run');

const cfg = {
  wpUrl: process.env.WORDPRESS_URL?.replace(/\/$/, ''),
  wpAuth: process.env.WORDPRESS_AUTH || null,
  strapiUrl: process.env.STRAPI_URL?.replace(/\/$/, '') || 'http://localhost:1337',
  apiToken: process.env.STRAPI_API_TOKEN || null,
  email: process.env.STRAPI_EMAIL || null,
  password: process.env.STRAPI_PASSWORD || null,
  uploadsPath: process.env.UPLOADS_PATH ? path.resolve(__dirname, process.env.UPLOADS_PATH) : null,
};

// Media cache: url -> Strapi file id
const mediaCache = new Map();
const authorCache = new Map();
const categoryCache = new Map();

// WordPress post types to migrate (posts = News, wt_vacancies, resources)
const WP_CONTENT_TYPES = ['post', 'wt_vacancies', 'resources'];

function log(...args) {
  console.log('[migrate]', ...args);
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

/**
 * Map WordPress media URL to local file path under uploads folder.
 * e.g. https://www.wastetrade.com/wp-content/uploads/2024/01/image.jpg -> uploadsPath/2024/01/image.jpg
 */
function urlToLocalPath(url) {
  if (!cfg.uploadsPath) return null;
  try {
    const u = new URL(url);
    const match = u.pathname.match(/wp-content\/uploads\/(.+)$/i);
    if (!match) return null;
    return path.join(cfg.uploadsPath, match[1]);
  } catch {
    return null;
  }
}

async function downloadFile(url, auth, referer) {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    Accept: 'image/*,*/*;q=0.8',
    ...(referer && { Referer: referer }),
    ...(auth && { Authorization: `Basic ${Buffer.from(auth).toString('base64')}` }),
  };
  const res = await axios.get(url, { responseType: 'arraybuffer', headers, timeout: 30000 });
  return Buffer.from(res.data);
}

async function migrateMedia(wpItems, strapiCfg) {
  const { mediaIds, mediaUrls } = extractMediaFromContent(wpItems, cfg.wpUrl);

  const idToUrl = await resolveMediaIds(cfg.wpUrl, mediaIds, cfg.wpAuth, DELAY_MS);
  const allUrls = new Set(mediaUrls);
  idToUrl.forEach((url) => allUrls.add(url));

  const toDownload = [...allUrls].filter((u) => !mediaCache.has(u));
  log(`Media: ${toDownload.length} files to upload (${mediaCache.size} already cached)`);

  if (cfg.uploadsPath) log(`  Using local uploads: ${cfg.uploadsPath}`);

  for (let i = 0; i < toDownload.length; i++) {
    const url = toDownload[i];
    if (dryRun) {
      log(`  [dry] would upload: ${url}`);
      mediaCache.set(url, { id: -1 });
      continue;
    }
    try {
      let buffer;
      const localPath = urlToLocalPath(url);
      if (localPath && fs.existsSync(localPath)) {
        buffer = fs.readFileSync(localPath);
        log(`  Using local: ${path.relative(cfg.uploadsPath, localPath)}`);
      } else {
        buffer = await downloadFile(url, cfg.wpAuth, cfg.wpUrl + '/');
      }
      const filename = path.basename(new URL(url).pathname) || 'image.jpg';
      const file = await uploadToStrapi(strapiCfg, buffer, filename);
      const id = file?.id ?? file?.documentId;
      mediaCache.set(url, { id, url: file?.url });
      log(`  Uploaded ${i + 1}/${toDownload.length}: ${filename}`);
    } catch (err) {
      const status = err.response?.status;
      const body = err.response?.data;
      const extra = body && (typeof body === 'object' ? JSON.stringify(body).slice(0, 150) : String(body).slice(0, 150));
      log(`  Failed ${url}:`, status ? `HTTP ${status}` : err.message, extra || '');
    }
    await sleep(DELAY_MS);
  }

  return mediaCache;
}

function urlReplacer(oldUrl) {
  const entry = mediaCache.get(oldUrl);
  if (entry?.url) return entry.url.startsWith('http') ? entry.url : `${cfg.strapiUrl}${entry.url}`;
  return oldUrl;
}

async function mapWpItemToStrapi(wpItem, strapiType, strapiCfg) {
  const slug = wpItem.slug || wpItem.id?.toString() || wpItem.title?.rendered?.replace(/\s+/g, '-').toLowerCase() || 'untitled';
  const title = wpItem.title?.rendered ? stripHtml(wpItem.title.rendered) : wpItem.title || 'Untitled';

  if (strapiType === 'article') {
    const content = wpItem.content?.rendered || '';
    const blocks = htmlToSimpleBlocks(content, urlReplacer);

    let authorId = null;
    if (wpItem._embedded?.['wp:author']?.[0]?.name) {
      authorId = await ensureAuthor(strapiCfg, wpItem._embedded['wp:author'][0].name, authorCache);
    }

    let categoryId = null;
    if (wpItem._embedded?.['wp:term']?.[0]?.[0]?.name) {
      categoryId = await ensureCategory(strapiCfg, wpItem._embedded['wp:term'][0][0].name, categoryCache);
    }

    let featuredImageId = null;
    if (wpItem.featured_media && wpItem._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
      const url = wpItem._embedded['wp:featuredmedia'][0].source_url;
      const entry = mediaCache.get(url);
      featuredImageId = entry?.id ?? null;
    } else if (wpItem.featured_media) {
      const idRes = await resolveMediaIds(cfg.wpUrl, [wpItem.featured_media], cfg.wpAuth);
      const url = idRes.get(wpItem.featured_media);
      if (url) featuredImageId = mediaCache.get(url)?.id ?? null;
    }

    return {
      title,
      slug,
      content: blocks,
      author: authorId,
      category: categoryId,
      featuredImage: featuredImageId,
    };
  }

  if (strapiType === 'job') {
    const content = wpItem.content?.rendered || wpItem.description?.rendered || '';
    const blocks = htmlToSimpleBlocks(content, urlReplacer);
    const acf = wpItem.acf || {};
    // ACF: location, salary_per_year, type (Full Time / Part Time)
    const location = acf.location || wpItem.meta?.location || wpItem.location || null;
    const salaryPerYear = acf.salary_per_year || wpItem.meta?.salary || null;
    const type = acf.type || null; // "Full Time" | "Part Time" – maps to Strapi job.type
    const employmentType = mapAcfTypeToEmploymentType(acf.type) || mapEmploymentType(wpItem);
    return {
      title,
      slug,
      description: blocks,
      location,
      employmentType,
      salaryPerYear,
      type: type || undefined,
    };
  }

  if (strapiType === 'asset') {
    const desc = wpItem.content?.rendered ? stripHtml(wpItem.content.rendered) : wpItem.excerpt?.rendered ? stripHtml(wpItem.excerpt.rendered) : null;
    let fileId = null;
    if (wpItem.featured_media && wpItem._embedded?.['wp:featuredmedia']?.[0]?.source_url) {
      const url = wpItem._embedded['wp:featuredmedia'][0].source_url;
      fileId = mediaCache.get(url)?.id ?? null;
    }
    if (!fileId && wpItem._links?.['wp:attachment']?.[0]?.href) {
      const wpHeaders = cfg.wpAuth
        ? { Authorization: `Basic ${Buffer.from(cfg.wpAuth).toString('base64')}` }
        : {};
      const attRes = await axios.get(wpItem._links['wp:attachment'][0].href, { headers: wpHeaders, timeout: 10000 });
      const att = Array.isArray(attRes.data) ? attRes.data[0] : attRes.data;
      if (att?.source_url) {
        const idRes = await resolveMediaIds(cfg.wpUrl, [att.id], cfg.wpAuth);
        const u = idRes.get(att.id) || att.source_url;
        fileId = mediaCache.get(u)?.id ?? null;
      }
    }
    return { title, slug, description: desc, file: fileId };
  }

  return { title, slug };
}

/** ACF Vacancies "Type" (Full Time / Part Time) → Strapi type + employmentType */
function mapAcfTypeToEmploymentType(acfType) {
  if (!acfType) return null;
  const t = String(acfType).toLowerCase();
  if (t === 'full time') return 'Full-time';
  if (t === 'part time') return 'Part-time';
  return null;
}

function mapEmploymentType(wpItem) {
  const t = (wpItem.meta?.employment_type || wpItem.acf?.employment_type || wpItem.type || '').toLowerCase();
  const map = { 'full-time': 'Full-time', 'part-time': 'Part-time', contract: 'Contract', temporary: 'Temporary', internship: 'Internship' };
  return map[t] || null;
}

function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, ' ')
    .trim();
}

async function run() {
  if (!cfg.wpUrl) {
    log('Set WORDPRESS_URL in .env');
    process.exit(1);
  }
  if (!cfg.apiToken && !(cfg.email && cfg.password)) {
    log('Set STRAPI_API_TOKEN or STRAPI_EMAIL + STRAPI_PASSWORD in .env');
    process.exit(1);
  }

  const strapiCfg = {
    baseUrl: cfg.strapiUrl,
    apiToken: cfg.apiToken,
    email: cfg.email,
    password: cfg.password,
  };

  log('WordPress:', cfg.wpUrl);
  log('Strapi:', cfg.strapiUrl);
  log('Dry run:', dryRun);

  const allItems = [];

  for (const wpType of WP_CONTENT_TYPES) {
    const mapping = wpToStrapiMapping[wpType];
    if (!mapping) continue;

    const endpoint = mapping.wpRestEndpoint || wpType;
    try {
      log(`Fetching WP ${wpType} (${endpoint})...`);
      const items = await fetchAllWpItems(cfg.wpUrl, endpoint, cfg.wpAuth, DELAY_MS);
      log(`  Found ${items.length} items`);
      allItems.push(...items.map((i) => ({ ...i, _wpType: wpType, _mapping: mapping })));
    } catch (err) {
      if (err.response?.status === 404) {
        log(`  Skipping ${wpType} (endpoint not found)`);
      } else {
        log(`  Error:`, err.message);
      }
    }
    await sleep(DELAY_MS);
  }

  if (allItems.length === 0) {
    log('No content to migrate. Check WP_CONTENT_TYPES and your WordPress REST API.');
    process.exit(0);
  }

  log(`\nMigrating media (${allItems.length} items)...`);
  await migrateMedia(allItems, strapiCfg);

  log('\nCreating Strapi entries...');
  let created = 0;
  let failed = 0;

  for (let i = 0; i < allItems.length; i++) {
    const wpItem = allItems[i];
    const { strapiType, strapiCollection } = wpItem._mapping;

    try {
      const data = await mapWpItemToStrapi(wpItem, strapiType, strapiCfg);

      if (strapiType === 'asset' && !data.file && data.file !== 0) {
        log(`  Skip asset "${data.title}" - no file attached`);
        failed++;
        continue;
      }

      if (dryRun) {
        log(`  [dry] would create ${strapiCollection}: ${data.title}`);
        created++;
        continue;
      }

      await createOrUpdateStrapiEntry(strapiCfg, strapiCollection, data);
      created++;
      log(`  Upserted ${created}/${allItems.length}: ${data.title}`);
    } catch (err) {
      failed++;
      log(`  Failed "${wpItem.title?.rendered || wpItem.title}":`, err.response?.data?.error?.message || err.message);
    }
    await sleep(DELAY_MS);
  }

  log(`\nDone. Created: ${created}, Failed: ${failed}`);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
