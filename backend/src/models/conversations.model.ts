import { Entity, model, property } from '@loopback/repository';

@model({
    settings: { idInjection: false, postgresql: { schema: 'public', table: 'conversations' } },
})
export class Conversations extends Entity {
    @property({
        type: 'number',
        jsonSchema: { nullable: false },
        id: 1,
        postgresql: { columnName: 'id', dataType: 'integer', nullable: 'NO' },
    })
    id: number;

    @property({
        type: 'number',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'listing_id', dataType: 'integer', nullable: 'YES' },
    })
    listingId?: number;

    @property({
        type: 'number',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'offer_id', dataType: 'integer', nullable: 'YES' },
    })
    offerId?: number;

    @property({
        type: 'number',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'transaction_id', dataType: 'integer', nullable: 'YES' },
    })
    transactionId?: number;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        length: 255,
        postgresql: { columnName: 'title', dataType: 'character varying', dataLength: 255, nullable: 'YES' },
    })
    title?: string;

    @property({
        type: 'date',
        required: true,
        jsonSchema: { nullable: false },
        postgresql: { columnName: 'created_at', dataType: 'timestamp without time zone', nullable: 'NO' },
    })
    createdAt: string;

    @property({
        type: 'date',
        required: true,
        jsonSchema: { nullable: false },
        postgresql: { columnName: 'updated_at', dataType: 'timestamp without time zone', nullable: 'NO' },
    })
    updatedAt: string;

    // Define well-known properties here

    constructor(data?: Partial<Conversations>) {
        super(data);
    }
}

export interface ConversationsRelations {
    // describe navigational properties here
}

export type ConversationsWithRelations = Conversations & ConversationsRelations;
