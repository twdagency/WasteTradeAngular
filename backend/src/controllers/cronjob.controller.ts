import { post, requestBody, HttpErrors } from '@loopback/rest';
import { inject } from '@loopback/core';
import { DeepLService } from '../services/deepl.service';
import { DeepLServiceBindings } from '../keys';

const MANUAL_TRANSLATION_REQUEST_SCHEMA = {
    type: 'object' as const,
    properties: {
        sourceLanguage: {
            type: 'string' as const,
            description: 'Source language code (optional, defaults to "en")',
            example: 'en',
        },
        targetLanguages: {
            type: 'array' as const,
            items: {
                type: 'string' as const,
            },
            description: 'Array of target language codes (optional, defaults to all supported languages)',
            example: ['de', 'fr', 'es'],
        },
    },
};

export class CronjobController {
    constructor(
        @inject(DeepLServiceBindings.DEEPL_SERVICE)
        private deepLService: DeepLService,
    ) {}

    /**
     * Manually trigger the DeepL i18n translation
     * This allows manual execution of the translation job that normally runs on schedule
     */
    @post('/cronjobs/deepl-translation/trigger')
    async triggerDeepLTranslation(
        @requestBody({
            content: {
                'application/json': {
                    schema: MANUAL_TRANSLATION_REQUEST_SCHEMA,
                },
            },
        })
        request: {
            sourceLanguage?: string;
            targetLanguages?: string[];
        } = {},
    ): Promise<{ success: string[]; failed: string[]; message: string }> {
        try {
            const sourceLanguage = request.sourceLanguage ?? 'en';
            const targetLanguages = request.targetLanguages ?? [
                'es',
                // 'de',
                // 'fr',
                // 'it',
                // 'pt-PT',
                // 'pt-BR',
                // 'nl',
                // 'pl',
                // 'ru',
                // 'ja',
                // 'zh-Hans',
                // 'zh-Hant',
                // 'ko',
                // 'vi',
            ];

            const result = await this.deepLService.translateI18nFiles(sourceLanguage, targetLanguages);

            return {
                ...result,
                message: `Manual translation completed. Successfully translated to ${result.success.length} languages, failed for ${result.failed.length} languages.`,
            };
        } catch (error: unknown) {
            if (error instanceof HttpErrors.HttpError) {
                throw error;
            }

            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            throw new HttpErrors.InternalServerError(`Manual translation failed: ${errorMessage}`);
        }
    }
}
