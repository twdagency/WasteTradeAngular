import { injectable, inject } from '@loopback/core';
import axios from 'axios';
import { ECurrency } from '../enum';

interface ExchangeRates {
    base: string;
    rates: Record<string, number>;
}

interface OfferWithCurrency {
    offeredPricePerUnit?: number;
    totalPrice?: number;
    currency?: ECurrency | string;
    originalCurrency?: ECurrency | string;
    [key: string]: unknown;
}

interface ListingWithCurrency {
    pricePerMetricTonne?: number;
    currency?: ECurrency | string;
    originalCurrency?: ECurrency | string;
    [key: string]: unknown;
}

@injectable()
export class ExchangeRateService {
    private cache: ExchangeRates | null = null;
    private lastFetch = 0;
    private readonly cacheTime = 3600000; // 1 hour
    private readonly defaultRates: Record<string, number> = {
        [ECurrency.USD]: 1.27,
        [ECurrency.EUR]: 1.17,
        [ECurrency.GBP]: 1,
    };

    constructor(
        @inject('config.exchangeRateApiUrl', { optional: true })
        private exchangeRateApiUrl: string = 'https://api.exchangerate-api.com/v4/latest',
        @inject('config.exchangeRateBaseCurrency', { optional: true })
        private baseCurrency: ECurrency = ECurrency.GBP,
    ) {}

    get baseCurrencyCode(): ECurrency {
        return this.baseCurrency.toLowerCase() as ECurrency;
    }

    async convertToBaseCurrency(amount: number, fromCurrency: ECurrency | string): Promise<number> {
        if (!amount || fromCurrency.toLowerCase() === this.baseCurrency.toLowerCase()) return amount;

        const rate = await this.getRate(fromCurrency.toLowerCase());
        return parseFloat((amount / rate).toFixed(2));
    }

    // Convert Offers to GBP
    async convertOfferToBaseCurrency(offer: OfferWithCurrency): Promise<OfferWithCurrency> {
        if (!offer.currency || offer.currency.toLowerCase() === this.baseCurrency.toLowerCase()) {
            return { ...offer, currency: this.baseCurrency.toLowerCase() };
        }

        const rate = await this.getRate(offer.currency.toLowerCase());
        return {
            ...offer,
            offeredPricePerUnit: offer.offeredPricePerUnit
                ? parseFloat((offer.offeredPricePerUnit / rate).toFixed(2))
                : offer.offeredPricePerUnit,
            totalPrice: offer.totalPrice ? parseFloat((offer.totalPrice / rate).toFixed(2)) : offer.totalPrice,
            originalCurrency: offer.currency.toLowerCase(),
            currency: this.baseCurrency.toLowerCase(),
        };
    }

    // Convert Listings to GBP
    async convertListingToBaseCurrency(listing: ListingWithCurrency): Promise<ListingWithCurrency> {
        if (!listing.currency || listing.currency.toLowerCase() === this.baseCurrency.toLowerCase()) {
            return { ...listing, currency: this.baseCurrency.toLowerCase() };
        }

        const rate = await this.getRate(listing.currency.toLowerCase());
        return {
            ...listing,
            pricePerMetricTonne: listing.pricePerMetricTonne
                ? parseFloat((listing.pricePerMetricTonne / rate).toFixed(2))
                : listing.pricePerMetricTonne,
            originalCurrency: listing.currency.toLowerCase(),
            currency: this.baseCurrency.toLowerCase(),
        };
    }

    // Batch convert offers
    async convertOffersToBaseCurrency(offers: OfferWithCurrency[]): Promise<OfferWithCurrency[]> {
        await this.updateCache(); // Single cache update

        return offers.map((offer) => {
            if (!offer.currency || offer.currency.toLowerCase() === this.baseCurrency.toLowerCase()) {
                return { ...offer, currency: this.baseCurrency.toLowerCase() };
            }

            const currencyKey = offer.currency.toLowerCase();
            const rate = this.cache?.rates[currencyKey] ?? this.defaultRates[currencyKey] ?? 1;
            return {
                ...offer,
                offeredPricePerUnit: offer.offeredPricePerUnit
                    ? parseFloat((offer.offeredPricePerUnit / rate).toFixed(2))
                    : offer.offeredPricePerUnit,
                totalPrice: offer.totalPrice ? parseFloat((offer.totalPrice / rate).toFixed(2)) : offer.totalPrice,
                originalCurrency: currencyKey,
                currency: this.baseCurrency.toLowerCase(),
            };
        });
    }

    // Batch convert listings
    async convertListingsToBaseCurrency(listings: ListingWithCurrency[]): Promise<ListingWithCurrency[]> {
        await this.updateCache(); // Single cache update

        return listings.map((listing) => {
            if (!listing.currency || listing.currency.toLowerCase() === this.baseCurrency.toLowerCase()) {
                return { ...listing, currency: this.baseCurrency.toLowerCase() };
            }

            const currencyKey = listing.currency.toLowerCase();
            const rate = this.cache?.rates[currencyKey] ?? this.defaultRates[currencyKey] ?? 1;
            return {
                ...listing,
                pricePerMetricTonne: listing.pricePerMetricTonne
                    ? parseFloat((listing.pricePerMetricTonne / rate).toFixed(2))
                    : listing.pricePerMetricTonne,
                originalCurrency: currencyKey,
                currency: this.baseCurrency.toLowerCase(),
            };
        });
    }

    private async getRate(currency: string): Promise<number> {
        await this.updateCache();
        const currencyKey = currency.toLowerCase();
        return this.cache?.rates[currencyKey] ?? this.defaultRates[currencyKey] ?? 1;
    }

    private async updateCache(): Promise<void> {
        const now = Date.now();
        if (this.cache && now - this.lastFetch < this.cacheTime) return;

        try {
            const url = `${this.exchangeRateApiUrl}/${this.baseCurrency.toUpperCase()}`;
            const response = await axios.get<ExchangeRates>(url, { timeout: 5000 });

            // Convert all currency keys to lowercase
            const lowercaseRates: Record<string, number> = {};
            Object.entries(response.data.rates).forEach(([key, value]) => {
                lowercaseRates[key.toLowerCase()] = value;
            });

            this.cache = {
                base: response.data.base.toLowerCase(),
                rates: lowercaseRates,
            };
            this.lastFetch = now;
        } catch (error) {
            console.log('Failed to fetch exchange rates:', error);
            // Use default rates if API fails
            if (!this.cache) {
                this.cache = {
                    base: this.baseCurrency.toLowerCase(),
                    rates: this.defaultRates,
                };
                this.lastFetch = now;
            }
        }
    }
}
