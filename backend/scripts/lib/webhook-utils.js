/**
 * Shared webhook utilities for scripts
 * Provides reusable functions for testing webhook endpoints
 */

const axios = require('axios');

/**
 * Test a webhook endpoint
 * @param {string} endpoint - Endpoint path (e.g., '/salesforce/webhook/health')
 * @param {Object} options - Request options
 * @returns {Promise<Object>} Result object
 */
async function testWebhook(endpoint, options = {}) {
    const {
        method = 'POST',
        data = {},
        headers = {},
        timeout = 5000,
        baseUrl = process.env.API_URL || 'http://localhost:3000',
    } = options;

    try {
        const response = await axios({
            method,
            url: `${baseUrl}${endpoint}`,
            data,
            headers: {
                'X-Salesforce-Secret': process.env.SALESFORCE_WEBHOOK_SECRET || 'test-secret',
                ...headers,
            },
            timeout,
            validateStatus: () => true, // Accept any status
        });

        return {
            success: response.status >= 200 && response.status < 300,
            status: response.status,
            data: response.data,
        };
    } catch (error) {
        return {
            success: false,
            error: error.message,
        };
    }
}

/**
 * Test multiple webhook endpoints
 * @param {Array<string>} endpoints - Array of endpoint paths
 * @param {Object} options - Request options
 * @returns {Promise<Object>} Results summary
 */
async function testWebhooks(endpoints, options = {}) {
    const { verbose = true } = options;
    
    let passed = 0;
    let failed = 0;

    if (verbose) {
        console.log('\n🌐 Testing webhook endpoints...');
    }

    for (const endpoint of endpoints) {
        const result = await testWebhook(endpoint, options);
        
        if (result.success) {
            if (verbose) console.log(`  ✅ ${endpoint} (status: ${result.status})`);
            passed++;
        } else {
            if (verbose) {
                console.log(`  ❌ ${endpoint} (${result.error || `status: ${result.status}`})`);
            }
            failed++;
        }
    }

    return { passed, failed };
}

/**
 * Wait for service to be ready
 * @param {string} healthEndpoint - Health check endpoint
 * @param {Object} options - Wait options
 * @returns {Promise<boolean>} True if service is ready
 */
async function waitForService(healthEndpoint, options = {}) {
    const {
        maxAttempts = 10,
        delayMs = 2000,
        verbose = true,
    } = options;

    for (let i = 0; i < maxAttempts; i++) {
        const result = await testWebhook(healthEndpoint, { ...options, verbose: false });
        
        if (result.success) {
            if (verbose) console.log('✅ Service is ready');
            return true;
        }

        if (verbose) console.log(`⏳ Waiting for service... (${i + 1}/${maxAttempts})`);
        await new Promise(resolve => setTimeout(resolve, delayMs));
    }

    if (verbose) console.log('❌ Service did not become ready');
    return false;
}

module.exports = {
    testWebhook,
    testWebhooks,
    waitForService,
};
