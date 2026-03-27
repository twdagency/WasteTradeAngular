import { MigrationScript, migrationScript } from 'loopback4-migration';
import * as juggler from '@loopback/repository';
import { inject } from '@loopback/core';

/**
 * Rename @belongsTo auto-generated columns from LoopBack default (lowercase, no underscore)
 * to explicit snake_case to match the rest of the schema.
 *
 * e.g. `userid` → `user_id`, `companyid` → `company_id`
 */
@migrationScript()
export class RenameBelongsToColumnsToSnakeCase implements MigrationScript {
    version = '2.0.17';
    scriptName = 'RenameBelongsToColumnsToSnakeCase';
    description = 'Rename @belongsTo columns from camelCase-lowered to snake_case';

    constructor(@inject('datasources.db') private dataSource: juggler.DataSource) {}

    private readonly renames: Array<{ table: string; from: string; to: string }> = [
        { table: 'company_users', from: 'companyid', to: 'company_id' },
        { table: 'company_users', from: 'userid', to: 'user_id' },
        { table: 'company_locations', from: 'companyid', to: 'company_id' },
        { table: 'company_documents', from: 'companyid', to: 'company_id' },
        { table: 'company_location_documents', from: 'companylocationid', to: 'company_location_id' },
        { table: 'company_user_requests', from: 'companyid', to: 'company_id' },
        { table: 'company_user_requests', from: 'userid', to: 'user_id' },
        { table: 'material_users', from: 'materialid', to: 'material_id' },
        { table: 'material_users', from: 'userid', to: 'user_id' },
        { table: 'listing_requests', from: 'listingid', to: 'listing_id' },
        { table: 'listing_documents', from: 'listingid', to: 'listing_id' },
        { table: 'haulage_loads', from: 'haulageofferid', to: 'haulage_offer_id' },
        { table: 'haulage_offer_documents', from: 'haulageofferid', to: 'haulage_offer_id' },
    ];

    async up(): Promise<void> {
        // Rename ListingRequest table to listing_requests (match snake_case convention)
        // Check both PascalCase and lowercase variants (PostgreSQL may store either)
        try {
            const lowerCheck = await this.dataSource.execute(
                `SELECT table_name FROM information_schema.tables
                 WHERE table_schema = 'public' AND table_name = 'listingrequest'`,
            );

            if (lowerCheck.length > 0) {
                await this.dataSource.execute(`ALTER TABLE "listingrequest" RENAME TO "listing_requests"`);
                console.log('✓ Renamed table listingrequest → listing_requests');
            } else {
                console.log('⊘ ListingRequest table not found (may already be renamed)');
            }
        } catch (err: any) {
            if (err.code === '42P07') {
                console.log('⊘ listing_requests already exists, skipping table rename');
            } else {
                throw err;
            }
        }

        for (const { table, from, to } of this.renames) {
            try {
                const [oldCol, newCol] = await Promise.all([
                    this.dataSource.execute(
                        `SELECT column_name FROM information_schema.columns
                         WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2`,
                        [table, from],
                    ),
                    this.dataSource.execute(
                        `SELECT column_name FROM information_schema.columns
                         WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2`,
                        [table, to],
                    ),
                ]);

                const oldExists = oldCol.length > 0;
                const newExists = newCol.length > 0;

                if (oldExists && newExists) {
                    // Both exist (autoupdate created new column). Copy data, verify, drop old.
                    // All in a transaction so partial failure won't lose data.
                    await this.dataSource.execute('BEGIN');
                    try {
                        await this.dataSource.execute(
                            `UPDATE "${table}" SET "${to}" = "${from}" WHERE "${to}" IS NULL AND "${from}" IS NOT NULL`,
                        );
                        // Verify no data left only in old column
                        const lostCheck = await this.dataSource.execute(
                            `SELECT COUNT(*)::int as cnt FROM "${table}" WHERE "${from}" IS NOT NULL AND "${to}" IS NULL`,
                        );
                        if (lostCheck[0].cnt > 0) {
                            throw new Error(`${table}: ${lostCheck[0].cnt} rows would lose data — aborting`);
                        }
                        await this.dataSource.execute(
                            `ALTER TABLE "${table}" DROP COLUMN "${from}"`,
                        );
                        await this.dataSource.execute('COMMIT');
                    } catch (txErr) {
                        await this.dataSource.execute('ROLLBACK');
                        throw txErr;
                    }
                    console.log(`✓ ${table}: copied ${from} → ${to}, dropped ${from}`);
                } else if (oldExists && !newExists) {
                    // Only old exists. Copy to new column instead of rename to avoid
                    // race condition with autoupdate which may create the new column.
                    const colType = await this.dataSource.execute(
                        `SELECT data_type, character_maximum_length FROM information_schema.columns
                         WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2`,
                        [table, from],
                    );
                    const dtype = colType[0].character_maximum_length
                        ? `${colType[0].data_type}(${colType[0].character_maximum_length})`
                        : colType[0].data_type;
                    await this.dataSource.execute('BEGIN');
                    try {
                        await this.dataSource.execute(
                            `ALTER TABLE "${table}" ADD COLUMN "${to}" ${dtype}`,
                        );
                        await this.dataSource.execute(
                            `UPDATE "${table}" SET "${to}" = "${from}"`,
                        );
                        // Verify all data copied before dropping old column
                        const lostCheck = await this.dataSource.execute(
                            `SELECT COUNT(*)::int as cnt FROM "${table}" WHERE "${from}" IS NOT NULL AND "${to}" IS NULL`,
                        );
                        if (lostCheck[0].cnt > 0) {
                            throw new Error(`${table}: ${lostCheck[0].cnt} rows would lose data — aborting`);
                        }
                        await this.dataSource.execute(
                            `ALTER TABLE "${table}" DROP COLUMN "${from}"`,
                        );
                        await this.dataSource.execute('COMMIT');
                    } catch (txErr) {
                        await this.dataSource.execute('ROLLBACK');
                        throw txErr;
                    }
                    console.log(`✓ ${table}: copied ${from} → ${to} (${dtype}), dropped ${from}`);
                } else if (!oldExists && newExists) {
                    // New column exists but old doesn't. Check if new column has NULL data
                    // which indicates autoupdate created it empty and dropped/ignored old column.
                    const nullCheck = await this.dataSource.execute(
                        `SELECT COUNT(*)::int as total,
                                COUNT(CASE WHEN "${to}" IS NULL THEN 1 END)::int as nulls
                         FROM "${table}"`,
                    );
                    if (nullCheck[0].total > 0 && nullCheck[0].nulls === nullCheck[0].total) {
                        console.log(`⚠ ${table}: ${to} exists but ALL ${nullCheck[0].total} rows are NULL — data may have been lost by autoupdate`);
                    } else {
                        console.log(`⊘ ${table}: ${to} already exists with data, skipping`);
                    }
                } else {
                    console.log(`⚠ ${table}: neither ${from} nor ${to} found`);
                }
            } catch (err) {
                console.error(`✗ ${table}: failed ${from} → ${to}:`, err);
                throw err;
            }
        }
    }

    async down(): Promise<void> {
        // Reverse: rename snake_case back to lowercase
        // Revert table rename
        const tableCheck = await this.dataSource.execute(
            `SELECT table_name FROM information_schema.tables
             WHERE table_schema = 'public' AND table_name = 'listing_requests'`,
        );
        if (tableCheck.length > 0) {
            await this.dataSource.execute(`ALTER TABLE "listing_requests" RENAME TO "listingrequest"`);
            console.log('✓ Reverted table listing_requests → listingrequest');
        }

        for (const { table, from, to } of this.renames) {
            try {
                const colCheck = await this.dataSource.execute(
                    `SELECT column_name FROM information_schema.columns
                     WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2`,
                    [table, to],
                );

                if (colCheck.length > 0) {
                    await this.dataSource.execute(
                        `ALTER TABLE "${table}" RENAME COLUMN "${to}" TO "${from}"`,
                    );
                    console.log(`✓ ${table}: ${to} → ${from} (reverted)`);
                }
            } catch (err) {
                console.error(`✗ ${table}: failed to revert ${to} → ${from}:`, err);
                throw err;
            }
        }
    }
}
