import { Entity, model, property } from '@loopback/repository';
import { FleetType, UserPrefix, WhereDidYouHearAboutUs } from '../enum';
@model()
export class RegisterHaulierRequest extends Entity {
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
        jsonSchema: { nullable: false, enum: Object.values(UserPrefix) },
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
    phoneNumberUser: string;

    @property({
        type: 'string',
        maxLength: 30,
    })
    mobileNumberUser?: string;

    @property({
        type: 'string',
        required: false,
        maxLength: 255,
        jsonSchema: { nullable: true, enum: Object.values(WhereDidYouHearAboutUs) },
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
        maxLength: 20,
        required: true,
    })
    registrationNumber: string;

    @property({
        type: 'string',
        maxLength: 20,
        required: true,
    })
    vatNumber: string;

    @property({
        type: 'string',
        required: true,
    })
    vatRegistrationCountry: string;

    @property({
        type: 'string',
        maxLength: 100,
        required: true,
    })
    addressLine1: string;

    @property({
        type: 'string',
        maxLength: 100,
    })
    addressLine2?: string;

    @property({
        type: 'string',
        maxLength: 20,
        required: true,
    })
    postalCode: string;

    @property({
        type: 'string',
        maxLength: 100,
        required: true,
    })
    city: string;

    @property({
        type: 'string',
        maxLength: 50,
        required: true,
    })
    stateProvince: string;

    @property({
        type: 'string',
        maxLength: 20,
        required: true,
    })
    country: string;

    @property({
        type: 'string',
        maxLength: 30,
        required: true,
    })
    phoneNumberCompany: string;

    @property({
        type: 'string',
        maxLength: 30,
        required: false,
    })
    mobileNumberCompany: string;

    @property({
        type: 'string',
        required: false,
        jsonSchema: { nullable: true, enum: Object.values(FleetType) },
    })
    fleetType: FleetType;

    @property({
        type: 'array',
        itemType: 'string',
        required: false,
    })
    areasCovered: string[];

    @property({
        type: 'array',
        itemType: 'string',
        required: false,
    })
    containerTypes: string[];

    @property({
        type: 'array',
        itemType: 'object',
        required: true,
        jsonSchema: {
            items: {
                type: 'object',
                properties: {
                    documentType: { type: 'string' },
                    documentUrl: { type: 'string' },
                    expiryDate: { type: 'string' },
                },
                required: ['documentType', 'documentUrl', 'expiryDate'],
            },
        },
    })
    documents: Array<{
        documentType: string;
        documentUrl: string;
        expiryDate: string;
    }>;

    // @property({
    //     type: 'array',
    //     itemType: 'string',
    //     required: true,
    // })
    // documentUrl: string[];

    // @property({
    //     type: 'array',
    //     itemType: 'string',
    //     required: true,
    // })
    // expiryDate: string[];

    constructor(data?: Partial<RegisterHaulierRequest>) {
        super(data);
    }
}
