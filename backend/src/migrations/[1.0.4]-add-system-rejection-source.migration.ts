import { repository } from '@loopback/repository';
import { MigrationScript, migrationScript } from 'loopback4-migration';
import { OffersRepository } from '../repositories';

@migrationScript()
export class AddSystemRejectionSource implements MigrationScript {
    version = '1.0.4';
    scriptName = 'AddSystemRejectionSource';
    description = 'Add system value to rejection_source enum';

    constructor(
        @repository(OffersRepository)
        private offersRepository: OffersRepository,
    ) {}

    async up(): Promise<void> {
        try {
            const datasource = this.offersRepository.dataSource;

            // First, ensure rejection_source_enum exists
            await datasource.execute(`
                DO $$ BEGIN
                    CREATE TYPE rejection_source_enum AS ENUM ('admin', 'seller');
                EXCEPTION
                    WHEN duplicate_object THEN null;
                END $$;
            `);

            // Add 'system' to rejection_source enum
            await datasource.execute(`
                DO $$ BEGIN
                    ALTER TYPE rejection_source_enum ADD VALUE IF NOT EXISTS 'system';
                EXCEPTION
                    WHEN undefined_object THEN
                        CREATE TYPE rejection_source_enum AS ENUM ('admin', 'seller', 'system');
                END $$;
            `);

            console.log('Migration completed: Added system value to rejection_source enum');
        } catch (error) {
            console.error('Add system rejection source up script ran failed!:', error);
            throw error;
        }
    }

    async down(): Promise<void> {
        try {
            // Note: PostgreSQL doesn't support removing enum values directly
            // This would require recreating the enum and updating all references
            // Manual intervention required if rollback is needed
            console.log('Migration rollback: PostgreSQL does not support removing enum values directly');
        } catch (error) {
            console.error('Add system rejection source down script ran failed!:', error);
        }
    }
}
