# Migrations Guide

## ⚠️ IMPORTANT: Migration Rules

### What Migrations Are For
Migrations in this project are **ONLY** for:
- ✅ **Data migrations** (inserting, updating, or deleting data)
- ✅ **Database indexes** (adding/removing indexes for performance)
- ✅ **Data transformations** (migrating data from one format to another)

### What Migrations Are NOT For
❌ **DO NOT** use migrations for:
- Creating tables (LoopBack 4 auto-creates from models)
- Adding/removing columns (add to models, LB4 handles it)
- Altering table schema (modify models, LB4 handles it)
- Creating foreign keys (define in models with `@belongsTo`)

## How LoopBack 4 Auto-Migration Works

1. **Define models** with `@model` and `@property` decorators
2. **Run `npm run migrate`** or start the app
3. **LB4 automatically**:
   - Creates tables if they don't exist
   - Adds new columns from models
   - Updates column types if changed
4. **Custom migrations run after** LB4 auto-migration

## Migration Template

Use this template for all new migrations:

```typescript
import { MigrationScript, migrationScript } from 'loopback4-migration';
import { inject } from '@loopback/core';
import { juggler } from '@loopback/repository';

@migrationScript()
export class YourMigrationName implements MigrationScript {
    version = 'X.Y.Z'; // e.g., '2.0.1'
    scriptName = 'YourMigrationName';
    description = 'Brief description of what this migration does';

    constructor(@inject('datasources.db') private dataSource: juggler.DataSource) {}

    async up(): Promise<void> {
        try {
            console.log('Starting migration: YourMigrationName...');

            // Check if tables exist (if needed)
            const tableExists = await this.dataSource.execute(`
                SELECT EXISTS (
                    SELECT FROM information_schema.tables 
                    WHERE table_schema = 'public' 
                    AND table_name = 'your_table'
                )
            `);

            if (!tableExists[0].exists) {
                console.log('Table does not exist yet. Skipping migration.');
                return;
            }

            // Check current state before migration
            const beforeStats = await this.dataSource.execute(`
                SELECT COUNT(*) as count FROM your_table
            `);
            console.log('Before migration:', beforeStats[0]);

            // Perform your data migration
            await this.dataSource.execute(`
                -- Your SQL here (INSERT, UPDATE, DELETE, CREATE INDEX, etc.)
            `);

            // Verify after migration
            const afterStats = await this.dataSource.execute(`
                SELECT COUNT(*) as count FROM your_table
            `);
            console.log('After migration:', afterStats[0]);

            console.log('Migration completed successfully!');
        } catch (error) {
            console.error('Error during migration:', error);
            throw error;
        }
    }

    async down(): Promise<void> {
        try {
            console.log('Starting rollback: YourMigrationName...');

            // Rollback logic here
            await this.dataSource.execute(`
                -- Reverse your changes
            `);

            console.log('Rollback completed successfully!');
        } catch (error) {
            console.error('Error during rollback:', error);
            throw error;
        }
    }
}
```

## File Naming Convention

Format: `[X.Y.Z]-descriptive-name.migration.ts`

Examples:
- `[1.0.14]-migrate-listing-duration-to-end-date.migration.ts`
- `[2.0.1]-insert-sample-mfi-requests-data.migration.ts`
- `[2.0.2]-add-indexes-for-performance.migration.ts`

## Version Numbering

- **Major.Minor.Patch** format (e.g., `2.0.1`)
- Increment version for each new migration
- Update `appVersion` in `src/application.ts` to match latest migration

```typescript
// src/application.ts
this.bind(MigrationBindings.CONFIG).to({
    appVersion: '2.0.1', // Update this!
    dataSourceName: 'db',
});
```

## Common Migration Patterns

### 1. Insert Sample Data

```typescript
async up(): Promise<void> {
    // Check if data already exists
    const count = await this.dataSource.execute('SELECT COUNT(*) as count FROM my_table');
    if (count[0].count > 0) {
        console.log('Data already exists. Skipping.');
        return;
    }

    // Insert data
    await this.dataSource.execute(`
        INSERT INTO my_table (column1, column2) VALUES
        ('value1', 'value2'),
        ('value3', 'value4')
    `);
}
```

### 2. Update Existing Data

```typescript
async up(): Promise<void> {
    // Update records
    const result = await this.dataSource.execute(`
        UPDATE my_table 
        SET column1 = 'new_value'
        WHERE condition = true
    `);
    console.log(`Updated ${result.affectedRows} records`);
}
```

### 3. Add Database Index

```typescript
async up(): Promise<void> {
    // Check if index exists
    const indexExists = await this.dataSource.execute(`
        SELECT EXISTS (
            SELECT 1 FROM pg_indexes 
            WHERE tablename = 'my_table' 
            AND indexname = 'idx_my_column'
        )
    `);

    if (!indexExists[0].exists) {
        await this.dataSource.execute(`
            CREATE INDEX idx_my_column ON my_table(my_column)
        `);
        console.log('Index created successfully');
    }
}

async down(): Promise<void> {
    await this.dataSource.execute(`
        DROP INDEX IF EXISTS idx_my_column
    `);
}
```

### 4. Data Transformation

```typescript
async up(): Promise<void> {
    // Transform data from old format to new format
    await this.dataSource.execute(`
        UPDATE my_table 
        SET new_column = CASE 
            WHEN old_column = 'old_value' THEN 'new_value'
            ELSE old_column
        END
        WHERE new_column IS NULL
    `);
}
```

## Testing Migrations

### Local Testing
```bash
# Run migrations
pnpm migrate

# Check migration status
pnpm migrate:debug

# Rollback (if needed)
# Note: Implement down() method for rollback support
```

### Production Deployment
```bash
# Always backup database first!
# Use safe migration with backup
pnpm migrate:safe
```

## Best Practices

1. **Always check if data exists** before inserting to avoid duplicates
2. **Always check if tables exist** before querying them
3. **Log before and after states** for debugging
4. **Implement rollback (down)** for all migrations
5. **Test locally first** before deploying to production
6. **Keep migrations idempotent** (safe to run multiple times)
7. **Use transactions** for complex multi-step migrations
8. **Never modify existing migration files** - create new ones instead

## Example: Complete Migration

See `[2.0.1]-insert-sample-mfi-requests-data.migration.ts` for a complete example that:
- Checks if tables exist
- Checks if data already exists
- Inserts sample data
- Includes rollback logic
- Logs all steps

## Common Mistakes to Avoid

❌ **DON'T**: Create tables in migrations
```typescript
// WRONG!
await queryRunner.createTable(new Table({ name: 'my_table', ... }));
```

✅ **DO**: Create model, let LB4 handle it
```typescript
// RIGHT! In src/models/my-table.model.ts
@model({ settings: { postgresql: { table: 'my_table' } } })
export class MyTable extends Entity { ... }
```

❌ **DON'T**: Add columns in migrations
```typescript
// WRONG!
await queryRunner.addColumn('my_table', new TableColumn({ name: 'new_column', ... }));
```

✅ **DO**: Add property to model
```typescript
// RIGHT! In model file
@property({
    type: 'string',
    postgresql: { columnName: 'new_column', dataType: 'varchar', dataLength: 255 }
})
newColumn?: string;
```

## Need Help?

- Check existing migrations in this folder for examples
- Review LoopBack 4 documentation: https://loopback.io/doc/en/lb4/
- Review loopback4-migration docs: https://www.npmjs.com/package/loopback4-migration
- Ask the team if unsure!

## Summary

**Remember**: 
- Models define schema → LB4 creates/updates tables automatically
- Migrations handle data → You write custom data transformations
- Keep it simple → Follow the template and examples
