import { BindingScope, inject, injectable, service } from '@loopback/core';
import { AnyObject, Filter, IsolationLevel, repository } from '@loopback/repository';
import { HttpErrors } from '@loopback/rest';
import { get, omit } from 'lodash';
import { MyUserProfile } from '../authentication-strategies/type';
import { messages } from '../constants';
import { messagesOfCompany } from '../constants/company';
import {
    CompanyDocumentStatus,
    CompanyInterest,
    CompanyStatus,
    CompanyUserRequestStatusEnum,
    CompanyUserRoleEnum,
    CompanyUserRoleSearch,
    CompanyUserStatusEnum,
    NotificationType,
    OnboardingStatus,
    UserAccountType,
    UserOverallStatus,
    UserRegistrationStatus,
    UserStatus,
    UserTabFilter,
} from '../enum';
import { AuthHelper } from '../helpers';
import { Companies, CompanyDocuments, CompanyLocations, CompanyUsers, UpdateCompanyRequest, User } from '../models';
import { SalesforceBindings } from '../keys/salesforce';
import { SalesforceLogger } from '../utils/salesforce/salesforce-sync.utils';
import {
    CompaniesRepository,
    CompanyDocumentsRepository,
    CompanyLocationsRepository,
    CompanyUserRequestsRepository,
    CompanyUsersRepository,
    UserRepository,
} from '../repositories';
import { CompanyUserListItem, IDataResponse, PaginationList } from '../types';
import { getValidArray } from '../utils';
import { EmailService } from './email.service';
import { SalesforceSyncService } from './salesforce/salesforce-sync.service';
import { WasteTradeNotificationsService } from './waste-trade-notifications.service';

interface PendingCompanyResult {
    id: number;
    name: string;
    registrationNumber: string;
    email: string;
    vatNumber: string;
    vatRegistrationCountry: string;
    addressLine1: string;
    addressLine2: string | null;
    city: string;
    country: string;
    stateProvince: string;
    postalCode: string;
    phoneNumber: string;
    status: string;
    createdAt: string;
    updatedAt: string;
    // User fields
    userId: number;
    userFirstName: string;
    userLastName: string;
    userEmail: string;
    userPhoneNumber: string;
    userRole: string;
    // Documents as JSON array
    documents: Array<{
        id: number;
        documentType: string;
        documentName: string;
        documentUrl: string;
        status: string;
        expiryDate: string | null;
        createdAt: string;
    }>;
    locations: Array<{}>;
}

@injectable({ scope: BindingScope.TRANSIENT })
export class CompanyService {
    constructor(
        @repository(CompaniesRepository)
        public companiesRepository: CompaniesRepository,
        @repository(CompanyUsersRepository)
        public companyUserRepository: CompanyUsersRepository,
        @repository(CompanyDocumentsRepository)
        public companyDocumentsRepository: CompanyDocumentsRepository,
        @repository(CompanyLocationsRepository)
        public companyLocationsRepository: CompanyLocationsRepository,
        @repository(CompanyUserRequestsRepository)
        public companyUserRequestsRepository: CompanyUserRequestsRepository,
        @repository(UserRepository)
        public userRepository: UserRepository,

        @service(EmailService)
        public emailService: EmailService,
        @service(WasteTradeNotificationsService)
        public wasteTradeNotificationsService: WasteTradeNotificationsService,

        @inject(SalesforceBindings.SYNC_SERVICE, { optional: true })
        private salesforceSyncService?: SalesforceSyncService,
    ) {}

    private getRolePriority(role: string): number {
        switch (role) {
            case CompanyUserRoleEnum.ADMIN:
                return 4;
            case CompanyUserRoleEnum.BOTH:
                return 3;
            case CompanyUserRoleEnum.SELLER:
            case CompanyUserRoleEnum.BUYER:
                return 2;
            case CompanyUserRoleEnum.HAULIER:
                return 1;
            default:
                return 0;
        }
    }

    public async mergeCompanies(
        masterCompanyId: number,
        mergedCompanyId: number,
        currentUser: MyUserProfile,
    ): Promise<IDataResponse> {
        if (masterCompanyId === mergedCompanyId) {
            throw new HttpErrors.BadRequest('Select a different company');
        }

        // Only global admins can merge companies
        AuthHelper.validateAdmin(currentUser.globalRole);

        const [masterCompany, mergedCompany] = await Promise.all([
            this.companiesRepository.findById(masterCompanyId),
            this.companiesRepository.findById(mergedCompanyId),
        ]);

        if (!masterCompany || !mergedCompany) {
            throw new HttpErrors.NotFound('One or both companies not found');
        }

        if (masterCompany.isHaulier && !mergedCompany.isHaulier) {
            throw new HttpErrors.BadRequest('Companies must be of the same type');
        }

        const tx = await this.companiesRepository.dataSource.beginTransaction({
            isolationLevel: IsolationLevel.READ_COMMITTED,
        });

        try {
            // Pre-calc counts for audit
            const countQueries = [
                this.companiesRepository.execute(
                    `SELECT COUNT(*)::int AS count FROM company_users WHERE company_id = ${mergedCompanyId}`,
                    [],
                    { transaction: tx },
                ),
                this.companiesRepository.execute(
                    `SELECT COUNT(*)::int AS count FROM company_locations WHERE company_id = ${mergedCompanyId}`,
                    [],
                    { transaction: tx },
                ),
                this.companiesRepository.execute(
                    `SELECT COUNT(*)::int AS count FROM company_documents WHERE company_id = ${mergedCompanyId}`,
                    [],
                    { transaction: tx },
                ),
                this.companiesRepository.execute(
                    `SELECT COUNT(*)::int AS count FROM listings WHERE company_id = ${mergedCompanyId}`,
                    [],
                    { transaction: tx },
                ),
                this.companiesRepository.execute(
                    `SELECT COUNT(*)::int AS count FROM offers WHERE buyer_company_id = ${mergedCompanyId} OR seller_company_id = ${mergedCompanyId}`,
                    [],
                    { transaction: tx },
                ),
                this.companiesRepository.execute(
                    `SELECT COUNT(*)::int AS count FROM haulage_offers WHERE haulier_company_id = ${mergedCompanyId}`,
                    [],
                    { transaction: tx },
                ),
                this.companiesRepository.execute(
                    `SELECT COUNT(*)::int AS count FROM sample_requests WHERE buyer_company_id = ${mergedCompanyId} OR seller_company_id = ${mergedCompanyId}`,
                    [],
                    { transaction: tx },
                ),
                this.companiesRepository.execute(
                    `SELECT COUNT(*)::int AS count FROM mfi_requests WHERE buyer_company_id = ${mergedCompanyId} OR seller_company_id = ${mergedCompanyId}`,
                    [],
                    { transaction: tx },
                ),
            ];

            const [
                membersCountRes,
                locationsCountRes,
                documentsCountRes,
                listingsCountRes,
                offersCountRes,
                haulageOffersCountRes,
                sampleRequestsCountRes,
                mfiRequestsCountRes,
            ] = await Promise.all(countQueries);

            const movedCounts = {
                members: membersCountRes[0]?.count ?? 0,
                locations: locationsCountRes[0]?.count ?? 0,
                documents: documentsCountRes[0]?.count ?? 0,
                listings: listingsCountRes[0]?.count ?? 0,
                offers: offersCountRes[0]?.count ?? 0,
                haulageOffers: haulageOffersCountRes[0]?.count ?? 0,
                sampleRequests: sampleRequestsCountRes[0]?.count ?? 0,
                mfiRequests: mfiRequestsCountRes[0]?.count ?? 0,
            };

            // Merge company_users with role priority (collapse duplicates)
            const companyUsers = await this.companyUserRepository.find({
                where: { companyId: { inq: [masterCompanyId, mergedCompanyId] } },
            });

            const usersByUserId = new Map<number, CompanyUsers[]>();
            for (const cu of companyUsers) {
                if (!usersByUserId.has(cu.userId)) {
                    usersByUserId.set(cu.userId, []);
                }
                usersByUserId.get(cu.userId)?.push(cu);
            }

            const now = new Date().toISOString();

            for (const [, records] of usersByUserId.entries()) {
                const masterRecord = records.find((r) => r.companyId === masterCompanyId);
                const mergedRecord = records.find((r) => r.companyId === mergedCompanyId);

                if (!mergedRecord) {
                    continue;
                }

                // Decide best role across both records
                const roles = records.map((r) => r.companyRole);
                let bestRole = roles[0];
                for (const role of roles) {
                    if (this.getRolePriority(role) > this.getRolePriority(bestRole)) {
                        bestRole = role;
                    }
                }

                if (masterRecord) {
                    if (masterRecord.companyRole !== bestRole) {
                        await this.companyUserRepository.updateById(
                            masterRecord.id,
                            { companyRole: bestRole, updatedAt: now },
                            { transaction: tx },
                        );
                    }

                    // Remove merged record
                    await this.companyUserRepository.deleteById(mergedRecord.id, { transaction: tx });
                } else {
                    // Move merged record to master company
                    await this.companyUserRepository.updateById(
                        mergedRecord.id,
                        { companyId: masterCompanyId, companyRole: bestRole, updatedAt: now },
                        { transaction: tx },
                    );
                }
            }

            // Reassign other foreign keys from merged -> master
            await this.companiesRepository.execute(
                `UPDATE company_locations SET company_id = ${masterCompanyId}, main_location = false WHERE company_id = ${mergedCompanyId}`,
                [],
                { transaction: tx },
            );

            await this.companiesRepository.execute(
                `UPDATE company_documents SET company_id = ${masterCompanyId} WHERE company_id = ${mergedCompanyId}`,
                [],
                { transaction: tx },
            );

            await this.companiesRepository.execute(
                `UPDATE company_user_requests SET company_id = ${masterCompanyId} WHERE company_id = ${mergedCompanyId}`,
                [],
                { transaction: tx },
            );

            await this.companiesRepository.execute(
                `UPDATE listings SET company_id = ${masterCompanyId} WHERE company_id = ${mergedCompanyId}`,
                [],
                { transaction: tx },
            );

            await this.companiesRepository.execute(
                `UPDATE offers SET buyer_company_id = ${masterCompanyId} WHERE buyer_company_id = ${mergedCompanyId}`,
                [],
                { transaction: tx },
            );

            await this.companiesRepository.execute(
                `UPDATE offers SET seller_company_id = ${masterCompanyId} WHERE seller_company_id = ${mergedCompanyId}`,
                [],
                { transaction: tx },
            );

            await this.companiesRepository.execute(
                `UPDATE haulage_offers SET haulier_company_id = ${masterCompanyId} WHERE haulier_company_id = ${mergedCompanyId}`,
                [],
                { transaction: tx },
            );

            // Sample requests: move buyer/seller company to master
            await this.companiesRepository.execute(
                `UPDATE sample_requests
                 SET buyer_company_id = CASE WHEN buyer_company_id = ${mergedCompanyId} THEN ${masterCompanyId} ELSE buyer_company_id END,
                     seller_company_id = CASE WHEN seller_company_id = ${mergedCompanyId} THEN ${masterCompanyId} ELSE seller_company_id END
                 WHERE buyer_company_id = ${mergedCompanyId} OR seller_company_id = ${mergedCompanyId}`,
                [],
                { transaction: tx },
            );

            // MFI requests: move buyer/seller company to master
            await this.companiesRepository.execute(
                `UPDATE mfi_requests
                 SET buyer_company_id = CASE WHEN buyer_company_id = ${mergedCompanyId} THEN ${masterCompanyId} ELSE buyer_company_id END,
                     seller_company_id = CASE WHEN seller_company_id = ${mergedCompanyId} THEN ${masterCompanyId} ELSE seller_company_id END
                 WHERE buyer_company_id = ${mergedCompanyId} OR seller_company_id = ${mergedCompanyId}`,
                [],
                { transaction: tx },
            );

            // Finally, delete merged company
            await this.companiesRepository.deleteById(mergedCompanyId, { transaction: tx });

            await tx.commit();

            // Sync company merge to Salesforce (after successful commit)
            if (this.salesforceSyncService) {
                this.salesforceSyncService
                    .syncCompanyMerge(masterCompanyId, mergedCompanyId, mergedCompany.salesforceId)
                    .catch((syncError) => {
                        SalesforceLogger.error('Sync failed after company merge', syncError, {
                            entity: 'Company',
                            masterCompanyId,
                            mergedCompanyId,
                            action: 'merge',
                        });
                    });
            }

            return {
                status: 'success',
                message: 'Companies merged successfully',
                data: {
                    masterCompanyId,
                    mergedCompanyId,
                    movedCounts,
                },
            };
        } catch (error) {
            await tx.rollback();
            throw new HttpErrors.InternalServerError(
                `Failed to merge companies: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
        }
    }

    public async createCompany(company: Omit<Companies, 'id'>): Promise<IDataResponse> {
        const companyData = {
            ...company,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
        };

        const companyResultData = await this.companiesRepository.create(companyData);

        // Trigger Salesforce sync after successful creation
        if (this.salesforceSyncService && companyResultData.id) {
            this.salesforceSyncService.syncCompany(companyResultData.id, true, false, 'createCompany').catch((syncError) => {
                SalesforceLogger.error('Sync failed after company creation', syncError, {
                    entity: 'Company',
                    companyId: companyResultData.id,
                    action: 'create',
                });
            });
        }

        return {
            status: 'success',
            message: messagesOfCompany.createCompanySuccess,
            data: {
                company: companyResultData,
            },
        };
    }

    public async updateCompany(
        company: UpdateCompanyRequest,
        companyId: number,
        userId: string,
    ): Promise<IDataResponse> {
        try {
            const { companyInterest } = company;

            const companyUser = await this.companyUserRepository.findOne({
                where: { userId: Number(userId), companyId, companyRole: CompanyUserRoleEnum.ADMIN },
            });

            if (!companyUser || companyUser === null) {
                throw new HttpErrors.Unauthorized(messages.unauthorized);
            }

            // Prepare update data and ensure consistency between companyInterest and isBuyer/isSeller
            const updateData = company;

            // If companyInterest is being updated, ensure isBuyer and isSeller are consistent
            if (companyInterest) {
                updateData.isBuyer =
                    companyInterest === CompanyInterest.BUYER || companyInterest === CompanyInterest.BOTH;
                updateData.isSeller =
                    companyInterest === CompanyInterest.SELLER || companyInterest === CompanyInterest.BOTH;
            }
            // If isBuyer or isSeller are being updated independently, derive companyInterest
            else if (company.isBuyer !== undefined || company.isSeller !== undefined) {
                // Get current company data to fill in missing values
                const currentCompany = await this.companiesRepository.findById(companyId);
                const newIsBuyer = company.isBuyer ?? currentCompany.isBuyer;
                const newIsSeller = company.isSeller ?? currentCompany.isSeller;

                // Derive companyInterest from isBuyer and isSeller
                if (newIsBuyer && newIsSeller) {
                    updateData.companyInterest = CompanyInterest.BOTH;
                } else if (newIsSeller) {
                    updateData.companyInterest = CompanyInterest.SELLER;
                } else {
                    updateData.companyInterest = CompanyInterest.BUYER;
                }
            }

            await this.companiesRepository.updateById(companyId, updateData);

            // Trigger Salesforce sync after company update
            if (this.salesforceSyncService) {
                this.salesforceSyncService.syncCompany(companyId, true, false, 'updateCompany').catch((syncError) => {
                    SalesforceLogger.error('Sync failed after company update', syncError, {
                        entity: 'Company',
                        companyId,
                        action: 'update',
                    });
                });
            }

            return {
                status: 'success',
                message: messagesOfCompany.updateCompanySuccess,
                data: {},
            };
        } catch (error) {
            return {
                status: 'error',
                message: messages.serverError,
                data: {},
            };
        }
    }

    public async getPendingCompanies(filter?: Filter<Companies>): Promise<{
        total: number;
        data: Array<{
            company: Companies;
            users: Array<{
                companyUser: CompanyUsers;
                user: User;
            }>;
            documents: CompanyDocuments[];
            locations: CompanyLocations[];
        }>;
    }> {
        // Build the base SQL query with proper joins and JSON aggregation
        const baseQuery = `
            WITH company_docs AS (
                SELECT 
                    company_id,
                    json_agg(
                        json_build_object(
                            'id', id,
                            'documentType', document_type,
                            'documentName', document_name,
                            'documentUrl', document_url,
                            'status', status,
                            'expiryDate', expiry_date,
                            'createdAt', created_at
                        ) ORDER BY id
                    ) FILTER (WHERE id IS NOT NULL) as company_documents
                FROM company_documents
                GROUP BY company_id
            ),
            company_locations_agg AS (
                SELECT 
                    company_id,
                    json_agg(
                        json_build_object(
                            'id', id,
                            'locationName', location_name,
                            'prefix', prefix,
                            'firstName', first_name,
                            'lastName', last_name,
                            'positionInCompany', position_in_company,
                            'sitePointContact', site_point_contact,
                            'phoneNumber', phone_number,
                            'addressLine', address_line,
                            'street', street,
                            'postcode', postcode,
                            'city', city,
                            'country', country,
                            'stateProvince', state_province,
                            'officeOpenTime', office_open_time,
                            'officeCloseTime', office_close_time,
                            'loadingRamp', loading_ramp,
                            'weighbridge', weighbridge,
                            'containerType', container_type,
                            'selfLoadUnLoadCapability', self_load_unload_capability,
                            'accessRestrictions', access_restrictions,
                            'createdAt', created_at,
                            'updatedAt', updated_at
                        ) ORDER BY id
                    ) FILTER (WHERE id IS NOT NULL) as company_locations
                FROM company_locations
                GROUP BY company_id
            )
            SELECT DISTINCT ON (c.id)
                c.*,
                u.id as "userId",
                u.first_name as "userFirstName",
                u.last_name as "userLastName",
                u.email as "userEmail",
                u.phone_number as "userPhoneNumber",
                cu.company_role as "userRole",
                COALESCE(cd.company_documents, '[]'::json) as documents,
                COALESCE(cl.company_locations, '[]'::json) as locations
            FROM companies c
            LEFT JOIN company_users cu ON c.id = cu.company_id
            LEFT JOIN users u ON cu.user_id = u.id
            LEFT JOIN company_docs cd ON c.id = cd.company_id
            LEFT JOIN company_locations_agg cl ON c.id = cl.company_id
            WHERE c.status = '${CompanyStatus.PENDING}'
        `;

        // Add any additional where conditions from the filter
        let whereClause = '';
        if (filter?.where) {
            const conditions: string[] = [];
            Object.entries(filter.where).forEach(([key, value]) => {
                if (key !== 'status') {
                    // Skip status as it's already in base query
                    if (key === 'documents') {
                        // Handle JSON array comparison specially
                        conditions.push(`c."${key}"::text = '${JSON.stringify(value)}'::text`);
                    } else if (typeof value === 'string') {
                        conditions.push(`c."${key}" = '${value}'`);
                    } else if (value === null) {
                        conditions.push(`c."${key}" IS NULL`);
                    } else {
                        conditions.push(`c."${key}" = ${value}`);
                    }
                }
            });
            if (conditions.length > 0) {
                whereClause = ` AND ${conditions.join(' AND ')}`;
            }
        }

        // Build the count query
        const countQuery = `
            SELECT COUNT(DISTINCT c.id) as total
            FROM companies c
            WHERE c.status = '${CompanyStatus.PENDING}'${whereClause}
        `;

        // Add order by
        let orderBy = ' ORDER BY c.id, c.created_at DESC';
        if (filter?.order) {
            const orderParts = filter.order.map((order) => {
                const [field, direction] = order.split(' ');
                if (field === 'documents') {
                    return `c."${field}"::text ${direction || 'ASC'}`;
                }
                return `c."${field}" ${direction || 'ASC'}`;
            });
            orderBy = ` ORDER BY c.id, ${orderParts.join(', ')}`;
        }

        // Build the final data query with pagination
        const dataQuery =
            baseQuery +
            whereClause +
            orderBy +
            (filter?.limit ? ` LIMIT ${filter.limit}` : '') +
            (filter?.skip ? ` OFFSET ${filter.skip}` : '');

        // Execute both queries
        const [countResult, dataResult] = await Promise.all([
            this.companiesRepository.execute(countQuery),
            this.companiesRepository.execute(dataQuery),
        ]);

        // Process the results
        const total = parseInt(countResult[0].total, 10);
        const data = dataResult.map((row: PendingCompanyResult) => {
            const companyData = omit(row, [
                'userId',
                'userFirstName',
                'userLastName',
                'userEmail',
                'userPhoneNumber',
                'userRole',
                'documents',
                'locations',
            ]) as Companies;

            return {
                company: companyData,
                users: {
                    id: row.userId,
                    firstName: row.userFirstName,
                    lastName: row.userLastName,
                    email: row.userEmail,
                    phoneNumber: row.userPhoneNumber,
                } as User,

                documents: (row.documents || []) as CompanyDocuments[],
                locations: (row.locations || []) as CompanyLocations[],
            };
        });

        return {
            total,
            data,
        };
    }

    public async getCompaniesDescending(filter?: Filter<Companies>): Promise<{
        total: number;
        data: Array<{
            user: {
                userId: number;
                name: string;
                companyId: number;
                companyType: string;
                companyName: string;
                companyCountry: string;
                registrationDate: string;
            };
            onboardingStatus: string;
            registrationStatus: string;
            overallStatus: string;
        }>;
    }> {
        const skip = filter?.skip || 0;
        const limit = filter?.limit || 20;

        // Check if there's a search term in the filter
        const searchFilter = filter?.where;
        let whereClause = '';
        let countWhereClause = '';

        if (searchFilter && (searchFilter as any).or) {
            // Extract search terms from the or condition
            const orConditions = (searchFilter as any).or as Array<any>;
            const searchConditions: string[] = [];

            for (const condition of orConditions) {
                if (condition.name?.ilike) {
                    const searchTerm = condition.name.ilike.replace(/%/g, '');
                    // Enhanced name search to handle full names, first names, last names, and company names
                    searchConditions.push(`(
                        c.name ILIKE '%${searchTerm}%' OR 
                        u.first_name ILIKE '%${searchTerm}%' OR 
                        u.last_name ILIKE '%${searchTerm}%' OR 
                        CONCAT(u.first_name, ' ', u.last_name) ILIKE '%${searchTerm}%' OR
                        CONCAT(u.last_name, ' ', u.first_name) ILIKE '%${searchTerm}%'
                    )`);
                }
                if (condition.country?.ilike) {
                    const searchTerm = condition.country.ilike.replace(/%/g, '');
                    searchConditions.push(`c.country ILIKE '%${searchTerm}%'`);
                }
                if (condition.email?.ilike) {
                    const searchTerm = condition.email.ilike.replace(/%/g, '');
                    searchConditions.push(`(c.email ILIKE '%${searchTerm}%' OR u.email ILIKE '%${searchTerm}%')`);
                }
            }

            if (searchConditions.length > 0) {
                whereClause = `WHERE ${searchConditions.join(' OR ')}`;
                countWhereClause = whereClause;
            }
        }

        // Build the main query to get companies with user information
        const dataQuery = `
            SELECT DISTINCT
                c.*,
                u.id as user_id,
                u.first_name as user_first_name,
                u.last_name as user_last_name,
                u.email as user_email,
                u.phone_number as user_phone_number
            FROM companies c
            LEFT JOIN company_users cu ON c.id = cu.company_id
            LEFT JOIN users u ON cu.user_id = u.id
            ${whereClause}
            ORDER BY c.created_at DESC
            LIMIT ${limit} OFFSET ${skip}
        `;

        // Build the count query
        const countQuery = `
            SELECT COUNT(DISTINCT c.id) as total
            FROM companies c
            LEFT JOIN company_users cu ON c.id = cu.company_id
            LEFT JOIN users u ON cu.user_id = u.id
            ${countWhereClause}
        `;

        // Execute both queries
        const [countResult, dataResult] = await Promise.all([
            this.companiesRepository.execute(countQuery),
            this.companiesRepository.execute(dataQuery),
        ]);

        // Get company IDs for additional data
        const companyIds = dataResult.map((row: any) => row.id).filter((id: number) => id !== undefined);

        // Get additional data for companies
        const [allDocuments, allLocations] = await Promise.all([
            this.companyDocumentsRepository.find({
                where: { companyId: { inq: companyIds } },
            }),
            this.companyLocationsRepository.find({
                where: { companyId: { inq: companyIds } },
            }),
        ]);

        // Map the results to combine with companies
        const data = dataResult.map((row: any) => {
            const companyData = {
                id: row.id,
                name: row.name,
                registrationNumber: row.registration_number,
                email: row.email,
                vatNumber: row.vat_number,
                vatRegistrationCountry: row.vat_registration_country,
                addressLine1: row.address_line1,
                addressLine2: row.address_line2,
                city: row.city,
                country: row.country,
                stateProvince: row.state_province,
                postalCode: row.postal_code,
                phoneNumber: row.phone_number,
                status: row.status,
                createdAt: row.created_at,
                updatedAt: row.updated_at,
                companyType: row.company_type,
                isBuyer: row.is_buyer,
                isSeller: row.is_seller,
                companyInterest: row.company_interest,
                website: row.website,
                industry: row.industry,
                description: row.description,
                numberOfEmployees: row.number_of_employees,
                annualRevenue: row.annual_revenue,
                ownership: row.ownership,
                salesforceId: row.salesforce_id,
                salesforceLastSyncAt: row.salesforce_last_sync_at,
                salesforceSyncStatus: row.salesforce_sync_status,
                // Add missing required properties
                favoriteMaterials: row.favorite_materials || [],
                isHaulier: row.is_haulier || false,
                boxClearingAgent: row.box_clearing_agent || false,
                isSyncedSalesForce: row.is_synced_salesforce || false,
                lastSyncedSalesForceDate: row.last_synced_salesforce_date || undefined,
                mobileNumber: row.mobile_number,
                countryCode: row.country_code,
                verifiedAt: row.verified_at,
            };
            const company = new Companies(companyData);

            const user = {
                id: row.user_id,
                firstName: row.user_first_name,
                lastName: row.user_last_name,
                email: row.user_email,
                phoneNumber: row.user_phone_number,
            } as User;

            return {
                company,
                documents: allDocuments.filter((doc) => doc.companyId === company.id),
                locations: allLocations.filter((loc) => loc.companyId === company.id),
                users: user.id ? [user] : [],
            };
        });

        return {
            total: parseInt(countResult[0].total, 10),
            data: this.getDisplayArray(data),
        };
    }

    public getDisplayArray(
        data: Array<{
            company: Companies;
            documents: CompanyDocuments[];
            locations: CompanyLocations[];
            users: User[];
        }>,
    ): Array<{
        user: {
            userId: number;
            companyId: number;
            name: string;
            companyType: string;
            companyName: string;
            companyCountry: string;
            registrationDate: string;
        };
        onboardingStatus: string;
        registrationStatus: string;
        overallStatus: string;
    }> {
        return data.map((item) => {
            const company = item.company;
            const user = item.users[0]; // or pick the relevant user if multiple

            // Onboarding status logic - determining the current step and completion status
            let onboardingStatus = '';
            const hasVat = !!company.vatNumber;
            const hasDocuments = item.documents && item.documents.length > 0;
            const hasLocations = item.locations && item.locations.length > 0;

            // Check if documents are approved (not just uploaded)
            const hasApprovedDocuments =
                item.documents &&
                item.documents.length > 0 &&
                item.documents.some(
                    (doc) =>
                        doc.status === CompanyDocumentStatus.APPROVED || doc.status === CompanyDocumentStatus.ACTIVE,
                );

            // Check if locations are complete (have required fields)
            const hasCompleteLocations = item.locations && item.locations.length > 0;

            // Determine onboarding status based on completion of steps
            if (!hasVat) {
                // Step 1: Company information not complete
                onboardingStatus = OnboardingStatus.COMPANY_INFORMATION_IN_PROGRESS;
            } else if (hasVat && !hasDocuments) {
                // Step 1 complete, Step 2 not started
                onboardingStatus = OnboardingStatus.COMPANY_INFORMATION_COMPLETE;
            } else if (hasVat && hasDocuments && !hasApprovedDocuments) {
                // Step 1 complete, Step 2 in progress (documents uploaded but not approved)
                onboardingStatus = OnboardingStatus.COMPANY_DOCUMENTS_IN_PROGRESS;
            } else if (hasVat && hasApprovedDocuments && !hasLocations) {
                // Step 2 complete, Step 3 not started
                onboardingStatus = OnboardingStatus.COMPANY_DOCUMENTS_ADDED;
            } else if (hasVat && hasApprovedDocuments && hasLocations && !hasCompleteLocations) {
                // Step 2 complete, Step 3 in progress (locations added but incomplete)
                onboardingStatus = OnboardingStatus.SITE_LOCATION_IN_PROGRESS;
            } else if (hasVat && hasApprovedDocuments && hasCompleteLocations) {
                // All steps complete
                onboardingStatus = OnboardingStatus.SITE_LOCATION_ADDED;
            } else {
                // Fallback for edge cases
                onboardingStatus = OnboardingStatus.COMPANY_INFORMATION_IN_PROGRESS;
            }

            // Registration status logic
            const registrationStatus =
                company.status === CompanyStatus.ACTIVE
                    ? UserRegistrationStatus.COMPLETE
                    : UserRegistrationStatus.IN_PROGRESS;

            // Overall status logic
            let overallStatus: string;
            if (company.status === CompanyStatus.ACTIVE) {
                // Admin has approved the user - Complete (as requested improvement)
                overallStatus = UserOverallStatus.COMPLETE;
            } else if (company.status === CompanyStatus.PENDING && hasVat && hasDocuments && hasCompleteLocations) {
                // User completed all onboarding steps - ready for admin approval
                overallStatus = UserOverallStatus.AWAITING_APPROVAL;
            } else {
                // User still completing registration or information - In progress
                overallStatus = UserOverallStatus.IN_PROGRESS;
            }

            return {
                user: {
                    userId: user?.id ?? 0,
                    companyId: company.id ?? 0,
                    name: (user?.firstName || '') + ' ' + (user?.lastName || ''),
                    companyType: company.isSeller ? (company.isBuyer ? 'both' : 'seller') : 'buyer',
                    companyName: company.name || '',
                    companyCountry: company.country ?? '',
                    registrationDate: company.createdAt || '',
                },
                onboardingStatus,
                registrationStatus,
                overallStatus,
            };
        });
    }

    public async getCompanyByVATNumber(vatNumber: string, isHaulier: boolean): Promise<Companies> {
        const company = await this.companiesRepository.findOne({
            where: { vatNumber: { ilike: vatNumber }, isHaulier },
        });

        if (!company) {
            throw new HttpErrors.NotFound(messages.companyNotFound);
        }

        return company;
    }

    public async searchCompaniesForMerge(
        filter: Filter<Companies> = {},
        searchTerm: string = '',
        currentUser: MyUserProfile,
    ): Promise<PaginationList<Companies>> {
        // Only global admins can use company merge search
        AuthHelper.validateAdmin(currentUser.globalRole);

        const skip = get(filter, 'skip', 0);
        const limit = get(filter, 'limit', 10);
        const isHaulier = get(filter?.where, 'isHaulier', false);

        let whereClause = `is_haulier = ${isHaulier}`;

        if (searchTerm) {
            const searchPattern = searchTerm.trim().toLowerCase().replace(/'/g, "''");
            whereClause += `
                AND (
                    LOWER(name) LIKE '%${searchPattern}%'
                    OR LOWER(vat_number) LIKE '%${searchPattern}%'
                )
            `;
        }

        const query = `
            SELECT
                id,
                name,
                vat_number AS "vatNumber",
                country,
                status,
                company_interest AS "companyInterest",
                is_haulier AS "isHaulier",
                is_buyer AS "isBuyer",
                is_seller AS "isSeller"
            FROM companies
            WHERE ${whereClause}
            ORDER BY created_at DESC
            LIMIT ${limit} OFFSET ${skip}
        `;

        const countQuery = `
            SELECT COUNT(*) as count
            FROM companies
            WHERE ${whereClause}
        `;

        const [results, countResult] = await Promise.all([
            this.companiesRepository.execute(query),
            this.companiesRepository.execute(countQuery),
        ]);

        const totalCount = parseInt(countResult[0]?.count ?? '0');

        return {
            totalCount,
            // results already use camelCase aliases
            results: results as unknown as Companies[],
        };
    }

    public async getCompanyUsers(
        filter: Filter<User>,
        searchTerm: string = '',
        currentUser: MyUserProfile,
    ): Promise<PaginationList<CompanyUserListItem>> {
        const skip = get(filter, 'skip', 0);
        const limit = get(filter, 'limit', 20);
        const roleFilter = get(filter?.where, 'role', '') as CompanyUserRoleEnum;
        // *INFO: statusFilter filter status user of company (active), and pending user invited and approved request to join company (pending)
        const statusFilter = get(filter?.where, 'status', '') as CompanyUserStatusEnum;
        // *INFO: tabFilter filter status user of company (all, unverified, verified, rejected)
        const tabFilter = get(filter?.where, 'tabFilter', '') as UserTabFilter;
        let companyId = get(filter?.where, 'companyId', 0);

        // Build consolidated where clauses based on user role
        let activeUserWhere = '';
        let pendingUserWhere = '';

        if (AuthHelper.isAdmin(currentUser.globalRole)) {
            // Global admin can see all companies
            if (companyId) {
                activeUserWhere = `cu.company_id = ${companyId}`;
                pendingUserWhere = `cur.company_id = ${companyId} AND cur.status = '${CompanyUserRequestStatusEnum.PENDING}'`;
            } else {
                activeUserWhere = `1=1`;
                pendingUserWhere = `cur.status = '${CompanyUserRequestStatusEnum.PENDING}'`;
            }
        } else {
            // Company admin or haulier - restricted to their company
            // Hauliers need access for team bidding feature
            if (
                currentUser.companyRole !== CompanyUserRoleEnum.ADMIN &&
                currentUser.companyRole !== CompanyUserRoleEnum.HAULIER
            ) {
                throw new HttpErrors.Forbidden(messages.unauthorized);
            }

            companyId = currentUser.companyId;
            activeUserWhere = `cu.company_id = ${companyId}`;
            pendingUserWhere = `cur.company_id = ${companyId} AND cur.status = '${CompanyUserRequestStatusEnum.PENDING}'`;
        }

        switch (tabFilter) {
            case UserTabFilter.UNVERIFIED:
                activeUserWhere += ` AND u.status IN ('${UserStatus.PENDING}', '${UserStatus.REQUEST_INFORMATION}')`;
                pendingUserWhere += ` AND u.status IN ('${UserStatus.PENDING}', '${UserStatus.REQUEST_INFORMATION}')`;
                break;
            case UserTabFilter.VERIFIED:
                activeUserWhere += ` AND u.status = '${UserStatus.ACTIVE}'`;
                pendingUserWhere += ` AND u.status = '${UserStatus.ACTIVE}'`;
                break;
            case UserTabFilter.REJECTED:
                activeUserWhere += ` AND u.status = '${UserStatus.REJECTED}'`;
                pendingUserWhere += ` AND u.status = '${UserStatus.REJECTED}'`;
                break;
        }

        // Search filter
        if (searchTerm) {
            const searchPattern = searchTerm.trim().toLowerCase().replace(/'/g, "''"); // Escape single quotes
            let activeUserRoleFilterSearch = '';
            let pendingUserRoleFilterSearch = '';

            if (CompanyUserRoleSearch.BUYER.includes(searchPattern) && roleFilter !== CompanyUserRoleEnum.BUYER) {
                activeUserRoleFilterSearch = `OR cu.company_role = '${CompanyUserRoleEnum.BUYER}'`;
                pendingUserRoleFilterSearch = `OR cur.role = '${CompanyUserRoleEnum.BUYER}'`;
            }

            if (CompanyUserRoleSearch.SELLER.includes(searchPattern) && roleFilter !== CompanyUserRoleEnum.SELLER) {
                activeUserRoleFilterSearch = `OR cu.company_role = '${CompanyUserRoleEnum.SELLER}'`;
                pendingUserRoleFilterSearch = `OR cur.role = '${CompanyUserRoleEnum.SELLER}'`;
            }

            if (CompanyUserRoleSearch.DUAL.includes(searchPattern) && roleFilter !== CompanyUserRoleEnum.BOTH) {
                activeUserRoleFilterSearch = `OR cu.company_role = '${CompanyUserRoleEnum.BOTH}'`;
                pendingUserRoleFilterSearch = `OR cur.role = '${CompanyUserRoleEnum.BOTH}'`;
            }

            if (CompanyUserRoleSearch.HAULIER.includes(searchPattern) && roleFilter !== CompanyUserRoleEnum.HAULIER) {
                activeUserRoleFilterSearch = `OR cu.company_role = '${CompanyUserRoleEnum.HAULIER}'`;
                pendingUserRoleFilterSearch = `OR cur.role = '${CompanyUserRoleEnum.HAULIER}'`;
            }

            if (
                CompanyUserRoleSearch.COMPANY_ADMIN.includes(searchPattern) &&
                roleFilter !== CompanyUserRoleEnum.ADMIN
            ) {
                activeUserRoleFilterSearch = `OR cu.company_role = '${CompanyUserRoleEnum.ADMIN}'`;
                pendingUserRoleFilterSearch = `OR cur.role = '${CompanyUserRoleEnum.ADMIN}'`;
            }

            activeUserWhere += `
                AND (
                    LOWER(u.job_title) LIKE '%${searchPattern}%'
                    OR LOWER(u.prefix) LIKE '%${searchPattern}%'
                    OR LOWER(u.username) LIKE '%${searchPattern}%'
                    OR LOWER(u.email) LIKE '%${searchPattern}%'
                    OR LOWER(u.first_name) LIKE '%${searchPattern}%'
                    OR LOWER(u.last_name) LIKE '%${searchPattern}%'
                    OR LOWER(CONCAT(u.first_name, ' ', u.last_name)) LIKE '%${searchPattern}%'
                    ${activeUserRoleFilterSearch}
                )
            `;
            pendingUserWhere += `
                AND (
                    LOWER(u.job_title) LIKE '%${searchPattern}%'
                    OR LOWER(u.prefix) LIKE '%${searchPattern}%'
                    OR LOWER(u.username) LIKE '%${searchPattern}%'
                    OR LOWER(u.email) LIKE '%${searchPattern}%'
                    OR LOWER(u.first_name) LIKE '%${searchPattern}%'
                    OR LOWER(u.last_name) LIKE '%${searchPattern}%'
                    OR LOWER(CONCAT(u.first_name, ' ', u.last_name)) LIKE '%${searchPattern}%'
                    ${pendingUserRoleFilterSearch}
                )
            `;
        }

        // Add role filter
        if (roleFilter) {
            activeUserWhere += ` AND cu.company_role = '${roleFilter}'`;
            pendingUserWhere += ` AND cur.role = '${roleFilter}'`;
        }

        // Build status-specific where clauses
        let unionQuery = '';
        if (!statusFilter || statusFilter === 'active') {
            unionQuery += `
                SELECT 
                    u.id,
                    u.prefix,
                    u.username,
                    u.first_name AS "firstName",
                    u.last_name AS "lastName",
                    u.job_title AS "jobTitle",
                    u.email,
                    u.status as "userStatus",
                    c.id as "companyId", 
                    c.name as "companyName", 
                    c.country as "companyCountry",
                    c.company_interest as "companyInterest",
                    c.is_haulier as "isHaulier",
                    c.is_buyer as "isBuyer", 
                    c.is_seller as "isSeller",
                    c.container_types as "containerTypes",
                    cu.company_role as "companyRole",

                    'active' AS status
                FROM company_users cu
                INNER JOIN users u ON cu.user_id = u.id
                INNER JOIN companies c ON cu.company_id = c.id
                WHERE ${activeUserWhere}
            `;
        }

        if (!statusFilter || statusFilter === 'pending') {
            if (unionQuery) {
                unionQuery += ' UNION ALL ';
            }

            unionQuery += `
                SELECT 
                    u.id,
                    u.prefix,
                    u.username,
                    u.first_name AS "firstName",
                    u.last_name AS "lastName",
                    u.job_title AS "jobTitle",
                    u.email,
                    u.status as "userStatus",
                    c.id as "companyId", 
                    c.name as "companyName", 
                    c.country as "companyCountry",
                    c.company_interest as "companyInterest",
                    c.is_haulier as "isHaulier",
                    c.is_buyer as "isBuyer", 
                    c.is_seller as "isSeller",
                    c.container_types as "containerTypes",
                    cur.role as "companyRole",

                    'pending' AS status
                FROM company_user_requests cur
                INNER JOIN users u ON cur.user_id = u.id
                INNER JOIN companies c ON cur.company_id = c.id
                WHERE ${pendingUserWhere}
            `;
        }

        // Main query with pagination
        const query = `
            ${unionQuery}
            ORDER BY status ASC, "firstName" ASC
            LIMIT ${limit} OFFSET ${skip}
        `;

        // Count query with same filters
        let countUnionQuery = '';
        if (!statusFilter || statusFilter === 'active') {
            countUnionQuery += `
                SELECT cu.user_id
                FROM company_users cu
                INNER JOIN users u ON cu.user_id = u.id
                ${tabFilter ? `INNER JOIN users u ON cu.user_id = u.id` : ''}
                WHERE ${activeUserWhere}
            `;
        }

        if (!statusFilter || statusFilter === 'pending') {
            if (countUnionQuery) {
                countUnionQuery += ' UNION ALL ';
            }
            countUnionQuery += `
                SELECT cur.user_id
                FROM company_user_requests cur
                INNER JOIN users u ON cur.user_id = u.id
                ${tabFilter ? `INNER JOIN users u ON cur.user_id = u.id` : ''}
                WHERE ${pendingUserWhere}
            `;
        }

        const countQuery = `SELECT COUNT(*) as count FROM (${countUnionQuery}) as combined`;

        // Execute queries in parallel
        const [results, countResult] = await Promise.all([
            this.companiesRepository.execute(query),
            this.companiesRepository.execute(countQuery),
        ]);

        const totalCount = parseInt(countResult[0]?.count ?? '0');

        return {
            totalCount,
            results: getValidArray(results as AnyObject[]).map((row) => {
                return {
                    id: row.id, // User Id
                    prefix: row.prefix,
                    username: row.username,
                    firstName: row.firstName,
                    lastName: row.lastName,
                    jobTitle: row.jobTitle,
                    email: row.email,
                    userStatus: row.userStatus, // UserStatus - "pending" | "request_information" | "active" | "rejected"
                    status: row.status, // "active" | "pending"
                    companyRole: row.companyRole,
                    companyData: {
                        id: row.companyId,
                        name: row.companyName,
                        country: row.companyCountry,
                        isHaulier: row.isHaulier,
                        isBuyer: row.isBuyer,
                        isSeller: row.isSeller,
                        companyInterest: row.companyInterest,
                        containerTypes: row.containerTypes,
                    },
                } as CompanyUserListItem;
            }),
        };
    }

    public async searchUsersForReassignment(
        filter: Filter<User> = {},
        searchTerm: string = '',
        currentUser: MyUserProfile,
    ): Promise<PaginationList<CompanyUserListItem>> {
        const skip = get(filter, 'skip', 0);
        const limit = get(filter, 'limit', 10);
        let companyId = get(filter?.where, 'companyId', 0);

        if (AuthHelper.isAdmin(currentUser.globalRole)) {
            if (!companyId) {
                throw new HttpErrors.BadRequest('companyId is required');
            }
        } else {
            AuthHelper.validateCompanyAdmin(currentUser.companyRole);
            companyId = currentUser.companyId;
        }

        // Build search query only for active company users
        let whereClause = `cu.company_id = ${companyId}`;

        if (searchTerm) {
            const searchPattern = searchTerm.trim().toLowerCase().replace(/'/g, "''"); // Escape single quotes
            whereClause += `
                AND (
                    LOWER(u.email) LIKE '%${searchPattern}%'
                    OR LOWER(u.username) LIKE '%${searchPattern}%'
                    OR LOWER(u.first_name) LIKE '%${searchPattern}%'
                    OR LOWER(u.last_name) LIKE '%${searchPattern}%'
                    OR LOWER(CONCAT(u.first_name, ' ', u.last_name)) LIKE '%${searchPattern}%'
                )
            `;
        }

        // Main query with pagination
        const query = `
            SELECT 
                u.id,
                u.email,
                u.username,
                u.prefix AS "prefix",
                u.first_name AS "firstName",
                u.last_name AS "lastName",
                cu.company_role AS "companyRole"
            FROM company_users cu
            INNER JOIN users u ON cu.user_id = u.id
            WHERE ${whereClause}
            ORDER BY u.created_at DESC
            LIMIT ${limit} OFFSET ${skip}
        `;

        // Count query
        const countQuery = `
            SELECT COUNT(*) as count
            FROM company_users cu
            INNER JOIN users u ON cu.user_id = u.id
            WHERE ${whereClause}
        `;

        // Execute queries in parallel
        const [results, countResult] = await Promise.all([
            this.companiesRepository.execute(query),
            this.companiesRepository.execute(countQuery),
        ]);

        const totalCount = parseInt(countResult[0]?.count ?? '0');

        return {
            totalCount,
            results: results as CompanyUserListItem[],
        };
    }

    // *INFO: Remove and assign user data from one user to another within the same company
    public async reassignUser(
        oldUserId: number,
        newUserId: number,
        companyId: number,
        currentUser: MyUserProfile,
    ): Promise<{ success: boolean; message: string }> {
        if (AuthHelper.isAdmin(currentUser.globalRole)) {
            if (!companyId) {
                throw new HttpErrors.BadRequest('companyId is required');
            }
        } else {
            AuthHelper.validateCompanyAdmin(currentUser.companyRole);
            companyId = currentUser.companyId;
        }

        // Validate that both users exist and belong to the same company
        const [oldCompanyUser, oldCompanyUserPending, newCompanyUser, countCompanyAdminUsers] = await Promise.all([
            this.companyUserRepository.findOne({
                where: { userId: oldUserId, companyId },
                include: ['user', 'company'],
            }),
            this.companyUserRequestsRepository.findOne({
                where: { userId: oldUserId, companyId },
                include: ['user', 'company'],
            }),
            this.companyUserRepository.findOne({
                where: { userId: newUserId, companyId },
            }),
            this.companyUserRepository.count({ companyId, companyRole: CompanyUserRoleEnum.ADMIN }),
        ]);

        if (countCompanyAdminUsers?.count === 1 && oldCompanyUser?.companyRole === CompanyUserRoleEnum.ADMIN) {
            throw new HttpErrors.BadRequest('You cannot remove the only admin user from the company');
        }

        if (!oldCompanyUser && !oldCompanyUserPending) {
            throw new HttpErrors.NotFound(messages.notFoundOldUser);
        }

        if (!newCompanyUser) {
            throw new HttpErrors.NotFound(messages.notFoundNewUser);
        }

        // Start transaction to ensure data consistency
        const transaction = await this.companiesRepository.dataSource.beginTransaction({
            isolationLevel: IsolationLevel.READ_COMMITTED,
        });

        try {
            // 1. Update listings created by old user
            await this.companiesRepository.execute(
                `UPDATE listings SET created_by_user_id = ${newUserId} WHERE created_by_user_id = ${oldUserId} AND company_id = ${companyId}`,
                [],
                { transaction },
            );

            // 2. Update offers where old user is buyer
            await this.companiesRepository.execute(
                `UPDATE offers SET buyer_user_id = ${newUserId} WHERE buyer_user_id = ${oldUserId} AND buyer_company_id = ${companyId}`,
                [],
                { transaction },
            );

            // 3. Update offers where old user is seller
            await this.companiesRepository.execute(
                `UPDATE offers SET seller_user_id = ${newUserId} WHERE seller_user_id = ${oldUserId} AND seller_company_id = ${companyId}`,
                [],
                { transaction },
            );

            // 4. Update offers created by old user
            await this.companiesRepository.execute(
                `UPDATE offers SET created_by_user_id = ${newUserId} WHERE created_by_user_id = ${oldUserId}`,
                [],
                { transaction },
            );

            // 5. Update offers accepted by old user
            await this.companiesRepository.execute(
                `UPDATE offers SET accepted_by_user_id = ${newUserId} WHERE accepted_by_user_id = ${oldUserId}`,
                [],
                { transaction },
            );

            // 6. Update offers rejected by old user
            await this.companiesRepository.execute(
                `UPDATE offers SET rejected_by_user_id = ${newUserId} WHERE rejected_by_user_id = ${oldUserId}`,
                [],
                { transaction },
            );

            // 7. Update haulage offers
            await this.companiesRepository.execute(
                `UPDATE haulage_offers SET haulier_user_id = ${newUserId} WHERE haulier_user_id = ${oldUserId} AND haulier_company_id = ${companyId}`,
                [],
                { transaction },
            );

            // 8. Update sample requests where old user is buyer/seller for this company
            await this.companiesRepository.execute(
                `UPDATE sample_requests
                 SET buyer_user_id = CASE WHEN buyer_user_id = ${oldUserId} THEN ${newUserId} ELSE buyer_user_id END,
                     seller_user_id = CASE WHEN seller_user_id = ${oldUserId} THEN ${newUserId} ELSE seller_user_id END
                 WHERE (buyer_user_id = ${oldUserId} AND buyer_company_id = ${companyId})
                    OR (seller_user_id = ${oldUserId} AND seller_company_id = ${companyId})`,
                [],
                { transaction },
            );

            // 9. Update MFI requests where old user is buyer/seller for this company
            await this.companiesRepository.execute(
                `UPDATE mfi_requests
                 SET buyer_user_id = CASE WHEN buyer_user_id = ${oldUserId} THEN ${newUserId} ELSE buyer_user_id END,
                     seller_user_id = CASE WHEN seller_user_id = ${oldUserId} THEN ${newUserId} ELSE seller_user_id END
                 WHERE (buyer_user_id = ${oldUserId} AND buyer_company_id = ${companyId})
                    OR (seller_user_id = ${oldUserId} AND seller_company_id = ${companyId})`,
                [],
                { transaction },
            );

            // 10. Finally, remove old user from company_users (but keep user account)
            if (oldCompanyUser) {
                await this.companyUserRepository.deleteById(oldCompanyUser.id, { transaction });
            } else if (oldCompanyUserPending) {
                await this.companyUserRequestsRepository.deleteById(oldCompanyUserPending.id, { transaction });
            }

            // Commit transaction
            await transaction.commit();

            await this.handleSendEmailAndNotificationUnlinkUserFromCompany({
                userId: oldUserId,
                companyId,
                companyUser: {
                    email: oldCompanyUser?.user?.email ?? oldCompanyUserPending?.user?.email ?? '',
                    firstName: oldCompanyUser?.user?.firstName ?? oldCompanyUserPending?.user?.firstName ?? '',
                    lastName: oldCompanyUser?.user?.lastName ?? oldCompanyUserPending?.user?.lastName ?? '',
                },
                companyName: oldCompanyUser?.company?.name ?? oldCompanyUserPending?.company?.name ?? '',
            });

            return {
                success: true,
                message: messages.reassignUserSuccessfully,
            };
        } catch (error) {
            // Rollback transaction on error
            await transaction.rollback();
            throw new HttpErrors.InternalServerError(
                `Failed to reassign user data: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
        }
    }

    public async companyAdminRemoveUserPending(
        userId: number,
        companyId: number,
        currentUser: MyUserProfile,
    ): Promise<{ success: boolean; message: string }> {
        if (AuthHelper.isAdmin(currentUser.globalRole)) {
            if (!companyId) {
                throw new HttpErrors.BadRequest('companyId is required');
            }
        } else {
            AuthHelper.validateCompanyAdmin(currentUser.companyRole);
            companyId = currentUser.companyId;
        }

        // Validate that both users exist and belong to the same company
        const [companyUserRequest] = await Promise.all([
            this.companyUserRequestsRepository.findOne({
                where: { userId, companyId },
                include: ['user', 'company'],
            }),
        ]);

        if (!companyUserRequest) {
            throw new HttpErrors.NotFound(messages.notFoundCompanyUserRequest);
        }

        try {
            await this.companyUserRequestsRepository.deleteById(companyUserRequest.id);

            await this.handleSendEmailAndNotificationUnlinkUserFromCompany({
                userId,
                companyId,
                companyUser: {
                    email: companyUserRequest?.user?.email ?? '',
                    firstName: companyUserRequest?.user?.firstName ?? '',
                    lastName: companyUserRequest?.user?.lastName ?? '',
                },
                companyName: companyUserRequest?.company?.name ?? '',
            });

            return {
                success: true,
                message: messages.companyAdminRemoveUserPendingSuccessfully,
            };
        } catch (error) {
            throw new HttpErrors.InternalServerError(
                `Failed to remove user pending request: ${error instanceof Error ? error.message : 'Unknown error'}`,
            );
        }
    }

    public async removeUser(userId: number, companyId: number, currentUser: MyUserProfile): Promise<IDataResponse> {
        // Validate that current user is company admin
        AuthHelper.validateAdmin(currentUser.globalRole);

        const companyUser = await this.companyUserRepository.findOne({
            where: { userId, companyId },
            include: ['user', 'company'],
        });

        if (!companyUser) {
            throw new HttpErrors.NotFound(messages.notFound);
        }

        await Promise.all([
            this.companyUserRepository.deleteById(companyUser.id),
            this.handleSendEmailAndNotificationUnlinkUserFromCompany({
                userId,
                companyId,
                companyUser: {
                    email: companyUser?.user?.email ?? '',
                    firstName: companyUser?.user?.firstName ?? '',
                    lastName: companyUser?.user?.lastName ?? '',
                },
                companyName: companyUser?.company?.name ?? '',
            }),
        ]);

        return {
            status: 'success',
            message: 'User removed successfully',
            data: {},
        };
    }

    public async handleSendEmailAndNotificationUnlinkUserFromCompany({
        userId,
        companyId,
        companyUser,
        companyName,
    }: {
        userId: number;
        companyId: number;
        companyName: string;
        companyUser: { email: string; firstName: string; lastName: string };
    }): Promise<void> {
        await Promise.all([
            this.emailService.sendUserReceiveUnlinkedFromCompanyEmail(
                {
                    email: companyUser.email,
                    firstName: companyUser.firstName,
                    lastName: companyUser.lastName,
                },
                companyName,
            ),
            this.wasteTradeNotificationsService.createNotification(
                userId ?? 0,
                NotificationType.COMPANY_USER_UNLINKED_FROM_COMPANY,
                {
                    userId: userId ?? 0,
                    companyId: companyId,
                    firstName: companyUser.firstName,
                    lastName: companyUser.lastName,
                    companyName: companyName,
                },
            ),
        ]);
    }
}
