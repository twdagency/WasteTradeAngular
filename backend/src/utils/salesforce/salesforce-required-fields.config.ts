/**
 * Builds the check-fields map from generated field constants.
 * Extracts custom fields (__c) from each object's generated constants.
 * Stays in sync automatically after each `node scripts/export-field-configs.js`.
 */
import {
    AccountFields,
    ContactFields,
    LeadFields,
    SalesListingFields,
    WantedListingFields,
    OffersFields,
    HaulageOffersFields,
    HaulageLoadsFields,
    DocumentFields,
} from './generated';

/** Map of SF object name → generated field constants */
const FIELD_MAPS: Record<string, Record<string, string>> = {
    Account: AccountFields,
    Contact: ContactFields,
    Lead: LeadFields,
    Sales_Listing__c: SalesListingFields,
    Wanted_Listings__c: WantedListingFields,
    Offers__c: OffersFields,
    Haulage_Offers__c: HaulageOffersFields,
    Haulage_Loads__c: HaulageLoadsFields,
    Document__c: DocumentFields,
};

/** Extract custom field names (__c suffix) from a fields constant */
function getCustomFields(fields: Record<string, string>): string[] {
    return Object.values(fields).filter(v => v.endsWith('__c'));
}

/**
 * All custom fields by Salesforce object, derived from generated constants.
 * Used by GET /salesforce/check-fields
 */
export const GENERATED_FIELDS: Record<string, string[]> = Object.fromEntries(
    Object.entries(FIELD_MAPS).map(([obj, fields]) => [obj, getCustomFields(fields)]),
);
