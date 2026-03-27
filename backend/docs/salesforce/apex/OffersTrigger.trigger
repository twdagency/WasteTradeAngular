/**
 * Offers Trigger - Pushes ALL field changes to WasteTrade
 * Per AC 6.5.1.4 + BA confirmation: Full bidirectional sync for all mapped fields
 * 
 * Features:
 * - Batch processing for bulk updates
 * - Loop prevention via Last_Sync_Origin__c (only when JUST changed)
 * - Syncs: status, offeredPricePerUnit, currency, incoterms, numberOfLoadsBidOn, quantity, totalPrice, deliveryDates
 */
trigger OffersTrigger on Offers__c (after update) {
    List<Id> offerIdsToSync = new List<Id>();
    
    for (Offers__c offer : Trigger.new) {
        Offers__c oldOffer = Trigger.oldMap.get(offer.Id);
        
        // Skip if no WasteTrade ID (not synced with WasteTrade)
        if (String.isBlank(offer.WasteTrade_Offer_Id__c)) {
            continue;
        }
        
        // LOOP PREVENTION: Only skip if Last_Sync_Origin__c was JUST changed in this update
        Boolean originJustSet = offer.Last_Sync_Origin__c != oldOffer.Last_Sync_Origin__c 
                                && offer.Last_Sync_Origin__c != null 
                                && offer.Last_Sync_Origin__c.startsWith('WT_');
        if (originJustSet) {
            System.debug('Skipping webhook - update originated from WasteTrade: ' + offer.Last_Sync_Origin__c);
            continue;
        }
        
        // Check if ANY mapped field changed (full bidirectional sync)
        Boolean hasChanges = 
            offer.bid_status__c != oldOffer.bid_status__c ||
            offer.Offer_Status__c != oldOffer.Offer_Status__c ||
            offer.Offered_Price_Per_Unit__c != oldOffer.Offered_Price_Per_Unit__c ||
            offer.Currency__c != oldOffer.Currency__c ||
            offer.Incoterms__c != oldOffer.Incoterms__c ||
            offer.number_of_loads_bid_on__c != oldOffer.number_of_loads_bid_on__c ||
            offer.Quantity__c != oldOffer.Quantity__c ||
            offer.Total_Price__c != oldOffer.Total_Price__c ||
            offer.Earliest_Delivery_Date__c != oldOffer.Earliest_Delivery_Date__c ||
            offer.Latest_Delivery_Date__c != oldOffer.Latest_Delivery_Date__c ||
            // NEW fields from CSV checklist
            offer.Buyer_Location__c != oldOffer.Buyer_Location__c ||
            offer.Seller_Location__c != oldOffer.Seller_Location__c;
        
        if (hasChanges) {
            offerIdsToSync.add(offer.Id);
        }
    }
    
    if (!offerIdsToSync.isEmpty()) {
        WasteTradeWebhookService.pushOfferUpdates(offerIdsToSync);
    }
}
