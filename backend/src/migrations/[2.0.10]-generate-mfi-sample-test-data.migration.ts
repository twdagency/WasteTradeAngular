import { MigrationScript, migrationScript } from 'loopback4-migration';
import { service } from '@loopback/core';
import { TestDataService } from '../services';

@migrationScript()
export class GenerateMfiSampleTestData implements MigrationScript {
    version = '2.0.10';
    scriptName = 'GenerateMfiSampleTestData';
    description = 'Generate test users, companies, listings, and MFI/Sample requests with realistic data';

    constructor(@service(TestDataService) private testDataService: TestDataService) {}

    async up(): Promise<void> {
        try {
            console.log('Starting test data generation...');

            const users = await this.testDataService.createTestUsers(30);
            console.log(`✓ Created ${users.length} users`);

            const companies = await this.testDataService.createTestCompanies(10);
            console.log(`✓ Created ${companies.length} companies`);

            const listings = await this.testDataService.createTestListings(20, users, companies);
            console.log(`✓ Created ${listings.length} listings`);

            const mfiRequests = await this.testDataService.createMfiRequests(100, users, companies, listings);
            console.log(`✓ Created ${mfiRequests.length} MFI requests`);

            const sampleRequests = await this.testDataService.createSampleRequests(100, users, companies, listings);
            console.log(`✓ Created ${sampleRequests.length} Sample requests`);

            console.log('\n✓ Test data generation complete!');
            console.log(`  - ${users.length} users (password: Test123!)`);
            console.log(`  - ${companies.length} companies`);
            console.log(`  - ${listings.length} listings`);
            console.log(`  - ${mfiRequests.length} MFI requests`);
            console.log(`  - ${sampleRequests.length} Sample requests`);
        } catch (error) {
            console.error('Error generating test data:', error);
            throw error;
        }
    }

    async down(): Promise<void> {
        try {
            console.log('Rolling back test data...');
            await this.testDataService.cleanupTestData();
            console.log('✓ Rollback complete');
        } catch (error) {
            console.error('Error during rollback:', error);
            throw error;
        }
    }
}
