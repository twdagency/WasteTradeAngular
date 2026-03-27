import { inject } from '@loopback/core';
import { DbDataSource } from '../datasources';
import { Offers, OffersRelations } from '../models';
import { SyncAwareCrudRepository } from './sync-aware-crud.base';

export class OffersRepository extends SyncAwareCrudRepository<Offers, typeof Offers.prototype.id, OffersRelations> {
    constructor(@inject('datasources.db') dataSource: DbDataSource) {
        super(Offers, dataSource);
    }
}
