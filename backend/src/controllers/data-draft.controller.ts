import { authenticate } from '@loopback/authentication';
import { inject, service } from '@loopback/core';
import { repository } from '@loopback/repository';
import { get, param, post, Request, requestBody, response, RestBindings } from '@loopback/rest';
import { SecurityBindings, UserProfile } from '@loopback/security';
import { MyUserProfile } from '../authentication-strategies/type';
import { DataDraftExpiryCronjob } from '../components/Cronjobs';
import { AuthHelper } from '../helpers/auth.helper';
import { DataDraftRepository, UserRepository } from '../repositories';
import { DataDraftExpiryService, DataDraftService } from '../services';
import { IUserLoginData } from '../types/auth';
import { IDataResponse } from '../types/common';
import { JWTAuthenticationStrategy } from '../authentication-strategies/jwt-strategy';

@authenticate('jwt')
export class DataDraftController {
    constructor(
        @repository(DataDraftRepository)
        public dataDraftRepository: DataDraftRepository,
        @repository(UserRepository)
        public userRepository: UserRepository,

        @service(DataDraftService)
        public dataDraftService: DataDraftService,

        @service(JWTAuthenticationStrategy)
        public jwtAuthenticationStrategy: JWTAuthenticationStrategy,
        @service(DataDraftExpiryService)
        public dataDraftExpiryService: DataDraftExpiryService,
    ) {}

    @post('/data-drafts')
    @response(200, {
        description: 'Create a new data draft',
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        status: { type: 'string' },
                        message: { type: 'string' },
                        data: {
                            type: 'null',
                        },
                    },
                },
            },
        },
    })
    @authenticate.skip()
    async create(
        @inject(RestBindings.Http.REQUEST) request: Request,
        @requestBody({
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        required: ['data'],
                        properties: {
                            email: {
                                type: 'string',
                                description: 'Email to save the draft for',
                            },
                            data: {
                                type: 'object',
                                description: 'Stringified JSON data',
                            },
                            isAuto: {
                                type: 'boolean',
                                description: 'Is auto save',
                            },
                        },
                    },
                },
            },
        })
        dataDraftRequest: { email: string; data: unknown; isAuto?: boolean },
    ): Promise<IDataResponse<null>> {
        const authHeader = request.headers.authorization;

        // Draft for authenticated user
        if (authHeader) {
            const currentUserProfile: MyUserProfile = await this.jwtAuthenticationStrategy.authenticate(request);

            return this.dataDraftService.saveDataDraft(
                dataDraftRequest.data,
                dataDraftRequest.isAuto,
                currentUserProfile,
            );
        }

        // Draft for anonymous user (registering new account)
        return this.dataDraftService.saveDataDraft(dataDraftRequest.data, dataDraftRequest.isAuto, {
            email: dataDraftRequest.email,
        });
    }

    @get('/data-drafts/latest')
    @response(200, {
        description: 'Get all data drafts with pagination',
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
                                dataDraft: { type: 'object' },
                                userLoginData: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'number' },
                                        email: { type: 'string' },
                                        accessToken: { type: 'string' },
                                        globalRole: { type: 'string' },
                                        isHaulier: { type: 'boolean' },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    })
    @authenticate.skip()
    async getLatestDataDraft(
        @param.query.string('token') token: string,
    ): Promise<IDataResponse<{ dataDraft: unknown; userLoginData: IUserLoginData | null } | null>> {
        return this.dataDraftService.getLatestDataDraft(token);
    }

    @post('/data-drafts/cleanup-expired')
    @response(200, {
        description: 'Manually trigger cleanup of expired data drafts (Admin only)',
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
                                deleted: { type: 'number' },
                                s3FilesDeleted: { type: 'number' },
                                errors: {
                                    type: 'array',
                                    items: { type: 'string' },
                                },
                            },
                        },
                    },
                },
            },
        },
    })
    async cleanupExpiredDrafts(
        @inject(SecurityBindings.USER)
        currentUserProfile: UserProfile,
    ): Promise<IDataResponse<{ deleted: number; s3FilesDeleted: number; errors: string[] }>> {
        // Check if user is admin
        const user = await this.userRepository.findById(currentUserProfile.id);
        const globalRole = user.globalRole;

        AuthHelper.validateSuperAdmin(globalRole);

        console.log('Manually triggering data draft expiry cleanup...');
        const result = await this.dataDraftExpiryService.deleteExpiredDrafts();

        const message =
            result.s3FilesDeleted > 0
                ? `Cleanup completed. Deleted ${result.deleted} expired drafts and ${result.s3FilesDeleted} orphaned S3 files`
                : `Cleanup completed. Deleted ${result.deleted} expired drafts`;

        return {
            status: 'success',
            message,
            data: result,
        };
    }
}
