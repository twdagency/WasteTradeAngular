import { inject, Getter } from '@loopback/core';
import { repository, BelongsToAccessor } from '@loopback/repository';
import { DbDataSource } from '../datasources';
import { CompanyUsers, CompanyUsersRelations, Companies, User } from '../models';
import { CompaniesRepository } from './companies.repository';
import { UserRepository } from './user.repository';
import { SyncAwareCrudRepository } from './sync-aware-crud.base';

export class CompanyUsersRepository extends SyncAwareCrudRepository<
    CompanyUsers,
    typeof CompanyUsers.prototype.id,
    CompanyUsersRelations
> {
    public readonly company: BelongsToAccessor<Companies, typeof CompanyUsers.prototype.id>;

    public readonly user: BelongsToAccessor<User, typeof CompanyUsers.prototype.id>;

    constructor(
        @inject('datasources.db') dataSource: DbDataSource,
        @repository.getter('CompaniesRepository') protected companiesRepositoryGetter: Getter<CompaniesRepository>,
        @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>,
    ) {
        super(CompanyUsers, dataSource);
        this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter);
        this.registerInclusionResolver('user', this.user.inclusionResolver);
        this.company = this.createBelongsToAccessorFor('company', companiesRepositoryGetter);
        this.registerInclusionResolver('company', this.company.inclusionResolver);
    }
}
