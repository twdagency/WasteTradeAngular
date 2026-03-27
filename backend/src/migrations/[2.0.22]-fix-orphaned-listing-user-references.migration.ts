import { MigrationScript, migrationScript } from 'loopback4-migration';
import { inject } from '@loopback/core';
import { juggler } from '@loopback/repository';

@migrationScript()
export class FixOrphanedListingUserReferencesMigration implements MigrationScript {
    version = '2.0.22';
    scriptName = 'FixOrphanedListingUserReferencesMigration';
    description = 'Reassign listings with non-existent created_by_user_id to an existing user from the same company';

    constructor(@inject('datasources.db') private dataSource: juggler.DataSource) {}

    async up(): Promise<void> {
        try {
            // Find orphaned listings (created_by_user_id references non-existent users)
            const orphaned: { id: number; created_by_user_id: number; company_id: number }[] =
                await this.dataSource.execute(`
                    SELECT l.id, l.created_by_user_id, l.company_id
                    FROM listings l
                    LEFT JOIN users u ON l.created_by_user_id = u.id
                    WHERE u.id IS NULL
                      AND l.company_id IS NOT NULL
                `);

            if (orphaned.length === 0) {
                console.log('[2.0.22] No orphaned listings found. Nothing to migrate.');
                return;
            }

            console.log(`[2.0.22] Found ${orphaned.length} orphaned listing(s). Reassigning...`);

            // Update orphaned listings: set created_by_user_id to the first active user from the same company
            const result = await this.dataSource.execute(`
                UPDATE listings l
                SET created_by_user_id = cu.user_id
                FROM (
                    SELECT DISTINCT ON (l2.id)
                        l2.id AS listing_id,
                        cu2.user_id
                    FROM listings l2
                    LEFT JOIN users u ON l2.created_by_user_id = u.id
                    INNER JOIN company_users cu2 ON l2.company_id = cu2.company_id
                    INNER JOIN users u2 ON cu2.user_id = u2.id
                    WHERE u.id IS NULL
                      AND l2.company_id IS NOT NULL
                    ORDER BY l2.id, cu2.is_primary_contact DESC NULLS LAST, cu2.id ASC
                ) cu
                WHERE l.id = cu.listing_id
            `);

            console.log(`[2.0.22] Reassigned orphaned listings to existing company users.`);

            // Log any remaining orphans (companies with no users at all)
            const remaining: { id: number; company_id: number }[] = await this.dataSource.execute(`
                SELECT l.id, l.company_id
                FROM listings l
                LEFT JOIN users u ON l.created_by_user_id = u.id
                WHERE u.id IS NULL
            `);

            if (remaining.length > 0) {
                console.warn(
                    `[2.0.22] WARNING: ${remaining.length} listing(s) still orphaned (company has no users):`,
                    remaining.map(r => `listing=${r.id} company=${r.company_id}`).join(', '),
                );
            }

            console.log('[2.0.22] Migration completed!');
        } catch (error) {
            console.error('[2.0.22] Migration failed:', error);
            throw error;
        }
    }

    async down(): Promise<void> {
        // This migration is not reversible because we don't store the original user IDs.
        // The original user IDs pointed to non-existent users anyway.
        console.log('[2.0.22] Down migration is a no-op (original user IDs were already invalid).');
    }
}
