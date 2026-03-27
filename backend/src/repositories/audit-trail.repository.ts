import { Getter, inject } from '@loopback/core';
import { BelongsToAccessor, DefaultCrudRepository, repository } from '@loopback/repository';
import { DbDataSource } from '../datasources';
import { AuditTrail, AuditTrailRelations, Companies, User } from '../models';
import { CompaniesRepository } from './companies.repository';
import { UserRepository } from './user.repository';

export class AuditTrailRepository extends DefaultCrudRepository<
    AuditTrail,
    typeof AuditTrail.prototype.id,
    AuditTrailRelations
> {
    public readonly user: BelongsToAccessor<User, typeof AuditTrail.prototype.id>;
    public readonly company: BelongsToAccessor<Companies, typeof AuditTrail.prototype.id>;

    constructor(
        @inject('datasources.db') dataSource: DbDataSource,
        @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>,
        @repository.getter('CompaniesRepository') protected companiesRepositoryGetter: Getter<CompaniesRepository>,
    ) {
        super(AuditTrail, dataSource);

        this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter);
        this.registerInclusionResolver('user', this.user.inclusionResolver);

        this.company = this.createBelongsToAccessorFor('company', companiesRepositoryGetter);
        this.registerInclusionResolver('company', this.company.inclusionResolver);
    }
}
