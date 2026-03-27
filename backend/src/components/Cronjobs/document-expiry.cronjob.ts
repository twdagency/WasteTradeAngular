import { service } from '@loopback/core';
import { CronJob, cronJob } from '@loopback/cron';
import { DocumentExpiryService } from '../../services';

@cronJob()
export class DocumentExpiryCronjob extends CronJob {
    private isRunning = false;

    constructor(
        @service(DocumentExpiryService)
        private documentExpiryService: DocumentExpiryService,
    ) {
        const onTick = async () => {
            await this.performExpiryCheck();
        };
        super({
            name: 'document-expiry-check',
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onTick,
            // Run daily at midnight UTC (0:00 AM UTC)
            cronTime: '0 0 0 * * *',
            // cronTime: '*/15 * * * * *', // each 15 seconds
            start: false,
            runOnInit: false,
            timeZone: 'UTC',
        });
    }

    private async performExpiryCheck(): Promise<void> {
        // Prevent overlapping executions
        if (this.isRunning) {
            console.log('Document expiry check already running, skipping...');
            return;
        }

        this.isRunning = true;
        const startTime = Date.now();

        try {
            console.log('Starting document expiry check cronjob...');

            // Check document expiry and send notifications/emails
            const result = await this.documentExpiryService.checkDocumentExpiry();

            const duration = Date.now() - startTime;

            console.log(`Document expiry check completed in ${duration}ms:`, {
                errors: result.errors.length,
            });

            // Log errors if any
            if (result.errors.length > 0) {
                console.error('Document expiry check errors:', result.errors);
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Document expiry check cronjob failed:', errorMessage);
        } finally {
            this.isRunning = false;
        }
    }

    async triggerManualCheck(): Promise<void> {
        console.log('Manual document expiry check triggered');
        await this.performExpiryCheck();
    }

    isCurrentlyRunning(): boolean {
        return this.isRunning;
    }
}
