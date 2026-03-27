/**
 * Salesforce Script Utilities - Main Export
 * 
 * Import utilities and config in your scripts:
 * const { createConnection, OBJECTS } = require('./lib');
 */

// Export all utilities
module.exports = {
    // Salesforce utilities
    ...require('./salesforce-utils'),
    
    // Webhook utilities
    ...require('./webhook-utils'),
    
    // Configuration
    ...require('./salesforce-config'),
};
