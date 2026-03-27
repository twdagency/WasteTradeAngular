import { model, property, belongsTo } from '@loopback/repository';
import { HaulageOffers } from './haulage-offers.model';
import { Base } from './base.model';

@model({
    settings: { idInjection: false, postgresql: { schema: 'public', table: 'haulage_offer_documents' } },
})
export class HaulageOfferDocuments extends Base {
    @property({
        type: 'number',
        generated: true,
        jsonSchema: { nullable: false },
        id: true,
        postgresql: { columnName: 'id', dataType: 'integer', nullable: 'NO' },
    })
    id: number;

    @property({
        type: 'string',
        required: true,
        jsonSchema: { nullable: false },
        postgresql: { columnName: 'document_title', dataType: 'character varying', dataLength: 500, nullable: 'NO' },
    })
    documentTitle: string;

    @property({
        type: 'string',
        required: true,
        jsonSchema: { nullable: false },
        postgresql: { columnName: 'document_url', dataType: 'text', nullable: 'NO' },
    })
    documentUrl: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'salesforce_id', dataType: 'character varying', dataLength: 50, nullable: 'YES' },
    })
    salesforceId?: string;

    @belongsTo(() => HaulageOffers, {}, {postgresql: {columnName: 'haulage_offer_id'}})
    haulageOfferId: number;

    constructor(data?: Partial<HaulageOfferDocuments>) {
        super(data);
    }
}

export interface HaulageOfferDocumentsRelations {
    haulageOffer?: HaulageOffers;
}

export type HaulageOfferDocumentsWithRelations = HaulageOfferDocuments & HaulageOfferDocumentsRelations;
