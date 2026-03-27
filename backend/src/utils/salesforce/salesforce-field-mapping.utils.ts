/**
 * Salesforce Field Mapping Configuration
 * Defines which fields are synchronised and their directionality
 * Based on WT Salesforce CRM data mapping sheet
 *
 * Field Direction Types:
 * - 'WT→SF': Only synced from WasteTrade to Salesforce (outbound only)
 * - 'SF→WT': Only synced from Salesforce to WasteTrade (inbound only)
 * - 'bidirectional': Synced in both directions (last update wins)
 */

export type FieldDirection = 'WT→SF' | 'SF→WT' | 'bidirectional';

export interface FieldMapping {
    wasteTradeField: string;
    salesforceField: string;
    direction: FieldDirection;
    dataType?: 'string' | 'number' | 'boolean' | 'date' | 'picklist';
    required?: boolean;
    description?: string;
}

/**
 * Account (Company) Field Mappings
 * Maps WasteTrade Company fields to Salesforce Account fields
 */
export const ACCOUNT_FIELD_MAPPINGS: FieldMapping[] = [
    // Basic Information - Bidirectional
    { wasteTradeField: 'name', salesforceField: 'Name', direction: 'bidirectional' },
    { wasteTradeField: 'email', salesforceField: 'Email__c', direction: 'bidirectional' },
    { wasteTradeField: 'phoneNumber', salesforceField: 'Phone', direction: 'bidirectional' },
    { wasteTradeField: 'website', salesforceField: 'Website', direction: 'bidirectional' },

    // Address - Bidirectional
    { wasteTradeField: 'addressLine1', salesforceField: 'BillingStreet', direction: 'bidirectional' },
    { wasteTradeField: 'city', salesforceField: 'BillingCity', direction: 'bidirectional' },
    { wasteTradeField: 'postalCode', salesforceField: 'BillingPostalCode', direction: 'bidirectional' },
    { wasteTradeField: 'country', salesforceField: 'BillingCountry', direction: 'bidirectional' },
    { wasteTradeField: 'stateProvince', salesforceField: 'BillingState', direction: 'bidirectional' },

    // Company Details - Bidirectional (VAT/Registration can be updated from SF)
    { wasteTradeField: 'vatNumber', salesforceField: 'Company_VAT_Number__c', direction: 'bidirectional' },
    {
        wasteTradeField: 'registrationNumber',
        salesforceField: 'Company_Registration_Number__c',
        direction: 'bidirectional',
    },
    { wasteTradeField: 'companyType', salesforceField: 'Type', direction: 'WT→SF', description: 'SF Type is account category (Customer/Haulier), not WT business type' },
    { wasteTradeField: 'status', salesforceField: 'Account_Status__c', direction: 'bidirectional' },

    // WT Authoritative Fields - Outbound only (WT→SF)
    { wasteTradeField: 'companyInterest', salesforceField: 'WT_Company_Interest__c', direction: 'WT→SF' },
    { wasteTradeField: 'vatRegistrationCountry', salesforceField: 'VAT_Registration_Country__c', direction: 'WT→SF' },
    { wasteTradeField: 'description', salesforceField: 'Description', direction: 'WT→SF' },

    // Haulier-specific fields - Bidirectional
    { wasteTradeField: 'fleetType', salesforceField: 'Fleet_Type__c', direction: 'bidirectional', dataType: 'picklist', description: 'Freight Forwarder / Own Fleet' },
    { wasteTradeField: 'areasCovered', salesforceField: 'Areas_Covered__c', direction: 'bidirectional', dataType: 'picklist', description: 'UK Only / Within EU / Worldwide' },
    { wasteTradeField: 'areasCovered', salesforceField: 'EU_Countries__c', direction: 'bidirectional', description: 'EU countries multi-picklist (when Within EU)' },
    { wasteTradeField: 'containerTypes', salesforceField: 'WT_Container_Types__c', direction: 'bidirectional', description: 'Multi-picklist: Curtain Sider, Containers, Tipper Trucks, Walking Floor' },

    // Expanded Fields - Bidirectional
    { wasteTradeField: 'mobileNumber', salesforceField: 'Fax', direction: 'bidirectional', description: 'SF Fax stores mobile number (Account has no Mobile field)' },

    // SF Authoritative Fields - Inbound only (SF→WT)
    // Note: CRM-only fields in Salesforce should not be synced back to WT
];

/**
 * Contact (User/CompanyUser) Field Mappings
 * Maps WasteTrade User/CompanyUser fields to Salesforce Contact fields
 */
export const CONTACT_FIELD_MAPPINGS: FieldMapping[] = [
    // Basic User Info - Bidirectional
    { wasteTradeField: 'firstName', salesforceField: 'FirstName', direction: 'bidirectional' },
    { wasteTradeField: 'lastName', salesforceField: 'LastName', direction: 'bidirectional' },
    { wasteTradeField: 'email', salesforceField: 'Email', direction: 'bidirectional' },
    { wasteTradeField: 'phoneNumber', salesforceField: 'Phone', direction: 'bidirectional' },

    // Company User Info - Bidirectional
    { wasteTradeField: 'companyRole', salesforceField: 'Company_Role__c', direction: 'bidirectional' },
    { wasteTradeField: 'isPrimaryContact', salesforceField: 'Is_Primary_Contact__c', direction: 'bidirectional' },
    { wasteTradeField: 'status', salesforceField: 'Company_User_Status__c', direction: 'bidirectional' },

    // WT Authoritative Fields - Bidirectional (Apex sends Title/Job_Title__c inbound)
    { wasteTradeField: 'jobTitle', salesforceField: 'Title', direction: 'bidirectional' },

    // Expanded Fields - Bidirectional
    { wasteTradeField: 'mobileNumber', salesforceField: 'MobilePhone', direction: 'bidirectional' },
    { wasteTradeField: 'prefix', salesforceField: 'Salutation', direction: 'bidirectional' },

    // SF Authoritative Fields - Inbound only (SF→WT)
    // Note: CRM-only fields in Salesforce should not be synced back to WT
];

/**
 * Approval Action Types
 * Defines valid approval actions that can be sent from Salesforce
 */
export type ApprovalActionType = 'approve_user' | 'reject_user' | 'request_info';

/**
 * Approval Instruction Payload Interface
 * Used for Salesforce → WasteTrade approval instructions
 */
export interface ApprovalInstructionPayload {
    actionType: ApprovalActionType;
    userId?: number; // WasteTrade User ID
    externalId?: string; // WasteTrade_User_Id__c from Salesforce
    accountId?: string; // Salesforce Account ID
    contactId?: string; // Salesforce Contact ID
    reason?: string; // Optional rejection reason
    message?: string; // Optional message for request_info
    approverIdentity?: string; // Salesforce user who initiated the approval
    timestamp: string; // UTC timestamp of the instruction
    mappingVersion?: string; // Schema version for validation
}

/**
 * Get all fields that can be synced from WasteTrade to Salesforce (outbound)
 */
export function getOutboundFields(objectType: 'Account' | 'Contact'): FieldMapping[] {
    const mappings = objectType === 'Account' ? ACCOUNT_FIELD_MAPPINGS : CONTACT_FIELD_MAPPINGS;
    return mappings.filter((m) => m.direction === 'WT→SF' || m.direction === 'bidirectional');
}

/**
 * Get all fields that can be synced from Salesforce to WasteTrade (inbound)
 */
export function getInboundFields(objectType: 'Account' | 'Contact'): FieldMapping[] {
    const mappings = objectType === 'Account' ? ACCOUNT_FIELD_MAPPINGS : CONTACT_FIELD_MAPPINGS;
    return mappings.filter((m) => m.direction === 'SF→WT' || m.direction === 'bidirectional');
}

/**
 * Check if a field is writable from Salesforce (inbound)
 */
export function isInboundWritable(salesforceField: string, objectType: 'Account' | 'Contact'): boolean {
    const mappings = objectType === 'Account' ? ACCOUNT_FIELD_MAPPINGS : CONTACT_FIELD_MAPPINGS;
    const mapping = mappings.find((m) => m.salesforceField === salesforceField);
    return mapping ? mapping.direction === 'SF→WT' || mapping.direction === 'bidirectional' : false;
}

/**
 * Get WasteTrade field name from Salesforce field name
 */
export function getWasteTradeField(salesforceField: string, objectType: 'Account' | 'Contact'): string | null {
    const mappings = objectType === 'Account' ? ACCOUNT_FIELD_MAPPINGS : CONTACT_FIELD_MAPPINGS;
    const mapping = mappings.find((m) => m.salesforceField === salesforceField);
    return mapping ? mapping.wasteTradeField : null;
}

/**
 * Get Salesforce field name from WasteTrade field name
 */
export function getSalesforceField(wasteTradeField: string, objectType: 'Account' | 'Contact'): string | null {
    const mappings = objectType === 'Account' ? ACCOUNT_FIELD_MAPPINGS : CONTACT_FIELD_MAPPINGS;
    const mapping = mappings.find((m) => m.wasteTradeField === wasteTradeField);
    return mapping ? mapping.salesforceField : null;
}

/**
 * Sales Listing Field Mappings
 * Maps WasteTrade Listing fields to Salesforce Sales_Listing__c fields
 * Per AC 6.5.1.4: SF is read-only view, only status changes allowed inbound
 */
export const SALES_LISTING_FIELD_MAPPINGS: FieldMapping[] = [
    // Status - Bidirectional (SF can approve/reject listings)
    { wasteTradeField: 'status', salesforceField: 'Listing_Status__c', direction: 'bidirectional', dataType: 'picklist' },

    // All other fields - Outbound only (WT→SF)
    { wasteTradeField: 'title', salesforceField: 'Name', direction: 'WT→SF' },
    { wasteTradeField: 'title', salesforceField: 'Sales_Listing_Name__c', direction: 'WT→SF' },
    { wasteTradeField: 'materialType', salesforceField: 'Material_Type__c', direction: 'WT→SF' },
    { wasteTradeField: 'materialPacking', salesforceField: 'Material_Packing__c', direction: 'WT→SF' },
    { wasteTradeField: 'quantity', salesforceField: 'Material_Weight__c', direction: 'WT→SF' },
    { wasteTradeField: 'pricePerMetricTonne', salesforceField: 'Price_Per_Tonne__c', direction: 'WT→SF' },
    { wasteTradeField: 'currency', salesforceField: 'CurrencyIsoCode', direction: 'WT→SF' },
    { wasteTradeField: 'startDate', salesforceField: 'Available_From_Date__c', direction: 'WT→SF' },
    { wasteTradeField: 'endDate', salesforceField: 'Available_Until__c', direction: 'WT→SF' },
    { wasteTradeField: 'description', salesforceField: 'Description__c', direction: 'WT→SF' },
];

/**
 * Offers Field Mappings
 * Maps WasteTrade Offer fields to Salesforce Offers__c fields
 * Per AC 6.5.1.4: SF can update bid status (accept/reject)
 */
export const OFFERS_FIELD_MAPPINGS: FieldMapping[] = [
    // Status - Bidirectional (SF can accept/reject offers)
    // bid_status__c is the primary status field; Offer_Status__c is a formula/display field (outbound only)
    { wasteTradeField: 'status', salesforceField: 'bid_status__c', direction: 'bidirectional', dataType: 'picklist' },
    { wasteTradeField: 'status', salesforceField: 'Offer_Status__c', direction: 'WT→SF', dataType: 'picklist' },

    // Rejection reason - Bidirectional (SF can provide rejection reason)
    { wasteTradeField: 'rejectionReason', salesforceField: 'Rejection_Reason__c', direction: 'bidirectional' },

    // All other fields - Outbound only (WT→SF)
    { wasteTradeField: 'quantity', salesforceField: 'Quantity__c', direction: 'WT→SF' },
    { wasteTradeField: 'offeredPricePerUnit', salesforceField: 'Offered_Price_Per_Unit__c', direction: 'WT→SF' },
    { wasteTradeField: 'totalPrice', salesforceField: 'Total_Price__c', direction: 'WT→SF' },
    { wasteTradeField: 'currency', salesforceField: 'Currency__c', direction: 'WT→SF' },
    { wasteTradeField: 'message', salesforceField: 'Message__c', direction: 'WT→SF' },
    { wasteTradeField: 'earliestDeliveryDate', salesforceField: 'Earliest_Delivery_Date__c', direction: 'WT→SF' },
    { wasteTradeField: 'latestDeliveryDate', salesforceField: 'Latest_Delivery_Date__c', direction: 'WT→SF' },
];

/**
 * Get all fields that can be synced from WasteTrade to Salesforce (outbound)
 */
export function getOutboundFieldsForObject(objectType: 'Account' | 'Contact' | 'Sales_Listing__c' | 'Offers__c'): FieldMapping[] {
    let mappings: FieldMapping[];
    switch (objectType) {
        case 'Account':
            mappings = ACCOUNT_FIELD_MAPPINGS;
            break;
        case 'Contact':
            mappings = CONTACT_FIELD_MAPPINGS;
            break;
        case 'Sales_Listing__c':
            mappings = SALES_LISTING_FIELD_MAPPINGS;
            break;
        case 'Offers__c':
            mappings = OFFERS_FIELD_MAPPINGS;
            break;
        default:
            return [];
    }
    return mappings.filter((m) => m.direction === 'WT→SF' || m.direction === 'bidirectional');
}

/**
 * Get all fields that can be synced from Salesforce to WasteTrade (inbound)
 */
export function getInboundFieldsForObject(objectType: 'Account' | 'Contact' | 'Sales_Listing__c' | 'Offers__c'): FieldMapping[] {
    let mappings: FieldMapping[];
    switch (objectType) {
        case 'Account':
            mappings = ACCOUNT_FIELD_MAPPINGS;
            break;
        case 'Contact':
            mappings = CONTACT_FIELD_MAPPINGS;
            break;
        case 'Sales_Listing__c':
            mappings = SALES_LISTING_FIELD_MAPPINGS;
            break;
        case 'Offers__c':
            mappings = OFFERS_FIELD_MAPPINGS;
            break;
        default:
            return [];
    }
    return mappings.filter((m) => m.direction === 'SF→WT' || m.direction === 'bidirectional');
}

/**
 * Check if a field is writable from Salesforce (inbound) - Extended version
 */
export function isInboundWritableForObject(salesforceField: string, objectType: 'Account' | 'Contact' | 'Sales_Listing__c' | 'Offers__c'): boolean {
    let mappings: FieldMapping[];
    switch (objectType) {
        case 'Account':
            mappings = ACCOUNT_FIELD_MAPPINGS;
            break;
        case 'Contact':
            mappings = CONTACT_FIELD_MAPPINGS;
            break;
        case 'Sales_Listing__c':
            mappings = SALES_LISTING_FIELD_MAPPINGS;
            break;
        case 'Offers__c':
            mappings = OFFERS_FIELD_MAPPINGS;
            break;
        default:
            return false;
    }
    const mapping = mappings.find((m) => m.salesforceField === salesforceField);
    return mapping ? mapping.direction === 'SF→WT' || mapping.direction === 'bidirectional' : false;
}

/**
 * Schema version for mapping validation
 * Increment this when mapping structure changes
 */
export const MAPPING_SCHEMA_VERSION = '1.1.0';
