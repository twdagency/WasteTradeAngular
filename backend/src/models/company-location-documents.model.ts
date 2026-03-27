import { Entity, model, property, belongsTo } from '@loopback/repository';
import { CompanyLocations } from './company-locations.model';

@model({
    settings: { idInjection: false, postgresql: { schema: 'public', table: 'company_location_documents' } },
})
export class CompanyLocationDocuments extends Entity {
    @property({
        type: 'number',
        jsonSchema: { nullable: false },
        id: true,
        generated: true,
        postgresql: { columnName: 'id', dataType: 'integer', nullable: 'NO' },
    })
    id?: number;

    @property({
        type: 'number',
        required: true,
        jsonSchema: { nullable: false },
        postgresql: { columnName: 'uploaded_by_user_id', dataType: 'integer', nullable: 'NO' },
    })
    uploadedByUserId: number;

    @property({
        type: 'number',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'reviewed_by_user_id', dataType: 'integer', nullable: 'YES' },
    })
    reviewedByUserId?: number;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'document_type', dataType: 'character varying', dataLength: 255, nullable: 'YES' },
    })
    documentType?: string;

    @property({
        type: 'string',
        required: true,
        jsonSchema: { nullable: false },
        postgresql: { columnName: 'document_name', dataType: 'character varying', dataLength: 255, nullable: 'NO' },
    })
    documentName: string;

    @property({
        type: 'string',
        required: true,
        jsonSchema: { nullable: false },
        postgresql: { columnName: 'document_url', dataType: 'character varying', dataLength: 255, nullable: 'NO' },
    })
    documentUrl: string;

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
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'rejection_reason', dataType: 'text', nullable: 'YES' },
    })
    rejectionReason?: string;

    @property({
        type: 'date',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'reviewed_at', dataType: 'timestamp without time zone', nullable: 'YES' },
    })
    reviewedAt?: Date;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'expiry_date', dataType: 'character varying', dataLength: 100, nullable: 'YES' },
    })
    expiryDate?: string;

    @property({
        type: 'date',
        jsonSchema: { nullable: false },
        postgresql: { columnName: 'created_at', dataType: 'timestamp without time zone', nullable: 'NO' },
    })
    createdAt: string;

    @property({
        type: 'date',
        jsonSchema: { nullable: false },
        postgresql: { columnName: 'updated_at', dataType: 'timestamp without time zone', nullable: 'NO' },
    })
    updatedAt: string;

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

    @belongsTo(() => CompanyLocations, {}, {postgresql: {columnName: 'company_location_id'}})
    companyLocationId: number;

    // Define well-known properties here

    constructor(data?: Partial<CompanyLocationDocuments>) {
        super(data);
    }
}

export interface CompanyLocationDocumentsRelations {
    // Describe navigational properties here
}

export type CompanyLocationDocumentsWithRelations = CompanyLocationDocuments & CompanyLocationDocumentsRelations;
