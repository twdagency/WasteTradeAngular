import { repository } from '@loopback/repository';
import { MigrationScript, migrationScript } from 'loopback4-migration';
import { UserRepository, CompaniesRepository, ListingsRepository, OffersRepository } from '../repositories';

@migrationScript()
export class AddSalesforceIdFields implements MigrationScript {
    version = '1.0.10';
    scriptName = 'AddSalesforceIdFields';
    description = 'Add salesforce_id fields to users, companies, listings, and offers tables';

    constructor(
        @repository(UserRepository)
        private userRepository: UserRepository,
        @repository(CompaniesRepository)
        private companiesRepository: CompaniesRepository,
        @repository(ListingsRepository)
        private listingsRepository: ListingsRepository,
        @repository(OffersRepository)
        private offersRepository: OffersRepository,
    ) {}

    async up(): Promise<void> {
        try {
            const datasource = this.userRepository.dataSource;

            // Add salesforce_id column to users table
            await datasource.execute(`
                ALTER TABLE public.users
                ADD COLUMN IF NOT EXISTS salesforce_id VARCHAR(50);
            `);

            // Add salesforce_id column to companies table
            await datasource.execute(`
                ALTER TABLE public.companies
                ADD COLUMN IF NOT EXISTS salesforce_id VARCHAR(50);
            `);

            // Add salesforce_id column to listings table
            await datasource.execute(`
                ALTER TABLE public.listings
                ADD COLUMN IF NOT EXISTS salesforce_id VARCHAR(50);
            `);

            // Add salesforce_id column to offers table
            await datasource.execute(`
                ALTER TABLE public.offers
                ADD COLUMN IF NOT EXISTS salesforce_id VARCHAR(50);
            `);

            console.log('Migration completed: Added salesforce_id fields to all sync tables');
        } catch (error) {
            console.error('Add salesforce_id fields up script failed:', error);
            throw error;
        }
    }

    async down(): Promise<void> {
        try {
            const datasource = this.userRepository.dataSource;

            // Remove salesforce_id column from users table
            await datasource.execute(`
                ALTER TABLE public.users DROP COLUMN IF EXISTS salesforce_id;
            `);

            // Remove salesforce_id column from companies table
            await datasource.execute(`
                ALTER TABLE public.companies DROP COLUMN IF EXISTS salesforce_id;
            `);

            // Remove salesforce_id column from listings table
            await datasource.execute(`
                ALTER TABLE public.listings DROP COLUMN IF EXISTS salesforce_id;
            `);

            // Remove salesforce_id column from offers table
            await datasource.execute(`
                ALTER TABLE public.offers DROP COLUMN IF EXISTS salesforce_id;
            `);

            console.log('Migration rollback completed: Removed salesforce_id fields from all tables');
        } catch (error) {
            console.error('Add salesforce_id fields down script failed:', error);
            throw error;
        }
    }
}
