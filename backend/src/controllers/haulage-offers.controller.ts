import { authenticate } from '@loopback/authentication';
import { inject, service } from '@loopback/core';
import { Filter, repository } from '@loopback/repository';
import { del, get, getModelSchemaRef, HttpErrors, param, patch, post, requestBody, response } from '@loopback/rest';
import { SecurityBindings, UserProfile } from '@loopback/security';
import { MyUserProfile } from '../authentication-strategies/type';
import { AuthHelper } from '../helpers/auth.helper';
import {
    AdminCreateHaulageOffer,
    CreateHaulageOffer,
    HaulageBidActionRequest,
    HaulageOffers,
    UpdateHaulageOffer,
    HaulageOfferDocuments,
} from '../models';
import { UserRepository } from '../repositories';
import { HaulageOfferService } from '../services';
import { IDataResponse, PaginationList } from '../types/common';
import { UserStatus } from '../enum';

// Tabs that filter by user verification status, not haulage offer status
const HAULAGE_USER_STATUS_TABS = ['unverified', 'verified'];

export class HaulageOffersController {
    constructor(
        @service(HaulageOfferService)
        public haulageOfferService: HaulageOfferService,
        @repository(UserRepository)
        public userRepository: UserRepository,
    ) {}

    /**
     * Get approved hauliers in current user's company for team bidding
     * Task: 6.3.3.7. Haulier Team Bidding
     */
    @authenticate('jwt')
    @get('/haulage-offers/company-hauliers')
    @response(200, {
        description: 'List of approved hauliers in company',
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        status: { type: 'string' },
                        message: { type: 'string' },
                        data: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    id: { type: 'number' },
                                    firstName: { type: 'string' },
                                    lastName: { type: 'string' },
                                    email: { type: 'string' },
                                    username: { type: 'string' },
                                },
                            },
                        },
                    },
                },
            },
        },
    })
    async getCompanyHauliers(
        @inject(SecurityBindings.USER)
        currentUserProfile: UserProfile,
        @param.query.string('search') search?: string,
    ): Promise<IDataResponse<unknown[]>> {
        const currentUser = currentUserProfile as MyUserProfile;
        return this.haulageOfferService.getCompanyHauliers(currentUser, search);
    }

    /**
     * Create a new haulage offer
     * Task: 6.2.2.5. Make an offer
     */
    @authenticate('jwt')
    @post('/haulage-offers')
    @response(200, {
        description: 'HaulageOffer model instance',
        content: {
            'application/json': {
                schema: getModelSchemaRef(HaulageOffers),
            },
        },
    })
    async create(
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(CreateHaulageOffer, {
                        title: 'NewHaulageOffer',
                    }),
                },
            },
        })
        haulageOffer: CreateHaulageOffer,
        @inject(SecurityBindings.USER)
        currentUserProfile: UserProfile,
    ): Promise<IDataResponse<HaulageOffers>> {
        const currentUser = currentUserProfile as MyUserProfile;
        return this.haulageOfferService.createHaulageOffer(haulageOffer, currentUser);
    }

    @authenticate('jwt')
    @get('/admin/hauliers')
    @response(200, {
        description: 'Approved hauliers for admin dropdown',
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        status: { type: 'string' },
                        message: { type: 'string' },
                        data: {
                            type: 'object',
                            properties: {
                                results: { type: 'array', items: { type: 'object' } },
                                totalCount: { type: 'number' },
                            },
                        },
                    },
                },
            },
        },
    })
    async getApprovedHauliersForAdmin(
        @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
        @param.query.string('filter') filterString?: string,
        @param.query.number('skip') skip?: number,
        @param.query.number('limit') limit?: number,
        @param.query.string('search') search?: string,
    ): Promise<IDataResponse<PaginationList<unknown>>> {
        let parsedFilter: { skip?: number; limit?: number; search?: string } = {};
        if (filterString) {
            try {
                parsedFilter = JSON.parse(filterString);
            } catch {
                parsedFilter = {};
            }
        }

        const currentUser = currentUserProfile as MyUserProfile;
        return this.haulageOfferService.getApprovedHauliersForAdmin(currentUser, {
            skip: parsedFilter.skip ?? skip,
            limit: parsedFilter.limit ?? limit,
            search: parsedFilter.search ?? search,
        });
    }

    @authenticate('jwt')
    @post('/admin/haulage-offers')
    @response(200, {
        description: 'HaulageOffer model instance created by admin on behalf of a haulier',
        content: {
            'application/json': {
                schema: getModelSchemaRef(HaulageOffers),
            },
        },
    })
    async adminCreateHaulageOfferOnBehalf(
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(AdminCreateHaulageOffer, {
                        title: 'AdminCreateHaulageOffer',
                    }),
                },
            },
        })
        payload: AdminCreateHaulageOffer,
        @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    ): Promise<IDataResponse<HaulageOffers>> {
        const currentUser = currentUserProfile as MyUserProfile;
        const user = await this.userRepository.findById(currentUserProfile.id);
        AuthHelper.validateAdmin(user.globalRole);
        return this.haulageOfferService.adminCreateHaulageOfferOnBehalf(payload as any, currentUser);
    }

    /**
     * Get all haulage offers for current haulier
     * Task: 6.2.3.1. View My Haulage Offers
     */
    @authenticate('jwt')
    @get('/haulage-offers')
    @response(200, {
        description: 'Array of HaulageOffer model instances',
        content: {
            'application/json': {
                schema: {
                    type: 'array',
                    items: getModelSchemaRef(HaulageOffers, { includeRelations: true }),
                },
            },
        },
    })
    async find(
        @inject(SecurityBindings.USER)
        currentUserProfile: UserProfile,
        @param.filter(HaulageOffers) filter?: Filter<HaulageOffers>,
    ): Promise<IDataResponse<PaginationList<unknown>>> {
        const currentUser = currentUserProfile as MyUserProfile;
        return this.haulageOfferService.getMyHaulageOffers(currentUser, filter);
    }

    /**
     * Get haulage offer details by ID
     * Task: 6.2.3.2. View Haulage Offer Details
     */
    @authenticate('jwt')
    @get('/haulage-offers/{id}')
    @response(200, {
        description: 'HaulageOffer model instance',
        content: {
            'application/json': {
                schema: getModelSchemaRef(HaulageOffers, { includeRelations: true }),
            },
        },
    })
    async findById(
        @param.path.number('id') id: number,
        @inject(SecurityBindings.USER)
        currentUserProfile: UserProfile,
    ): Promise<IDataResponse<HaulageOffers>> {
        const currentUser = currentUserProfile as MyUserProfile;
        return this.haulageOfferService.getHaulageOfferById(id, currentUser);
    }

    /**
     * Update haulage offer by ID
     * Task: 6.2.3.3. Edit Haulage Offer
     */
    @authenticate('jwt')
    @patch('/haulage-offers/{id}')
    @response(204, {
        description: 'HaulageOffer PATCH success',
    })
    async updateById(
        @param.path.number('id') id: number,
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(UpdateHaulageOffer, { partial: true }),
                },
            },
        })
        haulageOffer: UpdateHaulageOffer,
        @inject(SecurityBindings.USER)
        currentUserProfile: UserProfile,
    ): Promise<IDataResponse<HaulageOffers>> {
        const currentUser = currentUserProfile as MyUserProfile;
        return this.haulageOfferService.updateHaulageOffer(id, haulageOffer, currentUser);
    }

    /**
     * Withdraw haulage offer
     * Task: 6.2.3.2. View Haulage Offer Details (Withdraw functionality)
     */
    @authenticate('jwt')
    @del('/haulage-offers/{id}/withdraw')
    @response(200, {
        description: 'HaulageOffer withdrawal success',
    })
    async withdraw(
        @param.path.number('id') id: number,
        @inject(SecurityBindings.USER)
        currentUserProfile: UserProfile,
    ): Promise<IDataResponse<HaulageOffers>> {
        const currentUser = currentUserProfile as MyUserProfile;
        return this.haulageOfferService.withdrawHaulageOffer(id, currentUser);
    }

    /**
     * Get documents for accepted haulage offer
     * Task: 6.2.3.4. View Documents for Accepted Haulage Offers
     */
    @authenticate('jwt')
    @get('/haulage-offers/{id}/documents')
    @response(200, {
        description: 'Array of documents for accepted haulage offer',
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        status: { type: 'string' },
                        message: { type: 'string' },
                        data: {
                            type: 'array',
                            items: getModelSchemaRef(HaulageOfferDocuments),
                        },
                    },
                },
            },
        },
    })
    async getDocuments(
        @param.path.number('id') id: number,
        @inject(SecurityBindings.USER)
        currentUserProfile: UserProfile,
    ): Promise<IDataResponse<HaulageOfferDocuments[]>> {
        const currentUser = currentUserProfile as MyUserProfile;
        return this.haulageOfferService.getHaulageOfferDocuments(id, currentUser);
    }

    @authenticate('jwt')
    @get('/haulage-offers/available-loads')
    @response(200, {
        description: 'Array of available loads for hauliers',
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        status: { type: 'string' },
                        message: { type: 'string' },
                        data: {
                            type: 'object',
                            properties: {
                                results: {
                                    type: 'array',
                                    items: { type: 'object' },
                                },
                                totalCount: { type: 'number' },
                            },
                        },
                    },
                },
            },
        },
    })
    async getAvailableLoads(
        @inject(SecurityBindings.USER)
        currentUserProfile: MyUserProfile,
        @param.query.number('skip') skip?: number,
        @param.query.number('limit') limit?: number,
        @param.query.string('textSearch') textSearch?: string,
        @param.query.string('materialType') materialType?: string,
        @param.query.string('materialItem') materialItem?: string,
        @param.query.string('materialPacking') materialPacking?: string,
        @param.query.string('pickupCountry') pickupCountry?: string,
        @param.query.string('destinationCountry') destinationCountry?: string,
        @param.query.string('deliveryDateFrom') deliveryDateFrom?: string,
        @param.query.string('deliveryDateTo') deliveryDateTo?: string,
    ): Promise<PaginationList<unknown>> {
        return this.haulageOfferService.getAvailableLoads(currentUserProfile, {
            skip,
            limit,
            textSearch,
            materialType,
            materialItem,
            materialPacking,
            pickupCountry,
            destinationCountry,
            deliveryDateFrom,
            deliveryDateTo,
        });
    }

    /**
     * Handle haulage bid approval actions
     * Task: BE - 6.4.1.15. Haulier Bid Approval Actions
     */
    @authenticate('jwt')
    @patch('/haulage-offers/{id}/actions')
    @response(200, {
        description: 'HaulageBidAction success',
        content: {
            'application/json': {
                schema: getModelSchemaRef(HaulageOffers),
            },
        },
    })
    async handleBidAction(
        @param.path.number('id') id: number,
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(HaulageBidActionRequest, {
                        title: 'HaulageBidAction',
                    }),
                },
            },
        })
        actionRequest: HaulageBidActionRequest,
        @inject(SecurityBindings.USER)
        currentUserProfile: UserProfile,
    ): Promise<IDataResponse<HaulageOffers>> {
        const currentUser = currentUserProfile as MyUserProfile;
        return this.haulageOfferService.handleBidAction(id, actionRequest, currentUser);
    }

    /**
     * Admin: Get all haulage bids for admin dashboard
     * Task: 6.4.1.12. View Haulage Bids
     */
    @authenticate('jwt')
    @get('/admin/haulage-bids')
    @response(200, {
        description: 'Array of haulage bids for admin dashboard',
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        status: { type: 'string' },
                        message: { type: 'string' },
                        data: {
                            type: 'object',
                            properties: {
                                results: {
                                    type: 'array',
                                    items: { type: 'object' },
                                },
                                totalCount: { type: 'number' },
                            },
                        },
                    },
                },
            },
        },
    })
    async getHaulageBidsForAdmin(
        @inject(SecurityBindings.USER)
        currentUserProfile: UserProfile,
        @param.query.string('filter') filterString?: string,
        @param.query.number('skip') skip?: number,
        @param.query.number('limit') limit?: number,
        @param.query.string('status') status?: string,
        @param.query.string('state') state?: string,
        @param.query.string('materialType') materialType?: string,
        @param.query.string('textSearch') textSearch?: string,
        @param.query.string('haulierCompany') haulierCompany?: string,
        @param.query.string('buyerCompany') buyerCompany?: string,
        @param.query.string('sellerCompany') sellerCompany?: string,
        @param.query.string('dateFrom') dateFrom?: string,
        @param.query.string('dateTo') dateTo?: string,
        @param.query.number('offerId') offerId?: number,
    ): Promise<IDataResponse<PaginationList<unknown>>> {
        try {
            // Check if user is admin
            const user = await this.userRepository.findById(currentUserProfile.id);
            const globalRole = user.globalRole;

            AuthHelper.validateAdmin(globalRole);

            // Parse filter from query string (FE sends ?filter={"skip":20,"limit":20})
            let parsedFilter: { skip?: number; limit?: number; where?: Record<string, unknown> } = {};
            if (filterString) {
                try {
                    parsedFilter = JSON.parse(filterString);
                } catch {
                    // Ignore parse errors, use individual params
                }
            }

            // Use filter values if provided, fallback to individual query params
            const finalSkip = parsedFilter.skip ?? skip;
            const finalLimit = parsedFilter.limit ?? limit;
            const filterWhere = (parsedFilter.where ?? parsedFilter) as Record<string, unknown>;
            const finalStatus = (filterWhere.status as string | undefined) ?? status;
            const finalState = (filterWhere.state as string | undefined) ?? state;
            const finalMaterialType = (filterWhere.materialType as string | undefined) ?? materialType;
            const finalTextSearch = (filterWhere.textSearch as string | undefined) ?? textSearch;
            const finalHaulierCompany = (filterWhere.haulierCompany as string | undefined) ?? haulierCompany;
            const finalBuyerCompany = (filterWhere.buyerCompany as string | undefined) ?? buyerCompany;
            const finalSellerCompany = (filterWhere.sellerCompany as string | undefined) ?? sellerCompany;
            let finalDateFrom = (filterWhere.dateFrom as string | undefined) ?? dateFrom;
            let finalDateTo = (filterWhere.dateTo as string | undefined) ?? dateTo;
            const finalOfferId = (filterWhere.offerId as number | undefined) ?? offerId;
            const singleDate = filterWhere.date as string | undefined;
            if (!finalDateFrom && !finalDateTo && singleDate) {
                finalDateFrom = singleDate;
                finalDateTo = singleDate;
            }

            // Resolve Unverified/Verified tabs → filter by haulier user status
            let resolvedStatus = finalStatus;
            let haulierUserIds: number[] | undefined;

            if (finalStatus && HAULAGE_USER_STATUS_TABS.includes(finalStatus.toLowerCase())) {
                const userStatusFilter =
                    finalStatus.toLowerCase() === 'verified'
                        ? { inq: [UserStatus.ACTIVE] }
                        : { inq: [UserStatus.PENDING, UserStatus.REQUEST_INFORMATION] };
                const users = await this.userRepository.find({
                    where: { status: userStatusFilter },
                    fields: { id: true },
                });
                haulierUserIds = users.map((u) => u.id!);
                resolvedStatus = undefined; // Don't pass as ho.status filter
            }

            const currentUser = currentUserProfile as MyUserProfile;
            return await this.haulageOfferService.getHaulageBidsForAdmin(currentUser, {
                skip: finalSkip,
                limit: finalLimit,
                status: resolvedStatus,
                haulierUserIds,
                state: finalState,
                materialType: finalMaterialType,
                textSearch: finalTextSearch,
                haulierCompany: finalHaulierCompany,
                buyerCompany: finalBuyerCompany,
                sellerCompany: finalSellerCompany,
                dateFrom: finalDateFrom,
                dateTo: finalDateTo,
                offerId: finalOfferId,
            });
        } catch (error) {
            if (error instanceof HttpErrors.HttpError) {
                throw error;
            }
            throw new HttpErrors.InternalServerError('Failed to fetch haulage bids');
        }
    }

    /**
     * Admin: Get haulage bid details
     * Task: 6.4.1.14. View Haulage Bid Details
     */
    @authenticate('jwt')
    @get('/admin/haulage-bids/{id}')
    @response(200, {
        description: 'Haulage bid details for admin',
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        status: { type: 'string' },
                        message: { type: 'string' },
                        data: { type: 'object' },
                    },
                },
            },
        },
    })
    async getHaulageBidDetailsForAdmin(
        @param.path.string('id') id: string,
        @inject(SecurityBindings.USER)
        currentUserProfile: UserProfile,
    ): Promise<IDataResponse<unknown>> {
        try {
            // Check if user is admin
            const user = await this.userRepository.findById(currentUserProfile.id);
            const globalRole = user.globalRole;

            AuthHelper.validateAdmin(globalRole);

            const currentUser = currentUserProfile as MyUserProfile;

            const haulageOfferId = parseInt(id, 10);
            if (isNaN(haulageOfferId)) {
                throw new HttpErrors.BadRequest('Invalid haulage offer ID format');
            }
            return await this.haulageOfferService.getHaulageBidDetailsForAdmin(haulageOfferId, currentUser);
        } catch (error) {
            if (error instanceof HttpErrors.HttpError) {
                throw error;
            }
            throw new HttpErrors.InternalServerError('Failed to fetch haulage bid details');
        }
    }

    /**
     * Mark a haulage offer as shipped (Admin only)
     * Task: 6.4.1.17. Mark Listing as Shipped
     */
    @authenticate('jwt')
    @patch('/haulage-offers/{id}/mark-shipped')
    @response(200, {
        description: 'Haulage offer marked as shipped successfully',
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        status: { type: 'string' },
                        message: { type: 'string' },
                        data: {
                            type: 'object',
                            properties: getModelSchemaRef(HaulageOffers),
                        },
                    },
                },
            },
        },
        responses: {
            '401': {
                description: 'Unauthorized - Admin access required',
            },
            '400': {
                description: 'Bad Request - Offer not in acceptable state for shipping',
            },
            '404': {
                description: 'Haulage offer not found',
            },
        },
    })
    async markAsShipped(
        @param.path.number('id') id: number,
        @requestBody({
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            loadId: {
                                type: 'number',
                                description: 'ID of the specific load to mark as shipped',
                            },
                        },
                        required: ['loadId'],
                    },
                },
            },
        })
        requestData: { loadId: number },
        @inject(SecurityBindings.USER)
        currentUserProfile: UserProfile,
    ): Promise<IDataResponse<HaulageOffers>> {
        try {
            // Check if user is admin
            const user = await this.userRepository.findById(currentUserProfile.id);
            const globalRole = user.globalRole;

            AuthHelper.validateAdmin(globalRole);

            const currentUser = currentUserProfile as MyUserProfile;

            return await this.haulageOfferService.markAsShipped(id, currentUser, requestData.loadId);
        } catch (error) {
            if (error instanceof HttpErrors.HttpError) {
                throw error;
            }
            throw new HttpErrors.InternalServerError('Failed to mark haulage offer as shipped');
        }
    }

    /**
     * Force update haulage offer status (Admin only - for testing/fixing data)
     */
    @authenticate('jwt')
    @patch('/admin/haulage-offers/{id}/force-status')
    @response(200, {
        description: 'Haulage offer status updated successfully',
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        status: { type: 'string' },
                        message: { type: 'string' },
                        data: getModelSchemaRef(HaulageOffers),
                    },
                },
            },
        },
    })
    async forceUpdateStatus(
        @param.path.number('id') id: number,
        @requestBody({
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            status: {
                                type: 'string',
                                description: 'New status for haulage offer',
                                enum: [
                                    'pending',
                                    'approved',
                                    'accepted',
                                    'rejected',
                                    'withdrawn',
                                    'information_requested',
                                    'open_for_edits',
                                    'partially_shipped',
                                    'shipped',
                                ],
                            },
                        },
                        required: ['status'],
                    },
                },
            },
        })
        requestData: { status: string },
        @inject(SecurityBindings.USER)
        currentUserProfile: UserProfile,
    ): Promise<IDataResponse<HaulageOffers>> {
        try {
            // Check if user is admin
            const user = await this.userRepository.findById(currentUserProfile.id);
            AuthHelper.validateAdmin(user.globalRole);

            const currentUser = currentUserProfile as MyUserProfile;
            return await this.haulageOfferService.forceUpdateStatus(id, requestData.status, currentUser);
        } catch (error) {
            if (error instanceof HttpErrors.HttpError) {
                throw error;
            }
            throw new HttpErrors.InternalServerError('Failed to update haulage offer status');
        }
    }

    @get('/haulage-offers/{id}/loads', {
        responses: {
            '200': {
                description: 'Get loads for haulage offer',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                status: { type: 'string' },
                                message: { type: 'string' },
                                data: { type: 'array' },
                            },
                        },
                    },
                },
            },
        },
    })
    @authenticate('jwt')
    async getLoads(
        @param.path.number('id') id: number,
        @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    ): Promise<IDataResponse<unknown[]>> {
        try {
            return await this.haulageOfferService.getLoadsForHaulageOffer(id);
        } catch (error) {
            if (error instanceof HttpErrors.HttpError) {
                throw error;
            }
            throw new HttpErrors.InternalServerError('Failed to get loads');
        }
    }
}
