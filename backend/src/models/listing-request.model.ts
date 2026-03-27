import { belongsTo, model, property } from '@loopback/repository';
import { Base } from './base.model';
import { Listings } from './listings.model';

@model({
    settings: {
        strict: true,
        indexes: {},
        postgresql: { schema: 'public', table: 'listing_requests' },
    },
})
export class ListingRequest extends Base {
    @property({
        type: 'number',
        id: true,
        generated: true,
        postgresql: { columnName: 'id', dataType: 'integer', nullable: 'NO' },
    })
    id?: number;

    @property({
        type: 'number',
        required: true,
        postgresql: { columnName: 'user_id', dataType: 'integer', nullable: 'NO' },
    })
    userId: number;

    @property({
        type: 'boolean',
        default: false,
        postgresql: { columnName: 'request_pictures', dataType: 'boolean', nullable: 'NO' },
    })
    requestPictures: boolean;

    @property({
        type: 'boolean',
        default: false,
        postgresql: { columnName: 'request_spec_sheets', dataType: 'boolean', nullable: 'NO' },
    })
    requestSpecSheets: boolean;

    @property({
        type: 'boolean',
        default: false,
        postgresql: { columnName: 'request_description', dataType: 'boolean', nullable: 'NO' },
    })
    requestDescription: boolean;

    @property({ type: 'string', required: false, jsonSchema: { maxLength: 1000 } })
    freeText?: string;

    @property({
        type: 'string',
        default: 'pending',
        postgresql: { columnName: 'status', dataType: 'varchar', nullable: 'NO' },
    })
    status: string;

    @belongsTo(() => Listings, {}, {postgresql: {columnName: 'listing_id'}})
    listingId: number;
}

export interface ListingRequestRelations {
    listing: Listings;
}

export type ListingRequestWithRelations = ListingRequest & ListingRequestRelations;
