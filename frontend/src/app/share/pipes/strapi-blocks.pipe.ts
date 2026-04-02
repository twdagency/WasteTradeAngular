import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { environment } from '@app/environments';
import { StrapiBlockNode, StrapiInlineNode } from 'app/types/cms.types';

@Pipe({
  name: 'strapiBlocks',
  standalone: true,
})
export class StrapiBlocksPipe implements PipeTransform {
  constructor(private sanitizer: DomSanitizer) {}

  transform(blocks: StrapiBlockNode[] | null | undefined): SafeHtml {
    if (!blocks?.length) return '';
    const html = blocks.map((block) => this.renderBlock(block)).join('');
    return this.sanitizer.bypassSecurityTrustHtml(html);
  }

  private renderBlock(block: StrapiBlockNode): string {
    switch (block.type) {
      case 'paragraph':
        return `<p>${this.renderInlineNodes(block.children)}</p>`;
      case 'heading':
        return `<h${block.level}>${this.renderInlineNodes(block.children)}</h${block.level}>`;
      case 'list':
        const tag = block.format === 'ordered' ? 'ol' : 'ul';
        const items = block.children
          .map((item) => `<li>${this.renderInlineNodes(item.children)}</li>`)
          .join('');
        return `<${tag}>${items}</${tag}>`;
      case 'image': {
        const url = block.image?.url?.startsWith('http')
          ? block.image.url
          : `${environment.cmsUrl}${block.image?.url}`;
        const alt = block.image?.alternativeText || '';
        return `<figure><img src="${url}" alt="${alt}" loading="lazy" /></figure>`;
      }
      case 'quote':
        return `<blockquote>${this.renderInlineNodes(block.children)}</blockquote>`;
      case 'code':
        return `<pre><code>${this.renderInlineNodes(block.children)}</code></pre>`;
      default:
        return '';
    }
  }

  private renderInlineNodes(nodes: StrapiInlineNode[]): string {
    if (!nodes?.length) return '';
    return nodes.map((node) => this.renderInlineNode(node)).join('');
  }

  private renderInlineNode(node: StrapiInlineNode): string {
    if (node.type === 'link') {
      const children = node.children ? this.renderInlineNodes(node.children) : node.text || '';
      return `<a href="${node.url}" target="_blank" rel="noopener noreferrer">${children}</a>`;
    }

    let text = this.escapeHtml(node.text || '');
    if (node.bold) text = `<strong>${text}</strong>`;
    if (node.italic) text = `<em>${text}</em>`;
    if (node.underline) text = `<u>${text}</u>`;
    if (node.strikethrough) text = `<s>${text}</s>`;
    if (node.code) text = `<code>${text}</code>`;
    return text;
  }

  private escapeHtml(text: string): string {
    const div = typeof document !== 'undefined' ? document.createElement('div') : null;
    if (div) {
      div.textContent = text;
      return div.innerHTML;
    }
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
}
