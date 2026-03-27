import { repository } from '@loopback/repository';
import { MigrationScript, migrationScript } from 'loopback4-migration';
import { OffersRepository } from '../repositories';

@migrationScript()
export class UpdateOfferEnums implements MigrationScript {
    version = '1.0.3';
    scriptName = 'UpdateOfferEnums';
    description = 'Update offer enums and add rejection_source field';

    constructor(
        @repository(OffersRepository)
        private offersRepository: OffersRepository,
    ) {}

    async up(): Promise<void> {
        try {
            const datasource = this.offersRepository.dataSource;

            // First, ensure offer_status enum exists
            await datasource.execute(`
                DO $$ BEGIN
                    CREATE TYPE offer_status AS ENUM ('pending', 'accepted', 'rejected', 'shipped');
                EXCEPTION
                    WHEN duplicate_object THEN null;
                END $$;
            `);

            // Add APPROVED to offer_status enum
            await datasource.execute(`
                DO $$ BEGIN
                    ALTER TYPE offer_status ADD VALUE IF NOT EXISTS 'approved';
                EXCEPTION
                    WHEN undefined_object THEN
                        CREATE TYPE offer_status AS ENUM ('pending', 'approved', 'accepted', 'rejected', 'shipped');
                END $$;
            `);

            // Add rejection_source column to offers table
            await datasource.execute(`
                ALTER TABLE offers 
                ADD COLUMN IF NOT EXISTS rejection_source VARCHAR(10);
            `);

            // Create enum type for rejection_source if it doesn't exist
            await datasource.execute(`
                DO $$ BEGIN
                    CREATE TYPE rejection_source_enum AS ENUM ('admin', 'seller');
                EXCEPTION
                    WHEN duplicate_object THEN null;
                END $$;
            `);

            // Update rejection_source column to use enum type (only if column has data)
            await datasource.execute(`
                DO $$ BEGIN
                    IF EXISTS (SELECT 1 FROM information_schema.columns 
                              WHERE table_name = 'offers' AND column_name = 'rejection_source') THEN
                        ALTER TABLE offers 
                        ALTER COLUMN rejection_source TYPE rejection_source_enum 
                        USING rejection_source::rejection_source_enum;
                    END IF;
                END $$;
            `);

            console.log('Migration completed: Updated offer enums and added rejection_source field');
        } catch (error) {
            console.error('Update offer enums up script ran failed!:', error);
            throw error;
        }
    }

    async down(): Promise<void> {
        try {
            const datasource = this.offersRepository.dataSource;

            // Remove rejection_source column
            await datasource.execute(`
                ALTER TABLE offers DROP COLUMN IF EXISTS rejection_source;
            `);

            // Drop rejection_source_enum type
            await datasource.execute(`
                DROP TYPE IF EXISTS rejection_source_enum;
            `);

            // Note: Cannot remove 'approved' from offer_status enum as PostgreSQL doesn't support this
            // Manual intervention required if rollback is needed

            console.log('Migration rolled back: Removed rejection_source field');
        } catch (error) {
            console.error('Update offer enums down script ran failed!:', error);
        }
    }
}
