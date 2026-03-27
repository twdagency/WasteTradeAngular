import { Count, CountSchema, Filter, FilterExcludingWhere, repository, Where } from '@loopback/repository';
import { post, param, get, getModelSchemaRef, patch, put, del, requestBody, response } from '@loopback/rest';
import { CompanyDocuments } from '../models';
import { CompanyDocumentsRepository } from '../repositories';
import { inject, service } from '@loopback/core';
import { SecurityBindings, securityId } from '@loopback/security';
import { authenticate } from '@loopback/authentication';
import { IDataResponse } from '../types';
import { CompanyDocumentService } from '../services/company-document.service';
import { messagesOfCompanyDocument } from '../constants/company-document';
import { OnboardingCompanyDocs } from '../models/onboarding-company-docs.model';
import { MyUserProfile } from '../authentication-strategies/type';

@authenticate('jwt')
export class CompanyDocumentController {
    constructor(
        @repository(CompanyDocumentsRepository)
        public companyDocumentsRepository: CompanyDocumentsRepository,

        @service(CompanyDocumentService)
        public companyDocumentService: CompanyDocumentService,
    ) {}

    @post('/company-documents')
    @response(200, {
        description: messagesOfCompanyDocument.createCompanyDocumentSuccess,
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
                                companyDocument: {
                                    type: 'array',
                                    items: getModelSchemaRef(CompanyDocuments),
                                },
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
        currentUserProfile: MyUserProfile,
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(OnboardingCompanyDocs, {
                        title: 'CreateCompanyDocument',
                    }),
                },
            },
        })
        onboardingCompanyDocs: OnboardingCompanyDocs,
    ): Promise<IDataResponse> {
        return this.companyDocumentService.createCompanyDocument(onboardingCompanyDocs, currentUserProfile);
    }

    @get('/company-documents/count')
    @response(200, {
        description: 'CompanyDocuments model count',
        content: { 'application/json': { schema: CountSchema } },
    })
    async count(@param.where(CompanyDocuments) where?: Where<CompanyDocuments>): Promise<Count> {
        return this.companyDocumentsRepository.count(where);
    }

    @get('/company-documents')
    @response(200, {
        description: 'Array of CompanyDocuments model instances',
        content: {
            'application/json': {
                schema: {
                    type: 'array',
                    items: getModelSchemaRef(CompanyDocuments, { includeRelations: true }),
                },
            },
        },
    })
    async find(@param.filter(CompanyDocuments) filter?: Filter<CompanyDocuments>): Promise<CompanyDocuments[]> {
        return this.companyDocumentsRepository.find(filter);
    }

    @post('/company-documents/me')
    @response(200, {
        description: 'CompanyDocuments PATCH success count',
        content: { 'application/json': { schema: CountSchema } },
    })
    async updateAll(
        @inject(SecurityBindings.USER)
        currentUserProfile: MyUserProfile,
        @requestBody({
            content: {
                'application/json': {
                    schema: {
                        type: 'array',
                        items: getModelSchemaRef(CompanyDocuments, { partial: true }),
                    },
                },
            },
        })
        companyDocuments: CompanyDocuments[],
    ): Promise<IDataResponse<CompanyDocuments[]>> {
        return this.companyDocumentService.updateCompanyDocuments(
            companyDocuments,
            currentUserProfile.companyId,
            currentUserProfile.id,
        );
    }

    @get('/company-documents/{id}')
    @response(200, {
        description: 'CompanyDocuments model instance',
        content: {
            'application/json': {
                schema: getModelSchemaRef(CompanyDocuments, { includeRelations: true }),
            },
        },
    })
    async findById(
        @param.path.number('id') id: number,
        @param.filter(CompanyDocuments, { exclude: 'where' }) filter?: FilterExcludingWhere<CompanyDocuments>,
    ): Promise<CompanyDocuments> {
        return this.companyDocumentsRepository.findById(id, filter);
    }

    @patch('/company-documents/{id}')
    @response(204, {
        description: 'CompanyDocuments PATCH success',
    })
    async updateById(
        @param.path.number('id') id: number,
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(CompanyDocuments, { partial: true }),
                },
            },
        })
        companyDocuments: CompanyDocuments,
    ): Promise<void> {
        await this.companyDocumentsRepository.updateById(id, companyDocuments);
    }

    @put('/company-documents/{id}')
    @response(204, {
        description: 'CompanyDocuments PUT success',
    })
    async replaceById(
        @param.path.number('id') id: number,
        @requestBody() companyDocuments: CompanyDocuments,
    ): Promise<void> {
        await this.companyDocumentsRepository.replaceById(id, companyDocuments);
    }

    @del('/company-documents/{id}')
    @response(204, {
        description: 'CompanyDocuments DELETE success',
    })
    async deleteById(@param.path.number('id') id: number): Promise<void> {
        await this.companyDocumentsRepository.deleteById(id);
    }
}
