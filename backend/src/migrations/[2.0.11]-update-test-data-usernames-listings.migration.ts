import { MigrationScript, migrationScript } from 'loopback4-migration';
import * as juggler from '@loopback/repository';
import { inject } from '@loopback/core';

@migrationScript()
export class UpdateTestDataUsernamesListings implements MigrationScript {
    version = '2.0.11';
    scriptName = 'UpdateTestDataUsernamesListings';
    description = 'Update test user usernames to 8-digit numbers and add missing listing fields';

    constructor(@inject('datasources.db') private dataSource: juggler.DataSource) {}

    async up(): Promise<void> {
        // Update test user usernames to 8-digit random numbers
        const users = await this.dataSource.execute(
            `SELECT id FROM users WHERE email LIKE '%@yopmail.com' ORDER BY id`
        );

        for (const user of users) {
            const randomUsername = Math.floor(Math.random() * 90000000) + 10000000; // 10000000 to 99999999
            await this.dataSource.execute(
                `UPDATE users SET username = $1 WHERE id = $2`,
                [randomUsername.toString(), user.id]
            );
        }

        console.log(`✓ Updated ${users.length} test user usernames to 8-digit numbers`);

        // Update listings with missing fields
        const listings = await this.dataSource.execute(
            `SELECT id FROM listings WHERE title LIKE '%For Sale%' OR title LIKE '%Wanted%'`
        );

        const colors = ['natural', 'black', 'white', 'blue', 'grey'];
        const finishings = ['baled', 'flakes', 'regrind', 'powder', 'sheets'];
        const packings = ['bales', 'bags', 'loose', 'pallets', 'bulk_bags'];
        const currencies = ['gbp', 'eur', 'usd'];
        const incoterms = ['EXW', 'FOB', 'CIF', 'DAP', 'DDP'];
        const states = ['approved', 'pending'];

        for (const listing of listings) {
            const randomColor = colors[Math.floor(Math.random() * colors.length)];
            const randomFinishing = finishings[Math.floor(Math.random() * finishings.length)];
            const randomPacking = packings[Math.floor(Math.random() * packings.length)];
            const randomCurrency = currencies[Math.floor(Math.random() * currencies.length)];
            const randomIncoterm = incoterms[Math.floor(Math.random() * incoterms.length)];
            const randomState = states[Math.floor(Math.random() * states.length)];
            const weightPerLoad = Math.floor(Math.random() * 1500) + 500; // 500-2000
            const pricePerMetricTonne = Math.floor(Math.random() * 900) + 100; // 100-1000
            const isFeatured = Math.random() > 0.7;
            const isUrgent = Math.random() > 0.8;

            await this.dataSource.execute(
                `UPDATE listings SET 
                    material_color = $1,
                    material_finishing = $2,
                    material_packing = $3,
                    weight_per_load = $4,
                    price_per_metric_tonne = $5,
                    currency = $6,
                    incoterms = $7,
                    state = $8,
                    is_featured = $9,
                    is_urgent = $10,
                    weight_unit = 'kg'
                WHERE id = $11`,
                [
                    randomColor,
                    randomFinishing,
                    randomPacking,
                    weightPerLoad,
                    pricePerMetricTonne,
                    randomCurrency,
                    randomIncoterm,
                    randomState,
                    isFeatured,
                    isUrgent,
                    listing.id
                ]
            );
        }

        console.log(`✓ Updated ${listings.length} listings with missing fields`);
    }

    async down(): Promise<void> {
        console.log('⚠ Rollback not implemented - test data changes are non-critical');
    }
}
