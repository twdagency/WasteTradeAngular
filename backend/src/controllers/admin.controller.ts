import { authenticate } from '@loopback/authentication';
import { inject, service } from '@loopback/core';
import { Filter, repository } from '@loopback/repository';
import { get, getModelSchemaRef, HttpErrors, param, patch, post, requestBody, response } from '@loopback/rest';
import { SecurityBindings, UserProfile } from '@loopback/security';
import { MyUserProfile } from '../authentication-strategies/type';
import { UserStatus } from '../enum';
import { AuthHelper } from '../helpers/auth.helper';
import { User } from '../models';
import { UserRepository } from '../repositories';
import { AdminService } from '../services';
import { StatusService } from '../services/status.service';
import { IDataResponse, PaginationList } from '../types';

@authenticate('jwt')
export class AdminController {
    constructor(
        @service(AdminService)
        public adminService: AdminService,
        @service(StatusService)
        public statusService: StatusService,
        @repository(UserRepository)
        public userRepository: UserRepository,
    ) {}

    @get('/admins')
    @response(200, {
        description: 'Array of admins with pagination',
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        totalCount: { type: 'number' },
                        results: {
                            type: 'array',
                            items: getModelSchemaRef(User, { includeRelations: true }),
                        },
                    },
                },
            },
        },
    })
    async getAdmins(
        @inject(SecurityBindings.USER)
        currentUserProfile: MyUserProfile,
        @param.filter(User) filter?: Filter<User>,
    ): Promise<PaginationList<Partial<User>>> {
        return this.adminService.getAdmins(currentUserProfile, filter);
    }

    @get('/admins/{id}')
    @response(200, {
        description: 'Admin detail',
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        status: { type: 'string' },
                        message: { type: 'string' },
                        data: getModelSchemaRef(User, { includeRelations: true }),
                    },
                },
            },
        },
    })
    async getAdminDetail(
        @inject(SecurityBindings.USER)
        currentUserProfile: MyUserProfile,
        @param.path.number('id') id: number,
    ): Promise<IDataResponse<Partial<User>>> {
        return this.adminService.getAdminDetail(id, currentUserProfile);
    }

    @post('/admins')
    @response(200, {
        description: 'Create Admin Successfully',
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        status: { type: 'string' },
                        message: { type: 'string' },
                        data: { type: 'null' },
                    },
                },
            },
        },
    })
    async createAdmin(
        @inject(SecurityBindings.USER)
        currentUserProfile: MyUserProfile,
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(User, {
                        title: 'NewUserAdmin',
                        exclude: [
                            'id',
                            'passwordHash',
                            'isVerified',
                            'status',
                            'notificationEmailEnabled',
                            'notificationPushEnabled',
                            'notificationInAppEnabled',
                        ],
                    }),
                },
            },
        })
        user: Omit<User, 'id'>,
    ): Promise<IDataResponse<{ id: number }>> {
        return this.adminService.createAdmin(user, currentUserProfile);
    }

    @post('/admins/{id}')
    @response(200, {
        description: 'Edit Admin Successfully',
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        status: { type: 'string' },
                        message: { type: 'string' },
                        data: { type: 'null' },
                    },
                },
            },
        },
    })
    async editAdmin(
        @inject(SecurityBindings.USER)
        currentUserProfile: MyUserProfile,
        @param.path.number('id') id: number,
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(User, {
                        title: 'EditUserAdmin',
                        exclude: [
                            'id',
                            'passwordHash',
                            'isVerified',
                            'status',
                            'notificationEmailEnabled',
                            'notificationPushEnabled',
                            'notificationInAppEnabled',
                        ],
                        partial: true,
                    }),
                },
            },
        })
        user: Partial<User>,
    ): Promise<IDataResponse<null>> {
        return this.adminService.editAdmin(id, user, currentUserProfile);
    }

    @patch('/admins/{id}/{status}')
    @response(200, {
        description: 'Archive or Active Admin Successfully',
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        status: { type: 'string' },
                        message: { type: 'string' },
                        data: { type: 'null' },
                    },
                },
            },
        },
    })
    async archiveOrActiveAdmin(
        @inject(SecurityBindings.USER)
        currentUserProfile: MyUserProfile,
        @param.path.number('id') id: number,
        @param.path.string('status') status: UserStatus,
    ): Promise<IDataResponse<null>> {
        return this.adminService.archiveOrActiveAdmin(id, status, currentUserProfile);
    }

    /**
     * Get system-defined status and state catalogue
     * Task: 6.4.1.20. System Defined Status & State
     */
    @get('/admin/status-catalogue')
    @response(200, {
        description: 'System-defined statuses and states',
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
                                listingStatuses: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            value: { type: 'string' },
                                            label: { type: 'string' },
                                        },
                                    },
                                },
                                wantedListingStatuses: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            value: { type: 'string' },
                                            label: { type: 'string' },
                                        },
                                    },
                                },
                                tradeBidStatuses: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            value: { type: 'string' },
                                            label: { type: 'string' },
                                        },
                                    },
                                },
                                haulageBidStatuses: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            value: { type: 'string' },
                                            label: { type: 'string' },
                                        },
                                    },
                                },
                                adminStates: {
                                    type: 'array',
                                    items: {
                                        type: 'object',
                                        properties: {
                                            value: { type: 'string' },
                                            label: { type: 'string' },
                                        },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        },
    })
    async getStatusCatalogue(
        @inject(SecurityBindings.USER)
        currentUserProfile: UserProfile,
    ): Promise<IDataResponse<unknown>> {
        // Check if user is admin
        const user = await this.userRepository.findById(currentUserProfile.id);
        const globalRole = user.globalRole;

        AuthHelper.validateAdmin(globalRole);

        const catalogue = {
            listingStatuses: this.statusService.getListingStatuses(),
            wantedListingStatuses: this.statusService.getWantedListingStatuses(),
            tradeBidStatuses: this.statusService.getTradeBidStatuses(),
            haulageBidStatuses: this.statusService.getHaulageBidStatuses(),
            adminStates: this.statusService.getAdminStates(),
        };

        return {
            status: 'success',
            message: 'Status catalogue retrieved successfully',
            data: catalogue,
        };
    }

    /**
     * Get formatted shipping status for display
     * Task: 6.4.1.20. System Defined Status & State (Load X of X Shipped)
     */
    @get('/admin/shipping-status/{status}')
    @response(200, {
        description: 'Formatted shipping status',
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
                                formattedStatus: { type: 'string' },
                                color: { type: 'string' },
                            },
                        },
                    },
                },
            },
        },
    })
    async getFormattedShippingStatus(
        @param.path.string('status') status: string,
        @param.query.number('totalLoads') totalLoads: number,
        @inject(SecurityBindings.USER)
        currentUserProfile: UserProfile,
        @param.query.number('shippedLoads') shippedLoads?: number,
    ): Promise<IDataResponse<unknown>> {
        // Check if user is admin
        const user = await this.userRepository.findById(currentUserProfile.id);
        const globalRole = user.globalRole;

        AuthHelper.validateAdmin(globalRole);

        // Add input validation
        if (totalLoads <= 0) {
            throw new HttpErrors.BadRequest('Total loads must be greater than 0');
        }
        if (shippedLoads && shippedLoads > totalLoads) {
            throw new HttpErrors.BadRequest('Shipped loads cannot exceed total loads');
        }

        const formattedStatus = this.statusService.getShippingStatus(status, totalLoads, shippedLoads);
        const statusColor = this.statusService.getStatusColor(status);

        return {
            status: 'success',
            message: 'Shipping status formatted successfully',
            data: {
                formattedStatus,
                color: statusColor,
            },
        };
    }
}
