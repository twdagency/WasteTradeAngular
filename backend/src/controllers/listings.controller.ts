import { authenticate } from '@loopback/authentication';
import { inject, service } from '@loopback/core';
import { Count, CountSchema, Filter, repository, Where } from '@loopback/repository';
import {
    del,
    get,
    getModelSchemaRef,
    HttpErrors,
    param,
    patch,
    post,
    put,
    requestBody,
    response,
} from '@loopback/rest';
import { SecurityBindings, securityId, UserProfile } from '@loopback/security';
import { MyUserProfile } from '../authentication-strategies/type';
import { messages } from '../constants';
import { ListingType, UserRoleEnum } from '../enum';
import { CreateListing, Listings } from '../models';
import { ListingsRepository, UserRepository } from '../repositories';
import { ListingService } from '../services/listing.service';
import { OfferService } from '../services/offer.service';
import { IDataResponse, PaginationList } from '../types';
import { ListingWithDetails, ListingWithDocuments } from '../types/listing';
import { AuthHelper } from '../helpers/auth.helper';

export class ListingsController {
    constructor(
        @repository(ListingsRepository)
        public listingsRepository: ListingsRepository,
        @repository(UserRepository)
        public userRepository: UserRepository,
        @service(ListingService)
        public listingService: ListingService,
        @service(OfferService)
        public offerService: OfferService,
    ) {}

    @post('/listings')
    @authenticate('jwt')
    @response(200, {
        description: messages.listingCreated,
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
                            properties: {
                                listing: getModelSchemaRef(Listings),
                            },
                        },
                    },
                    required: ['status', 'message', 'data'],
                },
            },
        },
    })
    async create(
        @inject(SecurityBindings.USER)
        currentUserProfile: UserProfile,
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(CreateListing, {
                        title: 'NewListing',
                        exclude: ['id'],
                    }),
                },
            },
        })
        listings: Omit<CreateListing, 'id'>,
    ): Promise<IDataResponse> {
        const userId = currentUserProfile[securityId];
        return this.listingService.createListing(listings, userId);
    }

    @get('/listings/count')
    @response(200, {
        description: 'Listings model count',
        content: { 'application/json': { schema: CountSchema } },
    })
    async count(@param.where(Listings) where?: Where<Listings>): Promise<Count> {
        return this.listingsRepository.count(where);
    }

    @get('/listings', {
        summary: 'Get listings with filtering',
        description:
            'Retrieve listings. Supports filter parameter with: searchTerm, materialType, materialItem, materialPacking, country, listingType, status, wasteStoration, sortBy',

        responses: {
            '200': {
                description: 'Array of Listing model instances with pagination',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                totalCount: {
                                    type: 'number',
                                    description: 'Total number of listings matching the filter',
                                },
                                results: {
                                    type: 'array',
                                    items: {
                                        allOf: [
                                            getModelSchemaRef(Listings),
                                            {
                                                type: 'object',
                                                properties: {
                                                    documents: {
                                                        type: 'array',
                                                        items: { type: 'object' },
                                                        description: 'Associated listing documents',
                                                    },
                                                    wantedStatus: {
                                                        type: 'string',
                                                        description: 'Material requirement status for wanted listings',
                                                    },
                                                    originalCurrency: {
                                                        type: 'string',
                                                        description: 'Original currency before conversion',
                                                    },
                                                    locationDetails: {
                                                        type: 'object',
                                                        description: 'Enhanced location details',
                                                    },
                                                    expiryInfo: {
                                                        type: 'object',
                                                        description: 'Expiry information for active listings',
                                                    },
                                                },
                                            },
                                        ],
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    })
    async find(@param.query.object('filter') filter?: Filter<Listings>): Promise<PaginationList<ListingWithDocuments>> {
        return this.listingService.getListings({ filter });
    }

    @authenticate('jwt')
    @get('/listings/wanted', {
        summary: 'Get wanted listings (Admin only)',
        description:
            'Admin endpoint to retrieve wanted listings. Supports filter parameter with: searchTerm, dateRequireFrom, dateRequireTo, materialType, company, country, status, state, sortBy',
        security: [{ jwt: [] }],
        parameters: [
            {
                name: 'filter',
                in: 'query',
                required: false,
                style: 'deepObject',
                explode: true,
                schema: {
                    type: 'object',
                    properties: {
                        skip: { type: 'number', description: 'Number of records to skip for pagination' },
                        limit: { type: 'number', description: 'Maximum number of records to return' },
                        where: {
                            type: 'object',
                            properties: {
                                searchTerm: { type: 'string', description: 'Global search across multiple fields' },
                                dateRequireFrom: {
                                    type: 'string',
                                    format: 'date',
                                    description: 'Filter by start date (from)',
                                },
                                dateRequireTo: {
                                    type: 'string',
                                    format: 'date',
                                    description: 'Filter by start date (to)',
                                },
                                materialType: {
                                    oneOf: [
                                        { type: 'string', enum: ['plastic', 'efw', 'fibre', 'rubber', 'metal'] },
                                        {
                                            type: 'array',
                                            items: {
                                                type: 'string',
                                                enum: ['plastic', 'efw', 'fibre', 'rubber', 'metal'],
                                            },
                                        },
                                    ],
                                    description: 'Filter by material type',
                                },
                                company: { type: 'string', description: 'Filter by company name (partial match)' },
                                country: {
                                    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
                                    description: 'Filter by country',
                                },
                                name: { type: 'string', description: 'Filter by user name (first/last name)' },
                                status: {
                                    oneOf: [
                                        {
                                            type: 'string',
                                            enum: ['available', 'pending', 'sold', 'rejected', 'expired'],
                                        },
                                        {
                                            type: 'object',
                                            properties: {
                                                neq: { type: 'string' },
                                                eq: { type: 'string' },
                                                in: { type: 'array', items: { type: 'string' } },
                                                nin: { type: 'array', items: { type: 'string' } },
                                            },
                                        },
                                    ],
                                    description: 'Filter by status',
                                },
                                state: {
                                    oneOf: [
                                        { type: 'string', enum: ['approved', 'pending', 'rejected'] },
                                        {
                                            type: 'object',
                                            properties: {
                                                neq: { type: 'string' },
                                                eq: { type: 'string' },
                                                in: { type: 'array', items: { type: 'string' } },
                                                nin: { type: 'array', items: { type: 'string' } },
                                            },
                                        },
                                    ],
                                    description: 'Filter by state',
                                },
                                wantedStatus: {
                                    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
                                    description: 'Filter wanted listings by requirement status',
                                },
                            },
                        },
                    },
                },
            },
        ],
        responses: {
            '200': {
                description: 'Array of wanted Listing model instances with detailed information',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                totalCount: {
                                    type: 'number',
                                    description: 'Total number of wanted listings matching the filter',
                                },
                                results: {
                                    type: 'array',
                                    items: {
                                        allOf: [
                                            getModelSchemaRef(Listings),
                                            {
                                                type: 'object',
                                                properties: {
                                                    documents: {
                                                        type: 'array',
                                                        items: { type: 'object' },
                                                        description: 'Associated listing documents',
                                                    },
                                                    wantedStatus: {
                                                        type: 'string',
                                                        description: 'Material requirement status for wanted listings',
                                                    },
                                                    originalCurrency: {
                                                        type: 'string',
                                                        description: 'Original currency before conversion',
                                                    },
                                                    locationDetails: {
                                                        type: 'object',
                                                        description: 'Enhanced location details',
                                                    },
                                                    createdBy: {
                                                        type: 'object',
                                                        properties: {
                                                            user: {
                                                                type: 'object',
                                                                description: 'User who created the listing',
                                                            },
                                                            company: {
                                                                type: 'object',
                                                                description: 'Company that owns the listing',
                                                            },
                                                            location: {
                                                                type: 'object',
                                                                description: 'Location details',
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        ],
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
    async findWanted(
        @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
        @param.query.object('filter') filter?: Filter<Listings>,
    ): Promise<PaginationList<ListingWithDetails>> {
        const user = await this.userRepository.findById(currentUserProfile.id);
        const globalRole = user.globalRole;

        AuthHelper.validateAdmin(globalRole);

        return this.listingService.getAdminListings({ filter, listingType: ListingType.WANTED });
    }

    @authenticate('jwt')
    @get('/listings/sell', {
        summary: 'Get sell listings (Admin only)',
        description:
            'Admin endpoint to retrieve sell listings. Supports filter parameter with: searchTerm, dateRequireFrom, dateRequireTo, materialType, company, country, status, state, sortBy',
        security: [{ jwt: [] }],
        parameters: [
            {
                name: 'filter',
                in: 'query',
                required: false,
                style: 'deepObject',
                explode: true,
                schema: {
                    type: 'object',
                    properties: {
                        skip: { type: 'number', description: 'Number of records to skip for pagination' },
                        limit: { type: 'number', description: 'Maximum number of records to return' },
                        where: {
                            type: 'object',
                            properties: {
                                searchTerm: { type: 'string', description: 'Global search across multiple fields' },
                                dateRequireFrom: {
                                    type: 'string',
                                    format: 'date',
                                    description: 'Filter by start date (from)',
                                },
                                dateRequireTo: {
                                    type: 'string',
                                    format: 'date',
                                    description: 'Filter by start date (to)',
                                },
                                materialType: {
                                    oneOf: [
                                        { type: 'string', enum: ['plastic', 'efw', 'fibre', 'rubber', 'metal'] },
                                        {
                                            type: 'array',
                                            items: {
                                                type: 'string',
                                                enum: ['plastic', 'efw', 'fibre', 'rubber', 'metal'],
                                            },
                                        },
                                    ],
                                    description: 'Filter by material type',
                                },
                                company: { type: 'string', description: 'Filter by company name (partial match)' },
                                country: {
                                    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
                                    description: 'Filter by country',
                                },
                                name: { type: 'string', description: 'Filter by user name (first/last name)' },
                                status: {
                                    oneOf: [
                                        {
                                            type: 'string',
                                            enum: ['available', 'pending', 'sold', 'rejected', 'expired'],
                                        },
                                        {
                                            type: 'object',
                                            properties: {
                                                neq: { type: 'string' },
                                                eq: { type: 'string' },
                                                in: { type: 'array', items: { type: 'string' } },
                                                nin: { type: 'array', items: { type: 'string' } },
                                            },
                                        },
                                    ],
                                    description: 'Filter by status',
                                },
                                state: {
                                    oneOf: [
                                        { type: 'string', enum: ['approved', 'pending', 'rejected'] },
                                        {
                                            type: 'object',
                                            properties: {
                                                neq: { type: 'string' },
                                                eq: { type: 'string' },
                                                in: { type: 'array', items: { type: 'string' } },
                                                nin: { type: 'array', items: { type: 'string' } },
                                            },
                                        },
                                    ],
                                    description: 'Filter by state',
                                },
                                wantedStatus: {
                                    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
                                    description: 'Filter wanted listings by requirement status',
                                },
                            },
                        },
                    },
                },
            },
        ],
        responses: {
            '200': {
                description: 'Array of Listing model instances with detailed information',
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                totalCount: {
                                    type: 'number',
                                    description: 'Total number of listings matching the filter',
                                },
                                results: {
                                    type: 'array',
                                    items: {
                                        allOf: [
                                            getModelSchemaRef(Listings),
                                            {
                                                type: 'object',
                                                properties: {
                                                    documents: {
                                                        type: 'array',
                                                        items: { type: 'object' },
                                                        description: 'Associated listing documents',
                                                    },
                                                    wantedStatus: {
                                                        type: 'string',
                                                        description: 'Material requirement status for wanted listings',
                                                    },
                                                    originalCurrency: {
                                                        type: 'string',
                                                        description: 'Original currency before conversion',
                                                    },
                                                    locationDetails: {
                                                        type: 'object',
                                                        description: 'Enhanced location details',
                                                    },
                                                    createdBy: {
                                                        type: 'object',
                                                        properties: {
                                                            user: {
                                                                type: 'object',
                                                                description: 'User who created the listing',
                                                            },
                                                            company: {
                                                                type: 'object',
                                                                description: 'Company that owns the listing',
                                                            },
                                                            location: {
                                                                type: 'object',
                                                                description: 'Location details',
                                                            },
                                                        },
                                                    },
                                                },
                                            },
                                        ],
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
    async findSell(
        @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
        @param.query.object('filter') filter?: Filter<Listings>,
    ): Promise<PaginationList<ListingWithDetails>> {
        const user = await this.userRepository.findById(currentUserProfile.id);
        const globalRole = user.globalRole;

        AuthHelper.validateAdmin(globalRole);

        return this.listingService.getAdminListings({ filter, listingType: ListingType.SELL });
    }
    @patch('/listings')
    @response(200, {
        description: 'Listings PATCH success count',
        content: { 'application/json': { schema: CountSchema } },
    })
    async updateAll(
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(Listings, { partial: true }),
                },
            },
        })
        listings: Listings,
        @param.where(Listings) where?: Where<Listings>,
    ): Promise<Count> {
        return this.listingsRepository.updateAll(listings, where);
    }

    @authenticate('jwt')
    @get('/listings/user', {
        summary: "Get current user's listings",
        description:
            'Retrieve listings created by the authenticated user. Supports filter parameter with: searchTerm, materialType, materialItem, materialPacking, country, listingType, status, wasteStoration, sortBy',
        security: [{ jwt: [] }],
        parameters: [
            {
                name: 'filter',
                in: 'query',
                required: false,
                style: 'deepObject',
                explode: true,
                schema: {
                    type: 'object',
                    properties: {
                        skip: { type: 'number', description: 'Number of records to skip for pagination' },
                        limit: { type: 'number', description: 'Maximum number of records to return' },
                        where: {
                            type: 'object',
                            properties: {
                                searchTerm: {
                                    type: 'string',
                                    description: 'Search across material type, item, and packing',
                                },
                                materialType: {
                                    oneOf: [
                                        { type: 'string', enum: ['plastic', 'efw', 'fibre', 'rubber', 'metal'] },
                                        {
                                            type: 'array',
                                            items: {
                                                type: 'string',
                                                enum: ['plastic', 'efw', 'fibre', 'rubber', 'metal'],
                                            },
                                        },
                                    ],
                                    description: 'Filter by material type',
                                },
                                materialItem: {
                                    oneOf: [{ type: 'string' }, { type: 'array', items: { type: 'string' } }],
                                    description: 'Filter by material item',
                                },
                                materialPacking: {
                                    oneOf: [
                                        {
                                            type: 'string',
                                            enum: [
                                                'bags',
                                                'bales',
                                                'boxes',
                                                'bulk_bags',
                                                'loose',
                                                'octabins_gaylords',
                                                'pallets',
                                            ],
                                        },
                                        {
                                            type: 'array',
                                            items: {
                                                type: 'string',
                                                enum: [
                                                    'bags',
                                                    'bales',
                                                    'boxes',
                                                    'bulk_bags',
                                                    'loose',
                                                    'octabins_gaylords',
                                                    'pallets',
                                                ],
                                            },
                                        },
                                    ],
                                    description: 'Filter by material packing',
                                },
                                listingType: {
                                    type: 'string',
                                    enum: ['sell', 'wanted'],
                                    description: 'Filter by listing type',
                                },
                                status: {
                                    oneOf: [
                                        {
                                            type: 'string',
                                            enum: ['available', 'pending', 'sold', 'rejected', 'expired'],
                                        },
                                        {
                                            type: 'object',
                                            properties: {
                                                neq: { type: 'string' },
                                                in: { type: 'array', items: { type: 'string' } },
                                                nin: { type: 'array', items: { type: 'string' } },
                                            },
                                        },
                                    ],
                                    description: 'Filter by status (supports neq, in, nin operators)',
                                },
                                showFullfilledListing: {
                                    type: 'boolean',
                                    description: 'Include/exclude sold listings',
                                },
                                wasteStoration: {
                                    type: 'string',
                                    enum: ['indoor', 'outdoor', 'both', 'any'],
                                    description: 'Filter by waste storage type',
                                },
                                indoor: {
                                    oneOf: [{ type: 'boolean' }, { type: 'array', items: { type: 'boolean' } }],
                                    description: 'Filter by indoor storage capability',
                                },
                                outdoor: {
                                    oneOf: [{ type: 'boolean' }, { type: 'array', items: { type: 'boolean' } }],
                                    description: 'Filter by outdoor storage capability',
                                },
                                sortBy: {
                                    oneOf: [
                                        {
                                            type: 'string',
                                            enum: [
                                                'createdAtAsc',
                                                'createdAtDesc',
                                                'companyNameAsc',
                                                'companyNameDesc',
                                                'materialPackingAsc',
                                                'materialPackingDesc',
                                                'materialItemAsc',
                                                'materialItemDesc',
                                                'materialTypeAsc',
                                                'materialTypeDesc',
                                                'countryAsc',
                                                'countryDesc',
                                                'statusAsc',
                                                'statusDesc',
                                                'stateAsc',
                                                'stateDesc',
                                                'availableListingsAsc',
                                                'availableListingsDesc',
                                            ],
                                        },
                                        {
                                            type: 'array',
                                            items: {
                                                type: 'string',
                                                enum: [
                                                    'createdAtAsc',
                                                    'createdAtDesc',
                                                    'companyNameAsc',
                                                    'companyNameDesc',
                                                    'materialPackingAsc',
                                                    'materialPackingDesc',
                                                    'materialItemAsc',
                                                    'materialItemDesc',
                                                    'materialTypeAsc',
                                                    'materialTypeDesc',
                                                    'countryAsc',
                                                    'countryDesc',
                                                    'statusAsc',
                                                    'statusDesc',
                                                    'stateAsc',
                                                    'stateDesc',
                                                    'availableListingsAsc',
                                                    'availableListingsDesc',
                                                ],
                                            },
                                        },
                                    ],
                                    description: 'Sort results by specified criteria',
                                },
                            },
                        },
                    },
                },
            },
        ],
        responses: {
            '200': {
                description: "Array of user's Listing model instances with detailed information",
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                            properties: {
                                totalCount: {
                                    type: 'number',
                                    description: "Total number of user's listings matching the filter",
                                },
                                results: {
                                    type: 'array',
                                    items: {
                                        allOf: [
                                            getModelSchemaRef(Listings),
                                            {
                                                type: 'object',
                                                properties: {
                                                    documents: {
                                                        type: 'array',
                                                        items: { type: 'object' },
                                                        description: 'Associated listing documents',
                                                    },
                                                    wantedStatus: {
                                                        type: 'string',
                                                        description: 'Material requirement status for wanted listings',
                                                    },
                                                    originalCurrency: {
                                                        type: 'string',
                                                        description: 'Original currency before conversion',
                                                    },
                                                    locationDetails: {
                                                        type: 'object',
                                                        description: 'Enhanced location details',
                                                    },
                                                    expiryInfo: {
                                                        type: 'object',
                                                        description: 'Expiry information for active listings',
                                                    },
                                                },
                                            },
                                        ],
                                    },
                                },
                            },
                        },
                    },
                },
            },
            '401': {
                description: 'Unauthorized - Authentication required',
            },
        },
    })
    async findListingsByUserId(
        @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
        @param.query.object('filter') filter?: Filter<Listings>,
    ): Promise<PaginationList<ListingWithDocuments>> {
        const userId = currentUserProfile[securityId];
        return this.listingService.getListings({ filter }, Number(userId));
    }

    @authenticate('jwt')
    @get('/listings/{id}')
    @response(200, {
        description: 'Listings model instance',
        content: {
            'application/json': {
                schema: getModelSchemaRef(Listings, { includeRelations: true }),
            },
        },
    })
    async findById(
        @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
        @param.path.number('id') id: number,
    ): Promise<IDataResponse> {
        const userId = currentUserProfile[securityId];
        const user = await this.userRepository.findById(currentUserProfile.id);
        const isAdmin = user.globalRole === UserRoleEnum.SUPER_ADMIN || user.globalRole === UserRoleEnum.ADMIN;
        return this.listingService.getListingById(id, Number(userId), isAdmin);
    }

    @authenticate('jwt')
    @patch('/listings/{id}')
    @response(200, {
        description: 'Listings PATCH success',
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
                                listing: getModelSchemaRef(Listings),
                            },
                        },
                    },
                },
            },
        },
    })
    async updateById(
        @inject(SecurityBindings.USER) currentUserProfile: MyUserProfile,
        @param.path.number('id') id: number,
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(CreateListing, { partial: true, exclude: ['id'] }),
                },
            },
        })
        listings: Partial<CreateListing>,
    ): Promise<IDataResponse> {
        const userId = currentUserProfile[securityId];
        return this.listingService.updateListing(id, Number(userId), listings, currentUserProfile);
    }

    @put('/listings/{id}')
    @response(204, {
        description: 'Listings PUT success',
    })
    async replaceById(@param.path.number('id') id: number, @requestBody() listings: Listings): Promise<void> {
        await this.listingsRepository.replaceById(id, listings);
    }

    @authenticate('jwt')
    @del('/listings/{id}')
    @response(204, {
        description: 'Listings DELETE success',
    })
    async deleteById(
        @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
        @param.path.number('id') id: number,
    ): Promise<void> {
        const userId = currentUserProfile[securityId];
        await this.listingService.deleteListing(id, userId);
    }

    @authenticate('jwt')
    @patch('/listings/{id}/renew')
    @response(200, {
        description: 'Renew listing expiry date',
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
                                listing: getModelSchemaRef(Listings),
                                newEndDate: { type: 'string', format: 'date-time' },
                            },
                        },
                    },
                },
            },
        },
    })
    async renewListing(
        @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
        @param.path.number('id') id: number,
        @requestBody({
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            renewalPeriod: {
                                type: 'string',
                                enum: ['2_weeks', '90_days'],
                                description: 'Renewal period: 2 weeks (14 days) or 90 days',
                            },
                        },
                        required: ['renewalPeriod'],
                    },
                },
            },
        })
        renewalData: { renewalPeriod: '2_weeks' | '90_days' },
    ): Promise<IDataResponse> {
        const userId = currentUserProfile[securityId];
        return this.listingService.renewListing(id, Number(userId), renewalData.renewalPeriod);
    }

    @authenticate('jwt')
    @patch('/listings/{id}/mark-sold')
    @response(200, {
        description: 'Mark listing as sold',
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
                                listing: getModelSchemaRef(Listings),
                            },
                        },
                    },
                },
            },
        },
    })
    async markAsSold(
        @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
        @param.path.number('id') id: number,
    ): Promise<IDataResponse> {
        const userId = currentUserProfile[securityId];
        return this.listingService.markListingAsSold(id, Number(userId));
    }

    @authenticate('jwt')
    @get('/listings/admin/{id}')
    @response(200, {
        description: 'Listings model instance',
        content: {
            'application/json': {
                schema: getModelSchemaRef(Listings, { includeRelations: true }),
            },
        },
    })
    async getAdminListingById(@param.path.number('id') id: number): Promise<IDataResponse> {
        return this.listingService.getAdminListingById(id);
    }
    @authenticate('jwt')
    @patch('/listings/admin/{id}/{requestAction}')
    @response(200, {
        description: 'Listings PATCH success',
    })
    async requestAction(
        @param.path.number('id') id: number,
        @param.path.string('requestAction') requestAction: string,
        @requestBody({
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            rejectionReason: { type: 'string' },
                            message: { type: 'string' },
                        },
                    },
                },
            },
        })
        options: { rejectionReason?: string; message?: string },
    ): Promise<void> {
        await this.listingService.handleAdminRequestAction(id, requestAction, options);
    }

    @authenticate('jwt')
    @get('/listings/admin/companies')
    @response(200, {
        description: 'Get all companies from listings based on listing type',
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
                                companies: {
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
    async getListingCompanies(
        @inject(SecurityBindings.USER)
        currentUserProfile: UserProfile,
        @param.query.string('listingType') listingType: ListingType,
    ): Promise<IDataResponse> {
        const user = await this.userRepository.findById(currentUserProfile.id);
        const globalRole = user.globalRole;

        AuthHelper.validateAdmin(globalRole);

        if (!Object.values(ListingType).includes(listingType)) {
            throw new HttpErrors.BadRequest(messages.invalidListingType);
        }

        const companies = await this.listingService.getListingUsersCompanies(listingType);

        return {
            status: 'success',
            message: messages.getCompaniesSuccess,
            data: companies,
        };
    }
}
