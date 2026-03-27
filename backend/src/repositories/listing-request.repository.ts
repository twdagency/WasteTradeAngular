import { BelongsToAccessor, DefaultCrudRepository, repository } from '@loopback/repository';
import { ListingRequest, ListingRequestRelations } from '../models/listing-request.model';
import { inject, Getter } from '@loopback/core';
import { DbDataSource } from '../datasources';
import { Listings } from '../models/listings.model';
import { ListingsRepository } from './listings.repository';

export class ListingRequestRepository extends DefaultCrudRepository<
    ListingRequest,
    typeof ListingRequest.prototype.id,
    ListingRequestRelations
> {
    public readonly listing: BelongsToAccessor<Listings, typeof ListingRequest.prototype.id>;

    constructor(
        @inject('datasources.db') dataSource: DbDataSource,
        @repository.getter('ListingsRepository') protected listingsRepositoryGetter: Getter<ListingsRepository>,
    ) {
        super(ListingRequest, dataSource);
        this.listing = this.createBelongsToAccessorFor('listing', listingsRepositoryGetter);
        this.registerInclusionResolver('listing', this.listing.inclusionResolver);
    }
}
