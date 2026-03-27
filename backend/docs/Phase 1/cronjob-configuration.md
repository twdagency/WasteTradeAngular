# Cronjob Configuration Guide

## Issue: Cronjobs Load But Don't Run

### **Problem Description**
Cronjobs are loading successfully (you see "SalesforceRetryCronJob loaded" in logs) but they're not executing their tasks.

### **Root Cause**
The application requires specific environment variables to be set for cronjobs to run:

1. **`IS_BACKGROUND=true`** - Required for cronjobs to be registered in the application
2. **`SALESFORCE_SYNC_ENABLED=true`** - Required for Salesforce sync operations to execute
3. **`SALESFORCE_AUTO_SYNC=true`** - Optional, enables automatic sync on user approval

## 🛠️ **Solution**

### **Step 1: Set Environment Variables**

Add these to your `.env` file or set them in your environment:

```bash
# Enable background processes (REQUIRED)
IS_BACKGROUND=true

# Enable Salesforce sync operations (REQUIRED)
SALESFORCE_SYNC_ENABLED=true

# Enable automatic Salesforce sync on user approval (OPTIONAL)
SALESFORCE_AUTO_SYNC=true
```

### **Step 2: PowerShell Commands (Windows)**

For immediate testing, set the variables in your current PowerShell session:

```powershell
# Set environment variables for current session
$env:IS_BACKGROUND = "true"
$env:SALESFORCE_SYNC_ENABLED = "true"
$env:SALESFORCE_AUTO_SYNC = "true"

# Verify they're set
Write-Host "IS_BACKGROUND: $env:IS_BACKGROUND"
Write-Host "SALESFORCE_SYNC_ENABLED: $env:SALESFORCE_SYNC_ENABLED"
Write-Host "SALESFORCE_AUTO_SYNC: $env:SALESFORCE_AUTO_SYNC"
```

### **Step 3: Restart Application**

After setting the environment variables, restart your application:

```bash
yarn dev
```

## 📊 **Verification**

### **Check Cronjob Registration**
Look for these log messages on startup:
```
✅ SalesforceRetryCronJob loaded
✅ Starting Salesforce bulk sync job...
```

### **Check Cronjob Execution**
Look for these log messages during runtime:
```
✅ [Salesforce Sync] Companies: X/Y synced, Z failed.
✅ [Salesforce Sync] Users: X/Y synced, Z failed.
✅ Salesforce bulk sync job completed.
```

### **If Still Not Running**
Check for these error messages:
```
❌ Salesforce sync is disabled, skipping retry job
❌ Background jobs are disabled, skipping retry job
```

## 🔧 **Cronjob Configuration Details**

### **Current Cronjobs**
1. **SalesforceRetryCronJob** - Syncs failed/unsynced records
2. **ListingExpiryCronjob** - Handles listing expiration
3. **DeepLI18nTranslationCronjob** - Translation automation

### **Salesforce Retry Cronjob Settings**
```typescript
cronTime: '* * * * * *', // Every second (for testing)
start: true,             // Auto-start
runOnInit: true,         // Run immediately on startup
timeZone: 'Asia/Ho_Chi_Minh'
```

### **Environment Checks in Cronjob**
```typescript
// These checks must pass for cronjob to execute
if (process.env.SALESFORCE_SYNC_ENABLED !== 'true') {
    console.log('Salesforce sync is disabled, skipping retry job');
    return;
}
if (process.env.IS_BACKGROUND === 'false') {
    console.log('Background jobs are disabled, skipping retry job');
    return;
}
```

## 🎯 **Production Configuration**

### **Recommended Settings**
```bash
# Production environment
IS_BACKGROUND=true
SALESFORCE_SYNC_ENABLED=true
SALESFORCE_AUTO_SYNC=true

# Adjust cronjob frequency for production
# Change from '* * * * * *' (every second) to something like:
# '0 */5 * * * *' (every 5 minutes)
# '0 0 */1 * * *' (every hour)
```

### **Performance Considerations**
- **Every second** is for testing only
- **Every 5-15 minutes** is recommended for production
- Monitor Salesforce API limits
- Consider peak usage times

## 🔍 **Debugging**

### **Check Application Logs**
```bash
# Look for cronjob registration
grep "SalesforceRetryCronJob loaded" logs/

# Look for cronjob execution
grep "Starting Salesforce bulk sync job" logs/

# Look for environment variable issues
grep "sync is disabled" logs/
grep "Background jobs are disabled" logs/
```

### **Manual Testing**
Use the Salesforce sync dashboard to test endpoints manually:
- Test `/salesforce/health`
- Test `/salesforce/sync/companies?limit=1`
- Check `/salesforce/sync/logs` for results

## 📈 **Expected Behavior After Fix**

1. **Startup**: See "SalesforceRetryCronJob loaded"
2. **Execution**: See sync job messages every second (testing)
3. **Results**: See successful/failed sync counts
4. **Completion**: See "Salesforce bulk sync job completed"

The cronjobs will now run automatically and sync WasteTrade data to Salesforce, including the new Lead to Contact conversion functionality! 