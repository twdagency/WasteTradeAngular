import { inject, service } from '@loopback/core';
import { Count, CountSchema, Filter, FilterExcludingWhere, repository, Where } from '@loopback/repository';
import { del, get, getModelSchemaRef, param, patch, post, put, requestBody, response } from '@loopback/rest';
import { SecurityBindings, securityId, UserProfile } from '@loopback/security';
import { Companies, UpdateCompanyRequest } from '../models';
import { CompaniesRepository } from '../repositories';

import { authenticate } from '@loopback/authentication';
import { HttpErrors } from '@loopback/rest';
import { MyUserProfile } from '../authentication-strategies/type';
import { messagesOfCompany } from '../constants/company';
import { CompanyInterest } from '../enum';
import { AuthHelper } from '../helpers/auth.helper';
import { CompanyDocuments, CompanyLocations, CompanyUsers, User } from '../models';
import { CompanyDocumentsRepository, CompanyUsersRepository, UserRepository } from '../repositories';
import { CompanyService } from '../services/company.service';
import { CompanyUserListItem, IDataResponse, PaginationList } from '../types';

@authenticate('jwt')
export class CompanyController {
    constructor(
        @repository(CompaniesRepository)
        public companiesRepository: CompaniesRepository,

        @repository(UserRepository)
        public userRepository: UserRepository,

        @repository(CompanyUsersRepository)
        public companyUsersRepository: CompanyUsersRepository,

        @repository(CompanyDocumentsRepository)
        public companyDocumentsRepository: CompanyDocumentsRepository,

        @service(CompanyService)
        public companyService: CompanyService,
    ) {}

    @post('/companies')
    @response(200, {
        description: messagesOfCompany.createCompanySuccess,
        content: { 'application/json': { schema: getModelSchemaRef(Companies) } },
    })
    async create(
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(Companies, {
                        title: 'NewCompanies',
                        exclude: ['id'],
                    }),
                },
            },
        })
        companies: Omit<Companies, 'id'>,
    ): Promise<IDataResponse> {
        return this.companyService.createCompany(companies);
    }

    @get('/companies/count')
    @response(200, {
        description: 'Companies model count',
        content: { 'application/json': { schema: CountSchema } },
    })
    async count(@param.where(Companies) where?: Where<Companies>): Promise<Count> {
        return this.companiesRepository.count(where);
    }

    @get('/companies')
    @response(200, {
        description: 'Array of Companies model instances',
        content: {
            'application/json': {
                schema: {
                    type: 'array',
                    items: getModelSchemaRef(Companies, { includeRelations: true }),
                },
            },
        },
    })
    async find(@param.filter(Companies) filter?: Filter<Companies>): Promise<Companies[]> {
        return this.companiesRepository.find(filter);
    }

    @patch('/companies')
    @response(200, {
        description: 'Companies PATCH success count',
        content: { 'application/json': { schema: CountSchema } },
    })
    async updateAll(
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(Companies, { partial: true }),
                },
            },
        })
        companies: Companies,
        @param.where(Companies) where?: Where<Companies> & { id?: number },
    ): Promise<Count> {
        // Ensure consistency between companyInterest and isBuyer/isSeller for bulk updates
        if (companies.companyInterest) {
            companies.isBuyer =
                companies.companyInterest === CompanyInterest.BUYER ||
                companies.companyInterest === CompanyInterest.BOTH;
            companies.isSeller =
                companies.companyInterest === CompanyInterest.SELLER ||
                companies.companyInterest === CompanyInterest.BOTH;
        } else if (companies.isBuyer !== undefined || companies.isSeller !== undefined) {
            // For bulk updates, we can't easily get current values, so we require companyInterest to be explicit
            // if updating isBuyer/isSeller independently
            throw new HttpErrors[422](
                'When updating isBuyer or isSeller in bulk, companyInterest must also be provided for consistency',
            );
        }

        return this.companiesRepository.updateAll(companies, where);
    }

    @get('/companies/{id}')
    @response(200, {
        description: 'Companies model instance',
        content: {
            'application/json': {
                schema: getModelSchemaRef(Companies, { includeRelations: true }),
            },
        },
    })
    async findById(
        @param.path.number('id') id: number,
        @param.filter(Companies, { exclude: 'where' }) filter?: FilterExcludingWhere<Companies>,
    ): Promise<Companies> {
        return this.companiesRepository.findById(id, filter);
    }

    @get('/companies/by-vat-number/{vatNumber}/trading')
    @response(200, {
        description: 'Company by VAT number',
        content: { 'application/json': { schema: getModelSchemaRef(Companies) } },
    })
    async findByVATNumberTrading(@param.path.string('vatNumber') vatNumber: string): Promise<Companies> {
        return this.companyService.getCompanyByVATNumber(vatNumber, false);
    }

    @get('/companies/by-vat-number/{vatNumber}/haulage')
    @authenticate.skip()
    @response(200, {
        description: 'Company by VAT number',
        content: { 'application/json': { schema: getModelSchemaRef(Companies) } },
    })
    async findByVATNumber(@param.path.string('vatNumber') vatNumber: string): Promise<Companies> {
        return this.companyService.getCompanyByVATNumber(vatNumber, true);
    }

    @patch('/companies/{id}')
    @response(204, {
        description: 'Companies PATCH success',
    })
    async updateById(
        @inject(SecurityBindings.USER)
        currentUserProfile: MyUserProfile,
        @param.path.number('id')
        id: number,
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(UpdateCompanyRequest, { partial: true }),
                },
            },
        })
        company: UpdateCompanyRequest,
    ): Promise<void> {
        const userId = currentUserProfile[securityId];
        if (currentUserProfile?.companyId !== id) {
            AuthHelper.validateAdmin(currentUserProfile.globalRole);
        }
        await this.companyService.updateCompany(company, id, userId);
    }

    @put('/companies/{id}')
    @response(204, {
        description: 'Companies PUT success',
    })
    async replaceById(
        @inject(SecurityBindings.USER)
        currentUserProfile: MyUserProfile,
        @param.path.number('id') id: number,
        @requestBody() companies: Companies,
    ): Promise<void> {
        if (currentUserProfile?.companyId !== id) {
            AuthHelper.validateAdmin(currentUserProfile.globalRole);
        }

        // Ensure consistency between companyInterest and isBuyer/isSeller for full replacement
        if (companies.companyInterest) {
            companies.isBuyer =
                companies.companyInterest === CompanyInterest.BUYER ||
                companies.companyInterest === CompanyInterest.BOTH;
            companies.isSeller =
                companies.companyInterest === CompanyInterest.SELLER ||
                companies.companyInterest === CompanyInterest.BOTH;
        } else {
            // If companyInterest is not provided, derive it from isBuyer/isSeller
            if (companies.isBuyer && companies.isSeller) {
                companies.companyInterest = CompanyInterest.BOTH;
            } else if (companies.isSeller) {
                companies.companyInterest = CompanyInterest.SELLER;
            } else {
                companies.companyInterest = CompanyInterest.BUYER;
            }
        }

        await this.companiesRepository.replaceById(id, companies);
    }

    @del('/companies/{id}')
    @response(204, {
        description: 'Companies DELETE success',
    })
    async deleteById(@param.path.number('id') id: number): Promise<void> {
        await this.companiesRepository.deleteById(id);
    }

    @get('/companies/new-members')
    @response(200, {
        description: 'List of companies pending approval with pagination',
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        total: { type: 'number' },
                        data: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    company: getModelSchemaRef(Companies, { includeRelations: true }),
                                    users: {
                                        type: 'array',
                                        items: {
                                            type: 'object',
                                            properties: {
                                                companyUser: getModelSchemaRef(CompanyUsers),
                                                user: getModelSchemaRef(User, {
                                                    exclude: ['passwordHash', 'resetPasswordToken'],
                                                }),
                                            },
                                        },
                                    },
                                    documents: {
                                        type: 'array',
                                        items: getModelSchemaRef(CompanyDocuments),
                                    },
                                    locations: {
                                        type: 'array',
                                        items: getModelSchemaRef(CompanyLocations),
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    })
    async findPendingApproval(
        @inject(SecurityBindings.USER)
        currentUserProfile: UserProfile,
        @param.filter(Companies) filter?: Filter<Companies>,
    ): Promise<{
        total: number;
        data: Array<{
            user: {
                userId: number;
                companyId: number;
                name: string;
                companyType: string;
                companyName: string;
                companyCountry: string;
                registrationDate: string;
            };
            onboardingStatus: string;
            registrationStatus: string;
            overallStatus: string;
        }>;
    }> {
        const user = await this.userRepository.findById(Number(currentUserProfile[securityId]));
        AuthHelper.validateAdmin(user.globalRole);

        return this.companyService.getCompaniesDescending(filter);
    }

    @get('/companies/users')
    @response(200, {
        description: 'Get list of users in company with pagination',
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        totalCount: { type: 'number' },
                        results: {
                            type: 'array',
                            items: { type: 'object' },
                        },
                    },
                },
            },
        },
    })
    async getCompanyUsers(
        @inject(SecurityBindings.USER)
        currentUserProfile: MyUserProfile,
        @param.filter(User) filter?: Filter<User>,
        @param.query.string('searchTerm') searchTerm: string = '',
    ): Promise<PaginationList<CompanyUserListItem>> {
        return this.companyService.getCompanyUsers(filter ?? {}, searchTerm, currentUserProfile);
    }

    @get('/companies/users/search-for-reassignment')
    @authenticate('jwt')
    @response(200, {
        description: 'Search company users for reassignment with pagination',
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        totalCount: { type: 'number' },
                        results: {
                            type: 'array',
                            items: { type: 'object' },
                        },
                    },
                },
            },
        },
    })
    async searchUsersForReassignment(
        @inject(SecurityBindings.USER)
        currentUserProfile: MyUserProfile,
        @param.filter(User) filter?: Filter<User>,
        @param.query.string('searchTerm') searchTerm: string = '',
    ): Promise<PaginationList<CompanyUserListItem>> {
        return this.companyService.searchUsersForReassignment(filter, searchTerm, currentUserProfile);
    }

    @post('/companies/users/reassign')
    @authenticate('jwt')
    @response(200, {
        description: 'Reassign user data within company',
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                    },
                },
            },
        },
    })
    async reassignUser(
        @requestBody({
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        required: ['oldUserId', 'newUserId'],
                        properties: {
                            oldUserId: {
                                type: 'number',
                                description: 'User ID to transfer data from',
                            },
                            newUserId: {
                                type: 'number',
                                description: 'User ID to transfer data to',
                            },
                            companyId: {
                                type: 'number',
                                description: 'Company ID (required for global admin)',
                            },
                        },
                    },
                },
            },
        })
        request: {
            oldUserId: number;
            newUserId: number;
            companyId?: number;
        },
        @inject(SecurityBindings.USER) currentUser: MyUserProfile,
    ): Promise<{ success: boolean; message: string }> {
        const { oldUserId, newUserId, companyId } = request;
        return this.companyService.reassignUser(oldUserId, newUserId, companyId ?? currentUser.companyId, currentUser);
    }

    @post('/companies/users/remove-pending')
    @authenticate('jwt')
    @response(200, {
        description: 'Remove user pending request',
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                    },
                },
            },
        },
    })
    async removeUserPendingRequest(
        @requestBody({
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        required: ['userId'],
                        properties: {
                            userId: {
                                type: 'number',
                                description: 'User ID',
                            },
                            companyId: {
                                type: 'number',
                                description: 'Company ID',
                            },
                        },
                    },
                },
            },
        })
        request: {
            userId: number;
            companyId?: number;
        },
        @inject(SecurityBindings.USER) currentUser: MyUserProfile,
    ): Promise<{ success: boolean; message: string }> {
        const { userId, companyId } = request;
        return this.companyService.companyAdminRemoveUserPending(
            userId,
            companyId ?? currentUser.companyId,
            currentUser,
        );
    }

    @get('/companies/search-for-merge')
    @response(200, {
        description: 'Search companies for merge (Global Admin only)',
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        totalCount: { type: 'number' },
                        results: {
                            type: 'array',
                            items: getModelSchemaRef(Companies, { includeRelations: false }),
                        },
                    },
                },
            },
        },
    })
    async searchCompaniesForMerge(
        @inject(SecurityBindings.USER)
        currentUserProfile: MyUserProfile,
        @param.filter(Companies) filter?: Filter<Companies>,
        @param.query.string('searchTerm') searchTerm: string = '',
    ): Promise<PaginationList<Companies>> {
        return this.companyService.searchCompaniesForMerge(filter ?? {}, searchTerm, currentUserProfile);
    }

    @post('/companies/merge')
    @response(200, {
        description: 'Merge two companies into a master company (Global Admin only)',
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
    async mergeCompanies(
        @inject(SecurityBindings.USER)
        currentUserProfile: MyUserProfile,
        @requestBody({
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        required: ['masterCompanyId', 'mergedCompanyId'],
                        properties: {
                            masterCompanyId: {
                                type: 'number',
                                description: 'Company ID that will remain as the Master',
                            },
                            mergedCompanyId: {
                                type: 'number',
                                description: 'Company ID that will be merged into the Master and then deleted',
                            },
                        },
                    },
                },
            },
        })
        body: {
            masterCompanyId: number;
            mergedCompanyId: number;
        },
    ): Promise<IDataResponse> {
        return this.companyService.mergeCompanies(body.masterCompanyId, body.mergedCompanyId, currentUserProfile);
    }

    // *INFO: This endpoint is not used in the frontend, but it is kept here for future reference
    // @post('/companies/users/remove')
    @authenticate('jwt')
    @response(200, {
        description: 'Remove user from company',
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        success: { type: 'boolean' },
                        message: { type: 'string' },
                    },
                },
            },
        },
    })
    async removeUser(
        @requestBody({
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        required: ['userId', 'companyId'],
                        properties: {
                            userId: {
                                type: 'number',
                                description: 'User ID',
                            },
                            companyId: {
                                type: 'number',
                                description: 'Company ID',
                            },
                        },
                    },
                },
            },
        })
        request: {
            userId: number;
            companyId: number;
        },
        @inject(SecurityBindings.USER) currentUser: MyUserProfile,
    ): Promise<IDataResponse> {
        const { userId, companyId } = request;
        return this.companyService.removeUser(userId, companyId, currentUser);
    }
}
