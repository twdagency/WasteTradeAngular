import { Entity, model, property } from '@loopback/repository';

@model({
    settings: {
        idInjection: false,
        postgresql: { schema: 'public', table: 'salesforce_sync_logs' },
    },
})
export class SalesforceSyncLog extends Entity {
    @property({
        type: 'number',
        generated: true,
        jsonSchema: { nullable: false },
        id: true,
        postgresql: { columnName: 'id', dataType: 'integer', nullable: 'NO' },
    })
    id?: number;

    @property({
        type: 'string',
        required: true,
        jsonSchema: { nullable: false },
        postgresql: { columnName: 'record_id', dataType: 'character varying', dataLength: 50, nullable: 'NO' },
    })
    recordId: string;

    @property({
        type: 'string',
        required: true,
        jsonSchema: { nullable: false },
        postgresql: { columnName: 'object_type', dataType: 'character varying', dataLength: 50, nullable: 'NO' },
    })
    objectType: string;

    @property({
        type: 'string',
        required: true,
        jsonSchema: { nullable: false, enum: ['CREATE', 'UPDATE', 'DELETE', 'CONVERT', 'UPSERT'] },
        postgresql: { columnName: 'operation', dataType: 'character varying', dataLength: 20, nullable: 'NO' },
    })
    operation: 'CREATE' | 'UPDATE' | 'DELETE' | 'CONVERT' | 'UPSERT';

    @property({
        type: 'string',
        required: true,
        default: 'OUTBOUND',
        jsonSchema: { nullable: false, enum: ['OUTBOUND', 'INBOUND'] },
        postgresql: { columnName: 'direction', dataType: 'character varying', dataLength: 20, nullable: 'NO' },
    })
    direction: 'OUTBOUND' | 'INBOUND';

    @property({
        type: 'string',
        required: true,
        jsonSchema: { nullable: false, enum: ['SUCCESS', 'FAILED', 'PENDING'] },
        postgresql: { columnName: 'status', dataType: 'character varying', dataLength: 20, nullable: 'NO' },
    })
    status: 'SUCCESS' | 'FAILED' | 'PENDING';

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'salesforce_id', dataType: 'character varying', dataLength: 50, nullable: 'YES' },
    })
    salesforceId?: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'error_message', dataType: 'text', nullable: 'YES' },
    })
    errorMessage?: string;

    @property({
        type: 'number',
        default: 0,
        jsonSchema: { nullable: false },
        postgresql: { columnName: 'retry_count', dataType: 'integer', nullable: 'NO' },
    })
    retryCount: number;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'source', dataType: 'character varying', dataLength: 100, nullable: 'YES' },
    })
    source?: string;

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

    constructor(data?: Partial<SalesforceSyncLog>) {
        super(data);
    }
}

export interface SalesforceSyncLogRelations {
    // describe navigational properties here
}

export type SalesforceSyncLogWithRelations = SalesforceSyncLog & SalesforceSyncLogRelations;
