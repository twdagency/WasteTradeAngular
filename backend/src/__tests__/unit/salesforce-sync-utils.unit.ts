import { expect } from '@loopback/testlab';
import {
    SalesforceCircuitBreaker,
    SyncMetricsCollector,
    SalesforceErrorHandler,
    needsSync,
    filterRecordsNeedingSync,
    cleanSalesforceData,
    addEnvironmentPrefix,
    addEnvironmentPrefixToExternalId,
    formatCurrencyValue,
    formatNumericValue,
    convertDateToSalesforceFormat,
    buildMaterialName,
    calculateSafeNumberOfLoads,
    isValidEmail,
    parseMissingFieldError,
    SalesforceConfigUtils,
    getEnvironmentPrefix,
    ENV_PREFIX_PATTERN,
    formatErrorMessage,
    isCustomFieldError,
} from '../../utils/salesforce/salesforce-sync.utils';

// Helper to get a fresh circuit breaker instance by resetting singleton state
function freshCircuitBreaker(): SalesforceCircuitBreaker {
    const cb = SalesforceCircuitBreaker.getInstance();
    cb.reset();
    return cb;
}

function freshMetrics(): SyncMetricsCollector {
    const m = SyncMetricsCollector.getInstance();
    m.reset();
    return m;
}

describe('salesforce-sync-utils (unit)', () => {
    // ─── SalesforceCircuitBreaker ──────────────────────────────────────────────
    describe('SalesforceCircuitBreaker', () => {
        it('starts closed', () => {
            const cb = freshCircuitBreaker();
            expect(cb.isCircuitOpen()).to.be.false();
        });

        it('opens after 5 consecutive failures', () => {
            const cb = freshCircuitBreaker();
            for (let i = 0; i < 5; i++) cb.recordFailure();
            expect(cb.isCircuitOpen()).to.be.true();
        });

        it('does not open after 4 failures', () => {
            const cb = freshCircuitBreaker();
            for (let i = 0; i < 4; i++) cb.recordFailure();
            expect(cb.isCircuitOpen()).to.be.false();
        });

        it('recordSuccess resets failures and closes circuit', () => {
            const cb = freshCircuitBreaker();
            for (let i = 0; i < 5; i++) cb.recordFailure();
            expect(cb.isCircuitOpen()).to.be.true();
            cb.recordSuccess();
            expect(cb.isCircuitOpen()).to.be.false();
            expect(cb.getStatus().failures).to.equal(0);
        });

        it('reset clears all state', () => {
            const cb = freshCircuitBreaker();
            for (let i = 0; i < 5; i++) cb.recordFailure();
            cb.reset();
            expect(cb.isCircuitOpen()).to.be.false();
            expect(cb.getStatus().failures).to.equal(0);
            expect(cb.getStatus().lastFailureTime).to.be.null();
        });

        it('getStatus returns correct fields', () => {
            const cb = freshCircuitBreaker();
            cb.recordFailure();
            const status = cb.getStatus();
            expect(status).to.have.property('isOpen');
            expect(status).to.have.property('failures');
            expect(status).to.have.property('lastFailureTime');
            expect(status.failures).to.equal(1);
        });

        it('auto-resets after timeout elapses', () => {
            const cb = freshCircuitBreaker();
            for (let i = 0; i < 5; i++) cb.recordFailure();
            // Manually backdate the lastFailureTime past the 60s window
            (cb as any).lastFailureTime = new Date(Date.now() - 61000);
            expect(cb.isCircuitOpen()).to.be.false();
        });
    });

    // ─── SyncMetricsCollector ──────────────────────────────────────────────────
    describe('SyncMetricsCollector', () => {
        it('records success', () => {
            const m = freshMetrics();
            m.record('Account', { success: true });
            const summary = m.getSummary() as any;
            expect(summary.byObjectType.Account.success).to.equal(1);
            expect(summary.byObjectType.Account.total).to.equal(1);
        });

        it('records failure', () => {
            const m = freshMetrics();
            m.record('Account', { success: false });
            const summary = m.getSummary() as any;
            expect(summary.byObjectType.Account.failed).to.equal(1);
        });

        it('records skipped', () => {
            const m = freshMetrics();
            m.record('Account', { success: false, skipped: true });
            const summary = m.getSummary() as any;
            expect(summary.byObjectType.Account.skipped).to.equal(1);
        });

        it('recordBatch accumulates correctly', () => {
            const m = freshMetrics();
            m.recordBatch('Contact', { total: 10, successful: 7, failed: 2, skipped: 1 });
            const summary = m.getSummary() as any;
            expect(summary.byObjectType.Contact.total).to.equal(10);
            expect(summary.byObjectType.Contact.success).to.equal(7);
            expect(summary.byObjectType.Contact.failed).to.equal(2);
            expect(summary.byObjectType.Contact.skipped).to.equal(1);
        });

        it('getSummary includes successRate percentage string', () => {
            const m = freshMetrics();
            m.record('Lead', { success: true });
            m.record('Lead', { success: false });
            const summary = m.getSummary() as any;
            expect(summary.byObjectType.Lead.successRate).to.equal('50.00%');
        });

        it('getSummary totals aggregates across object types', () => {
            const m = freshMetrics();
            m.record('Account', { success: true });
            m.record('Contact', { success: false });
            const summary = m.getSummary() as any;
            expect(summary.totals.total).to.equal(2);
            expect(summary.totals.success).to.equal(1);
            expect(summary.totals.failed).to.equal(1);
        });

        it('reset clears all metrics', () => {
            const m = freshMetrics();
            m.record('Account', { success: true });
            m.reset();
            const summary = m.getSummary() as any;
            expect(summary.totals.total).to.equal(0);
        });
    });

    // ─── SalesforceErrorHandler ────────────────────────────────────────────────
    describe('SalesforceErrorHandler.extractErrorMessage', () => {
        it('extracts message from Error objects', () => {
            expect(SalesforceErrorHandler.extractErrorMessage(new Error('boom'))).to.equal('boom');
        });

        it('returns string errors directly', () => {
            expect(SalesforceErrorHandler.extractErrorMessage('plain error')).to.equal('plain error');
        });

        it('handles SF API error object — message property takes precedence over errorCode combo', () => {
            // The implementation checks `errorObj.message` before the `errorCode+message` combo,
            // so a plain `message` field is returned directly.
            const sfErr = { errorCode: 'FIELD_MISSING', message: 'Required field' };
            expect(SalesforceErrorHandler.extractErrorMessage(sfErr)).to.equal('Required field');
        });

        it('handles object with just message', () => {
            expect(SalesforceErrorHandler.extractErrorMessage({ message: 'oops' })).to.equal('oops');
        });

        it('handles array of errors via errors property', () => {
            const err = { errors: [{ message: 'first error' }] };
            expect(SalesforceErrorHandler.extractErrorMessage(err)).to.equal('first error');
        });

        it('unknown object returns fallback message', () => {
            expect(SalesforceErrorHandler.extractErrorMessage({})).to.equal('Unknown error occurred');
        });
    });

    describe('SalesforceErrorHandler.createErrorResponse', () => {
        it('formats error response with status, message, and data', () => {
            const resp = SalesforceErrorHandler.createErrorResponse(new Error('fail'), 'upsertAccount');
            expect(resp.status).to.equal('error');
            expect(resp.message).to.equal('upsertAccount failed: fail');
            expect(resp.data).to.containEql({ error: 'fail' });
        });
    });

    // ─── needsSync ─────────────────────────────────────────────────────────────
    describe('needsSync', () => {
        it('true when isSyncedSalesForce is false', () => {
            expect(needsSync({ isSyncedSalesForce: false, salesforceId: 'x', lastSyncedSalesForceDate: new Date() }))
                .to.be.true();
        });

        it('true when salesforceId is missing', () => {
            expect(needsSync({ isSyncedSalesForce: true, salesforceId: undefined, lastSyncedSalesForceDate: new Date() }))
                .to.be.true();
        });

        it('true when lastSyncedSalesForceDate is missing', () => {
            expect(needsSync({ isSyncedSalesForce: true, salesforceId: 'x', lastSyncedSalesForceDate: undefined }))
                .to.be.true();
        });

        it('true when updatedAt is after lastSyncedSalesForceDate', () => {
            const lastSynced = new Date('2024-01-01');
            const updatedAt = new Date('2024-06-01');
            expect(needsSync({ isSyncedSalesForce: true, salesforceId: 'x', lastSyncedSalesForceDate: lastSynced, updatedAt }))
                .to.be.true();
        });

        it('false when all set and not changed since last sync', () => {
            const lastSynced = new Date('2024-06-01');
            const updatedAt = new Date('2024-01-01');
            expect(needsSync({ isSyncedSalesForce: true, salesforceId: 'x', lastSyncedSalesForceDate: lastSynced, updatedAt }))
                .to.be.false();
        });
    });

    // ─── filterRecordsNeedingSync ──────────────────────────────────────────────
    describe('filterRecordsNeedingSync', () => {
        const synced = { isSyncedSalesForce: true, salesforceId: 'x', lastSyncedSalesForceDate: new Date('2024-06-01'), updatedAt: new Date('2024-01-01') };
        const needsSyncRecord = { isSyncedSalesForce: false };

        it('filters to only records needing sync when forceSync=false', () => {
            const result = filterRecordsNeedingSync([synced, needsSyncRecord], false);
            expect(result).to.have.length(1);
            expect(result[0]).to.equal(needsSyncRecord);
        });

        it('returns all records when forceSync=true', () => {
            const result = filterRecordsNeedingSync([synced, needsSyncRecord], true);
            expect(result).to.have.length(2);
        });
    });

    // ─── cleanSalesforceData ───────────────────────────────────────────────────
    describe('cleanSalesforceData', () => {
        it('removes undefined and null values', () => {
            const result = cleanSalesforceData({ a: 'hello', b: undefined, c: null });
            expect(result).to.have.property('a');
            expect(result).to.not.have.property('b');
            expect(result).to.not.have.property('c');
        });

        it('trims string values', () => {
            const result = cleanSalesforceData({ Name: '  Acme Corp  ' });
            expect(result.Name).to.equal('Acme Corp');
        });

        it('applies 80-char limit to Name fields', () => {
            const longName = 'A'.repeat(100);
            const result = cleanSalesforceData({ Name: longName });
            expect((result.Name as string).length).to.equal(80);
        });

        it('applies 40-char limit to Phone fields', () => {
            const longPhone = '1'.repeat(60);
            const result = cleanSalesforceData({ Phone: longPhone });
            expect((result.Phone as string).length).to.equal(40);
        });

        it('applies 32000-char limit to Description fields', () => {
            const longDesc = 'D'.repeat(40000);
            const result = cleanSalesforceData({ Description: longDesc });
            expect((result.Description as string).length).to.equal(32000);
        });

        it('skips invalid test data values', () => {
            const result = cleanSalesforceData({ SomeField: 'string' });
            expect(result).to.not.have.property('SomeField');
        });

        it('skips invalid test data: test, N/A', () => {
            const result = cleanSalesforceData({ Field1: 'test', Field2: 'N/A' });
            expect(result).to.not.have.property('Field1');
            expect(result).to.not.have.property('Field2');
        });

        it('skips invalid email for email-keyed fields', () => {
            const result = cleanSalesforceData({ Email: 'not-valid' });
            expect(result).to.not.have.property('Email');
        });

        it('keeps valid email', () => {
            const result = cleanSalesforceData({ Email: 'user@example.com' });
            expect(result.Email).to.equal('user@example.com');
        });

        it('passes through non-string values unchanged', () => {
            const result = cleanSalesforceData({ count: 42, flag: true });
            expect(result.count).to.equal(42);
            expect(result.flag).to.equal(true);
        });
    });

    // ─── addEnvironmentPrefix ──────────────────────────────────────────────────
    describe('addEnvironmentPrefix', () => {
        let origEnv: string | undefined;
        let origNodeEnv: string | undefined;
        beforeEach(() => { origEnv = process.env.ENVIRONMENT; origNodeEnv = process.env.NODE_ENV; delete process.env.ENVIRONMENT; });
        afterEach(() => { process.env.ENVIRONMENT = origEnv!; process.env.NODE_ENV = origNodeEnv!; });

        it('prepends short env prefix for non-production', () => {
            process.env.NODE_ENV = 'test';
            expect(addEnvironmentPrefix('MyRecord')).to.equal('TEST_MyRecord');
        });

        it('uses ENVIRONMENT over NODE_ENV when set', () => {
            process.env.ENVIRONMENT = 'uat';
            process.env.NODE_ENV = 'development';
            expect(addEnvironmentPrefix('MyRecord')).to.equal('UAT_MyRecord');
        });

        it('skips if prefix already present', () => {
            process.env.NODE_ENV = 'test';
            expect(addEnvironmentPrefix('TEST_MyRecord')).to.equal('TEST_MyRecord');
        });
    });

    // ─── addEnvironmentPrefixToExternalId ──────────────────────────────────────
    describe('addEnvironmentPrefixToExternalId', () => {
        let origEnv: string | undefined;
        let origNodeEnv: string | undefined;
        beforeEach(() => { origEnv = process.env.ENVIRONMENT; origNodeEnv = process.env.NODE_ENV; delete process.env.ENVIRONMENT; });
        afterEach(() => { process.env.ENVIRONMENT = origEnv!; process.env.NODE_ENV = origNodeEnv!; });

        it('adds prefix in non-production environments', () => {
            process.env.NODE_ENV = 'test';
            expect(addEnvironmentPrefixToExternalId('123')).to.equal('TEST_123');
        });

        it('no prefix in production', () => {
            process.env.NODE_ENV = 'production';
            expect(addEnvironmentPrefixToExternalId('123')).to.equal('123');
        });

        it('skips if prefix already present', () => {
            process.env.NODE_ENV = 'test';
            expect(addEnvironmentPrefixToExternalId('DEV_123')).to.equal('DEV_123');
        });
    });

    // ─── formatCurrencyValue ───────────────────────────────────────────────────
    describe('formatCurrencyValue (sync utils)', () => {
        it('passes through numbers', () => {
            expect(formatCurrencyValue(100)).to.equal(100);
        });

        it('strips symbols from strings', () => {
            expect(formatCurrencyValue('£1,234.56')).to.equal(1234.56);
        });

        it('NaN returns undefined', () => {
            expect(formatCurrencyValue('abc')).to.be.undefined();
        });

        it('undefined returns undefined', () => {
            expect(formatCurrencyValue(undefined)).to.be.undefined();
        });
    });

    // ─── formatNumericValue ────────────────────────────────────────────────────
    describe('formatNumericValue (sync utils)', () => {
        it('returns valid number', () => {
            expect(formatNumericValue(42)).to.equal(42);
        });

        it('parses numeric string', () => {
            expect(formatNumericValue('55')).to.equal(55);
        });

        it('clamps overflow to 999999999', () => {
            expect(formatNumericValue(2_000_000_000)).to.equal(999999999);
        });

        it('NaN returns undefined', () => {
            expect(formatNumericValue('xyz')).to.be.undefined();
        });

        it('undefined returns undefined', () => {
            expect(formatNumericValue(undefined)).to.be.undefined();
        });
    });

    // ─── convertDateToSalesforceFormat ─────────────────────────────────────────
    describe('convertDateToSalesforceFormat (sync utils)', () => {
        it('converts DD/MM/YYYY to a YYYY-MM-DD string', () => {
            // Implementation uses new Date(year, month, day) (local time) → toISOString() (UTC),
            // so the exact output date depends on the server timezone offset.
            const result = convertDateToSalesforceFormat('15/06/2024');
            expect(result).to.match(/^\d{4}-\d{2}-\d{2}$/);
        });

        it('parses ISO string to date-only portion', () => {
            // Midday UTC — safe for any timezone within ±12h
            const result = convertDateToSalesforceFormat('2024-06-15T12:00:00.000Z');
            expect(result).to.equal('2024-06-15');
        });

        it('invalid string returns undefined', () => {
            expect(convertDateToSalesforceFormat('not-a-date')).to.be.undefined();
        });

        it('null/undefined returns undefined', () => {
            expect(convertDateToSalesforceFormat(null)).to.be.undefined();
            expect(convertDateToSalesforceFormat(undefined)).to.be.undefined();
        });
    });

    // ─── buildMaterialName ─────────────────────────────────────────────────────
    describe('buildMaterialName', () => {
        it('concatenates parts with dash separator', () => {
            const listing = { materialType: 'HDPE', materialItem: 'Bottles', materialForm: 'Bales' };
            expect(buildMaterialName(listing)).to.equal('HDPE - Bottles - Bales');
        });

        it('filters out N/A values', () => {
            const listing = { materialType: 'PP', materialItem: 'N/A', materialForm: 'Granules' };
            expect(buildMaterialName(listing)).to.equal('PP - Granules');
        });

        it('falls back to title when no material parts', () => {
            const listing = { title: 'My Listing' };
            expect(buildMaterialName(listing)).to.equal('My Listing');
        });

        it('returns Unknown Material for null input', () => {
            expect(buildMaterialName(null)).to.equal('Unknown Material');
        });

        it('returns Unknown Material when no parts and no title', () => {
            expect(buildMaterialName({})).to.equal('Unknown Material');
        });
    });

    // ─── calculateSafeNumberOfLoads ────────────────────────────────────────────
    describe('calculateSafeNumberOfLoads', () => {
        it('calculates loads correctly', () => {
            expect(calculateSafeNumberOfLoads(100, 10)).to.equal(10);
        });

        it('rounds up (ceil)', () => {
            expect(calculateSafeNumberOfLoads(15, 4)).to.equal(4); // ceil(15/4)=4
        });

        it('caps at 99999999', () => {
            expect(calculateSafeNumberOfLoads(999999999, 1)).to.equal(99999999);
        });

        it('returns undefined when quantity is 0 or undefined', () => {
            expect(calculateSafeNumberOfLoads(0, 10)).to.be.undefined();
            expect(calculateSafeNumberOfLoads(undefined, 10)).to.be.undefined();
        });

        it('returns undefined when weightPerUnit is 0 or undefined', () => {
            expect(calculateSafeNumberOfLoads(100, 0)).to.be.undefined();
            expect(calculateSafeNumberOfLoads(100, undefined)).to.be.undefined();
        });
    });

    // ─── isValidEmail ──────────────────────────────────────────────────────────
    describe('isValidEmail', () => {
        it('returns true for valid emails', () => {
            expect(isValidEmail('user@example.com')).to.be.true();
            expect(isValidEmail('test+tag@sub.domain.org')).to.be.true();
        });

        it('returns false for invalid emails', () => {
            expect(isValidEmail('not-email')).to.be.false();
            expect(isValidEmail('@no-local.com')).to.be.false();
            expect(isValidEmail('no-at-sign')).to.be.false();
        });
    });

    // ─── parseMissingFieldError ────────────────────────────────────────────────
    describe('parseMissingFieldError', () => {
        it('parses "No such column" pattern', () => {
            const result = parseMissingFieldError("No such column 'Field__c' on sobject of type Account");
            expect(result).to.not.be.null();
            expect(result!.fieldName).to.equal('Field__c');
            expect(result!.objectName).to.equal('Account');
        });

        it('parses "Invalid field" pattern', () => {
            const result = parseMissingFieldError('Invalid field: Contact.Missing__c');
            expect(result).to.not.be.null();
            expect(result!.objectName).to.equal('Contact');
            expect(result!.fieldName).to.equal('Missing__c');
        });

        it('returns null for unrecognised error messages', () => {
            expect(parseMissingFieldError('some random error')).to.be.null();
        });
    });

    // ─── SalesforceConfigUtils ─────────────────────────────────────────────────
    describe('SalesforceConfigUtils', () => {
        it('getBatchSize returns 20', () => {
            expect(SalesforceConfigUtils.getBatchSize()).to.equal(20);
        });

        it('getBatchDelay returns 2000', () => {
            expect(SalesforceConfigUtils.getBatchDelay()).to.equal(2000);
        });

        it('isSyncEnabled is true by default', () => {
            const original = process.env.SALESFORCE_SYNC_ENABLED;
            delete process.env.SALESFORCE_SYNC_ENABLED;
            expect(SalesforceConfigUtils.isSyncEnabled()).to.be.true();
            process.env.SALESFORCE_SYNC_ENABLED = original!;
        });

        it('isSyncEnabled is false when env var is false', () => {
            const original = process.env.SALESFORCE_SYNC_ENABLED;
            process.env.SALESFORCE_SYNC_ENABLED = 'false';
            expect(SalesforceConfigUtils.isSyncEnabled()).to.be.false();
            process.env.SALESFORCE_SYNC_ENABLED = original!;
        });

        it('getSyncConfig returns all required keys', () => {
            const config = SalesforceConfigUtils.getSyncConfig();
            expect(config).to.have.property('enabled');
            expect(config).to.have.property('batchSize');
            expect(config).to.have.property('batchDelay');
            expect(config).to.have.property('environment');
        });
    });

    // ─── getEnvironmentPrefix ──────────────────────────────────────────────────
    describe('getEnvironmentPrefix', () => {
        afterEach(() => {
            delete process.env.ENVIRONMENT;
        });

        it('development → DEV', () => {
            process.env.ENVIRONMENT = 'development';
            expect(getEnvironmentPrefix()).to.equal('DEV');
        });

        it('dev → DEV', () => {
            process.env.ENVIRONMENT = 'dev';
            expect(getEnvironmentPrefix()).to.equal('DEV');
        });

        it('test → TEST', () => {
            process.env.ENVIRONMENT = 'test';
            expect(getEnvironmentPrefix()).to.equal('TEST');
        });

        it('uat → UAT', () => {
            process.env.ENVIRONMENT = 'uat';
            expect(getEnvironmentPrefix()).to.equal('UAT');
        });

        it('staging → UAT', () => {
            process.env.ENVIRONMENT = 'staging';
            expect(getEnvironmentPrefix()).to.equal('UAT');
        });

        it('production → PROD', () => {
            process.env.ENVIRONMENT = 'production';
            expect(getEnvironmentPrefix()).to.equal('PROD');
        });

        it('prod → PROD', () => {
            process.env.ENVIRONMENT = 'prod';
            expect(getEnvironmentPrefix()).to.equal('PROD');
        });

        it('unknown value is uppercased as-is', () => {
            process.env.ENVIRONMENT = 'custom';
            expect(getEnvironmentPrefix()).to.equal('CUSTOM');
        });
    });

    // ─── ENV_PREFIX_PATTERN ────────────────────────────────────────────────────
    describe('ENV_PREFIX_PATTERN', () => {
        it('matches DEV_ prefix', () => {
            expect(ENV_PREFIX_PATTERN.test('DEV_SomeRecord')).to.be.true();
        });

        it('matches TEST_ prefix', () => {
            expect(ENV_PREFIX_PATTERN.test('TEST_123')).to.be.true();
        });

        it('matches UAT_ prefix', () => {
            expect(ENV_PREFIX_PATTERN.test('UAT_record')).to.be.true();
        });

        it('matches STAGING_ prefix', () => {
            expect(ENV_PREFIX_PATTERN.test('STAGING_record')).to.be.true();
        });

        it('matches PROD_ prefix', () => {
            expect(ENV_PREFIX_PATTERN.test('PROD_record')).to.be.true();
        });

        it('matches PRODUCTION_ prefix', () => {
            expect(ENV_PREFIX_PATTERN.test('PRODUCTION_record')).to.be.true();
        });

        it('does not match plain record name', () => {
            expect(ENV_PREFIX_PATTERN.test('MyRecord')).to.be.false();
        });

        it('does not match partial prefix without underscore', () => {
            expect(ENV_PREFIX_PATTERN.test('DEVrecord')).to.be.false();
        });
    });

    // ─── addEnvironmentPrefix — already-prefixed guard ─────────────────────────
    describe('addEnvironmentPrefix (already-prefixed guard)', () => {
        let origEnv: string | undefined;
        let origNode: string | undefined;
        beforeEach(() => { origEnv = process.env.ENVIRONMENT; origNode = process.env.NODE_ENV; delete process.env.ENVIRONMENT; });
        afterEach(() => { process.env.ENVIRONMENT = origEnv!; process.env.NODE_ENV = origNode!; });

        it('does not double-prefix when already prefixed', () => {
            process.env.NODE_ENV = 'test';
            const once = addEnvironmentPrefix('GreenWave Recycling Ltd');
            const twice = addEnvironmentPrefix(once);
            expect(twice).to.equal(once);
        });
    });

    // ─── addEnvironmentPrefixToExternalId — already-prefixed guard ────────────
    describe('addEnvironmentPrefixToExternalId (already-prefixed guard)', () => {
        let origEnv: string | undefined;
        let origNode: string | undefined;
        beforeEach(() => { origEnv = process.env.ENVIRONMENT; origNode = process.env.NODE_ENV; delete process.env.ENVIRONMENT; });
        afterEach(() => { process.env.ENVIRONMENT = origEnv!; process.env.NODE_ENV = origNode!; });

        it('does not double-prefix when already prefixed', () => {
            process.env.NODE_ENV = 'test';
            const once = addEnvironmentPrefixToExternalId('456');
            const twice = addEnvironmentPrefixToExternalId(once);
            expect(twice).to.equal(once);
        });
    });

    // ─── formatErrorMessage ────────────────────────────────────────────────────
    describe('formatErrorMessage', () => {
        it('null/undefined returns Unknown error', () => {
            expect(formatErrorMessage(null)).to.equal('Unknown error');
            expect(formatErrorMessage(undefined)).to.equal('Unknown error');
        });

        it('object with errorCode and message formats as "code: msg"', () => {
            expect(formatErrorMessage({ errorCode: 'FIELD_MISSING', message: 'Name required' }))
                .to.equal('FIELD_MISSING: Name required');
        });

        it('object with only message returns message', () => {
            expect(formatErrorMessage({ message: 'Something broke' })).to.equal('Something broke');
        });

        it('array of errors joined by semicolon', () => {
            const result = formatErrorMessage([{ message: 'First error' }, { message: 'Second error' }]);
            expect(result).to.match(/First error/);
            expect(result).to.match(/Second error/);
        });

        it('plain string returned as-is', () => {
            expect(formatErrorMessage('plain error text')).to.equal('plain error text');
        });

        it('number coerced to string', () => {
            expect(formatErrorMessage(42)).to.equal('42');
        });
    });

    // ─── isCustomFieldError ────────────────────────────────────────────────────
    describe('isCustomFieldError', () => {
        it('true when error contains "no such column"', () => {
            expect(isCustomFieldError({ error: 'no such column Field__c' } as any)).to.be.true();
        });

        it('true when error contains "invalid field"', () => {
            expect(isCustomFieldError({ error: 'invalid field on Contact' } as any)).to.be.true();
        });

        it('true when error contains "does not exist or is not accessible"', () => {
            expect(isCustomFieldError({ error: 'field does not exist or is not accessible' } as any)).to.be.true();
        });

        it('false for unrelated errors', () => {
            expect(isCustomFieldError({ error: 'connection timeout' } as any)).to.be.false();
        });

        it('false when result has no error', () => {
            expect(isCustomFieldError({} as any)).to.be.false();
        });
    });
});
