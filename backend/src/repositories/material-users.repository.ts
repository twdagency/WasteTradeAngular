import { inject, Getter } from '@loopback/core';
import { DefaultCrudRepository, repository, BelongsToAccessor } from '@loopback/repository';
import { DbDataSource } from '../datasources';
import { MaterialUsers, MaterialUsersRelations, Materials, User } from '../models';
import { MaterialsRepository } from './materials.repository';
import { UserRepository } from './user.repository';

export class MaterialUsersRepository extends DefaultCrudRepository<
    MaterialUsers,
    typeof MaterialUsers.prototype.id,
    MaterialUsersRelations
> {
    public readonly material: BelongsToAccessor<Materials, typeof MaterialUsers.prototype.id>;

    public readonly user: BelongsToAccessor<User, typeof MaterialUsers.prototype.id>;

    constructor(
        @inject('datasources.db') dataSource: DbDataSource,
        @repository.getter('MaterialsRepository') protected materialsRepositoryGetter: Getter<MaterialsRepository>,
        @repository.getter('UserRepository') protected userRepositoryGetter: Getter<UserRepository>,
    ) {
        super(MaterialUsers, dataSource);
        this.user = this.createBelongsToAccessorFor('user', userRepositoryGetter);
        this.registerInclusionResolver('user', this.user.inclusionResolver);
        this.material = this.createBelongsToAccessorFor('material', materialsRepositoryGetter);
        this.registerInclusionResolver('material', this.material.inclusionResolver);
    }
}
