import { authenticate } from '@loopback/authentication';
import { inject, service } from '@loopback/core';
import { Filter } from '@loopback/repository';
import { get, getModelSchemaRef, param, patch, response } from '@loopback/rest';
import { SecurityBindings } from '@loopback/security';
import { MyUserProfile } from '../authentication-strategies/type';
import { WasteTradeNotificationsService } from '../services';
import { IDataResponse, PaginationList } from '../types/common';
import { WasteTradeNotifications } from '../models';

@authenticate('jwt')
export class WasteTradeNotificationsController {
    constructor(
        @service(WasteTradeNotificationsService)
        public wasteTradeNotificationsService: WasteTradeNotificationsService,
    ) {}

    @get('/waste-trade-notifications')
    @response(200, {
        description: 'Get all waste trade notifications for current user with pagination',
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        totalCount: { type: 'number' },
                        results: {
                            type: 'array',
                            items: getModelSchemaRef(WasteTradeNotifications, { includeRelations: true }),
                        },
                    },
                },
            },
        },
    })
    async getNotifications(
        @inject(SecurityBindings.USER)
        currentUserProfile: MyUserProfile,
        @param.filter(WasteTradeNotifications) filter?: Filter<WasteTradeNotifications>,
    ): Promise<PaginationList<WasteTradeNotifications>> {
        const userId = Number(currentUserProfile.id);
        return this.wasteTradeNotificationsService.getNotifications(userId, filter);
    }

    @patch('/waste-trade-notifications/{notificationId}/mark-read')
    @response(200, {
        description: 'Mark notification as read',
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
    async markAsRead(
        @inject(SecurityBindings.USER)
        currentUserProfile: MyUserProfile,
        @param.path.number('notificationId') notificationId: number,
    ): Promise<IDataResponse<null>> {
        const userId = Number(currentUserProfile.id);
        return this.wasteTradeNotificationsService.markAsRead(notificationId, userId);
    }

    @patch('/waste-trade-notifications/{notificationId}/mark-unread')
    @response(200, {
        description: 'Mark notification as unread',
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
    async markAsUnread(
        @inject(SecurityBindings.USER)
        currentUserProfile: MyUserProfile,
        @param.path.number('notificationId') notificationId: number,
    ): Promise<IDataResponse<null>> {
        const userId = Number(currentUserProfile.id);
        return this.wasteTradeNotificationsService.markAsUnread(notificationId, userId);
    }

    @patch('/waste-trade-notifications/mark-all-read')
    @response(200, {
        description: 'Mark all notifications as read',
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
    async markAllAsRead(
        @inject(SecurityBindings.USER)
        currentUserProfile: MyUserProfile,
    ): Promise<IDataResponse<null>> {
        const userId = Number(currentUserProfile.id);
        return this.wasteTradeNotificationsService.markAllAsRead(userId);
    }

    @get('/waste-trade-notifications/unread/count')
    @response(200, {
        description: 'Get unread notifications count',
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
                                count: { type: 'number' },
                            },
                        },
                    },
                },
            },
        },
    })
    async getUnreadCount(
        @inject(SecurityBindings.USER)
        currentUserProfile: MyUserProfile,
    ): Promise<IDataResponse<{ count: number }>> {
        const userId = Number(currentUserProfile.id);
        return this.wasteTradeNotificationsService.getUnreadCount(userId);
    }
}
