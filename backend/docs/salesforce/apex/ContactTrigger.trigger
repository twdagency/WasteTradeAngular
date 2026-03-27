/**
 * Contact Webhook Trigger
 * Sends Contact updates to WasteTrade webhook for CRM Alignment (CU-869abxxq7)
 * 
 * Trigger: After Update on Contact
 * Action: HTTP callout to WasteTrade webhook endpoint
 * 
 * Features:
 * - Batch processing for bulk updates
 * - Loop prevention via Last_Sync_Origin__c (only when JUST changed)
 */
trigger ContactTrigger on Contact (after update) {
    List<Contact> contactsToSync = new List<Contact>();
    
    for (Contact con : Trigger.new) {
        Contact oldCon = Trigger.oldMap.get(con.Id);
        
        // Only sync if WasteTrade_User_Id__c is set (linked to WasteTrade)
        if (String.isBlank(con.WasteTrade_User_Id__c)) {
            continue;
        }
        
        // LOOP PREVENTION: Only skip if Last_Sync_Origin__c was JUST changed in this update
        // This allows webhook to fire when user edits SF directly (origin unchanged)
        Boolean originJustSet = con.Last_Sync_Origin__c != oldCon.Last_Sync_Origin__c 
                                && con.Last_Sync_Origin__c != null 
                                && con.Last_Sync_Origin__c.startsWith('WT_');
        if (originJustSet) {
            continue;
        }
        
        // Check if relevant fields changed (all fields sent in webhook payload)
        Boolean hasChanges = false;
        hasChanges = hasChanges || (con.FirstName != oldCon.FirstName);
        hasChanges = hasChanges || (con.LastName != oldCon.LastName);
        hasChanges = hasChanges || (con.Email != oldCon.Email);
        hasChanges = hasChanges || (con.Phone != oldCon.Phone);
        hasChanges = hasChanges || (con.Title != oldCon.Title);
        hasChanges = hasChanges || (con.Job_Title__c != oldCon.Job_Title__c);
        hasChanges = hasChanges || (con.Company_Role__c != oldCon.Company_Role__c);
        hasChanges = hasChanges || (con.Is_Primary_Contact__c != oldCon.Is_Primary_Contact__c);
        hasChanges = hasChanges || (con.Company_User_Status__c != oldCon.Company_User_Status__c);
        
        if (hasChanges) {
            contactsToSync.add(con);
        }
    }
    
    if (!contactsToSync.isEmpty()) {
        // Collect IDs and call async batch method
        List<Id> contactIds = new List<Id>();
        for (Contact con : contactsToSync) {
            contactIds.add(con.Id);
        }
        WasteTradeWebhookService.sendContactUpdates(contactIds);
    }
}
