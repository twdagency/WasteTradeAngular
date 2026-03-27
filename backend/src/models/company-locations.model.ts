import { belongsTo, Entity, model, property } from '@loopback/repository';
import { Companies } from './companies.model';
import { UserPrefix } from '../enum';

@model({
    settings: { idInjection: false, postgresql: { schema: 'public', table: 'company_locations' } },
})
export class CompanyLocations extends Entity {
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
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'location_name', dataType: 'character varying', dataLength: 255, nullable: 'YES' },
    })
    locationName: string;

    @property({
        type: 'string',
        jsonSchema: {
            enum: Object.values(UserPrefix),
            nullable: true,
        },
        default: 'mr',
        postgresql: {
            columnName: 'prefix',
            dataType: 'character varying',
            dataLength: 5,
            nullable: 'YES',
            default: 'mr',
        },
    })
    prefix: UserPrefix;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'first_name', dataType: 'character varying', dataLength: 255, nullable: 'YES' },
    })
    firstName: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'last_name', dataType: 'character varying', dataLength: 255, nullable: 'YES' },
    })
    lastName: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: {
            columnName: 'position_in_company',
            dataType: 'character varying',
            dataLength: 255,
            nullable: 'YES',
        },
    })
    positionInCompany: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: {
            columnName: 'site_point_contact',
            dataType: 'character varying',
            dataLength: 255,
            nullable: 'YES',
        },
    })
    sitePointContact: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'phone_number', dataType: 'character varying', dataLength: 255, nullable: 'YES' },
    })
    phoneNumber: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'address_line', dataType: 'character varying', dataLength: 255, nullable: 'YES' },
    })
    addressLine: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'street', dataType: 'character varying', dataLength: 255, nullable: 'YES' },
    })
    street: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'postcode', dataType: 'character varying', dataLength: 255, nullable: 'YES' },
    })
    postcode: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'city', dataType: 'character varying', dataLength: 255, nullable: 'YES' },
    })
    city: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'country', dataType: 'character varying', dataLength: 255, nullable: 'YES' },
    })
    country: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'state_province', dataType: 'character varying', dataLength: 255, nullable: 'YES' },
    })
    stateProvince: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'office_open_time', dataType: 'time without time zone', nullable: 'YES' },
    })
    officeOpenTime: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'office_close_time', dataType: 'time without time zone', nullable: 'YES' },
    })
    officeCloseTime: string;

    @property({
        type: 'boolean',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'loading_ramp', dataType: 'boolean', nullable: 'YES' },
    })
    loadingRamp: boolean;

    @property({
        type: 'boolean',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'weighbridge', dataType: 'boolean', nullable: 'YES' },
    })
    weighbridge: boolean;

    @property({
        type: 'array',
        itemType: 'string',
        jsonSchema: { nullable: true },
        postgresql: {
            columnName: 'container_type',
            dataType: 'jsonb',
            nullable: 'YES',
        },
    })
    containerType: string[];

    @property({
        type: 'array',
        itemType: 'string',
        jsonSchema: { nullable: true },
        postgresql: {
            columnName: 'accepted_materials',
            dataType: 'jsonb',
            nullable: 'YES',
        },
    })
    acceptedMaterials: string[];

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: {
            columnName: 'site_specific_instructions',
            dataType: 'text',
            nullable: 'YES',
        },
    })
    siteSpecificInstructions: string;

    @property({
        type: 'boolean',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'self_load_unload_capability', dataType: 'boolean', nullable: 'YES' },
    })
    selfLoadUnLoadCapability: boolean;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: {
            columnName: 'access_restrictions',
            dataType: 'character varying',
            dataLength: 255,
            nullable: 'YES',
        },
    })
    accessRestrictions: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: {
            columnName: 'other_material',
            dataType: 'text',
            nullable: 'YES',
        },
    })
    otherMaterial: string;

    @property({
        type: 'boolean',
        jsonSchema: { nullable: true },
        default: false,
        postgresql: {
            columnName: 'main_location',
            dataType: 'boolean',
            nullable: 'YES',
            default: false,
        },
    })
    mainLocation: boolean;

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

    @belongsTo(() => Companies, {}, {postgresql: {columnName: 'company_id'}})
    companyId: number;

    constructor(data?: Partial<CompanyLocations>) {
        super(data);
    }
}

export interface CompanyLocationsRelations {
    // describe navigational properties here
}

export type CompanyLocationsWithRelations = CompanyLocations & CompanyLocationsRelations;
