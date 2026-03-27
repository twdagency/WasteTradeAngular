import { belongsTo, model, property } from '@loopback/repository';
import { Base } from './base.model';
import { User } from './user.model';
import { Companies } from './companies.model';

@model({
    settings: {
        idInjection: false,
        postgresql: {
            schema: 'public',
            table: 'audit_trails',
        },
    },
})
export class AuditTrail extends Base {
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
        postgresql: { columnName: 'type', dataType: 'character varying', dataLength: 100 },
    })
    type: string;

    @property({
        type: 'string',
        required: true,
        jsonSchema: { nullable: false },
        postgresql: { columnName: 'action', dataType: 'character varying', dataLength: 500 },
    })
    action: string;

    @property({
        type: 'string',
        required: true,
        jsonSchema: { nullable: false },
        postgresql: { columnName: 'method', dataType: 'character varying', dataLength: 10 },
    })
    method: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'ip_address', dataType: 'character varying', dataLength: 45, nullable: 'YES' },
    })
    ipAddress?: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'user_agent', dataType: 'text', nullable: 'YES' },
    })
    userAgent?: string;

    @property({
        type: 'object',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'request_body', dataType: 'jsonb', nullable: 'YES' },
    })
    requestBody?: object;

    @property({
        type: 'number',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'response_status', dataType: 'integer', nullable: 'YES' },
    })
    responseStatus?: number;

    @property({
        type: 'string',
        required: true,
        jsonSchema: { nullable: false },
        postgresql: { columnName: 'logged_user_name', dataType: 'character varying', dataLength: 500 },
    })
    loggedUserName: string;

    @property({
        type: 'string',
        required: true,
        jsonSchema: { nullable: false },
        postgresql: { columnName: 'logged_user_role', dataType: 'character varying', dataLength: 100 },
    })
    loggedUserRole: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: false },
        postgresql: { columnName: 'logged_company_name', dataType: 'character varying', dataLength: 500 },
    })
    loggedCompanyName: string;

    @property({
        type: 'string',
        required: true,
        jsonSchema: { nullable: false },
        postgresql: { columnName: 'site_type', dataType: 'character varying', dataLength: 100 },
    })
    siteType: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'username', dataType: 'character varying', dataLength: 500, nullable: 'YES' },
    })
    username: string;

    @belongsTo(
        () => User,
        {
            keyFrom: 'userId',
            keyTo: 'id',
        },
        {
            postgresql: {
                columnName: 'user_id',
                dataType: 'integer',
                nullable: 'YES',
            },
        },
    )
    userId?: number;

    @belongsTo(
        () => Companies,
        {
            keyFrom: 'companyId',
            keyTo: 'id',
        },
        {
            postgresql: {
                columnName: 'company_id',
                dataType: 'integer',
                nullable: 'YES',
            },
        },
    )
    companyId?: number;

    constructor(data?: Partial<AuditTrail>) {
        super(data);
    }
}

export interface AuditTrailRelations {
    user: User;
    company: Companies;
    // describe navigational properties here
}

export type AuditTrailWithRelations = AuditTrail & AuditTrailRelations;
