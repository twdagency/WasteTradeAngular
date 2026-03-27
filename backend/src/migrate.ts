// Copyright IBM Corp. 2018,2019. All Rights Reserved.
// Node module: @loopback/example-todo
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import { WasteTradeApplication } from './application';

/**
 * Pre-migration: copy data from old @belongsTo columns to new snake_case columns
 * BEFORE autoupdate drops the old ones. Autoupdate (migrateSchema with 'alter')
 * drops columns not present in the model, so we must copy/rename first.
 *
 * Usage: uncomment or add entries to `renames` when adding new @belongsTo columnName mappings.
 */
async function preMigrateBelongsToColumns(app: WasteTradeApplication) {
    const ds = await app.get<any>('datasources.db');

    // Add new @belongsTo column renames here before running pnpm migrate.
    const renames: Array<{ table: string; from: string; to: string }> = [
        // { table: 'example_table', from: 'oldcolumn', to: 'new_column' },
    ];

    for (const { table, from, to } of renames) {
        try {
            const [oldCol, newCol] = await Promise.all([
                ds.execute(
                    `SELECT column_name FROM information_schema.columns
                     WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2`,
                    [table, from],
                ),
                ds.execute(
                    `SELECT column_name FROM information_schema.columns
                     WHERE table_schema = 'public' AND table_name = $1 AND column_name = $2`,
                    [table, to],
                ),
            ]);

            const oldExists = oldCol.length > 0;
            const newExists = newCol.length > 0;

            if (oldExists && newExists) {
                // Both exist — copy data from old to new before autoupdate drops old
                await ds.execute(
                    `UPDATE "${table}" SET "${to}" = "${from}" WHERE "${to}" IS NULL AND "${from}" IS NOT NULL`,
                );
                console.log(`[pre-migrate] ✓ ${table}: copied ${from} → ${to}`);
            } else if (oldExists && !newExists) {
                // Only old exists — rename it so autoupdate won't drop it
                await ds.execute(
                    `ALTER TABLE "${table}" RENAME COLUMN "${from}" TO "${to}"`,
                );
                console.log(`[pre-migrate] ✓ ${table}: renamed ${from} → ${to}`);
            }
        } catch (err) {
            console.error(`[pre-migrate] ✗ ${table}: ${from} → ${to}:`, err);
            throw err;
        }
    }
}

export async function migrate(args: string[]) {
    const hasRebuild = args.includes('--rebuild');
    const existingSchema = hasRebuild ? 'drop' : 'alter';
    console.log('Migrating schemas (%s existing schema)', existingSchema);

    const app = new WasteTradeApplication();
    await app.boot();

    // Copy/rename old FK columns BEFORE autoupdate drops them
    if (!hasRebuild) {
        await preMigrateBelongsToColumns(app);
    }

    await app.migrateSchema({
        existingSchema,
        options: {
            cascade: hasRebuild,
        },
    });

    // Connectors usually keep a pool of opened connections,
    // this keeps the process running even after all work is done.
    // We need to exit explicitly.
    process.exit(0);
}

migrate(process.argv).catch((err) => {
    console.error('Cannot migrate database schema', err);
    process.exit(1);
});
