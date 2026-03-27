import { expect, sinon } from '@loopback/testlab';
import { ExchangeRateService } from '../../services/exchange-rate.service';
import { ECurrency } from '../../enum';
import axios from 'axios';

describe('ExchangeRateService (unit)', () => {
    let axiosStub: sinon.SinonStub;

    beforeEach(() => {
        axiosStub = sinon.stub(axios, 'get').resolves({
            data: {
                base: 'GBP',
                rates: { USD: 1.27, EUR: 1.17, GBP: 1 },
            },
        });
    });

    afterEach(() => {
        axiosStub.restore();
    });

    describe('convertToBaseCurrency', () => {
        it('returns amount unchanged when currency matches base', async () => {
            const service = new ExchangeRateService();
            const result = await service.convertToBaseCurrency(100, ECurrency.GBP);
            expect(result).to.equal(100);
        });

        it('converts USD to GBP using fetched rate', async () => {
            const service = new ExchangeRateService();
            // USD rate = 1.27 → 100 USD / 1.27 ≈ 78.74
            const result = await service.convertToBaseCurrency(100, ECurrency.USD);
            expect(result).to.equal(78.74);
        });

        it('returns 0 when amount is 0/falsy', async () => {
            const service = new ExchangeRateService();
            const result = await service.convertToBaseCurrency(0, ECurrency.USD);
            expect(result).to.equal(0);
        });
    });

    describe('convertOfferToBaseCurrency', () => {
        it('returns offer unchanged (with base currency) when already in base currency', async () => {
            const service = new ExchangeRateService();
            const offer = { offeredPricePerUnit: 100, totalPrice: 500, currency: ECurrency.GBP };

            const result = await service.convertOfferToBaseCurrency(offer);

            expect(result.currency).to.equal('gbp');
            expect(result.offeredPricePerUnit).to.equal(100);
        });

        it('converts offer prices to GBP', async () => {
            const service = new ExchangeRateService();
            const offer = { offeredPricePerUnit: 127, totalPrice: 635, currency: ECurrency.USD };

            const result = await service.convertOfferToBaseCurrency(offer);

            expect(result.originalCurrency).to.equal('usd');
            expect(result.currency).to.equal('gbp');
            expect(result.offeredPricePerUnit).to.equal(100);
        });
    });

    describe('convertListingToBaseCurrency', () => {
        it('converts listing price to GBP', async () => {
            const service = new ExchangeRateService();
            const listing = { pricePerMetricTonne: 117, currency: ECurrency.EUR };

            const result = await service.convertListingToBaseCurrency(listing);

            expect(result.originalCurrency).to.equal('eur');
            expect(result.currency).to.equal('gbp');
            expect(result.pricePerMetricTonne).to.equal(100);
        });
    });

    describe('convertOffersToBaseCurrency (batch)', () => {
        it('batch converts multiple offers', async () => {
            const service = new ExchangeRateService();
            const offers = [
                { offeredPricePerUnit: 127, currency: ECurrency.USD },
                { offeredPricePerUnit: 50, currency: ECurrency.GBP },
            ];

            const results = await service.convertOffersToBaseCurrency(offers);

            expect(results).to.have.length(2);
            expect(results[0].currency).to.equal('gbp');
            expect(results[1].offeredPricePerUnit).to.equal(50);
        });
    });

    describe('baseCurrencyCode', () => {
        it('returns lowercase base currency', () => {
            const service = new ExchangeRateService();
            expect(service.baseCurrencyCode).to.equal('gbp');
        });
    });

    describe('fallback to default rates on API failure', () => {
        it('uses default rates when API throws', async () => {
            axiosStub.restore();
            axiosStub = sinon.stub(axios, 'get').rejects(new Error('network error'));
            const service = new ExchangeRateService();

            // USD default rate is 1.27
            const result = await service.convertToBaseCurrency(127, ECurrency.USD);
            expect(result).to.equal(100);
        });
    });
});
