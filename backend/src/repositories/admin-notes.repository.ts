import { inject, Getter } from '@loopback/core';
import { DefaultCrudRepository, repository, BelongsToAccessor } from '@loopback/repository';
import { DbDataSource } from '../datasources';
import { AdminNotes, AdminNotesRelations, User } from '../models';
import { UserRepository } from './user.repository';

export class AdminNotesRepository extends DefaultCrudRepository<
    AdminNotes,
    typeof AdminNotes.prototype.id,
    AdminNotesRelations
> {
    public readonly createdByAdmin: BelongsToAccessor<User, typeof AdminNotes.prototype.id>;
    public readonly updatedByAdmin: BelongsToAccessor<User, typeof AdminNotes.prototype.id>;

    constructor(
        @inject('datasources.db') dataSource: DbDataSource,
        @repository.getter('UserRepository')
        protected userRepositoryGetter: Getter<UserRepository>,
    ) {
        super(AdminNotes, dataSource);
        this.createdByAdmin = this.createBelongsToAccessorFor('createdByAdmin', userRepositoryGetter);
        this.registerInclusionResolver('createdByAdmin', this.createdByAdmin.inclusionResolver);
        this.updatedByAdmin = this.createBelongsToAccessorFor('updatedByAdmin', userRepositoryGetter);
        this.registerInclusionResolver('updatedByAdmin', this.updatedByAdmin.inclusionResolver);
    }
}
