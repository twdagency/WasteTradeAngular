/**
 * Convert WordPress HTML to Strapi 5 Blocks format.
 *
 * Strapi 5 Blocks schema (top-level types):
 *   paragraph  { type, children: [text|link|...] }
 *   heading    { type, level, children: [...] }
 *   list       { type, format: "ordered"|"unordered", children: [list-item] }
 *   image      { type, image: { url, alternativeText?, width?, height? } }
 *   quote      { type, children: [...] }
 *   code       { type, children: [...] }
 *
 * list-item is only valid inside a list block:
 *   list-item  { type, children: [text|link|...] }
 */

/**
 * @param {string} html
 * @param {(url: string) => string} urlReplacer
 * @param {Map<string, object>|null} mediaMap  URL → full Strapi media object
 *        (with name, url, width, height, hash, ext, mime, size, formats, provider)
 */
export function htmlToStrapiBlocks(html, urlReplacer = (url) => url, mediaMap = null) {
  if (!html || typeof html !== 'string') {
    return [{ type: 'paragraph', children: [{ type: 'text', text: '' }] }];
  }

  let processed = html.replace(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi, (_, src) => {
    const newUrl = urlReplacer(src);
    return `<img src="${newUrl}" alt="">`;
  });

  const parts = [];
  const blockRegex = /<(p|h[1-6]|li|ul|ol|blockquote|pre|div|figure|img)[^>]*>([\s\S]*?)<\/\1>|<img[^>]+\/?>/gi;
  let m;
  let lastIndex = 0;

  while ((m = blockRegex.exec(processed)) !== null) {
    if (m.index > lastIndex) {
      const between = processed.slice(lastIndex, m.index).trim();
      if (between) {
        const text = stripHtml(between);
        if (text) parts.push({ type: 'paragraph', content: text });
      }
    }

    if (m[0].startsWith('<img')) {
      const srcMatch = m[0].match(/src=["']([^"']+)["']/i);
      const altMatch = m[0].match(/alt=["']([^"']*)["']/i);
      if (srcMatch) {
        parts.push({ type: 'image', url: srcMatch[1], alt: altMatch?.[1] || '' });
      }
    } else {
      const tag = m[1].toLowerCase();
      const inner = m[2];

      if (tag.startsWith('h')) {
        const level = parseInt(tag[1], 10);
        parts.push({ type: 'heading', level, content: stripHtml(inner) });
      } else if (tag === 'ul' || tag === 'ol') {
        const format = tag === 'ol' ? 'ordered' : 'unordered';
        const items = [];
        const liRegex = /<li[^>]*>([\s\S]*?)<\/li>/gi;
        let li;
        while ((li = liRegex.exec(inner)) !== null) {
          const text = stripHtml(li[1]);
          if (text) items.push(text);
        }
        if (items.length > 0) {
          parts.push({ type: 'list', format, items });
        }
      } else if (tag === 'li') {
        parts.push({ type: 'list-item-bare', content: stripHtml(inner) });
      } else if (tag === 'blockquote') {
        parts.push({ type: 'quote', content: stripHtml(inner) });
      } else if (tag === 'pre') {
        parts.push({ type: 'code', content: stripHtml(inner) });
      } else if (tag === 'figure') {
        const imgMatch = inner.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i);
        const altMatch = inner.match(/alt=["']([^"']*)["']/i);
        if (imgMatch) {
          parts.push({ type: 'image', url: imgMatch[1], alt: altMatch?.[1] || '' });
        } else {
          const text = stripHtml(inner);
          if (text) parts.push({ type: 'paragraph', content: text });
        }
      } else {
        const text = stripHtml(inner);
        if (text) parts.push({ type: 'paragraph', content: text });
      }
    }
    lastIndex = m.index + m[0].length;
  }

  if (lastIndex < processed.length) {
    const rest = stripHtml(processed.slice(lastIndex)).trim();
    if (rest) parts.push({ type: 'paragraph', content: rest });
  }

  if (parts.length === 0) {
    const plain = stripHtml(processed).trim();
    if (plain) parts.push({ type: 'paragraph', content: plain });
  }

  // Convert parsed parts to Strapi blocks, grouping consecutive bare list-items
  const blocks = [];
  let i = 0;
  while (i < parts.length) {
    const part = parts[i];

    if (part.type === 'heading') {
      const lvl = Math.min(Math.max(part.level, 1), 6);
      blocks.push({
        type: 'heading',
        level: lvl,
        children: [{ type: 'text', text: part.content || '' }],
      });
    } else if (part.type === 'list') {
      blocks.push({
        type: 'list',
        format: part.format,
        children: part.items.map(text => ({
          type: 'list-item',
          children: [{ type: 'text', text }],
        })),
      });
    } else if (part.type === 'list-item-bare') {
      // Group consecutive bare list-items into an unordered list
      const items = [];
      while (i < parts.length && parts[i].type === 'list-item-bare') {
        items.push(parts[i].content);
        i++;
      }
      blocks.push({
        type: 'list',
        format: 'unordered',
        children: items.map(text => ({
          type: 'list-item',
          children: [{ type: 'text', text }],
        })),
      });
      continue; // i already advanced
    } else if (part.type === 'image') {
      const mediaObj = mediaMap ? findMediaByUrl(mediaMap, part.url) : null;
      if (mediaObj) {
        blocks.push({
          type: 'image',
          image: {
            name: mediaObj.name || '',
            alternativeText: part.alt || mediaObj.alternativeText || '',
            url: mediaObj.url || '',
            width: mediaObj.width || 0,
            height: mediaObj.height || 0,
            formats: mediaObj.formats || {},
            hash: mediaObj.hash || '',
            ext: mediaObj.ext || '',
            mime: mediaObj.mime || 'image/jpeg',
            size: mediaObj.size || 0,
            provider: mediaObj.provider || 'local',
            createdAt: mediaObj.createdAt || new Date().toISOString(),
            updatedAt: mediaObj.updatedAt || new Date().toISOString(),
          },
          children: [{ type: 'text', text: '' }],
        });
      }
      // If no uploaded media metadata, skip the image block entirely
    } else if (part.type === 'quote') {
      blocks.push({
        type: 'quote',
        children: [{ type: 'text', text: part.content || '' }],
      });
    } else if (part.type === 'code') {
      blocks.push({
        type: 'code',
        children: [{ type: 'text', text: part.content || '' }],
      });
    } else {
      if (part.content) {
        blocks.push({
          type: 'paragraph',
          children: [{ type: 'text', text: part.content }],
        });
      }
    }
    i++;
  }

  if (blocks.length === 0) {
    blocks.push({ type: 'paragraph', children: [{ type: 'text', text: '' }] });
  }

  return blocks;
}

/**
 * Simpler fallback: single paragraph with stripped HTML
 */
export function htmlToSimpleBlocks(html, urlReplacer = (url) => url) {
  if (!html || typeof html !== 'string') {
    return [{ type: 'paragraph', children: [{ type: 'text', text: '' }] }];
  }
  let text = html.replace(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi, (_, src) => {
    return ` [Image: ${urlReplacer(src)}] `;
  });
  text = stripHtml(text).trim() || '';
  return [{ type: 'paragraph', children: [{ type: 'text', text }] }];
}

function findMediaByUrl(mediaMap, url) {
  if (!mediaMap || !url) return null;
  // Try exact match first
  if (mediaMap.has(url)) return mediaMap.get(url);
  // Try matching by filename (image URLs may differ in domain/path)
  const filename = url.split('/').pop()?.split('?')[0];
  if (!filename) return null;
  for (const [key, val] of mediaMap) {
    if (key.endsWith(filename) || key.includes(filename)) return val;
  }
  return null;
}

function stripHtml(html) {
  if (!html) return '';
  return html
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}
