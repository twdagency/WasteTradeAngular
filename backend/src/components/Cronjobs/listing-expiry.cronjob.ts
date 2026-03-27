import { CronJob, cronJob } from '@loopback/cron';
import { service } from '@loopback/core';
import { ListingExpiryService } from '../../services/listing-expiry.service';
import { Listings } from '../../models';

@cronJob()
export class ListingExpiryCronjob extends CronJob {
    constructor(
        @service(ListingExpiryService)
        private listingExpiryService: ListingExpiryService,
    ) {
        const onTick = async () => {
            await this.performExpiryCheck();
        };
        super({
            name: 'listing-expiry-check',
            // eslint-disable-next-line @typescript-eslint/no-misused-promises
            onTick,
            // Run daily at 9:00 AM
            cronTime: '0 0 9 * * *',
            // cronTime: '*/15 * * * * *',
            start: false,
            runOnInit: false,
            timeZone: 'Asia/Ho_Chi_Minh',
        });
    }

    private async performExpiryCheck(): Promise<void> {
        try {
            console.log('Starting listing expiry check cronjob...');

            // Reset SOLD ongoing listings back to AVAILABLE when reset date arrives
            const resetResult = await this.listingExpiryService.resetSoldOngoingListings();
            console.log(`Reset ${resetResult.reset} SOLD ongoing listings back to AVAILABLE`);

            // Renew ongoing listings first (before marking others as expired)
            const renewalResult = await this.listingExpiryService.renewOngoingListings();
            console.log(`Renewed ${renewalResult.renewed} ongoing listings`);

            // Mark expired listings as expired (excludes ongoing listings)
            const expiredResult = await this.listingExpiryService.markExpiredListings();
            console.log(`Marked ${expiredResult.updated} listings as expired`);

            // Send expiry warnings for listings expiring in 7 days
            const warningResult = await this.listingExpiryService.sendExpiryWarnings();
            console.log(`Sent ${warningResult.sent} expiry warning emails, ${warningResult.failed} failed`);

            console.log('Listing expiry check cronjob completed successfully');
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.error('Listing expiry check cronjob failed:', errorMessage);

            // You might want to send an alert/notification here
            // For example, send email to admin or log to monitoring system
        }
    }

    /**
     * Method to manually trigger the expiry check
     * This can be called from API endpoints or other parts of the application
     */
    public async triggerManualExpiryCheck(): Promise<{
        reset: { reset: number; listings: Listings[] };
        expired: { updated: number; listings: Listings[] };
        warnings: { sent: number; failed: number };
    }> {
        console.log('Manually triggering listing expiry check...');

        const resetResult = await this.listingExpiryService.resetSoldOngoingListings();
        const expiredResult = await this.listingExpiryService.markExpiredListings();
        const warningResult = await this.listingExpiryService.sendExpiryWarnings();

        return {
            reset: resetResult,
            expired: expiredResult,
            warnings: warningResult,
        };
    }
}
