import { CronJob, cronJob } from '@loopback/cron';
import { service } from '@loopback/core';
import { DataDraftExpiryService } from '../../services/data-draft-expiry.service';

@cronJob()
export class DataDraftExpiryCronjob extends CronJob {
    constructor(
        @service(DataDraftExpiryService)
        private dataDraftExpiryService: DataDraftExpiryService,
    ) {
        const onTick = async () => {
            await this.performExpiryCleanup();
        };
        super({
            name: 'data-draft-expiry-cleanup',
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onTick,
            // Run daily at 2:00 AM (to avoid peak hours)
            cronTime: '0 0 2 * * *',
            start: false,
            runOnInit: false,
            timeZone: 'Asia/Ho_Chi_Minh',
        });
    }

    private async performExpiryCleanup(): Promise<void> {
        try {
            console.log('Starting data draft expiry cleanup cronjob...');

            const result = await this.dataDraftExpiryService.deleteExpiredDrafts();

            console.log(`Deleted ${result.deleted} expired data drafts`);
            if (result.s3FilesDeleted > 0) {
                console.log(`Deleted ${result.s3FilesDeleted} orphaned S3 files`);
            }

            if (result.errors.length > 0) {
                console.error(`Encountered ${result.errors.length} errors during cleanup:`, result.errors);
            }

            console.log('Data draft expiry cleanup cronjob completed successfully');
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Data draft expiry cleanup cronjob failed:', errorMessage);
        }
    }
}
