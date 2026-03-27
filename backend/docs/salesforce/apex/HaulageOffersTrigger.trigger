/**
 * Haulage Offers Trigger for WasteTrade Webhook Integration
 * Sends webhook to WasteTrade when Haulage Offer status is updated
 * 
 * Loop Prevention:
 * - Checks if Last_Sync_Origin__c was JUST set in this transaction
 * - Only skip if the origin marker was set in the same update (not from previous sync)
 * 
 * Features:
 * - Batch processing for bulk updates
 * - Custom settings control (optional)
 */
trigger HaulageOffersTrigger on Haulage_Offers__c (after update) {
    if (Trigger.isAfter && Trigger.isUpdate) {
        List<Id> offersToSync = new List<Id>();
        
        for (Haulage_Offers__c offer : Trigger.new) {
            Haulage_Offers__c oldOffer = Trigger.oldMap.get(offer.Id);
            
            // Skip if no WasteTrade ID (not synced with WasteTrade)
            if (offer.WasteTrade_Haulage_Offers_ID__c == null) {
                continue;
            }
            
            // LOOP PREVENTION: Only skip if Last_Sync_Origin__c was JUST changed in this update
            // This allows webhook to fire when user edits SF directly (origin unchanged)
            Boolean originJustSet = offer.Last_Sync_Origin__c != oldOffer.Last_Sync_Origin__c 
                                    && offer.Last_Sync_Origin__c != null 
                                    && offer.Last_Sync_Origin__c.startsWith('WT_');
            if (originJustSet) {
                System.debug('Skipping webhook - update originated from WasteTrade: ' + offer.Last_Sync_Origin__c);
                continue;
            }
            
            // Check if any syncable field changed (only fields that exist on Haulage_Offers__c)
            Boolean shouldSync = 
                // Status and rejection
                offer.haulier_listing_status__c != oldOffer.haulier_listing_status__c ||
                offer.haulage_rejection_reason__c != oldOffer.haulage_rejection_reason__c ||
                offer.offer_accepted__c != oldOffer.offer_accepted__c ||
                offer.offer_rejected__c != oldOffer.offer_rejected__c ||
                // Transport details
                offer.suggested_collection_date__c != oldOffer.suggested_collection_date__c ||
                offer.Transport_Provider__c != oldOffer.Transport_Provider__c ||
                offer.trailer_or_container__c != oldOffer.trailer_or_container__c ||
                offer.trailer_type__c != oldOffer.trailer_type__c ||
                offer.container_type__c != oldOffer.container_type__c ||
                offer.Customs_Clearance__c != oldOffer.Customs_Clearance__c ||
                offer.expected__c != oldOffer.expected__c ||
                // Costs
                offer.demurrage__c != oldOffer.demurrage__c ||
                offer.haulage__c != oldOffer.haulage__c ||
                offer.haulage_total__c != oldOffer.haulage_total__c ||
                offer.haulage_currency__c != oldOffer.haulage_currency__c ||
                offer.destination_charges__c != oldOffer.destination_charges__c ||
                offer.haulage_extras__c != oldOffer.haulage_extras__c ||
                // Notes
                offer.post_notes__c != oldOffer.post_notes__c ||
                offer.haulage_notes__c != oldOffer.haulage_notes__c ||
                offer.so_details__c != oldOffer.so_details__c;
            
            if (shouldSync) {
                offersToSync.add(offer.Id);
            }
        }
        
        // Batch send all offers in one @future call
        if (!offersToSync.isEmpty()) {
            WasteTradeWebhookService.sendHaulageOfferStatusUpdates(offersToSync);
        }
    }
}
