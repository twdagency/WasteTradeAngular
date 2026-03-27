import { inject, Getter } from '@loopback/core';
import { repository, BelongsToAccessor } from '@loopback/repository';
import { DbDataSource } from '../datasources';
import { CompanyDocuments, CompanyDocumentsRelations, Companies } from '../models';
import { CompaniesRepository } from './companies.repository';
import { SyncAwareCrudRepository } from './sync-aware-crud.base';

export class CompanyDocumentsRepository extends SyncAwareCrudRepository<
    CompanyDocuments,
    typeof CompanyDocuments.prototype.id,
    CompanyDocumentsRelations
> {
    public readonly company: BelongsToAccessor<Companies, typeof CompanyDocuments.prototype.id>;

    constructor(
        @inject('datasources.db') dataSource: DbDataSource,
        @repository.getter('CompaniesRepository') protected companiesRepositoryGetter: Getter<CompaniesRepository>,
    ) {
        super(CompanyDocuments, dataSource);
        this.company = this.createBelongsToAccessorFor('company', companiesRepositoryGetter);
        this.registerInclusionResolver('company', this.company.inclusionResolver);
    }
}
