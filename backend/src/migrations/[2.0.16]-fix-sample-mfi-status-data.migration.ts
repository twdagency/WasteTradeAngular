import { MigrationScript, migrationScript } from 'loopback4-migration';
import * as juggler from '@loopback/repository';
import { inject } from '@loopback/core';

/**
 * Migration: Fix sample_requests and mfi_requests status data.
 *
 * 1. Migrate any invalid/generic status values to valid detailed statuses
 * 2. Insert additional records ensuring ALL status values are represented
 *    - Sample: Sample Requested, Sample Approved, Sample Dispatched,
 *              Sample In Transit, Customs Cleared, Sample Delivered,
 *              Customer Feedback Requested, Feedback Provided, Cancelled
 *    - MFI: Awaiting Payment, Pending, Tested
 */
@migrationScript()
export class FixSampleMfiStatusData implements MigrationScript {
    version = '2.0.16';
    scriptName = 'FixSampleMfiStatusData';
    description = 'Fix invalid sample/mfi statuses and add data for all status values';

    constructor(@inject('datasources.db') private dataSource: juggler.DataSource) {}

    async up(): Promise<void> {
        // ──────────────────────────────────────────────
        // Step 1: Fix invalid sample_requests statuses
        // ──────────────────────────────────────────────
        const sampleStatusMap: Record<string, string> = {
            Unverified: 'Sample Requested',
            Verified: 'Sample Requested',
            'Awaiting Payment': 'Sample Requested',
            Pending: 'Sample Approved',
            Sent: 'Sample Dispatched',
            Received: 'Sample Delivered',
            Inactive: 'Cancelled',
            Blocked: 'Cancelled',
        };

        let samplesFixed = 0;
        for (const [oldStatus, newStatus] of Object.entries(sampleStatusMap)) {
            const result = await this.dataSource.execute(
                `UPDATE sample_requests SET status = $1 WHERE status = $2`,
                [newStatus, oldStatus],
            );
            samplesFixed += result.count ?? 0;
        }
        console.log(`✓ Fixed ${samplesFixed} sample_requests with invalid statuses`);

        // ──────────────────────────────────────────────
        // Step 2: Fix invalid mfi_requests statuses
        // ──────────────────────────────────────────────
        const mfiStatusMap: Record<string, string> = {
            Unverified: 'Awaiting Payment',
            Verified: 'Awaiting Payment',
            Inactive: 'Pending',
            Blocked: 'Pending',
            Sent: 'Pending',
            Received: 'Tested',
            Cancelled: 'Pending',
        };

        let mfiFixed = 0;
        for (const [oldStatus, newStatus] of Object.entries(mfiStatusMap)) {
            const result = await this.dataSource.execute(
                `UPDATE mfi_requests SET status = $1 WHERE status = $2`,
                [newStatus, oldStatus],
            );
            mfiFixed += result.count ?? 0;
        }
        console.log(`✓ Fixed ${mfiFixed} mfi_requests with invalid statuses`);

        // ──────────────────────────────────────────────
        // Step 3: Check which statuses are missing and add records
        // ──────────────────────────────────────────────
        const allSampleStatuses = [
            'Sample Requested',
            'Sample Approved',
            'Sample Dispatched',
            'Sample In Transit',
            'Customs Cleared',
            'Sample Delivered',
            'Customer Feedback Requested',
            'Feedback Provided',
            'Cancelled',
        ];

        const allMfiStatuses = ['Awaiting Payment', 'Pending', 'Tested'];

        // Get existing status counts
        const existingSampleStatuses = await this.dataSource.execute(
            `SELECT status, COUNT(*)::int as count FROM sample_requests GROUP BY status`,
        );
        const existingMfiStatuses = await this.dataSource.execute(
            `SELECT status, COUNT(*)::int as count FROM mfi_requests GROUP BY status`,
        );

        const sampleStatusCounts = new Map<string, number>(
            existingSampleStatuses.map((r: { status: string; count: number }) => [r.status, r.count]),
        );
        const mfiStatusCounts = new Map<string, number>(
            existingMfiStatuses.map((r: { status: string; count: number }) => [r.status, r.count]),
        );

        console.log('\nExisting sample status counts:', Object.fromEntries(sampleStatusCounts));
        console.log('Existing MFI status counts:', Object.fromEntries(mfiStatusCounts));

        // Get valid listing/user/company IDs to reference
        const listings = await this.dataSource.execute(
            `SELECT id FROM listings ORDER BY id LIMIT 20`,
        );
        const users = await this.dataSource.execute(
            `SELECT id FROM users WHERE id > 1 ORDER BY id LIMIT 30`,
        );

        if (listings.length < 2 || users.length < 4) {
            console.log('⚠ Not enough listings/users to create additional records, skipping');
            return;
        }

        // Get company IDs for users
        const companyUsers = await this.dataSource.execute(
            `SELECT cu.user_id, cu.company_id FROM company_users cu
             WHERE cu.user_id = ANY($1::int[])
             ORDER BY cu.user_id LIMIT 30`,
            [users.map((u: { id: number }) => u.id)],
        );
        const userCompanyMap = new Map<number, number>(
            companyUsers.map((cu: { user_id: number; company_id: number }) => [cu.user_id, cu.company_id]),
        );

        // Helper: pick a buyer/seller pair
        const pickPair = (index: number) => {
            const buyerIdx = index % users.length;
            let sellerIdx = (index + 1) % users.length;
            if (sellerIdx === buyerIdx) sellerIdx = (sellerIdx + 1) % users.length;
            const buyerUser_Id = users[buyerIdx].id;
            const sellerUser_Id = users[sellerIdx].id;
            return {
                buyerUser_Id,
                buyerCompany_Id: userCompanyMap.get(buyerUser_Id) ?? 1,
                sellerUser_Id,
                sellerCompany_Id: userCompanyMap.get(sellerUser_Id) ?? 2,
                listingId: listings[index % listings.length].id,
            };
        };

        // ──────────────────────────────────────────────
        // Step 4: Insert sample_requests for missing/underrepresented statuses
        // ──────────────────────────────────────────────
        const MIN_PER_STATUS = 3;
        let sampleInserted = 0;

        for (const status of allSampleStatuses) {
            const current = sampleStatusCounts.get(status) ?? 0;
            const toAdd = Math.max(0, MIN_PER_STATUS - current);

            for (let i = 0; i < toAdd; i++) {
                const pair = pickPair(sampleInserted + i);
                const createdAt = new Date(Date.now() - (30 + i * 5) * 24 * 60 * 60 * 1000);
                const isSent = [
                    'Sample Dispatched',
                    'Sample In Transit',
                    'Customs Cleared',
                    'Sample Delivered',
                    'Customer Feedback Requested',
                    'Feedback Provided',
                ].includes(status);
                const isReceived = [
                    'Sample Delivered',
                    'Customer Feedback Requested',
                    'Feedback Provided',
                ].includes(status);

                await this.dataSource.execute(
                    `INSERT INTO sample_requests (
                        listing_id, buyer_user_id, buyer_company_id,
                        seller_user_id, seller_company_id,
                        number_of_samples, sample_size, buyer_message,
                        status, sent_date, received_date, created_at, updated_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW())`,
                    [
                        pair.listingId,
                        pair.buyerUser_Id,
                        pair.buyerCompany_Id,
                        pair.sellerUser_Id,
                        pair.sellerCompany_Id,
                        Math.floor(Math.random() * 5) + 1,
                        ['500g', '1kg', '2kg', '5kg', '10kg'][Math.floor(Math.random() * 5)],
                        `Sample request for testing - ${status}`,
                        status,
                        isSent ? new Date(createdAt.getTime() + 3 * 24 * 60 * 60 * 1000) : null,
                        isReceived ? new Date(createdAt.getTime() + 10 * 24 * 60 * 60 * 1000) : null,
                        createdAt,
                    ],
                );
                sampleInserted++;
            }
        }
        console.log(`✓ Inserted ${sampleInserted} additional sample_requests to fill missing statuses`);

        // ──────────────────────────────────────────────
        // Step 5: Insert mfi_requests for missing/underrepresented statuses
        // ──────────────────────────────────────────────
        let mfiInserted = 0;

        for (const status of allMfiStatuses) {
            const current = mfiStatusCounts.get(status) ?? 0;
            const toAdd = Math.max(0, MIN_PER_STATUS - current);

            for (let i = 0; i < toAdd; i++) {
                const pair = pickPair(mfiInserted + i + 20);
                const createdAt = new Date(Date.now() - (30 + i * 5) * 24 * 60 * 60 * 1000);
                const isTested = status === 'Tested';

                await this.dataSource.execute(
                    `INSERT INTO mfi_requests (
                        listing_id, buyer_user_id, buyer_company_id,
                        seller_user_id, seller_company_id,
                        buyer_message, status, tested_date, mfi_result,
                        created_at, updated_at
                    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW())`,
                    [
                        pair.listingId,
                        pair.buyerUser_Id,
                        pair.buyerCompany_Id,
                        pair.sellerUser_Id,
                        pair.sellerCompany_Id,
                        `MFI test request - ${status}`,
                        status,
                        isTested ? new Date(createdAt.getTime() + 7 * 24 * 60 * 60 * 1000) : null,
                        isTested ? Math.round((Math.random() * 50 + 1) * 100) / 100 : null,
                        createdAt,
                    ],
                );
                mfiInserted++;
            }
        }
        console.log(`✓ Inserted ${mfiInserted} additional mfi_requests to fill missing statuses`);

        // ──────────────────────────────────────────────
        // Summary
        // ──────────────────────────────────────────────
        const finalSample = await this.dataSource.execute(
            `SELECT status, COUNT(*)::int as count FROM sample_requests GROUP BY status ORDER BY status`,
        );
        const finalMfi = await this.dataSource.execute(
            `SELECT status, COUNT(*)::int as count FROM mfi_requests GROUP BY status ORDER BY status`,
        );

        console.log('\n✓ Final sample_requests status distribution:');
        for (const row of finalSample) {
            console.log(`  ${row.status}: ${row.count}`);
        }
        console.log('\n✓ Final mfi_requests status distribution:');
        for (const row of finalMfi) {
            console.log(`  ${row.status}: ${row.count}`);
        }
    }

    async down(): Promise<void> {
        // Remove records added by this migration (identified by buyer_message pattern)
        await this.dataSource.execute(
            `DELETE FROM sample_requests WHERE buyer_message LIKE 'Sample request for testing -%'`,
        );
        await this.dataSource.execute(
            `DELETE FROM mfi_requests WHERE buyer_message LIKE 'MFI test request -%'`,
        );
        console.log('✓ Removed records added by [2.0.16] migration');
    }
}
