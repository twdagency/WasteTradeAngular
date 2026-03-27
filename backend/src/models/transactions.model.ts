import { Entity, model, property } from '@loopback/repository';
import { Base } from './base.model';
import { ECurrency } from '../enum';

@model({
    settings: { idInjection: false, postgresql: { schema: 'public', table: 'transactions' } },
})
export class Transactions extends Base {
    @property({
        type: 'number',
        required: true,
        jsonSchema: { nullable: false },
        id: 1,
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
        postgresql: { columnName: 'listing_id', dataType: 'integer', nullable: 'NO' },
    })
    listingId: number;

    @property({
        type: 'number',
        required: true,
        jsonSchema: { nullable: false },
        postgresql: { columnName: 'buyer_company_id', dataType: 'integer', nullable: 'NO' },
    })
    buyerCompanyId: number;

    @property({
        type: 'number',
        required: true,
        jsonSchema: { nullable: false },
        postgresql: { columnName: 'seller_company_id', dataType: 'integer', nullable: 'NO' },
    })
    sellerCompanyId: number;

    @property({
        type: 'number',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'haulier_company_id', dataType: 'integer', nullable: 'YES' },
    })
    haulierCompanyId?: number;

    @property({
        type: 'string',
        required: true,
        jsonSchema: { nullable: false },
        length: 50,
        postgresql: { columnName: 'transaction_ref', dataType: 'character varying', dataLength: 50, nullable: 'NO' },
    })
    transactionRef: string;

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
        postgresql: { columnName: 'unit_price', dataType: 'numeric', dataPrecision: 12, dataScale: 2, nullable: 'NO' },
    })
    unitPrice: number;

    @property({
        type: 'number',
        required: true,
        jsonSchema: { nullable: false },
        precision: 12,
        scale: 2,
        postgresql: {
            columnName: 'transport_cost',
            dataType: 'numeric',
            dataPrecision: 12,
            dataScale: 2,
            nullable: 'NO',
        },
    })
    transportCost: number;

    @property({
        type: 'number',
        required: true,
        jsonSchema: { nullable: false },
        precision: 12,
        scale: 2,
        postgresql: {
            columnName: 'total_amount',
            dataType: 'numeric',
            dataPrecision: 12,
            dataScale: 2,
            nullable: 'NO',
        },
    })
    totalAmount: number;

    @property({
        type: 'string',
        jsonSchema: { nullable: true, enum: Object.values(ECurrency) },
        length: 3,
        postgresql: { columnName: 'currency', dataType: 'character varying', dataLength: 3, nullable: 'YES' },
    })
    currency?: ECurrency;

    @property({
        type: 'string',
        required: true,
        jsonSchema: { nullable: false },
        length: 20,
        postgresql: { columnName: 'status', dataType: 'character varying', dataLength: 20, nullable: 'NO' },
    })
    status: string;

    @property({
        type: 'string',
        required: true,
        jsonSchema: { nullable: false },
        length: 20,
        postgresql: { columnName: 'payment_status', dataType: 'character varying', dataLength: 20, nullable: 'NO' },
    })
    paymentStatus: string;

    @property({
        type: 'date',
        jsonSchema: { nullable: true },
        postgresql: {
            columnName: 'expected_collection_date',
            dataType: 'timestamp without time zone',
            nullable: 'YES',
        },
    })
    expectedCollectionDate?: string;

    @property({
        type: 'date',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'actual_collection_date', dataType: 'timestamp without time zone', nullable: 'YES' },
    })
    actualCollectionDate?: string;

    @property({
        type: 'date',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'expected_delivery_date', dataType: 'timestamp without time zone', nullable: 'YES' },
    })
    expectedDeliveryDate?: string;

    @property({
        type: 'date',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'actual_delivery_date', dataType: 'timestamp without time zone', nullable: 'YES' },
    })
    actualDeliveryDate?: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'buyer_feedback', dataType: 'text', nullable: 'YES' },
    })
    buyerFeedback?: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'seller_feedback', dataType: 'text', nullable: 'YES' },
    })
    sellerFeedback?: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'haulier_feedback', dataType: 'text', nullable: 'YES' },
    })
    haulierFeedback?: string;

    @property({
        type: 'number',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'buyer_rating', dataType: 'integer', nullable: 'YES' },
    })
    buyerRating?: number;

    @property({
        type: 'number',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'seller_rating', dataType: 'integer', nullable: 'YES' },
    })
    sellerRating?: number;

    @property({
        type: 'number',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'haulier_rating', dataType: 'integer', nullable: 'YES' },
    })
    haulierRating?: number;

    // Define well-known properties here

    constructor(data?: Partial<Transactions>) {
        super(data);
    }
}

export interface TransactionsRelations {
    // describe navigational properties here
}

export type TransactionsWithRelations = Transactions & TransactionsRelations;
