import { inject } from '@loopback/core';
import { DefaultCrudRepository } from '@loopback/repository';
import { DbDataSource } from '../datasources';
import { HaulageOfferDocuments, HaulageOfferDocumentsRelations } from '../models';

export class HaulageOfferDocumentsRepository extends DefaultCrudRepository<
    HaulageOfferDocuments,
    typeof HaulageOfferDocuments.prototype.id,
    HaulageOfferDocumentsRelations
> {
    constructor(@inject('datasources.db') dataSource: DbDataSource) {
        super(HaulageOfferDocuments, dataSource);
    }
}
