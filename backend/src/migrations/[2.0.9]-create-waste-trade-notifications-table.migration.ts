import { MigrationScript, migrationScript } from 'loopback4-migration';
import { inject } from '@loopback/core';
import { juggler } from '@loopback/repository';

@migrationScript()
export class CreateWasteTradeNotificationsTableMigration implements MigrationScript {
    version = '2.0.9';
    scriptName = 'CreateWasteTradeNotificationsTableMigration';
    description = 'Create waste_trade_notifications table';

    constructor(@inject('datasources.db') private dataSource: juggler.DataSource) {}

    async up(): Promise<void> {
        try {
            // Drop table if exists (this will cascade drop all indexes)
            await this.dataSource.execute(`DROP TABLE IF EXISTS waste_trade_notifications CASCADE;`);
            
            await this.dataSource.execute(`
                CREATE TABLE waste_trade_notifications (
                    id SERIAL PRIMARY KEY,
                    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    type VARCHAR(50) NOT NULL,
                    data JSONB NOT NULL,
                    is_read BOOLEAN NOT NULL DEFAULT false,
                    read_at TIMESTAMP,
                    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
                );
            `);

            await this.dataSource.execute(`
                CREATE INDEX idx_waste_trade_notifications_user_id 
                ON waste_trade_notifications(user_id);
            `);

            await this.dataSource.execute(`
                CREATE INDEX idx_waste_trade_notifications_is_read 
                ON waste_trade_notifications(is_read);
            `);

            await this.dataSource.execute(`
                CREATE INDEX idx_waste_trade_notifications_user_is_read 
                ON waste_trade_notifications(user_id, is_read);
            `);

            console.log('Create waste_trade_notifications table migration completed!');
        } catch (error) {
            console.error('Create waste_trade_notifications table migration failed:', error);
            throw error;
        }
    }

    async down(): Promise<void> {
        try {
            await this.dataSource.execute(`DROP TABLE IF EXISTS waste_trade_notifications CASCADE;`);
            console.log('Drop waste_trade_notifications table migration completed!');
        } catch (error) {
            console.error('Drop waste_trade_notifications table migration failed:', error);
            throw error;
        }
    }
}
