import { repository } from '@loopback/repository';
import { param, get, getModelSchemaRef } from '@loopback/rest';
import { ListingDocuments, Listings } from '../models';
import { ListingDocumentsRepository } from '../repositories';

export class ListingDocumentsListingsController {
    constructor(
        @repository(ListingDocumentsRepository)
        public listingDocumentsRepository: ListingDocumentsRepository,
    ) {}

    @get('/listing-documents/{id}/listings', {
        responses: {
            '200': {
                description: 'Listings belonging to ListingDocuments',
                content: {
                    'application/json': {
                        schema: getModelSchemaRef(Listings),
                    },
                },
            },
        },
    })
    async getListings(@param.path.number('id') id: typeof ListingDocuments.prototype.id): Promise<Listings> {
        return this.listingDocumentsRepository.listing(id);
    }
}
