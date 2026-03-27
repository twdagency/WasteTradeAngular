import { model, property, belongsTo } from '@loopback/repository';
import { Base } from './base.model';
import { AdminNote } from './admin-note.model';
import { AssignAdmin } from './assign-admin.model';
import { ESampleRequestStatus } from '../enum';
import { User } from './user.model';
import { Companies } from './companies.model';
import { Listings } from './listings.model';

@model({
    settings: { idInjection: false, postgresql: { schema: 'public', table: 'sample_requests' } },
})
export class SampleRequests extends Base {
    @property({
        type: 'number',
        generated: true,
        jsonSchema: { nullable: false },
        id: true,
        postgresql: { columnName: 'id', dataType: 'integer', nullable: 'NO' },
    })
    id?: number;

    @belongsTo(() => Listings, {}, {name: 'listing_id'})
    listingId: number;

    @belongsTo(() => User, { name: 'buyerUser' }, {name: 'buyer_user_id'})
    buyerUserId: number;

    @belongsTo(() => Companies, { name: 'buyerCompany' }, {name: 'buyer_company_id'})
    buyerCompanyId: number;

    @belongsTo(() => User, { name: 'sellerUser' }, {name: 'seller_user_id'})
    sellerUserId: number;

    @belongsTo(() => Companies, { name: 'sellerCompany' }, {name: 'seller_company_id'})
    sellerCompanyId: number;

    @belongsTo(() => User, { name: 'assignedAdmin' }, {name: 'assigned_admin_id'})
    assignedAdminId?: number | null;

    @property({
        type: 'number',
        required: true,
        jsonSchema: { nullable: false, minimum: 1 },
        postgresql: { columnName: 'number_of_samples', dataType: 'integer', nullable: 'NO' },
    })
    numberOfSamples: number;

    @property({
        type: 'string',
        required: true,
        jsonSchema: { nullable: false },
        postgresql: { columnName: 'sample_size', dataType: 'character varying', dataLength: 50, nullable: 'NO' },
    })
    sampleSize: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'buyer_message', dataType: 'text', nullable: 'YES' },
    })
    buyerMessage?: string;

    @property({
        type: 'string',
        required: true,
        jsonSchema: {
            nullable: false,
            enum: Object.values(ESampleRequestStatus),
        },
        postgresql: { columnName: 'status', dataType: 'character varying', dataLength: 50, nullable: 'NO' },
    })
    status: ESampleRequestStatus;

    @property({
        type: 'date',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'sent_date', dataType: 'timestamp without time zone', nullable: 'YES' },
    })
    sentDate?: Date;

    @property({
        type: 'date',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'received_date', dataType: 'timestamp without time zone', nullable: 'YES' },
    })
    receivedDate?: Date;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: {
            columnName: 'postage_label_url',
            dataType: 'character varying',
            dataLength: 500,
            nullable: 'YES',
        },
    })
    postageLabelUrl?: string;

    @property({
        type: 'boolean',
        default: false,
        jsonSchema: { nullable: false },
        postgresql: { columnName: 'is_synced_salesforce', dataType: 'boolean', nullable: 'NO' },
    })
    isSyncedSalesForce: boolean;

    @property({
        type: 'date',
        jsonSchema: { nullable: true },
        postgresql: {
            columnName: 'last_synced_salesforce_date',
            dataType: 'timestamp without time zone',
            nullable: 'YES',
        },
    })
    lastSyncedSalesForceDate?: Date;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: {
            columnName: 'salesforce_id',
            dataType: 'character varying',
            dataLength: 50,
            nullable: 'YES',
        },
    })
    salesforceId?: string;

    @property({
        type: 'object',
        jsonSchema: { nullable: true },
        postgresql: {
            columnName: 'admin_note',
            dataType: 'jsonb',
            nullable: 'YES',
        },
    })
    adminNote?: AdminNote;

    @property({
        type: 'object',
        jsonSchema: { nullable: true },
        postgresql: {
            columnName: 'assign_admin',
            dataType: 'jsonb',
            nullable: 'YES',
        },
    })
    assignAdmin?: AssignAdmin | null;

    constructor(data?: Partial<SampleRequests>) {
        super(data);
    }
}

export interface SampleRequestsRelations {
    listing?: Listings;
    buyerUser?: User;
    buyerCompany?: Companies;
    sellerUser?: User;
    sellerCompany?: Companies;
    assignedAdmin?: User;
}

export type SampleRequestsWithRelations = SampleRequests & SampleRequestsRelations;
