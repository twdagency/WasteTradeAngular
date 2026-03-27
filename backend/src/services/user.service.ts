import { bind, BindingScope, inject } from '@loopback/context';
import { service } from '@loopback/core';
import { Filter, repository } from '@loopback/repository';
import { HttpErrors } from '@loopback/rest';
import { securityId } from '@loopback/security';
import get from 'lodash/get';
import { MyUserProfile } from '../authentication-strategies/type';
import { FE_BASE_URL } from '../config';
import { messages } from '../constants';
import {
    CompanyDocumentStatus,
    CompanyStatus,
    CompanyUserRoleEnum,
    CompanyUserStatusEnum,
    NotificationType,
    OnboardingStatus,
    UserAccountType,
    UserOverallStatus,
    UserRegistrationStatus,
    UserRoleEnum,
    UserStatus,
    UserTabFilter,
} from '../enum';
import { UrlTypeEnum } from '../enum/url-type.enum';
import { PasswordHasherBindings, TokenServiceBindings } from '../keys';
import { SalesforceBindings } from '../keys/salesforce';
import { SalesforceLogger } from '../utils/salesforce/salesforce-sync.utils';
import { Companies, CompanyDocuments, CompanyLocations, CompanyUsers, ResetPasswordRequest } from '../models';
import { User, UserWithRelations } from '../models/user.model';
import { CompanyDocumentsRepository } from '../repositories/company-documents.repository';
import { CompanyLocationDocumentsRepository } from '../repositories/company-location-documents.repository';
import { CompanyLocationsRepository } from '../repositories/company-locations.repository';
import { CompanyUsersRepository } from '../repositories/company-users.repository';
import { Credentials, UserRepository } from '../repositories/user.repository';
import { IDataResponse, PaginationList, UserListItem } from '../types';
import { CompaniesRepository } from './../repositories/companies.repository';
import { CompanyService } from './company.service';
import { EmailService } from './email.service';
import { PasswordHasher } from './hash.password.bcryptjs';
import { JWTService } from './jwt-service';
import { SalesforceSyncService } from './salesforce/salesforce-sync.service';
import { WasteTradeNotificationsService } from './waste-trade-notifications.service';

@bind({ scope: BindingScope.TRANSIENT })
export class MyUserService {
    constructor(
        @repository(UserRepository)
        public userRepository: UserRepository,
        @repository(CompaniesRepository)
        public companiesRepository: CompaniesRepository,
        @repository(CompanyUsersRepository)
        public companyUsersRepository: CompanyUsersRepository,
        @repository(CompanyLocationsRepository)
        public companyLocationsRepository: CompanyLocationsRepository,
        @repository(CompanyDocumentsRepository)
        public companyDocumentsRepository: CompanyDocumentsRepository,
        @repository(CompanyLocationDocumentsRepository)
        public companyLocationDocumentsRepository: CompanyLocationDocumentsRepository,

        @inject(PasswordHasherBindings.PASSWORD_HASHER)
        public passwordHasher: PasswordHasher,
        @inject(TokenServiceBindings.TOKEN_SERVICE)
        public jwtService: JWTService,
        @service(EmailService)
        public emailService: EmailService,
        @service(CompanyService)
        public companyService: CompanyService,
        @service(WasteTradeNotificationsService)
        public wasteTradeNotificationsService: WasteTradeNotificationsService,

        @inject(SalesforceBindings.SYNC_SERVICE, { optional: true })
        private salesforceSyncService?: SalesforceSyncService,
    ) {}

    convertToUserProfile(
        user: UserWithRelations,
        companyUser: CompanyUsers | null = null,
        company: Companies | null = null,
    ): MyUserProfile {
        const userProfile: MyUserProfile = {
            [securityId]: String(user.id),
            id: user.id!,
            email: user.email ?? '',
            name: `${user.firstName} ${user.lastName}`,
            firstName: user.firstName,
            lastName: user.lastName,
            username: user.username ?? '',
            companyName: company?.name ?? '',
            globalRole: user.globalRole!,
            companyRole: companyUser?.companyRole as CompanyUserRoleEnum,
            isHaulier: user.isHaulier!,
            companyId: company?.id ?? 0,
            isBuyer: company?.isBuyer ?? false,
            isSeller: company?.isSeller ?? false,
            createdAt: new Date(),
        };

        return userProfile;
    }

    // *INFO: Forgot password and handle send email for different url types
    async forgetPassword(
        foundUser: User,
        params: {
            urlType: UrlTypeEnum;
            isCreatedAdmin: boolean;
            companyName?: string;
            expiresIn?: string;
            secretKey?: string;
        },
    ): Promise<{ resetPasswordUrl: string }> {
        const { urlType, isCreatedAdmin, companyName, secretKey, expiresIn } = params;
        const resetPasswordToken = await this.jwtService.generateTemporaryTokenForResetPassword(
            foundUser,
            expiresIn,
            secretKey,
        );

        await this.userRepository.updateById(foundUser.id, {
            resetPasswordToken,
        });

        const resetPasswordUrl = `${FE_BASE_URL}/login?reset_pass=1&key=${resetPasswordToken}&urlType=${urlType}`;

        if (urlType === UrlTypeEnum.RESET_PASSWORD) {
            if (isCreatedAdmin) {
                await this.emailService.sendResetPasswordEmail(foundUser, resetPasswordUrl, true);
            } else {
                await this.emailService.sendResetPasswordEmail(foundUser, resetPasswordUrl, false);
            }

            return { resetPasswordUrl };
        }

        if (urlType === UrlTypeEnum.INVITE_JOIN_COMPANY || urlType === UrlTypeEnum.REQUEST_JOIN_COMPANY) {
            await this.emailService.sendInvitedToJoinCompanyEmail(foundUser, companyName ?? '', resetPasswordUrl);
        }

        return { resetPasswordUrl };
    }

    async resetPassword(resetPasswordRequest: ResetPasswordRequest): Promise<void> {
        const newPassword = get(resetPasswordRequest, 'newPassword', '');
        const resetPasswordToken = get(resetPasswordRequest, 'resetPasswordToken', '');
        const decodedToken = await this.jwtService.verifyToken(resetPasswordToken);
        const userId: number = (get(decodedToken, 'id', 0) as number) || 0;

        await this.validatePasswordAndResetToken(resetPasswordRequest, true);
        const newPasswordHash = await this.passwordHasher.hashPassword(newPassword);

        try {
            // *INFO: set new password
            await this.userRepository.updateById(userId, { passwordHash: newPasswordHash });
        } catch (error) {
            console.log('Error creating password instance:', error);
        }

        await this.clearExpiredResetToken(userId);
    }

    async validatePasswordAndResetToken(
        resetPasswordRequest: ResetPasswordRequest,
        isResetPasswordRequest: boolean = false,
    ): Promise<User> {
        const resetPasswordToken = get(resetPasswordRequest, 'resetPasswordToken', '');
        const decodedToken = await this.jwtService.decodeTokenWithoutSecretKey(resetPasswordToken);
        const userId: number = (get(decodedToken, 'id', 0) as number) || 0;
        const user = await this.userRepository.findById(userId);
        const confirmNewPassword = get(resetPasswordRequest, 'confirmNewPassword', '');
        const expiredDate = get(decodedToken, 'exp', 0);
        const userResetPasswordToken = get(user, 'resetPasswordToken', '');
        const newPassword = get(resetPasswordRequest, 'newPassword', '');

        if (expiredDate * 1000 <= Date.now()) {
            await this.clearExpiredResetToken(userId);
            throw new HttpErrors.BadRequest('token-expired');
        }

        if (newPassword.length < 8) {
            throw new HttpErrors.UnprocessableEntity('password-must-have-at-least-8-characters');
        }

        if (newPassword !== confirmNewPassword) {
            throw new HttpErrors.UnprocessableEntity('password-does-not-match');
        }

        if (isResetPasswordRequest && userResetPasswordToken !== resetPasswordToken) {
            throw new HttpErrors.NotFound('token-does-not-exist');
        }

        return user;
    }

    async clearExpiredResetToken(userId: number) {
        const user = await this.userRepository.findById(userId);
        const updatedUser = { ...user, resetPasswordToken: '' };

        await this.userRepository.updateById(userId, updatedUser);
    }

    async create(user: User): Promise<User> {
        const savedUser = await this.userRepository.create(user);
        return savedUser;
    }

    async updateById(id: number, user: User): Promise<void> {
        try {
            const previousUser = await this.userRepository.findById(id);
            const previousStatus = previousUser.status;

            user.updatedAt = new Date();
            await this.userRepository.updateById(id, user);

            // Trigger Salesforce sync after successful user update
            if (this.salesforceSyncService) {
                const sfSync = this.salesforceSyncService;
                (async () => {
                    await sfSync.syncUserAsLead(id, true, false, 'updateUser');

                    // NOTE: Lead → Account/Contact conversion is ONLY handled in adminRequestAction('approve')
                    // and handleApprovalAction('approve_user'). Do NOT convert here — this generic updateById
                    // can be called for profile edits, unarchiving, etc. which should not trigger conversion.

                    // Also sync Contact if user is active (Lead update doesn't update Contact)
                    const companyUsers = await this.companyUsersRepository.find({
                        where: { userId: id, status: CompanyUserStatusEnum.ACTIVE },
                    });
                    for (const cu of companyUsers) {
                        if (cu.id) {
                            await sfSync.syncCompanyUser(cu.id, true, false, 'updateUser').catch((err) => {
                                SalesforceLogger.error('Sync failed for Contact after user update', err, {
                                    entity: 'CompanyUser',
                                    companyUserId: cu.id,
                                    userId: id,
                                    action: 'update',
                                });
                            });
                        }
                    }
                })().catch((syncError) => {
                    SalesforceLogger.error('Sync failed after user update', syncError, {
                        entity: 'User',
                        userId: id,
                        action: 'update',
                    });
                });
            }
        } catch (error) {
            const errorMessage: string = get(error, 'message', '');
            const errorCode: string | undefined = get(error, 'code');

            if (
                errorMessage.includes('duplicate key value violates unique constraint "users_email_idx"') &&
                errorCode === '23505'
            ) {
                throw new HttpErrors.Conflict(messages.existedEmail);
            }

            throw error;
        }
    }

    async updateProfile(user: User, currentUserProfile: MyUserProfile): Promise<void> {
        try {
            const foundUser = await this.userRepository.findById(currentUserProfile.id, undefined, {
                fields: {
                    notificationPushEnabled: true,
                    status: true,
                },
            });

            await this.userRepository.updateById(currentUserProfile.id, user);

            // Only send email if request contains specific fields
            const fieldsToCheckForEmail: (keyof User)[] = [
                'email',
                'username',
                'firstName',
                'lastName',
                'prefix',
                'jobTitle',
                'phoneNumber',
            ];
            const shouldSendEmail = fieldsToCheckForEmail.some(
                (field) => Object.prototype.hasOwnProperty.call(user, field) && user[field] !== undefined,
            );

            if (shouldSendEmail) {
                await Promise.all([
                    this.emailService.sendEditProfileEmail(user),
                    this.wasteTradeNotificationsService.createNotification(
                        currentUserProfile.id,
                        NotificationType.PROFILE_UPDATED,
                        {},
                    ),
                ]);
            }

            if (user.notificationPushEnabled && !foundUser.notificationPushEnabled) {
                await this.wasteTradeNotificationsService.createNotification(
                    currentUserProfile.id,
                    NotificationType.NOTIFICATIONS_ENABLED,
                    {},
                );
            }

            // Trigger Salesforce sync after profile update
            if (this.salesforceSyncService) {
                const sfSync = this.salesforceSyncService;
                (async () => {
                    await sfSync.syncUserAsLead(currentUserProfile.id, true, false, 'updateProfile');

                    // Also sync Contact if user is active (Lead update doesn't update Contact)
                    const companyUsers = await this.companyUsersRepository.find({
                        where: { userId: currentUserProfile.id, status: CompanyUserStatusEnum.ACTIVE },
                    });
                    for (const cu of companyUsers) {
                        if (cu.id) {
                            await sfSync.syncCompanyUser(cu.id, true, false, 'updateProfile').catch((err) => {
                                SalesforceLogger.error('Sync failed for Contact after profile update', err, {
                                    entity: 'CompanyUser',
                                    companyUserId: cu.id,
                                    userId: currentUserProfile.id,
                                    action: 'profile_update',
                                });
                            });
                        }
                    }
                })().catch((syncError) => {
                    SalesforceLogger.error('Sync failed after profile update', syncError, {
                        entity: 'User',
                        userId: currentUserProfile.id,
                        action: 'profile_update',
                    });
                });
            }
        } catch (error) {
            const errorMessage: string = get(error, 'message', '');
            const errorCode: string | undefined = get(error, 'code');

            if (
                errorMessage.includes('duplicate key value violates unique constraint "users_email_idx"') &&
                errorCode === '23505'
            ) {
                throw new HttpErrors.Conflict(messages.existedEmail);
            }

            throw error;
        }
    }

    async getUserList(filter: Filter<User>): Promise<User[]> {
        const fieldsFilter: Filter<User> = {
            ...filter,
            fields: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
            },
        };
        return this.userRepository.find(fieldsFilter);
    }

    async getUserInfoByAdmin(id: number): Promise<IDataResponse> {
        const userQuery = `
            SELECT 
                u.id,
                u.email,
                u.username,
                u.password_hash as "passwordHash",
                u.first_name as "firstName",
                u.last_name as "lastName",
                u.prefix,
                u.job_title as "jobTitle",
                u.phone_number as "phoneNumber",
                u.mobile_number as "mobileNumber",
                u.is_verified as "isVerified",
                u.verification_token as "verificationToken",
                u.reset_password_token as "resetPasswordToken",
                u.reset_token_expires_at as "resetTokenExpiresAt",
                u.global_role as "globalRole",
                u.status,
                u.notification_email_enabled as "notificationEmailEnabled",
                u.notification_push_enabled as "notificationPushEnabled",
                u.notification_in_app_enabled as "notificationInAppEnabled",
                u.receive_email_for_offers_on_my_listings as "receiveEmailForOffersOnMyListings",
                u.receive_email_for_new_matching_listings as "receiveEmailForNewMatchingListings",
                u.where_did_you_hear_about_us as "whereDidYouHearAboutUs",
                u.created_at as "createdAt",
                u.updated_at as "updatedAt",
                cu.company_id as "companyId"
            FROM users u
            LEFT JOIN company_users cu ON u.id = cu.user_id
            WHERE u.id = ${id}
        `;
        const userResult = await this.userRepository.dataSource.execute(userQuery);

        if (!userResult || userResult.length === 0) {
            throw new HttpErrors.NotFound(messages.userNotFound);
        }

        const user = userResult[0];
        const companyId = user.companyId;

        if (!companyId) {
            return {
                status: 'success',
                message: 'User data retrieved successfully',
                data: user,
            };
        }

        const companyQuery = `
            SELECT 
                id,
                country_code as "countryCode",
                name,
                registration_number as "registrationNumber",
                email,
                vat_number as "vatNumber",
                vat_registration_country as "vatRegistrationCountry",
                address_line_1 as "addressLine1",
                address_line_2 as "addressLine2",
                city,
                country,
                state_province as "stateProvince",
                postal_code as "postalCode",
                website,
                phone_number as "phoneNumber",
                mobile_number as "mobileNumber",
                company_type as "companyType",
                favorite_materials as "favoriteMaterials",
                company_interest as "companyInterest",
                is_haulier as "isHaulier",
                box_clearing_agent as "boxClearingAgent",
                fleet_type as "fleetType",
                areas_covered as "areasCovered",
                container_types as "containerTypes",
                status,
                verified_at as "verifiedAt",
                facebook_url as "facebookUrl",
                instagram_url as "instagramUrl",
                linkedin_url as "linkedinUrl",
                x_url as "xUrl",
                description,
                is_seller as "isSeller",
                is_buyer as "isBuyer",
                rejection_reason as "rejectionReason",
                info_request_type as "infoRequestType",
                admin_message as "adminMessage",
                created_at as "createdAt",
                updated_at as "updatedAt"
            FROM companies
            WHERE id = ${companyId}
        `;
        const companyResult = await this.userRepository.dataSource.execute(companyQuery);
        const company = companyResult[0];

        const locationsQuery = `
            SELECT 
                cl.id,
                cl.location_name as "locationName",
                cl.prefix,
                cl.first_name as "firstName",
                cl.last_name as "lastName",
                cl.position_in_company as "positionInCompany",
                cl.site_point_contact as "sitePointContact",
                cl.phone_number as "phoneNumber",
                cl.address_line as "addressLine",
                cl.street,
                cl.postcode,
                cl.city,
                cl.country,
                cl.state_province as "stateProvince",
                cl.office_open_time as "officeOpenTime",
                cl.office_close_time as "officeCloseTime",
                cl.loading_ramp as "loadingRamp",
                cl.weighbridge,
                cl.container_type as "containerType",
                cl.accepted_materials as "acceptedMaterials",
                cl.site_specific_instructions as "siteSpecificInstructions",
                cl.self_load_unload_capability as "selfLoadUnLoadCapability",
                cl.access_restrictions as "accessRestrictions",
                cl.other_material as "otherMaterial",
                cl.main_location as "mainLocation",
                cl.created_at as "createdAt",
                cl.updated_at as "updatedAt",
                cl.company_id as "companyId",
                COALESCE(
                    json_agg(
                        json_build_object(
                            'id', cld.id,
                            'uploadedByUserId', cld.uploaded_by_user_id,
                            'reviewedByUserId', cld.reviewed_by_user_id,
                            'documentType', cld.document_type,
                            'documentName', cld.document_name,
                            'documentUrl', cld.document_url,
                            'status', cld.status,
                            'rejectionReason', cld.rejection_reason,
                            'reviewedAt', cld.reviewed_at,
                            'expiryDate', cld.expiry_date,
                            'createdAt', cld.created_at,
                            'updatedAt', cld.updated_at
                        )
                    ) FILTER (WHERE cld.id IS NOT NULL),
                    '[]'
                ) as "locationDocuments"
            FROM company_locations cl
            LEFT JOIN company_location_documents cld ON cl.id = cld.company_location_id
            WHERE cl.company_id = ${companyId}
            GROUP BY cl.id
        `;
        const locationsResult = await this.userRepository.dataSource.execute(locationsQuery);

        const documentsQuery = `
            SELECT 
                id,
                uploaded_by_user_id as "uploadedByUserId",
                reviewed_by_user_id as "reviewedByUserId",
                document_type as "documentType",
                document_name as "documentName",
                document_url as "documentUrl",
                status,
                rejection_reason as "rejectionReason",
                reviewed_at as "reviewedAt",
                expiry_date as "expiryDate",
                created_at as "createdAt",
                updated_at as "updatedAt",
                company_id as "companyId"
            FROM company_documents
            WHERE company_id = ${companyId}
        `;
        const documentsResult = await this.userRepository.dataSource.execute(documentsQuery);

        // Compute company type indicator for easier frontend identification
        const companyType = company ? (company.isSeller ? (company.isBuyer ? 'both' : 'seller') : 'buyer') : null;

        return {
            status: 'success',
            message: 'User data retrieved successfully',
            data: {
                ...user,
                company: {
                    ...company,
                    locations: locationsResult,
                    documents: documentsResult,
                },
                companyType, // Add computed company type indicator
            },
        };
    }

    async adminRequestAction(
        id: number,
        requestAction: string,
        body: { rejectReason?: string; message?: string; infoRequestType?: string },
        adminId: number,
    ) {
        const date = new Date();
        if (requestAction === 'approve') {
            await this.userRepository.updateById(id, { status: UserStatus.ACTIVE, isVerified: true });
            const companyUser = await this.companyUsersRepository.findOne({
                where: {
                    userId: id,
                },
            });
            if (!companyUser) {
                throw new HttpErrors.BadRequest('User is already approved');
            }
            await this.companyUsersRepository.updateById(companyUser.id, { status: CompanyUserStatusEnum.ACTIVE });
            await this.companiesRepository.updateById(companyUser.companyId, {
                status: CompanyStatus.ACTIVE,
                verifiedAt: date,
            });
            await this.companyDocumentsRepository.updateAll(
                {
                    status: CompanyDocumentStatus.ACTIVE,
                    reviewedByUserId: adminId,
                    reviewedAt: date,
                },
                { companyId: companyUser.companyId },
            );
            const companyLocations = await this.companyLocationsRepository.find({
                where: {
                    companyId: companyUser.companyId,
                },
            });
            // update company location documents for each location id
            await Promise.all(
                companyLocations.map((location) =>
                    this.companyLocationDocumentsRepository.updateAll(
                        {
                            status: CompanyDocumentStatus.ACTIVE,
                            reviewedByUserId: adminId,
                            reviewedAt: date,
                        },
                        {
                            companyLocationId: location.id,
                        },
                    ),
                ),
            );

            const user = await this.userRepository.findById(id);

            // Currently, keep template only text email for user approval
            // await this.emailService.sendCompanyApprovedEmail(user);

            await Promise.all([
                this.emailService.sendAccountVerificationApprovedEmail(user),
                this.wasteTradeNotificationsService.createNotification(
                    user.id ?? 0,
                    NotificationType.ACCOUNT_VERIFIED,
                    {},
                ),
            ]);

            // 🚀 Salesforce Integration: Convert Lead to Contact/Account on user approval
            if (this.salesforceSyncService) {
                try {
                    console.log(`🔄 Converting Lead to Contact for approved user ${id}`);
                    const conversionResult = await this.salesforceSyncService.convertLeadToAccountContact(id, 'adminApproval');

                    if (conversionResult.success) {
                        console.log(`✅ Successfully converted Lead to Contact for user ${id}`, {
                            accountId: conversionResult.accountId,
                            contactId: conversionResult.contactId,
                        });

                        // After successful Lead conversion, sync the company to ensure all company-specific fields are properly mapped
                        if (companyUser?.companyId) {
                            const sfSync = this.salesforceSyncService;
                            (async () => {
                                console.log(`🔄 Syncing company ${companyUser.companyId} after user verification`);
                                const companySyncResult = await sfSync.syncCompany(companyUser.companyId, true, false, 'adminApproval');

                                if (companySyncResult.success) {
                                    console.log(
                                        `✅ Successfully synced company ${companyUser.companyId} after verification`,
                                    );

                                    const allCompanyUsers = await this.companyUsersRepository.find({
                                        where: {
                                            companyId: companyUser.companyId,
                                            status: CompanyUserStatusEnum.ACTIVE,
                                        },
                                    });

                                    for (const cu of allCompanyUsers) {
                                        if (!cu.id) continue;
                                        const contactSyncResult = await sfSync.syncCompanyUser(cu.id, true, false, 'adminApproval');
                                        if (!contactSyncResult.success) {
                                            SalesforceLogger.warn('Sync returned failure for company user Contact', {
                                                entity: 'CompanyUser',
                                                companyUserId: cu.id,
                                                action: 'approve',
                                                error: contactSyncResult.error,
                                            });
                                        }
                                    }
                                } else {
                                    SalesforceLogger.warn('Sync returned failure for company during approval', {
                                        entity: 'Company',
                                        companyId: companyUser.companyId,
                                        action: 'approve',
                                        error: companySyncResult.error,
                                    });
                                }
                            })().catch((syncError) => {
                                SalesforceLogger.error('Sync failed for company during approval', syncError, {
                                    entity: 'Company',
                                    companyId: companyUser.companyId,
                                    action: 'approve',
                                });
                            });
                        }
                    } else {
                        console.warn(`⚠️ Failed to convert Lead to Contact for user ${id}:`, conversionResult.error);
                        // Note: We don't fail the approval process if Salesforce conversion fails
                        // The user is still approved in WasteTrade, Salesforce sync can be retried later
                    }
                } catch (error) {
                    console.error(`❌ Error during Lead to Contact conversion for user ${id}:`, error);
                    // Continue with approval process even if Salesforce sync fails
                }
            }

            return {
                status: 'success',
                message: 'User and company approved successfully',
            };
        } else if (requestAction === 'reject') {
            // Handle both rejectReason and reject_reason field names from frontend
            const rejectReason = body.rejectReason ?? ((body as Record<string, unknown>).reject_reason as string);
            // If rejection reason is "Other", use the message field instead for database storage
            const dbRejectionReason = rejectReason === 'Other' ? (body.message ?? rejectReason) : rejectReason;

            const [, companyUser] = await Promise.all([
                this.userRepository.updateById(id, { status: UserStatus.REJECTED }),
                this.companyUsersRepository.findOne({
                    where: {
                        userId: id,
                    },
                }),
            ]);

            if (!companyUser) {
                throw new HttpErrors.BadRequest('User is already approved');
            }

            const [, , , companyLocations] = await Promise.all([
                this.companyUsersRepository.updateById(companyUser.id, { status: CompanyUserStatusEnum.REJECTED }),
                this.companiesRepository.updateById(companyUser.companyId, {
                    status: CompanyStatus.REJECTED,
                    rejectionReason: dbRejectionReason,
                }),
                this.companyDocumentsRepository.updateAll(
                    {
                        status: CompanyDocumentStatus.REJECTED,
                        reviewedByUserId: adminId,
                        reviewedAt: date,
                        rejectionReason: dbRejectionReason,
                    },
                    { companyId: companyUser.companyId },
                ),
                this.companyLocationsRepository.find({
                    where: {
                        companyId: companyUser.companyId,
                    },
                }),
            ]);

            // update company location documents for each location id
            await Promise.all(
                companyLocations.map((location) =>
                    this.companyLocationDocumentsRepository.updateAll(
                        {
                            status: CompanyDocumentStatus.REJECTED,
                            reviewedByUserId: adminId,
                            reviewedAt: date,
                            rejectionReason: dbRejectionReason,
                        },
                        {
                            companyLocationId: location.id,
                        },
                    ),
                ),
            );

            const user = await this.userRepository.findById(id);

            // If rejection reason is "Other", use the message field instead
            const emailRejectionReason = rejectReason === 'Other' ? (body.message ?? rejectReason) : rejectReason;

            await Promise.all([
                this.emailService.sendCompanyRejectedEmail(user, emailRejectionReason),
                this.wasteTradeNotificationsService.createNotification(
                    user.id ?? 0,
                    NotificationType.ACCOUNT_REJECTED,
                    { rejectionReason: emailRejectionReason },
                ),
            ]);

            try {
                if (companyUser?.userId) {
                    const userSyncResult = await this.salesforceSyncService?.syncUserAsLead(
                        companyUser.userId,
                        true,
                        true,
                    );
                    if (!userSyncResult) {
                        throw new Error(`Failed to sync User as Lead for user ${companyUser.userId}`);
                    }
                    if (userSyncResult.success) {
                        console.log(`✅ Synced User as Lead for user ${companyUser.userId}`);
                    } else {
                        SalesforceLogger.warn('Sync returned failure for user Lead during rejection', {
                            entity: 'User',
                            userId: companyUser.userId,
                            action: 'reject',
                            error: userSyncResult.error,
                        });
                    }
                }
            } catch (error) {
                SalesforceLogger.error('Sync failed for user Lead during rejection', error, {
                    entity: 'User',
                    userId: companyUser.userId,
                    action: 'reject',
                });
            }

            return {
                status: 'success',
                message: 'User and company rejected successfully',
            };
        } else if (requestAction === 'request_info') {
            const [user, companyUser] = await Promise.all([
                this.userRepository.findById(id),
                this.companyUsersRepository.findOne({
                    where: {
                        userId: id,
                    },
                }),
            ]);

            if (!companyUser) {
                throw new HttpErrors.BadRequest('User is already approved');
            }

            const [, , , , companyLocations] = await Promise.all([
                this.userRepository.updateById(id, { status: UserStatus.REQUEST_INFORMATION }),
                this.companyUsersRepository.updateById(companyUser.id, {
                    status: CompanyUserStatusEnum.REQUEST_INFORMATION,
                }),
                this.companiesRepository.updateById(companyUser.companyId, {
                    status: CompanyStatus.REQUEST_INFORMATION,
                    infoRequestType: body.infoRequestType,
                    adminMessage: body.message,
                }),
                this.companyDocumentsRepository.updateAll(
                    {
                        status: CompanyDocumentStatus.REQUEST_INFORMATION,
                    },
                    { companyId: companyUser.companyId },
                ),
                this.companyLocationsRepository.find({
                    where: {
                        companyId: companyUser.companyId,
                    },
                }),
            ]);

            try {
                if (companyUser?.userId) {
                    const userSyncResult = await this.salesforceSyncService?.syncUserAsLead(
                        companyUser.userId,
                        true,
                        true,
                    );
                    if (!userSyncResult) {
                        throw new Error(`Failed to sync User as Lead for user ${companyUser.userId}`);
                    }
                    if (userSyncResult.success) {
                        console.log(`✅ Synced User as Lead for user ${companyUser.userId}`);
                    } else {
                        SalesforceLogger.warn('Sync returned failure for user Lead during request_info', {
                            entity: 'User',
                            userId: companyUser.userId,
                            action: 'request_info',
                            error: userSyncResult.error,
                        });
                    }
                }
            } catch (error) {
                SalesforceLogger.error('Sync failed for user Lead during request_info', error, {
                    entity: 'User',
                    userId: companyUser.userId,
                    action: 'request_info',
                });
            }

            await Promise.all(
                companyLocations.map((location) =>
                    this.companyLocationDocumentsRepository.updateAll(
                        {
                            status: CompanyDocumentStatus.REQUEST_INFORMATION,
                            reviewedByUserId: adminId,
                            reviewedAt: date,
                        },
                        {
                            companyLocationId: location.id,
                        },
                    ),
                ),
            );

            await this.emailService.sendCompanyRequestInformationEmail(user, body.message);

            return {
                status: 'success',
                message: 'Company request information sent successfully',
            };
        }
        throw new HttpErrors.BadRequest('Invalid request action');
    }

    async getUsers(filter: Filter<User> = {}, searchTerm: string = ''): Promise<PaginationList<UserListItem>> {
        // Define interface for user row data
        interface UserRowData {
            id: number;
            username?: string;
            firstName: string;
            lastName: string;
            email: string;
            createdAt: string;
            status: string;
            adminNote?: string;
            assignAdmin?: string;
            assignedAdminId?: number;
            assignedAdminFirstName?: string;
            assignedAdminLastName?: string;
            assignedAdminEmail?: string;
            assignedAdminGlobalRole?: string;
            companyId?: number;
            companyName?: string;
            companyCountry?: string;
            companyInterest?: string;
            isHaulier?: boolean;
            isBuyer?: boolean;
            isSeller?: boolean;
            companyRole?: string;
        }

        const skip = get(filter, 'skip', 0);
        const limit = get(filter, 'limit', 10);

        // Get filter parameters from filter.where
        const tabFilter = get(filter?.where, 'tabFilter', '') as UserTabFilter;
        const dateFrom = get(filter?.where, 'dateFrom', '') as string;
        const dateTo = get(filter?.where, 'dateTo', '') as string;
        const accountType = get(filter?.where, 'accountType', '') as UserAccountType;
        const overallStatus = get(filter?.where, 'overallStatus', '') as UserOverallStatus;
        const registrationStatus = get(filter?.where, 'registrationStatus', '') as UserRegistrationStatus;
        const onboardingStatus = get(filter?.where, 'onboardingStatus', '') as OnboardingStatus;

        // Build SQL query for efficient search

        // Tab filter (unverified/verified/rejected/inactive)
        let statusFilter = '';
        switch (tabFilter) {
            case UserTabFilter.UNVERIFIED:
                statusFilter = `AND u.status IN ('${UserStatus.PENDING}', '${UserStatus.REQUEST_INFORMATION}')`;
                break;
            case UserTabFilter.VERIFIED:
                statusFilter = `AND u.status = '${UserStatus.ACTIVE}'`;
                break;
            case UserTabFilter.REJECTED:
                statusFilter = `AND u.status = '${UserStatus.REJECTED}'`;
                break;
            default:
                statusFilter = '';
        }

        // Date range filter
        let dateFilter = '';
        if (dateFrom && dateTo) {
            dateFilter = `AND u.created_at BETWEEN '${dateFrom}' AND '${dateTo}'`;
        } else if (dateFrom) {
            dateFilter = `AND u.created_at >= '${dateFrom}'`;
        } else if (dateTo) {
            dateFilter = `AND u.created_at <= '${dateTo}'`;
        }

        // Account Type filter (Buyer, Seller, Dual, Haulier)
        let accountTypeFilter = '';
        if (accountType) {
            switch (accountType) {
                case UserAccountType.BUYER:
                    accountTypeFilter = `AND cu.company_role = '${CompanyUserRoleEnum.BUYER}'`;
                    break;
                case UserAccountType.SELLER:
                    accountTypeFilter = `AND cu.company_role = '${CompanyUserRoleEnum.SELLER}'`;
                    break;
                case UserAccountType.DUAL:
                    accountTypeFilter = `AND cu.company_role = '${CompanyUserRoleEnum.BOTH}'`;
                    break;
                case UserAccountType.HAULIER:
                    accountTypeFilter = `AND cu.company_role = '${CompanyUserRoleEnum.HAULIER}'`;
                    break;
                case UserAccountType.TRADING_COMPANY_ADMIN:
                    accountTypeFilter = `AND cu.company_role = '${CompanyUserRoleEnum.ADMIN}' AND c.is_haulier = false`;
                    break;
                case UserAccountType.HAULAGE_COMPANY_ADMIN:
                    accountTypeFilter = `AND cu.company_role = '${CompanyUserRoleEnum.ADMIN}' AND c.is_haulier = true`;
                    break;
            }
        }

        // Overall Status filter (Complete, Awaiting Approval, In Progress)
        // This is overallStatus - will be filtered after getting data (complex logic)

        // Registration Status filter (Complete, In Progress)
        let registrationStatusFilter = '';
        if (registrationStatus) {
            if (registrationStatus === UserRegistrationStatus.COMPLETE) {
                registrationStatusFilter = `AND c.status = '${CompanyStatus.ACTIVE}'`;
            } else if (registrationStatus === UserRegistrationStatus.IN_PROGRESS) {
                registrationStatusFilter = `AND c.status != '${CompanyStatus.ACTIVE}'`;
            }
        }

        // Onboarding Status - will be filtered after getting data (complex logic)

        // Search filter
        let searchFilter = '';
        if (searchTerm) {
            const searchPattern = searchTerm.trim().toLowerCase().replace(/'/g, "''"); // Escape single quotes
            let accountTypeFilterSearch = '';

            if (UserAccountType.BUYER.includes(searchPattern) && accountType !== UserAccountType.BUYER) {
                accountTypeFilterSearch = `OR cu.company_role = '${CompanyUserRoleEnum.BUYER}'`;
            }

            if (UserAccountType.SELLER.includes(searchPattern) && accountType !== UserAccountType.SELLER) {
                accountTypeFilterSearch = `OR cu.company_role = '${CompanyUserRoleEnum.SELLER}'`;
            }

            if (UserAccountType.DUAL.includes(searchPattern) && accountType !== UserAccountType.DUAL) {
                accountTypeFilterSearch = `OR cu.company_role = '${CompanyUserRoleEnum.BOTH}'`;
            }

            if (UserAccountType.HAULIER.includes(searchPattern) && accountType !== UserAccountType.HAULIER) {
                accountTypeFilterSearch = `OR cu.company_role = '${CompanyUserRoleEnum.HAULIER}'`;
            }

            if (
                UserAccountType.TRADING_COMPANY_ADMIN?.replace(/_/g, ' ').includes(searchPattern) &&
                accountType !== UserAccountType.TRADING_COMPANY_ADMIN
            ) {
                accountTypeFilterSearch = `OR (cu.company_role = '${CompanyUserRoleEnum.ADMIN}' AND c.is_haulier = false)`;
            }

            if (
                UserAccountType.HAULAGE_COMPANY_ADMIN?.replace(/_/g, ' ').includes(searchPattern) &&
                accountType !== UserAccountType.HAULAGE_COMPANY_ADMIN
            ) {
                if (!accountTypeFilterSearch) {
                    accountTypeFilterSearch = `cu.company_role = '${CompanyUserRoleEnum.ADMIN}' AND c.is_haulier = true`;
                } else {
                    accountTypeFilterSearch = `${accountTypeFilterSearch} OR (cu.company_role = '${CompanyUserRoleEnum.ADMIN}' AND c.is_haulier = true)`;
                }
            }

            searchFilter = `
                AND (
                    LOWER(u.username) LIKE '%${searchPattern}%'
                    OR LOWER(u.email) LIKE '%${searchPattern}%'
                    OR LOWER(u.first_name) LIKE '%${searchPattern}%'
                    OR LOWER(u.last_name) LIKE '%${searchPattern}%'
                    OR LOWER(CONCAT(u.first_name, ' ', u.last_name)) LIKE '%${searchPattern}%'
                    OR LOWER(c.name) LIKE '%${searchPattern}%'
                    OR LOWER(c.country) LIKE '%${searchPattern}%'
                    ${accountTypeFilterSearch}
                )
            `;
        }

        // Check if we need client-side filtering for status fields
        const needsClientSideFilter = !!(overallStatus || onboardingStatus);

        // Build pagination clause
        const paginationClause = needsClientSideFilter ? '' : `LIMIT ${limit} OFFSET ${skip}`;

        // Get users with company data using JOIN (using camelCase aliases)
        const query = `
            SELECT 
                u.id, 
                u.username, 
                u.first_name as "firstName", 
                u.last_name as "lastName", 
                u.email, 
                u.created_at as "createdAt", 
                u.status, 
                u.admin_note as "adminNote",
                u.assign_admin as "assignAdmin",
                aa.id as "assignedAdminId",
                aa.first_name as "assignedAdminFirstName",
                aa.last_name as "assignedAdminLastName",
                aa.email as "assignedAdminEmail",
                aa.global_role as "assignedAdminGlobalRole",
                c.id as "companyId", 
                c.name as "companyName", 
                c.country as "companyCountry",
                c.company_interest as "companyInterest",
                c.is_haulier as "isHaulier",
                c.is_buyer as "isBuyer", 
                c.is_seller as "isSeller",
                cu.company_role as "companyRole"
            FROM users u
            LEFT JOIN company_users cu ON u.id = cu.user_id
            LEFT JOIN companies c ON cu.company_id = c.id
            LEFT JOIN users aa ON (u.assign_admin->>'assignedAdminId')::int = aa.id
            WHERE u.global_role = '${UserRoleEnum.USER}'
            ${statusFilter}
            ${dateFilter}
            ${accountTypeFilter}
            ${registrationStatusFilter}
            ${searchFilter}
            ORDER BY u.created_at DESC
            ${paginationClause}
        `;

        const countQuery = `
        SELECT COUNT(DISTINCT u.id) as count
        FROM users u
        LEFT JOIN company_users cu ON u.id = cu.user_id
        LEFT JOIN companies c ON cu.company_id = c.id
        WHERE u.global_role = '${UserRoleEnum.USER}'
        ${statusFilter}
        ${dateFilter}
        ${accountTypeFilter}
        ${registrationStatusFilter}
        ${searchFilter}
    `;

        // Execute query
        const [usersResult, countResult] = await Promise.all([
            this.userRepository.execute(query),
            paginationClause ? this.userRepository.execute(countQuery) : null,
        ]);

        // Get unique company IDs from results to batch fetch company data
        const companyIds: number[] = [
            ...new Set(usersResult.map((row: UserRowData) => row.companyId).filter(Boolean) as number[]),
        ];

        // Batch fetch all company data in parallel
        const [companiesData, documentsData, locationsData] = await Promise.all([
            companyIds.length > 0 ? this.companiesRepository.find({ where: { id: { inq: companyIds } } }) : [],
            companyIds.length > 0
                ? this.companyDocumentsRepository.find({ where: { companyId: { inq: companyIds } } })
                : [],
            companyIds.length > 0
                ? this.companyLocationsRepository.find({ where: { companyId: { inq: companyIds } } })
                : [],
        ]);

        // Create lookup maps for O(1) access
        const companiesMap = new Map(companiesData.map((c) => [c.id, c]));
        const documentsMap = new Map<number, CompanyDocuments[]>();
        const locationsMap = new Map<number, CompanyLocations[]>();

        // Group documents and locations by company ID
        documentsData.forEach((doc) => {
            if (!documentsMap.has(doc.companyId)) {
                documentsMap.set(doc.companyId, []);
            }
            documentsMap.get(doc.companyId)!.push(doc);
        });

        locationsData.forEach((loc) => {
            if (!locationsMap.has(loc.companyId)) {
                locationsMap.set(loc.companyId, []);
            }
            locationsMap.get(loc.companyId)!.push(loc);
        });

        // Group users by company for batch processing with getDisplayArray
        const usersByCompany = new Map<number, UserRowData[]>();
        const usersWithoutCompany: UserRowData[] = [];

        usersResult.forEach((row: UserRowData) => {
            if (row.companyId) {
                if (!usersByCompany.has(row.companyId)) {
                    usersByCompany.set(row.companyId, []);
                }
                usersByCompany.get(row.companyId)!.push(row);
            } else {
                usersWithoutCompany.push(row);
            }
        });

        // Batch process companies with getDisplayArray
        interface StatusData {
            overallStatus: string;
            registrationStatus: string;
            onboardingStatus: string;
        }
        const statusResults = new Map<number, StatusData>();

        if (usersByCompany.size > 0) {
            const companyDataForDisplay = Array.from(usersByCompany.entries()).map(([companyId, users]) => {
                const company = companiesMap.get(companyId);
                const documents = documentsMap.get(companyId) ?? [];
                const locations = locationsMap.get(companyId) ?? [];

                if (!company) {
                    throw new Error(`Company not found for ID: ${companyId}`);
                }

                return {
                    company,
                    documents,
                    locations,
                    users: users.map(
                        (row) =>
                            ({
                                id: row.id,
                                firstName: row.firstName,
                                lastName: row.lastName,
                                email: row.email,
                            }) as User,
                    ),
                };
            });

            // Get status for all companies at once
            const displayResults = this.companyService.getDisplayArray(companyDataForDisplay);

            // Map results back to users
            displayResults.forEach((result, index) => {
                const companyId = Array.from(usersByCompany.keys())[index];
                const users = usersByCompany.get(companyId)!;

                users.forEach((user: UserRowData) => {
                    statusResults.set(user.id, {
                        overallStatus: result.overallStatus,
                        registrationStatus: result.registrationStatus,
                        onboardingStatus: result.onboardingStatus,
                    });
                });
            });
        }

        // Process users with cached data
        let enrichedUsers = usersResult.map((row: UserRowData) => {
            const companyId = row.companyId;
            let companyData = null;
            let userOverallStatus = '';
            let userRegistrationStatus = '';
            let userOnboardingStatus = '';

            if (companyId) {
                const statusData = statusResults.get(row.id);
                if (statusData) {
                    userOverallStatus = statusData.overallStatus;
                    userRegistrationStatus = statusData.registrationStatus;
                    userOnboardingStatus = statusData.onboardingStatus;
                }

                companyData = {
                    id: companyId,
                    name: row.companyName,
                    country: row.companyCountry,
                    isHaulier: row.isHaulier,
                    isBuyer: row.isBuyer,
                    isSeller: row.isSeller,
                    companyInterest: row.companyInterest,
                };
            }

            const assignAdminData = row.assignAdmin
                ? typeof row.assignAdmin === 'string'
                    ? JSON.parse(row.assignAdmin)
                    : row.assignAdmin
                : null;

            const assignAdmin = assignAdminData
                ? {
                      ...assignAdminData,
                      assignedAdmin: row.assignedAdminId
                          ? {
                                id: row.assignedAdminId,
                                firstName: row.assignedAdminFirstName ?? '',
                                lastName: row.assignedAdminLastName ?? '',
                                email: row.assignedAdminEmail ?? '',
                                globalRole: row.assignedAdminGlobalRole ?? '',
                            }
                          : null,
                  }
                : null;

            return {
                id: row.id,
                username: row.username,
                firstName: row.firstName,
                lastName: row.lastName,
                email: row.email,
                createdAt: row.createdAt,
                status: row.status,
                adminNote: row.adminNote
                    ? typeof row.adminNote === 'string'
                        ? JSON.parse(row.adminNote)
                        : row.adminNote
                    : null,
                assignAdmin,
                overallStatus: userOverallStatus,
                registrationStatus: userRegistrationStatus,
                onboardingStatus: userOnboardingStatus,
                companyRole: row.companyRole,
                companyData,
            };
        });

        // Apply client-side filters for status fields (if needed) - filter once with all conditions
        if (needsClientSideFilter) {
            enrichedUsers = enrichedUsers.filter((user: UserListItem) => {
                // Check overallStatus filter
                if (overallStatus) {
                    const statusLower = overallStatus.toLowerCase();
                    let overallStatusMatch = false;

                    switch (statusLower) {
                        case UserOverallStatus.COMPLETE:
                            overallStatusMatch = user.overallStatus === UserOverallStatus.COMPLETE;
                            break;
                        case UserOverallStatus.AWAITING_APPROVAL:
                            overallStatusMatch = user.overallStatus === UserOverallStatus.AWAITING_APPROVAL;
                            break;
                        case UserOverallStatus.IN_PROGRESS:
                            overallStatusMatch = user.overallStatus === UserOverallStatus.IN_PROGRESS;
                            break;
                    }

                    if (!overallStatusMatch) {
                        return false;
                    }
                }

                // Check onboardingStatus filter
                if (onboardingStatus) {
                    if (!user.onboardingStatus) {
                        return false;
                    }

                    if (user.onboardingStatus !== onboardingStatus) {
                        return false;
                    }
                }

                return true;
            });

            // Apply pagination after client-side filtering
            const totalCount = enrichedUsers.length;
            const paginatedResults = enrichedUsers.slice(skip, skip + limit);

            return {
                totalCount,
                results: paginatedResults,
            };
        }

        return {
            totalCount: parseInt(countResult?.[0]?.count ?? '0'),
            results: enrichedUsers,
        };
    }

    async getUsersCountTabs(): Promise<
        IDataResponse<{
            all: number;
            unverified: number;
            verified: number;
            rejected: number;
            inactive: number;
            blocked: number;
        }>
    > {
        const baseWhere = { globalRole: UserRoleEnum.USER };

        const [all, unverified, verified, rejected, inactive] = await Promise.all([
            this.userRepository.count(baseWhere),
            this.userRepository.count({
                ...baseWhere,
                or: [{ status: UserStatus.PENDING }, { status: UserStatus.REQUEST_INFORMATION }],
            }),
            this.userRepository.count({
                ...baseWhere,
                status: UserStatus.ACTIVE,
            }),
            this.userRepository.count({
                ...baseWhere,
                status: UserStatus.REJECTED,
            }),
            this.userRepository.count({
                ...baseWhere,
                status: UserStatus.ARCHIVED,
            }),
        ]);

        return {
            status: 'success',
            message: 'User counts retrieved successfully',
            data: {
                all: all.count,
                unverified: unverified.count,
                verified: verified.count,
                rejected: rejected.count,
                // inactive: inactive.count,
                inactive: 0, // future scope
                blocked: 0, // Future scope
            },
        };
    }
}
