import { bind, BindingScope, inject } from '@loopback/context';
import { service } from '@loopback/core';
import { Filter, repository } from '@loopback/repository';
import { HttpErrors } from '@loopback/rest';
import get from 'lodash/get';
import { v4 as uuidv4 } from 'uuid';

import { MyUserProfile } from '../authentication-strategies/type';
import { messages } from '../constants';
import { UrlTypeEnum, UserRoleEnum, UserStatus } from '../enum';
import { PasswordHasherBindings } from '../keys';
import { User } from '../models/user.model';
import { UserRepository } from '../repositories/user.repository';
import { IDataResponse, PaginationList } from '../types';
import { AssignAdminService } from './assign-admin.service';
import { EmailService } from './email.service';
import { PasswordHasher } from './hash.password.bcryptjs';
import { MyUserService } from './user.service';

@bind({ scope: BindingScope.TRANSIENT })
export class AdminService {
    constructor(
        @repository(UserRepository)
        public userRepository: UserRepository,

        @service(EmailService)
        public emailService: EmailService,
        @service(MyUserService)
        public userService: MyUserService,
        @service(AssignAdminService)
        public assignAdminService: AssignAdminService,

        @inject(PasswordHasherBindings.PASSWORD_HASHER)
        public passwordHasher: PasswordHasher,
    ) {}

    checkPermissionAdmin(currentUserProfile: MyUserProfile): void {
        if (
            currentUserProfile.globalRole === UserRoleEnum.USER ||
            currentUserProfile.globalRole === UserRoleEnum.SALES_ADMIN
        ) {
            throw new HttpErrors.Forbidden(messages.forbidden);
        }
    }

    getAdminFields(): { [K in keyof Partial<User>]: boolean } {
        return {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            globalRole: true,
            phoneNumber: true,
            status: true,
            createdAt: true,
            lastLoginAt: true,
        };
    }

    async getAdmins(currentUserProfile: MyUserProfile, filter?: Filter<User>): Promise<PaginationList<Partial<User>>> {
        const skip: number = get(filter, 'skip', 0) as number;
        const limit: number = get(filter, 'limit', 10) as number;

        this.checkPermissionAdmin(currentUserProfile);

        // Build where clause to get only admin users (exclude regular users)
        const whereClause = {
            globalRole: {
                neq: UserRoleEnum.USER,
            },
        };

        // Get total count and results in parallel
        const [totalCount, admins] = await Promise.all([
            this.userRepository.count(whereClause),
            this.userRepository.find({
                where: whereClause,
                order: ['lastName ASC', 'firstName ASC'],
                limit,
                skip,
                fields: this.getAdminFields(),
            }),
        ]);

        return {
            totalCount: totalCount.count,
            results: admins,
        };
    }

    async createAdmin(userAdmin: User, currentUserProfile: MyUserProfile): Promise<IDataResponse<{ id: number }>> {
        try {
            this.checkPermissionAdmin(currentUserProfile);

            if (
                currentUserProfile.globalRole !== UserRoleEnum.SUPER_ADMIN &&
                userAdmin.globalRole === UserRoleEnum.SUPER_ADMIN
            ) {
                throw new HttpErrors.Forbidden(messages.noPermissionToCreateSuperAdmin);
            }

            const passwordHash = await this.passwordHasher.hashPassword(uuidv4());

            //* set the password
            const userCreated = await this.userRepository.create({
                firstName: userAdmin.firstName,
                lastName: userAdmin.lastName,
                email: userAdmin.email?.toLowerCase(),
                globalRole: userAdmin.globalRole,
                phoneNumber: userAdmin.phoneNumber,
                passwordHash,
                isVerified: true,
                status: UserStatus.ACTIVE,
                notificationEmailEnabled: true,
                notificationPushEnabled: true,
                notificationInAppEnabled: true,
            });

            await this.userService.forgetPassword(userCreated, {
                urlType: UrlTypeEnum.RESET_PASSWORD,
                isCreatedAdmin: true,
                expiresIn: '36500d',
            });

            return {
                status: 'success',
                message: messages.createAdminSuccess,
                data: { id: userCreated.id ?? 0 },
            };
        } catch (error) {
            const errorMessage: string = get(error, 'message', '');
            const errorCode: string | undefined = get(error, 'code');

            if (
                errorMessage.includes('duplicate key value violates unique constraint "users_email_idx"') &&
                errorCode === '23505'
            ) {
                throw new HttpErrors.Conflict(messages.existedEmailAdmin);
            }

            throw error;
        }
    }

    async getAdminDetail(id: number, currentUserProfile: MyUserProfile): Promise<IDataResponse<Partial<User>>> {
        this.checkPermissionAdmin(currentUserProfile);

        const admin = await this.userRepository.findOne({
            where: {
                id,
                globalRole: {
                    neq: UserRoleEnum.USER,
                },
            },
            fields: this.getAdminFields(),
        });

        if (!admin) {
            throw new HttpErrors.NotFound(messages.adminNotFound);
        }

        return {
            status: 'success',
            message: messages.adminFound,
            data: admin,
        };
    }

    async editAdmin(
        id: number,
        userAdmin: Partial<User>,
        currentUserProfile: MyUserProfile,
    ): Promise<IDataResponse<null>> {
        try {
            this.checkPermissionAdmin(currentUserProfile);

            // Check if admin exists and is not a regular user
            const existingAdmin = await this.userRepository.findOne({
                where: {
                    id,
                    globalRole: {
                        neq: UserRoleEnum.USER,
                    },
                },
            });

            if (!existingAdmin) {
                throw new HttpErrors.NotFound(messages.adminNotFound);
            }

            // Check permission to edit super admin
            if (
                currentUserProfile.globalRole !== UserRoleEnum.SUPER_ADMIN &&
                userAdmin.globalRole !== existingAdmin.globalRole
            ) {
                throw new HttpErrors.Forbidden(messages.noPermissionToEditAdminRole);
            }

            // Update admin with allowed fields
            await this.userRepository.updateById(id, {
                firstName: userAdmin.firstName,
                lastName: userAdmin.lastName,
                email: userAdmin.email?.toLowerCase(),
                globalRole: userAdmin.globalRole,
                phoneNumber: userAdmin.phoneNumber,
            });

            return {
                status: 'success',
                message: messages.updateAdminSuccess,
                data: null,
            };
        } catch (error) {
            const errorMessage: string = get(error, 'message', '');
            const errorCode: string | undefined = get(error, 'code');

            if (
                errorMessage.includes('duplicate key value violates unique constraint "users_email_idx"') &&
                errorCode === '23505'
            ) {
                throw new HttpErrors.Conflict(messages.existedEmailAdmin);
            }

            throw error;
        }
    }

    async archiveOrActiveAdmin(
        id: number,
        status: UserStatus,
        currentUserProfile: MyUserProfile,
    ): Promise<IDataResponse<null>> {
        this.checkPermissionAdmin(currentUserProfile);

        if (![UserStatus.ARCHIVED, UserStatus.ACTIVE].includes(status)) {
            throw new HttpErrors.BadRequest(messages.invalidStatus);
        }

        const fountUser = await this.userRepository.findById(id);

        if (fountUser?.globalRole === UserRoleEnum.USER) {
            throw new HttpErrors.BadRequest(messages.cannotArchiveOrActive);
        }

        await this.userRepository.updateById(id, { status });

        if (status === UserStatus.ARCHIVED) {
            // Unassign admin from all records when archiving
            await Promise.all([
                this.assignAdminService.unassignAdminFromAllRecords(id),
                this.emailService.sendAccountArchivedEmail(fountUser),
            ]);
        }

        return {
            status: 'success',
            message: status === UserStatus.ARCHIVED ? messages.archiveUserSuccess : messages.activeUserSuccess,
            data: null,
        };
    }
}
