/**
 * Account Webhook Trigger
 * Sends Account updates to WasteTrade webhook for CRM Alignment (CU-869abxxq7)
 * 
 * Trigger: After Update on Account
 * Action: HTTP callout to WasteTrade webhook endpoint
 * 
 * Features:
 * - Batch processing for bulk updates
 * - Loop prevention via Last_Sync_Origin__c (only when JUST changed)
 */
trigger AccountTrigger on Account (after update) {
    List<Account> accountsToSync = new List<Account>();
    
    for (Account acc : Trigger.new) {
        Account oldAcc = Trigger.oldMap.get(acc.Id);
        
        // Only sync if WasteTrade_Company_Id__c is set (linked to WasteTrade)
        if (String.isBlank(acc.WasteTrade_Company_Id__c)) {
            continue;
        }
        
        // LOOP PREVENTION: Only skip if Last_Sync_Origin__c was JUST changed in this update
        // This allows webhook to fire when user edits SF directly (origin unchanged)
        Boolean originJustSet = acc.Last_Sync_Origin__c != oldAcc.Last_Sync_Origin__c 
                                && acc.Last_Sync_Origin__c != null 
                                && acc.Last_Sync_Origin__c.startsWith('WT_');
        if (originJustSet) {
            continue;
        }
        
        // Check if relevant fields changed (all fields sent in webhook payload)
        Boolean hasChanges = false;
        hasChanges = hasChanges || (acc.Name != oldAcc.Name);
        hasChanges = hasChanges || (acc.BillingStreet != oldAcc.BillingStreet);
        hasChanges = hasChanges || (acc.BillingCity != oldAcc.BillingCity);
        hasChanges = hasChanges || (acc.BillingPostalCode != oldAcc.BillingPostalCode);
        hasChanges = hasChanges || (acc.BillingCountry != oldAcc.BillingCountry);
        hasChanges = hasChanges || (acc.BillingState != oldAcc.BillingState);
        hasChanges = hasChanges || (acc.Phone != oldAcc.Phone);
        hasChanges = hasChanges || (acc.Website != oldAcc.Website);
        hasChanges = hasChanges || (acc.Account_Status__c != oldAcc.Account_Status__c);
        hasChanges = hasChanges || (acc.Company_VAT_Number__c != oldAcc.Company_VAT_Number__c);
        hasChanges = hasChanges || (acc.Company_Registration_Number__c != oldAcc.Company_Registration_Number__c);
        hasChanges = hasChanges || (acc.Fleet_Type__c != oldAcc.Fleet_Type__c);
        hasChanges = hasChanges || (acc.Areas_Covered__c != oldAcc.Areas_Covered__c);
        hasChanges = hasChanges || (acc.EU_Countries__c != oldAcc.EU_Countries__c);
        hasChanges = hasChanges || (acc.WT_Container_Types__c != oldAcc.WT_Container_Types__c);
        
        if (hasChanges) {
            accountsToSync.add(acc);
        }
    }
    
    if (!accountsToSync.isEmpty()) {
        // Collect IDs and call async batch method
        List<Id> accountIds = new List<Id>();
        for (Account acc : accountsToSync) {
            accountIds.add(acc.Id);
        }
        WasteTradeWebhookService.sendAccountUpdates(accountIds);
    }
}
