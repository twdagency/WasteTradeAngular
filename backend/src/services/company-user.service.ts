import { BindingScope, inject, injectable, service } from '@loopback/core';
import { repository } from '@loopback/repository';
import { HttpErrors } from '@loopback/rest';
import { MyUserProfile } from '../authentication-strategies/type';
import { messagesOfCompanyUser } from '../constants/company-user';
import { CompanyUserRoleEnum, CompanyUserStatusEnum, NotificationType, UserRoleEnum } from '../enum';
import { AuthHelper } from '../helpers/auth.helper';
import { CompanyUsers } from '../models';
import { SalesforceBindings } from '../keys/salesforce';
import { SalesforceLogger } from '../utils/salesforce/salesforce-sync.utils';
import { CompanyUserRequestsRepository, CompanyUsersRepository } from '../repositories';
import { IDataResponse } from '../types';
import { EmailService } from './email.service';
import { SalesforceSyncService } from './salesforce/salesforce-sync.service';
import { WasteTradeNotificationsService } from './waste-trade-notifications.service';

@injectable({ scope: BindingScope.TRANSIENT })
export class CompanyUserService {
    constructor(
        @repository(CompanyUsersRepository)
        public companyUsersRepository: CompanyUsersRepository,
        @repository(CompanyUserRequestsRepository)
        public companyUserRequestsRepository: CompanyUserRequestsRepository,

        @service(EmailService)
        public emailService: EmailService,
        @service(WasteTradeNotificationsService)
        public wasteTradeNotificationsService: WasteTradeNotificationsService,

        @inject(SalesforceBindings.SYNC_SERVICE, { optional: true })
        private salesforceSyncService?: SalesforceSyncService,
    ) {}

    public async createCompanyUser(companyUser: Omit<CompanyUsers, 'id'>): Promise<IDataResponse> {
        const companyUserData = await this.companyUsersRepository.create({
            ...companyUser,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        // Trigger Salesforce sync only for ACTIVE users (fire-and-forget)
        if (this.salesforceSyncService && companyUserData.id && companyUserData.status === 'ACTIVE') {
            this.salesforceSyncService.syncCompanyUser(companyUserData.id, true, false, 'createCompanyUser').catch((err) => {
                SalesforceLogger.error('Sync failed after company user creation', err, { entity: 'CompanyUser', companyUserId: companyUserData.id, action: 'create' });
            });
        }

        return {
            status: 'success',
            message: messagesOfCompanyUser.createCompanyUserSuccess,
            data: {
                companyUser: companyUserData,
            },
        };
    }

    public async removeCompanyUser(companyUserId: number, currentUser: MyUserProfile): Promise<IDataResponse> {
        // Validate that current user is company admin
        if (currentUser.globalRole === UserRoleEnum.USER) {
            AuthHelper.validateCompanyAdmin(currentUser.companyRole);
        } else {
            AuthHelper.validateAdmin(currentUser.globalRole);
        }

        const companyUser = await this.companyUsersRepository.findById(companyUserId, {
            include: ['user', 'company'],
        });

        if (!companyUser) {
            throw new HttpErrors.NotFound('Company user not found');
        }

        // Prevent removing self
        if (companyUser.userId === currentUser.id) {
            throw new HttpErrors.BadRequest('You cannot remove yourself from the company');
        }

        // Update status to indicate removal (don't delete - preserve history)
        await this.companyUsersRepository.updateById(companyUserId, {
            status: 'REMOVED',
            updatedAt: new Date().toISOString(),
        });

        // Trigger Salesforce sync to update Contact status (fire-and-forget)
        if (this.salesforceSyncService) {
            this.salesforceSyncService.syncCompanyUser(companyUserId, true, false, 'updateCompanyUser').catch((err) => {
                SalesforceLogger.error('Sync failed after company user removal', err, { entity: 'CompanyUser', companyUserId, action: 'remove' });
            });
        }

        return {
            status: 'success',
            message: 'User removed from company successfully',
            data: {
                companyUserId,
            },
        };
    }

    public async assignRole(
        userId: number,
        newRole: CompanyUserRoleEnum,
        currentUser: MyUserProfile,
    ): Promise<IDataResponse> {
        // Validate that current user is company admin
        if (currentUser.globalRole === UserRoleEnum.USER) {
            AuthHelper.validateCompanyAdmin(currentUser.companyRole);
        } else {
            AuthHelper.validateAdmin(currentUser.globalRole);
        }

        // Prevent changing own role
        if (userId === currentUser.id) {
            throw new HttpErrors.BadRequest('You cannot change your own role');
        }

        // Get target user's company user record
        const [targetUserCompany, targetUserCompanyRequest] = await Promise.all([
            this.companyUsersRepository.findOne({
                where: {
                    userId: userId,
                },
                include: ['user', 'company'],
            }),
            this.companyUserRequestsRepository.findOne({
                where: {
                    userId: userId,
                },
                include: ['user', 'company'],
            }),
        ]);

        if (!targetUserCompany && !targetUserCompanyRequest) {
            throw new HttpErrors.NotFound('User not found in your company');
        }

        // Update role
        if (targetUserCompany) {
            await this.companyUsersRepository.updateById(targetUserCompany.id, {
                companyRole: newRole,
                updatedAt: new Date().toISOString(),
            });

            // Trigger Salesforce sync after role change (fire-and-forget, only for ACTIVE users)
            if (this.salesforceSyncService && targetUserCompany.id && targetUserCompany.status === 'ACTIVE') {
                this.salesforceSyncService.syncCompanyUser(targetUserCompany.id, true, false, 'changeRole').catch((err) => {
                    SalesforceLogger.error('Sync failed after company user role change', err, { entity: 'CompanyUser', companyUserId: targetUserCompany.id, action: 'role_change' });
                });
            }
        } else if (targetUserCompanyRequest) {
            await this.companyUserRequestsRepository.updateById(targetUserCompanyRequest.id, {
                role: newRole,
                updatedAt: new Date().toISOString(),
            });
        }

        const foundUser = targetUserCompany?.user ?? targetUserCompanyRequest?.user ?? null;
        const foundCompany = targetUserCompany?.company ?? targetUserCompanyRequest?.company ?? null;

        await Promise.all([
            this.emailService.sendUserReceiveRoleChangeEmail(
                {
                    email: foundUser?.email ?? '',
                    firstName: foundUser?.firstName ?? '',
                    lastName: foundUser?.lastName ?? '',
                    role: newRole,
                },
                foundCompany?.name ?? '',
            ),
            this.wasteTradeNotificationsService.createNotification(
                userId ?? 0,
                NotificationType.COMPANY_USER_ROLE_CHANGED,
                {
                    userId: userId ?? 0,
                    companyId: foundCompany?.id ?? 0,
                    firstName: foundUser?.firstName ?? '',
                    lastName: foundUser?.lastName ?? '',
                    companyName: foundCompany?.name ?? '',
                    newRole,
                    oldRole: targetUserCompany?.companyRole ?? targetUserCompanyRequest?.role ?? '',
                },
            ),
        ]);

        return {
            status: 'success',
            message: 'Role assigned successfully',
            data: {
                userId,
                newRole,
            },
        };
    }
}
