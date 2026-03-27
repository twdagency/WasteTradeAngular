import { Count, CountSchema, Filter, FilterExcludingWhere, repository, Where } from '@loopback/repository';
import { post, param, get, getModelSchemaRef, patch, put, del, requestBody, response } from '@loopback/rest';
import { ListingDocuments } from '../models';
import { ListingDocumentsRepository } from '../repositories';

export class ListingDocumentsController {
    constructor(
        @repository(ListingDocumentsRepository)
        public listingDocumentsRepository: ListingDocumentsRepository,
    ) {}

    @post('/listing-documents')
    @response(200, {
        description: 'ListingDocuments model instance',
        content: { 'application/json': { schema: getModelSchemaRef(ListingDocuments) } },
    })
    async create(
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(ListingDocuments, {
                        title: 'NewListingDocuments',
                        exclude: ['id'],
                    }),
                },
            },
        })
        listingDocuments: Omit<ListingDocuments, 'id'>,
    ): Promise<ListingDocuments> {
        return this.listingDocumentsRepository.create(listingDocuments);
    }

    @get('/listing-documents/count')
    @response(200, {
        description: 'ListingDocuments model count',
        content: { 'application/json': { schema: CountSchema } },
    })
    async count(@param.where(ListingDocuments) where?: Where<ListingDocuments>): Promise<Count> {
        return this.listingDocumentsRepository.count(where);
    }

    @get('/listing-documents')
    @response(200, {
        description: 'Array of ListingDocuments model instances',
        content: {
            'application/json': {
                schema: {
                    type: 'array',
                    items: getModelSchemaRef(ListingDocuments, { includeRelations: true }),
                },
            },
        },
    })
    async find(@param.filter(ListingDocuments) filter?: Filter<ListingDocuments>): Promise<ListingDocuments[]> {
        return this.listingDocumentsRepository.find(filter);
    }

    @patch('/listing-documents')
    @response(200, {
        description: 'ListingDocuments PATCH success count',
        content: { 'application/json': { schema: CountSchema } },
    })
    async updateAll(
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(ListingDocuments, { partial: true }),
                },
            },
        })
        listingDocuments: ListingDocuments,
        @param.where(ListingDocuments) where?: Where<ListingDocuments>,
    ): Promise<Count> {
        return this.listingDocumentsRepository.updateAll(listingDocuments, where);
    }

    @get('/listing-documents/{id}')
    @response(200, {
        description: 'ListingDocuments model instance',
        content: {
            'application/json': {
                schema: getModelSchemaRef(ListingDocuments, { includeRelations: true }),
            },
        },
    })
    async findById(
        @param.path.number('id') id: number,
        @param.filter(ListingDocuments, { exclude: 'where' }) filter?: FilterExcludingWhere<ListingDocuments>,
    ): Promise<ListingDocuments> {
        return this.listingDocumentsRepository.findById(id, filter);
    }

    @patch('/listing-documents/{id}')
    @response(204, {
        description: 'ListingDocuments PATCH success',
    })
    async updateById(
        @param.path.number('id') id: number,
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(ListingDocuments, { partial: true }),
                },
            },
        })
        listingDocuments: ListingDocuments,
    ): Promise<void> {
        await this.listingDocumentsRepository.updateById(id, listingDocuments);
    }

    @put('/listing-documents/{id}')
    @response(204, {
        description: 'ListingDocuments PUT success',
    })
    async replaceById(
        @param.path.number('id') id: number,
        @requestBody() listingDocuments: ListingDocuments,
    ): Promise<void> {
        await this.listingDocumentsRepository.replaceById(id, listingDocuments);
    }

    @del('/listing-documents/{id}')
    @response(204, {
        description: 'ListingDocuments DELETE success',
    })
    async deleteById(@param.path.number('id') id: number): Promise<void> {
        await this.listingDocumentsRepository.deleteById(id);
    }
}
