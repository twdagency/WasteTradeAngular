import { inject, Getter } from '@loopback/core';
import { repository, BelongsToAccessor } from '@loopback/repository';
import { DbDataSource } from '../datasources';
import { Listings, ListingsRelations, CompanyLocations } from '../models';
import { CompanyLocationsRepository } from './company-locations.repository';
import { SyncAwareCrudRepository } from './sync-aware-crud.base';

export class ListingsRepository extends SyncAwareCrudRepository<
    Listings,
    typeof Listings.prototype.id,
    ListingsRelations
> {
    public readonly location: BelongsToAccessor<CompanyLocations, typeof Listings.prototype.id>;

    constructor(
        @inject('datasources.db') dataSource: DbDataSource,
        @repository.getter('CompanyLocationsRepository')
        protected companyLocationsRepositoryGetter: Getter<CompanyLocationsRepository>,
    ) {
        super(Listings, dataSource);

        this.location = this.createBelongsToAccessorFor('location', companyLocationsRepositoryGetter);
        this.registerInclusionResolver('location', this.location.inclusionResolver);
    }
}
