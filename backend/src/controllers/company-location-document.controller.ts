import { authenticate } from '@loopback/authentication';
import { inject, service } from '@loopback/core';
import { Count, CountSchema, Filter, FilterExcludingWhere, repository, Where } from '@loopback/repository';
import { del, get, getModelSchemaRef, param, patch, post, put, requestBody, response } from '@loopback/rest';
import { SecurityBindings } from '@loopback/security';
import { MyUserProfile } from '../authentication-strategies/type';
import { CompanyLocationDocuments } from '../models';
import { CompanyLocationDocumentsRepository } from '../repositories';
import { CompanyLocationDocumentService } from '../services/company-location-document.service';
import { IDataResponse } from '../types';

@authenticate('jwt')
export class CompanyLocationDocumentController {
    constructor(
        @repository(CompanyLocationDocumentsRepository)
        public companyLocationDocumentsRepository: CompanyLocationDocumentsRepository,

        @service(CompanyLocationDocumentService)
        public companyLocationDocumentService: CompanyLocationDocumentService,
    ) {}

    @get('/company-location-documents/count')
    @response(200, {
        description: 'CompanyLocationDocuments model count',
        content: { 'application/json': { schema: CountSchema } },
    })
    async count(@param.where(CompanyLocationDocuments) where?: Where<CompanyLocationDocuments>): Promise<Count> {
        return this.companyLocationDocumentsRepository.count(where);
    }

    @get('/company-location-documents')
    @response(200, {
        description: 'Array of CompanyLocationDocuments model instances',
        content: {
            'application/json': {
                schema: {
                    type: 'array',
                    items: getModelSchemaRef(CompanyLocationDocuments, { includeRelations: true }),
                },
            },
        },
    })
    async find(
        @param.filter(CompanyLocationDocuments) filter?: Filter<CompanyLocationDocuments>,
    ): Promise<CompanyLocationDocuments[]> {
        return this.companyLocationDocumentsRepository.find(filter);
    }

    @post('/company-location-documents/me')
    @response(200, {
        description: 'CompanyLocationDocuments PATCH success count',
        content: { 'application/json': { schema: CountSchema } },
    })
    async updateAll(
        @inject(SecurityBindings.USER)
        currentUserProfile: MyUserProfile,
        @requestBody({
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            companyLocationId: { type: 'number' },
                            documents: {
                                type: 'array',
                                items: getModelSchemaRef(CompanyLocationDocuments, { partial: true }),
                            },
                        },
                        required: ['companyLocationId', 'documents'],
                    },
                },
            },
        })
        updateRequestBody: {
            companyLocationId: number;
            documents: CompanyLocationDocuments[];
        },
    ): Promise<IDataResponse<{ companyLocationDocuments: CompanyLocationDocuments[] }>> {
        return this.companyLocationDocumentService.updateCompanyLocationDocuments(
            updateRequestBody.documents,
            updateRequestBody.companyLocationId,
            currentUserProfile.id,
        );
    }

    @get('/company-location-documents/{id}')
    @response(200, {
        description: 'CompanyLocationDocuments model instance',
        content: {
            'application/json': {
                schema: getModelSchemaRef(CompanyLocationDocuments, { includeRelations: true }),
            },
        },
    })
    async findById(
        @param.path.number('id') id: number,
        @param.filter(CompanyLocationDocuments, { exclude: 'where' })
        filter?: FilterExcludingWhere<CompanyLocationDocuments>,
    ): Promise<CompanyLocationDocuments> {
        return this.companyLocationDocumentsRepository.findById(id, filter);
    }

    @patch('/company-location-documents/{id}')
    @response(204, {
        description: 'CompanyLocationDocuments PATCH success',
    })
    async updateById(
        @param.path.number('id') id: number,
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(CompanyLocationDocuments, { partial: true }),
                },
            },
        })
        companyLocationDocuments: CompanyLocationDocuments,
    ): Promise<void> {
        await this.companyLocationDocumentsRepository.updateById(id, companyLocationDocuments);
    }

    @put('/company-location-documents/{id}')
    @response(204, {
        description: 'CompanyLocationDocuments PUT success',
    })
    async replaceById(
        @param.path.number('id') id: number,
        @requestBody() companyLocationDocuments: CompanyLocationDocuments,
    ): Promise<void> {
        await this.companyLocationDocumentsRepository.replaceById(id, companyLocationDocuments);
    }

    @del('/company-location-documents/{id}')
    @response(204, {
        description: 'CompanyLocationDocuments DELETE success',
    })
    async deleteById(@param.path.number('id') id: number): Promise<void> {
        await this.companyLocationDocumentsRepository.deleteById(id);
    }
}
