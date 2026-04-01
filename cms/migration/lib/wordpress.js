import axios from 'axios';

/**
 * Fetch all items from a WordPress REST API endpoint with pagination
 */
export async function fetchAllWpItems(baseUrl, endpoint, auth = null, delayMs = 200) {
  const items = [];
  let page = 1;
  let hasMore = true;
  const headers = auth ? { Authorization: `Basic ${Buffer.from(auth).toString('base64')}` } : {};

  while (hasMore) {
    const url = `${baseUrl}/wp-json/wp/v2/${endpoint}?per_page=100&page=${page}&_embed`;
    const res = await axios.get(url, { headers, timeout: 30000 });
    const data = Array.isArray(res.data) ? res.data : [res.data];
    items.push(...data);

    const totalPages = parseInt(res.headers['x-wp-totalpages'] || '1', 10);
    hasMore = page < totalPages;
    page++;

    if (hasMore) await sleep(delayMs);
  }

  return items;
}

/**
 * Fetch specific WordPress pages by ID (for materials landing pages)
 */
export async function fetchWpPagesById(baseUrl, pageIds, auth = null, delayMs = 200) {
  if (!pageIds || pageIds.length === 0) return [];
  const headers = auth ? { Authorization: `Basic ${Buffer.from(auth).toString('base64')}` } : {};
  const include = pageIds.join(',');
  const url = `${baseUrl}/wp-json/wp/v2/pages?include=${include}&per_page=100&_embed`;
  const res = await axios.get(url, { headers, timeout: 30000 });
  const data = Array.isArray(res.data) ? res.data : [res.data];
  return data;
}

/**
 * Fetch a single media item from WordPress
 */
export async function fetchWpMedia(baseUrl, mediaId, auth = null) {
  const headers = auth ? { Authorization: `Basic ${Buffer.from(auth).toString('base64')}` } : {};
  const url = `${baseUrl}/wp-json/wp/v2/media/${mediaId}`;
  const res = await axios.get(url, { headers, timeout: 10000 });
  return res.data;
}

/**
 * Extract media IDs and URLs from WordPress content
 * Returns { mediaIds: Set<number>, mediaUrls: Set<string> }
 */
export function extractMediaFromContent(items, baseUrl) {
  const mediaIds = new Set();
  const mediaUrls = new Set();

  const baseEscaped = baseUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

  for (const item of items) {
    if (item.featured_media) {
      mediaIds.add(item.featured_media);
    }

    const content = item.content?.rendered || item.description?.rendered || item.excerpt?.rendered || '';
    const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
    const wpMediaRegex = new RegExp(
      `${baseEscaped}[^"']*?wp-content/uploads[^"']+`,
      'gi'
    );

    let m;
    while ((m = imgRegex.exec(content)) !== null) {
      const src = m[1];
      if (src.includes('wp-content/uploads')) {
        mediaUrls.add(src);
      }
    }

    const urls = content.match(wpMediaRegex);
    if (urls) urls.forEach((u) => mediaUrls.add(u));

    const dataIdRegex = /data-id=["'](\d+)["']/g;
    while ((m = dataIdRegex.exec(content)) !== null) {
      mediaIds.add(parseInt(m[1], 10));
    }
  }

  return { mediaIds, mediaUrls };
}

/**
 * Fallback: get image URL from attachment page when REST API returns 401
 */
async function resolveMediaViaAttachmentPage(baseUrl, mediaId, auth = null) {
  const headers = {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    Accept: 'text/html,image/*,*/*;q=0.8',
    Referer: baseUrl + '/',
    ...(auth && { Authorization: `Basic ${Buffer.from(auth).toString('base64')}` }),
  };
  const url = `${baseUrl}/?attachment_id=${mediaId}`;
  const res = await axios.get(url, { headers, timeout: 10000, maxRedirects: 5, responseType: 'arraybuffer' });
  const ct = (res.headers['content-type'] || '').toLowerCase();
  if (ct.startsWith('image/')) {
    const finalUrl = res.request?.res?.responseUrl || res.config?.url || url;
    return finalUrl;
  }
  if (ct.includes('text/html')) {
    const html = Buffer.from(res.data).toString('utf8');
    const ogMatch = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    if (ogMatch) return ogMatch[1];
    const baseEscaped = baseUrl.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const imgMatch = html.match(new RegExp(`${baseEscaped}[^"']*?wp-content/uploads[^"']+\\.(jpg|jpeg|png|gif|webp)`, 'i'));
    if (imgMatch) return imgMatch[0];
  }
  return null;
}

/**
 * Resolve media IDs to URLs via WP API (for featured_media etc)
 * Falls back to attachment page when REST API returns 401
 */
export async function resolveMediaIds(baseUrl, mediaIds, auth = null, delayMs = 100) {
  const idToUrl = new Map();
  for (const id of mediaIds) {
    if (typeof id !== 'number') continue;
    try {
      const media = await fetchWpMedia(baseUrl, id, auth);
      const url = media.source_url || media.guid?.rendered;
      if (url) idToUrl.set(id, url);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) {
        try {
          const url = await resolveMediaViaAttachmentPage(baseUrl, id, auth);
          if (url) {
            idToUrl.set(id, url);
            console.warn(`  Resolved media ${id} via attachment page fallback`);
          } else {
            console.warn(`  Could not fetch WP media ${id}:`, err.response?.status, err.response?.data?.code || '', err.response?.data?.message || err.message);
          }
        } catch (fallbackErr) {
          console.warn(`  Could not fetch WP media ${id}:`, err.response?.status, err.response?.data?.code || '', '(fallback also failed)');
        }
      } else {
        const status = err.response?.status;
        const body = err.response?.data;
        const code = typeof body === 'object' && body?.code ? body.code : '';
        const msg = typeof body === 'object' && body?.message ? body.message : (typeof body === 'string' ? body.slice(0, 100) : '');
        console.warn(`  Could not fetch WP media ${id} (${baseUrl}/wp-json/wp/v2/media/${id}):`, status || 'error', code || '', msg || err.message);
      }
    }
    await sleep(delayMs);
  }
  return idToUrl;
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}
