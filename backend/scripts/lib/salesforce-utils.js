/**
 * Shared Salesforce utilities for scripts
 * Provides reusable functions for common Salesforce operations
 */

const jsforce = require('jsforce');
const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '../../.env'),
});
/**
 * Create and authenticate a Salesforce connection
 * @returns {Promise<jsforce.Connection>} Authenticated connection
 */
async function createConnection() {
    const conn = new jsforce.Connection({
        loginUrl: process.env.SALESFORCE_SANDBOX_URL || process.env.SALESFORCE_PRODUCTION_URL,
        version: process.env.SALESFORCE_API_VERSION || '58.0',
    });

    await conn.login(
        process.env.SALESFORCE_USERNAME,
        process.env.SALESFORCE_PASSWORD + process.env.SALESFORCE_SECURITY_TOKEN
    );

    return conn;
}

/**
 * Check if a custom field exists in Salesforce
 * @param {jsforce.Connection} conn - Salesforce connection
 * @param {string} fieldName - Full field name (e.g., 'Contact.Company_Role__c')
 * @returns {Promise<boolean>} True if field exists
 */
async function checkFieldExists(conn, fieldName) {
    try {
        const result = await conn.metadata.read('CustomField', fieldName);
        return result && result.fullName;
    } catch (error) {
        return false;
    }
}

/**
 * Create a custom field in Salesforce
 * @param {jsforce.Connection} conn - Salesforce connection
 * @param {Object} fieldDefinition - Field metadata definition
 * @returns {Promise<Object>} Result object with success status
 */
async function createField(conn, fieldDefinition) {
    try {
        const result = await conn.metadata.create('CustomField', fieldDefinition);
        if (result.success) {
            return { success: true, field: fieldDefinition.fullName };
        } else {
            const errorMsg = Array.isArray(result.errors)
                ? result.errors.map(e => e.message || e).join(', ')
                : result.errors;
            return { success: false, field: fieldDefinition.fullName, error: errorMsg };
        }
    } catch (error) {
        return { success: false, field: fieldDefinition.fullName, error: error.message };
    }
}

/**
 * Process multiple fields (check existence and create if needed)
 * @param {jsforce.Connection} conn - Salesforce connection
 * @param {Array<Object>} fields - Array of field definitions
 * @param {Object} options - Processing options
 * @returns {Promise<Object>} Summary of results
 */
async function processFields(conn, fields, options = {}) {
    const { verbose = true, label = 'Fields' } = options;
    
    let created = 0;
    let existing = 0;
    let failed = 0;

    if (verbose) {
        console.log(`\n📋 Processing ${label}...`);
    }

    for (const field of fields) {
        const exists = await checkFieldExists(conn, field.fullName);
        
        if (exists) {
            if (verbose) console.log(`  ⏭️  ${field.fullName} (exists)`);
            existing++;
        } else {
            const result = await createField(conn, field);
            if (result.success) {
                if (verbose) console.log(`  ✅ ${field.fullName} (created)`);
                created++;
            } else {
                if (verbose) {
                    console.log(`  ❌ ${field.fullName} (failed)`);
                    console.log(`     Error: ${result.error}`);
                }
                failed++;
            }
        }
    }

    return { created, existing, failed };
}

/**
 * Get fields from a Salesforce object
 * @param {jsforce.Connection} conn - Salesforce connection
 * @param {string} objectName - Salesforce object name (e.g., 'Contact')
 * @param {Object} options - Query options
 * @returns {Promise<Array>} Array of field metadata
 */
async function getObjectFields(conn, objectName, options = {}) {
    const { customOnly = false } = options;
    
    const metadata = await conn.sobject(objectName).describe();
    let fields = metadata.fields.map(f => ({
        name: f.name,
        label: f.label,
        type: f.type,
        custom: f.custom,
    }));

    if (customOnly) {
        fields = fields.filter(f => f.custom);
    }

    return fields;
}

/**
 * Check if specific fields exist on an object
 * @param {jsforce.Connection} conn - Salesforce connection
 * @param {string} objectName - Salesforce object name
 * @param {Array<string>} fieldNames - Array of field names to check
 * @returns {Promise<Object>} Map of field names to existence status
 */
async function checkRequiredFields(conn, objectName, fieldNames) {
    const fields = await getObjectFields(conn, objectName, { customOnly: true });
    const results = {};

    fieldNames.forEach(fieldName => {
        results[fieldName] = fields.some(f => f.name === fieldName);
    });

    return results;
}

/**
 * Query Apex class information
 * @param {jsforce.Connection} conn - Salesforce connection
 * @param {string} className - Apex class name
 * @returns {Promise<Object|null>} Class metadata or null if not found
 */
async function getApexClass(conn, className) {
    const result = await conn.tooling.query(
        `SELECT Id, Name, Body FROM ApexClass WHERE Name = '${className}'`
    );

    return result.records && result.records.length > 0 ? result.records[0] : null;
}

/**
 * Create a picklist field definition
 * @param {string} objectName - Object name (e.g., 'Contact')
 * @param {string} fieldName - Field API name (e.g., 'Company_Role__c')
 * @param {string} label - Field label
 * @param {Array<Object>} values - Picklist values [{value, label, isDefault}]
 * @param {Object} options - Additional options
 * @returns {Object} Field definition
 */
function createPicklistField(objectName, fieldName, label, values, options = {}) {
    const { restricted = true, sorted = false } = options;

    return {
        fullName: `${objectName}.${fieldName}`,
        label,
        type: 'Picklist',
        valueSet: {
            restricted,
            valueSetDefinition: {
                sorted,
                value: values.map(v => ({
                    fullName: v.value,
                    label: v.label || v.value,
                    default: v.isDefault || false,
                })),
            },
        },
    };
}

/**
 * Create a text field definition
 * @param {string} objectName - Object name
 * @param {string} fieldName - Field API name
 * @param {string} label - Field label
 * @param {Object} options - Additional options
 * @returns {Object} Field definition
 */
function createTextField(objectName, fieldName, label, options = {}) {
    const { length = 255, unique = false, externalId = false } = options;

    return {
        fullName: `${objectName}.${fieldName}`,
        label,
        type: 'Text',
        length,
        unique,
        externalId,
    };
}

/**
 * Create a checkbox field definition
 * @param {string} objectName - Object name
 * @param {string} fieldName - Field API name
 * @param {string} label - Field label
 * @param {Object} options - Additional options
 * @returns {Object} Field definition
 */
function createCheckboxField(objectName, fieldName, label, options = {}) {
    const { defaultValue = false } = options;

    return {
        fullName: `${objectName}.${fieldName}`,
        label,
        type: 'Checkbox',
        defaultValue,
    };
}

/**
 * Create a multi-select picklist field definition
 * @param {string} objectName - Object name
 * @param {string} fieldName - Field API name
 * @param {string} label - Field label
 * @param {Array} values - Picklist values [{value, label, isDefault}]
 * @param {Object} options - Additional options
 * @returns {Object} Field definition
 */
function createMultiPicklistField(objectName, fieldName, label, values, options = {}) {
    const { restricted = true, sorted = false, visibleLines = 4 } = options;

    return {
        fullName: `${objectName}.${fieldName}`,
        label,
        type: 'MultiselectPicklist',
        visibleLines,
        valueSet: {
            restricted,
            valueSetDefinition: {
                sorted,
                value: values.map(v => ({
                    fullName: v.value,
                    label: v.label || v.value,
                    default: v.isDefault || false,
                })),
            },
        },
    };
}

/**
 * Create a long text area field definition
 * @param {string} objectName - Object name
 * @param {string} fieldName - Field API name
 * @param {string} label - Field label
 * @param {Object} options - Additional options
 * @returns {Object} Field definition
 */
function createTextareaField(objectName, fieldName, label, options = {}) {
    const { length = 32768, visibleLines = 3 } = options;

    return {
        fullName: `${objectName}.${fieldName}`,
        label,
        type: 'LongTextArea',
        length,
        visibleLines,
    };
}

/**
 * Create a lookup field definition
 * @param {string} objectName - Object name
 * @param {string} fieldName - Field API name
 * @param {string} label - Field label
 * @param {string} referenceTo - Target object name
 * @param {Object} options - Additional options
 * @returns {Object} Field definition
 */
function createLookupField(objectName, fieldName, label, referenceTo, options = {}) {
    const { relationshipName = fieldName.replace('__c', ''), deleteConstraint = 'SetNull' } = options;

    return {
        fullName: `${objectName}.${fieldName}`,
        label,
        type: 'Lookup',
        referenceTo,
        relationshipName,
        deleteConstraint,
    };
}

/**
 * Print a summary report
 * @param {Object} results - Results object with created, existing, failed counts
 * @param {string} label - Label for the report section
 */
function printSummary(results, label) {
    console.log(`\n${label}:`);
    console.log(`  - Created: ${results.created}`);
    console.log(`  - Already existed: ${results.existing}`);
    console.log(`  - Failed: ${results.failed}`);
}

module.exports = {
    createConnection,
    checkFieldExists,
    createField,
    processFields,
    getObjectFields,
    checkRequiredFields,
    getApexClass,
    createPicklistField,
    createTextField,
    createCheckboxField,
    createMultiPicklistField,
    createTextareaField,
    createLookupField,
    printSummary,
};
