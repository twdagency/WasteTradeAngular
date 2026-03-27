import { Count, CountSchema, Filter, FilterExcludingWhere, repository, Where } from '@loopback/repository';
import { post, param, get, getModelSchemaRef, patch, put, del, requestBody, response } from '@loopback/rest';
import { inject, service } from '@loopback/core';
import { SecurityBindings } from '@loopback/security';
import { authenticate } from '@loopback/authentication';
import { CompanyUsers } from '../models';
import { CompanyUsersRepository } from '../repositories';
import { CompanyUserService } from '../services/company-user.service';
import { MyUserProfile } from '../authentication-strategies/type';
import { CompanyUserRoleEnum } from '../enum';
import { IDataResponse } from '../types';
import { messagesOfCompanyUser } from '../constants/company-user';

@authenticate('jwt')
export class CompanyUserController {
    constructor(
        @repository(CompanyUsersRepository)
        public companyUsersRepository: CompanyUsersRepository,

        @service(CompanyUserService)
        public companyUserService: CompanyUserService,
    ) {}

    @post('/company-users')
    @response(200, {
        description: messagesOfCompanyUser.createCompanyUserSuccess,
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
                                companyUser: { type: 'object', properties: getModelSchemaRef(CompanyUsers) },
                            },
                        },
                    },
                    required: ['status', 'message', 'data'],
                },
            },
        },
    })
    async create(
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(CompanyUsers, {
                        title: 'NewCompanyUsers',
                        exclude: ['id'],
                    }),
                },
            },
        })
        companyUsers: Omit<CompanyUsers, 'id'>,
    ): Promise<IDataResponse> {
        return this.companyUserService.createCompanyUser(companyUsers);
    }

    @get('/company-users/count')
    @response(200, {
        description: 'CompanyUsers model count',
        content: { 'application/json': { schema: CountSchema } },
    })
    async count(@param.where(CompanyUsers) where?: Where<CompanyUsers>): Promise<Count> {
        return this.companyUsersRepository.count(where);
    }

    @get('/company-users')
    @response(200, {
        description: 'Array of CompanyUsers model instances',
        content: {
            'application/json': {
                schema: {
                    type: 'array',
                    items: getModelSchemaRef(CompanyUsers, { includeRelations: true }),
                },
            },
        },
    })
    async find(@param.filter(CompanyUsers) filter?: Filter<CompanyUsers>): Promise<CompanyUsers[]> {
        return this.companyUsersRepository.find(filter);
    }

    @patch('/company-users')
    @response(200, {
        description: 'CompanyUsers PATCH success count',
        content: { 'application/json': { schema: CountSchema } },
    })
    async updateAll(
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(CompanyUsers, { partial: true }),
                },
            },
        })
        companyUsers: CompanyUsers,
        @param.where(CompanyUsers) where?: Where<CompanyUsers>,
    ): Promise<Count> {
        return this.companyUsersRepository.updateAll(companyUsers, where);
    }

    @get('/company-users/{id}')
    @response(200, {
        description: 'CompanyUsers model instance',
        content: {
            'application/json': {
                schema: getModelSchemaRef(CompanyUsers, { includeRelations: true }),
            },
        },
    })
    async findById(
        @param.path.number('id') id: number,
        @param.filter(CompanyUsers, { exclude: 'where' }) filter?: FilterExcludingWhere<CompanyUsers>,
    ): Promise<CompanyUsers> {
        return this.companyUsersRepository.findById(id, filter);
    }

    @patch('/company-users/{id}')
    @response(204, {
        description: 'CompanyUsers PATCH success',
    })
    async updateById(
        @param.path.number('id') id: number,
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(CompanyUsers, { partial: true }),
                },
            },
        })
        companyUsers: CompanyUsers,
    ): Promise<void> {
        await this.companyUsersRepository.updateById(id, companyUsers);
    }

    @put('/company-users/{id}')
    @response(204, {
        description: 'CompanyUsers PUT success',
    })
    async replaceById(@param.path.number('id') id: number, @requestBody() companyUsers: CompanyUsers): Promise<void> {
        await this.companyUsersRepository.replaceById(id, companyUsers);
    }

    @del('/company-users/{id}')
    @response(204, {
        description: 'CompanyUsers DELETE success',
    })
    async deleteById(@param.path.number('id') id: number): Promise<void> {
        await this.companyUsersRepository.deleteById(id);
    }

    @patch('/company-users/assign-role')
    @response(200, {
        description: 'Assign role to company user',
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
                                userId: { type: 'number' },
                                newRole: { type: 'string' },
                            },
                        },
                    },
                },
            },
        },
    })
    async assignRole(
        @inject(SecurityBindings.USER)
        currentUserProfile: MyUserProfile,
        @requestBody({
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        required: ['userId', 'role'],
                        properties: {
                            userId: { type: 'number' },
                            role: {
                                type: 'string',
                                enum: Object.values(CompanyUserRoleEnum),
                            },
                        },
                    },
                },
            },
        })
        payload: { userId: number; role: CompanyUserRoleEnum },
    ): Promise<IDataResponse> {
        return this.companyUserService.assignRole(payload.userId, payload.role, currentUserProfile);
    }
}
