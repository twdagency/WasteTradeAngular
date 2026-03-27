import { inject, Getter } from '@loopback/core';
import { DefaultCrudRepository, BelongsToAccessor, repository } from '@loopback/repository';
import { DbDataSource } from '../datasources';
import { WasteTradeNotifications, WasteTradeNotificationsRelations, User } from '../models';
import { UserRepository } from './user.repository';

export class WasteTradeNotificationsRepository extends DefaultCrudRepository<
    WasteTradeNotifications,
    typeof WasteTradeNotifications.prototype.id,
    WasteTradeNotificationsRelations
> {
    public readonly user: BelongsToAccessor<User, typeof WasteTradeNotifications.prototype.id>;

    constructor(
        @inject('datasources.db') dataSource: DbDataSource,
        @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>,
    ) {
        super(WasteTradeNotifications, dataSource);
        this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter);
        this.registerInclusionResolver('user', this.user.inclusionResolver);
    }
}
