import { injectable, BindingScope } from '@loopback/core';
import { Filter, repository } from '@loopback/repository';
import { HttpErrors } from '@loopback/rest';
import { WasteTradeNotificationsRepository } from '../repositories';
import { WasteTradeNotifications } from '../models';
import { NotificationType } from '../enum';
import { IDataResponse, PaginationList } from '../types/common';
import { get } from 'lodash';
import { messages } from '../constants';

@injectable({ scope: BindingScope.TRANSIENT })
export class WasteTradeNotificationsService {
    constructor(
        @repository(WasteTradeNotificationsRepository)
        public wasteTradeNotificationsRepository: WasteTradeNotificationsRepository,
    ) {}

    async createNotification(userId: number, type: NotificationType, data: object): Promise<void> {
        try {
            if (!userId) {
                return;
            }

            await this.wasteTradeNotificationsRepository.create({
                userId,
                type,
                data,
                isRead: false,
                createdAt: new Date(),
                updatedAt: new Date(),
            });
        } catch (error) {
            console.error('createNotification error:', error);
            throw new HttpErrors.InternalServerError('Failed to create notification');
        }
    }

    async getNotifications(
        userId: number,
        filter?: Filter<WasteTradeNotifications>,
    ): Promise<PaginationList<WasteTradeNotifications>> {
        const skip: number = get(filter, 'skip', 0) as number;
        const limit: number = get(filter, 'limit', 10) as number;
        const isRead = get(filter?.where, 'isRead', null) as boolean | null;
        // Build where clause with userId
        const whereClause: Record<string, unknown> = {
            userId,
        };

        try {
            // Add optional filters
            if (isRead !== null) {
                whereClause.isRead = isRead;
            }

            // Get total count and results in parallel
            const [totalCount, notifications] = await Promise.all([
                this.wasteTradeNotificationsRepository.count(whereClause),
                this.wasteTradeNotificationsRepository.find({
                    where: whereClause,
                    order: ['createdAt DESC'],
                    limit,
                    skip,
                    include: filter?.include,
                }),
            ]);

            return {
                results: notifications,
                totalCount: totalCount.count,
            };
        } catch (error) {
            throw new HttpErrors.InternalServerError('Failed to retrieve notifications');
        }
    }

    async markAsRead(notificationId: number, userId: number): Promise<IDataResponse<null>> {
        try {
            const notification = await this.wasteTradeNotificationsRepository.findOne({
                where: { id: notificationId, userId },
            });

            if (!notification) {
                throw new HttpErrors.NotFound(messages.wasteTradeNotificationsNotFound);
            }

            await this.wasteTradeNotificationsRepository.updateById(notificationId, {
                isRead: true,
                readAt: new Date(),
                updatedAt: new Date(),
            });

            return {
                status: 'success',
                message: 'Notification marked as read',
                data: null,
            };
        } catch (error) {
            if (error instanceof HttpErrors.HttpError) {
                throw error;
            }

            throw new HttpErrors.InternalServerError('Failed to mark notification as read');
        }
    }

    async markAsUnread(notificationId: number, userId: number): Promise<IDataResponse<null>> {
        try {
            const notification = await this.wasteTradeNotificationsRepository.findOne({
                where: { id: notificationId, userId },
            });

            if (!notification) {
                throw new HttpErrors.NotFound(messages.wasteTradeNotificationsNotFound);
            }

            await this.wasteTradeNotificationsRepository.updateById(notificationId, {
                isRead: false,
                readAt: null,
                updatedAt: new Date(),
            });

            return {
                status: 'success',
                message: 'Notification marked as unread',
                data: null,
            };
        } catch (error) {
            if (error instanceof HttpErrors.HttpError) {
                throw error;
            }

            throw new HttpErrors.InternalServerError('Failed to mark notification as unread');
        }
    }

    async markAllAsRead(userId: number): Promise<IDataResponse<null>> {
        try {
            const now = new Date();
            await this.wasteTradeNotificationsRepository.updateAll(
                {
                    isRead: true,
                    readAt: now,
                    updatedAt: now,
                },
                { userId, isRead: false },
            );

            return {
                status: 'success',
                message: 'All notifications marked as read',
                data: null,
            };
        } catch (error) {
            throw new HttpErrors.InternalServerError('Failed to mark all notifications as read');
        }
    }

    async getUnreadCount(userId: number): Promise<IDataResponse<{ count: number }>> {
        try {
            const count = await this.wasteTradeNotificationsRepository.count({
                userId,
                isRead: false,
            });

            return {
                status: 'success',
                message: 'Unread count retrieved successfully',
                data: { count: count?.count || 0 },
            };
        } catch (error) {
            console.error('getUnreadCount error:', error);
            throw new HttpErrors.InternalServerError('Failed to retrieve unread count');
        }
    }
}
