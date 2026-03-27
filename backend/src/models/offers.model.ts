import { Entity, model, property } from '@loopback/repository';
import { Base } from './base.model';
import { OfferState, OfferStatusEnum, ECurrency } from '../enum';
import { AdminNote } from './admin-note.model';
import { AssignAdmin } from './assign-admin.model';
import { Filter } from '@loopback/repository';
@model({
    settings: { idInjection: false, postgresql: { schema: 'public', table: 'offers' } },
})
export class Offers extends Base {
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
        postgresql: { columnName: 'listing_id', dataType: 'integer', nullable: 'NO' },
    })
    listingId: number;

    @property({
        type: 'number',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'buyer_company_id', dataType: 'integer', nullable: '  ' },
    })
    buyerCompanyId: number;

    @property({
        type: 'number',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'buyer_user_id', dataType: 'integer', nullable: 'YES' },
    })
    buyerUserId: number;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'buyer_country', dataType: 'character varying', dataLength: 255, nullable: 'YES' },
    })
    buyerCountry: string;

    @property({
        type: 'number',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'buyer_location_id', dataType: 'integer', nullable: 'YES' },
    })
    buyerLocationId?: number;

    @property({
        type: 'number',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'seller_company_id', dataType: 'integer', nullable: 'YES' },
    })
    sellerCompanyId: number;

    @property({
        type: 'number',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'seller_user_id', dataType: 'integer', nullable: 'YES' },
    })
    sellerUserId: number;

    @property({
        type: 'number',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'seller_location_id', dataType: 'integer', nullable: 'YES' },
    })
    sellerLocationId: number;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'seller_country', dataType: 'character varying', dataLength: 255, nullable: 'YES' },
    })
    sellerCountry: string;

    @property({
        type: 'number',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'created_by_user_id', dataType: 'integer', nullable: 'YES' },
    })
    createdByUserId: number;

    @property({
        type: 'number',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'assigned_admin_id', dataType: 'integer', nullable: 'YES' },
    })
    assignedAdminId?: number | null;

    @property({
        type: 'number',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'rejected_by_user_id', dataType: 'integer', nullable: 'YES' },
    })
    rejectedByUserId?: number;

    @property({
        type: 'number',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'accepted_by_user_id', dataType: 'integer', nullable: 'YES' },
    })
    acceptedByUserId?: number;

    @property({
        type: 'number',
        required: true,
        jsonSchema: { nullable: false },
        precision: 12,
        scale: 2,
        postgresql: { columnName: 'quantity', dataType: 'numeric', dataPrecision: 12, dataScale: 2, nullable: 'NO' },
    })
    quantity: number;

    @property({
        type: 'number',
        required: true,
        jsonSchema: { nullable: false },
        precision: 12,
        scale: 2,
        postgresql: {
            columnName: 'offered_price_per_unit',
            dataType: 'numeric',
            dataPrecision: 12,
            dataScale: 2,
            nullable: 'NO',
        },
    })
    offeredPricePerUnit: number;

    @property({
        type: 'string',
        jsonSchema: {
            nullable: true,
            enum: Object.values(ECurrency),
            description: 'Currency code (gbp, usd, eur)',
        },
        length: 10,
        postgresql: { columnName: 'currency', dataType: 'character varying', dataLength: 10, nullable: 'YES' },
    })
    currency?: ECurrency;

    @property({
        type: 'number',
        required: true,
        jsonSchema: { nullable: false },
        precision: 12,
        scale: 2,
        postgresql: { columnName: 'total_price', dataType: 'numeric', dataPrecision: 12, dataScale: 2, nullable: 'NO' },
    })
    totalPrice: number;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'message', dataType: 'text', nullable: 'YES' },
    })
    message?: string;

    @property({
        type: 'string',
        jsonSchema: {
            nullable: true,
            enum: Object.values(OfferState),
            description: 'Offer state (pending, active, closed)',
        },
        length: 20,
        postgresql: { columnName: 'state', dataType: 'character varying', dataLength: 20, nullable: 'YES' },
    })
    state?: OfferState;

    @property({
        type: 'string',
        jsonSchema: {
            nullable: true,
            enum: Object.values(OfferStatusEnum),
            description: 'Offer status (pending, approved, accepted, rejected, shipped)',
        },
        length: 20,
        postgresql: { columnName: 'status', dataType: 'character varying', dataLength: 20, nullable: 'YES' },
    })
    status?: OfferStatusEnum;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        length: 10,
        postgresql: { columnName: 'incoterms', dataType: 'character varying', dataLength: 10, nullable: 'YES' },
    })
    incoterms?: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        length: 255,
        postgresql: { columnName: 'shipping_port', dataType: 'character varying', dataLength: 255, nullable: 'YES' },
    })
    shippingPort?: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'rejection_reason', dataType: 'text', nullable: 'YES' },
    })
    rejectionReason?: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true, enum: ['admin', 'seller', 'system'] },
        length: 10,
        postgresql: { columnName: 'rejection_source', dataType: 'character varying', dataLength: 10, nullable: 'YES' },
    })
    rejectionSource?: 'admin' | 'seller' | 'system';

    @property({
        type: 'boolean',
        jsonSchema: { nullable: false },
        postgresql: { columnName: 'needs_transport', dataType: 'boolean', nullable: 'NO' },
    })
    needsTransport: boolean;

    @property({
        type: 'date',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'earliest_delivery_date', dataType: 'timestamp without time zone', nullable: 'YES' },
    })
    earliestDeliveryDate?: Date;

    @property({
        type: 'date',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'latest_delivery_date', dataType: 'timestamp without time zone', nullable: 'YES' },
    })
    latestDeliveryDate?: Date;

    @property({
        type: 'date',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'accepted_at', dataType: 'timestamp without time zone', nullable: 'YES' },
    })
    acceptedAt?: Date;

    @property({
        type: 'date',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'expires_at', dataType: 'timestamp without time zone', nullable: 'YES' },
    })
    expiresAt?: Date;

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

    // Define well-known properties here

    constructor(data?: Partial<Offers>) {
        super(data);
    }
}

export interface OffersRelations {
    // describe navigational properties here
}

export type OffersWithRelations = Offers & OffersRelations;

// Custom filter interface for offers endpoint
export interface OffersFilter {
    isSeller?: boolean;
    materialItem?: string;
    listingId?: number;
}

// Extended filter type that includes custom parameters
export type OffersFilterExtended = Filter<Offers> & {
    where?: Filter<Offers>['where'] & OffersFilter;
};
