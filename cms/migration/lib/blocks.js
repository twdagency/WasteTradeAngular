/**
 * Convert WordPress HTML to Strapi Blocks format
 * Strapi 5 Blocks use a structure similar to Block Note / Lexical
 * Produces simple paragraph blocks; images are replaced with Strapi URLs
 */
export function htmlToStrapiBlocks(html, urlReplacer = (url) => url) {
  if (!html || typeof html !== 'string') {
    return [{ type: 'paragraph', children: [{ type: 'text', text: '' }] }];
  }

  // Replace image URLs with Strapi URLs
  let processed = html.replace(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi, (match, src) => {
    const newUrl = urlReplacer(src);
    return `<img src="${newUrl}" alt="">`;
  });

  const blocks = [];

  // Node-safe parsing: use regex to split block-level elements
  const blockRegex = /<(p|h[1-6]|li|div)[^>]*>([\s\S]*?)<\/\1>/gi;
  let m;
  const parts = [];
  let lastIndex = 0;

  while ((m = blockRegex.exec(processed)) !== null) {
    if (m.index > lastIndex) {
      const between = processed.slice(lastIndex, m.index).trim();
      if (between) parts.push({ type: 'text', content: stripHtml(between) });
    }
    const tag = m[1].toLowerCase();
    const text = stripHtml(m[2]);
    if (tag.startsWith('h')) {
      const level = parseInt(tag[1], 10);
      parts.push({ type: 'heading', level, content: text });
    } else if (tag === 'li') {
      parts.push({ type: 'list-item', content: text });
    } else {
      parts.push({ type: 'paragraph', content: text });
    }
    lastIndex = m.index + m[0].length;
  }

  if (lastIndex < processed.length) {
    const rest = stripHtml(processed.slice(lastIndex)).trim();
    if (rest) parts.push({ type: 'paragraph', content: rest });
  }

  if (parts.length === 0) {
    const plain = stripHtml(processed).trim();
    if (plain) {
      parts.push({ type: 'paragraph', content: plain });
    }
  }

  for (const part of parts) {
    if (part.type === 'heading') {
      blocks.push({
        type: 'heading',
        level: part.level,
        children: [{ type: 'text', text: part.content }],
      });
    } else if (part.type === 'list-item') {
      blocks.push({
        type: 'list-item',
        children: [{ type: 'text', text: part.content }],
      });
    } else {
      blocks.push({
        type: 'paragraph',
        children: [{ type: 'text', text: part.content }],
      });
    }
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
  let text = html.replace(/<img[^>]+src=["']([^"']+)["'][^>]*>/gi, (match, src) => {
    return ` [Image: ${urlReplacer(src)}] `;
  });
  text = stripHtml(text).trim() || '';
  return [{ type: 'paragraph', children: [{ type: 'text', text }] }];
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
    .replace(/\s+/g, ' ')
    .trim();
}
