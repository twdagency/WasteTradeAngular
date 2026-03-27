import { BindingScope, inject, injectable, service } from '@loopback/core';
import { repository } from '@loopback/repository';
import { HttpErrors, Response } from '@loopback/rest';
import { get } from 'lodash';
import { ACCESS_TOKEN_EXPIRED } from '../config';
import { messages, messagesOfCompany } from '../constants';
import { formatDateDocument } from '../constants/company-document';
import {
    AreaCovered,
    CompanyDocumentStatus,
    CompanyInterest,
    CompanyStatus,
    CompanyUserRoleEnum,
    CompanyUserStatusEnum,
    ContainerType,
    UserRoleEnum,
    UserStatus,
} from '../enum';
import { PasswordHasherBindings, TokenServiceBindings } from '../keys';
import { UserWithRelations } from '../models';
import { RegisterHaulierRequest } from '../models/register-haulier-request.model';
import { RegisterTradingRequest } from '../models/register-trading-request.model';
import { SalesforceBindings } from '../keys/salesforce';
import { SalesforceLogger } from '../utils/salesforce/salesforce-sync.utils';
import { CompaniesRepository } from '../repositories/companies.repository';
import { CompanyDocumentsRepository } from '../repositories/company-documents.repository';
import { CompanyUsersRepository } from '../repositories/company-users.repository';
import { Credentials, UserRepository } from '../repositories/user.repository';
import { IDataResponse, SuccessData } from '../types';
import { ILoginResponseData, IUserLoginData } from '../types/auth';
import {
    checkValidAreaCovered,
    checkValidContainerType,
    checkValidEmail,
    parseDateToISO,
    validateDate,
} from '../utils';
import { MaterialUsersRepository } from './../repositories/material-users.repository';
import { MaterialsRepository } from './../repositories/materials.repository';
import { EmailService } from './email.service';
import { PasswordHasher } from './hash.password.bcryptjs';
import { JWTService } from './jwt-service';
import { SalesforceSyncService } from './salesforce/salesforce-sync.service';
import { MyUserService } from './user.service';

const vars = {
    jwtConfig: {
        expire: ACCESS_TOKEN_EXPIRED,
    },
};

@injectable({ scope: BindingScope.TRANSIENT })
export class AuthService {
    constructor(
        @repository(UserRepository)
        public userRepository: UserRepository,
        @service(MyUserService)
        public userService: MyUserService,
        @inject(TokenServiceBindings.TOKEN_SERVICE)
        public jwtService: JWTService,
        @inject(PasswordHasherBindings.PASSWORD_HASHER)
        public passwordHasher: PasswordHasher,
        @repository(CompaniesRepository)
        public companiesRepository: CompaniesRepository,
        @repository(CompanyUsersRepository)
        public companyUsersRepository: CompanyUsersRepository,
        @repository(CompanyDocumentsRepository)
        public companyDocumentsRepository: CompanyDocumentsRepository,
        @repository(MaterialsRepository)
        public materialsRepository: MaterialsRepository,
        @repository('MaterialUsersRepository')
        public materialUsersRepository: MaterialUsersRepository,
        @service(EmailService)
        public emailService: EmailService,
        @inject(SalesforceBindings.SYNC_SERVICE, { optional: true })
        private salesforceSyncService?: SalesforceSyncService,
    ) {}

    // Generate unique 8-digit numeric username
    public async generateUniqueUsername(): Promise<string> {
        let isUnique = false;
        let username = '';

        while (!isUnique) {
            // Generate a random 8-digit number
            const min = 10000000; // Smallest 8-digit number
            const max = 99999999; // Largest 8-digit number
            username = Math.floor(min + Math.random() * (max - min + 1)).toString();

            // Check if username already exists
            const existingUser = await this.userRepository.findOne({
                where: { username },
            });

            if (!existingUser) {
                isUnique = true;
            }
        }

        return username;
    }

    public async login(
        credential: Credentials,
        forceLogin: boolean = false,
    ): Promise<IDataResponse<ILoginResponseData>> {
        try {
            const userData: UserWithRelations | null = await this.userRepository.findOne({
                where: {
                    email: credential.email.toLowerCase(),
                },
            });

            if (!userData) {
                throw new HttpErrors[401](messages.accountAndPasswordInvalid);
            }

            if (userData.status === UserStatus.ARCHIVED) {
                throw new HttpErrors[401](messages.accountArchived);
            }

            const companyUser = await this.companyUsersRepository.findOne({
                where: {
                    userId: userData.id,
                },
                include: ['company'],
            });

            const passwordMatch: boolean = await this.passwordHasher.comparePassword(
                credential.password,
                userData?.passwordHash ?? '',
            );

            if (!passwordMatch && !forceLogin) {
                throw new HttpErrors[401](messages.accountAndPasswordInvalid);
            }

            const isHaulier = !!companyUser?.company?.isHaulier;
            userData.isHaulier = isHaulier;
            const userProfile = this.userService.convertToUserProfile(userData!, companyUser, companyUser?.company);
            const expTime: number = Math.floor(Date.now() / 1000) + parseInt(vars.jwtConfig.expire ?? '0');
            const requestToken: string = await this.jwtService.generateToken(userProfile, expTime);
            const currentUser: IUserLoginData = {
                id: userData?.id ?? 0,
                email: userData?.email,
                accessToken: requestToken,
                globalRole: userData?.globalRole,
                companyRole: companyUser?.companyRole,
                isHaulier,
            };

            await this.userRepository.updateById(userData.id, { lastLoginAt: new Date() });

            return {
                status: 'success',
                message: 'Login successfully',
                data: { user: currentUser },
            };
        } catch (error) {
            const message = get(error, 'message', messages.accountAndPasswordInvalid);

            throw new HttpErrors[401](message);
        }
    }

    public async refreshToken(
        email: string,
        response: Response,
    ): Promise<SuccessData<ILoginResponseData> | Response | undefined> {
        try {
            const currentUserData: UserWithRelations | null = await this.userRepository.findOne({
                where: {
                    email,
                },
            });
            if (currentUserData) {
                const companyUser = await this.companyUsersRepository.findOne({
                    where: {
                        userId: currentUserData.id,
                    },
                    include: ['company'],
                });
                const userProfile = this.userService.convertToUserProfile(
                    currentUserData,
                    companyUser,
                    companyUser?.company,
                );
                const expTime: number = Math.floor(Date.now() / 1000) + parseInt(vars.jwtConfig.expire ?? '0');
                const requestToken: string = await this.jwtService.generateToken(userProfile, expTime);
                const currentUser: IUserLoginData = {
                    id: currentUserData?.id ?? 0,
                    email: currentUserData?.email ?? '',
                    accessToken: requestToken,
                };
                return { data: { user: currentUser } };
            }
        } catch (error) {
            throw new HttpErrors[401](messages.accountInvalid);
        }
    }

    // private checkUnarchiveUser(userData: User | UserWithRelations | null): boolean {
    //   if (userData?.isArchived) return true
    //   return false
    // }
    // private checkUserExistence(userData: User | UserWithRelations | null): boolean {
    //   if (userData?.email && userData?.passwordHash) {
    //     return true
    //   }
    //   return false
    // }

    private async checkEmailExisted(email: string): Promise<boolean> {
        const foundUser = await this.userRepository.findOne({
            where: { email },
        });

        return foundUser ? true : false;
    }

    public async registerTrading(registerRequest: RegisterTradingRequest): Promise<IDataResponse> {
        const { companyName, password, favoriteMaterials, companyInterest, otherMaterial, ...userDetails } =
            registerRequest;
        const email = registerRequest.email.toLowerCase();
        const emailValid = checkValidEmail(email);

        if (!emailValid) {
            throw new HttpErrors[422](messages.invalidEmail);
        }

        const isExistedEmail = await this.checkEmailExisted(email);

        if (isExistedEmail) {
            throw new HttpErrors[422](messages.existedUser);
        }

        if (password.length < 8) {
            throw new HttpErrors[422](messages.invalidPassword);
        }

        const passwordHash = await this.passwordHasher.hashPassword(password);

        // Generate unique username
        const username = await this.generateUniqueUsername();

        const userData = {
            ...userDetails,
            username,
            passwordHash,
            globalRole: UserRoleEnum.USER,
            isVerified: false,
            status: UserStatus.PENDING,
            notificationEmailEnabled: true,
            notificationPushEnabled: true,
            notificationInAppEnabled: true,
        };
        const savedUser = await this.userRepository.create(userData);

        // Set isBuyer and isSeller based on companyInterest to ensure consistency
        const isBuyer = companyInterest === CompanyInterest.BUYER || companyInterest === CompanyInterest.BOTH;
        const isSeller = companyInterest === CompanyInterest.SELLER || companyInterest === CompanyInterest.BOTH;

        const savedCompany = await this.companiesRepository.create({
            name: companyName,
            favoriteMaterials,
            otherMaterial,
            companyInterest,
            isBuyer,
            isSeller,
            isHaulier: false,
            status: CompanyStatus.PENDING,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        });
        const companyUserData = {
            companyId: savedCompany.id,
            userId: savedUser.id,
            companyRole: CompanyUserRoleEnum.ADMIN,
            isPrimaryContact: false,
            status: CompanyUserStatusEnum.PENDING,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        const savedCompanyUser = await this.companyUsersRepository.create(companyUserData);
        const userProfile = this.userService.convertToUserProfile(savedUser!, savedCompanyUser, savedCompany);
        const expTime: number = Math.floor(Date.now() / 1000) + parseInt(vars.jwtConfig.expire ?? '0');
        const requestToken: string = await this.jwtService.generateToken(userProfile, expTime);
        const response = {
            status: 'success',
            message: 'User registered successfully',
            data: {
                user: savedUser,
                company: savedCompany,
                companyUser: savedCompanyUser,
                accessToken: requestToken,
            },
        };

        // Send admin notification email after successful registration
        await this.emailService.sendAdminNotification(savedCompany);

        // Send user confirmation email after successful registration
        await this.emailService.sendAccountVerificationRequiredEmail(savedUser);

        // 🚀 Salesforce Integration: Sync new user as Lead after registration
        if (this.salesforceSyncService && savedUser.id) {
            this.salesforceSyncService.syncUserAsLead(savedUser.id, true, false, 'register').catch((syncError) => {
                SalesforceLogger.error('Sync failed after user registration', syncError, { entity: 'User', userId: savedUser.id, action: 'register' });
            });
        }

        return response;
    }

    public async registerHaulier(registerRequest: RegisterHaulierRequest): Promise<IDataResponse> {
        const { password, containerTypes, areasCovered } = registerRequest;
        const email = registerRequest.email.toLowerCase();
        const emailValid = checkValidEmail(email);

        if (!emailValid) {
            throw new HttpErrors[422](messages.invalidEmail);
        }

        const isExistedEmail = await this.checkEmailExisted(email);

        if (isExistedEmail) {
            throw new HttpErrors[422](messages.existedUser);
        }

        if (password.length < 8) {
            throw new HttpErrors[422](messages.invalidPassword);
        }

        if (containerTypes?.length > 0) {
            const isValidContainerType = checkValidContainerType(containerTypes);
            if (!isValidContainerType) {
                throw new HttpErrors[422](messagesOfCompany.invalidContainerType);
            }
            if (containerTypes.includes(ContainerType.ALL)) {
                if (containerTypes.length > 1) {
                    throw new HttpErrors[422](messagesOfCompany.invalidContainerType);
                }
            }
        }

        if (areasCovered?.length > 0) {
            const isValidAreaCovered = checkValidAreaCovered(areasCovered) ?? [];
            if (!isValidAreaCovered) {
                throw new HttpErrors[422](messagesOfCompany.invalidAreaCovered);
            }
        }

        if (areasCovered?.includes(AreaCovered.UK_ONLY) || areasCovered?.includes(AreaCovered.WORLDWIDE)) {
            if (areasCovered?.length > 1) {
                throw new HttpErrors[422](messagesOfCompany.invalidAreaCovered);
            }
        }

        const passwordHash = await this.passwordHasher.hashPassword(password);

        for (const document of registerRequest.documents) {
            if (!validateDate(document.expiryDate, formatDateDocument)) {
                throw new HttpErrors[422](messages.invalidExpiryDate);
            }
            if (!document.documentType) {
                throw new HttpErrors[422](messages.missingDocumentType);
            }
            if (!document.documentUrl) {
                throw new HttpErrors[422](messages.missingDocumentUrl);
            }
        }

        // Generate unique username
        const username = await this.generateUniqueUsername();

        const userData = {
            username,
            email,
            passwordHash,
            prefix: registerRequest.prefix,
            firstName: registerRequest.firstName,
            lastName: registerRequest.lastName,
            jobTitle: registerRequest.jobTitle,
            phoneNumber: registerRequest.phoneNumberUser,
            mobileNumber: registerRequest.mobileNumberUser ?? '',
            isVerified: false,
            globalRole: UserRoleEnum.USER,
            status: UserStatus.PENDING,
            notificationEmailEnabled: true,
            notificationPushEnabled: true,
            notificationInAppEnabled: true,
            whereDidYouHearAboutUs: registerRequest.whereDidYouHearAboutUs,
        };
        const savedUser = await this.userRepository.create(userData);
        const companyData = {
            name: registerRequest.companyName,
            isHaulier: true,
            country: registerRequest.country,
            addressLine1: registerRequest.addressLine1,
            city: registerRequest.city,
            stateProvince: registerRequest.stateProvince,
            postalCode: registerRequest.postalCode,
            registrationNumber: registerRequest.registrationNumber,
            vatNumber: registerRequest.vatNumber,
            vatRegistrationCountry: registerRequest.vatRegistrationCountry,
            phoneNumber: registerRequest.phoneNumberCompany,
            mobileNumber: registerRequest.mobileNumberCompany,
            containerTypes: registerRequest.containerTypes,
            areasCovered: registerRequest.areasCovered,
            fleetType: registerRequest.fleetType,
            status: CompanyStatus.PENDING,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        const savedCompany = await this.companiesRepository.create(companyData);
        const companyUserData = {
            companyId: savedCompany.id,
            userId: savedUser.id,
            companyRole: CompanyUserRoleEnum.ADMIN,
            isPrimaryContact: true,
            status: CompanyUserStatusEnum.PENDING,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };
        const savedCompanyUser = await this.companyUsersRepository.create(companyUserData);

        const savedCompanyDocumentArray = [];

        for (const documentItem of registerRequest.documents) {
            const companyDocumentData = {
                companyId: savedCompany.id,
                uploadedByUserId: savedUser.id,
                documentType: documentItem.documentType,
                documentName: documentItem.documentType,
                documentUrl: documentItem.documentUrl,
                expiryDate: parseDateToISO(documentItem.expiryDate),
                status: CompanyDocumentStatus.PENDING,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            const savedCompanyDocument = await this.companyDocumentsRepository.create(companyDocumentData);
            savedCompanyDocumentArray.push(savedCompanyDocument);
        }
        const userProfile = this.userService.convertToUserProfile(savedUser!, savedCompanyUser, savedCompany);
        const expTime: number = Math.floor(Date.now() / 1000) + parseInt(vars.jwtConfig.expire ?? '0');
        const requestToken: string = await this.jwtService.generateToken(userProfile, expTime);
        const response = {
            status: 'success',
            message: 'User registered successfully',
            data: {
                user: savedUser,
                company: savedCompany,
                companyUser: savedCompanyUser,
                companyDocuments: savedCompanyDocumentArray,
                accessToken: requestToken,
            },
        };

        await this.emailService.sendAccountVerificationRequiredEmail(savedUser);

        // Send admin notification email after successful registration
        await this.emailService.sendAdminNotification(savedCompany);

        // 🚀 Salesforce Integration: Sync new user as Lead after registration
        if (this.salesforceSyncService && savedUser.id) {
            this.salesforceSyncService.syncUserAsLead(savedUser.id, true, false, 'socialRegister').catch((syncError) => {
                SalesforceLogger.error('Sync failed after user registration', syncError, { entity: 'User', userId: savedUser.id, action: 'register' });
            });
        }

        return response;
    }
}
