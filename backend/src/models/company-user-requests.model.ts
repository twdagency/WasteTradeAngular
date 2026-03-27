import { Entity, model, property, belongsTo } from '@loopback/repository';
import { Companies } from './companies.model';
import { User } from './user.model';

@model({
    settings: { idInjection: false, postgresql: { schema: 'public', table: 'company_user_requests' } },
})
export class CompanyUserRequests extends Entity {
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
        postgresql: { columnName: 'role', dataType: 'character varying', dataLength: 20, nullable: 'NO' },
    })
    role: string;

    @property({
        type: 'string',
        required: true,
        jsonSchema: { nullable: false },
        length: 20,
        postgresql: { columnName: 'request_type', dataType: 'character varying', dataLength: 20, nullable: 'NO' },
    })
    requestType: string;

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
        postgresql: { columnName: 'token', dataType: 'character varying', dataLength: 255, nullable: 'YES' },
    })
    token?: string;

    @property({
        type: 'date',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'expires_at', dataType: 'timestamp without time zone', nullable: 'YES' },
    })
    expiresAt?: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'note', dataType: 'text', nullable: 'YES' },
    })
    note?: string;

    @property({
        type: 'date',
        required: true,
        jsonSchema: { nullable: false },
        postgresql: { columnName: 'created_at', dataType: 'timestamp without time zone', nullable: 'NO' },
    })
    createdAt: string;

    @property({
        type: 'number',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'invited_by_user_id', dataType: 'integer', nullable: 'YES' },
    })
    invitedByUserId?: number;

    @property({
        type: 'number',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'old_company_id', dataType: 'integer', nullable: 'YES' },
    })
    oldCompanyId?: number;

    @property({
        type: 'date',
        required: true,
        jsonSchema: { nullable: false },
        postgresql: { columnName: 'updated_at', dataType: 'timestamp without time zone', nullable: 'NO' },
    })
    updatedAt: string;

    @belongsTo(() => Companies, {}, {postgresql: {columnName: 'company_id'}})
    companyId: number;

    @belongsTo(() => User, {}, {postgresql: {columnName: 'user_id'}})
    userId: number;

    constructor(data?: Partial<CompanyUserRequests>) {
        super(data);
    }
}

export interface CompanyUserRequestsRelations {
    company?: Companies;
    user?: User;
}

export type CompanyUserRequestsWithRelations = CompanyUserRequests & CompanyUserRequestsRelations;
