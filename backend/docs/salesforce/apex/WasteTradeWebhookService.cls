/**
 * WasteTrade Webhook Service
 * Handles HTTP callouts to WasteTrade API for inbound sync (SF → WT)
 *
 * Loop Prevention:
 * - Loop prevention is handled by TRIGGERS (not this class)
 * - Triggers check if Last_Sync_Origin__c was JUST CHANGED in current transaction
 * - This class only sends webhooks - triggers decide WHEN to call it
 *
 * Smart Environment Routing:
 * - Auto-detects target environment from externalId prefix (DEV_, UAT_, TEST_, PROD_)
 * - Only sends webhook to the matching backend - no wasted callouts
 * - Example: externalId "DEV_123" → sends only to DEV backend
 * - Fallback: if no prefix detected, sends to all environments
 *
 * Setup Instructions:
 * 1. Run: node scripts/deploy-apex.js (creates Remote Site Settings + deploys code)
 * 2. Test: WasteTradeWebhookService.testWebhookHealth();
 */
public class WasteTradeWebhookService {

    // Backend Environment URLs (1 Salesforce → multiple Backend Environments)
    private static final String DEV_API_URL = 'https://wastetrade-api-dev.b13devops.com';
    private static final String UAT_API_URL = 'https://wastetrade-api-uat.b13devops.com';
    private static final String TEST_API_URL = 'https://wastetrade-api-test.b13devops.com';

    // Webhook Secret (must match backend .env SALESFORCE_WEBHOOK_SECRET)
    private static final String WEBHOOK_SECRET = 'WA5tRa0E20XX';

    /**
     * Get all environment configurations
     * Returns map of environment name to config (apiUrl, secret)
     */
    private static Map<String, Map<String, String>> getEnvironmentConfigs() {
        Map<String, Map<String, String>> envConfigs = new Map<String, Map<String, String>>();

        envConfigs.put('DEV', new Map<String, String>{
            'apiUrl' => DEV_API_URL,
            'secret' => WEBHOOK_SECRET
        });
        envConfigs.put('UAT', new Map<String, String>{
            'apiUrl' => UAT_API_URL,
            'secret' => WEBHOOK_SECRET
        });
        envConfigs.put('TEST', new Map<String, String>{
            'apiUrl' => TEST_API_URL,
            'secret' => WEBHOOK_SECRET
        });

        return envConfigs;
    }

    /**
     * Auto-detect target environment from externalId prefix
     * Each backend stamps records with its env prefix: DEV_123, UAT_456, PROD_789
     * Returns the env name (DEV/UAT/TEST/PROD) or null if undetectable
     */
    private static String detectEnvironment(Map<String, Object> payload) {
        // Check the 'externalId' field - all webhook payloads include this with env prefix
        if (payload.containsKey('externalId') && payload.get('externalId') != null) {
            String val = String.valueOf(payload.get('externalId'));
            if (val.startsWith('DEV_')) return 'DEV';
            if (val.startsWith('UAT_')) return 'UAT';
            if (val.startsWith('TEST_')) return 'TEST';
            if (val.startsWith('PROD_')) return 'PROD';
        }
        return null;
    }
    
    // NOTE: Loop prevention is now handled by triggers, not this class
    // Triggers check if Last_Sync_Origin__c was JUST CHANGED in current transaction
    // This class is only called when triggers determine webhook should be sent
    
    /**
     * Send Account update to WasteTrade (single record, standalone @future)
     * Called directly when only one account needs syncing
     */
    @future(callout=true)
    public static void sendAccountUpdate(Id accountId) {
        sendAccountUpdateSync(accountId);
    }

    /**
     * Send multiple Account updates to WasteTrade (batch)
     * Called from trigger with list of accounts
     */
    @future(callout=true)
    public static void sendAccountUpdates(List<Id> accountIds) {
        for (Id accountId : accountIds) {
            sendAccountUpdateSync(accountId);
        }
    }

    /**
     * Internal: Send Account update (non-future, safe to call from @future batch methods)
     */
    private static void sendAccountUpdateSync(Id accountId) {
        try {
            Account acc = [
                SELECT Id, Name, WasteTrade_Company_Id__c,
                       BillingStreet, BillingCity, BillingPostalCode,
                       BillingCountry, BillingState, Phone, Website,
                       Account_Status__c, Company_VAT_Number__c, Company_Registration_Number__c,
                       Email__c, Fax,
                       Fleet_Type__c, Areas_Covered__c, EU_Countries__c, WT_Container_Types__c,
                       Last_Sync_Origin__c, LastModifiedDate, LastModifiedById
                FROM Account
                WHERE Id = :accountId
                LIMIT 1
            ];

            // Skip if no WasteTrade ID
            if (acc.WasteTrade_Company_Id__c == null) {
                System.debug('Skipping account without WasteTrade ID: ' + accountId);
                return;
            }


            Map<String, Object> payload = new Map<String, Object>{
                'accountId' => String.valueOf(acc.Id),
                'externalId' => acc.WasteTrade_Company_Id__c,
                'name' => acc.Name,
                'billingStreet' => acc.BillingStreet,
                'billingCity' => acc.BillingCity,
                'billingPostalCode' => acc.BillingPostalCode,
                'billingCountry' => acc.BillingCountry,
                'billingState' => acc.BillingState,
                'phone' => acc.Phone,
                'website' => acc.Website,
                'accountStatus' => acc.Account_Status__c,
                'vatNumber' => acc.Company_VAT_Number__c,
                'registrationNumber' => acc.Company_Registration_Number__c,
                'email' => acc.Email__c,
                'mobileNumber' => acc.Fax,
                'fleetType' => acc.Fleet_Type__c,
                'areasCovered' => acc.Areas_Covered__c,
                'euCountries' => acc.EU_Countries__c,
                'containerTypes' => acc.WT_Container_Types__c,
                'updatedAt' => acc.LastModifiedDate.formatGmt('yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
                'updatedBy' => String.valueOf(acc.LastModifiedById),
                'originMarker' => 'SF_' + acc.Id
            };

            sendWebhook('/salesforce/webhook/account-updated', payload);

        } catch (Exception e) {
            System.debug('Error sending account update: ' + e.getMessage());
        }
    }
    
    /**
     * Send Contact update to WasteTrade (single record, standalone @future)
     * Called directly when only one contact needs syncing
     */
    @future(callout=true)
    public static void sendContactUpdate(Id contactId) {
        sendContactUpdateSync(contactId);
    }

    /**
     * Send multiple Contact updates to WasteTrade (batch)
     * Called from trigger with list of contacts
     */
    @future(callout=true)
    public static void sendContactUpdates(List<Id> contactIds) {
        for (Id contactId : contactIds) {
            sendContactUpdateSync(contactId);
        }
    }

    /**
     * Internal: Send Contact update (non-future, safe to call from @future batch methods)
     * Fields synced (bidirectional per CRM Alignment CU-869abxxq7):
     * - Basic: FirstName, LastName, Email, Phone, Title, Job_Title__c
     * - CompanyUser: Company_Role__c, Is_Primary_Contact__c, Company_User_Status__c
     */
    private static void sendContactUpdateSync(Id contactId) {
        try {
            Contact con = [
                SELECT Id, WasteTrade_User_Id__c, AccountId, Account.WasteTrade_Company_Id__c,
                       Email, FirstName, LastName, Phone, MobilePhone, Salutation,
                       Title, Job_Title__c,
                       Company_Role__c, Is_Primary_Contact__c, Company_User_Status__c,
                       Last_Sync_Origin__c, LastModifiedDate, LastModifiedById
                FROM Contact
                WHERE Id = :contactId
                LIMIT 1
            ];

            // Skip if no WasteTrade ID
            if (con.WasteTrade_User_Id__c == null) {
                System.debug('Skipping contact without WasteTrade ID: ' + contactId);
                return;
            }


            Map<String, Object> payload = new Map<String, Object>{
                'contactId' => String.valueOf(con.Id),
                'externalId' => con.WasteTrade_User_Id__c,
                'accountId' => String.valueOf(con.AccountId),
                'accountExternalId' => con.Account.WasteTrade_Company_Id__c,
                'email' => con.Email,
                'firstName' => con.FirstName,
                'lastName' => con.LastName,
                'phone' => con.Phone,
                'mobilePhone' => con.MobilePhone,
                'salutation' => con.Salutation,
                'title' => con.Title,
                'jobTitle' => con.Job_Title__c,
                // CompanyUser fields for bidirectional sync
                'companyRole' => con.Company_Role__c,
                'isPrimaryContact' => con.Is_Primary_Contact__c,
                'memberStatus' => con.Company_User_Status__c,
                'updatedAt' => con.LastModifiedDate.formatGmt('yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
                'updatedBy' => String.valueOf(con.LastModifiedById),
                'originMarker' => 'SF_' + con.Id
            };

            sendWebhook('/salesforce/webhook/contact-updated', payload);

        } catch (Exception e) {
            System.debug('Error sending contact update: ' + e.getMessage());
        }
    }
    
    /**
     * Send multiple Haulage Offer status updates to WasteTrade (batch)
     * Called from trigger with list of offers
     */
    @future(callout=true)
    public static void sendHaulageOfferStatusUpdates(List<Id> haulageOfferIds) {
        for (Id haulageOfferId : haulageOfferIds) {
            sendHaulageOfferStatusUpdateSync(haulageOfferId);
        }
    }

    /**
     * Send multiple Haulage Load updates to WasteTrade (batch)
     * Called from trigger with list of loads
     */
    @future(callout=true)
    public static void sendHaulageLoadUpdates(List<Id> loadIds) {
        for (Id loadId : loadIds) {
            sendHaulageLoadUpdateSync(loadId);
        }
    }

    /**
     * Send Haulage Load update to WasteTrade (single record, standalone @future)
     * Called directly when only one load needs syncing
     */
    @future(callout=true)
    public static void sendHaulageLoadUpdate(Id loadId) {
        sendHaulageLoadUpdateSync(loadId);
    }

    /**
     * Internal: Send Haulage Load update (non-future, safe to call from @future batch methods)
     * Sends all load data - WT will find record by salesforceId or loadId
     */
    private static void sendHaulageLoadUpdateSync(Id loadId) {
        try {
            Haulage_Loads__c load = [
                SELECT Id, WasteTrade_Load_Id__c, haulage_bid_id__c, load_number__c, collection_date__c,
                       gross_weight__c, pallet_weight__c, load_status__c,
                       Last_Sync_Origin__c, LastModifiedDate, LastModifiedById
                FROM Haulage_Loads__c 
                WHERE Id = :loadId
                LIMIT 1
            ];

            
            // Extract numeric load ID from external ID if available
            Integer numericLoadId = null;
            if (load.WasteTrade_Load_Id__c != null) {
                String loadExternalId = load.WasteTrade_Load_Id__c.replaceAll('^(DEV_|TEST_|UAT_|PROD_)', '');
                numericLoadId = Integer.valueOf(loadExternalId);
            }
            
            // Extract haulage offer ID if available
            Integer haulageOfferId = null;
            if (load.haulage_bid_id__c != null) {
                String offerIdStr = load.haulage_bid_id__c.replaceAll('^(DEV_|TEST_|UAT_|PROD_)', '');
                haulageOfferId = Integer.valueOf(offerIdStr);
            }
            
            Map<String, Object> payload = new Map<String, Object>{
                'loadId' => numericLoadId,
                'externalId' => load.WasteTrade_Load_Id__c,
                'salesforceId' => String.valueOf(load.Id),
                'haulageOfferId' => haulageOfferId,
                'loadNumber' => load.load_number__c,
                'collectionDate' => load.collection_date__c,
                'grossWeight' => load.gross_weight__c,
                'palletWeight' => load.pallet_weight__c,
                'loadStatus' => load.load_status__c,
                'updatedAt' => load.LastModifiedDate.formatGmt('yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
                'updatedBy' => String.valueOf(load.LastModifiedById),
                'originMarker' => 'SF_' + load.Id
            };
            
            sendWebhook('/salesforce/webhook/load-updated', payload);
            
        } catch (Exception e) {
            System.debug('Error sending haulage load update: ' + e.getMessage());
        }
    }
    
    /**
     * Send Haulage Offer status update to WasteTrade (single record, standalone @future)
     * Called directly when only one haulage offer needs syncing
     */
    @future(callout=true)
    public static void sendHaulageOfferStatusUpdate(Id haulageOfferId) {
        sendHaulageOfferStatusUpdateSync(haulageOfferId);
    }

    /**
     * Internal: Send Haulage Offer status update (non-future, safe to call from @future batch methods)
     * Only sends fields that exist on Haulage_Offers__c object
     */
    private static void sendHaulageOfferStatusUpdateSync(Id haulageOfferId) {
        try {
            Haulage_Offers__c offer = [
                SELECT Id, WasteTrade_Haulage_Offers_ID__c, 
                       // Status and rejection
                       haulier_listing_status__c,
                       haulage_rejection_reason__c,
                       offer_accepted__c,
                       offer_rejected__c,
                       // Transport details
                       suggested_collection_date__c,
                       Transport_Provider__c,
                       trailer_or_container__c,
                       trailer_type__c,
                       container_type__c,
                       Customs_Clearance__c,
                       expected__c,
                       // Costs
                       demurrage__c,
                       haulage__c,
                       haulage_total__c,
                       haulage_currency__c,
                       destination_charges__c,
                       haulage_extras__c,
                       // Notes
                       post_notes__c,
                       haulage_notes__c,
                       so_details__c,
                       // Metadata
                       Last_Sync_Origin__c,
                       LastModifiedDate, 
                       LastModifiedById
                FROM Haulage_Offers__c 
                WHERE Id = :haulageOfferId
                LIMIT 1
            ];
            
            // Skip if no WasteTrade ID
            if (offer.WasteTrade_Haulage_Offers_ID__c == null) {
                System.debug('Skipping haulage offer without WasteTrade ID: ' + haulageOfferId);
                return;
            }

            
            // Extract numeric ID from external ID (remove DEV_/UAT_/PROD_ prefix)
            String externalId = offer.WasteTrade_Haulage_Offers_ID__c;
            String numericId = externalId.replaceAll('^(DEV_|TEST_|UAT_|PROD_)', '');
            
            Map<String, Object> payload = new Map<String, Object>{
                'haulageOfferId' => Integer.valueOf(numericId),
                'externalId' => externalId,
                'salesforceId' => String.valueOf(offer.Id),
                // Status and rejection - send raw SF values, WT service handles mapping
                'status' => offer.haulier_listing_status__c,
                'rejectionReason' => offer.haulage_rejection_reason__c,
                'offerAccepted' => offer.offer_accepted__c,
                'offerRejected' => offer.offer_rejected__c,
                // Transport details - send raw SF values, WT service handles mapping
                'suggestedCollectionDate' => offer.suggested_collection_date__c,
                'transportProvider' => offer.Transport_Provider__c,
                'trailerContainerType' => offer.trailer_type__c != null ? offer.trailer_type__c : offer.trailer_or_container__c,
                'completingCustomsClearance' => offer.Customs_Clearance__c,
                'expectedTransitTime' => offer.expected__c,
                // Costs
                'demurrageAtDestination' => offer.demurrage__c,
                'haulageCostPerLoad' => offer.haulage__c,
                'haulageTotal' => offer.haulage_total__c,
                'currency' => offer.haulage_currency__c,
                'destinationCharges' => offer.destination_charges__c,
                'haulageExtras' => offer.haulage_extras__c,
                // Notes
                'adminMessage' => offer.post_notes__c,
                'notes' => offer.haulage_notes__c,
                'soDetails' => offer.so_details__c,
                // Metadata
                'updatedAt' => offer.LastModifiedDate.formatGmt('yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
                'updatedBy' => String.valueOf(offer.LastModifiedById),
                'originMarker' => 'SF_' + offer.Id
            };
            
            sendWebhook('/salesforce/webhook/haulage-offer-status', payload);
            
        } catch (Exception e) {
            System.debug('Error sending haulage offer update: ' + e.getMessage());
        }
    }
    
    /**
     * Send documents for multiple Haulage Offers to WasteTrade (batch)
     * Called from trigger with map of offer IDs to document IDs
     */
    @future(callout=true)
    public static void sendHaulageOfferDocumentsBatch(Map<String, String> offerDocumentsJson) {
        // Deserialize the map (workaround for @future not supporting Map<Id, List<Id>>)
        Map<String, Object> offerDocsMap = (Map<String, Object>) JSON.deserializeUntyped(offerDocumentsJson.get('data'));
        
        for (String offerIdStr : offerDocsMap.keySet()) {
            List<Object> docIdsObj = (List<Object>) offerDocsMap.get(offerIdStr);
            List<Id> documentIds = new List<Id>();
            for (Object docIdObj : docIdsObj) {
                documentIds.add((Id) docIdObj);
            }
            sendHaulageOfferDocuments((Id) offerIdStr, documentIds);
        }
    }
    
    /**
     * Send Haulage Offer documents to WasteTrade
     * Called when documents are attached to a Haulage Offer
     * 
     * @param haulageOfferId - Salesforce Haulage_Offers__c record ID
     * @param documentIds - List of ContentDocument IDs to send
     */
    @future(callout=true)
    public static void sendHaulageOfferDocuments(Id haulageOfferId, List<Id> documentIds) {
        try {
            Haulage_Offers__c offer = [
                SELECT Id, WasteTrade_Haulage_Offers_ID__c
                FROM Haulage_Offers__c 
                WHERE Id = :haulageOfferId
                LIMIT 1
            ];
            
            // Skip if no WasteTrade ID
            if (offer.WasteTrade_Haulage_Offers_ID__c == null) {
                System.debug('Skipping documents - haulage offer without WasteTrade ID: ' + haulageOfferId);
                return;
            }
            
            // Extract numeric ID from external ID
            String externalId = offer.WasteTrade_Haulage_Offers_ID__c;
            String numericId = externalId.replaceAll('^(DEV_|TEST_|UAT_|PROD_)', '');
            
            // Get document details
            List<ContentVersion> contentVersions = [
                SELECT Id, Title, ContentDocumentId
                FROM ContentVersion
                WHERE ContentDocumentId IN :documentIds
                AND IsLatest = true
            ];
            
            if (contentVersions.isEmpty()) {
                System.debug('No documents found for IDs: ' + documentIds);
                return;
            }
            
            // Build documents array
            List<Map<String, Object>> documents = new List<Map<String, Object>>();
            String baseUrl = System.URL.getOrgDomainUrl().toExternalForm();
            
            for (ContentVersion cv : contentVersions) {
                // Build downloadable URL
                String downloadUrl = baseUrl + '/sfc/servlet.shepherd/version/download/' + cv.Id;
                
                documents.add(new Map<String, Object>{
                    'title' => cv.Title,
                    'url' => downloadUrl,
                    'salesforceDocumentId' => String.valueOf(cv.ContentDocumentId)
                });
            }
            
            Map<String, Object> payload = new Map<String, Object>{
                'haulageOfferId' => Integer.valueOf(numericId),
                'externalId' => externalId,
                'documents' => documents
            };
            
            sendWebhook('/salesforce/webhook/haulage-documents', payload);
            
        } catch (Exception e) {
            System.debug('Error sending haulage offer documents: ' + e.getMessage());
        }
    }
    
    /**
     * Map Salesforce haulage status to WasteTrade status enum
     */
    // All mapping functions removed — Apex sends raw SF picklist values,
    // WT service handles all SF→WT mapping via bidirectional mappers.
    
    /**
     * Smart webhook sender - auto-routes to the correct environment
     * Detects target env from externalId prefix (DEV_/UAT_/TEST_/PROD_)
     * Falls back to all environments if prefix not detected
     */
    private static void sendWebhook(String endpoint, Map<String, Object> payload) {
        Map<String, Map<String, String>> envConfigs = getEnvironmentConfigs();

        if (envConfigs.isEmpty()) {
            System.debug('❌ No active environments configured');
            return;
        }

        // Auto-detect which environment this record belongs to
        String targetEnv = detectEnvironment(payload);

        if (targetEnv != null && envConfigs.containsKey(targetEnv)) {
            // Send to specific environment only (1 callout instead of N)
            sendToEnvironment(targetEnv, envConfigs.get(targetEnv), endpoint, payload);
        } else {
            // Fallback: send to all environments (for records without env prefix)
            System.debug('⚠️  No env prefix detected, sending to all environments');
            for (String env : envConfigs.keySet()) {
                sendToEnvironment(env, envConfigs.get(env), endpoint, payload);
            }
        }
    }

    /**
     * Send webhook to a single environment
     */
    private static void sendToEnvironment(
        String env, Map<String, String> config, String endpoint, Map<String, Object> payload
    ) {
        String apiUrl = config.get('apiUrl');
        String secret = config.get('secret');

        HttpRequest req = new HttpRequest();
        req.setEndpoint(apiUrl + endpoint);
        req.setMethod('POST');
        req.setHeader('Content-Type', 'application/json');
        req.setHeader('X-Salesforce-Secret', secret);
        req.setHeader('X-Environment', env);
        req.setBody(JSON.serialize(payload));
        req.setTimeout(30000);

        try {
            Http http = new Http();
            HttpResponse res = http.send(req);

            if (res.getStatusCode() == 200) {
                System.debug('✅ [' + env + '] Webhook sent to ' + endpoint);
            } else {
                System.debug('❌ [' + env + '] Webhook failed: ' + res.getStatusCode() + ' - ' + res.getBody());
            }
        } catch (Exception e) {
            System.debug('❌ [' + env + '] Webhook error: ' + e.getMessage());
        }
    }
    
    /**
     * Test method - call from Developer Console to verify connectivity
     * Tests all active environments
     */
    public static void testWebhookHealth() {
        Map<String, Map<String, String>> envConfigs = getEnvironmentConfigs();
        
        System.debug('🔍 Testing ' + envConfigs.size() + ' environment(s)...\n');
        
        for (String env : envConfigs.keySet()) {
            Map<String, String> config = envConfigs.get(env);
            String apiUrl = config.get('apiUrl');
            
            System.debug('Testing ' + env + ': ' + apiUrl);
            
            HttpRequest req = new HttpRequest();
            req.setEndpoint(apiUrl + '/salesforce/webhook/health');
            req.setMethod('POST');
            req.setHeader('Content-Type', 'application/json');
            req.setHeader('X-Environment', env);
            req.setTimeout(30000);
            
            try {
                Http http = new Http();
                HttpResponse res = http.send(req);
                
                System.debug('✅ [' + env + '] Status: ' + res.getStatusCode());
                System.debug('Response: ' + res.getBody() + '\n');
            } catch (Exception e) {
                System.debug('❌ [' + env + '] Error: ' + e.getMessage() + '\n');
            }
        }
    }
    
    /**
     * Get current environment configuration (for debugging)
     */
    public static void showEnvironmentConfig() {
        Map<String, Map<String, String>> envConfigs = getEnvironmentConfigs();
        
        System.debug('📋 Active Environments: ' + envConfigs.size());
        for (String env : envConfigs.keySet()) {
            Map<String, String> config = envConfigs.get(env);
            System.debug('  ' + env + ': ' + config.get('apiUrl'));
        }
    }
    
    /**
     * Push Listing updates to WasteTrade (6.5.1.4)
     * Called from SalesListingTrigger when ANY mapped field changes
     */
    @future(callout=true)
    public static void pushListingUpdates(List<Id> listingIds) {
        for (Id listingId : listingIds) {
            pushListingUpdateSync(listingId);
        }
    }
    
    /**
     * Legacy method for backward compatibility
     */
    @future(callout=true)
    public static void pushListingStatusUpdates(List<Id> listingIds) {
        pushListingUpdates(listingIds);
    }
    
    /**
     * Send Listing update to WasteTrade (non-future, called from batch)
     * Only sends fields that exist on Sales_Listing__c
     */
    private static void pushListingUpdateSync(Id listingId) {
        try {
            Sales_Listing__c listing = [
                SELECT Id, WasteTrade_Listing_Id__c, Listing_Status__c,
                       Description__c, Material_Weight__c, Number_of_Loads__c,
                       Packaging_Type__c, Storage_Type__c, Available_From_Date__c,
                       CurrencyIsoCode, Material_Type__c, Group__c, Material__c,
                       Price_Per_Tonne__c, Indicated_Price__c,
                       Last_Sync_Origin__c, LastModifiedDate, LastModifiedById
                FROM Sales_Listing__c 
                WHERE Id = :listingId
                LIMIT 1
            ];
            
            // Skip if no WasteTrade ID
            if (listing.WasteTrade_Listing_Id__c == null) {
                System.debug('Skipping listing without WasteTrade ID: ' + listingId);
                return;
            }

            
            // Extract numeric ID
            String externalId = listing.WasteTrade_Listing_Id__c;
            String numericId = externalId.replaceAll('^(DEV_|TEST_|UAT_|PROD_)', '');
            
            Map<String, Object> payload = new Map<String, Object>{
                'listingId' => Integer.valueOf(numericId),
                'externalId' => externalId,
                'salesforceId' => String.valueOf(listing.Id),
                'status' => listing.Listing_Status__c,
                'description' => listing.Description__c,
                'materialWeight' => listing.Material_Weight__c,
                'numberOfLoads' => listing.Number_of_Loads__c,
                'packagingType' => listing.Packaging_Type__c,
                'storageType' => listing.Storage_Type__c,
                'availableFromDate' => listing.Available_From_Date__c,
                'currency' => listing.CurrencyIsoCode,
                'materialType' => listing.Material_Type__c,
                'materialGroup' => listing.Group__c,
                'material' => listing.Material__c,
                'pricePerTonne' => listing.Price_Per_Tonne__c,
                'indicatedPrice' => listing.Indicated_Price__c,
                'updatedAt' => listing.LastModifiedDate.formatGmt('yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
                'updatedBy' => String.valueOf(listing.LastModifiedById),
                'originMarker' => 'SF_' + listing.Id
            };
            
            sendWebhook('/salesforce/webhook/listing-status-updated', payload);
            
        } catch (Exception e) {
            System.debug('Error sending listing update: ' + e.getMessage());
        }
    }
    
    /**
     * Push Offer updates to WasteTrade (6.5.1.4)
     * Called from OffersTrigger when ANY mapped field changes
     */
    @future(callout=true)
    public static void pushOfferUpdates(List<Id> offerIds) {
        for (Id offerId : offerIds) {
            pushOfferUpdateSync(offerId);
        }
    }
    
    /**
     * Legacy method for backward compatibility
     */
    @future(callout=true)
    public static void pushOfferStatusUpdates(List<Id> offerIds) {
        pushOfferUpdates(offerIds);
    }
    
    /**
     * Send Offer update to WasteTrade (non-future, called from batch)
     * Sends ALL mapped fields per BA confirmation
     */
    private static void pushOfferUpdateSync(Id offerId) {
        try {
            Offers__c offer = [
                SELECT Id, WasteTrade_Offer_Id__c, bid_status__c, Offer_Status__c,
                       Rejection_Reason__c, Offered_Price_Per_Unit__c, Currency__c,
                       Incoterms__c, number_of_loads_bid_on__c, Quantity__c,
                       Total_Price__c, Earliest_Delivery_Date__c, Latest_Delivery_Date__c,
                       // NEW fields from CSV checklist
                       Buyer_Location__c, Seller_Location__c,
                       Last_Sync_Origin__c, LastModifiedDate, LastModifiedById
                FROM Offers__c 
                WHERE Id = :offerId
                LIMIT 1
            ];
            
            // Skip if no WasteTrade ID
            if (offer.WasteTrade_Offer_Id__c == null) {
                System.debug('Skipping offer without WasteTrade ID: ' + offerId);
                return;
            }

            
            // Extract numeric ID
            String externalId = offer.WasteTrade_Offer_Id__c;
            String numericId = externalId.replaceAll('^(DEV_|TEST_|UAT_|PROD_)', '');
            
            // Use bid_status__c as primary status field
            String status = offer.bid_status__c != null ? offer.bid_status__c : offer.Offer_Status__c;
            
            Map<String, Object> payload = new Map<String, Object>{
                'offerId' => Integer.valueOf(numericId),
                'externalId' => externalId,
                'salesforceId' => String.valueOf(offer.Id),
                // All mapped fields from CSV
                'status' => status,
                'rejectionReason' => offer.Rejection_Reason__c,
                'offeredPricePerUnit' => offer.Offered_Price_Per_Unit__c,
                'currency' => offer.Currency__c,
                'incoterms' => offer.Incoterms__c,
                'numberOfLoadsBidOn' => offer.number_of_loads_bid_on__c,
                'quantity' => offer.Quantity__c,
                'totalPrice' => offer.Total_Price__c,
                'earliestDeliveryDate' => offer.Earliest_Delivery_Date__c,
                'latestDeliveryDate' => offer.Latest_Delivery_Date__c,
                // NEW fields from CSV checklist
                'buyerLocation' => offer.Buyer_Location__c,
                'sellerLocation' => offer.Seller_Location__c,
                'updatedAt' => offer.LastModifiedDate.formatGmt('yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
                'updatedBy' => String.valueOf(offer.LastModifiedById),
                'originMarker' => 'SF_' + offer.Id
            };
            
            sendWebhook('/salesforce/webhook/offer-status-updated', payload);
            
        } catch (Exception e) {
            System.debug('Error sending offer update: ' + e.getMessage());
        }
    }
    
    /**
     * Push Wanted Listing updates to WasteTrade (6.5.1.4)
     * Called from WantedListingsTrigger when ANY mapped field changes
     */
    @future(callout=true)
    public static void pushWantedListingUpdates(List<Id> listingIds) {
        for (Id listingId : listingIds) {
            pushWantedListingUpdateSync(listingId);
        }
    }
    
    /**
     * Legacy method for backward compatibility
     */
    @future(callout=true)
    public static void pushWantedListingStatusUpdates(List<Id> listingIds) {
        pushWantedListingUpdates(listingIds);
    }
    
    /**
     * Send Wanted Listing update to WasteTrade (non-future, called from batch)
     * Only sends fields that exist on Wanted_Listings__c
     */
    private static void pushWantedListingUpdateSync(Id listingId) {
        try {
            Wanted_Listings__c listing = [
                SELECT Id, WasteTrade_Listing_Id__c, Listing_Status__c,
                       Quantity__c, How_its_packaged__c, Comments__c,
                       Available_From__c,
                       Material_Type__c, Material_Group__c, Company_Name__c, Wt_Author_ID__c,
                       Last_Sync_Origin__c, LastModifiedDate, LastModifiedById
                FROM Wanted_Listings__c
                WHERE Id = :listingId
                LIMIT 1
            ];
            
            // Skip if no WasteTrade ID
            if (listing.WasteTrade_Listing_Id__c == null) {
                System.debug('Skipping wanted listing without WasteTrade ID: ' + listingId);
                return;
            }

            
            // Extract numeric ID
            String externalId = listing.WasteTrade_Listing_Id__c;
            String numericId = externalId.replaceAll('^(DEV_|TEST_|UAT_|PROD_)', '');
            
            Map<String, Object> payload = new Map<String, Object>{
                'listingId' => Integer.valueOf(numericId),
                'externalId' => externalId,
                'salesforceId' => String.valueOf(listing.Id),
                'status' => listing.Listing_Status__c,
                'quantity' => listing.Quantity__c,
                'packagingType' => listing.How_its_packaged__c,
                'comments' => listing.Comments__c,
                'availableFrom' => listing.Available_From__c,
                'materialType' => listing.Material_Type__c,
                'materialGroup' => listing.Material_Group__c,
                'companyName' => listing.Company_Name__c,
                'authorId' => listing.Wt_Author_ID__c,
                'updatedAt' => listing.LastModifiedDate.formatGmt('yyyy-MM-dd\'T\'HH:mm:ss\'Z\''),
                'updatedBy' => String.valueOf(listing.LastModifiedById),
                'originMarker' => 'SF_' + listing.Id
            };
            
            sendWebhook('/salesforce/webhook/wanted-listing-status-updated', payload);
            
        } catch (Exception e) {
            System.debug('Error sending wanted listing update: ' + e.getMessage());
        }
    }
}
