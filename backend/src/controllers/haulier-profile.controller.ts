import { authenticate } from '@loopback/authentication';
import { inject, service } from '@loopback/core';
import { repository } from '@loopback/repository';
import { get, getModelSchemaRef, HttpErrors, patch, requestBody, response } from '@loopback/rest';
import { SecurityBindings, UserProfile } from '@loopback/security';
import { MyUserProfile } from '../authentication-strategies/type';
import { Companies } from '../models';
import {
    CompaniesRepository,
    CompanyDocumentsRepository,
    CompanyUsersRepository,
    UserRepository,
} from '../repositories';
import { IDataResponse } from '../types/common';
import { WasteTradeNotificationsService } from '../services/waste-trade-notifications.service';
import { NotificationType } from '../enum/notification.enum';
import { CompanyStatus, UserStatus } from '../enum';
import { parseDateToISO } from '../utils/date-parser.util';
import { SalesforceSyncService } from '../services/salesforce/salesforce-sync.service';
import { SalesforceBindings } from '../keys/salesforce';
import { SalesforceLogger } from '../utils/salesforce/salesforce-sync.utils';
import { CompanyUserStatusEnum } from '../enum/company-users.enum';

export class HaulierProfileController {
    constructor(
        @repository(CompaniesRepository)
        public companiesRepository: CompaniesRepository,
        @repository(UserRepository)
        public userRepository: UserRepository,
        @repository(CompanyDocumentsRepository)
        public companyDocumentsRepository: CompanyDocumentsRepository,
        @repository(CompanyUsersRepository)
        public companyUsersRepository: CompanyUsersRepository,

        @service(WasteTradeNotificationsService)
        public wasteTradeNotificationsService: WasteTradeNotificationsService,
        @inject(SalesforceBindings.SYNC_SERVICE, { optional: true })
        private salesforceSyncService?: SalesforceSyncService,
    ) {}

    /**
     * Get haulier profile
     * Task: 6.2.4.1. Haulier Profile
     */
    @authenticate('jwt')
    @get('/haulier/profile')
    @response(200, {
        description: 'Haulier profile',
        content: {
            'application/json': {
                schema: getModelSchemaRef(Companies, { includeRelations: true }),
            },
        },
    })
    async getProfile(
        @inject(SecurityBindings.USER)
        currentUserProfile: UserProfile,
    ): Promise<IDataResponse<any>> {
        const currentUser = currentUserProfile as MyUserProfile;

        // Get company details
        const company = await this.companiesRepository.findById(currentUser.companyId);

        if (!company.isHaulier) {
            throw new HttpErrors.Forbidden('Only hauliers can access this endpoint');
        }

        // Get user details
        const user = await this.userRepository.findById(currentUser.id);

        // Get waste carrier license documents
        const documents = await this.companyDocumentsRepository.find({
            where: {
                companyId: currentUser.companyId,
                documentType: 'waste_carrier_license',
            },
        });

        return {
            status: 'success',
            message: 'Profile retrieved successfully',
            data: {
                // Basic Details
                id: user.id,
                username: user.username,
                accountId: user?.username || user.id,
                prefix: user.prefix,
                firstName: user.firstName,
                lastName: user.lastName,
                jobTitle: user.jobTitle,
                email: user.email,
                phoneNumber: user.phoneNumber,

                // Company Details
                companyName: company.name,
                vatRegistrationCountry: company.vatRegistrationCountry,
                vatNumber: company.vatNumber,
                registrationNumber: company.registrationNumber,
                addressLine1: company.addressLine1,
                addressLine2: company.addressLine2,
                postalCode: company.postalCode,
                city: company.city,
                stateProvince: company.stateProvince,
                country: company.country,
                companyPhoneNumber: company.phoneNumber,
                companyMobileNumber: company.mobileNumber,

                // Additional Information
                fleetType: company.fleetType,
                areasCovered: company.areasCovered,
                containerTypes: company.containerTypes,

                // Waste Carrier License
                wasteCarrierLicense: documents.map((doc) => ({
                    fileName: doc.documentName,
                    expiryDate: doc.expiryDate,
                    documentUrl: doc.documentUrl,
                })),

                // Socials
                facebookUrl: company.facebookUrl,
                instagramUrl: company.instagramUrl,
                linkedinUrl: company.linkedinUrl,
                xUrl: company.xUrl,

                // Status
                status: company.status,
            },
        };
    }

    /**
     * Update haulier profile
     * Task: 6.2.4.2. Edit Haulier Profile (Note: This is task 869abxxnq, not in the current list but related)
     */
    @authenticate('jwt')
    @patch('/haulier/profile')
    @response(204, {
        description: 'Haulier profile PATCH success',
    })
    async updateProfile(
        @requestBody({
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        properties: {
                            // Basic Details
                            prefix: { type: 'string' },
                            firstName: { type: 'string' },
                            lastName: { type: 'string' },
                            jobTitle: { type: 'string' },
                            phoneNumber: { type: 'string' },
                            email: { type: 'string' },

                            // Company Details
                            companyName: { type: 'string' },
                            vatRegistrationCountry: { type: 'string' },
                            vatNumber: { type: 'string' },
                            registrationNumber: { type: 'string' },
                            addressLine1: { type: 'string' },
                            addressLine2: { type: 'string' },
                            postalCode: { type: 'string' },
                            city: { type: 'string' },
                            stateProvince: { type: 'string' },
                            country: { type: 'string' },
                            companyPhoneNumber: { type: 'string' },
                            companyMobileNumber: { type: 'string' },

                            // Additional Information
                            fleetType: { type: 'string' },
                            areasCovered: { type: 'array', items: { type: 'string' } },
                            containerTypes: { type: 'array', items: { type: 'string' } },

                            // Socials
                            facebookUrl: { type: 'string' },
                            instagramUrl: { type: 'string' },
                            linkedinUrl: { type: 'string' },
                            xUrl: { type: 'string' },

                            // Waste Carrier License Documents
                            wasteCarrierLicense: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        fileName: { type: 'string' },
                                        documentUrl: { type: 'string' },
                                        expiryDate: { type: 'string' },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        })
        profileData: any,
        @inject(SecurityBindings.USER)
        currentUserProfile: UserProfile,
    ): Promise<IDataResponse<any>> {
        const currentUser = currentUserProfile as MyUserProfile;

        // Get company details
        const company = await this.companiesRepository.findById(currentUser.companyId);

        if (!company.isHaulier) {
            throw new HttpErrors.Forbidden('Only hauliers can access this endpoint');
        }

        // Update user details
        const userUpdates: any = {};
        if (profileData.prefix) userUpdates.prefix = profileData.prefix;
        if (profileData.firstName) userUpdates.firstName = profileData.firstName;
        if (profileData.lastName) userUpdates.lastName = profileData.lastName;
        if (profileData.jobTitle) userUpdates.jobTitle = profileData.jobTitle;
        if (profileData.phoneNumber) userUpdates.phoneNumber = profileData.phoneNumber;
        if (profileData.email) userUpdates.email = profileData.email;

        if (Object.keys(userUpdates).length > 0) {
            await this.userRepository.updateById(currentUser.id, userUpdates);
        }

        // Update company details
        const companyUpdates: any = {};
        if (profileData.companyName) companyUpdates.name = profileData.companyName;
        if (profileData.vatRegistrationCountry)
            companyUpdates.vatRegistrationCountry = profileData.vatRegistrationCountry;
        if (profileData.vatNumber) companyUpdates.vatNumber = profileData.vatNumber;
        if (profileData.registrationNumber) companyUpdates.registrationNumber = profileData.registrationNumber;
        if (profileData.addressLine1) companyUpdates.addressLine1 = profileData.addressLine1;
        if (profileData.addressLine2 !== undefined) companyUpdates.addressLine2 = profileData.addressLine2;
        if (profileData.postalCode) companyUpdates.postalCode = profileData.postalCode;
        if (profileData.city) companyUpdates.city = profileData.city;
        if (profileData.stateProvince) companyUpdates.stateProvince = profileData.stateProvince;
        if (profileData.country) companyUpdates.country = profileData.country;
        if (profileData.companyPhoneNumber) companyUpdates.phoneNumber = profileData.companyPhoneNumber;
        if (profileData.companyMobileNumber !== undefined)
            companyUpdates.mobileNumber = profileData.companyMobileNumber;
        if (profileData.fleetType) companyUpdates.fleetType = profileData.fleetType;
        if (profileData.areasCovered) companyUpdates.areasCovered = profileData.areasCovered;
        if (profileData.containerTypes) companyUpdates.containerTypes = profileData.containerTypes;
        if (profileData.facebookUrl !== undefined) companyUpdates.facebookUrl = profileData.facebookUrl;
        if (profileData.instagramUrl !== undefined) companyUpdates.instagramUrl = profileData.instagramUrl;
        if (profileData.linkedinUrl !== undefined) companyUpdates.linkedinUrl = profileData.linkedinUrl;
        if (profileData.xUrl !== undefined) companyUpdates.xUrl = profileData.xUrl;

        if (Object.keys(companyUpdates).length > 0) {
            await this.companiesRepository.updateById(currentUser.companyId, companyUpdates);
        }

        // Update waste carrier license documents
        if (profileData.wasteCarrierLicense && Array.isArray(profileData.wasteCarrierLicense)) {
            // Get existing documents to check for changes
            const existingDocs = await this.companyDocumentsRepository.find({
                where: {
                    companyId: currentUser.companyId,
                    documentType: 'waste_carrier_license',
                },
            });

            // Check if documents have changed (add, replace, delete, type change, expiry date change)
            const hasDocumentChanges = this.hasDocumentChanges(existingDocs, profileData.wasteCarrierLicense);

            // Delete existing waste carrier license documents
            await this.companyDocumentsRepository.deleteAll({
                companyId: currentUser.companyId,
                documentType: 'waste_carrier_license',
            });

            // Create new waste carrier license documents
            for (const license of profileData.wasteCarrierLicense) {
                if (license.documentUrl) {
                    await this.companyDocumentsRepository.create({
                        companyId: currentUser.companyId,
                        uploadedByUserId: currentUser.id,
                        documentType: 'waste_carrier_license',
                        documentName: license.fileName || 'Waste Carrier License',
                        documentUrl: license.documentUrl,
                        expiryDate: parseDateToISO(license.expiryDate) || undefined,
                        status: 'pending', // Set to pending for review
                    });
                }
            }

            // If documents changed, set company status back to PENDING for review
            if (hasDocumentChanges) {
                await this.companiesRepository.updateById(currentUser.companyId, {
                    status: CompanyStatus.PENDING,
                });
            }
        }

        await this.wasteTradeNotificationsService.createNotification(
            currentUser.id,
            NotificationType.PROFILE_UPDATED,
            {},
        );

        // Trigger Salesforce sync after haulier profile update
        if (this.salesforceSyncService) {
            try {
                // Sync user as Lead
                await this.salesforceSyncService.syncUserAsLead(currentUser.id, true);

                // Sync company as Account
                if (Object.keys(companyUpdates).length > 0) {
                    await this.salesforceSyncService.syncCompany(currentUser.companyId, true);
                }

                // Sync active CompanyUsers as Contacts (Lead doesn't update Contact)
                const activeCompanyUsers = await this.companyUsersRepository.find({
                    where: { userId: currentUser.id, status: CompanyUserStatusEnum.ACTIVE },
                });
                for (const cu of activeCompanyUsers) {
                    if (cu.id) {
                        await this.salesforceSyncService.syncCompanyUser(cu.id, true).catch((err) => {
                            SalesforceLogger.error('Sync failed for Contact after haulier profile update', err, { entity: 'CompanyUser', companyUserId: cu.id, userId: currentUser.id, action: 'haulier_profile_update' });
                        });
                    }
                }
            } catch (syncError) {
                SalesforceLogger.error('Sync failed after haulier profile update', syncError, { entity: 'User', userId: currentUser.id, companyId: currentUser.companyId, action: 'haulier_profile_update' });
            }
        }

        return {
            status: 'success',
            message: 'Profile updated successfully',
            data: {},
        };
    }

    /**
     * Helper method to check if waste carrier license documents have changed
     */
    private hasDocumentChanges(existingDocs: any[], newDocs: any[]): boolean {
        // Check if count changed (add or delete)
        if (existingDocs.length !== newDocs.length) {
            return true;
        }

        // Check if any document content changed
        for (const newDoc of newDocs) {
            const existingDoc = existingDocs.find((doc) => doc.documentUrl === newDoc.documentUrl);

            // New document URL not found in existing docs (replaced)
            if (!existingDoc) {
                return true;
            }

            // Check if expiry date changed
            const existingExpiry = parseDateToISO(existingDoc.expiryDate);
            const newExpiry = parseDateToISO(newDoc.expiryDate);

            if (existingExpiry !== newExpiry) {
                return true;
            }

            // Check if file name changed (type change)
            if (existingDoc.documentName !== (newDoc.fileName || 'Waste Carrier License')) {
                return true;
            }
        }

        return false;
    }
}
