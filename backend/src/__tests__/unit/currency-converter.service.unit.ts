/**
 * Tests for currency-converter.service.ts
 * Covers convertObjectToGBP and convertArrayToGBP branches
 */
import { expect, sinon } from '@loopback/testlab';
import { CurrencyConverter } from '../../services/currency-converter.service';

function buildConverter(overrides: Partial<Record<string, any>> = {}): CurrencyConverter {
    const exchangeRateService = {
        convertToBaseCurrency: sinon.stub().callsFake(async (amount: number) => amount * 0.8),
        baseCurrencyCode: 'gbp',
        ...overrides,
    };
    return new CurrencyConverter(exchangeRateService as any);
}

describe('CurrencyConverter (unit)', () => {
    describe('convertObjectToGBP()', () => {
        it('returns obj unchanged when obj is null/undefined', async () => {
            const svc = buildConverter();
            const result = await svc.convertObjectToGBP(null as any);
            expect(result).to.be.null();
        });

        it('converts explicit price fields when provided', async () => {
            const convertStub = sinon.stub().resolves(80);
            const svc = buildConverter({ convertToBaseCurrency: convertStub });

            const obj = { price: 100, currency: 'usd' };
            const result = await svc.convertObjectToGBP(obj, ['price']);

            expect(convertStub.calledOnce).to.be.true();
            expect(convertStub.calledWith(100, 'usd')).to.be.true();
            expect(result.price).to.equal(80);
        });

        it('auto-detects price fields when priceFields is empty', async () => {
            const convertStub = sinon.stub().resolves(50);
            const svc = buildConverter({ convertToBaseCurrency: convertStub });

            const obj = { pricePerUnit: 100, currency: 'eur', name: 'test' };
            await svc.convertObjectToGBP(obj);

            expect(convertStub.called).to.be.true();
        });

        it('auto-detects amount fields by name', async () => {
            const convertStub = sinon.stub().resolves(40);
            const svc = buildConverter({ convertToBaseCurrency: convertStub });

            const obj = { totalAmount: 200, currency: 'usd' };
            await svc.convertObjectToGBP(obj);

            expect(convertStub.called).to.be.true();
        });

        it('auto-detects bestOffer field by exact name', async () => {
            const convertStub = sinon.stub().resolves(80);
            const svc = buildConverter({ convertToBaseCurrency: convertStub });

            const obj = { bestOffer: 100, currency: 'usd' };
            await svc.convertObjectToGBP(obj);

            expect(convertStub.called).to.be.true();
        });

        it('auto-detects offeredPricePerUnit field by exact name', async () => {
            const convertStub = sinon.stub().resolves(90);
            const svc = buildConverter({ convertToBaseCurrency: convertStub });

            const obj = { offeredPricePerUnit: 120, currency: 'eur' };
            await svc.convertObjectToGBP(obj);

            expect(convertStub.called).to.be.true();
        });

        it('skips conversion when field value is not a number', async () => {
            const convertStub = sinon.stub().resolves(0);
            const svc = buildConverter({ convertToBaseCurrency: convertStub });

            const obj = { price: 'not-a-number', currency: 'usd' };
            await svc.convertObjectToGBP(obj, ['price']);

            expect(convertStub.called).to.be.false();
        });

        it('skips conversion when currency is missing', async () => {
            const convertStub = sinon.stub().resolves(0);
            const svc = buildConverter({ convertToBaseCurrency: convertStub });

            const obj = { price: 100 };
            await svc.convertObjectToGBP(obj, ['price']);

            expect(convertStub.called).to.be.false();
        });

        it('sets originalCurrency and updates currency to baseCurrencyCode', async () => {
            const svc = buildConverter({ convertToBaseCurrency: sinon.stub().resolves(80) });

            const obj = { price: 100, currency: 'usd' };
            const result = await svc.convertObjectToGBP(obj, ['price']);

            expect(result.originalCurrency).to.equal('usd');
            expect(result.currency).to.equal('gbp');
        });

        it('does not modify originalCurrency when no currency field present', async () => {
            const svc = buildConverter();
            const obj = { name: 'test', quantity: 5 };
            const result = await svc.convertObjectToGBP(obj, []);

            expect(result.originalCurrency).to.be.undefined();
        });
    });

    describe('convertArrayToGBP()', () => {
        it('converts each item in the array', async () => {
            const convertStub = sinon.stub().resolves(80);
            const svc = buildConverter({ convertToBaseCurrency: convertStub });

            const arr = [
                { price: 100, currency: 'usd' },
                { price: 200, currency: 'usd' },
            ];
            const results = await svc.convertArrayToGBP(arr, ['price']);

            expect(results.length).to.equal(2);
            expect(convertStub.callCount).to.equal(2);
        });

        it('returns empty array when given empty array', async () => {
            const svc = buildConverter();
            const result = await svc.convertArrayToGBP([]);
            expect(result).to.deepEqual([]);
        });

        it('passes priceFields to each convertObjectToGBP call', async () => {
            const convertStub = sinon.stub().resolves(50);
            const svc = buildConverter({ convertToBaseCurrency: convertStub });

            const arr = [{ totalPrice: 100, currency: 'eur' }];
            await svc.convertArrayToGBP(arr, ['totalPrice']);

            expect(convertStub.calledWith(100, 'eur')).to.be.true();
        });
    });
});
