import { authenticate } from '@loopback/authentication';
import { inject, service } from '@loopback/core';
import { Filter, repository } from '@loopback/repository';
import { get, getModelSchemaRef, param, post, Request, requestBody, response, RestBindings } from '@loopback/rest';
import { SecurityBindings } from '@loopback/security';
import { JWTAuthenticationStrategy } from '../authentication-strategies/jwt-strategy';
import { MyUserProfile } from '../authentication-strategies/type';
import { InviteUserToJoinCompany, User, UserRequestToJoinCompany } from '../models';
import { CompanyUserRequestsRepository } from '../repositories';
import { CompanyUserRequestsService } from '../services/company-user-requests.service';
import { IDataResponse, PaginationList } from '../types';
import { CompanyUserRequestListItem } from '../types/company-user-request';

@authenticate('jwt')
export class CompanyUserRequestsController {
    constructor(
        @repository(CompanyUserRequestsRepository)
        public companyUserRequestsRepository: CompanyUserRequestsRepository,

        @service(CompanyUserRequestsService)
        public companyUserRequestsService: CompanyUserRequestsService,

        @service(JWTAuthenticationStrategy)
        public jwtAuthenticationStrategy: JWTAuthenticationStrategy,
    ) {}

    @get('/company-user-requests')
    @response(200, {
        description: 'Get list of company user requests with pagination',
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
    async getCompanyUserRequests(
        @inject(SecurityBindings.USER)
        currentUser: MyUserProfile,
        @param.filter(User) filter?: Filter<User>,
    ): Promise<PaginationList<CompanyUserRequestListItem>> {
        return this.companyUserRequestsService.getCompanyUserRequests(filter, currentUser);
    }

    @post('/company-user-requests/request-to-join')
    @response(200, {
        description: 'Invite user to company',
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
    @authenticate.skip()
    async requestToJoinCompany(
        @inject(RestBindings.Http.REQUEST) request: Request,
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(UserRequestToJoinCompany),
                },
            },
        })
        requestToJoinCompanyRequest: UserRequestToJoinCompany,
    ): Promise<IDataResponse> {
        const authHeader = request.headers.authorization;

        if (authHeader) {
            const currentUser: MyUserProfile = await this.jwtAuthenticationStrategy.authenticate(request);

            return this.companyUserRequestsService.requestToJoinCompany(requestToJoinCompanyRequest, currentUser);
        }

        return this.companyUserRequestsService.requestToJoinCompany(requestToJoinCompanyRequest, null);
    }

    @post('/company-user-requests/invite')
    @response(200, {
        description: 'Invite user to company',
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
    async inviteUser(
        @inject(SecurityBindings.USER)
        currentUser: MyUserProfile,
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(InviteUserToJoinCompany),
                },
            },
        })
        inviteToJoinCompanyRequest: InviteUserToJoinCompany,
    ): Promise<IDataResponse> {
        return this.companyUserRequestsService.inviteToJoinCompany(inviteToJoinCompanyRequest, currentUser);
    }

    @post('/company-user-requests/resend-invitation')
    @response(200, {
        description: 'Invite user to company',
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
    async resendInvitation(
        @inject(SecurityBindings.USER)
        currentUser: MyUserProfile,
        @requestBody({
            content: {
                'application/json': {
                    userId: { type: 'number' },
                },
            },
        })
        inviteToJoinCompanyRequest: { userId: number },
    ): Promise<IDataResponse> {
        return this.companyUserRequestsService.companyAdminResendInvitation(
            inviteToJoinCompanyRequest.userId,
            currentUser,
        );
    }

    @post('/company-user-requests/{id}/approve')
    @response(200, {
        description: 'Approve company user request by userId',
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
    async approveRequest(
        @inject(SecurityBindings.USER)
        currentUser: MyUserProfile,
        @param.path.number('id') id: number,
    ): Promise<IDataResponse> {
        return this.companyUserRequestsService.companyAdminApproveRequestJoinCompany(id, currentUser);
    }

    @post('/company-user-requests/{id}/reject')
    @response(200, {
        description: 'Reject company user request by userId',
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
    async rejectRequest(
        @inject(SecurityBindings.USER)
        currentUser: MyUserProfile,
        @param.path.number('id') id: number,
    ): Promise<IDataResponse> {
        return this.companyUserRequestsService.companyAdminRejectRequestJoinCompany(id, currentUser);
    }
}
