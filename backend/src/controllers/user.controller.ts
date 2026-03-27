import { authenticate } from '@loopback/authentication';
import { inject, service } from '@loopback/core';
import { Count, CountSchema, Filter, FilterExcludingWhere, repository, Where } from '@loopback/repository';
import { del, get, getModelSchemaRef, param, patch, post, put, requestBody, response } from '@loopback/rest';
import { SecurityBindings } from '@loopback/security';
import { omit } from 'lodash';
import { MyUserProfile } from '../authentication-strategies/type';
import { AuthHelper } from '../helpers/auth.helper';
import { User } from '../models';
import { CompanyDocumentsRepository, CompanyUsersRepository, UserRepository } from '../repositories';
import { MyUserService } from '../services';
import { IDataResponse, PaginationList, UserListItem } from '../types';

@authenticate('jwt')
export class UserController {
    constructor(
        @repository(UserRepository)
        public userRepository: UserRepository,
        @repository(CompanyUsersRepository)
        public companyUsersRepository: CompanyUsersRepository,
        @repository(CompanyDocumentsRepository)
        public companyDocumentsRepository: CompanyDocumentsRepository,
        @service(MyUserService)
        public myUserService: MyUserService,
    ) {}

    @post('/users')
    @response(200, {
        description: 'User model instance',
        content: { 'application/json': { schema: getModelSchemaRef(User) } },
    })
    async create(
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(User, {
                        title: 'NewUser',
                        exclude: ['id'],
                    }),
                },
            },
        })
        user: Omit<User, 'id'>,
    ): Promise<User> {
        return this.userRepository.create(user);
    }

    @get('/users')
    @response(200, {
        description: 'Array of users with pagination',
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        totalCount: { type: 'number' },
                        results: { type: 'array', items: { type: 'object' } },
                    },
                },
            },
        },
    })
    async getUsers(
        @inject(SecurityBindings.USER)
        currentUserProfile: MyUserProfile,
        @param.filter(User) filter?: Filter<User>,
        @param.query.string('search') search?: string,
    ): Promise<PaginationList<UserListItem>> {
        AuthHelper.validateAdmin(currentUserProfile.globalRole);
        return this.myUserService.getUsers(filter, search);
    }

    @get('/users/count-tabs')
    @response(200, {
        description: 'Array of users with pagination',
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        totalCount: { type: 'number' },
                        results: { type: 'array', items: { type: 'object' } },
                    },
                },
            },
        },
    })
    async getUsersCountTabs(
        @inject(SecurityBindings.USER)
        currentUserProfile: MyUserProfile,
        @param.filter(User) filter?: Filter<User>,
        @param.query.string('search') search?: string,
    ): Promise<
        IDataResponse<{
            all: number;
            unverified: number;
            verified: number;
            rejected: number;
            inactive: number;
            blocked: number;
        }>
    > {
        AuthHelper.validateAdmin(currentUserProfile.globalRole);
        return this.myUserService.getUsersCountTabs();
    }

    @get('/users/me')
    @response(200, {
        description: 'User profile with company information',
        content: {
            'application/json': {
                schema: getModelSchemaRef(User, { includeRelations: true }),
            },
        },
    })
    async getProfile(
        @inject(SecurityBindings.USER)
        currentUserProfile: MyUserProfile,
    ): Promise<IDataResponse> {
        // Get user first
        const user = await this.userRepository.findById(currentUserProfile.id);

        // If companyId is 0 or not set, find the latest company-user relation for this user
        let companyUser = null;
        let companyDocuments: any[] = [];

        if (currentUserProfile.companyId && currentUserProfile.companyId > 0) {
            // Use companyId from token if valid
            [companyUser, companyDocuments] = await Promise.all([
                this.companyUsersRepository.findOne({
                    where: { userId: currentUserProfile.id, companyId: currentUserProfile.companyId },
                    include: ['company', 'user'],
                }),
                this.companyDocumentsRepository.find({ where: { companyId: currentUserProfile.companyId } }),
            ]);
        } else {
            // Find latest company-user relation if token has no valid companyId
            companyUser = await this.companyUsersRepository.findOne({
                where: { userId: currentUserProfile.id },
                include: ['company', 'user'],
                order: ['createdAt DESC'],
            });

            if (companyUser && companyUser.companyId) {
                companyDocuments = await this.companyDocumentsRepository.find({
                    where: { companyId: companyUser.companyId },
                });
            }
        }

        return {
            status: 'success',
            message: 'get-user-info',
            data: {
                companyUser: {
                    ...(companyUser ?? {}),
                    user: { ...omit(companyUser?.user ?? user, ['passwordHash', 'resetPasswordToken']) },
                },
                companyDocuments,
            },
        };
    }

    @patch('/users')
    @response(200, {
        description: 'User PATCH success count',
        content: { 'application/json': { schema: CountSchema } },
    })
    async updateAll(
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(User, { partial: true }),
                },
            },
        })
        user: User,
        @param.where(User) where?: Where<User>,
    ): Promise<Count> {
        return this.userRepository.updateAll(user, where);
    }

    @get('/users/{id}')
    @response(200, {
        description: 'User model instance',
        content: {
            'application/json': {
                schema: getModelSchemaRef(User, { includeRelations: true }),
            },
        },
    })
    async findById(
        @param.path.number('id') id: number,
        @param.filter(User, { exclude: 'where' }) filter?: FilterExcludingWhere<User>,
    ): Promise<User> {
        return this.userRepository.findById(id, filter);
    }

    @patch('/users/me')
    @response(204, {
        description: 'User PATCH Profile success',
    })
    async updateProfile(
        @inject(SecurityBindings.USER)
        currentUserProfile: MyUserProfile,
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(User, { partial: true }),
                },
            },
        })
        user: User,
    ): Promise<void> {
        await this.myUserService.updateProfile(user, currentUserProfile);
    }

    @patch('/users/{id}')
    @response(204, {
        description: 'User PATCH success',
    })
    async updateById(
        @param.path.number('id') id: number,
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(User, { partial: true }),
                },
            },
        })
        user: User,
    ): Promise<void> {
        await this.userRepository.updateById(id, user);
    }

    @put('/users/{id}')
    @response(204, {
        description: 'User PUT success',
    })
    async replaceById(@param.path.number('id') id: number, @requestBody() user: User): Promise<void> {
        await this.userRepository.replaceById(id, user);
    }

    @del('/users/{id}')
    @response(204, {
        description: 'User DELETE success',
    })
    async deleteById(@param.path.number('id') id: number): Promise<void> {
        await this.userRepository.deleteById(id);
    }

    @get('/users/admin/{id}')
    @response(200, {
        description: 'User model instance',
        content: {
            'application/json': {
                schema: getModelSchemaRef(User, { includeRelations: true }),
            },
        },
    })
    async getUserInfoByAdmin(
        @inject(SecurityBindings.USER)
        currentUserProfile: MyUserProfile,
        @param.path.number('id') id: number,
    ): Promise<IDataResponse> {
        AuthHelper.validateAdmin(currentUserProfile.globalRole);

        return this.myUserService.getUserInfoByAdmin(id);
    }

    @patch('/users/admin/{id}/{requestAction}')
    @response(200, {
        description: 'User model instance',
        content: {
            'application/json': {
                schema: getModelSchemaRef(User, { includeRelations: true }),
            },
        },
    })
    async adminRequestAction(
        @inject(SecurityBindings.USER)
        currentUserProfile: MyUserProfile,
        @param.path.number('id') id: number,
        @param.path.string('requestAction') requestAction: string,
        @requestBody({
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            rejectReason: {
                                type: 'string',
                                nullable: true,
                            },
                            message: {
                                type: 'string',
                                nullable: true,
                            },
                            infoRequestType: {
                                type: 'string',
                                nullable: true,
                            },
                        },
                    },
                },
            },
        })
        body: { rejectReason?: string; message?: string; infoRequestType?: string },
    ): Promise<void> {
        AuthHelper.validateAdmin(currentUserProfile.globalRole);

        const adminId = currentUserProfile.id;
        await this.myUserService.adminRequestAction(id, requestAction, body, adminId);
    }
}
