import { authenticate } from '@loopback/authentication';
import { inject, service } from '@loopback/core';
import { Filter, repository } from '@loopback/repository';
import { get, param, post, requestBody, response } from '@loopback/rest';
import { SecurityBindings } from '@loopback/security';
import { MyUserProfile } from '../authentication-strategies/type';
import { AssignAdminDataType, UserRoleEnum } from '../enum';
import { AuthHelper } from '../helpers/auth.helper';
import { AssignAdmin } from '../models';
import { UserRepository } from '../repositories';
import { AssignAdminService } from '../services';
import { PaginationList } from '../types';

export class AssignAdminController {
    constructor(
        @service(AssignAdminService)
        public assignAdminService: AssignAdminService,
        @repository(UserRepository)
        public userRepository: UserRepository,
    ) {}

    @get('/admin-assignments')
    @authenticate('jwt')
    @response(200, {
        description: 'Get list of admins available for assignment',
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        totalCount: { type: 'number' },
                        results: {
                            type: 'array',
                            items: {
                                type: 'object',
                                properties: {
                                    id: { type: 'number' },
                                    firstName: { type: 'string' },
                                    lastName: { type: 'string' },
                                    email: { type: 'string' },
                                    globalRole: { type: 'string' },
                                },
                            },
                        },
                    },
                },
            },
        },
    })
    async getAdminsToAssign(
        @inject(SecurityBindings.USER) currentUser: MyUserProfile,
        @param.query.object('filter') filter?: Filter<Record<string, unknown>>,
    ): Promise<
        PaginationList<{
            id: number;
            firstName: string;
            lastName: string;
            email: string;
            globalRole: UserRoleEnum;
        }>
    > {
        AuthHelper.validateAdmin(currentUser.globalRole);
        return this.assignAdminService.getAdminsToAssign(filter);
    }

    @post('/admin-assignments')
    @authenticate('jwt')
    async assignAdmin(
        @inject(SecurityBindings.USER) currentUser: MyUserProfile,
        @requestBody({
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        required: ['dataId', 'dataType', 'assignedAdminId'],
                        properties: {
                            dataId: {
                                type: 'number',
                                description: 'ID of the object to assign admin',
                            },
                            dataType: {
                                type: 'string',
                                enum: Object.values(AssignAdminDataType),
                                description: 'Type of the data object',
                            },
                            assignedAdminId: {
                                type: 'number',
                                nullable: true,
                                description: 'ID of the admin to assign, or null to unassign',
                            },
                        },
                    },
                },
            },
        })
        data: {
            dataId: number;
            dataType: AssignAdminDataType;
            assignedAdminId: number | null;
        },
    ): Promise<AssignAdmin | null> {
        return this.assignAdminService.assignAdmin(data, currentUser);
    }
}
