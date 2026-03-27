/**
 * Haulage Loads Webhook Trigger
 * Sends Haulage Load updates to WasteTrade webhook for CRM Alignment (CU-869abxxvx)
 * 
 * Trigger: After Update on Haulage_Loads__c
 * Action: HTTP callout to WasteTrade webhook endpoint
 * 
 * Features:
 * - Batch processing for bulk updates
 * - Loop prevention via Last_Sync_Origin__c (only when JUST changed)
 * - Change detection for relevant fields
 * 
 * NOTE: Uses haulage_bid_id__c (text field) instead of Haulage_Offer__c (lookup)
 * because lookup fields have sync issues with WasteTrade
 */
trigger HaulageLoadsTrigger on Haulage_Loads__c (after update) {
    List<Haulage_Loads__c> loadsToSync = new List<Haulage_Loads__c>();
    
    for (Haulage_Loads__c load : Trigger.new) {
        Haulage_Loads__c oldLoad = Trigger.oldMap.get(load.Id);
        
        // LOOP PREVENTION: Only skip if Last_Sync_Origin__c was JUST changed in this update
        // This allows webhook to fire when user edits SF directly (origin unchanged)
        Boolean originJustSet = load.Last_Sync_Origin__c != oldLoad.Last_Sync_Origin__c 
                                && load.Last_Sync_Origin__c != null 
                                && load.Last_Sync_Origin__c.startsWith('WT_');
        if (originJustSet) {
            continue;
        }
        
        // Check if relevant fields changed
        Boolean hasChanges = false;
        hasChanges = hasChanges || (load.load_number__c != oldLoad.load_number__c);
        hasChanges = hasChanges || (load.collection_date__c != oldLoad.collection_date__c);
        hasChanges = hasChanges || (load.gross_weight__c != oldLoad.gross_weight__c);
        hasChanges = hasChanges || (load.pallet_weight__c != oldLoad.pallet_weight__c);
        hasChanges = hasChanges || (load.load_status__c != oldLoad.load_status__c);
        
        if (hasChanges) {
            loadsToSync.add(load);
        }
    }
    
    if (!loadsToSync.isEmpty()) {
        // Collect IDs and call async batch method
        List<Id> loadIds = new List<Id>();
        for (Haulage_Loads__c load : loadsToSync) {
            loadIds.add(load.Id);
        }
        WasteTradeWebhookService.sendHaulageLoadUpdates(loadIds);
    }
}
