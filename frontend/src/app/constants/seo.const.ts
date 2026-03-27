/**
 * SEO Constants for WasteTrade
 * Default meta tag values used across the application
 */

export const SEO_CONFIG = {
  siteName: 'WasteTrade',
  siteUrl: 'https://www.wastetrade.com',
  defaultTitle: 'WasteTrade',
  defaultDescription:
    'Get the best wastage products at the waste trade. Here you can get the best products like LDPE Film, HDPE Bottles, PET Shredded, HDPE Drums, and many more. Shop now!',
  defaultImage:
    'https://www.wastetrade.com/wp-content/uploads/2024/10/Waste-Trade-YouTube-cover-image-01.jpg',
  imageWidth: '10668',
  imageHeight: '6001',
  imageType: 'image/jpeg',
  locale: 'en_GB',
  type: 'article',
  robots: 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1',
  facebookPublisher: 'https://www.facebook.com/p/WasteTrade-100067425009620/',
  twitter: {
    card: 'summary_large_image',
    site: '@wastetrade',
  },
};

/**
 * Hreflang configuration mapping language codes to their hreflang values
 */
export const HREFLANG_CONFIG: Record<string, string> = {
  en: 'en-GB',
  es: 'es-ES',
};
