import { repository } from '@loopback/repository';
import { MigrationScript, migrationScript } from 'loopback4-migration';
import { ListingsRepository, CompaniesRepository } from '../repositories';

@migrationScript()
export class UpdateDescriptionVarcharLength implements MigrationScript {
    version = '1.0.5';
    scriptName = 'UpdateDescriptionVarcharLength';
    description = 'Update description fields from varchar(255) to varchar(32000) in listings and companies tables';

    constructor(
        @repository(ListingsRepository)
        private listingsRepository: ListingsRepository,
        @repository(CompaniesRepository)
        private companiesRepository: CompaniesRepository,
    ) {}

    async up(): Promise<void> {
        try {
            const datasource = this.listingsRepository.dataSource;

            // Update listings table description column
            await datasource.execute(`
                ALTER TABLE public.listings
                ALTER COLUMN description TYPE varchar(32000);
            `);

            // Update companies table description column
            await datasource.execute(`
                ALTER TABLE public.companies
                ALTER COLUMN description TYPE varchar(32000);
            `);

            console.log('Migration completed: Updated description fields to varchar(32000)');
        } catch (error) {
            console.error('Update description varchar length up script failed:', error);
            throw error;
        }
    }

    async down(): Promise<void> {
        try {
            const datasource = this.listingsRepository.dataSource;

            // Rollback: Update listings table description column back to varchar(255)
            // Note: This may truncate data if any descriptions exceed 255 characters
            await datasource.execute(`
                ALTER TABLE public.listings
                ALTER COLUMN description TYPE varchar(255);
            `);

            // Rollback: Update companies table description column back to varchar(255)
            await datasource.execute(`
                ALTER TABLE public.companies
                ALTER COLUMN description TYPE varchar(255);
            `);

            console.log('Migration rollback completed: Reverted description fields to varchar(255)');
        } catch (error) {
            console.error('Update description varchar length down script failed:', error);
            throw error;
        }
    }
}
