import { CronJob, cronJob } from '@loopback/cron';
import { inject } from '@loopback/core';
import { DeepLService } from '../../services/deepl.service';
import { DeepLServiceBindings } from '../../keys';

@cronJob()
export class DeepLI18nTranslationCronjob extends CronJob {
    constructor(
        @inject(DeepLServiceBindings.DEEPL_SERVICE)
        private deepLService: DeepLService,
        private isRunning: boolean = false,
    ) {
        const onTick = async () => {
            if (this.isRunning) {
                return;
            }
            this.isRunning = true;
            await this.performTranslation();
            this.isRunning = false;
        };
        super({
            name: 'deepl-i18n-translation',
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onTick,
            // Run every Sunday at 2:00 AM
            cronTime: '0 0 2 * * 0',
            start: false,
            runOnInit: false,
            timeZone: 'Asia/Ho_Chi_Minh',
        });
    }

    private async performTranslation(): Promise<void> {
        const startTime = new Date();
        console.log(`\n🚀 DeepL Translation Cronjob Started`);

        try {
            const sourceLanguage = 'en';
            const targetLanguages = ['es'];

            console.log(`📋 Translating: ${sourceLanguage} → ${targetLanguages.join(', ')}`);
            const result = await this.deepLService.translateI18nFiles(sourceLanguage, targetLanguages);

            const endTime = new Date();
            const duration = Math.round((endTime.getTime() - startTime.getTime()) / 1000);

            console.log(`\n✅ Translation Completed (${duration}s)`);
            console.log(`📊 Success: ${result.success.length}, Failed: ${result.failed.length}`);

            if (result.failed.length > 0) {
                console.log(`❌ Failed: ${result.failed.join(', ')}`);
            }
        } catch (error: unknown) {
            const endTime = new Date();
            const duration = Math.round((endTime.getTime() - startTime.getTime()) / 1000);
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';

            console.error(`\n❌ Translation Failed (${duration}s)`);
            console.error(`💥 Error: ${errorMessage}`);
        }
    }

    /**
     * Method to manually trigger the translation job
     * This can be called from API endpoints or other parts of the application
     */
    public async triggerManualTranslation(
        sourceLanguage?: string,
        targetLanguages?: string[],
    ): Promise<{ success: string[]; failed: string[] }> {
        console.log('Manually triggering DeepL i18n translation...');

        const srcLang = sourceLanguage ?? 'en';
        const targetLangs = targetLanguages ?? [
            'de',
            'fr',
            'es',
            'it',
            'pt-PT',
            'pt-BR',
            'nl',
            'pl',
            'ru',
            'ja',
            'zh-Hans',
            'zh-Hant',
            'ko',
            'vi',
        ];

        return this.deepLService.translateI18nFiles(srcLang, targetLangs);
    }
}
