import { inject, lifeCycleObserver, LifeCycleObserver } from '@loopback/core';
import { juggler } from '@loopback/repository';
import dotenv from 'dotenv';

dotenv.config();

const config = {
    name: 'db',
    connector: 'postgresql',
    url: process.env.POSTGRES_URL || '',
    host: process.env.POSTGRES_HOST || 'localhost',
    port: Number(process.env.POSTGRES_PORT) || 5432,
    user: process.env.POSTGRES_USER || 'postgres',
    password: process.env.POSTGRES_PASSWORD || 'password',
    database: process.env.POSTGRES_DATABASE || 'postgres',
    requestTimeout: 200000,
    // schema: process.env?.POSTGRESQL_DB_SCHEMA ?? 'public',
};

// Observe application's life cycle to disconnect the datasource when
// application is stopped. This allows the application to be shut down
// gracefully. The `stop()` method is inherited from `juggler.DataSource`.
// Learn more at https://loopback.io/doc/en/lb4/Life-cycle.html
@lifeCycleObserver('datasource')
export class DbDataSource extends juggler.DataSource implements LifeCycleObserver {
    static dataSourceName = 'db';
    static readonly defaultConfig = config;

    constructor(
        @inject('datasources.config.db', { optional: true })
        dsConfig: object = config,
    ) {
        super(dsConfig);
    }
}
