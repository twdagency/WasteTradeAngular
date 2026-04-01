/**
 * WordPress to Strapi migration config
 *
 * Map WordPress post types to Strapi content types.
 * wpRestEndpoint = REST API path (e.g. wp/v2/posts). WP uses "posts" not "post" for default posts.
 * CPTs must have show_in_rest=true to appear at /wp-json/wp/v2/{rest_base}.
 * Check https://yoursite.com/wp-json/wp/v2/types to see available endpoints.
 */
export const wpToStrapiMapping = {
  // WordPress posts (News) → Strapi Article (REST endpoint is "posts", not "post")
  post: {
    strapiType: 'article',
    strapiCollection: 'articles',
    wpRestEndpoint: 'posts',
  },

  // WasteTrade CPTs – must have show_in_rest=true in WP. Use slug as rest_base unless custom.
  wt_vacancies: {
    strapiType: 'job',
    strapiCollection: 'jobs',
    wpRestEndpoint: 'wt_vacancies',
  },
  resources: {
    strapiType: 'asset',
    strapiCollection: 'assets',
    wpRestEndpoint: 'resources',
  },
};

export const DELAY_MS = 200;
export const BATCH_SIZE = 5;
