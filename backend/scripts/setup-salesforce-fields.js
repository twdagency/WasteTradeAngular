#!/usr/bin/env node

/**
 * Setup Salesforce Fields
 * Creates missing custom fields in Salesforce and verifies webhook endpoints.
 */

const { createConnection, processFields, printSummary } = require('./lib/salesforce-utils');
const { testWebhooks } = require('./lib/webhook-utils');
const { FIELD_DEFINITIONS, WEBHOOK_ENDPOINTS } = require('./lib/salesforce-config');

async function main() {
    console.log('🚀 Salesforce Fields Setup\n');
    console.log('='.repeat(60));

    // Step 1: Connect to Salesforce
    console.log('\n📡 Step 1: Checking Salesforce connection...');
    let conn;
    try {
        conn = await createConnection();
        console.log('✅ Connected to Salesforce');
    } catch (error) {
        console.error('❌ Failed to connect to Salesforce:', error.message);
        process.exit(1);
    }

    // Step 2: Create missing fields for all defined field groups
    const fieldGroups = Object.keys(FIELD_DEFINITIONS);
    const results = {};

    for (const group of fieldGroups) {
        const label = group.replace(/_/g, ' ').toLowerCase();
        results[group] = await processFields(conn, FIELD_DEFINITIONS[group], { label });
    }

    // Step 3: Check webhook endpoints
    await testWebhooks(WEBHOOK_ENDPOINTS);

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Setup Summary:\n');
    for (const group of fieldGroups) {
        const label = group.replace(/_/g, ' ').toLowerCase();
        printSummary(results[group], label);
    }

    // Step 4: Deployment instructions
    console.log('\n' + '='.repeat(60));
    console.log('📝 Next Steps:\n');
    console.log('1. Deploy Apex triggers to Salesforce:');
    console.log('   - AccountTrigger.trigger');
    console.log('   - ContactTrigger.trigger');
    console.log('   - WasteTradeWebhookService.cls\n');
    console.log('2. Run deployment script:');
    console.log('   node scripts/deploy-apex-triggers.js\n');

    console.log('✅ Setup complete!');
}

main().catch(error => {
    console.error('❌ Setup failed:', error);
    process.exit(1);
});
