/**
 * ContentDocumentLink Trigger for WasteTrade Webhook Integration
 * Sends webhook to WasteTrade when documents are attached to Haulage Offers
 * 
 * This trigger fires when files are linked to records via ContentDocumentLink
 * 
 * Features:
 * - Batch processing for multiple document attachments
 * - Validates Haulage Offers have WasteTrade IDs before sending
 */
trigger ContentDocumentLinkTrigger on ContentDocumentLink (after insert) {
    if (Trigger.isAfter && Trigger.isInsert) {
        // Collect Haulage Offer IDs and their document IDs
        Map<Id, List<Id>> haulageOfferDocuments = new Map<Id, List<Id>>();
        
        for (ContentDocumentLink cdl : Trigger.new) {
            // Check if linked to a Haulage_Offers__c record
            if (cdl.LinkedEntityId.getSObjectType() == Haulage_Offers__c.SObjectType) {
                if (!haulageOfferDocuments.containsKey(cdl.LinkedEntityId)) {
                    haulageOfferDocuments.put(cdl.LinkedEntityId, new List<Id>());
                }
                haulageOfferDocuments.get(cdl.LinkedEntityId).add(cdl.ContentDocumentId);
            }
        }
        
        if (!haulageOfferDocuments.isEmpty()) {
            // Verify offers have WasteTrade IDs (bulk query)
            Map<Id, Haulage_Offers__c> offers = new Map<Id, Haulage_Offers__c>([
                SELECT Id, WasteTrade_Haulage_Offers_ID__c 
                FROM Haulage_Offers__c 
                WHERE Id IN :haulageOfferDocuments.keySet()
                AND WasteTrade_Haulage_Offers_ID__c != null
            ]);
            
            // Filter to only offers with WasteTrade IDs
            Map<Id, List<Id>> validOfferDocuments = new Map<Id, List<Id>>();
            for (Id offerId : offers.keySet()) {
                validOfferDocuments.put(offerId, haulageOfferDocuments.get(offerId));
            }
            
            if (!validOfferDocuments.isEmpty()) {
                // Serialize map for @future call (workaround for type limitation)
                Map<String, Object> offerDocsMap = new Map<String, Object>();
                for (Id offerId : validOfferDocuments.keySet()) {
                    offerDocsMap.put(String.valueOf(offerId), validOfferDocuments.get(offerId));
                }
                
                Map<String, String> jsonWrapper = new Map<String, String>{
                    'data' => JSON.serialize(offerDocsMap)
                };
                
                WasteTradeWebhookService.sendHaulageOfferDocumentsBatch(jsonWrapper);
            }
        }
    }
}
