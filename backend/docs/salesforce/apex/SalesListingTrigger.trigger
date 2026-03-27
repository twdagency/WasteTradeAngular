/**
 * Sales Listing Trigger - Pushes ALL field changes to WasteTrade
 * Per AC 6.5.1.4 + BA confirmation: Full bidirectional sync for all mapped fields
 * 
 * Features:
 * - Batch processing for bulk updates
 * - Loop prevention via Last_Sync_Origin__c (only when JUST changed)
 * - Syncs: status, description, materialWeight, numberOfLoads, packagingType, storageType, availableFromDate, currency
 */
trigger SalesListingTrigger on Sales_Listing__c (after update) {
    List<Id> listingIdsToSync = new List<Id>();
    
    for (Sales_Listing__c listing : Trigger.new) {
        Sales_Listing__c oldListing = Trigger.oldMap.get(listing.Id);
        
        // Skip if no WasteTrade ID (not synced with WasteTrade)
        if (String.isBlank(listing.WasteTrade_Listing_Id__c)) {
            continue;
        }
        
        // LOOP PREVENTION: Only skip if Last_Sync_Origin__c was JUST changed in this update
        Boolean originJustSet = listing.Last_Sync_Origin__c != oldListing.Last_Sync_Origin__c 
                                && listing.Last_Sync_Origin__c != null 
                                && listing.Last_Sync_Origin__c.startsWith('WT_');
        if (originJustSet) {
            System.debug('Skipping webhook - update originated from WasteTrade: ' + listing.Last_Sync_Origin__c);
            continue;
        }
        
        // Check if ANY mapped field changed (only fields that exist on Sales_Listing__c)
        Boolean hasChanges = 
            listing.Listing_Status__c != oldListing.Listing_Status__c ||
            listing.Description__c != oldListing.Description__c ||
            listing.Material_Weight__c != oldListing.Material_Weight__c ||
            listing.Number_of_Loads__c != oldListing.Number_of_Loads__c ||
            listing.Packaging_Type__c != oldListing.Packaging_Type__c ||
            listing.Storage_Type__c != oldListing.Storage_Type__c ||
            listing.Available_From_Date__c != oldListing.Available_From_Date__c ||
            listing.CurrencyIsoCode != oldListing.CurrencyIsoCode ||
            listing.Material_Type__c != oldListing.Material_Type__c ||
            listing.Group__c != oldListing.Group__c ||
            listing.Material__c != oldListing.Material__c ||
            listing.Price_Per_Tonne__c != oldListing.Price_Per_Tonne__c ||
            listing.Indicated_Price__c != oldListing.Indicated_Price__c;
        
        if (hasChanges) {
            listingIdsToSync.add(listing.Id);
        }
    }
    
    if (!listingIdsToSync.isEmpty()) {
        WasteTradeWebhookService.pushListingUpdates(listingIdsToSync);
    }
}
