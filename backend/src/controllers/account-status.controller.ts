import { authenticate } from '@loopback/authentication';
import { inject, service } from '@loopback/core';
import { get, response } from '@loopback/rest';
import { SecurityBindings, securityId } from '@loopback/security';
import { MyUserProfile } from '../authentication-strategies/type';
import { AccountStatusService, AccountStatusResult } from '../services/account-status.service';

@authenticate('jwt')
export class AccountStatusController {
    constructor(
        @service(AccountStatusService)
        public accountStatusService: AccountStatusService,
    ) {}

    @get('/users/me/account-status')
    @response(200, {
        description: 'Get current user account status for banner display',
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                            example: 'success',
                        },
                        message: {
                            type: 'string',
                            example: 'Account status retrieved successfully',
                        },
                        data: {
                            type: 'object',
                            properties: {
                                showBanner: {
                                    type: 'boolean',
                                    example: true,
                                },
                                bannerType: {
                                    type: 'string',
                                    enum: [
                                        'incomplete_onboarding',
                                        'verification_pending',
                                        'verification_failed',
                                        'document_expiring',
                                    ],
                                    example: 'incomplete_onboarding',
                                },
                                message: {
                                    type: 'string',
                                    example: 'Complete account (all onboarding steps are not complete)',
                                },
                                documentDetails: {
                                    type: 'object',
                                    properties: {
                                        name: {
                                            type: 'string',
                                            example: 'Waste Carrier License',
                                        },
                                        expiryDate: {
                                            type: 'string',
                                            example: '15/02/2025',
                                        },
                                        daysRemaining: {
                                            type: 'number',
                                            example: 25,
                                        },
                                    },
                                },
                            },
                            required: ['showBanner', 'message'],
                        },
                    },
                    required: ['status', 'message', 'data'],
                },
            },
        },
    })
    async getAccountStatus(
        @inject(SecurityBindings.USER)
        currentUserProfile: MyUserProfile,
    ): Promise<{
        status: string;
        message: string;
        data: AccountStatusResult;
    }> {
        const userId = parseInt(currentUserProfile[securityId], 10);
        const accountStatus = await this.accountStatusService.getAccountStatus(userId);

        return {
            status: 'success',
            message: 'Account status retrieved successfully',
            data: accountStatus,
        };
    }
}
