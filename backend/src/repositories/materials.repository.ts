import { inject } from '@loopback/core';
import { DefaultCrudRepository } from '@loopback/repository';
import { DbDataSource } from '../datasources';
import { Materials, MaterialsRelations } from '../models';

export class MaterialsRepository extends DefaultCrudRepository<
    Materials,
    typeof Materials.prototype.id,
    MaterialsRelations
> {
    constructor(@inject('datasources.db') dataSource: DbDataSource) {
        super(Materials, dataSource);
    }
}
