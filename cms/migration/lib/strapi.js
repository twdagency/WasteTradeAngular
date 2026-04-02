import axios from 'axios';
import FormData from 'form-data';
import path from 'path';

let _authHeaders = null;

/**
 * Get Strapi auth header (API token or admin JWT) - cached
 */
export async function getAuthHeaders(cfg) {
  if (_authHeaders) return _authHeaders;
  if (cfg.apiToken) {
    _authHeaders = { Authorization: `Bearer ${cfg.apiToken}` };
    return _authHeaders;
  }
  if (cfg.email && cfg.password) {
    const res = await axios.post(`${cfg.baseUrl}/admin/login`, {
      email: cfg.email,
      password: cfg.password,
    });
    const jwt = res.data?.data?.token;
    if (!jwt) throw new Error('Admin login failed');
    _authHeaders = { Authorization: `Bearer ${jwt}` };
    return _authHeaders;
  }
  throw new Error('Provide STRAPI_API_TOKEN or STRAPI_EMAIL + STRAPI_PASSWORD');
}

/**
 * Upload a file to Strapi from URL or buffer
 */
export async function uploadToStrapi(cfg, fileUrlOrBuffer, filename) {
  const headers = await getAuthHeaders(cfg);
  const form = new FormData();

  if (Buffer.isBuffer(fileUrlOrBuffer)) {
    form.append('files', fileUrlOrBuffer, { filename: filename || 'file' });
  } else {
    const res = await axios.get(fileUrlOrBuffer, { responseType: 'arraybuffer' });
    const ext = path.extname(new URL(fileUrlOrBuffer).pathname) || '.jpg';
    form.append('files', Buffer.from(res.data), { filename: filename || `file${ext}` });
  }

  const response = await axios.post(`${cfg.baseUrl}/api/upload`, form, {
    headers: { ...headers, ...form.getHeaders() },
    maxBodyLength: Infinity,
    maxContentLength: Infinity,
  });

  const files = response.data;
  return Array.isArray(files) ? files[0] : files;
}

/**
 * Create a Strapi entry
 */
export async function createStrapiEntry(cfg, collection, data) {
  const headers = await getAuthHeaders(cfg);
  // Strapi v5 expects documentId; v4 uses id - API accepts both
  const res = await axios.post(`${cfg.baseUrl}/api/${collection}`, { data }, { headers });
  return res.data?.data ?? res.data;
}

/**
 * Create or update a Strapi entry by slug (upsert)
 */
export async function createOrUpdateStrapiEntry(cfg, collection, data) {
  const slug = data.slug;
  if (!slug) return createStrapiEntry(cfg, collection, data);

  const headers = await getAuthHeaders(cfg);
  const list = await axios.get(
    `${cfg.baseUrl}/api/${collection}?filters[slug][$eq]=${encodeURIComponent(slug)}`,
    { headers }
  );
  const existing = list.data?.data?.[0];

  if (existing) {
    const id = existing.documentId ?? existing.id;
    const res = await axios.put(`${cfg.baseUrl}/api/${collection}/${id}`, { data }, { headers });
    return res.data?.data ?? res.data;
  }
  return createStrapiEntry(cfg, collection, data);
}

/**
 * Find or create author by name
 */
export async function ensureAuthor(cfg, name, cache) {
  if (cache.has(name)) return cache.get(name);
  const headers = await getAuthHeaders(cfg);
  const list = await axios.get(`${cfg.baseUrl}/api/authors?filters[name][$eq]=${encodeURIComponent(name)}`, { headers });
  const existing = list.data?.data?.[0];
  if (existing) {
    const id = existing.documentId ?? existing.id;
    cache.set(name, id);
    return id;
  }
  const created = await createStrapiEntry(cfg, 'authors', { name });
  const id = created?.documentId ?? created?.id;
  cache.set(name, id);
  return id;
}

/**
 * Find or create category by name
 */
export async function ensureCategory(cfg, name, cache) {
  if (cache.has(name)) return cache.get(name);
  const headers = await getAuthHeaders(cfg);
  const list = await axios.get(`${cfg.baseUrl}/api/categories?filters[name][$eq]=${encodeURIComponent(name)}`, { headers });
  const existing = list.data?.data?.[0];
  if (existing) {
    const id = existing.documentId ?? existing.id;
    cache.set(name, id);
    return id;
  }
  const created = await createStrapiEntry(cfg, 'categories', { name });
  const id = created?.documentId ?? created?.id;
  cache.set(name, id);
  return id;
}
