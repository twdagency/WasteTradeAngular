import { repository } from '@loopback/repository';
import { MigrationScript, migrationScript } from 'loopback4-migration';
import { OffersRepository } from '../repositories';

@migrationScript()
export class CreateOfferEnums implements MigrationScript {
    version = '1.0.2';
    scriptName = 'CreateOfferEnums';
    description = 'Create offer_status and offer_state enum types';

    constructor(
        @repository(OffersRepository)
        private offersRepository: OffersRepository,
    ) {}

    async up(): Promise<void> {
        try {
            const datasource = this.offersRepository.dataSource;

            // Create offer_status enum type
            await datasource.execute(`
                DO $$ BEGIN
                    CREATE TYPE offer_status AS ENUM ('pending', 'accepted', 'rejected', 'shipped');
                EXCEPTION
                    WHEN duplicate_object THEN null;
                END $$;
            `);

            // Create offer_state enum type
            await datasource.execute(`
                DO $$ BEGIN
                    CREATE TYPE offer_state AS ENUM ('pending', 'active', 'closed');
                EXCEPTION
                    WHEN duplicate_object THEN null;
                END $$;
            `);

            console.log('Migration completed: Created offer_status and offer_state enum types');
        } catch (error) {
            console.error('Create offer enums up script ran failed!:', error);
        }
    }

    async down(): Promise<void> {
        try {
            const datasource = this.offersRepository.dataSource;

            // Drop enum types
            await datasource.execute(`
                DROP TYPE IF EXISTS offer_status;
            `);

            await datasource.execute(`
                DROP TYPE IF EXISTS offer_state;
            `);

            console.log('Migration rolled back: Dropped offer enum types');
        } catch (error) {
            console.error('Create offer enums down script ran failed!:', error);
        }
    }
}
