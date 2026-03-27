import { inject } from '@loopback/core';
import { DefaultCrudRepository } from '@loopback/repository';
import { DbDataSource } from '../datasources';
import { DataDraft, DataDraftRelations } from '../models';

export class DataDraftRepository extends DefaultCrudRepository<
    DataDraft,
    typeof DataDraft.prototype.id,
    DataDraftRelations
> {
    constructor(@inject('datasources.db') dataSource: DbDataSource) {
        super(DataDraft, dataSource);
    }
}
