import { model, property } from '@loopback/repository';
import { ECurrency, ExpectedTransitTime, HaulageOfferStatus, TransportProvider } from '../enum';
import { Base } from './base.model';
import { Companies } from './companies.model';
import { Listings } from './listings.model';
import { User } from './user.model';
import { AdminNote } from './admin-note.model';
import { AssignAdmin } from './assign-admin.model';
import { HaulageLoads } from './haulage-loads.model';

@model({
    settings: { idInjection: false, postgresql: { schema: 'public', table: 'haulage_offers' } },
})
export class HaulageOffers extends Base {
    @property({
        type: 'number',
        generated: true,
        id: true,
        postgresql: { columnName: 'id', dataType: 'integer', nullable: 'NO' },
    })
    id: number;

    @property({
        type: 'number',
        required: true,
        jsonSchema: { nullable: false },
        postgresql: { columnName: 'offer_id', dataType: 'integer', nullable: 'NO' },
    })
    offerId: number;

    @property({
        type: 'number',
        required: true,
        jsonSchema: { nullable: false },
        postgresql: { columnName: 'haulier_company_id', dataType: 'integer', nullable: 'NO' },
    })
    haulierCompanyId: number;

    @property({
        type: 'number',
        required: true,
        jsonSchema: { nullable: false },
        postgresql: { columnName: 'haulier_user_id', dataType: 'integer', nullable: 'NO' },
    })
    haulierUserId: number;

    @property({
        type: 'number',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'assigned_admin_id', dataType: 'integer', nullable: 'YES' },
    })
    assignedAdminId?: number | null;

    @property({
        type: 'string',
        required: true,
        jsonSchema: {
            nullable: false,
        },
        postgresql: {
            columnName: 'trailer_container_type',
            dataType: 'character varying',
            dataLength: 50,
            nullable: 'NO',
        },
    })
    trailerContainerType: string;

    @property({
        type: 'boolean',
        default: false,
        jsonSchema: { nullable: false },
        postgresql: { columnName: 'completing_customs_clearance', dataType: 'boolean', nullable: 'NO' },
    })
    completingCustomsClearance: boolean;

    @property({
        type: 'number',
        required: true,
        jsonSchema: { nullable: false },
        postgresql: { columnName: 'number_of_loads', dataType: 'integer', nullable: 'NO' },
    })
    numberOfLoads: number;

    @property({
        type: 'number',
        required: true,
        jsonSchema: { nullable: false },
        precision: 12,
        scale: 2,
        postgresql: {
            columnName: 'quantity_per_load',
            dataType: 'numeric',
            dataPrecision: 12,
            dataScale: 2,
            nullable: 'NO',
        },
    })
    quantityPerLoad: number;

    @property({
        type: 'number',
        required: true,
        jsonSchema: { nullable: false },
        precision: 12,
        scale: 2,
        postgresql: {
            columnName: 'haulage_cost_per_load',
            dataType: 'numeric',
            dataPrecision: 12,
            dataScale: 2,
            nullable: 'NO',
        },
    })
    haulageCostPerLoad: number;

    @property({
        type: 'string',
        required: true,
        jsonSchema: {
            nullable: false,
            enum: Object.values(ECurrency),
        },
        postgresql: { columnName: 'currency', dataType: 'character varying', dataLength: 10, nullable: 'NO' },
    })
    currency: ECurrency;

    @property({
        type: 'number',
        required: true,
        jsonSchema: { nullable: false },
        precision: 12,
        scale: 2,
        postgresql: { columnName: 'customs_fee', dataType: 'numeric', dataPrecision: 12, dataScale: 2, nullable: 'NO' },
    })
    customsFee: number;

    @property({
        type: 'number',
        required: true,
        jsonSchema: { nullable: false },
        precision: 12,
        scale: 2,
        postgresql: {
            columnName: 'haulage_total',
            dataType: 'numeric',
            dataPrecision: 12,
            dataScale: 2,
            nullable: 'NO',
        },
    })
    haulageTotal: number;

    @property({
        type: 'string',
        required: true,
        jsonSchema: {
            nullable: false,
            enum: Object.values(TransportProvider),
        },
        postgresql: { columnName: 'transport_provider', dataType: 'character varying', dataLength: 50, nullable: 'NO' },
    })
    transportProvider: TransportProvider;

    @property({
        type: 'date',
        required: true,
        jsonSchema: { nullable: false },
        postgresql: {
            columnName: 'suggested_collection_date',
            dataType: 'timestamp without time zone',
            nullable: 'NO',
        },
    })
    suggestedCollectionDate: Date;

    @property({
        type: 'string',
        required: true,
        jsonSchema: {
            nullable: false,
            enum: Object.values(ExpectedTransitTime),
        },
        postgresql: {
            columnName: 'expected_transit_time',
            dataType: 'character varying',
            dataLength: 20,
            nullable: 'NO',
        },
    })
    expectedTransitTime: ExpectedTransitTime;

    @property({
        type: 'number',
        required: true,
        jsonSchema: { nullable: false },
        postgresql: { columnName: 'demurrage_at_destination', dataType: 'integer', nullable: 'NO' },
    })
    demurrageAtDestination: number;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'notes', dataType: 'text', nullable: 'YES' },
    })
    notes?: string;

    @property({
        type: 'string',
        required: true,
        default: HaulageOfferStatus.PENDING,
        jsonSchema: {
            nullable: false,
            enum: Object.values(HaulageOfferStatus),
        },
        postgresql: { columnName: 'status', dataType: 'character varying', dataLength: 30, nullable: 'NO' },
    })
    status: HaulageOfferStatus;

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
        type: 'number',
        jsonSchema: { nullable: true },
        postgresql: {
            columnName: 'shipped_loads',
            dataType: 'integer',
            nullable: 'YES',
        },
    })
    shippedLoads?: number;

    @property({
        type: 'date',
        jsonSchema: { nullable: true },
        postgresql: {
            columnName: 'shipped_date',
            dataType: 'timestamp without time zone',
            nullable: 'YES',
        },
    })
    shippedDate?: Date;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: {
            columnName: 'rejection_reason',
            dataType: 'character varying',
            dataLength: 100,
            nullable: 'YES',
        },
    })
    rejectionReason?: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: {
            columnName: 'custom_rejection_reason',
            dataType: 'text',
            nullable: 'YES',
        },
    })
    customRejectionReason?: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: {
            columnName: 'admin_message',
            dataType: 'text',
            nullable: 'YES',
        },
    })
    adminMessage?: string;

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

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: {
            columnName: 'destination_charges',
            dataType: 'character varying',
            dataLength: 50,
            nullable: 'YES',
        },
    })
    destinationCharges?: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: {
            columnName: 'haulage_extras',
            dataType: 'text',
            nullable: 'YES',
        },
    })
    haulageExtras?: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: {
            columnName: 'so_details',
            dataType: 'text',
            nullable: 'YES',
        },
    })
    soDetails?: string;

    constructor(data?: Partial<HaulageOffers>) {
        super(data);
    }
}

export interface HaulageOffersRelations {
    haulierUser?: User;
    haulierCompany?: Companies;
    listing?: Listings;
    loads?: HaulageLoads[];
}

export type HaulageOffersWithRelations = HaulageOffers & HaulageOffersRelations;
