import { inject, Getter } from '@loopback/core';
import { DefaultCrudRepository, repository, BelongsToAccessor } from '@loopback/repository';
import { DbDataSource } from '../datasources';
import { ListingDocuments, ListingDocumentsRelations, Listings } from '../models';
import { ListingsRepository } from './listings.repository';

export class ListingDocumentsRepository extends DefaultCrudRepository<
    ListingDocuments,
    typeof ListingDocuments.prototype.id,
    ListingDocumentsRelations
> {
    public readonly listing: BelongsToAccessor<Listings, typeof ListingDocuments.prototype.id>;

    constructor(
        @inject('datasources.db') dataSource: DbDataSource,
        @repository.getter('ListingsRepository') protected listingsRepositoryGetter: Getter<ListingsRepository>,
    ) {
        super(ListingDocuments, dataSource);
        this.listing = this.createBelongsToAccessorFor('listing', listingsRepositoryGetter);
        this.registerInclusionResolver('listing', this.listing.inclusionResolver);
    }
}
