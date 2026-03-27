import { model, property, hasOne } from '@loopback/repository';
import { Base } from './base.model';
import { UserRoleEnum, WhereDidYouHearAboutUs, UserStatus } from '../enum';
import { AdminNote } from './admin-note.model';
import { AssignAdmin } from './assign-admin.model';

@model({ settings: { idInjection: false, postgresql: { schema: 'public', table: 'users' } } })
export class User extends Base {
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
        index: { unique: true },
        postgresql: { columnName: 'email', dataType: 'character varying', dataLength: 255 },
    })
    email: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'username', dataType: 'character varying', dataLength: 255, nullable: 'YES' },
    })
    username: string;

    @property({
        type: 'string',
        required: true,
        jsonSchema: { nullable: false },
        postgresql: { columnName: 'password_hash', dataType: 'character varying', dataLength: 255 },
    })
    passwordHash: string;

    @property({
        type: 'string',
        required: true,
        jsonSchema: { nullable: false },
        length: 100,
        postgresql: { columnName: 'first_name', dataType: 'character varying', dataLength: 100 },
    })
    firstName: string;

    @property({
        type: 'string',
        required: true,
        jsonSchema: { nullable: false },
        length: 100,
        postgresql: { columnName: 'last_name', dataType: 'character varying', dataLength: 100 },
    })
    lastName: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        length: 20,
        postgresql: { columnName: 'prefix', dataType: 'character varying', dataLength: 20, nullable: 'YES' },
    })
    prefix?: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        length: 50,
        postgresql: { columnName: 'job_title', dataType: 'character varying', dataLength: 50, nullable: 'YES' },
    })
    jobTitle?: string;

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
        type: 'boolean',
        required: true,
        jsonSchema: { nullable: false },
        postgresql: { columnName: 'is_verified', dataType: 'boolean' },
    })
    isVerified: boolean;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: {
            columnName: 'verification_token',
            dataType: 'character varying',
            dataLength: 255,
            nullable: 'YES',
        },
    })
    verificationToken?: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: {
            columnName: 'reset_password_token',
            dataType: 'character varying',
            dataLength: 255,
            nullable: 'YES',
        },
    })
    resetPasswordToken?: string;

    @property({
        type: 'date',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'reset_token_expires_at', dataType: 'timestamp without time zone', nullable: 'YES' },
    })
    resetTokenExpiresAt?: string;

    @property({
        type: 'string',
        required: true,
        jsonSchema: { nullable: false },
        length: 20,
        postgresql: { columnName: 'global_role', dataType: 'character varying', dataLength: 20 },
    })
    globalRole: UserRoleEnum;

    @property({
        type: 'string',
        required: true,
        jsonSchema: { nullable: false, enum: Object.values(UserStatus) },
        length: 20,
        postgresql: { columnName: 'status', dataType: 'character varying', dataLength: 20 },
    })
    status: UserStatus;

    @property({
        type: 'boolean',
        required: true,
        jsonSchema: { nullable: false },
        postgresql: { columnName: 'notification_email_enabled', dataType: 'boolean' },
    })
    notificationEmailEnabled: boolean;

    @property({
        type: 'boolean',
        required: true,
        jsonSchema: { nullable: false },
        postgresql: { columnName: 'notification_push_enabled', dataType: 'boolean' },
    })
    notificationPushEnabled: boolean;

    @property({
        type: 'boolean',
        required: true,
        jsonSchema: { nullable: false },
        postgresql: { columnName: 'notification_in_app_enabled', dataType: 'boolean' },
    })
    notificationInAppEnabled: boolean;

    @property({
        type: 'boolean',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'receive_email_for_offers_on_my_listings', dataType: 'boolean', default: true },
    })
    receiveEmailForOffersOnMyListings: boolean;

    @property({
        type: 'boolean',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'receive_email_for_new_matching_listings', dataType: 'boolean', default: true },
    })
    receiveEmailForNewMatchingListings: boolean;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: {
            columnName: 'where_did_you_hear_about_us',
            dataType: 'character varying',
            dataLength: 255,
            nullable: 'YES',
            enum: Object.values(WhereDidYouHearAboutUs),
        },
    })
    whereDidYouHearAboutUs?: WhereDidYouHearAboutUs;

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
            columnName: 'salesforce_lead_id',
            dataType: 'character varying',
            dataLength: 50,
            nullable: 'YES',
        },
    })
    salesforceLeadId?: string;

    @property({
        type: 'number',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'assigned_admin_id', dataType: 'integer', nullable: 'YES' },
    })
    assignedAdminId?: number | null;

    @property({
        type: 'date',
        jsonSchema: { nullable: true },
        default: () => null,
        postgresql: {
            columnName: 'last_login_at',
            dataType: 'timestamp with time zone',
            nullable: 'YES',
        },
    })
    lastLoginAt?: Date;

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

    constructor(data?: Partial<User>) {
        super(data);
    }
}

export interface UserRelations {
    isHaulier?: boolean;
    // describe navigational properties here
}

export type UserWithRelations = User & UserRelations;
