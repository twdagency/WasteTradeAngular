/**
 * Wanted Listings Trigger - Pushes ALL field changes to WasteTrade
 * Per AC 6.5.1.4 + BA confirmation: Full bidirectional sync for all mapped fields
 * 
 * Features:
 * - Batch processing for bulk updates
 * - Loop prevention via Last_Sync_Origin__c (only when JUST changed)
 * - Syncs: status, quantity, packagingType, comments, availableFrom
 */
trigger WantedListingsTrigger on Wanted_Listings__c (after update) {
    List<Id> listingIdsToSync = new List<Id>();
    
    for (Wanted_Listings__c listing : Trigger.new) {
        Wanted_Listings__c oldListing = Trigger.oldMap.get(listing.Id);
        
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
        
        // Check if ANY mapped field changed (only fields that exist on Wanted_Listings__c)
        Boolean hasChanges = 
            listing.Listing_Status__c != oldListing.Listing_Status__c ||
            listing.Quantity__c != oldListing.Quantity__c ||
            listing.How_its_packaged__c != oldListing.How_its_packaged__c ||
            listing.Comments__c != oldListing.Comments__c ||
            listing.Available_From__c != oldListing.Available_From__c ||
            listing.Material_Type__c != oldListing.Material_Type__c ||
            listing.Material_Group__c != oldListing.Material_Group__c ||
            listing.Company_Name__c != oldListing.Company_Name__c;
        
        if (hasChanges) {
            listingIdsToSync.add(listing.Id);
        }
    }
    
    if (!listingIdsToSync.isEmpty()) {
        WasteTradeWebhookService.pushWantedListingUpdates(listingIdsToSync);
    }
}
