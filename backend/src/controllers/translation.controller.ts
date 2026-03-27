import { inject } from '@loopback/core';
import { post, get, requestBody, HttpErrors } from '@loopback/rest';
import { DeepLService, TranslationRequest, TranslationResponse, AvailableLanguages } from '../services/deepl.service';
import { DeepLServiceBindings } from '../keys';

const TRANSLATION_REQUEST_SCHEMA = {
    type: 'object' as const,
    required: ['text', 'targetLanguage'],
    properties: {
        text: {
            type: 'string' as const,
            description: 'Text to translate',
            example: 'Hello, world!',
        },
        targetLanguage: {
            type: 'string' as const,
            description: 'Target language code (e.g., "de", "fr", "es")',
            example: 'de',
        },
        sourceLanguage: {
            type: 'string' as const,
            description: 'Source language code (optional, auto-detected if not provided)',
            example: 'en',
        },
    },
};

const I18N_TRANSLATION_REQUEST_SCHEMA = {
    type: 'object' as const,
    required: ['sourceLanguage', 'targetLanguages'],
    properties: {
        sourceLanguage: {
            type: 'string' as const,
            description: 'Source language code',
            example: 'en',
        },
        targetLanguages: {
            type: 'array' as const,
            items: {
                type: 'string' as const,
            },
            description: 'Array of target language codes',
            example: ['de', 'fr', 'es'],
        },
        baseFileName: {
            type: 'string' as const,
            description: 'Base file name to translate from (optional)',
            example: 'en.json',
        },
    },
};

export class TranslationController {
    constructor(
        @inject(DeepLServiceBindings.DEEPL_SERVICE)
        public deepLService: DeepLService,
    ) {}

    /**
     * Translate text in real-time
     */
    @post('/translate')
    async translateText(
        @requestBody({
            content: {
                'application/json': {
                    schema: TRANSLATION_REQUEST_SCHEMA,
                },
            },
        })
        request: TranslationRequest,
    ): Promise<TranslationResponse> {
        try {
            if (!request.text?.trim()) {
                throw new HttpErrors.BadRequest('Text to translate is required');
            }

            if (!request.targetLanguage?.trim()) {
                throw new HttpErrors.BadRequest('Target language is required');
            }

            return await this.deepLService.translateText(request);
        } catch (error: unknown) {
            if (error instanceof HttpErrors.HttpError) {
                throw error;
            }

            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new HttpErrors.InternalServerError(`Translation failed: ${errorMessage}`);
        }
    }

    /**
     * Get available languages for translation
     */
    @get('/translate/languages')
    async getAvailableLanguages(): Promise<AvailableLanguages> {
        try {
            return await this.deepLService.getAvailableLanguages();
        } catch (error: unknown) {
            if (error instanceof HttpErrors.HttpError) {
                throw error;
            }

            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new HttpErrors.InternalServerError(`Failed to fetch languages: ${errorMessage}`);
        }
    }

    /**
     * Trigger manual translation of i18n files
     * This endpoint allows manual triggering of the translation job that normally runs via cronjob
     */
    @post('/translate/i18n')
    async translateI18nFiles(
        @requestBody({
            content: {
                'application/json': {
                    schema: I18N_TRANSLATION_REQUEST_SCHEMA,
                },
            },
        })
        request: {
            sourceLanguage: string;
            targetLanguages: string[];
            baseFileName?: string;
        },
    ): Promise<{ success: string[]; failed: string[]; message: string }> {
        try {
            if (!request.sourceLanguage?.trim()) {
                throw new HttpErrors.BadRequest('Source language is required');
            }

            if (!request.targetLanguages?.length) {
                throw new HttpErrors.BadRequest('At least one target language is required');
            }

            const result = await this.deepLService.translateI18nFiles(
                request.sourceLanguage,
                request.targetLanguages,
                request.baseFileName,
            );

            return {
                ...result,
                message: `Translation completed. Successfully translated to ${result.success.length} languages, failed for ${result.failed.length} languages.`,
            };
        } catch (error: unknown) {
            if (error instanceof HttpErrors.HttpError) {
                throw error;
            }

            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new HttpErrors.InternalServerError(`I18n translation failed: ${errorMessage}`);
        }
    }

    /**
     * Restore translation file from backup
     */
    @post('/translate/restore')
    async restoreFromBackup(
        @requestBody({
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        required: ['targetLanguage'],
                        properties: {
                            targetLanguage: {
                                type: 'string',
                                description: 'Target language code (e.g., es, de, fr)',
                            },
                            backupTimestamp: {
                                type: 'number',
                                description: 'Optional: Specific backup timestamp to restore',
                            },
                        },
                    },
                },
            },
        })
        request: {
            targetLanguage: string;
            backupTimestamp?: number;
        },
    ): Promise<{ success: boolean; message: string }> {
        try {
            const success = await this.deepLService.restoreFromBackup(request.targetLanguage, request.backupTimestamp);

            if (success) {
                return {
                    success: true,
                    message: `Successfully restored ${request.targetLanguage}.json from backup`,
                };
            } else {
                return {
                    success: false,
                    message: `Failed to restore ${request.targetLanguage}.json from backup`,
                };
            }
        } catch (error: unknown) {
            if (error instanceof HttpErrors.HttpError) {
                throw error;
            }

            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new HttpErrors.InternalServerError(`Failed to restore from backup: ${errorMessage}`);
        }
    }
}
