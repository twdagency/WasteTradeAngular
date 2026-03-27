import { MigrationScript, migrationScript } from 'loopback4-migration';
import { inject } from '@loopback/core';
import { juggler } from '@loopback/repository';

@migrationScript()
export class InsertSampleMfiRequestsData implements MigrationScript {
    version = '2.0.3';
    scriptName = 'InsertSampleMfiRequestsData';
    description = 'Insert 12 sample records each for sample_requests and mfi_requests tables';

    constructor(@inject('datasources.db') private dataSource: juggler.DataSource) {}

    async up(): Promise<void> {
        try {
            console.log('Starting migration: Insert sample and MFI requests data...');

            // Check if tables exist
            const tablesExist = await this.dataSource.execute(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'sample_requests'
                ) as sample_exists,
                EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'mfi_requests'
                ) as mfi_exists
            `);

            if (!tablesExist[0].sample_exists || !tablesExist[0].mfi_exists) {
                console.log('Tables do not exist yet. They will be created by LoopBack auto-migration.');
                console.log('Skipping data insertion for now. Run this migration again after tables are created.');
                return;
            }

            // Delete existing sample data if any
            console.log('Deleting existing sample and MFI requests data...');
            await this.dataSource.execute('DELETE FROM sample_requests');
            await this.dataSource.execute('DELETE FROM mfi_requests');
            console.log('Existing data deleted.');

            // Insert 12 sample records for sample_requests with complete data
            console.log('Inserting sample data for sample_requests...');
            await this.dataSource.execute(`
                INSERT INTO sample_requests (
                    listing_id, buyer_user_id, buyer_company_id, buyer_location, buyer_country,
                    seller_user_id, seller_company_id, seller_location, seller_country,
                    number_of_samples, sample_size, buyer_message, status, sent_date, received_date, material_name, created_at
                ) VALUES
                (1, 2, 2, 'London', 'United Kingdom', 3, 3, 'Manchester', 'United Kingdom', 2, '1kg', 'Please send samples for quality testing', 'Sample Delivered', '2024-12-01', '2024-12-10', 'NON-FERROUS - STAINLESS STEEL 304', '2024-11-25'),
                (2, 4, 4, 'Berlin', 'Germany', 5, 5, 'Hamburg', 'Germany', 3, '5kg', 'Need samples urgently for production approval', 'Sample In Transit', '2024-12-15', '2024-12-22', 'PLASTICS - HDPE', '2024-12-10'),
                (3, 6, 6, 'Paris', 'France', 7, 7, 'Lyon', 'France', 1, '2kg', 'Requesting sample for material analysis', 'Sample Approved', '2024-12-19', '2024-12-25', 'PLASTICS - PP', '2024-12-18'),
                (4, 8, 8, 'Amsterdam', 'Netherlands', 9, 9, 'Rotterdam', 'Netherlands', 4, '10kg', 'Testing for new product line', 'Sample Dispatched', '2024-12-20', '2024-12-28', 'FERROUS - STEEL SCRAP', '2024-12-15'),
                (5, 10, 10, 'Brussels', 'Belgium', 11, 11, 'Antwerp', 'Belgium', 2, '3kg', 'Sample needed for quality verification', 'Sample Requested', '2024-12-21', '2024-12-29', 'PLASTICS - PET', '2024-12-20'),
                (6, 12, 12, 'Madrid', 'Spain', 13, 13, 'Barcelona', 'Spain', 5, '1kg', 'Quality check required before bulk order', 'Customs Cleared', '2024-12-05', '2024-12-12', 'NON-FERROUS - ALUMINIUM', '2024-11-30'),
                (7, 14, 14, 'Rome', 'Italy', 15, 15, 'Milan', 'Italy', 1, '500g', 'Small sample for initial testing', 'Feedback Provided', '2024-11-20', '2024-11-28', 'PLASTICS - LDPE', '2024-11-15'),
                (8, 16, 16, 'Vienna', 'Austria', 17, 17, 'Salzburg', 'Austria', 3, '2kg', 'Urgent sample needed for client presentation', 'Sample Delivered', '2024-12-08', '2024-12-16', 'NON-FERROUS - COPPER', '2024-12-05'),
                (9, 18, 18, 'Warsaw', 'Poland', 19, 19, 'Krakow', 'Poland', 2, '5kg', 'Sample for compliance testing', 'Customer Feedback Requested', '2024-12-12', '2024-12-18', 'PLASTICS - PVC', '2024-12-08'),
                (10, 20, 20, 'Stockholm', 'Sweden', 21, 21, 'Gothenburg', 'Sweden', 1, '1kg', 'Testing material properties for R&D', 'Sample Approved', '2024-12-20', '2024-12-26', 'FERROUS - CAST IRON', '2024-12-19'),
                (11, 22, 22, 'Copenhagen', 'Denmark', 23, 23, 'Aarhus', 'Denmark', 4, '3kg', 'Multiple samples for comparative analysis', 'Sample Requested', '2024-12-22', '2024-12-30', 'NON-FERROUS - BRASS', '2024-12-21'),
                (12, 24, 24, 'Helsinki', 'Finland', 25, 25, 'Espoo', 'Finland', 2, '2kg', 'Need for quality assurance before contract', 'Sample Dispatched', '2024-12-22', '2024-12-29', 'PLASTICS - ABS', '2024-12-20')
            `);

            const insertedSamples = await this.dataSource.execute('SELECT COUNT(*) as count FROM sample_requests');
            console.log(`Inserted ${insertedSamples[0].count} sample request records`);

            // Insert 12 sample records for mfi_requests with complete data
            console.log('Inserting sample data for mfi_requests...');
            await this.dataSource.execute(`
                INSERT INTO mfi_requests (
                    listing_id, buyer_user_id, buyer_company_id, buyer_location, buyer_country,
                    seller_user_id, seller_company_id, seller_location, seller_country,
                    buyer_message, status, tested_date, mfi_result, material_name, created_at
                ) VALUES
                (1, 2, 2, 'London', 'United Kingdom', 3, 3, 'Manchester', 'United Kingdom', 'Need MFI test for plastic material quality verification', 'Tested', '2024-12-10', 2.5, 'PLASTICS - HDPE', '2024-11-25'),
                (2, 4, 4, 'Berlin', 'Germany', 5, 5, 'Hamburg', 'Germany', 'Requesting MFI testing for material specification', 'Pending', '2024-12-25', 3.1, 'PLASTICS - PP', '2024-12-10'),
                (3, 6, 6, 'Paris', 'France', 7, 7, 'Lyon', 'France', 'Urgent MFI testing required for production approval', 'Tested', '2024-12-18', 3.2, 'PLASTICS - LDPE', '2024-12-15'),
                (4, 8, 8, 'Amsterdam', 'Netherlands', 9, 9, 'Rotterdam', 'Netherlands', 'MFI test needed for compliance documentation', 'Awaiting Payment', '2024-12-27', 2.8, 'PLASTICS - PET', '2024-12-18'),
                (5, 10, 10, 'Brussels', 'Belgium', 11, 11, 'Antwerp', 'Belgium', 'Testing for quality control and certification', 'Tested', '2024-12-20', 1.8, 'PLASTICS - PVC', '2024-12-12'),
                (6, 12, 12, 'Madrid', 'Spain', 13, 13, 'Barcelona', 'Spain', 'MFI analysis for material grade verification', 'Pending', '2024-12-28', 4.2, 'PLASTICS - PS', '2024-12-16'),
                (7, 14, 14, 'Rome', 'Italy', 15, 15, 'Milan', 'Italy', 'MFI test for new batch quality assurance', 'Tested', '2024-11-28', 4.1, 'PLASTICS - ABS', '2024-11-20'),
                (8, 16, 16, 'Vienna', 'Austria', 17, 17, 'Salzburg', 'Austria', 'Standard MFI testing for material properties', 'Awaiting Payment', '2024-12-30', 3.7, 'PLASTICS - PMMA', '2024-12-19'),
                (9, 18, 18, 'Warsaw', 'Poland', 19, 19, 'Krakow', 'Poland', 'Quality verification needed for bulk purchase', 'Tested', '2024-12-18', 2.9, 'PLASTICS - PC', '2024-12-10'),
                (10, 20, 20, 'Stockholm', 'Sweden', 21, 21, 'Gothenburg', 'Sweden', 'MFI testing for R&D material evaluation', 'Pending', '2024-12-29', 2.3, 'PLASTICS - PA', '2024-12-20'),
                (11, 22, 22, 'Copenhagen', 'Denmark', 23, 23, 'Aarhus', 'Denmark', 'Standard MFI testing for quality certification', 'Tested', '2024-12-22', 3.5, 'PLASTICS - POM', '2024-12-18'),
                (12, 24, 24, 'Helsinki', 'Finland', 25, 25, 'Espoo', 'Finland', 'MFI test required for material specification sheet', 'Awaiting Payment', '2024-12-31', 3.9, 'PLASTICS - TPU', '2024-12-21')
            `);

            const insertedMfi = await this.dataSource.execute('SELECT COUNT(*) as count FROM mfi_requests');
            console.log(`Inserted ${insertedMfi[0].count} MFI request records`);

            console.log('Sample and MFI requests data migration completed successfully!');
        } catch (error) {
            console.error('Error during migration:', error);
            throw error;
        }
    }

    async down(): Promise<void> {
        try {
            console.log('Starting rollback: Remove sample and MFI requests data...');

            // Delete all sample data (assuming these are the only records with IDs 1-12)
            await this.dataSource.execute('DELETE FROM sample_requests WHERE id <= 12');
            await this.dataSource.execute('DELETE FROM mfi_requests WHERE id <= 12');

            console.log('Rollback completed successfully!');
        } catch (error) {
            console.error('Error during rollback:', error);
            throw error;
        }
    }
}
