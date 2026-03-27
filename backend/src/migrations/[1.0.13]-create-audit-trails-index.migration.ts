import { MigrationScript, migrationScript } from 'loopback4-migration';
import { inject } from '@loopback/core';
import { juggler } from '@loopback/repository';

@migrationScript()
export class CreateAuditTrailsTable implements MigrationScript {
    version = '1.0.13';
    scriptName = 'CreateAuditTrailsTable';
    description = 'Create audit trails table for API tracking';

    constructor(@inject('datasources.db') private dataSource: juggler.DataSource) {}

    async up(): Promise<void> {
        try {
            const queries = [
                'CREATE INDEX IF NOT EXISTS idx_audit_trails_user_id ON audit_trails(user_id);',
                'CREATE INDEX IF NOT EXISTS idx_audit_trails_company_id ON audit_trails(company_id);',
                'CREATE INDEX IF NOT EXISTS idx_audit_trails_type ON audit_trails(type);',
                'CREATE INDEX IF NOT EXISTS idx_audit_trails_method ON audit_trails(method);',
                'CREATE INDEX IF NOT EXISTS idx_audit_trails_created_at ON audit_trails(created_at);',
                'CREATE INDEX IF NOT EXISTS idx_audit_trails_user_created ON audit_trails(user_id, created_at);',
                'CREATE INDEX IF NOT EXISTS idx_audit_trails_company_created ON audit_trails(company_id, created_at);',
            ];

            for (const query of queries) {
                await this.dataSource.execute(query);
            }

            console.log('Create audit trails indexes migration completed!');
        } catch (error) {
            console.error('Create audit trails indexes migration failed:', error);
            throw error;
        }
    }

    async down(): Promise<void> {
        try {
            const queries = [
                'DROP INDEX IF EXISTS idx_audit_trails_user_id;',
                'DROP INDEX IF EXISTS idx_audit_trails_company_id;',
                'DROP INDEX IF EXISTS idx_audit_trails_type;',
                'DROP INDEX IF EXISTS idx_audit_trails_method;',
                'DROP INDEX IF EXISTS idx_audit_trails_created_at;',
                'DROP INDEX IF EXISTS idx_audit_trails_user_created;',
                'DROP INDEX IF EXISTS idx_audit_trails_company_created;',
            ];

            for (const query of queries) {
                await this.dataSource.execute(query);
            }

            console.log('Drop audit trails indexes migration completed!');
        } catch (error) {
            console.error('Drop audit trails indexes migration failed:', error);
            throw error;
        }
    }
}
