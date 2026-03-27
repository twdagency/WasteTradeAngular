import { Entity, model, property } from '@loopback/repository';
import { CompanyInterest, CompanyStatus, CompanyType, FleetType } from '../enum';
import { ICompanyAdditionalSocialMediaUrl } from '../types';
@model({
    settings: { idInjection: false, postgresql: { schema: 'public', table: 'companies' } },
})
export class Companies extends Entity {
    @property({
        type: 'number',
        jsonSchema: { nullable: false },
        generated: true,
        id: true,
        postgresql: { columnName: 'id', dataType: 'integer', nullable: 'NO' },
    })
    id?: number;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        length: 3,
        postgresql: { columnName: 'country_code', dataType: 'character varying', dataLength: 3, nullable: 'YES' },
    })
    countryCode?: string;

    @property({
        type: 'string',
        required: true,
        jsonSchema: { nullable: false },
        postgresql: { columnName: 'name', dataType: 'character varying', dataLength: 255, nullable: 'NO' },
    })
    name: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        length: 100,
        postgresql: {
            columnName: 'registration_number',
            dataType: 'character varying',
            dataLength: 100,
            nullable: 'YES',
        },
    })
    registrationNumber?: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'email', dataType: 'character varying', dataLength: 255, nullable: 'YES' },
    })
    email?: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        length: 100,
        postgresql: { columnName: 'vat_number', dataType: 'character varying', dataLength: 100, nullable: 'YES' },
    })
    vatNumber?: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        length: 100,
        postgresql: {
            columnName: 'vat_registration_country',
            dataType: 'character varying',
            dataLength: 100,
            nullable: 'YES',
        },
    })
    vatRegistrationCountry?: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'address_line_1', dataType: 'character varying', dataLength: 255, nullable: 'YES' },
    })
    addressLine1?: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'address_line_2', dataType: 'character varying', dataLength: 255, nullable: 'YES' },
    })
    addressLine2?: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        length: 100,
        postgresql: { columnName: 'city', dataType: 'character varying', dataLength: 100, nullable: 'YES' },
    })
    city?: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        length: 100,
        postgresql: { columnName: 'country', dataType: 'character varying', dataLength: 100, nullable: 'YES' },
    })
    country?: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        length: 100,
        postgresql: { columnName: 'state_province', dataType: 'character varying', dataLength: 100, nullable: 'YES' },
    })
    stateProvince?: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        length: 20,
        postgresql: { columnName: 'postal_code', dataType: 'character varying', dataLength: 20, nullable: 'YES' },
    })
    postalCode?: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'website', dataType: 'character varying', dataLength: 255, nullable: 'YES' },
    })
    website?: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        length: 30,
        postgresql: { columnName: 'phone_number', dataType: 'character varying', dataLength: 30, nullable: 'YES' },
    })
    phoneNumber?: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        length: 30,
        postgresql: { columnName: 'mobile_number', dataType: 'character varying', dataLength: 30, nullable: 'YES' },
    })
    mobileNumber?: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true, enum: Object.values(CompanyType) },
        length: 50,
        postgresql: { columnName: 'company_type', dataType: 'character varying', dataLength: 50, nullable: 'YES' },
    })
    companyType?: CompanyType;

    @property({
        type: 'array',
        itemType: 'string',
        required: false,
        postgresql: {
            columnName: 'favorite_materials',
            dataType: 'jsonb',
            nullable: 'YES',
        },
    })
    favoriteMaterials: string[];

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'other_material', dataType: 'character varying', dataLength: 500, nullable: 'YES' },
    })
    otherMaterial?: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true, enum: Object.values(CompanyInterest) },
        postgresql: {
            columnName: 'company_interest',
            dataType: 'character varying',
            dataLength: 20,
            nullable: 'YES',
        },
    })
    companyInterest?: CompanyInterest;

    @property({
        type: 'boolean',
        required: true,
        jsonSchema: { nullable: false },
        postgresql: { columnName: 'is_haulier', dataType: 'boolean', nullable: 'NO' },
    })
    isHaulier: boolean;

    @property({
        type: 'boolean',
        default: false,
        jsonSchema: { nullable: false },
        postgresql: { columnName: 'box_clearing_agent', dataType: 'boolean', nullable: 'NO' },
    })
    boxClearingAgent: boolean;

    @property({
        type: 'string',
        jsonSchema: { nullable: true, enum: Object.values(FleetType) },
        postgresql: { columnName: 'fleet_type', dataType: 'character varying', dataLength: 50, nullable: 'YES' },
    })
    fleetType?: FleetType;

    @property({
        type: 'array',
        itemType: 'string',
        jsonSchema: { nullable: true },
        postgresql: {
            columnName: 'areas_covered',
            dataType: 'jsonb',
            nullable: 'YES',
        },
    })
    areasCovered?: string[];

    @property({
        type: 'array',
        itemType: 'string',
        jsonSchema: { nullable: true },
        postgresql: {
            columnName: 'container_types',
            dataType: 'jsonb',
            nullable: 'YES',
        },
    })
    containerTypes?: string[];

    @property({
        type: 'string',
        required: true,
        jsonSchema: { nullable: false, enum: Object.values(CompanyStatus) },
        length: 20,
        postgresql: { columnName: 'status', dataType: 'character varying', dataLength: 20, nullable: 'NO' },
    })
    status: CompanyStatus;

    @property({
        type: 'date',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'verified_at', dataType: 'timestamp without time zone', nullable: 'YES' },
    })
    verifiedAt?: Date;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'facebook_url', dataType: 'character varying', dataLength: 255, nullable: 'YES' },
    })
    facebookUrl?: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'instagram_url', dataType: 'character varying', dataLength: 255, nullable: 'YES' },
    })
    instagramUrl?: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'linkedin_url', dataType: 'character varying', dataLength: 255, nullable: 'YES' },
    })
    linkedinUrl?: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'x_url', dataType: 'character varying', dataLength: 255, nullable: 'YES' },
    })
    xUrl?: string;

    @property({
        type: 'array',
        itemType: 'object',
        required: false,
        postgresql: { columnName: 'additional_social_media_urls', dataType: 'jsonb', default: [], nullable: 'YES' },
    })
    additionalSocialMediaUrls?: ICompanyAdditionalSocialMediaUrl[];

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'description', dataType: 'character varying', dataLength: 32000, nullable: 'YES' },
    })
    description?: string;

    @property({
        type: 'boolean',
        default: false,
        jsonSchema: { nullable: false },
        postgresql: { columnName: 'is_seller', dataType: 'boolean', nullable: 'NO' },
    })
    isSeller: boolean;

    @property({
        type: 'boolean',
        default: true,
        jsonSchema: { nullable: false },
        postgresql: { columnName: 'is_buyer', dataType: 'boolean', nullable: 'NO' },
    })
    isBuyer: boolean;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'rejection_reason', dataType: 'character varying', dataLength: 255, nullable: 'YES' },
    })
    rejectionReason?: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: {
            columnName: 'info_request_type',
            dataType: 'character varying',
            dataLength: 100,
            nullable: 'YES',
        },
    })
    infoRequestType?: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'admin_message', dataType: 'character varying', dataLength: 500, nullable: 'YES' },
    })
    adminMessage?: string;

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

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: {
            columnName: 'salesforce_id',
            dataType: 'character varying',
            dataLength: 50,
            nullable: 'YES',
        },
    })
    salesforceId?: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: {
            columnName: 'salesforce_account_id',
            dataType: 'character varying',
            dataLength: 50,
            nullable: 'YES',
        },
    })
    salesforceAccountId?: string;

    constructor(data?: Partial<Companies>) {
        super(data);
    }
}

export interface CompaniesRelations {
    // describe navigational properties here
}

export type CompaniesWithRelations = Companies & CompaniesRelations;
