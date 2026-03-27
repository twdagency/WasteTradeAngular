import { Entity, model, property, belongsTo } from '@loopback/repository';
import { HaulageOffers } from './haulage-offers.model';

@model({
    settings: {
        idInjection: false,
        postgresql: { schema: 'public', table: 'haulage_loads' },
    },
})
export class HaulageLoads extends Entity {
    @property({
        type: 'number',
        generated: true,
        id: true,
        postgresql: { columnName: 'id', dataType: 'integer', nullable: 'NO' },
    })
    id?: number;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'load_number', dataType: 'character varying', dataLength: 50, nullable: 'YES' },
    })
    loadNumber?: string; // "1 of 3", "2 of 3", etc.

    @property({
        type: 'date',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'collection_date', dataType: 'date', nullable: 'YES' },
    })
    collectionDate?: Date;

    @property({
        type: 'date',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'shipped_date', dataType: 'timestamp without time zone', nullable: 'YES' },
    })
    shippedDate?: Date;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'gross_weight', dataType: 'character varying', dataLength: 255, nullable: 'YES' },
    })
    grossWeight?: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'pallet_weight', dataType: 'character varying', dataLength: 255, nullable: 'YES' },
    })
    palletWeight?: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: {
            columnName: 'load_status',
            dataType: 'character varying',
            dataLength: 50,
            nullable: 'YES',
        },
    })
    loadStatus?: string; // Awaiting Collection, In Transit, Delivered

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
        type: 'date',
        default: () => new Date(),
        jsonSchema: { nullable: false },
        postgresql: { columnName: 'created_at', dataType: 'timestamp without time zone', nullable: 'NO' },
    })
    createdAt: Date;

    @property({
        type: 'date',
        default: () => new Date(),
        jsonSchema: { nullable: false },
        postgresql: { columnName: 'updated_at', dataType: 'timestamp without time zone', nullable: 'NO' },
    })
    updatedAt: Date;

    @belongsTo(() => HaulageOffers, {}, {postgresql: {columnName: 'haulage_offer_id'}})
    haulageOfferId: number;

    constructor(data?: Partial<HaulageLoads>) {
        super(data);
    }
}

export interface HaulageLoadsRelations {
    haulageOffer?: HaulageOffers;
}

export type HaulageLoadsWithRelations = HaulageLoads & HaulageLoadsRelations;
