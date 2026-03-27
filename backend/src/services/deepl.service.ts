import { BindingScope, inject, injectable } from '@loopback/core';
import { HttpErrors } from '@loopback/rest';
import * as AWS from 'aws-sdk';
import * as deepl from 'deepl-node';
import { DEEPL_API_KEY, DEEPL_I18N_S3_BUCKET, DEEPL_I18N_S3_PATH } from '../config';
import { AwsS3Bindings } from '../keys/aws';

export interface TranslationRequest {
    text: string;
    targetLanguage: string;
    sourceLanguage?: string;
}

export interface TranslationResponse {
    translatedText: string;
    sourceLanguage: string;
    targetLanguage: string;
}

export interface I18nFile {
    language: string;
    content: Record<string, unknown>;
    fileName: string;
}

export interface LanguageInfo {
    code: string;
    name: string;
}

export interface AvailableLanguages {
    source: LanguageInfo[];
    target: LanguageInfo[];
}

@injectable({ scope: BindingScope.TRANSIENT })
export class DeepLService {
    private translator: deepl.Translator | null;

    constructor(
        @inject(AwsS3Bindings.AwsS3Provider)
        private s3: AWS.S3,
    ) {
        // Check for DeepL API key
        if (DEEPL_API_KEY && DEEPL_API_KEY.trim() !== '') {
            this.translator = new deepl.Translator(DEEPL_API_KEY);
            console.log('DeepL service initialized successfully');
        } else {
            console.error('❌ DEEPL_API_KEY not found or empty. DeepL features will be disabled.');
            console.error('Please set DEEPL_API_KEY in your .env file');
            this.translator = null;
        }
    }

    private checkTranslatorInitialized(): void {
        if (!this.translator) {
            throw new HttpErrors.ServiceUnavailable('DeepL service is not available. Please configure DEEPL_API_KEY.');
        }
    }

    /**
     * Translate text in real-time
     */
    async translateText(request: TranslationRequest): Promise<TranslationResponse> {
        try {
            this.checkTranslatorInitialized();

            const result = await this.translator!.translateText(
                request.text,
                (request.sourceLanguage as deepl.SourceLanguageCode | null) ?? null,
                request.targetLanguage as deepl.TargetLanguageCode,
            );

            const translatedText = Array.isArray(result) ? result[0].text : result.text;
            const detectedSourceLang = Array.isArray(result) ? result[0].detectedSourceLang : result.detectedSourceLang;

            return {
                translatedText,
                sourceLanguage: request.sourceLanguage ?? detectedSourceLang ?? 'auto',
                targetLanguage: request.targetLanguage,
            };
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('DeepL translation error:', error);
            throw new HttpErrors.BadRequest(`Translation failed: ${errorMessage}`);
        }
    }

    /**
     * Get available languages from DeepL
     */
    async getAvailableLanguages(): Promise<AvailableLanguages> {
        try {
            this.checkTranslatorInitialized();

            const [sourceLanguages, targetLanguages] = await Promise.all([
                this.translator!.getSourceLanguages(),
                this.translator!.getTargetLanguages(),
            ]);

            return {
                source: sourceLanguages.map((lang) => ({
                    code: lang.code,
                    name: lang.name,
                })),
                target: targetLanguages.map((lang) => ({
                    code: lang.code,
                    name: lang.name,
                })),
            };
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error fetching DeepL languages:', error);
            throw new HttpErrors.InternalServerError(`Failed to fetch available languages: ${errorMessage}`);
        }
    }

    /**
     * Download i18n files from S3
     */
    private async downloadI18nFilesFromS3(): Promise<I18nFile[]> {
        try {
            const params = {
                Bucket: DEEPL_I18N_S3_BUCKET,
                Prefix: `${DEEPL_I18N_S3_PATH}/`,
            };

            const objects = await this.s3.listObjectsV2(params).promise();

            if (!objects.Contents || objects.Contents.length === 0) {
                console.warn(`No files found in S3 bucket: ${DEEPL_I18N_S3_BUCKET}/${DEEPL_I18N_S3_PATH}/`);
                return [];
            }

            const jsonFiles = objects.Contents.filter(
                (obj) => obj.Key?.endsWith('.json') && obj.Key !== `${DEEPL_I18N_S3_PATH}/`,
            );

            console.log(`📁 Found ${jsonFiles.length} JSON files in S3`);

            const downloadPromises = jsonFiles.map(async (file) => {
                if (!file.Key) return null;

                const downloadParams = {
                    Bucket: DEEPL_I18N_S3_BUCKET,
                    Key: file.Key,
                };

                const data = await this.s3.getObject(downloadParams).promise();
                const content = JSON.parse(data.Body?.toString('utf-8') ?? '{}');

                // Extract language from filename (e.g., 'i18n/en.json' -> 'en')
                const fileName = file.Key.split('/').pop() ?? '';
                const language = fileName.replace('.json', '');

                return {
                    language,
                    content,
                    fileName: file.Key,
                };
            });

            const results = await Promise.all(downloadPromises);
            return results.filter((file): file is I18nFile => file !== null);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error downloading i18n files from S3:', error);
            throw new Error(`Failed to download i18n files: ${errorMessage}`);
        }
    }

    /**
     * Backup existing file before translation
     */
    private async backupExistingFile(language: string): Promise<void> {
        try {
            const originalKey = `${DEEPL_I18N_S3_PATH}/${language}.json`;
            const backupKey = `${DEEPL_I18N_S3_PATH}/backup/${language}_${Date.now()}.json`;

            const copyParams = {
                Bucket: DEEPL_I18N_S3_BUCKET,
                CopySource: `${DEEPL_I18N_S3_BUCKET}/${originalKey}`,
                Key: backupKey,
            };

            await this.s3.copyObject(copyParams).promise();
            console.log(`📦 Backed up ${language}.json`);
        } catch (error) {
            console.warn(`Could not backup ${language}.json:`, error);
        }
    }

    /**
     * Upload translated i18n file to S3
     */
    private async uploadI18nFileToS3(language: string, content: Record<string, unknown>): Promise<void> {
        try {
            const key = `${DEEPL_I18N_S3_PATH}/${language}.json`;
            const params = {
                Bucket: DEEPL_I18N_S3_BUCKET,
                Key: key,
                Body: JSON.stringify(content, null, 2),
                ContentType: 'application/json',
            };

            await this.s3.upload(params).promise();
            console.log(`📤 Uploaded ${language}.json to S3`);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error(`Error uploading ${language}.json to S3:`, error);
            throw new Error(`Failed to upload ${language}.json: ${errorMessage}`);
        }
    }

    /**
     * Sleep function for rate limiting
     */
    private sleep(ms: number): Promise<void> {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    /**
     * Translate text with retry logic and rate limiting
     */
    private async translateWithRetry(
        text: string,
        sourceLanguage: string,
        targetLanguage: string,
        maxRetries: number = 3,
        baseDelay: number = 1000,
    ): Promise<string> {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                // Add delay between requests to avoid rate limiting
                if (attempt > 1) {
                    const delay = baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
                    console.log(`⏳ Retrying in ${delay}ms (attempt ${attempt}/${maxRetries})`);
                    await this.sleep(delay);
                } else {
                    // Small delay even on first attempt
                    await this.sleep(200);
                }

                const result = await this.translator!.translateText(
                    text,
                    sourceLanguage as deepl.SourceLanguageCode,
                    targetLanguage as deepl.TargetLanguageCode,
                );

                const translatedText = Array.isArray(result) ? result[0].text : result.text;
                return translatedText;
            } catch (error) {
                const errorMessage = error instanceof Error ? error.message : 'Unknown error';

                if (errorMessage.includes('Too many requests') || errorMessage.includes('rate limit')) {
                    if (attempt === maxRetries) {
                        console.warn(`❌ Rate limit exceeded after ${maxRetries} attempts`);
                        throw error;
                    }
                } else {
                    console.error(`❌ Translation error: ${errorMessage}`);
                    throw error;
                }
            }
        }
        throw new Error('Max retries exceeded');
    }

    /**
     * Count total string values in nested object for progress tracking
     */
    private countStringValues(obj: Record<string, unknown>): number {
        let count = 0;
        for (const value of Object.values(obj)) {
            if (typeof value === 'string') {
                count++;
            } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                count += this.countStringValues(value as Record<string, unknown>);
            }
        }
        return count;
    }

    /**
     * Recursively translate nested object values
     */
    private async translateNestedObject(
        obj: Record<string, unknown>,
        sourceLanguage: string,
        targetLanguage: string,
        existingTranslation: Record<string, unknown> = {},
        parentKey: string = '',
        totalStrings: number = 0,
        currentProgress: { count: number } = { count: 0 },
    ): Promise<Record<string, unknown>> {
        const translated: Record<string, unknown> = {};
        const keys = Object.keys(obj);

        for (let i = 0; i < keys.length; i++) {
            const key = keys[i];
            const value = obj[key];
            const fullKey = parentKey ? `${parentKey}.${key}` : key;
            const existingValue = existingTranslation[key];

            if (typeof value === 'string') {
                // Translate string values with retry logic
                currentProgress.count++;
                const progressPercent = totalStrings > 0 ? Math.round((currentProgress.count / totalStrings) * 100) : 0;

                // Only log every 10% or every 50 items
                if (progressPercent % 10 === 0 || currentProgress.count % 50 === 0) {
                    console.log(`🔄 [${currentProgress.count}/${totalStrings}] (${progressPercent}%) Translating...`);
                }

                try {
                    const translatedText = await this.translateWithRetry(value, sourceLanguage, targetLanguage);
                    translated[key] = translatedText;
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    const isQuotaError =
                        errorMessage.toLowerCase().includes('quota') ||
                        errorMessage.toLowerCase().includes('character limit') ||
                        (error instanceof deepl.QuotaExceededError);

                    if (isQuotaError) {
                        console.error(`🚫 DeepL quota exceeded at key "${fullKey}" — aborting translation`);
                        throw error; // Re-throw to prevent overwriting with original text
                    }

                    // Fallback to existing translation; never use original source text
                    if (typeof existingValue === 'string') {
                        console.warn(`⚠️ Failed to translate key "${fullKey}", using existing translation`);
                        translated[key] = existingValue;
                    } else {
                        console.warn(`❌ Failed to translate key "${fullKey}" (no existing translation): ${errorMessage}`);
                        translated[key] = value; // New key with no prior translation — original is only option
                    }
                }
            } else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                // Recursively translate nested objects
                const existingNested = (typeof existingValue === 'object' && existingValue !== null && !Array.isArray(existingValue))
                    ? existingValue as Record<string, unknown>
                    : {};
                translated[key] = await this.translateNestedObject(
                    value as Record<string, unknown>,
                    sourceLanguage,
                    targetLanguage,
                    existingNested,
                    fullKey,
                    totalStrings,
                    currentProgress,
                );
            } else {
                // Keep non-string values as is
                translated[key] = value;
            }
        }

        return translated;
    }

    /**
     * Check if target file exists in S3
     */
    private async checkTargetFileExists(targetLanguage: string): Promise<boolean> {
        try {
            const key = `${DEEPL_I18N_S3_PATH}/${targetLanguage}.json`;
            const params = {
                Bucket: DEEPL_I18N_S3_BUCKET,
                Key: key,
            };

            await this.s3.headObject(params).promise();
            return true;
        } catch (error) {
            return false;
        }
    }

    /**
     * Download existing target file from S3
     */
    private async downloadExistingTargetFile(targetLanguage: string): Promise<I18nFile | null> {
        try {
            const key = `${DEEPL_I18N_S3_PATH}/${targetLanguage}.json`;
            const params = {
                Bucket: DEEPL_I18N_S3_BUCKET,
                Key: key,
            };

            const data = await this.s3.getObject(params).promise();
            const content = JSON.parse(data.Body?.toString('utf-8') ?? '{}');

            return {
                language: targetLanguage,
                content,
                fileName: key,
            };
        } catch (error) {
            console.warn(`Could not download existing ${targetLanguage}.json:`, error);
            return null;
        }
    }

    /**
     * Restore file from backup (for manual recovery)
     */
    async restoreFromBackup(targetLanguage: string, backupTimestamp?: number): Promise<boolean> {
        try {
            let backupKey: string;

            if (backupTimestamp) {
                // Use specific backup timestamp
                backupKey = `${DEEPL_I18N_S3_PATH}/backup/${targetLanguage}_${backupTimestamp}.json`;
            } else {
                // Find the most recent backup
                const params = {
                    Bucket: DEEPL_I18N_S3_BUCKET,
                    Prefix: `${DEEPL_I18N_S3_PATH}/backup/${targetLanguage}_`,
                };

                const objects = await this.s3.listObjectsV2(params).promise();
                if (!objects.Contents || objects.Contents.length === 0) {
                    console.error(`No backup found for ${targetLanguage}`);
                    return false;
                }

                // Sort by last modified date (most recent first)
                const sortedBackups = objects.Contents.sort(
                    (a, b) => (b.LastModified?.getTime() || 0) - (a.LastModified?.getTime() || 0),
                );
                backupKey = sortedBackups[0].Key!;
            }

            console.log(`🔄 Restoring ${targetLanguage}.json from backup: ${backupKey}`);

            // Copy backup to main location
            const copyParams = {
                Bucket: DEEPL_I18N_S3_BUCKET,
                CopySource: `${DEEPL_I18N_S3_BUCKET}/${backupKey}`,
                Key: `${DEEPL_I18N_S3_PATH}/${targetLanguage}.json`,
            };

            await this.s3.copyObject(copyParams).promise();
            console.log(`✅ Successfully restored ${targetLanguage}.json from backup`);
            return true;
        } catch (error) {
            console.error(`❌ Failed to restore ${targetLanguage}.json from backup:`, error);
            return false;
        }
    }

    /**
     * Translate all i18n files from source language to target languages
     */
    async translateI18nFiles(
        sourceLanguage: string,
        targetLanguages: string[],
        baseFileName?: string,
    ): Promise<{ success: string[]; failed: string[] }> {
        try {
            console.log(`Starting i18n translation job: ${sourceLanguage} -> [${targetLanguages.join(', ')}]`);

            const i18nFiles = await this.downloadI18nFilesFromS3();

            // Find the source file (default to first file if baseFileName not specified)
            const sourceFile = baseFileName
                ? i18nFiles.find((file) => file.fileName.includes(baseFileName))
                : (i18nFiles.find((file) => file.language === sourceLanguage) ?? i18nFiles[0]);

            if (!sourceFile) {
                throw new Error(`Source file not found for language: ${sourceLanguage}`);
            }

            console.log(`Using source file: ${sourceFile.fileName}`);

            const results = { success: [] as string[], failed: [] as string[] };

            // Count total strings for progress tracking
            const totalStrings = this.countStringValues(sourceFile.content);
            console.log(`📊 Total strings to translate: ${totalStrings}`);

            // Translate to each target language
            for (let langIndex = 0; langIndex < targetLanguages.length; langIndex++) {
                const targetLang = targetLanguages[langIndex];

                if (targetLang === sourceLanguage) {
                    console.log(`⏭️  Skipping ${targetLang} (same as source)`);
                    continue;
                }

                // Check if target file already exists
                const targetFileExists = await this.checkTargetFileExists(targetLang);
                if (targetFileExists) {
                    console.log(`📁 ${targetLang}.json exists, will preserve if translation fails`);
                    await this.backupExistingFile(targetLang);
                }

                try {
                    console.log(
                        `\n🌍 [${langIndex + 1}/${targetLanguages.length}] Translating to ${targetLang.toUpperCase()}`,
                    );
                    await this.sleep(5000); // 5 second delay before each language

                    // Load existing translations to use as fallback
                    const existingFile = targetFileExists
                        ? await this.downloadExistingTargetFile(targetLang)
                        : null;

                    const startTime = Date.now();
                    const translatedContent = await this.translateNestedObject(
                        sourceFile.content,
                        sourceLanguage,
                        targetLang,
                        existingFile?.content ?? {},
                        '',
                        totalStrings,
                        { count: 0 },
                    );
                    const endTime = Date.now();
                    const duration = Math.round((endTime - startTime) / 1000);

                    await this.uploadI18nFileToS3(targetLang, translatedContent);
                    results.success.push(targetLang);

                    console.log(`✅ ${targetLang}.json completed (${duration}s)`);
                } catch (error) {
                    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
                    console.error(`❌ Failed to translate ${targetLang}: ${errorMessage}`);

                    if (targetFileExists) {
                        console.log(`🛡️  Preserving existing ${targetLang}.json`);
                        results.failed.push(targetLang);
                    } else {
                        console.log(`⚠️  Uploading English fallback for ${targetLang}.json`);
                        try {
                            await this.uploadI18nFileToS3(targetLang, sourceFile.content);
                            results.success.push(targetLang);
                        } catch (uploadError) {
                            console.error(`❌ Failed to upload fallback for ${targetLang}`);
                            results.failed.push(targetLang);
                        }
                    }
                }
            }

            console.log(
                `Translation job completed. Success: ${results.success.length}, Failed: ${results.failed.length}`,
            );
            return results;
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Error in translateI18nFiles:', error);
            throw new Error(`Translation job failed: ${errorMessage}`);
        }
    }
}
