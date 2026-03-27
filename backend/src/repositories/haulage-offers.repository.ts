import { inject } from '@loopback/core';
import { DbDataSource } from '../datasources';
import { HaulageOffers, HaulageOffersRelations } from '../models';
import { SyncAwareCrudRepository } from './sync-aware-crud.base';

export class HaulageOffersRepository extends SyncAwareCrudRepository<
    HaulageOffers,
    typeof HaulageOffers.prototype.id,
    HaulageOffersRelations
> {
    constructor(@inject('datasources.db') dataSource: DbDataSource) {
        super(HaulageOffers, dataSource);
    }
}
