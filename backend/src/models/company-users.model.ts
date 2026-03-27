import { Entity, model, property, belongsTo } from '@loopback/repository';
import { Companies } from './companies.model';
import { User } from './user.model';

@model({
    settings: { idInjection: false, postgresql: { schema: 'public', table: 'company_users' } },
})
export class CompanyUsers extends Entity {
    @property({
        type: 'number',
        jsonSchema: { nullable: false },
        id: true,
        generated: true,
        postgresql: { columnName: 'id', dataType: 'integer', nullable: 'NO' },
    })
    id?: number;

    @property({
        type: 'string',
        required: true,
        jsonSchema: { nullable: false },
        length: 20,
        postgresql: { columnName: 'company_role', dataType: 'character varying', dataLength: 20, nullable: 'NO' },
    })
    companyRole: string;

    @property({
        type: 'boolean',
        required: true,
        jsonSchema: { nullable: false },
        postgresql: { columnName: 'is_primary_contact', dataType: 'boolean', nullable: 'NO' },
    })
    isPrimaryContact: boolean;

    @property({
        type: 'string',
        required: true,
        jsonSchema: { nullable: false },
        length: 20,
        postgresql: { columnName: 'status', dataType: 'character varying', dataLength: 20, nullable: 'NO' },
    })
    status: string;

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

    // Salesforce Contact sync fields
    @property({
        type: 'string',
        postgresql: { columnName: 'salesforce_id', dataType: 'character varying', dataLength: 18, nullable: 'YES' },
    })
    salesforceId?: string;

    @property({
        type: 'boolean',
        default: false,
        postgresql: { columnName: 'is_synced_salesforce', dataType: 'boolean', nullable: 'YES' },
    })
    isSyncedSalesForce?: boolean;

    @property({
        type: 'date',
        postgresql: { columnName: 'last_synced_salesforce_date', dataType: 'timestamp without time zone', nullable: 'YES' },
    })
    lastSyncedSalesForceDate?: Date;

    @belongsTo(() => Companies, {}, {postgresql: {columnName: 'company_id'}})
    companyId: number;

    @belongsTo(() => User, {}, {postgresql: {columnName: 'user_id'}})
    userId: number;
    // Define well-known properties here

    constructor(data?: Partial<CompanyUsers>) {
        super(data);
    }
}

export interface CompanyUsersRelations {
    user: User;
    company: Companies;
    // describe navigational properties here
}

export type CompanyUsersWithRelations = CompanyUsers & CompanyUsersRelations;
