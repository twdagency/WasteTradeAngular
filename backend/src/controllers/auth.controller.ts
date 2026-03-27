import { authenticate } from '@loopback/authentication';
import { inject, service } from '@loopback/core';
import { repository } from '@loopback/repository';
import { get, getModelSchemaRef, post, Request, requestBody, response, Response } from '@loopback/rest';
import { SecurityBindings, securityId, UserProfile } from '@loopback/security';
import { CredentialsRequestBody, UserProfileSchema } from '../constants/user';
import { UrlTypeEnum } from '../enum';
import { forgotPasswordCheckBlockedEmail } from '../middleware/forgot-password-rate-limit';
import { CompanyDocuments, CompanyUsers, ForgotPasswordRequest, ResetPasswordRequest, User } from '../models';
import { RegisterHaulierRequest } from '../models/register-haulier-request.model';
import { RegisterTradingRequest } from '../models/register-trading-request.model';
import { UserRepository } from '../repositories';
import { Credentials } from '../repositories/user.repository';
import { AuthService } from '../services/auth.service';
import { CompanyUserRequestsService } from '../services/company-user-requests.service';
import { MyUserService } from '../services/user.service';
import { IDataResponse } from '../types';
import { ILoginResponseData } from '../types/auth';
import { OPERATION_SECURITY_SPEC } from '../utils/security-spec';
import { Companies } from './../models/companies.model';

export class V1AuthController {
    constructor(
        @repository(UserRepository)
        public userRepository: UserRepository,

        @service(AuthService)
        public authService: AuthService,
        @service(MyUserService)
        public userService: MyUserService,
        @service(CompanyUserRequestsService)
        public companyUserRequestsService: CompanyUserRequestsService,
    ) {}

    @post('/login')
    @response(201, {
        security: OPERATION_SECURITY_SPEC,
        description: 'Login successfully',
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
                                id: {
                                    type: 'number',
                                    example: 1,
                                },
                                email: {
                                    type: 'string',
                                    example: 'user@example.com',
                                },
                                accessToken: {
                                    type: 'string',
                                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                                },
                                globalRole: {
                                    type: 'string',
                                    example: 'user',
                                },
                                isHaulier: {
                                    type: 'boolean',
                                    example: false,
                                },
                            },
                        },
                    },
                    required: ['status', 'message', 'data'],
                },
            },
        },
    })
    async login(
        @requestBody(CredentialsRequestBody) credentials: Credentials,
    ): Promise<IDataResponse<ILoginResponseData>> {
        return this.authService.login(credentials);
    }

    @get('/logout', {
        security: OPERATION_SECURITY_SPEC,
        responses: {
            '200': {
                description: 'Logout',
                content: {
                    'application/json': {
                        schema: UserProfileSchema,
                    },
                },
            },
        },
    })
    @authenticate('jwt')
    async logout(
        @inject(SecurityBindings.USER)
        currentUserProfile: UserProfile,
    ): Promise<User> {
        const userId: string = currentUserProfile[securityId];
        const userDetail: User = await this.userRepository.findById(Number(userId));
        return userDetail;
    }

    @post('/forgot-password')
    @response(204, {
        description: 'Reset password success',
    })
    async forgotPassword(
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(ForgotPasswordRequest, {
                        title: 'ForgotPassword',
                    }),
                },
            },
        })
        forgotPasswordRequest: ForgotPasswordRequest,
        @inject('rest.http.request') req: Request,
        @inject('rest.http.response') res: Response,
    ): Promise<void> {
        await forgotPasswordCheckBlockedEmail(req, res, () => {});

        const invalidEmailError = 'email-address-is-not-registered-please-check-again';
        const { email = '' } = forgotPasswordRequest;
        const foundUser = await this.userRepository.findOne({
            where: { email },
        });

        if (!foundUser?.id) {
            // Not throw error here, just log it
            // throw new HttpErrors.NotFound(invalidEmailError);
            console.log(invalidEmailError);
        } else {
            try {
                await this.userService.forgetPassword(foundUser, {
                    urlType: UrlTypeEnum.RESET_PASSWORD,
                    isCreatedAdmin: false,
                });
            } catch (error) {
                // Not throw error here, just log it
                // throw new HttpErrors.UnprocessableEntity((error as Error).message);
                console.log((error as Error).message);
            }
        }
    }

    @post('/reset-password')
    @response(204, {
        description: 'Reset password success',
    })
    async resetPassword(
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(ResetPasswordRequest, {
                        title: 'ResetPassword',
                    }),
                },
            },
        })
        resetPasswordRequest: ResetPasswordRequest,
    ): Promise<void> {
        switch (resetPasswordRequest.urlType) {
            case UrlTypeEnum.RESET_PASSWORD:
                return this.userService.resetPassword(resetPasswordRequest);

            case UrlTypeEnum.INVITE_JOIN_COMPANY:
            case UrlTypeEnum.REQUEST_JOIN_COMPANY:
                return this.companyUserRequestsService.setPasswordJoinCompany(resetPasswordRequest);

            default:
                return this.userService.resetPassword(resetPasswordRequest);
        }
    }

    @post('/register-trading')
    @response(200, {
        description: 'Register user successfully',
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
                                user: getModelSchemaRef(User),
                                company: getModelSchemaRef(Companies),
                                companyUser: getModelSchemaRef(CompanyUsers),
                                accessToken: {
                                    type: 'string',
                                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                                },
                            },
                        },
                    },
                    required: ['status', 'message', 'data'],
                },
            },
        },
    })
    async registerTrading(
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(RegisterTradingRequest),
                },
            },
        })
        registerRequest: RegisterTradingRequest,
    ): Promise<IDataResponse> {
        return this.authService.registerTrading(registerRequest);
    }

    @post('/register-haulier')
    @response(200, {
        description: 'Register user successfully',
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
                                user: getModelSchemaRef(User),
                                company: getModelSchemaRef(Companies),
                                companyUser: getModelSchemaRef(CompanyUsers),
                                companyDocument: getModelSchemaRef(CompanyDocuments),
                                accessToken: {
                                    type: 'string',
                                    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
                                },
                            },
                        },
                    },
                    required: ['status', 'message', 'data'],
                },
            },
        },
    })
    async registerHaulier(
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(RegisterHaulierRequest),
                },
            },
        })
        registerRequest: RegisterHaulierRequest,
    ): Promise<IDataResponse> {
        return this.authService.registerHaulier(registerRequest);
    }
}
