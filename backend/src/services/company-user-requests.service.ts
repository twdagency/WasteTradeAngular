import { TokenServiceBindings } from '@loopback/authentication-jwt';
import { BindingScope, inject, injectable, service } from '@loopback/core';
import { Filter, repository } from '@loopback/repository';
import { HttpErrors } from '@loopback/rest';
import { genSalt, hash } from 'bcryptjs';
import * as crypto from 'crypto';
import { get } from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { MyUserProfile } from '../authentication-strategies/type';
import { messages } from '../constants';
import {
    CompanyUserRequestStatusEnum,
    CompanyUserRequestTypeEnum,
    CompanyUserRoleEnum,
    CompanyUserStatusEnum,
    NotificationType,
    UrlTypeEnum,
    UserRoleEnum,
    UserStatus,
} from '../enum';
import { AuthHelper } from '../helpers';
import { PasswordHasherBindings } from '../keys';
import { ResetPasswordRequest, User, UserRequestToJoinCompany } from '../models';
import {
    CompaniesRepository,
    CompanyUserRequestsRepository,
    CompanyUsersRepository,
    UserRepository,
} from '../repositories';
import { IDataResponse, PaginationList } from '../types';
import { CompanyUserRequestListItem } from '../types/company-user-request';
import { EmailService } from './email.service';
import { PasswordHasher } from './hash.password.bcryptjs';
import { MyUserService } from './user.service';
import { WasteTradeNotificationsService } from './waste-trade-notifications.service';
import { JWTService } from './jwt-service';
import { AuthService } from './auth.service';

@injectable({ scope: BindingScope.TRANSIENT })
export class CompanyUserRequestsService {
    constructor(
        @repository(CompanyUsersRepository)
        public companyUsersRepository: CompanyUsersRepository,
        @repository(CompanyUserRequestsRepository)
        public companyUserRequestsRepository: CompanyUserRequestsRepository,
        @repository(UserRepository)
        public userRepository: UserRepository,
        @repository(CompaniesRepository)
        public companiesRepository: CompaniesRepository,

        @service(AuthService)
        public authService: AuthService,
        @service(MyUserService)
        public userService: MyUserService,
        @service(WasteTradeNotificationsService)
        public wasteTradeNotificationsService: WasteTradeNotificationsService,
        @service(EmailService)
        public emailService: EmailService,

        @inject(PasswordHasherBindings.PASSWORD_HASHER)
        public passwordHasher: PasswordHasher,
        @inject(TokenServiceBindings.TOKEN_SERVICE)
        public jwtService: JWTService,
    ) {}

    public async getCompanyUserRequests(
        filter: Filter<User> = {},
        currentUserProfile: MyUserProfile,
    ): Promise<PaginationList<CompanyUserRequestListItem>> {
        const skip = get(filter, 'skip', 0);
        const limit = get(filter, 'limit', 10);
        let whereClause = `cur.status = '${CompanyUserRequestStatusEnum.REQUESTED}'`;

        if (!AuthHelper.isAdmin(currentUserProfile.globalRole)) {
            AuthHelper.validateCompanyAdmin(currentUserProfile.companyRole as CompanyUserRoleEnum);

            whereClause += ` AND cur.company_id = ${currentUserProfile.companyId}`;
        }

        // Main query with pagination
        const query = `
            SELECT 
                cur.id,
                u.id AS "userId",
                u.email,
                u.username,
                u.first_name AS "firstName",
                u.last_name AS "lastName",
                cur.note AS "note"
            FROM company_user_requests cur
            INNER JOIN users u ON cur.user_id = u.id
            WHERE ${whereClause}
            ORDER BY u.created_at DESC
            LIMIT ${limit} OFFSET ${skip}
        `;

        // Count query
        const countQuery = `
            SELECT COUNT(*) as count
            FROM company_user_requests cur
            INNER JOIN users u ON cur.user_id = u.id
            WHERE ${whereClause}
        `;

        // Execute queries in parallel
        const [results, countResult] = await Promise.all([
            this.companyUserRequestsRepository.execute(query),
            this.companyUserRequestsRepository.execute(countQuery),
        ]);

        return {
            totalCount: parseInt(countResult[0]?.count ?? '0'),
            results: results as CompanyUserRequestListItem[],
        };
    }

    public async inviteToJoinCompany(
        inviteRequest: UserRequestToJoinCompany,
        currentUser: MyUserProfile | null,
    ): Promise<IDataResponse> {
        const inviterId = currentUser?.id;
        const inviteRequestEmail = inviteRequest?.email?.toLowerCase();
        const companyId = currentUser?.companyId;

        AuthHelper.validateCompanyAdmin(currentUser?.companyRole as CompanyUserRoleEnum);

        let foundUser = await this.userRepository.findOne({
            where: { email: inviteRequestEmail },
        });

        if (foundUser) {
            // Check if user is global admin
            if (foundUser.globalRole !== UserRoleEnum.USER) {
                throw new HttpErrors.BadRequest(messages.cannotInviteAdminToCompany);
            }

            // Check if user already belongs to another company
            const existingCompanyUser = await this.companyUsersRepository.findOne({
                where: { userId: foundUser.id },
            });

            if (existingCompanyUser) {
                if (existingCompanyUser.companyId === companyId) {
                    throw new HttpErrors.BadRequest(messages.userAlreadyBelongsToThisCompany);
                } else {
                    throw new HttpErrors.BadRequest(messages.userAlreadyBelongsToOtherCompany);
                }
            }

            // Check if there's already a pending invitation
            const existingInvite = await this.companyUserRequestsRepository.findOne({
                where: {
                    userId: foundUser?.id,
                    companyId: companyId,
                },
            });

            if (existingInvite && existingInvite.status === CompanyUserRequestStatusEnum.PENDING) {
                throw new HttpErrors.BadRequest(messages.anInvitationHasBeenSentToThisUser);
            }

            if (existingInvite && existingInvite.status === CompanyUserRequestStatusEnum.REQUESTED) {
                // Delete the existing request REQUESTED to create a new invitation
                await this.companyUserRequestsRepository.deleteById(existingInvite.id);
            }
        } else {
            // Create new user with random password
            const randomPassword = uuidv4();
            const salt = await genSalt(10);
            const passwordHash = await hash(randomPassword, salt);
            const username = await this.authService.generateUniqueUsername();

            foundUser = await this.userRepository.create({
                username,
                email: inviteRequestEmail,
                firstName: inviteRequest.firstName ?? '',
                lastName: inviteRequest.lastName ?? '',
                passwordHash,
                globalRole: UserRoleEnum.USER,
                status: UserStatus.PENDING,
                isVerified: false,
                notificationEmailEnabled: true,
                notificationPushEnabled: true,
                notificationInAppEnabled: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
        }

        // Generate invitation token
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

        // Create invitation record
        const invitation = await this.companyUserRequestsRepository.create({
            userId: foundUser?.id,
            role: inviteRequest.role,
            companyId: companyId,
            requestType: CompanyUserRequestTypeEnum.INVITE,
            status: CompanyUserRequestStatusEnum.PENDING,
            token,
            note: inviteRequest?.note ?? '',
            expiresAt: expiresAt.toISOString(),
            invitedByUserId: inviterId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        const company = await this.companiesRepository.findOne(
            {
                where: {
                    id: companyId,
                },
            },
            {
                fields: ['name'],
            },
        );

        await this.userService.forgetPassword(foundUser, {
            urlType: UrlTypeEnum.INVITE_JOIN_COMPANY,
            isCreatedAdmin: false,
            companyName: company?.name ?? '',
            expiresIn: '2d',
            secretKey: foundUser?.passwordHash ?? '',
        });

        return {
            status: 'success',
            message: 'User invitation sent successfully',
            data: {
                id: invitation.id,
                userId: foundUser?.id,
                email: foundUser?.email,
                role: invitation.role,
                status: invitation.status,
                expiresAt: invitation.expiresAt,
            },
        };
    }

    public async requestToJoinCompany(
        userRequestToJoinCompany: UserRequestToJoinCompany,
        currentUser: MyUserProfile | null,
    ): Promise<IDataResponse> {
        const userId = currentUser?.id ?? 0;
        const requestCompanyId = userRequestToJoinCompany?.companyId ?? 0;
        const requestEmail = userRequestToJoinCompany.email?.toLowerCase();

        if (currentUser?.email && currentUser?.email !== requestEmail) {
            throw new HttpErrors.BadRequest(messages.emailDoesNotMatch);
        }

        if (!requestCompanyId) {
            throw new HttpErrors.BadRequest(messages.companyNotFound);
        }

        const requestCompany = await this.companiesRepository.findById(requestCompanyId);
        if (currentUser && requestCompany?.isHaulier) {
            throw new HttpErrors.BadRequest(messages.companyNotFound);
        }

        // Get user's company and verify admin role
        const foundResult = await Promise.all([
            userId
                ? this.companyUsersRepository.findOne({
                      where: { userId: userId },
                  })
                : null,
            this.userRepository.findOne({
                where: { email: requestEmail },
            }),
        ]);

        const companyUser = foundResult[0];
        let foundUser = foundResult[1];

        if (foundUser) {
            // Check if user is global admin
            if (foundUser.globalRole !== UserRoleEnum.USER) {
                throw new HttpErrors.BadRequest(messages.globalAdminCannotRequestToJoinCompany);
            }

            // Check if there's already a pending invitation
            const existingRequest = await this.companyUserRequestsRepository.findOne({
                where: {
                    userId: foundUser?.id,
                    companyId: requestCompanyId,
                },
            });

            if (existingRequest) {
                throw new HttpErrors.BadRequest(messages.aRequestToJoinCompanyHasBeenSentByThisUser);
            }

            if (companyUser?.id) {
                await this.companyUsersRepository.deleteById(companyUser?.id);
            }
        } else {
            // Create new user with random password
            const randomPassword = uuidv4();
            const salt = await genSalt(10);
            const passwordHash = await hash(randomPassword, salt);
            const username = await this.authService.generateUniqueUsername();

            foundUser = await this.userRepository.create({
                username,
                email: requestEmail,
                firstName: userRequestToJoinCompany.firstName ?? '',
                lastName: userRequestToJoinCompany.lastName ?? '',
                passwordHash,
                globalRole: UserRoleEnum.USER,
                status: UserStatus.PENDING,
                isVerified: false,
                notificationEmailEnabled: true,
                notificationPushEnabled: true,
                notificationInAppEnabled: true,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
        }

        // Generate invitation token
        const token = crypto.randomBytes(32).toString('hex');
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

        const companyUserRequest = await this.companyUserRequestsRepository.create({
            userId: foundUser?.id,
            // role: userRequestToJoinCompany.role,
            role: currentUser ? CompanyUserRoleEnum.BOTH : CompanyUserRoleEnum.HAULIER,
            companyId: userRequestToJoinCompany.companyId,
            requestType: CompanyUserRequestTypeEnum.REQUEST,
            status: CompanyUserRequestStatusEnum.REQUESTED,
            token,
            note: userRequestToJoinCompany?.note ?? '',
            expiresAt: expiresAt.toISOString(),
            invitedByUserId: userId,
            oldCompanyId: companyUser?.companyId,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });

        const companyAdminUsers = await this.companyUsersRepository.find({
            where: {
                companyId: requestCompanyId,
                companyRole: CompanyUserRoleEnum.ADMIN,
            },
            include: ['user'],
        });
        const requestedUser = {
            email: foundUser?.email ?? '',
            firstName: foundUser?.firstName ?? '',
            lastName: foundUser?.lastName ?? '',
        };
        await Promise.all(
            companyAdminUsers.map(async (companyAdminUser) => {
                const adminUserId = companyAdminUser?.user?.id ?? 0;
                const adminUser = {
                    email: companyAdminUser?.user?.email ?? '',
                    firstName: companyAdminUser?.user?.firstName ?? '',
                    lastName: companyAdminUser?.user?.lastName ?? '',
                };
                return Promise.all([
                    this.emailService.sendCompanyAdminReceivedRequestedJoinCompanyEmail(
                        adminUser,
                        requestedUser,
                        requestCompany.name,
                        userRequestToJoinCompany?.note ?? '',
                    ),
                    this.wasteTradeNotificationsService.createNotification(
                        adminUserId,
                        NotificationType.COMPANY_USER_REQUEST_JOIN,
                        {
                            adminUserId,
                            userId: foundUser?.id ?? 0,
                            companyId: requestCompanyId,
                            firstName: foundUser?.firstName ?? '',
                            lastName: foundUser?.lastName ?? '',
                            companyName: requestCompany.name,
                        },
                    ),
                ]);
            }),
        );

        return {
            status: 'success',
            message: 'User invitation sent successfully',
            data: {
                id: companyUserRequest.id,
                userId: foundUser?.id,
                email: foundUser?.email,
                role: companyUserRequest.role,
                status: companyUserRequest.status,
                expiresAt: companyUserRequest.expiresAt,
            },
        };
    }

    public async companyAdminResendInvitation(userId: number, currentUser: MyUserProfile): Promise<IDataResponse> {
        // Verify current user is admin and get their company
        AuthHelper.validateCompanyAdmin(currentUser.companyRole);

        // Find the request for this user and company
        const companyUserRequest = await this.companyUserRequestsRepository.findOne({
            where: {
                userId: userId,
                status: CompanyUserRequestStatusEnum.PENDING,
                companyId: currentUser.companyId,
            },
        });

        if (!companyUserRequest) {
            throw new HttpErrors.NotFound(messages.notFoundCompanyUserRequest);
        }

        const [foundUser, foundCompany] = await Promise.all([
            this.userRepository.findById(companyUserRequest.userId),
            this.companiesRepository.findById(companyUserRequest.companyId),
        ]);

        await this.userService.forgetPassword(foundUser, {
            urlType: UrlTypeEnum.REQUEST_JOIN_COMPANY,
            isCreatedAdmin: false,
            companyName: foundCompany?.name ?? '',
            expiresIn: '2d',
            secretKey: foundUser?.passwordHash ?? '',
        });

        return {
            status: 'success',
            message: 'Invitation sent successfully',
            data: {},
        };
    }

    public async companyAdminApproveRequestJoinCompany(id: number, currentUser: MyUserProfile): Promise<IDataResponse> {
        // Verify current user is admin and get their company
        AuthHelper.validateCompanyAdmin(currentUser.companyRole);

        // Find the request for this user and company
        const companyUserRequest = await this.companyUserRequestsRepository.findById(id);

        if (!companyUserRequest || companyUserRequest.companyId !== currentUser.companyId) {
            throw new HttpErrors.NotFound(messages.notFoundCompanyUserRequest);
        }

        const [foundUser, foundCompany] = await Promise.all([
            this.userRepository.findById(companyUserRequest.userId),
            this.companiesRepository.findById(companyUserRequest.companyId),
            this.companyUserRequestsRepository.updateById(id, { status: CompanyUserRequestStatusEnum.PENDING }),
        ]);

        await this.userService.forgetPassword(foundUser, {
            urlType: UrlTypeEnum.REQUEST_JOIN_COMPANY,
            isCreatedAdmin: false,
            companyName: foundCompany?.name ?? '',
            expiresIn: '2d',
            secretKey: foundUser?.passwordHash,
        });

        return {
            status: 'success',
            message: 'Request approved successfully',
            data: {},
        };
    }

    public async companyAdminRejectRequestJoinCompany(id: number, currentUser: MyUserProfile): Promise<IDataResponse> {
        // Verify current user is admin and get their company
        AuthHelper.validateCompanyAdmin(currentUser.companyRole);

        // Find the request for this user and company
        const companyUserRequest = await this.companyUserRequestsRepository.findById(id, {
            include: ['user', 'company'],
        });

        if (
            !companyUserRequest ||
            companyUserRequest.companyId !== currentUser.companyId ||
            companyUserRequest.requestType !== CompanyUserRequestTypeEnum.REQUEST
        ) {
            throw new HttpErrors.NotFound(messages.notFoundCompanyUserRequest);
        }

        // Delete the request
        await Promise.all([
            this.companyUserRequestsRepository.deleteById(companyUserRequest.id),
            companyUserRequest.oldCompanyId
                ? this.companyUsersRepository.create({
                      companyId: companyUserRequest.oldCompanyId,
                      userId: companyUserRequest.userId,
                      companyRole: CompanyUserRoleEnum.ADMIN,
                      isPrimaryContact: false,
                      status: CompanyUserStatusEnum.REJECTED,
                      createdAt: new Date().toISOString(),
                      updatedAt: new Date().toISOString(),
                  })
                : null,
            this.emailService.sendUserReceiveRejectedJoinCompanyEmail(
                {
                    email: companyUserRequest?.user?.email ?? '',
                    firstName: companyUserRequest?.user?.firstName ?? '',
                    lastName: companyUserRequest?.user?.lastName ?? '',
                },
                companyUserRequest?.company?.name ?? '',
                '',
            ),
            // NOTE: for feature notification
            // this.wasteTradeNotificationsService.createNotification(
            //     companyUserRequest?.userId ?? 0,
            //     NotificationType.COMPANY_USER_REJECTED_REQUEST_JOIN,
            //     {
            //         userId: companyUserRequest?.userId ?? 0,
            //         companyId: companyUserRequest?.companyId ?? 0,
            //         firstName: companyUserRequest?.user?.firstName ?? '',
            //         lastName: companyUserRequest?.user?.lastName ?? '',
            //         companyName: companyUserRequest?.company?.name ?? '',
            //         rejectionReason: '',
            //     },
            // ),
        ]);

        return {
            status: 'success',
            message: 'Request rejected successfully',
            data: {},
        };
    }

    async setPasswordJoinCompany(resetPasswordRequest: ResetPasswordRequest): Promise<void> {
        const newPassword = get(resetPasswordRequest, 'newPassword', '');
        const resetPasswordToken = get(resetPasswordRequest, 'resetPasswordToken', '');

        const foundUser = await this.userService.validatePasswordAndResetToken(resetPasswordRequest, false);
        const decodedToken = await this.jwtService.verifyTokenWithSecretKey(
            resetPasswordToken,
            foundUser?.passwordHash,
        );
        const newPasswordHash = await this.passwordHasher.hashPassword(newPassword);
        const userId: number = (get(decodedToken, 'id', 0) as number) || 0;

        try {
            const [companyUserRequest, companyUser] = await Promise.all([
                this.companyUserRequestsRepository.findOne({
                    where: {
                        userId: userId,
                    },
                }),
                this.companyUsersRepository.findOne({
                    where: {
                        userId: userId,
                    },
                }),
            ]);

            if (companyUser) {
                throw new HttpErrors.BadRequest(messages.userAlreadyBelongsToThisCompany);
            }

            if (!companyUserRequest) {
                throw new HttpErrors.NotFound(messages.notFoundCompanyUserRequest);
            }

            const [companyAdminUsers, userCompany, foundCompany] = await Promise.all([
                this.companyUsersRepository.find({
                    where: {
                        companyId: companyUserRequest.companyId,
                        companyRole: CompanyUserRoleEnum.ADMIN,
                    },
                    include: ['user'],
                }),
                this.userRepository.findById(userId),
                this.companiesRepository.findById(companyUserRequest.companyId),
            ]);

            await Promise.all([
                // *INFO: set new password and mark user as verified (invitation accepted by company admin's invite)
                this.userRepository.updateById(userId, {
                    passwordHash: newPasswordHash,
                    isVerified: true,
                    status: UserStatus.ACTIVE,
                }),
                this.companyUserRequestsRepository.deleteAll({ userId: userId }),
                this.companyUsersRepository.create({
                    userId: userId,
                    companyId: companyUserRequest.companyId,
                    companyRole: companyUserRequest.role,
                    isPrimaryContact: false,
                    status: CompanyUserStatusEnum.ACTIVE,
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                }),
                ...companyAdminUsers.map(async (companyAdminUser) => {
                    const adminUserId = companyAdminUser?.user?.id ?? 0;
                    return Promise.all([
                        this.emailService.sendCompanyAdminReceiveInviteAcceptedEmail(
                            {
                                email: companyAdminUser?.user?.email ?? '',
                                firstName: companyAdminUser?.user?.firstName ?? '',
                                lastName: companyAdminUser?.user?.lastName ?? '',
                            },
                            {
                                email: userCompany?.email ?? '',
                                firstName: userCompany?.firstName ?? '',
                                lastName: userCompany?.lastName ?? '',
                                role: companyUserRequest.role,
                            },
                            foundCompany?.name ?? '',
                        ),
                        this.wasteTradeNotificationsService.createNotification(
                            adminUserId ?? 0,
                            NotificationType.COMPANY_USER_ACCEPTED_INVITE,
                            {
                                adminUserId,
                                userId: userId ?? 0,
                                companyId: companyUserRequest.companyId,
                                firstName: userCompany?.firstName ?? '',
                                lastName: userCompany?.lastName ?? '',
                                companyName: foundCompany?.name ?? '',
                            },
                        ),
                    ]);
                }),
            ]);
        } catch (error) {
            console.log('Error setPasswordJoinCompany:', error);
        }

        await this.userService.clearExpiredResetToken(userId);
    }
}
