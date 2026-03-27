import { authenticate } from '@loopback/authentication';
import { inject, service } from '@loopback/core';
import { Count, CountSchema, Filter, FilterExcludingWhere, repository, Where } from '@loopback/repository';
import { del, get, getModelSchemaRef, param, patch, post, put, requestBody, response } from '@loopback/rest';
import { SecurityBindings } from '@loopback/security';
import { MyUserProfile } from '../authentication-strategies/type';
import { messagesOfCompanyLocation } from '../constants/company-location';
import { CompanyLocationDocuments, CompanyLocations } from '../models';
import { CompanyLocationsRepository } from '../repositories';
import { CompanyLocationService } from '../services/company-location.service';
import { IDataResponse, PaginationList } from '../types';

@authenticate('jwt')
export class CompanyLocationsController {
    constructor(
        @repository(CompanyLocationsRepository)
        public companyLocationsRepository: CompanyLocationsRepository,

        @service(CompanyLocationService)
        public companyLocationService: CompanyLocationService,
    ) {}

    @post('/company-locations')
    @response(200, {
        description: messagesOfCompanyLocation.createCompanyLocationSuccess,
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
                                companyLocation: getModelSchemaRef(CompanyLocations),
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
                    schema: {
                        type: 'object',
                        properties: {
                            ...(getModelSchemaRef(CompanyLocations, {
                                title: 'NewCompanyLocations',
                                exclude: ['id'],
                            }).definitions?.NewCompanyLocations?.properties ?? {}),
                            companyLocationDocuments: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                },
                            },
                        },
                    },
                },
            },
        })
        companyLocationRequest: Omit<CompanyLocations, 'id'> & {
            companyLocationDocuments: CompanyLocationDocuments[];
        },
    ): Promise<IDataResponse<{ companyLocation: CompanyLocations } | null>> {
        const { companyLocationDocuments, ...companyLocation } = companyLocationRequest;

        return this.companyLocationService.createCompanyLocation(
            companyLocation,
            companyLocationDocuments,
            currentUserProfile,
        );
    }

    @get('/company-locations/count')
    @response(200, {
        description: 'CompanyLocations model count',
        content: { 'application/json': { schema: CountSchema } },
    })
    async count(@param.where(CompanyLocations) where?: Where<CompanyLocations>): Promise<Count> {
        return this.companyLocationsRepository.count(where);
    }

    @get('/company-locations')
    @response(200, {
        description: 'Array of CompanyLocations model instances',
        content: {
            'application/json': {
                schema: {
                    type: 'array',
                    items: getModelSchemaRef(CompanyLocations, { includeRelations: true }),
                },
            },
        },
    })
    async find(
        @inject(SecurityBindings.USER)
        currentUserProfile: MyUserProfile,
        @param.filter(CompanyLocations) filter: Filter<CompanyLocations>,
    ): Promise<PaginationList<CompanyLocations>> {
        return this.companyLocationService.getCompanyLocationList(filter, currentUserProfile);
    }

    @patch('/company-locations')
    @response(200, {
        description: 'CompanyLocations PATCH success count',
        content: { 'application/json': { schema: CountSchema } },
    })
    async updateAll(
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(CompanyLocations, { partial: true }),
                },
            },
        })
        companyLocations: CompanyLocations,
        @param.where(CompanyLocations) where?: Where<CompanyLocations>,
    ): Promise<Count> {
        return this.companyLocationsRepository.updateAll(companyLocations, where);
    }

    @get('/company-locations/{id}')
    @response(200, {
        description: 'CompanyLocations model instance',
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        ...getModelSchemaRef(CompanyLocations, { includeRelations: true }).definitions?.CompanyLocations
                            ?.properties,
                        companyLocationDocuments: {
                            type: 'array',
                            items: getModelSchemaRef(CompanyLocationDocuments),
                        },
                    },
                },
            },
        },
    })
    async findById(
        @param.path.number('id') id: number,
        @param.filter(CompanyLocations, { exclude: 'where' }) filter?: FilterExcludingWhere<CompanyLocations>,
    ): Promise<CompanyLocations & { companyLocationDocuments: CompanyLocationDocuments[] }> {
        const companyLocation = await this.companyLocationsRepository.findById(id, filter);

        const companyLocationDocuments = await this.companyLocationService.companyLocationDocumentsRepository.find({
            where: {
                companyLocationId: id,
            },
        });

        return {
            ...companyLocation,
            companyLocationDocuments: (companyLocationDocuments || []) as CompanyLocationDocuments[],
        } as CompanyLocations & { companyLocationDocuments: CompanyLocationDocuments[] };
    }

    @patch('/company-locations/{id}')
    @response(204, {
        description: 'CompanyLocations PATCH success',
    })
    async updateById(
        @param.path.number('id') id: number,
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(CompanyLocations, { partial: true }),
                },
            },
        })
        companyLocations: CompanyLocations,
    ): Promise<void> {
        await this.companyLocationsRepository.updateById(id, companyLocations);
    }

    @put('/company-locations/{id}')
    @response(204, {
        description: 'CompanyLocations PUT success',
    })
    async replaceById(
        @inject(SecurityBindings.USER)
        currentUserProfile: MyUserProfile,
        @param.path.number('id') id: number,
        @requestBody({
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            ...(getModelSchemaRef(CompanyLocations, {
                                title: 'UpdateCompanyLocations',
                                exclude: ['id'],
                            }).definitions?.NewCompanyLocations?.properties ?? {}),
                            companyLocationDocuments: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                },
                            },
                        },
                    },
                },
            },
        })
        companyLocationRequest: Omit<CompanyLocations, 'id'> & {
            companyLocationDocuments: CompanyLocationDocuments[];
        },
    ): Promise<void> {
        const { companyLocationDocuments, ...companyLocation } = companyLocationRequest;

        await this.companyLocationService.updateCompanyLocation(
            id,
            companyLocation,
            companyLocationDocuments,
            currentUserProfile,
        );
    }

    @del('/company-locations/{id}')
    @response(204, {
        description: 'CompanyLocations DELETE success',
    })
    async deleteById(@param.path.number('id') id: number): Promise<void> {
        await this.companyLocationsRepository.deleteById(id);
    }
}
