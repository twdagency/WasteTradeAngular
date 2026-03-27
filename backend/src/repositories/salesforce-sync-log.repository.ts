import { inject } from '@loopback/core';
import { DefaultCrudRepository } from '@loopback/repository';
import { DbDataSource } from '../datasources';
import { SalesforceSyncLog, SalesforceSyncLogRelations } from '../models/salesforce-sync-log.model';

export class SalesforceSyncLogRepository extends DefaultCrudRepository<
    SalesforceSyncLog,
    typeof SalesforceSyncLog.prototype.id,
    SalesforceSyncLogRelations
> {
    constructor(@inject('datasources.db') dataSource: DbDataSource) {
        super(SalesforceSyncLog, dataSource);
    }
}
