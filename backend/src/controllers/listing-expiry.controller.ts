import { authenticate } from '@loopback/authentication';
import { service } from '@loopback/core';
import { get, post } from '@loopback/rest';
import { ListingExpiryService } from '../services/listing-expiry.service';
import { OPERATION_SECURITY_SPEC } from '../utils/security-spec';

@authenticate('jwt')
export class ListingExpiryController {
    constructor(
        @service(ListingExpiryService)
        private listingExpiryService: ListingExpiryService,
    ) {}

    @post('/listing-expiry/check', {
        security: OPERATION_SECURITY_SPEC,
        summary: 'Manually trigger listing expiry check',
        description: 'Mark expired listings and send expiry warnings (Admin only)',
        responses: {
            '200': {
                description: 'Expiry check completed',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                status: { type: 'string' },
                                data: {
                                    type: 'object',
                                    properties: {
                                        expired: {
                                            type: 'object',
                                            properties: {
                                                updated: { type: 'number' },
                                                listings: { type: 'array' },
                                            },
                                        },
                                        warnings: {
                                            type: 'object',
                                            properties: {
                                                sent: { type: 'number' },
                                                failed: { type: 'number' },
                                            },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    })
    async triggerExpiryCheck() {
        const resetResult = await this.listingExpiryService.resetSoldOngoingListings();
        const expiredResult = await this.listingExpiryService.markExpiredListings();
        const warningResult = await this.listingExpiryService.sendExpiryWarnings();

        return {
            status: 'success',
            data: {
                reset: resetResult,
                expired: expiredResult,
                warnings: warningResult,
            },
        };
    }

    @get('/listing-expiry/expired', {
        security: OPERATION_SECURITY_SPEC,
        summary: 'Get expired listings',
        description: 'Get all listings that should be marked as expired',
        responses: {
            '200': {
                description: 'List of expired listings',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                status: { type: 'string' },
                                data: {
                                    type: 'object',
                                    properties: {
                                        listings: { type: 'array' },
                                        count: { type: 'number' },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    })
    async getExpiredListings() {
        const expiredListings = await this.listingExpiryService.getExpiredListings();

        return {
            status: 'success',
            data: {
                listings: expiredListings,
                count: expiredListings.length,
            },
        };
    }

    @get('/listing-expiry/warnings', {
        security: OPERATION_SECURITY_SPEC,
        summary: 'Get listings nearing expiry',
        description: 'Get all listings that need expiry warnings (expire within 7 days)',
        responses: {
            '200': {
                description: 'List of listings nearing expiry',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                status: { type: 'string' },
                                data: {
                                    type: 'object',
                                    properties: {
                                        listings: { type: 'array' },
                                        count: { type: 'number' },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    })
    async getListingsNearingExpiry() {
        const nearingExpiryListings = await this.listingExpiryService.getListingsNearingExpiry();

        return {
            status: 'success',
            data: {
                listings: nearingExpiryListings,
                count: nearingExpiryListings.length,
            },
        };
    }
}
