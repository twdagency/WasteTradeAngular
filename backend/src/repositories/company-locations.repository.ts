import { inject, Getter } from '@loopback/core';
import { DefaultCrudRepository, repository, BelongsToAccessor } from '@loopback/repository';
import { DbDataSource } from '../datasources';
import { CompanyLocations, CompanyLocationsRelations, Companies } from '../models';
import { CompaniesRepository } from './companies.repository';

export class CompanyLocationsRepository extends DefaultCrudRepository<
    CompanyLocations,
    typeof CompanyLocations.prototype.id,
    CompanyLocationsRelations
> {
    public readonly company: BelongsToAccessor<Companies, typeof CompanyLocations.prototype.id>;

    constructor(
        @inject('datasources.db') dataSource: DbDataSource,
        @repository.getter('CompaniesRepository') protected companiesRepositoryGetter: Getter<CompaniesRepository>,
    ) {
        super(CompanyLocations, dataSource);
        this.company = this.createBelongsToAccessorFor('company', companiesRepositoryGetter);
        this.registerInclusionResolver('company', this.company.inclusionResolver);
    }
}
