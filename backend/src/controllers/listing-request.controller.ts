import { repository } from '@loopback/repository';
import { post, get, requestBody, getModelSchemaRef, response, HttpErrors } from '@loopback/rest';
import { ListingRequest } from '../models/listing-request.model';
import { ListingRequestRepository } from '../repositories/listing-request.repository';
import { inject } from '@loopback/core';
import { authenticate } from '@loopback/authentication';
import { SecurityBindings, UserProfile } from '@loopback/security';

interface ListingRequestBody {
    listingId: number;
    requestPictures: boolean;
    requestSpecSheets: boolean;
    requestDescription: boolean;
    freeText: string;
}
export class ListingRequestController {
    constructor(
        @repository(ListingRequestRepository)
        public listingRequestRepository: ListingRequestRepository,
    ) {}

    @authenticate('jwt')
    @post('/listing-requests')
    @response(200, {
        description: 'ListingRequest model instance',
        content: { 'application/json': { schema: getModelSchemaRef(ListingRequest) } },
    })
    async create(
        @requestBody() listingRequest: ListingRequestBody,
        @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
    ): Promise<ListingRequest> {
        const userId = currentUserProfile.id;
        if (!userId) {
            throw new HttpErrors.Unauthorized('User not authenticated');
        }
        return this.listingRequestRepository.create({
            ...listingRequest,
            userId: userId,
        });
    }

    @get('/listing-requests', {
        responses: {
            '200': {
                description: 'Array of ListingRequest model instances',
                content: {
                    'application/json': {
                        schema: { type: 'array', items: getModelSchemaRef(ListingRequest) },
                    },
                },
            },
        },
    })
    async find(): Promise<ListingRequest[]> {
        return this.listingRequestRepository.find();
    }
}
