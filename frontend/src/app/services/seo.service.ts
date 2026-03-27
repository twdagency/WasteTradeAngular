import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { inject, Injectable, PLATFORM_ID } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { Router } from '@angular/router';
import { SUPPORTED_LANGUAGES } from 'app/constants/common';
import { HREFLANG_CONFIG, SEO_CONFIG } from 'app/constants/seo.const';
import { from, Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

export interface ImageDimensions {
  width: number;
  height: number;
}

export interface SeoMetaData {
  title?: string;
  description?: string;
  image?: string;
  imageWidth?: string;
  imageHeight?: string;
  imageType?: string;
  type?: string;
  robots?: string;
  locale?: string;
}

@Injectable({
  providedIn: 'root',
})
export class SeoService {
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  private readonly router = inject(Router);
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);

  /**
   * Updates all meta tags with provided data or defaults
   * @param data - Optional SEO meta data to override defaults
   */
  updateMetaTags(data: SeoMetaData = {}): void {
    const currentUrl = this.getCurrentUrl();
    const pageTitle = data.title ? `${data.title} | ${SEO_CONFIG.siteName}` : SEO_CONFIG.defaultTitle;
    const description = data.description ?? SEO_CONFIG.defaultDescription;
    const image = data.image || SEO_CONFIG.defaultImage;

    // Set page title
    this.title.setTitle(pageTitle);

    // Basic SEO meta tags
    this.updateMetaTag('description', description);
    this.updateMetaTag('robots', data.robots || SEO_CONFIG.robots);

    // Open Graph meta tags
    this.updateMetaTag('og:locale', data.locale || SEO_CONFIG.locale, 'property');
    this.updateMetaTag('og:type', data.type || SEO_CONFIG.type, 'property');
    this.updateMetaTag('og:title', pageTitle, 'property');
    this.updateMetaTag('og:description', description, 'property');
    this.updateMetaTag('og:url', currentUrl, 'property');
    this.updateMetaTag('og:site_name', SEO_CONFIG.siteName, 'property');
    this.updateMetaTag('og:image', image, 'property');
    this.updateMetaTag('og:image:width', data.imageWidth || SEO_CONFIG.imageWidth, 'property');
    this.updateMetaTag('og:image:height', data.imageHeight || SEO_CONFIG.imageHeight, 'property');
    this.updateMetaTag('og:image:type', data.imageType || SEO_CONFIG.imageType, 'property');
    this.updateMetaTag('article:publisher', SEO_CONFIG.facebookPublisher, 'property');
    this.updateMetaTag('article:modified_time', new Date().toISOString(), 'property');

    // Twitter Card meta tags
    this.updateMetaTag('twitter:card', SEO_CONFIG.twitter.card);
    this.updateMetaTag('twitter:site', SEO_CONFIG.twitter.site);
    this.updateMetaTag('twitter:title', pageTitle);
    this.updateMetaTag('twitter:description', description);
    this.updateMetaTag('twitter:image', image);

    // Update canonical link
    this.updateCanonicalLink(currentUrl);

    // Update hreflang links
    this.updateHreflangLinks();
  }

  /**
   * Updates a single meta tag
   * @param name - Meta tag name or property
   * @param content - Meta tag content value
   * @param attribute - 'name' or 'property' attribute type
   */
  private updateMetaTag(name: string, content: string, attribute: 'name' | 'property' = 'name'): void {
    const selector = attribute === 'property' ? `property='${name}'` : `name='${name}'`;

    if (this.meta.getTag(selector)) {
      this.meta.updateTag({ [attribute]: name, content });
    } else {
      this.meta.addTag({ [attribute]: name, content });
    }
  }

  /**
   * Updates the canonical link element
   * @param url - The canonical URL
   */
  private updateCanonicalLink(url: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.updateLinkElement('canonical', url);
      return;
    }

    let canonicalLink = this.document.querySelector('link[rel="canonical"]') as HTMLLinkElement;

    if (canonicalLink) {
      canonicalLink.href = url;
    } else {
      canonicalLink = this.document.createElement('link');
      canonicalLink.rel = 'canonical';
      canonicalLink.href = url;
      this.document.head.appendChild(canonicalLink);
    }
  }

  /**
   * Updates hreflang link elements for all supported languages
   */
  private updateHreflangLinks(): void {
    const baseUrl = this.getBaseUrl();
    const currentPath = this.getCurrentPathWithoutLang();

    // Remove existing hreflang links
    this.removeExistingHreflangLinks();

    // Add hreflang links for each supported language
    SUPPORTED_LANGUAGES.forEach((lang) => {
      const hreflang = HREFLANG_CONFIG[lang] || lang;
      const langPath = lang === 'en' ? currentPath : `/${lang}${currentPath}`;
      const href = `${baseUrl}${langPath}`;

      this.addHreflangLink(hreflang, href);
    });

    // Add x-default hreflang (points to default language version)
    const defaultHref = `${baseUrl}${currentPath}`;
    this.addHreflangLink('x-default', defaultHref);
  }

  /**
   * Removes existing hreflang link elements
   */
  private removeExistingHreflangLinks(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    const existingLinks = this.document.querySelectorAll('link[hreflang]');
    existingLinks.forEach((link) => link.remove());
  }

  /**
   * Adds a hreflang link element
   * @param hreflang - The hreflang value
   * @param href - The URL for this language version
   */
  private addHreflangLink(hreflang: string, href: string): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.updateLinkElement(`alternate-${hreflang}`, href, hreflang);
      return;
    }

    const link = this.document.createElement('link');
    link.rel = 'alternate';
    link.hreflang = hreflang;
    link.href = href;
    this.document.head.appendChild(link);
  }

  /**
   * Updates or creates a link element (for SSR)
   * @param rel - The rel attribute value
   * @param href - The href value
   * @param hreflang - Optional hreflang value
   */
  private updateLinkElement(rel: string, href: string, hreflang?: string): void {
    // For SSR, we need to handle link elements differently
    // This is handled by the browser DOM manipulation in browser context
  }

  /**
   * Gets the current full URL
   */
  private getCurrentUrl(): string {
    const baseUrl = this.getBaseUrl();
    const path = this.router.url.split('?')[0]; // Remove query params
    return `${baseUrl}${path}`;
  }

  /**
   * Gets the base URL from configuration
   */
  private getBaseUrl(): string {
    return SEO_CONFIG.siteUrl;
  }

  /**
   * Gets the current path without language prefix
   */
  private getCurrentPathWithoutLang(): string {
    const path = this.router.url.split('?')[0]; // Remove query params
    const segments = path.split('/').filter((segment) => segment);

    // Check if first segment is a language code
    if (segments.length > 0 && SUPPORTED_LANGUAGES.includes(segments[0])) {
      segments.shift(); // Remove language prefix
    }

    return '/' + segments.join('/');
  }

  /**
   * Sets the page title only
   * @param title - The page title (without site name suffix)
   */
  setTitle(title: string): void {
    const fullTitle = title ? `${title} | ${SEO_CONFIG.siteName}` : SEO_CONFIG.defaultTitle;
    this.title.setTitle(fullTitle);
    this.updateMetaTag('og:title', fullTitle, 'property');
    this.updateMetaTag('twitter:title', fullTitle);
  }

  /**
   * Sets the page description only
   * @param description - The page description
   */
  setDescription(description: string): void {
    this.updateMetaTag('description', description);
    this.updateMetaTag('og:description', description, 'property');
    this.updateMetaTag('twitter:description', description);
  }

  /**
   * Sets the page image only
   * @param imageUrl - The image URL
   * @param width - Optional image width
   * @param height - Optional image height
   * @param type - Optional image MIME type
   */
  setImage(imageUrl: string, width?: string, height?: string, type?: string): void {
    this.updateMetaTag('og:image', imageUrl, 'property');
    this.updateMetaTag('twitter:image', imageUrl);

    if (width) {
      this.updateMetaTag('og:image:width', width, 'property');
    }
    if (height) {
      this.updateMetaTag('og:image:height', height, 'property');
    }
    if (type) {
      this.updateMetaTag('og:image:type', type, 'property');
    }
  }

  /**
   * Sets robots meta tag
   * @param robots - The robots directive string
   */
  setRobots(robots: string): void {
    this.updateMetaTag('robots', robots);
  }

  /**
   * Disables indexing for the current page
   */
  setNoIndex(): void {
    this.updateMetaTag('robots', 'noindex, nofollow');
  }

  /**
   * Fetches the dimensions of an image from its URL
   * @param imageUrl - The URL of the image to measure
   * @returns Observable with image dimensions, or null if fetching fails
   */
  getImageDimensions(imageUrl: string): Observable<ImageDimensions | null> {
    if (!imageUrl) {
      return of(null);
    }

    // Browser-side: use Image object for better performance
    if (isPlatformBrowser(this.platformId)) {
      // return this.getImageDimensionsBrowser(imageUrl);
      return of(null);
    }

    // Server-side: fetch image and parse dimensions from binary data
    return this.getImageDimensionsFromFetch(imageUrl);
  }

  /**
   * Fetches image dimensions by downloading and parsing the image binary data
   * Works in both browser and server environments using fetch API
   */
  private getImageDimensionsFromFetch(imageUrl: string): Observable<ImageDimensions | null> {
    return from(
      fetch(imageUrl)
        .then((response) => {
          if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.status}`);
          }
          return response.arrayBuffer();
        })
        .then((buffer) => {
          const dimensions = this.parseImageDimensions(new Uint8Array(buffer));
          return dimensions;
        }),
    ).pipe(
      catchError((error) => {
        console.error('Failed to fetch image dimensions:', error);
        return of(null);
      }),
    );
  }

  /**
   * Parses image dimensions from binary data
   * Supports JPEG, PNG, GIF, WebP formats
   */
  private parseImageDimensions(data: Uint8Array): ImageDimensions | null {
    if (data.length < 24) {
      return null;
    }

    // PNG: 89 50 4E 47 0D 0A 1A 0A
    if (data[0] === 0x89 && data[1] === 0x50 && data[2] === 0x4e && data[3] === 0x47) {
      const width = (data[16] << 24) | (data[17] << 16) | (data[18] << 8) | data[19];
      const height = (data[20] << 24) | (data[21] << 16) | (data[22] << 8) | data[23];
      return { width, height };
    }

    // GIF: 47 49 46 38
    if (data[0] === 0x47 && data[1] === 0x49 && data[2] === 0x46 && data[3] === 0x38) {
      const width = data[6] | (data[7] << 8);
      const height = data[8] | (data[9] << 8);
      return { width, height };
    }

    // JPEG: FF D8 FF
    if (data[0] === 0xff && data[1] === 0xd8 && data[2] === 0xff) {
      return this.parseJpegDimensions(data);
    }

    // WebP: 52 49 46 46 ... 57 45 42 50
    if (
      data[0] === 0x52 &&
      data[1] === 0x49 &&
      data[2] === 0x46 &&
      data[3] === 0x46 &&
      data[8] === 0x57 &&
      data[9] === 0x45 &&
      data[10] === 0x42 &&
      data[11] === 0x50
    ) {
      return this.parseWebpDimensions(data);
    }

    return null;
  }

  /**
   * Parses JPEG image dimensions
   */
  private parseJpegDimensions(data: Uint8Array): ImageDimensions | null {
    let offset = 2;

    while (offset < data.length) {
      if (data[offset] !== 0xff) {
        offset++;
        continue;
      }

      const marker = data[offset + 1];

      // SOF markers (Start of Frame) contain dimensions
      if (
        (marker >= 0xc0 && marker <= 0xc3) ||
        (marker >= 0xc5 && marker <= 0xc7) ||
        (marker >= 0xc9 && marker <= 0xcb) ||
        (marker >= 0xcd && marker <= 0xcf)
      ) {
        const height = (data[offset + 5] << 8) | data[offset + 6];
        const width = (data[offset + 7] << 8) | data[offset + 8];
        return { width, height };
      }

      // Skip to next marker
      if (marker === 0xd8 || marker === 0xd9 || (marker >= 0xd0 && marker <= 0xd7)) {
        offset += 2;
      } else {
        const length = (data[offset + 2] << 8) | data[offset + 3];
        offset += 2 + length;
      }
    }

    return null;
  }

  /**
   * Parses WebP image dimensions
   */
  private parseWebpDimensions(data: Uint8Array): ImageDimensions | null {
    // VP8 format
    if (data[12] === 0x56 && data[13] === 0x50 && data[14] === 0x38 && data[15] === 0x20) {
      const width = ((data[26] | (data[27] << 8)) & 0x3fff) + 1;
      const height = ((data[28] | (data[29] << 8)) & 0x3fff) + 1;
      return { width, height };
    }

    // VP8L format (lossless)
    if (data[12] === 0x56 && data[13] === 0x50 && data[14] === 0x38 && data[15] === 0x4c) {
      const bits = data[21] | (data[22] << 8) | (data[23] << 16) | (data[24] << 24);
      const width = (bits & 0x3fff) + 1;
      const height = ((bits >> 14) & 0x3fff) + 1;
      return { width, height };
    }

    // VP8X format (extended)
    if (data[12] === 0x56 && data[13] === 0x50 && data[14] === 0x38 && data[15] === 0x58) {
      const width = (data[24] | (data[25] << 8) | (data[26] << 16)) + 1;
      const height = (data[27] | (data[28] << 8) | (data[29] << 16)) + 1;
      return { width, height };
    }

    return null;
  }

  /**
   * Fetches image dimensions in the browser using Image object
   */
  private getImageDimensionsBrowser(imageUrl: string): Observable<ImageDimensions | null> {
    return new Observable<ImageDimensions | null>((observer) => {
      const img = new Image();

      img.onload = () => {
        observer.next({
          width: img.naturalWidth,
          height: img.naturalHeight,
        });
        observer.complete();
      };

      img.onerror = () => {
        observer.next(null);
        observer.complete();
      };

      img.src = imageUrl;
    });
  }
}
