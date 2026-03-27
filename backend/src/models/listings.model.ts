import { belongsTo, model, property } from '@loopback/repository';
import { Base } from './base.model';
import {
    ECurrency,
    ListingState,
    ListingStatus,
    ListingType,
    ListingUnit,
    MaterialColors,
    MaterialFinishing,
    MaterialFlowIndex,
    MaterialPacking,
    MaterialType,
    RenewalPeriod,
    WasteStoration,
} from '../enum';
import { AdminNote } from './admin-note.model';
import { AssignAdmin } from './assign-admin.model';
import { CompanyLocations } from './company-locations.model';

@model({
    settings: { idInjection: false, postgresql: { schema: 'public', table: 'listings' } },
})
export class Listings extends Base {
    @property({
        type: 'number',
        generated: true,
        jsonSchema: { nullable: false },
        id: true,
        postgresql: { columnName: 'id', dataType: 'integer', nullable: 'NO' },
    })
    id?: number;

    @property({
        type: 'number',
        required: true,
        jsonSchema: { nullable: false },
        postgresql: { columnName: 'company_id', dataType: 'integer', nullable: 'NO' },
    })
    companyId: number;

    @belongsTo(
        () => CompanyLocations,
        { name: 'location' },
        {
            type: 'number',
            jsonSchema: { nullable: true },
            postgresql: { columnName: 'location_id', dataType: 'integer', nullable: 'YES' },
        }
    )
    locationId?: number;

    @property({
        type: 'number',
        jsonSchema: { nullable: false },
        postgresql: { columnName: 'created_by_user_id', dataType: 'integer', nullable: 'NO' },
    })
    createdByUserId: number;

    @property({
        type: 'number',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'assigned_admin_id', dataType: 'integer', nullable: 'YES' },
    })
    assignedAdminId?: number | null;

    @property({
        type: 'string',
        required: true,
        jsonSchema: {
            nullable: false,
            enum: Object.values(MaterialType),
            description: 'Type of material (plastic, efw, fibre, rubber, metal)',
        },
        postgresql: { columnName: 'material_type', dataType: 'character varying', nullable: 'NO', dataLength: 255 },
    })
    materialType: MaterialType;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        length: 255,
        postgresql: { columnName: 'material_item', dataType: 'character varying', nullable: 'YES', dataLength: 255 },
    })
    materialItem?: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        length: 255,
        postgresql: { columnName: 'material_form', dataType: 'character varying', dataLength: 255, nullable: 'YES' },
    })
    materialForm?: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        length: 255,
        postgresql: { columnName: 'material_grading', dataType: 'character varying', dataLength: 255, nullable: 'YES' },
    })
    materialGrading?: string;
    @property({
        type: 'string',
        jsonSchema: {
            nullable: true,
            enum: Object.values(MaterialColors),
            description: 'Material color (black, blue, brown, coloured_jazz, green, grey, natural, red, white)',
        },
        postgresql: {
            columnName: 'material_color',
            dataType: 'character varying',
            dataLength: 255,
            nullable: 'YES',
        },
    })
    materialColor: MaterialColors;

    @property({
        type: 'string',
        jsonSchema: { nullable: true, enum: Object.values(MaterialFinishing) },
        length: 255,
        postgresql: {
            columnName: 'material_finishing',
            dataType: 'character varying',
            dataLength: 255,
            nullable: 'YES',
        },
    })
    materialFinishing: MaterialFinishing;

    @property({
        type: 'string',
        jsonSchema: { nullable: true, enum: Object.values(MaterialPacking) },
        postgresql: {
            columnName: 'material_packing',
            dataType: 'character varying',
            dataLength: 255,
            nullable: 'YES',
        },
    })
    materialPacking: MaterialPacking;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'country', dataType: 'character varying', dataLength: 255, nullable: 'YES' },
    })
    country: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true, enum: Object.values(ListingType) },
        postgresql: {
            columnName: 'listing_type',
            dataType: 'character varying',
            dataLength: 20,
            nullable: 'YES',
        },
    })
    listingType: ListingType;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'title', dataType: 'character varying', dataLength: 255, nullable: 'YES' },
    })
    title?: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'description', dataType: 'character varying', dataLength: 32000, nullable: 'YES' },
    })
    description?: string;

    @property({
        type: 'number',
        jsonSchema: { nullable: true, minimum: 0 },
        postgresql: { columnName: 'quantity', dataType: 'integer', nullable: 'YES' },
    })
    quantity?: number;

    @property({
        type: 'number',
        jsonSchema: { nullable: true, minimum: 0 },
        postgresql: { columnName: 'remaining_quantity', dataType: 'integer', nullable: 'YES' },
    })
    remainingQuantity?: number;

    @property({
        type: 'string',
        jsonSchema: { nullable: true, enum: Object.values(MaterialFlowIndex) },
        postgresql: {
            columnName: 'material_flow_index',
            dataType: 'character varying',
            dataLength: 255,
            nullable: 'YES',
        },
    })
    materialFlowIndex?: MaterialFlowIndex;

    @property({
        type: 'number',
        jsonSchema: { nullable: true, minimum: 0 },
        postgresql: {
            columnName: 'material_weight_per_unit',
            dataType: 'double precision',
            nullable: 'YES',
        },
    })
    materialWeightPerUnit?: number;

    @property({
        type: 'string',
        jsonSchema: {
            nullable: true,
            enum: Object.values(ListingUnit),
            description: 'Weight unit for material weight (mt, kg, lbs)',
        },
        postgresql: {
            columnName: 'weight_unit',
            dataType: 'character varying',
            dataLength: 10,
            nullable: 'YES',
        },
    })
    weightUnit?: ListingUnit;

    @property({
        type: 'number',
        jsonSchema: { nullable: true, minimum: 1 },
        postgresql: {
            columnName: 'material_weight',
            dataType: 'double precision',
            nullable: 'YES',
        },
    })
    materialWeight?: number;

    @property({
        type: 'number',
        jsonSchema: { nullable: true, minimum: 1 },
        postgresql: { columnName: 'number_of_loads', dataType: 'integer', nullable: 'YES' },
    })
    numberOfLoads?: number;

    @property({
        type: 'number',
        jsonSchema: { nullable: true, minimum: 3 },
        postgresql: {
            columnName: 'total_weight',
            dataType: 'double precision',
            nullable: 'YES',
        },
    })
    totalWeight?: number;

    @property({
        type: 'number',
        jsonSchema: { nullable: true, minimum: 0 },
        postgresql: {
            columnName: 'weight_per_load',
            dataType: 'double precision',
            nullable: 'YES',
        },
    })
    weightPerLoad?: number;

    @property({
        type: 'boolean',
        default: false,
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'material_remain_in_country', dataType: 'boolean', nullable: 'YES' },
    })
    materialRemainInCountry?: boolean;

    @property({
        type: 'string',
        jsonSchema: {
            nullable: true,
            enum: Object.values(ECurrency),
            description: 'Currency code (gbp, usd, eur)',
        },
        postgresql: {
            columnName: 'currency',
            dataType: 'character varying',
            dataLength: 3,
            nullable: 'YES',
        },
    })
    currency: ECurrency;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: {
            columnName: 'additional_notes',
            dataType: 'character varying',
            dataLength: 1000,
            nullable: 'YES',
        },
    })
    additionalNotes?: string;

    @property({
        type: 'date',
        required: true,
        jsonSchema: { nullable: false },
        postgresql: { columnName: 'start_date', dataType: 'timestamp without time zone', nullable: 'NO' },
    })
    startDate?: Date;

    @property({
        type: 'date',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'end_date', dataType: 'timestamp without time zone', nullable: 'YES' },
    })
    endDate?: Date;

    @property({
        type: 'string',
        jsonSchema: {
            nullable: false,
            enum: Object.values(ListingStatus),
            description: 'Listing status (available, pending, sold, rejected, expired)',
        },
        postgresql: {
            columnName: 'status',
            dataType: 'character varying',
            dataLength: 20,
            nullable: 'NO',
        },
    })
    status: ListingStatus;

    @property({
        type: 'string',
        jsonSchema: { nullable: true, enum: Object.values(ListingState) },
        postgresql: { columnName: 'state', dataType: 'character varying', dataLength: 255, nullable: 'YES' },
    })
    state?: ListingState;

    @property({
        type: 'boolean',
        default: false,
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'is_featured', dataType: 'boolean', nullable: 'YES' },
    })
    isFeatured?: boolean;

    @property({
        type: 'boolean',
        default: false,
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'is_urgent', dataType: 'boolean', nullable: 'YES' },
    })
    isUrgent?: boolean;

    @property({
        type: 'number',
        jsonSchema: { nullable: true, minimum: 0 },
        postgresql: { columnName: 'capacity_per_month', dataType: 'integer', nullable: 'YES' },
    })
    capacityPerMonth?: number;

    @property({
        type: 'number',
        jsonSchema: { nullable: true, minimum: 0 },
        postgresql: {
            columnName: 'material_weight_wanted',
            dataType: 'double precision',
            nullable: 'YES',
        },
    })
    materialWeightWanted?: number;

    @property({
        type: 'string',
        jsonSchema: { nullable: true, enum: Object.values(WasteStoration) },
        postgresql: { columnName: 'waste_storation', dataType: 'character varying', dataLength: 20, nullable: 'YES' },
    })
    wasteStoration?: WasteStoration;

    @property({
        type: 'string',
        jsonSchema: { nullable: true, enum: Object.values(RenewalPeriod) },
        postgresql: { columnName: 'renewal_period', dataType: 'character varying', dataLength: 20, nullable: 'YES' },
    })
    listingRenewalPeriod?: RenewalPeriod;

    @property({
        type: 'date',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'listing_duration', dataType: 'timestamp without time zone', nullable: 'YES' },
    })
    listingDuration?: Date;

    @property({
        type: 'number',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'view_count', dataType: 'integer', nullable: 'YES' },
    })
    viewCount?: number;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: {
            columnName: 'rejection_reason',
            dataType: 'character varying',
            dataLength: 1000,
            nullable: 'YES',
        },
    })
    rejectionReason?: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'message', dataType: 'character varying', dataLength: 1000, nullable: 'YES' },
    })
    message?: string;

    @property({
        type: 'number',
        jsonSchema: { nullable: true },
        precision: 12,
        scale: 2,
        postgresql: {
            columnName: 'price_per_metric_tonne',
            dataType: 'numeric',
            dataPrecision: 12,
            dataScale: 2,
            nullable: 'YES',
        },
    })
    pricePerMetricTonne?: number;

    @property({
        type: 'number',
        jsonSchema: {
            nullable: true,
            minimum: 0,
            description: 'PERN (Plastic Exchange Rate Number) value for material',
        },
        postgresql: {
            columnName: 'pern',
            dataType: 'double precision',
            nullable: 'YES',
        },
    })
    pern?: number;

    @property({
        type: 'string',
        jsonSchema: {
            nullable: true,
            description: 'International Commercial Terms (e.g., EXW, FAS, FOB, CFR, CIF, DAP, DDP)',
        },
        postgresql: {
            columnName: 'incoterms',
            dataType: 'character varying',
            dataLength: 10,
            nullable: 'YES',
        },
    })
    incoterms?: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'location_other', dataType: 'character varying', dataLength: 255, nullable: 'YES' },
    })
    locationOther?: string;

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
        type: 'object',
        jsonSchema: { nullable: true },
        postgresql: {
            columnName: 'admin_note',
            dataType: 'jsonb',
            nullable: 'YES',
        },
    })
    adminNote?: AdminNote;

    @property({
        type: 'object',
        jsonSchema: { nullable: true },
        postgresql: {
            columnName: 'assign_admin',
            dataType: 'jsonb',
            nullable: 'YES',
        },
    })
    assignAdmin?: AssignAdmin | null;

    constructor(data?: Partial<Listings>) {
        super(data);
    }
}

export interface ListingsRelations {
    location?: CompanyLocations;
}

export type ListingsWithRelations = Listings & ListingsRelations;
