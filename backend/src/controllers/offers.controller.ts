import { authenticate } from '@loopback/authentication';
import { inject, service } from '@loopback/core';
import { Count, CountSchema, Filter, repository, Where } from '@loopback/repository';
import { del, get, getModelSchemaRef, param, patch, post, put, requestBody, response } from '@loopback/rest';
import { SecurityBindings, securityId, UserProfile } from '@loopback/security';
import { MyUserProfile } from '../authentication-strategies/type';
import { messages } from '../constants';
import { UserRoleEnum } from '../enum';
import { AuthHelper } from '../helpers/auth.helper';
import { Offers, OffersFilterExtended } from '../models';
import { BiddingForm } from '../models/bidding-form.model';
import { OffersRepository, UserRepository } from '../repositories';
import { OfferService } from '../services/offer.service';
import { IDataResponse, PaginationList } from '../types/common';
import { OfferCompanies, OfferDetails } from '../types/offer';
@authenticate('jwt')
export class OffersController {
    constructor(
        @repository(OffersRepository)
        public offersRepository: OffersRepository,
        @repository(UserRepository)
        public userRepository: UserRepository,
        @service(OfferService)
        public offerService: OfferService,
    ) {}

    @get('/offers')
    @response(200, {
        description: 'Array of Offer model instances with role-based filtering',
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        totalCount: { type: 'number', description: 'Total number of offers matching the filter' },
                        results: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    offer: {
                                        allOf: [
                                            getModelSchemaRef(Offers),
                                            {
                                                type: 'object',
                                                properties: {
                                                    sellerTotalAmount: {
                                                        type: 'number',
                                                        description: 'Total amount for seller',
                                                    },
                                                    location: { type: 'object', description: 'Location details' },
                                                    originalCurrency: {
                                                        type: 'string',
                                                        description: 'Original currency before conversion',
                                                    },
                                                },
                                            },
                                        ],
                                    },
                                    listing: {
                                        type: 'object',
                                        properties: {
                                            numberOfOffers: {
                                                type: 'number',
                                                description: 'Number of offers for this listing',
                                            },
                                            bestOffer: { type: 'number', description: 'Best offer amount' },
                                            bestOfferCurrency: {
                                                type: 'string',
                                                description: 'Currency of best offer',
                                            },
                                            documents: {
                                                type: 'array',
                                                items: { type: 'object' },
                                                description: 'Listing documents',
                                            },
                                            location: { type: 'object', description: 'Listing location details' },
                                        },
                                    },
                                    buyer: {
                                        type: 'object',
                                        properties: {
                                            user: { type: 'object', description: 'Buyer user details' },
                                            company: { type: 'object', description: 'Buyer company details' },
                                            location: { type: 'object', description: 'Buyer location details' },
                                        },
                                    },
                                    seller: {
                                        type: 'object',
                                        properties: {
                                            user: { type: 'object', description: 'Seller user details' },
                                            company: { type: 'object', description: 'Seller company details' },
                                            location: { type: 'object', description: 'Seller location details' },
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
    async find(
        @inject(SecurityBindings.USER)
        currentUserProfile: MyUserProfile,
        @param.query.object('filter') filter?: OffersFilterExtended,
    ): Promise<PaginationList<unknown>> {
        return this.offerService.getOffers({ filter }, currentUserProfile);
    }

    @authenticate('jwt')
    @get('/offers/{id}')
    @response(200, {
        description: 'Offers model instance',
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        status: {
                            type: 'string',
                        },
                        message: {
                            type: 'string',
                        },
                        data: {
                            type: 'object',
                        },
                    },
                    required: ['status', 'message', 'data'],
                },
            },
        },
    })
    async findById(
        @inject(SecurityBindings.USER) currentUserProfile: MyUserProfile,
        @param.path.number('id') id: number,
    ): Promise<IDataResponse<unknown>> {
        const isAdmin = AuthHelper.isAdmin(currentUserProfile.globalRole);

        return this.offerService.getOfferById(id, currentUserProfile, isAdmin);
    }

    @post('/offers')
    @response(200, {
        description: 'Offers model instance',
        content: { 'application/json': { schema: getModelSchemaRef(Offers) } },
    })
    async create(
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(BiddingForm, {
                        title: 'NewOffers',
                    }),
                },
            },
        })
        biddingForm: BiddingForm,
    ): Promise<Offers> {
        return this.offerService.createOffer(biddingForm);
    }

    @get('/offers/count')
    @response(200, {
        description: 'Offers model count',
        content: { 'application/json': { schema: CountSchema } },
    })
    async count(@param.where(Offers) where?: Where<Offers>): Promise<Count> {
        return this.offersRepository.count(where);
    }

    @get('/offers/admin', {
        summary: 'Get all offers (Admin only)',
        description:
            'Admin endpoint to retrieve all offers. Supports filter parameter with: searchTerm, buyerCompanyName, sellerCompanyName, materialType, materialPacking, location, status, state, sortBy',
        security: [{ jwt: [] }],
        responses: {
            '200': {
                description: 'Array of Offer model instances with comprehensive details',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                totalCount: {
                                    type: 'number',
                                    description: 'Total number of offers matching the filter',
                                },
                                results: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            offer: {
                                                allOf: [
                                                    getModelSchemaRef(Offers),
                                                    {
                                                        type: 'object',
                                                        properties: {
                                                            sellerTotalAmount: {
                                                                type: 'number',
                                                                description: 'Total amount for seller',
                                                            },
                                                            location: {
                                                                type: 'object',
                                                                description: 'Location details',
                                                            },
                                                            originalCurrency: {
                                                                type: 'string',
                                                                description: 'Original currency before conversion',
                                                            },
                                                        },
                                                    },
                                                ],
                                            },
                                            listing: {
                                                type: 'object',
                                                properties: {
                                                    id: { type: 'number' },
                                                    title: { type: 'string' },
                                                    status: { type: 'string' },
                                                    state: { type: 'string' },
                                                    quantity: { type: 'number' },
                                                    remainingQuantity: { type: 'number' },
                                                    materialWeightPerUnit: { type: 'number' },
                                                    materialWeightWanted: { type: 'number' },
                                                    materialType: { type: 'string' },
                                                    materialPacking: { type: 'string' },
                                                    materialItem: { type: 'string' },
                                                    materialFinishing: { type: 'string' },
                                                    materialForm: { type: 'string' },
                                                },
                                            },
                                            buyer: {
                                                type: 'object',
                                                properties: {
                                                    user: {
                                                        type: 'object',
                                                        properties: {
                                                            id: { type: 'number' },
                                                            firstName: { type: 'string' },
                                                            lastName: { type: 'string' },
                                                            email: { type: 'string' },
                                                            username: { type: 'string' },
                                                        },
                                                    },
                                                    company: {
                                                        type: 'object',
                                                        properties: {
                                                            id: { type: 'number' },
                                                            name: { type: 'string' },
                                                            country: { type: 'string' },
                                                        },
                                                    },
                                                },
                                            },
                                            seller: {
                                                type: 'object',
                                                properties: {
                                                    user: {
                                                        type: 'object',
                                                        properties: {
                                                            id: { type: 'number' },
                                                            firstName: { type: 'string' },
                                                            lastName: { type: 'string' },
                                                            email: { type: 'string' },
                                                            username: { type: 'string' },
                                                        },
                                                    },
                                                    company: {
                                                        type: 'object',
                                                        properties: {
                                                            id: { type: 'number' },
                                                            name: { type: 'string' },
                                                            country: { type: 'string' },
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
                },
            },
            '401': {
                description: 'Unauthorized - Admin access required',
            },
        },
    })
    async findByAdmin(
        @inject(SecurityBindings.USER)
        currentUserProfile: UserProfile,
        @param.query.object('filter') filter?: Filter<Offers>,
    ): Promise<PaginationList<OfferDetails>> {
        const user = await this.userRepository.findById(currentUserProfile.id);
        const globalRole = user.globalRole;

        AuthHelper.validateAdmin(globalRole);

        return this.offerService.getOffersAdmin(filter);
    }

    @patch('/offers')
    @response(200, {
        description: 'Offers PATCH success count',
        content: { 'application/json': { schema: CountSchema } },
    })
    async updateAll(
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(Offers, { partial: true }),
                },
            },
        })
        offers: Offers,
        @param.where(Offers) where?: Where<Offers>,
    ): Promise<Count> {
        return this.offersRepository.updateAll(offers, where);
    }

    @patch('/offers/{id}')
    @response(204, {
        description: 'Offers PATCH success',
    })
    async updateById(
        @param.path.number('id') id: number,
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(Offers, { partial: true }),
                },
            },
        })
        offers: Offers,
    ): Promise<void> {
        await this.offersRepository.updateById(id, offers);
    }

    @patch('/offers/{id}/{requestAction}')
    @response(204, {
        description: 'Offers PATCH success',
    })
    async requestAction(
        @inject(SecurityBindings.USER)
        currentUserProfile: MyUserProfile,
        @param.path.number('id') id: number,
        @param.path.string('requestAction') requestAction: string,
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(Offers, { partial: true }),
                },
            },
        })
        offers: Offers,
    ): Promise<void> {
        await this.offerService.handleRequestAction(id, requestAction, currentUserProfile, {
            rejectionReason: offers?.rejectionReason,
        });
    }

    @put('/offers/{id}')
    @response(204, {
        description: 'Offers PUT success',
    })
    async replaceById(@param.path.number('id') id: number, @requestBody() offers: Offers): Promise<void> {
        await this.offersRepository.replaceById(id, offers);
    }

    @del('/offers/{id}')
    @response(204, {
        description: 'Offers DELETE success',
    })
    async deleteById(@param.path.number('id') id: number): Promise<void> {
        await this.offersRepository.deleteById(id);
    }

    @patch('/offers/admin/{id}/{requestAction}')
    @response(204, {
        description: 'Offers PATCH success',
    })
    async adminRequestAction(
        @inject(SecurityBindings.USER)
        currentUserProfile: MyUserProfile,
        @param.path.number('id') id: number,
        @param.path.string('requestAction') requestAction: string,
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(Offers, { partial: true }),
                },
            },
        })
        offers: Offers,
    ): Promise<void> {
        const user = await this.userRepository.findById(currentUserProfile.id);
        const globalRole = user.globalRole;

        AuthHelper.validateAdmin(globalRole);

        await this.offerService.handleAdminRequestAction(id, requestAction, {
            rejectionReason: offers?.rejectionReason,
            message: offers?.message,
        });
    }

    @get('/offers/admin/companies')
    @response(200, {
        description: 'Get all buyer and seller companies from offers',
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
                                buyerCompanies: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            id: { type: 'number' },
                                            name: { type: 'string' },
                                            country: { type: 'string' },
                                        },
                                    },
                                },
                                sellerCompanies: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            id: { type: 'number' },
                                            name: { type: 'string' },
                                            country: { type: 'string' },
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
    async getCompanies(
        @inject(SecurityBindings.USER)
        currentUserProfile: UserProfile,
    ): Promise<IDataResponse<OfferCompanies>> {
        const user = await this.userRepository.findById(currentUserProfile.id);
        const globalRole = user.globalRole;

        AuthHelper.validateAdmin(globalRole);

        const companies = await this.offerService.getOfferCompanies();

        return {
            status: 'success',
            message: messages.getCompaniesSuccess,
            data: companies,
        };
    }
}
