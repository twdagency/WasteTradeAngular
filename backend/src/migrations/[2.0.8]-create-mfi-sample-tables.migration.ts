import { MigrationScript, migrationScript } from 'loopback4-migration';
import * as juggler from '@loopback/repository';
import { inject } from '@loopback/core';

@migrationScript()
export class CreateMfiSampleTables implements MigrationScript {
    version = '2.0.8';
    scriptName = 'CreateMfiSampleTables';
    description = 'Create mfi_requests and sample_requests tables with correct schema';

    constructor(@inject('datasources.db') private dataSource: juggler.DataSource) {}

    async up(): Promise<void> {
        // Drop tables if they exist
        await this.dataSource.execute('DROP TABLE IF EXISTS mfi_requests CASCADE');
        await this.dataSource.execute('DROP TABLE IF EXISTS sample_requests CASCADE');

        // Create mfi_requests table
        await this.dataSource.execute(`
            CREATE TABLE mfi_requests (
                id SERIAL PRIMARY KEY,
                listing_id INTEGER NOT NULL,
                buyer_user_id INTEGER NOT NULL,
                buyer_company_id INTEGER NOT NULL,
                seller_user_id INTEGER NOT NULL,
                seller_company_id INTEGER NOT NULL,
                assigned_admin_id INTEGER,
                buyer_message TEXT,
                status VARCHAR(50) NOT NULL,
                tested_date TIMESTAMP,
                mfi_result DOUBLE PRECISION,
                is_synced_salesforce BOOLEAN DEFAULT FALSE,
                last_synced_salesforce_date TIMESTAMP,
                salesforce_id VARCHAR(50),
                admin_note JSONB,
                assign_admin JSONB,
                created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP NOT NULL DEFAULT NOW()
            )
        `);

        // Create sample_requests table
        await this.dataSource.execute(`
            CREATE TABLE sample_requests (
                id SERIAL PRIMARY KEY,
                listing_id INTEGER NOT NULL,
                buyer_user_id INTEGER NOT NULL,
                buyer_company_id INTEGER NOT NULL,
                seller_user_id INTEGER NOT NULL,
                seller_company_id INTEGER NOT NULL,
                assigned_admin_id INTEGER,
                number_of_samples INTEGER NOT NULL,
                sample_size VARCHAR(50) NOT NULL,
                buyer_message TEXT,
                status VARCHAR(50) NOT NULL,
                sent_date TIMESTAMP,
                received_date TIMESTAMP,
                postage_label_url VARCHAR(500),
                is_synced_salesforce BOOLEAN DEFAULT FALSE,
                last_synced_salesforce_date TIMESTAMP,
                salesforce_id VARCHAR(50),
                admin_note JSONB,
                assign_admin JSONB,
                created_at TIMESTAMP NOT NULL DEFAULT NOW(),
                updated_at TIMESTAMP NOT NULL DEFAULT NOW()
            )
        `);

        console.log('✓ Created mfi_requests and sample_requests tables');
    }

    async down(): Promise<void> {
        await this.dataSource.execute('DROP TABLE IF EXISTS mfi_requests CASCADE');
        await this.dataSource.execute('DROP TABLE IF EXISTS sample_requests CASCADE');
        console.log('✓ Dropped mfi_requests and sample_requests tables');
    }
}
