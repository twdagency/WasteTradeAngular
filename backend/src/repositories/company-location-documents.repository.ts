import { inject, Getter } from '@loopback/core';
import { repository, BelongsToAccessor } from '@loopback/repository';
import { DbDataSource } from '../datasources';
import { CompanyLocationDocuments, CompanyLocationDocumentsRelations, CompanyLocations } from '../models';
import { CompanyLocationsRepository } from './company-locations.repository';
import { SyncAwareCrudRepository } from './sync-aware-crud.base';

export class CompanyLocationDocumentsRepository extends SyncAwareCrudRepository<
    CompanyLocationDocuments,
    typeof CompanyLocationDocuments.prototype.id,
    CompanyLocationDocumentsRelations
> {
    public readonly companyLocation: BelongsToAccessor<CompanyLocations, typeof CompanyLocationDocuments.prototype.id>;

    constructor(
        @inject('datasources.db') dataSource: DbDataSource,
        @repository.getter('CompanyLocationsRepository')
        protected companyLocationsRepositoryGetter: Getter<CompanyLocationsRepository>,
    ) {
        super(CompanyLocationDocuments, dataSource);
        this.companyLocation = this.createBelongsToAccessorFor('companyLocation', companyLocationsRepositoryGetter);
        this.registerInclusionResolver('companyLocation', this.companyLocation.inclusionResolver);
    }
}
