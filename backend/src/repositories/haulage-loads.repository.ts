import { inject } from '@loopback/core';
import { DbDataSource } from '../datasources';
import { HaulageLoads, HaulageLoadsRelations } from '../models';
import { SyncAwareCrudRepository } from './sync-aware-crud.base';

export class HaulageLoadsRepository extends SyncAwareCrudRepository<
    HaulageLoads,
    typeof HaulageLoads.prototype.id,
    HaulageLoadsRelations
> {
    constructor(@inject('datasources.db') dataSource: DbDataSource) {
        super(HaulageLoads, dataSource);
    }
}
