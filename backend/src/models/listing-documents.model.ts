import { model, property, belongsTo } from '@loopback/repository';
import { ListingImageType } from '../enum';
import { Listings } from './listings.model';
import { Base } from './base.model';

@model({
    settings: { idInjection: false, postgresql: { schema: 'public', table: 'listing_documents' } },
})
export class ListingDocuments extends Base {
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
        postgresql: { columnName: 'document_type', dataType: 'character varying', dataLength: 255, nullable: 'NO' },
    })
    documentType: ListingImageType;

    @property({
        type: 'string',
        required: true,
        jsonSchema: { nullable: false },
        postgresql: { columnName: 'document_url', dataType: 'character varying', dataLength: 255, nullable: 'NO' },
    })
    documentUrl: string;

    @belongsTo(() => Listings, {}, {postgresql: {columnName: 'listing_id'}})
    listingId: number;

    constructor(data?: Partial<ListingDocuments>) {
        super(data);
    }
}

export interface ListingDocumentsRelations {
    // describe navigational properties here
}

export type ListingDocumentsWithRelations = ListingDocuments & ListingDocumentsRelations;
