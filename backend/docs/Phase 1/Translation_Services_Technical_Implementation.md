# 6.8.1 Translation Services API Documentation

This API provides real-time translation services and i18n file management using DeepL integration.

## API Endpoints

### Real-time Text Translation
```
POST /translate
```

Translates text in real-time using DeepL API.

#### Request Body
```json
{
  "text": "Hello, world!",
  "targetLanguage": "de",
  "sourceLanguage": "en"
}
```

#### Parameters
- `text` (required) - Text to translate
- `targetLanguage` (required) - Target language code (e.g., "de", "fr", "es")
- `sourceLanguage` (optional) - Source language code (auto-detected if not provided)

#### cURL Example
```bash
curl -L -X POST 'https://wastetrade-api-dev.b13devops.com/translate' \
-H 'Content-Type: application/json' \
-d '{
  "text": "Hello, world!",
  "targetLanguage": "de",
  "sourceLanguage": "en"
}'
```

#### Response
```json
{
  "translatedText": "Hallo, Welt!",
  "detectedSourceLanguage": "en",
  "targetLanguage": "de",
  "confidence": 0.99
}
```

### Get Available Languages
```
GET /translate/languages
```

Returns list of available languages for translation.

#### cURL Example
```bash
curl -L -X GET 'https://wastetrade-api-dev.b13devops.com/translate/languages'
```

#### Response
```json
{
  "supportedLanguages": [
    {
      "language": "de",
      "name": "German"
    },
    {
      "language": "fr", 
      "name": "French"
    },
    {
      "language": "es",
      "name": "Spanish"
    },
    {
      "language": "it",
      "name": "Italian"
    }
  ]
}
```

### I18n File Translation
```
POST /translate/i18n
```

Triggers translation of internationalization files. This endpoint allows manual triggering of the translation job that normally runs via cronjob.

#### Request Body
```json
{
  "sourceLanguage": "en",
  "targetLanguages": ["de", "fr", "es"],
  "baseFileName": "en.json"
}
```

#### Parameters
- `sourceLanguage` (required) - Source language code
- `targetLanguages` (required) - Array of target language codes
- `baseFileName` (optional) - Base file name to translate from

#### cURL Example
```bash
curl -L -X POST 'https://wastetrade-api-dev.b13devops.com/translate/i18n' \
-H 'Content-Type: application/json' \
-d '{
  "sourceLanguage": "en",
  "targetLanguages": ["de", "fr", "es"],
  "baseFileName": "en.json"
}'
```

#### Response
```json
{
  "success": ["de", "fr"],
  "failed": ["es"],
  "message": "Translation completed. Successfully translated to 2 languages, failed for 1 languages.",
  "details": {
    "de": {
      "status": "success",
      "translatedKeys": 45,
      "outputFile": "de.json"
    },
    "fr": {
      "status": "success", 
      "translatedKeys": 45,
      "outputFile": "fr.json"
    },
    "es": {
      "status": "failed",
      "error": "API rate limit exceeded"
    }
  }
}
```

## Supported Languages

The translation service supports the following languages:

| Code | Language |
|------|----------|
| `en` | English |
| `de` | German |
| `fr` | French |
| `es` | Spanish |
| `it` | Italian |
| `pt` | Portuguese |
| `pl` | Polish |
| `nl` | Dutch |
| `ru` | Russian |
| `ja` | Japanese |
| `zh` | Chinese |

## Language Detection

When `sourceLanguage` is not provided in real-time translation, the service will automatically detect the source language. The detected language will be returned in the response.

## I18n File Structure

The i18n translation service expects JSON files with the following structure:

```json
{
  "welcome": "Welcome to WasteTrade",
  "navigation": {
    "home": "Home",
    "listings": "Listings",
    "offers": "Offers"
  },
  "buttons": {
    "save": "Save",
    "cancel": "Cancel",
    "submit": "Submit"
  }
}
```

Nested objects are supported and will be preserved in the translated files.

## Error Responses

### 400 Bad Request - Missing Text
```json
{
  "error": {
    "statusCode": 400,
    "name": "BadRequestError",
    "message": "Text to translate is required"
  }
}
```

### 400 Bad Request - Missing Target Language
```json
{
  "error": {
    "statusCode": 400,
    "name": "BadRequestError", 
    "message": "Target language is required"
  }
}
```

### 500 Internal Server Error
```json
{
  "error": {
    "statusCode": 500,
    "name": "InternalServerError",
    "message": "Translation failed: API key not configured"
  }
}
```

### DeepL API Errors
```json
{
  "error": {
    "statusCode": 500,
    "name": "InternalServerError",
    "message": "Translation failed: API quota exceeded"
  }
}
```

## Configuration

The translation service requires the following environment variables:

```bash
DEEPL_API_KEY=your_deepl_api_key_here
DEEPL_API_URL=https://api-free.deepl.com/v2  # or https://api.deepl.com/v2 for pro
```

## Rate Limits

DeepL API has the following rate limits:
- **Free Plan**: 500,000 characters/month
- **Pro Plan**: Based on subscription tier
- **Request Rate**: Varies by plan

The service will return appropriate error messages when rate limits are exceeded.

## Best Practices

### Real-time Translation
1. **Cache Results**: Cache translated text to avoid repeated API calls
2. **Batch Requests**: Combine multiple short texts into single requests when possible
3. **Error Handling**: Always handle rate limit and quota exceeded errors gracefully
4. **Language Detection**: Use auto-detection sparingly to conserve API usage

### I18n Translation
1. **Staging Environment**: Test translations in staging before production deployment
2. **Review Process**: Implement human review for critical translations
3. **Incremental Updates**: Only translate changed/new keys to save API usage
4. **Backup**: Keep backups of original translation files
5. **Validation**: Validate JSON structure after translation

## Usage Examples

### Frontend Integration
```javascript
// Real-time translation
const translateText = async (text, targetLang) => {
  const response = await fetch('/translate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      text: text,
      targetLanguage: targetLang
    })
  });
  
  return await response.json();
};

// Usage
const result = await translateText('Hello world', 'de');
console.log(result.translatedText); // "Hallo Welt"
```

### Bulk Translation Workflow
```bash
# 1. Trigger i18n translation
curl -X POST 'https://wastetrade-api-dev.b13devops.com/translate/i18n' \
-H 'Content-Type: application/json' \
-d '{
  "sourceLanguage": "en",
  "targetLanguages": ["de", "fr", "es", "it"]
}'

# 2. Check translation status and review results
# 3. Deploy updated translation files to frontend
```

## Cronjob Integration

The i18n translation can be automated using the built-in cronjob system:

```typescript
// In cronjob configuration
@cron('0 2 * * *') // Daily at 2 AM
async updateTranslations() {
  await this.translationService.translateI18nFiles('en', ['de', 'fr', 'es']);
}
```

## Security Considerations

1. **API Key Protection**: Never expose DeepL API key in frontend code
2. **Rate Limiting**: Implement application-level rate limiting to prevent abuse
3. **Input Validation**: Sanitize user input before translation
4. **Logging**: Log translation requests for monitoring and debugging
5. **Access Control**: Consider restricting i18n translation endpoint to admin users 