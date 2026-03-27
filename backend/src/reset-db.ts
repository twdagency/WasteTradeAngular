import 'reflect-metadata';
import { WasteTradeApplication } from './application';

/**
 * Reset database by executing direct SQL
 */
export async function resetDatabase() {
    console.log('Resetting database...');

    const app = new WasteTradeApplication();
    await app.boot();

    // Get the datasource
    const datasource = await app.get('datasources.db');

    // Execute SQL directly
    try {
        console.log('Dropping all constraints, indexes, and tables...');

        // This will directly connect to PostgreSQL and execute commands
        await executeSQL(
            datasource,
            `
      DO $$ DECLARE
          r RECORD;
      BEGIN
          -- Disable all triggers temporarily
          SET session_replication_role = 'replica';
          
          -- Drop all constraints first
          FOR r IN (SELECT conrelid::regclass::text AS tablename, conname AS constraintname
                    FROM pg_constraint
                    WHERE connamespace = 'public'::regnamespace) LOOP
              EXECUTE 'ALTER TABLE IF EXISTS ' || r.tablename || ' DROP CONSTRAINT IF EXISTS ' || r.constraintname || ' CASCADE';
          END LOOP;
          
          -- Drop all tables in the public schema
          FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
              EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
          END LOOP;

          -- Drop all custom indexes
          FOR r IN (SELECT indexname, tablename FROM pg_indexes WHERE schemaname = 'public') LOOP
              EXECUTE 'DROP INDEX IF EXISTS ' || quote_ident(r.indexname) || ' CASCADE';
          END LOOP;

          -- Re-enable triggers
          SET session_replication_role = 'origin';
      END $$;
    `,
        );

        console.log('All database objects dropped successfully.');

        // Now rebuild the schema using the application's models
        console.log('Rebuilding database schema...');
        await app.migrateSchema();

        console.log('Database reset completed successfully!');
    } catch (err) {
        console.error('Error resetting database:', err);
        process.exit(1);
    }

    // Disconnect and terminate the application
    await app.stop();
}

async function executeSQL(datasource: any, sql: string): Promise<void> {
    return new Promise((resolve, reject) => {
        datasource.connector.execute(sql, [], (err: Error, result: any) => {
            if (err) return reject(err);
            resolve();
        });
    });
}

resetDatabase().catch((err) => {
    console.error('Failed to reset database:', err);
    process.exit(1);
});
