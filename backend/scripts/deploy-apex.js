/**
 * Script to deploy/redeploy Apex Class and Triggers to Salesforce
 * 
 * Run with: node scripts/deploy-apex.js
 * 
 * This script:
 * 1. Deletes existing triggers (including old versions)
 * 2. Deletes existing WasteTradeWebhookService class
 * 3. Creates new WasteTradeWebhookService class with batch processing
 * 4. Creates new triggers with batch processing support
 * 
 * Features:
 * - Batch processing for Account, Contact, HaulageOffers, Documents
 * - Loop prevention via Last_Sync_Origin__c
 * - Custom settings control (optional)
 */

const jsforce = require('jsforce');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

async function redeployApex() {
    console.log('🚀 Redeploying Apex Code to Salesforce...\n');
    
    try {
        const username = process.env.SALESFORCE_USERNAME;
        const password = process.env.SALESFORCE_PASSWORD;
        const securityToken = process.env.SALESFORCE_SECURITY_TOKEN;
        const loginUrl = process.env.SALESFORCE_SANDBOX_URL || process.env.SALESFORCE_PRODUCTION_URL;
        const apiVersion = process.env.SALESFORCE_API_VERSION || '58.0';
        
        console.log('🔌 Connecting to Salesforce...');
        const conn = new jsforce.Connection({ loginUrl, version: apiVersion });
        await conn.login(username, password + securityToken);
        console.log('✅ Connected!\n');
        
        // Step 0: Create Remote Site Settings via Metadata API
        console.log('🌐 Step 0: Creating Remote Site Settings...');
        const remoteSites = [
            { fullName: 'WasteTrade_API_DEV', url: 'https://wastetrade-api-dev.b13devops.com' },
            { fullName: 'WasteTrade_API_UAT', url: 'https://wastetrade-api-uat.b13devops.com' },
            { fullName: 'WasteTrade_API_TEST', url: 'https://wastetrade-api-test.b13devops.com' }
        ];
        
        for (const site of remoteSites) {
            try {
                const result = await conn.metadata.upsert('RemoteSiteSetting', {
                    fullName: site.fullName,
                    url: site.url,
                    isActive: true,
                    disableProtocolSecurity: false,
                    description: 'WasteTrade Backend API - Auto-created by deploy script'
                });
                
                if (result.success) {
                    console.log(`   ✅ ${site.fullName} created/updated`);
                } else {
                    console.log(`   ⚠️  ${site.fullName}: ${result.errors ? result.errors[0].message : 'Unknown error'}`);
                }
            } catch (e) {
                console.log(`   ⚠️  ${site.fullName}: ${e.message}`);
            }
        }
        console.log('');
        
        const apexDir = path.join(__dirname, '..', 'docs', 'salesforce', 'apex');
        
        // Step 1: Delete existing triggers first (they depend on the class)
        console.log('🗑️  Step 1: Deleting existing triggers...');
        const triggers = [
            'AccountTrigger', 
            'ContactTrigger', 
            'HaulageOffersTrigger', 
            'ContentDocumentLinkTrigger',
            'HaulageLoadsTrigger',
            'SalesListingTrigger',
            'WantedListingsTrigger',
            'OffersTrigger'
        ];
        
        for (const triggerName of triggers) {
            const existing = await conn.tooling.query(
                `SELECT Id FROM ApexTrigger WHERE Name = '${triggerName}'`
            );
            if (existing.records && existing.records.length > 0) {
                try {
                    await conn.tooling.sobject('ApexTrigger').delete(existing.records[0].Id);
                    console.log(`   ✅ Deleted ${triggerName}`);
                } catch (e) {
                    console.log(`   ⚠️  Could not delete ${triggerName}: ${e.message}`);
                }
            } else {
                console.log(`   ℹ️  ${triggerName} does not exist`);
            }
        }
        
        // Step 2: Delete existing class
        console.log('\n🗑️  Step 2: Deleting existing WasteTradeWebhookService...');
        const existingClass = await conn.tooling.query(
            "SELECT Id FROM ApexClass WHERE Name = 'WasteTradeWebhookService'"
        );
        
        if (existingClass.records && existingClass.records.length > 0) {
            try {
                await conn.tooling.sobject('ApexClass').delete(existingClass.records[0].Id);
                console.log('   ✅ Deleted WasteTradeWebhookService');
            } catch (e) {
                console.log(`   ⚠️  Could not delete class: ${e.message}`);
                console.log('   ℹ️  You may need to delete it manually in Salesforce Setup');
            }
        } else {
            console.log('   ℹ️  Class does not exist');
        }
        
        // Wait for deletion to propagate
        console.log('\n⏳ Waiting 5 seconds for deletion to propagate...');
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Step 3: Create new class
        console.log('\n📝 Step 3: Creating WasteTradeWebhookService...');
        const classBody = fs.readFileSync(path.join(apexDir, 'WasteTradeWebhookService.cls'), 'utf8');
        
        try {
            const classResult = await conn.tooling.sobject('ApexClass').create({
                Name: 'WasteTradeWebhookService',
                Body: classBody,
                Status: 'Active'
            });
            
            if (classResult.success) {
                console.log('   ✅ WasteTradeWebhookService created successfully');
            } else {
                const errorMsg = classResult.errors ? classResult.errors.map(e => e.message).join(', ') : 'Unknown error';
                console.log(`   ❌ Failed: ${errorMsg}`);
                return;
            }
        } catch (e) {
            console.log(`   ❌ Error: ${e.message}`);
            return;
        }
        
        // Wait for class to be available
        console.log('\n⏳ Waiting 3 seconds for class to be available...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        // Step 4: Create triggers
        console.log('\n📝 Step 4: Creating triggers...');
        
        const triggerConfigs = [
            { name: 'AccountTrigger', object: 'Account', file: 'AccountTrigger.trigger' },
            { name: 'ContactTrigger', object: 'Contact', file: 'ContactTrigger.trigger' },
            { name: 'HaulageOffersTrigger', object: 'Haulage_Offers__c', file: 'HaulageOffersTrigger.trigger' },
            { name: 'ContentDocumentLinkTrigger', object: 'ContentDocumentLink', file: 'ContentDocumentLinkTrigger.trigger' },
            { name: 'HaulageLoadsTrigger', object: 'Haulage_Loads__c', file: 'HaulageLoadsTrigger.trigger' },
            { name: 'SalesListingTrigger', object: 'Sales_Listing__c', file: 'SalesListingTrigger.trigger' },
            { name: 'WantedListingsTrigger', object: 'Wanted_Listings__c', file: 'WantedListingsTrigger.trigger' },
            { name: 'OffersTrigger', object: 'Offers__c', file: 'OffersTrigger.trigger' },
        ];
        
        for (const trigger of triggerConfigs) {
            const triggerBody = fs.readFileSync(path.join(apexDir, trigger.file), 'utf8');
            
            try {
                const result = await conn.tooling.sobject('ApexTrigger').create({
                    Name: trigger.name,
                    TableEnumOrId: trigger.object,
                    Body: triggerBody,
                    Status: 'Active'
                });
                
                if (result.success) {
                    console.log(`   ✅ ${trigger.name} created`);
                } else {
                    const errorMsg = result.errors ? result.errors.map(e => e.message).join(', ') : 'Unknown error';
                    console.log(`   ❌ ${trigger.name} failed: ${errorMsg}`);
                }
            } catch (e) {
                console.log(`   ❌ ${trigger.name} error: ${e.message}`);
            }
            
            // Small delay between triggers
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        
        console.log('\n✅ Deployment complete!');
        console.log('\n📝 Next Steps:');
        console.log('');
        console.log('1. Update Webhook Secret in Apex code:');
        console.log('   File: docs/salesforce/apex/WasteTradeWebhookService.cls');
        console.log('   Line: private static final String WEBHOOK_SECRET = \'your-secret-here\';');
        console.log('   Change to: private static final String WEBHOOK_SECRET = \'<from backend .env>\';');
        console.log('');
        console.log('2. Test with Developer Console:');
        console.log('   // Show active environments');
        console.log('   WasteTradeWebhookService.showEnvironmentConfig();');
        console.log('');
        console.log('   // Test all environments');
        console.log('   WasteTradeWebhookService.testWebhookHealth();');
        console.log('');
        console.log('3. Test webhook trigger:');
        console.log('   - Update any Account with WasteTrade_Company_Id__c');
        console.log('   - Check Debug Logs for [DEV], [UAT], [TEST] webhook calls');
        console.log('');
        console.log('✨ Webhooks will be sent to:');
        console.log('   - DEV: https://wastetrade-api-dev.b13devops.com');
        console.log('   - UAT: https://wastetrade-api-uat.b13devops.com');
        console.log('   - TEST: https://wastetrade-api-test.b13devops.com');
        
    } catch (error) {
        console.error('\n❌ Error:', error.message);
    }
}

redeployApex();
