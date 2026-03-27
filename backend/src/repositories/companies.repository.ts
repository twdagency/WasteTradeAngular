import { inject } from '@loopback/core';
import { BelongsToAccessor } from '@loopback/repository';
import { DbDataSource } from '../datasources';
import { Companies, CompaniesRelations, User } from '../models';
import { SyncAwareCrudRepository } from './sync-aware-crud.base';

export class CompaniesRepository extends SyncAwareCrudRepository<
    Companies,
    typeof Companies.prototype.id,
    CompaniesRelations
> {
    public readonly user: BelongsToAccessor<User, typeof Companies.prototype.id>;

    constructor(@inject('datasources.db') dataSource: DbDataSource) {
        super(Companies, dataSource);
    }
}
