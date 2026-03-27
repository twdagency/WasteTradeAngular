# DeepL Translation Integration

This document describes the DeepL translation integration for the WasteTrade backend application.

## Overview

The DeepL integration provides professional-grade translation capabilities:

1. **Real-time Translation API** - Instant text translation via REST endpoints
2. **Automated i18n Translation** - Scheduled translation of JSON internationalization files from S3
3. **Manual Translation Triggers** - On-demand translation job execution

## Setup

### 1. Install Dependencies

```bash
yarn add deepl-node
```

### 2. Environment Variables

Add the following environment variables to your `.env` file:

```env
# DeepL API Configuration
DEEPL_API_KEY=your-deepl-api-key

# S3 Configuration for i18n files (optional, defaults to main S3 bucket)
DEEPL_I18N_S3_BUCKET=your-i18n-s3-bucket
DEEPL_I18N_S3_PATH=i18n
```

**Required:**
- `DEEPL_API_KEY` - Your DeepL API authentication key (get from [DeepL Pro account](https://www.deepl.com/pro-api))

**Optional:**
- `DEEPL_I18N_S3_BUCKET` - S3 bucket name for i18n files (defaults to main application S3 bucket)
- `DEEPL_I18N_S3_PATH` - Path within S3 bucket for i18n files (defaults to `i18n`)

## API Endpoints

### 1. Real-time Translation

**POST** `/translate`

Translate text in real-time.

**Request Body:**
```json
{
  "text": "Hello, world!",
  "targetLanguage": "de",
  "sourceLanguage": "en"  // optional, auto-detected if not provided
}
```

**Response:**
```json
{
  "translatedText": "Hallo, Welt!",
  "sourceLanguage": "en",
  "targetLanguage": "de"
}
```

### 2. Get Available Languages

**GET** `/translate/languages`

Get list of available source and target languages.

**Response:**
```json
{
  "source": [
    { "code": "en", "name": "English" },
    { "code": "de", "name": "German" }
  ],
  "target": [
    { "code": "en", "name": "English" },
    { "code": "de", "name": "German" }
  ]
}
```

### 3. Manual i18n Translation

**POST** `/translate/i18n`

Manually trigger translation of i18n files.

**Request Body:**
```json
{
  "sourceLanguage": "en",
  "targetLanguages": ["de", "fr", "es"],
  "baseFileName": "en.json"  // optional
}
```

**Response:**
```json
{
  "success": ["de", "fr"],
  "failed": ["es"],
  "message": "Translation completed. Successfully translated to 2 languages, failed for 1 languages."
}
```

### 4. Manual Cronjob Trigger

**POST** `/cronjobs/deepl-translation/trigger`

Manually trigger the DeepL i18n translation cronjob.

**Request Body (optional):**
```json
{
  "sourceLanguage": "en",  // optional, defaults to "en"
  "targetLanguages": ["de", "fr", "es"]  // optional, defaults to all supported languages
}
```

**Response:**
```json
{
  "success": ["de", "fr"],
  "failed": ["es"],
  "message": "Manual translation completed. Successfully translated to 2 languages, failed for 1 languages."
}
```

## Automated i18n Translation Cronjob

### How it Works

The cronjob runs daily at 2:00 AM and performs the following steps:

1. **Download i18n files** from S3 bucket (path: `{DEEPL_I18N_S3_PATH}/`)
2. **Find source file** (defaults to English `en.json`)
3. **Translate content** to configured target languages
4. **Upload translated files** back to S3

### Supported Languages

The cronjob automatically translates to these languages:
- German (de)
- French (fr)
- Spanish (es)
- Italian (it)
- Portuguese (pt)
- Dutch (nl)
- Polish (pl)
- Russian (ru)
- Japanese (ja)
- Chinese (zh)
- Korean (ko)
- Vietnamese (vi)

### S3 File Structure

Your S3 bucket should have the following structure:

```
{DEEPL_I18N_S3_BUCKET}/
└── {DEEPL_I18N_S3_PATH}/
    ├── en.json          # Source file
    ├── de.json          # Generated translations
    ├── fr.json
    ├── es.json
    └── ...
```

### Example i18n File Format

```json
{
  "common": {
    "hello": "Hello",
    "goodbye": "Goodbye"
  },
  "navigation": {
    "home": "Home",
    "about": "About",
    "contact": "Contact"
  },
  "messages": {
    "welcome": "Welcome to WasteTrade",
    "error": "An error occurred"
  }
}
```

### Cronjob Configuration

The cronjob is configured in `src/components/Cronjobs/deepl-i18n-translation.cronjob.ts`:

- **Schedule**: Daily at 2:00 AM (Asia/Ho_Chi_Minh timezone)
- **Source Language**: English (`en`)
- **Target Languages**: 12 languages (configurable)

To modify the schedule or languages, edit the cronjob file.

## Error Handling

The integration includes comprehensive error handling:

- **API Errors**: Returns appropriate HTTP status codes with error messages
- **Translation Failures**: Individual translation failures don't stop the entire job
- **S3 Errors**: Proper error logging for debugging
- **DeepL API Limits**: Respects API rate limits and usage quotas

## Monitoring

- **Application Logs** - Console output shows cronjob execution and errors
- **API Responses** - Endpoint responses provide translation status
- **Manual Testing** - Use trigger endpoints for on-demand verification

## Development Notes

### Architecture

| Component | Location | Purpose |
|-----------|----------|---------|
| `DeepLService` | `src/services/deepl.service.ts` | Core translation logic |
| `TranslationController` | `src/controllers/translation.controller.ts` | REST API endpoints |
| `CronjobController` | `src/controllers/cronjob.controller.ts` | Manual triggers |
| `DeepLI18nTranslationCronjob` | `src/components/Cronjobs/deepl-i18n-translation.cronjob.ts` | Scheduled jobs |

### Dependency Injection

```typescript
constructor(
  @inject(DeepLServiceBindings.DEEPL_SERVICE)
  private deepLService: DeepLService,
) {}
```

### Testing

- **API Explorer** - Test endpoints via LoopBack's built-in API explorer
- **Manual Triggers** - Use `/cronjobs/deepl-translation/trigger` for testing
- **S3 Verification** - Check bucket for generated translation files

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "DeepL translator not initialized" | Check `DEEPL_API_KEY` environment variable |
| "Invalid target language" | Use correct language codes (e.g., "de", not "german") |
| "Failed to download i18n files" | Verify S3 bucket configuration and AWS permissions |
| "API usage limit exceeded" | Check DeepL account dashboard, consider upgrading plan |

**View Logs:**
```bash
yarn dev                    # Development
docker logs <container_id>  # Production
``` 