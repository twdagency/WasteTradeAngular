import { MigrationScript, migrationScript } from 'loopback4-migration';
import { inject } from '@loopback/core';
import { juggler } from '@loopback/repository';

@migrationScript()
export class MigrateListingDurationToEndDate implements MigrationScript {
    version = '1.0.14';
    scriptName = 'MigrateListingDurationToEndDate';
    description = 'Migrate listingDuration values to endDate where endDate is null';

    constructor(@inject('datasources.db') private dataSource: juggler.DataSource) {}

    async up(): Promise<void> {
        try {
            console.log('Starting migration: Migrate listingDuration to endDate...');

            // Step 1: Check current state before migration
            const beforeStats = await this.dataSource.execute(`
                SELECT 
                    COUNT(*) as total_listings,
                    COUNT(listing_duration) as listings_with_duration,
                    COUNT(end_date) as listings_with_end_date,
                    COUNT(CASE WHEN listing_duration IS NOT NULL AND end_date IS NULL THEN 1 END) as to_migrate
                FROM listings
            `);

            console.log('Before migration stats:', beforeStats[0]);

            // Step 2: Migrate listingDuration to endDate where endDate is null
            const updateQuery = `
                UPDATE listings 
                SET end_date = listing_duration,
                    updated_at = CURRENT_TIMESTAMP
                WHERE listing_duration IS NOT NULL 
                AND end_date IS NULL
            `;

            const updateResult = await this.dataSource.execute(updateQuery);
            console.log(`Updated ${updateResult.affectedRows || 'unknown'} listings with endDate from listingDuration`);

            // Step 3: Check state after migration
            const afterStats = await this.dataSource.execute(`
                SELECT 
                    COUNT(*) as total_listings,
                    COUNT(listing_duration) as listings_with_duration,
                    COUNT(end_date) as listings_with_end_date,
                    COUNT(CASE WHEN listing_duration IS NOT NULL AND end_date IS NULL THEN 1 END) as remaining_to_migrate
                FROM listings
            `);

            console.log('After migration stats:', afterStats[0]);

            // Step 4: Verify data consistency
            const consistencyCheck = await this.dataSource.execute(`
                SELECT 
                    COUNT(*) as inconsistent_records
                FROM listings 
                WHERE listing_duration IS NOT NULL 
                AND end_date IS NOT NULL 
                AND listing_duration != end_date
            `);

            if (consistencyCheck[0].inconsistent_records > 0) {
                console.warn(
                    `Warning: Found ${consistencyCheck[0].inconsistent_records} records where listingDuration and endDate differ`,
                );
            }

            console.log('Migrate listingDuration to endDate migration completed successfully!');
        } catch (error) {
            console.error('Error during migration:', error);
            throw error;
        }
    }

    async down(): Promise<void> {
        try {
            console.log('Starting rollback: Migrate listingDuration to endDate...');

            // Rollback strategy: Set endDate to null where it was migrated from listingDuration
            // Note: This is a conservative rollback that only clears endDate where it matches listingDuration
            const rollbackQuery = `
                UPDATE listings 
                SET end_date = NULL,
                    updated_at = CURRENT_TIMESTAMP
                WHERE listing_duration IS NOT NULL 
                AND end_date IS NOT NULL 
                AND listing_duration = end_date
            `;

            const rollbackResult = await this.dataSource.execute(rollbackQuery);
            console.log(`Rolled back ${rollbackResult.affectedRows || 'unknown'} listings by clearing endDate`);

            console.log('Rollback completed successfully!');
        } catch (error) {
            console.error('Error during rollback:', error);
            throw error;
        }
    }
}
