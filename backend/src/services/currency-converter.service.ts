import { inject } from '@loopback/core';
import { ExchangeRateService } from './exchange-rate.service';

export class CurrencyConverter {
    constructor(
        @inject('services.ExchangeRateService')
        private exchangeRateService: ExchangeRateService,
    ) {}

    async convertObjectToGBP(
        obj: Record<string, unknown>,
        priceFields: string[] = [],
    ): Promise<Record<string, unknown>> {
        if (!obj) return obj;

        const converted = { ...obj };

        // Auto-detect common price fields if not specified
        if (priceFields.length === 0) {
            priceFields = Object.keys(obj).filter(
                (key) =>
                    key.toLowerCase().includes('price') ||
                    key.toLowerCase().includes('amount') ||
                    key === 'bestOffer' ||
                    key === 'totalPrice' ||
                    key === 'offeredPricePerUnit',
            );
        }

        // Convert each price field
        for (const field of priceFields) {
            if (obj[field] && obj.currency && typeof obj[field] === 'number') {
                converted[field] = await this.exchangeRateService.convertToBaseCurrency(
                    obj[field] as number,
                    obj.currency as string,
                );
            }
        }

        // Update currency to base currency
        if (obj.currency) {
            converted.originalCurrency = obj.currency;
            converted.currency = this.exchangeRateService.baseCurrencyCode;
        }

        return converted;
    }

    async convertArrayToGBP(
        array: Record<string, unknown>[],
        priceFields?: string[],
    ): Promise<Record<string, unknown>[]> {
        return Promise.all(array.map((item) => this.convertObjectToGBP(item, priceFields)));
    }
}
