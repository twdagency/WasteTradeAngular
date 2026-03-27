import { inject } from '@loopback/core';
import { DbDataSource } from '../datasources';
import { User, UserRelations } from '../models';
import { SyncAwareCrudRepository } from './sync-aware-crud.base';

export type Credentials = {
    email: string;
    password: string;
    captchaToken?: string;
    mFullToken?: string;
};

export class UserRepository extends SyncAwareCrudRepository<User, typeof User.prototype.id, UserRelations> {
    constructor(
        @inject('datasources.db') dataSource: DbDataSource,
    ) {
        super(User, dataSource);
    }
}
