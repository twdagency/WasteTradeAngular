# WordPress → Strapi Migration

Migrates content from WordPress to your Strapi CMS. **Only imports media that is actually used** (featured images + images embedded in content), not the entire media library.

## Prerequisites

- Node.js 18+
- Strapi running (`npm run develop` in strapi-blog)
- WordPress site with REST API enabled
- Your custom post types must have `show_in_rest: true`

## Setup

1. **Copy environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Edit `.env`:**
   - `WORDPRESS_URL` – Your WordPress site URL (existing site: `https://www.wastetrade.com`)
   - `STRAPI_URL` – Strapi URL (default `http://localhost:1337`)
   - `STRAPI_API_TOKEN` – Create in Strapi Admin → Settings → API Tokens (Full access)
   - Or use `STRAPI_EMAIL` + `STRAPI_PASSWORD` for admin login

3. **Install dependencies:**
   ```bash
   npm install
   ```

## Config

Edit `config.js` if needed: **wpToStrapiMapping** is set for WasteTrade (`post` → Article, `wt_vacancies` → Job, `resources` → Asset). Materials landing pages are not included; run that migration separately.

## Run

```bash
# Dry run (no writes)
npm run migrate:dry-run

# Full migration
npm run migrate
```

## What gets migrated

| WordPress | Strapi | Notes |
|-----------|--------|-------|
| post | Article | News: title, slug, content, featured image, author, category |
| wt_vacancies | Job | title, slug, description, location, salary_per_year, type (ACF) |
| resources | Asset | title, slug, description, file (from featured/attachment) |

Materials landing pages are not migrated by this script; do that separately.

## Media

- **Featured images** – Migrated for articles, jobs, materials
- **Images in content** – Extracted from HTML, downloaded, uploaded to Strapi, URLs replaced
- **Asset files** – For resources, the attachment/featured media is used as the file

Unused media in the WordPress library is **not** imported.

## ACF (Vacancies)

Vacancies use ACF fields: **location**, **salary_per_year**, **type** (Full Time / Part Time). The migration reads these from `wpItem.acf`. To expose ACF in the WordPress REST API, either enable **Show in REST API** for the Vacancies field group in ACF, or use a plugin/code that adds `acf` to the REST response for `wt_vacancies`.

## Troubleshooting

- **Posts work, vacancies/resources 404** – `wt_vacancies` and `resources` are not in the REST API yet. Add `show_in_rest => true` to their CPT registration. Check `https://yoursite.com/wp-json/wp/v2/types` to confirm which endpoints exist.
- **404 on WP endpoint** – CPT not registered with `show_in_rest`. Add to your theme/plugin.
- **Strapi 401** – Check API token has full access, or use admin email/password.
- **Blocks format errors** – Strapi 5 uses Blocks. Content is converted to simple paragraph blocks; complex layouts may need manual review.
