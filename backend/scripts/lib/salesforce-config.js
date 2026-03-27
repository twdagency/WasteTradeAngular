/**
 * Salesforce Configuration
 * Centralized configuration for object names, field definitions, and mappings
 */

const { createPicklistField, createTextField, createCheckboxField, createMultiPicklistField, createTextareaField, createLookupField } = require('./salesforce-utils');

// Salesforce Object Names
const OBJECTS = {
    // Standard Objects
    ACCOUNT: 'Account',
    CONTACT: 'Contact',
    LEAD: 'Lead',
    
    // Custom Objects - Listings
    SALES_LISTING: 'Sales_Listing__c',
    WANTED_LISTING: 'Wanted_Listings__c',
    
    // Custom Objects - Offers
    OFFERS: 'Offers__c',
    HAULAGE_OFFERS: 'Haulage_Offers__c',
    HAULAGE_LOADS: 'Haulage_Loads__c',
    
    // Custom Objects - Documents
    DOCUMENT: 'Document__c',
    CONTENT_VERSION: 'ContentVersion',
    CONTENT_DOCUMENT: 'ContentDocument',
    CONTENT_DOCUMENT_LINK: 'ContentDocumentLink',
};

// Custom Field Definitions
const FIELD_DEFINITIONS = {
    // Contact fields
    CONTACT_FIELDS: [
        createPicklistField(OBJECTS.CONTACT, 'Company_Role__c', 'Company Role', [
            { value: 'ADMIN', label: 'Admin' },
            { value: 'BUYER', label: 'Buyer' },
            { value: 'SELLER', label: 'Seller' },
            { value: 'HAULIER', label: 'Haulier' },
            { value: 'DUAL', label: 'Dual' },
        ]),
        createPicklistField(OBJECTS.CONTACT, 'Company_User_Status__c', 'Company User Status', [
            { value: 'PENDING', label: 'Pending' },
            { value: 'ACTIVE', label: 'Active', isDefault: true },
            { value: 'REJECTED', label: 'Rejected' },
            { value: 'INACTIVE', label: 'Inactive' },
        ]),
    ],

    // Account role flag fields
    ACCOUNT_FIELDS: [
        createCheckboxField(OBJECTS.ACCOUNT, 'WT_is_buyer__c', 'WT Is Buyer'),
        createCheckboxField(OBJECTS.ACCOUNT, 'WT_is_seller__c', 'WT Is Seller'),
        createCheckboxField(OBJECTS.ACCOUNT, 'WT_is_haulier__c', 'WT Is Haulier'),
    ],

    // Haulier-specific Account fields
    HAULIER_ACCOUNT_FIELDS: [
        createPicklistField(OBJECTS.ACCOUNT, 'Fleet_Type__c', 'Fleet Type', [
            { value: 'Freight Forwarder', label: 'Freight Forwarder' },
            { value: 'Own Fleet', label: 'Owner Fleet' },
        ]),
        createPicklistField(OBJECTS.ACCOUNT, 'Areas_Covered__c', 'Areas Covered', [
            { value: 'UK Only', label: 'UK Only' },
            { value: 'Within EU', label: 'Within EU' },
            { value: 'Worldwide', label: 'Worldwide' },
        ]),
        createMultiPicklistField(OBJECTS.ACCOUNT, 'EU_Countries__c', 'EU Countries', [
            { value: 'Albania', label: 'Albania' },
            { value: 'Austria', label: 'Austria' },
            { value: 'Belgium', label: 'Belgium' },
            { value: 'Bulgaria', label: 'Bulgaria' },
            { value: 'Croatia', label: 'Croatia' },
            { value: 'Cyprus', label: 'Cyprus' },
            { value: 'Czech Republic', label: 'Czech Republic' },
            { value: 'Denmark', label: 'Denmark' },
            { value: 'Estonia', label: 'Estonia' },
            { value: 'Finland', label: 'Finland' },
            { value: 'France', label: 'France' },
            { value: 'Germany', label: 'Germany' },
            { value: 'Greece', label: 'Greece' },
            { value: 'Hungary', label: 'Hungary' },
            { value: 'Ireland', label: 'Ireland' },
            { value: 'Italy', label: 'Italy' },
            { value: 'Latvia', label: 'Latvia' },
            { value: 'Lithuania', label: 'Lithuania' },
            { value: 'Luxembourg', label: 'Luxembourg' },
            { value: 'Malta', label: 'Malta' },
            { value: 'Netherlands', label: 'Netherlands' },
            { value: 'Poland', label: 'Poland' },
            { value: 'Portugal', label: 'Portugal' },
            { value: 'Romania', label: 'Romania' },
            { value: 'Slovakia', label: 'Slovakia' },
            { value: 'Slovenia', label: 'Slovenia' },
            { value: 'Spain', label: 'Spain' },
            { value: 'Sweden', label: 'Sweden' },
        ]),
        createMultiPicklistField(OBJECTS.ACCOUNT, 'WT_Container_Types__c', 'Container Types', [
            { value: 'Curtain Sider', label: 'Curtain Sider' },
            { value: 'Containers', label: 'Containers' },
            { value: 'Tipper Trucks', label: 'Tipper Trucks' },
            { value: 'Walking Floor', label: 'Walking Floor' },
        ]),
    ],

    // Offers lookup fields
    OFFERS_FIELDS: [
        createLookupField(OBJECTS.OFFERS, 'Seller_Account__c', 'Seller Account', OBJECTS.ACCOUNT),
    ],

    // Document fields
    DOCUMENT_FIELDS: [
        createLookupField(OBJECTS.DOCUMENT, 'Account__c', 'Account', OBJECTS.ACCOUNT),
    ],

    // Lead fields
    LEAD_FIELDS: [
        createPicklistField(OBJECTS.LEAD, 'WasteTrade_User_Status__c', 'WasteTrade User Status', [
            { value: 'PENDING', label: 'Pending' },
            { value: 'ACTIVE', label: 'Active', isDefault: true },
            { value: 'REJECTED', label: 'Rejected' },
            { value: 'INACTIVE', label: 'Inactive' },
        ]),
    ],

    // Loop prevention fields (for bidirectional sync)
    LOOP_PREVENTION_FIELDS: [
        createTextField(OBJECTS.ACCOUNT, 'Last_Sync_Origin__c', 'Last Sync Origin', { length: 50 }),
        createTextField(OBJECTS.LEAD, 'Last_Sync_Origin__c', 'Last Sync Origin', { length: 50 }),
        createTextField(OBJECTS.CONTACT, 'Last_Sync_Origin__c', 'Last Sync Origin', { length: 50 }),
        createTextField(OBJECTS.HAULAGE_LOADS, 'Last_Sync_Origin__c', 'Last Sync Origin', { length: 50 }),
        createTextField(OBJECTS.OFFERS, 'Last_Sync_Origin__c', 'Last Sync Origin', { length: 50 }),
        createTextField(OBJECTS.SALES_LISTING, 'Last_Sync_Origin__c', 'Last Sync Origin', { length: 50 }),
        createTextField(OBJECTS.WANTED_LISTING, 'Last_Sync_Origin__c', 'Last Sync Origin', { length: 50 }),
    ],
};

// Required Fields by Object
const REQUIRED_FIELDS = {
    [OBJECTS.CONTACT]: [
        'WasteTrade_User_Id__c',
        'Company_Role__c',
        'Is_Primary_Contact__c',
        'Company_User_Status__c',
        'Last_Sync_Origin__c',
    ],
    [OBJECTS.ACCOUNT]: [
        'WasteTrade_Company_Id__c',
        'Account_Status__c',
        'WT_is_buyer__c',
        'WT_is_seller__c',
        'WT_is_haulier__c',
        'Last_Sync_Origin__c',
    ],
    [OBJECTS.LEAD]: [
        'WasteTrade_Lead_Id__c',
        'WasteTrade_User_Status__c',
        'Last_Sync_Origin__c',
    ],
    [OBJECTS.SALES_LISTING]: [
        'WasteTrade_Listing_Id__c',
        'Listing_Status__c',
        'Material_Type__c',
        'Quantity__c',
        'Price__c',
        'Last_Sync_Origin__c',
    ],
    [OBJECTS.WANTED_LISTING]: [
        'WasteTrade_Wanted_Listing_Id__c',
        'Listing_Status__c',
        'Material_Type__c',
        'Quantity_Needed__c',
        'Last_Sync_Origin__c',
    ],
    [OBJECTS.OFFERS]: [
        'WasteTrade_Offer_Id__c',
        'Offer_Status__c',
        'Offer_Amount__c',
        'Listing__c',
        'Seller_Account__c',
        'Last_Sync_Origin__c',
    ],
    [OBJECTS.HAULAGE_OFFERS]: [
        'WasteTrade_Haulage_Offers_ID__c',
        'haulier_listing_status__c',
        'haulage_rejection_reason__c',
        'post_notes__c',
        'Last_Sync_Origin__c',
    ],
    [OBJECTS.HAULAGE_LOADS]: [
        'load_number__c',
        'collection_date__c',
        'load_status__c',
        'Last_Sync_Origin__c',
    ],
    [OBJECTS.DOCUMENT]: [
        'WasteTrade_Document_Id__c',
        'Document_Type__c',
        'Related_Record_Id__c',
        'Account__c',
    ],
};

// Apex Classes
const APEX_CLASSES = {
    WEBHOOK_SERVICE: {
        name: 'WasteTradeWebhookService',
        methods: [
            'sendAccountUpdate',
            'sendContactUpdate',
            'sendHaulageOfferStatusUpdate',
            'sendHaulageOfferDocuments',
            'isFromWasteTrade',
        ],
    },
};

// Webhook Endpoints
const WEBHOOK_ENDPOINTS = [
    '/salesforce/webhook/account-updated',
    '/salesforce/webhook/contact-updated',
    '/salesforce/webhook/haulage-documents',
    '/salesforce/webhook/health',
];

// Field Mappings (WasteTrade -> Salesforce)
const FIELD_MAPPINGS = {
    COMPANY: {
        id: 'WasteTrade_Company_Id__c',
        name: 'Name',
        status: 'Account_Status__c',
        type: 'Type',
        website: 'Website',
        phone: 'Phone',
        email: 'Email__c',
        address: {
            street: 'BillingStreet',
            city: 'BillingCity',
            state: 'BillingState',
            postalCode: 'BillingPostalCode',
            country: 'BillingCountry',
        },
    },
    USER: {
        id: 'WasteTrade_User_Id__c',
        firstName: 'FirstName',
        lastName: 'LastName',
        email: 'Email',
        phone: 'Phone',
        mobile: 'MobilePhone',
        title: 'Title',
        role: 'Company_Role__c',
        status: 'Company_User_Status__c',
        isPrimary: 'Is_Primary_Contact__c',
    },
    LEAD: {
        id: 'WasteTrade_Lead_Id__c',
        firstName: 'FirstName',
        lastName: 'LastName',
        email: 'Email',
        phone: 'Phone',
        company: 'Company',
        status: 'Status',
    },
    SALES_LISTING: {
        id: 'WasteTrade_Listing_Id__c',
        name: 'Name',
        status: 'Listing_Status__c',
        materialType: 'Material_Type__c',
        quantity: 'Quantity__c',
        price: 'Price__c',
        description: 'Description__c',
        account: 'Account__c',
    },
    WANTED_LISTING: {
        id: 'WasteTrade_Wanted_Listing_Id__c',
        name: 'Name',
        status: 'Listing_Status__c',
        materialType: 'Material_Type__c',
        quantityNeeded: 'Quantity_Needed__c',
        description: 'Description__c',
        account: 'Account__c',
    },
    OFFER: {
        id: 'WasteTrade_Offer_Id__c',
        name: 'Name',
        status: 'Offer_Status__c',
        amount: 'Offer_Amount__c',
        listing: 'Listing__c',
        buyer: 'Buyer_Account__c',
        notes: 'Notes__c',
    },
    HAULAGE_OFFER: {
        id: 'WasteTrade_Haulage_Offers_ID__c',
        status: 'haulier_listing_status__c',
        rejectionReason: 'haulage_rejection_reason__c',
        notes: 'post_notes__c',
        listing: 'Listing__c',
        haulier: 'Haulier_Account__c',
    },
    DOCUMENT: {
        id: 'WasteTrade_Document_Id__c',
        name: 'Name',
        type: 'Document_Type__c',
        relatedRecordId: 'Related_Record_Id__c',
        fileUrl: 'File_URL__c',
        uploadDate: 'Upload_Date__c',
    },
};

// Sync Configuration
const SYNC_CONFIG = {
    ORIGIN_WASTETRADE: 'WasteTrade',
    ORIGIN_SALESFORCE: 'Salesforce',
    BATCH_SIZE: 200,
    RETRY_ATTEMPTS: 3,
    RETRY_DELAY_MS: 1000,
};

module.exports = {
    OBJECTS,
    FIELD_DEFINITIONS,
    REQUIRED_FIELDS,
    APEX_CLASSES,
    WEBHOOK_ENDPOINTS,
    FIELD_MAPPINGS,
    SYNC_CONFIG,
};
