import { inject } from '@loopback/core';
import { DefaultCrudRepository, BelongsToAccessor, repository } from '@loopback/repository';
import { DbDataSource } from '../datasources';
import { CompanyUserRequests, CompanyUserRequestsRelations, Companies, User } from '../models';
import { CompaniesRepository } from './companies.repository';
import { UserRepository } from './user.repository';
import { Getter } from '@loopback/core';

export class CompanyUserRequestsRepository extends DefaultCrudRepository<
    CompanyUserRequests,
    typeof CompanyUserRequests.prototype.id,
    CompanyUserRequestsRelations
> {
    public readonly company: BelongsToAccessor<Companies, typeof CompanyUserRequests.prototype.id>;
    public readonly user: BelongsToAccessor<User, typeof CompanyUserRequests.prototype.id>;

    constructor(
        @inject('datasources.db') dataSource: DbDataSource,
        @repository.getter('CompaniesRepository')
        protected companiesRepositoryGetter: Getter<CompaniesRepository>,
        @repository.getter('UserRepository')
        protected userRepositoryGetter: Getter<UserRepository>,
    ) {
        super(CompanyUserRequests, dataSource);
        this.company = this.createBelongsToAccessorFor('company', companiesRepositoryGetter);
        this.registerInclusionResolver('company', this.company.inclusionResolver);
        this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter);
        this.registerInclusionResolver('user', this.user.inclusionResolver);
    }
}
