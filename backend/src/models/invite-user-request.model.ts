import { Model, model, property } from '@loopback/repository';

@model()
export class InviteUserToJoinCompany extends Model {
    @property({
        type: 'string',
        required: true,
    })
    email: string;

    @property({
        type: 'string',
        required: false,
    })
    role?: string;

    @property({
        type: 'string',
        required: false,
    })
    firstName?: string;

    @property({
        type: 'string',
        required: false,
    })
    lastName?: string;

    @property({
        type: 'string',
        required: false,
    })
    note?: string;

    @property({
        type: 'number',
        required: false,
    })
    companyId?: number;

    constructor(data?: Partial<InviteUserToJoinCompany>) {
        super(data);
    }
}

@model()
export class UserRequestToJoinCompany extends Model {
    @property({
        type: 'string',
        required: true,
    })
    email: string;

    @property({
        type: 'string',
        required: false,
    })
    role?: string;

    @property({
        type: 'string',
        required: false,
    })
    firstName?: string;

    @property({
        type: 'string',
        required: false,
    })
    lastName?: string;

    @property({
        type: 'string',
        required: false,
    })
    note?: string;

    @property({
        type: 'number',
        required: false,
    })
    companyId?: number;

    constructor(data?: Partial<UserRequestToJoinCompany>) {
        super(data);
    }
}
