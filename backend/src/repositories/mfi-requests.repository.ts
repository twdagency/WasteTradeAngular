import { inject, Getter } from '@loopback/core';
import { repository, BelongsToAccessor } from '@loopback/repository';
import { DbDataSource } from '../datasources';
import { MfiRequests, MfiRequestsRelations, Listings, User, Companies } from '../models';
import { ListingsRepository } from './listings.repository';
import { UserRepository } from './user.repository';
import { CompaniesRepository } from './companies.repository';
import { SyncAwareCrudRepository } from './sync-aware-crud.base';

export class MfiRequestsRepository extends SyncAwareCrudRepository<
    MfiRequests,
    typeof MfiRequests.prototype.id,
    MfiRequestsRelations
> {
    public readonly listing: BelongsToAccessor<Listings, typeof MfiRequests.prototype.id>;
    public readonly buyerUser: BelongsToAccessor<User, typeof MfiRequests.prototype.id>;
    public readonly buyerCompany: BelongsToAccessor<Companies, typeof MfiRequests.prototype.id>;
    public readonly sellerUser: BelongsToAccessor<User, typeof MfiRequests.prototype.id>;
    public readonly sellerCompany: BelongsToAccessor<Companies, typeof MfiRequests.prototype.id>;
    public readonly assignedAdmin: BelongsToAccessor<User, typeof MfiRequests.prototype.id>;

    constructor(
        @inject('datasources.db') dataSource: DbDataSource,
        @repository.getter('ListingsRepository') protected listingsRepositoryGetter: Getter<ListingsRepository>,
        @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>,
        @repository.getter('CompaniesRepository') protected companiesRepositoryGetter: Getter<CompaniesRepository>,
    ) {
        super(MfiRequests, dataSource);

        this.listing = this.createBelongsToAccessorFor('listing', listingsRepositoryGetter);
        this.registerInclusionResolver('listing', this.listing.inclusionResolver);

        this.buyerUser = this.createBelongsToAccessorFor('buyerUser', userRepositoryGetter);
        this.registerInclusionResolver('buyerUser', this.buyerUser.inclusionResolver);

        this.buyerCompany = this.createBelongsToAccessorFor('buyerCompany', companiesRepositoryGetter);
        this.registerInclusionResolver('buyerCompany', this.buyerCompany.inclusionResolver);

        this.sellerUser = this.createBelongsToAccessorFor('sellerUser', userRepositoryGetter);
        this.registerInclusionResolver('sellerUser', this.sellerUser.inclusionResolver);

        this.sellerCompany = this.createBelongsToAccessorFor('sellerCompany', companiesRepositoryGetter);
        this.registerInclusionResolver('sellerCompany', this.sellerCompany.inclusionResolver);

        this.assignedAdmin = this.createBelongsToAccessorFor('assignedAdmin', userRepositoryGetter);
        this.registerInclusionResolver('assignedAdmin', this.assignedAdmin.inclusionResolver);
    }
}
