import { MigrationScript, migrationScript } from 'loopback4-migration';
import * as juggler from '@loopback/repository';
import { inject } from '@loopback/core';

@migrationScript()
export class FixListingStatusStateConsistency implements MigrationScript {
    version = '2.0.15';
    scriptName = 'FixListingStatusStateConsistency';
    description =
        'Fix test listings: status/state consistency + add missing listing documents (feature/gallery images)';

    constructor(@inject('datasources.db') private dataSource: juggler.DataSource) {}

    async up(): Promise<void> {
        // Fix: state=pending listings should not be available — set status=pending
        const pendingFixed = await this.dataSource.execute(
            `UPDATE listings SET status = 'pending'
             WHERE state = 'pending' AND status NOT IN ('pending')
               AND (title LIKE '%For Sale%' OR title LIKE '%Wanted%')`,
        );
        console.log(`✓ Fixed ${pendingFixed.count ?? 0} listings: state=pending → status=pending`);

        // Fix: state=rejected listings should not be available — set status=rejected
        const rejectedFixed = await this.dataSource.execute(
            `UPDATE listings SET status = 'rejected'
             WHERE state = 'rejected' AND status NOT IN ('rejected')
               AND (title LIKE '%For Sale%' OR title LIKE '%Wanted%')`,
        );
        console.log(`✓ Fixed ${rejectedFixed.count ?? 0} listings: state=rejected → status=rejected`);

        // For approved listings, assign realistic status distribution
        // ~60% available, ~15% sold, ~15% expired, ~10% pending (awaiting buyer action)
        const approvedAvailable = await this.dataSource.execute(
            `SELECT id FROM listings
             WHERE state = 'approved' AND status = 'available'
               AND (title LIKE '%For Sale%' OR title LIKE '%Wanted%')
             ORDER BY id`,
        );

        if (approvedAvailable.length > 0) {
            const ids = approvedAvailable.map((r: { id: number }) => r.id);
            const soldCount = Math.floor(ids.length * 0.15);
            const expiredCount = Math.floor(ids.length * 0.15);

            const soldIds = ids.slice(0, soldCount);
            const expiredIds = ids.slice(soldCount, soldCount + expiredCount);
            // Remaining stay as available

            if (soldIds.length > 0) {
                await this.dataSource.execute(
                    `UPDATE listings SET status = 'sold' WHERE id = ANY($1::int[])`,
                    [soldIds],
                );
            }

            if (expiredIds.length > 0) {
                await this.dataSource.execute(
                    `UPDATE listings SET status = 'expired' WHERE id = ANY($1::int[])`,
                    [expiredIds],
                );
            }

            console.log(
                `✓ Distributed approved listings: ${ids.length - soldCount - expiredCount} available, ${soldCount} sold, ${expiredCount} expired`,
            );
        }

        // ──────────────────────────────────────────────
        // Create listing_documents (feature + gallery images) for test listings
        // Uses picsum.photos placeholder images so they render in the UI
        // ──────────────────────────────────────────────
        const testListings = await this.dataSource.execute(
            `SELECT l.id, l.material_item FROM listings l
             WHERE (l.title LIKE '%For Sale%' OR l.title LIKE '%Wanted%')
               AND l.id NOT IN (SELECT DISTINCT listing_id FROM listing_documents)`,
        );

        let docsCreated = 0;
        for (const listing of testListings) {
            // Feature image — unique per listing using listing id as seed
            await this.dataSource.execute(
                `INSERT INTO listing_documents (document_type, document_url, listing_id, created_at, updated_at)
                 VALUES ($1, $2, $3, NOW(), NOW())`,
                [
                    'feature_image',
                    `https://picsum.photos/seed/listing-${listing.id}/800/600`,
                    listing.id,
                ],
            );

            // 2 gallery images per listing
            for (let g = 1; g <= 2; g++) {
                await this.dataSource.execute(
                    `INSERT INTO listing_documents (document_type, document_url, listing_id, created_at, updated_at)
                     VALUES ($1, $2, $3, NOW(), NOW())`,
                    [
                        'gallery_image',
                        `https://picsum.photos/seed/listing-${listing.id}-gallery-${g}/800/600`,
                        listing.id,
                    ],
                );
            }

            // Material specification data sheet (1 per listing)
            await this.dataSource.execute(
                `INSERT INTO listing_documents (document_type, document_url, listing_id, created_at, updated_at)
                 VALUES ($1, $2, $3, NOW(), NOW())`,
                [
                    'material_specification_data',
                    `https://picsum.photos/seed/listing-${listing.id}-spec/800/600`,
                    listing.id,
                ],
            );

            docsCreated += 4;
        }
        console.log(`✓ Created ${docsCreated} listing documents (feature + gallery + spec) for ${testListings.length} listings`);

        // Summary
        const summary = await this.dataSource.execute(
            `SELECT state, status, COUNT(*)::int as count
             FROM listings
             WHERE title LIKE '%For Sale%' OR title LIKE '%Wanted%'
             GROUP BY state, status
             ORDER BY state, status`,
        );
        console.log('\n✓ Final listing state/status distribution:');
        for (const row of summary) {
            console.log(`  state=${row.state}, status=${row.status}: ${row.count}`);
        }
    }

    async down(): Promise<void> {
        // Remove listing documents for test listings
        await this.dataSource.execute(
            `DELETE FROM listing_documents
             WHERE listing_id IN (SELECT id FROM listings WHERE title LIKE '%For Sale%' OR title LIKE '%Wanted%')`,
        );
        console.log('✓ Removed listing documents for test listings');

        // Revert all test listings back to status=available (original state)
        await this.dataSource.execute(
            `UPDATE listings SET status = 'available'
             WHERE title LIKE '%For Sale%' OR title LIKE '%Wanted%'`,
        );
        console.log('✓ Reverted all test listings to status=available');
    }
}
