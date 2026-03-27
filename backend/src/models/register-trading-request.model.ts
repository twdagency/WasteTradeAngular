import { Entity, model, property } from '@loopback/repository';
import { UserPrefix, CompanyInterest, WhereDidYouHearAboutUs } from '../enum';
@model()
export class RegisterTradingRequest extends Entity {
    @property({
        type: 'string',
        required: true,
        format: 'email',
    })
    email: string;

    @property({
        type: 'string',
        required: true,
    })
    password: string;

    @property({
        type: 'string',
        required: true,
        minLength: 1,
        maxLength: 50,
    })
    firstName: string;

    @property({
        type: 'string',
        required: true,
        minLength: 1,
        maxLength: 50,
    })
    lastName: string;

    @property({
        type: 'string',
        minLength: 1,
        maxLength: 5,
        required: true,
        jsonSchema: {
            enum: Object.values(UserPrefix),
        },
    })
    prefix: UserPrefix;

    @property({
        type: 'string',
        minLength: 1,
        maxLength: 50,
        required: true,
    })
    jobTitle: string;

    @property({
        type: 'string',
        required: true,
        maxLength: 30,
    })
    phoneNumber: string;

    @property({
        type: 'string',
        maxLength: 30,
    })
    mobileNumber?: string;

    @property({
        type: 'string',
        required: false,
        maxLength: 255,
        jsonSchema: {
            nullable: true,
            enum: Object.values(WhereDidYouHearAboutUs),
        },
    })
    whereDidYouHearAboutUs: WhereDidYouHearAboutUs;

    @property({
        type: 'string',
        maxLength: 100,
        required: true,
    })
    companyName: string;

    @property({
        type: 'string',
        jsonSchema: {
            enum: Object.values(CompanyInterest),
        },
        required: false,
    })
    companyInterest: CompanyInterest;

    @property({
        type: 'array',
        itemType: 'string',
        required: false,
    })
    favoriteMaterials: string[];

    @property({
        type: 'string',
        required: false,
        maxLength: 100,
    })
    otherMaterial: string;

    constructor(data?: Partial<RegisterTradingRequest>) {
        super(data);
    }
}
