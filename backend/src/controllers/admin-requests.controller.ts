import { authenticate } from '@loopback/authentication';
import { inject } from '@loopback/core';
import { Filter, repository } from '@loopback/repository';
import { get as httpGet, param, response } from '@loopback/rest';
import { SecurityBindings, UserProfile } from '@loopback/security';
import lodashGet from 'lodash/get';

import { MyUserProfile } from '../authentication-strategies/type';
import { AuthHelper } from '../helpers/auth.helper';
import { IDataResponse, PaginationList } from '../types';
import {
    SampleRequestsRepository,
    MfiRequestsRepository,
    UserRepository,
    ListingsRepository,
} from '../repositories';
import { SampleRequests, MfiRequests } from '../models';
import { SAMPLE_TAB_TO_STATUSES } from '../enum/sample-request.enum';
import { MFI_TAB_TO_STATUSES } from '../enum/mfi-request.enum';
import { UserStatus } from '../enum';
import { getCountryIsoCode } from '../utils/country-mapping';

// Tabs that filter by buyer user verification status, not request status
const USER_STATUS_TABS = ['Unverified', 'Verified'];

export class AdminRequestsController {
    constructor(
        @repository(SampleRequestsRepository)
        public sampleRequestsRepository: SampleRequestsRepository,
        @repository(MfiRequestsRepository)
        public mfiRequestsRepository: MfiRequestsRepository,
        @repository(UserRepository)
        public userRepository: UserRepository,
        @repository(ListingsRepository)
        public listingsRepository: ListingsRepository,
    ) {}

    /**
     * Resolve tab filter into where clause.
     * - "Unverified"/"Verified": filter by buyer user verification → returns buyerUserIds
     * - Status tabs: map generic tab name → actual DB status values via tabMapping
     */
    private async resolveTabFilter(
        tabValue: string,
        tabMapping: Record<string, string[]>,
    ): Promise<{ statusIn?: string[]; buyerUserIds?: number[] } | null> {
        if (USER_STATUS_TABS.includes(tabValue)) {
            const statusFilter =
                tabValue === 'Verified'
                    ? { inq: [UserStatus.ACTIVE] }
                    : { inq: [UserStatus.PENDING, UserStatus.REQUEST_INFORMATION] };
            const users = await this.userRepository.find({
                where: { status: statusFilter },
                fields: { id: true },
            });
            return { buyerUserIds: users.map((u) => u.id!) };
        }

        const statuses = tabMapping[tabValue];
        if (statuses && statuses.length > 0) {
            return { statusIn: statuses };
        }

        return null;
    }

    /**
     * Extract relation-level filters (country, materialType) from where clause
     * and resolve them to listingId constraints.
     * These fields live on Listing/CompanyLocation, not on the request model.
     */
    private async resolveListingFilters(
        where: any,
    ): Promise<{ listingIds?: number[]; noMatch?: boolean }> {
        const country = where?.country;
        const materialType = where?.materialType;

        // Clean up relation filters from where (they don't exist on the request model)
        if (country) delete where.country;
        if (materialType) delete where.materialType;

        if (!country && !materialType) return {};

        const listingWhere: any = {};

        // materialType is directly on Listings model
        if (materialType) {
            const materialValue = Array.isArray(materialType)
                ? materialType[0]
                : materialType;
            listingWhere.materialType = materialValue;
        }

        // Build listing query
        const listingFilter: any = {
            where: listingWhere,
            fields: { id: true, locationId: true },
        };

        // If country filter exists, we need to resolve via location
        if (country) {
            const countryValue = Array.isArray(country)
                ? country[0]
                : country;

            // Convert country name to ISO code for matching (DB stores ISO codes)
            const isoCode = getCountryIsoCode(countryValue);

            // Include location and filter by country (try both ISO code and name)
            listingFilter.include = [
                {
                    relation: 'location',
                    scope: {
                        where: {
                            or: [
                                { country: { ilike: `%${isoCode}%` } },
                                { country: { ilike: `%${countryValue}%` } },
                            ],
                        },
                    },
                },
            ];

            const listings = await this.listingsRepository.find(listingFilter);
            // Only keep listings whose location matched the country filter
            const matchedIds = listings
                .filter((l: any) => l.location != null)
                .map((l) => l.id!);

            if (matchedIds.length === 0) return { noMatch: true };
            return { listingIds: matchedIds };
        }

        // materialType only (no country)
        const listings = await this.listingsRepository.find(listingFilter);
        const matchedIds = listings.map((l) => l.id!);

        if (matchedIds.length === 0) return { noMatch: true };
        return { listingIds: matchedIds };
    }

    @authenticate('jwt')
    @httpGet('/admin/sample-requests')
    @response(200, {
        description: 'Sample requests table (admin)',
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
                                results: { type: 'array', items: { type: 'object' } },
                                totalCount: { type: 'number' },
                            },
                        },
                    },
                },
            },
        },
    })
    async getSampleRequests(
        @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
        @param.query.string('filter') filterString?: string,
        @param.query.string('status') statusFilter?: string,
    ): Promise<IDataResponse<PaginationList<SampleRequests>>> {
        const currentUser = currentUserProfile as MyUserProfile;
        AuthHelper.validateAdmin(currentUser.globalRole);

        let parsedFilter: Filter<SampleRequests> = {};
        if (filterString) {
            try {
                parsedFilter = JSON.parse(filterString);
            } catch {
                parsedFilter = {};
            }
        }

        // Extract tab filter from where.status (sent by list-container as array or string) or statusFilter query param
        const rawStatus = (parsedFilter.where as any)?.status || statusFilter;
        const tabValue = Array.isArray(rawStatus) ? rawStatus[0] : (typeof rawStatus === 'string' ? rawStatus : null);
        if (tabValue && tabValue !== 'All') {
            if ((parsedFilter.where as any)?.status) {
                delete (parsedFilter.where as any).status;
            }

            const resolved = await this.resolveTabFilter(
                tabValue,
                SAMPLE_TAB_TO_STATUSES,
            );

            if (resolved?.statusIn) {
                (parsedFilter.where as any) = {
                    ...parsedFilter.where,
                    status: { inq: resolved.statusIn },
                };
            } else if (resolved?.buyerUserIds) {
                (parsedFilter.where as any) = {
                    ...parsedFilter.where,
                    buyerUserId: { inq: resolved.buyerUserIds },
                };
            }
        }

        // Resolve relation-level filters (country, materialType) → listingId constraints
        const listingFilter = await this.resolveListingFilters(
            parsedFilter.where ?? {},
        );
        if (listingFilter.noMatch) {
            return {
                status: 'success',
                message: 'Sample requests retrieved successfully',
                data: { results: [], totalCount: 0 },
            };
        }
        if (listingFilter.listingIds) {
            (parsedFilter.where as any) = {
                ...parsedFilter.where,
                listingId: { inq: listingFilter.listingIds },
            };
        }

        const skip = lodashGet(parsedFilter, 'skip', 0) as number;
        const limit = lodashGet(parsedFilter, 'limit', 20) as number;

        const filter: Filter<SampleRequests> = {
            ...parsedFilter,
            skip,
            limit,
            order: ['createdAt DESC'],
            include: [
                {
                    relation: 'listing',
                    scope: {
                        include: [{ relation: 'location' }],
                    },
                },
                { relation: 'buyerUser' },
                { relation: 'buyerCompany' },
                { relation: 'sellerUser' },
                { relation: 'sellerCompany' },
                { relation: 'assignedAdmin' },
            ],
        };

        const [results, totalCount] = await Promise.all([
            this.sampleRequestsRepository.find(filter),
            this.sampleRequestsRepository.count(parsedFilter.where),
        ]);

        return {
            status: 'success',
            message: 'Sample requests retrieved successfully',
            data: {
                results: results as SampleRequests[],
                totalCount: totalCount.count,
            },
        };
    }

    @authenticate('jwt')
    @httpGet('/admin/mfi-requests')
    @response(200, {
        description: 'MFI table (admin)',
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
                                results: { type: 'array', items: { type: 'object' } },
                                totalCount: { type: 'number' },
                            },
                        },
                    },
                },
            },
        },
    })
    async getMfiRequests(
        @inject(SecurityBindings.USER) currentUserProfile: UserProfile,
        @param.query.string('filter') filterString?: string,
        @param.query.string('status') statusFilter?: string,
    ): Promise<IDataResponse<PaginationList<MfiRequests>>> {
        const currentUser = currentUserProfile as MyUserProfile;
        AuthHelper.validateAdmin(currentUser.globalRole);

        let parsedFilter: Filter<MfiRequests> = {};
        if (filterString) {
            try {
                parsedFilter = JSON.parse(filterString);
            } catch {
                parsedFilter = {};
            }
        }

        // Extract tab filter from where.status (sent by list-container as array or string) or statusFilter query param
        const rawStatusMfi = (parsedFilter.where as any)?.status || statusFilter;
        const tabValue = Array.isArray(rawStatusMfi) ? rawStatusMfi[0] : (typeof rawStatusMfi === 'string' ? rawStatusMfi : null);
        if (tabValue && tabValue !== 'All') {
            if ((parsedFilter.where as any)?.status) {
                delete (parsedFilter.where as any).status;
            }

            const resolved = await this.resolveTabFilter(
                tabValue,
                MFI_TAB_TO_STATUSES,
            );

            if (resolved?.statusIn) {
                (parsedFilter.where as any) = {
                    ...parsedFilter.where,
                    status: { inq: resolved.statusIn },
                };
            } else if (resolved?.buyerUserIds) {
                (parsedFilter.where as any) = {
                    ...parsedFilter.where,
                    buyerUserId: { inq: resolved.buyerUserIds },
                };
            }
        }

        // Resolve relation-level filters (country, materialType) → listingId constraints
        const listingFilter = await this.resolveListingFilters(
            parsedFilter.where ?? {},
        );
        if (listingFilter.noMatch) {
            return {
                status: 'success',
                message: 'MFI requests retrieved successfully',
                data: { results: [], totalCount: 0 },
            };
        }
        if (listingFilter.listingIds) {
            (parsedFilter.where as any) = {
                ...parsedFilter.where,
                listingId: { inq: listingFilter.listingIds },
            };
        }

        const skip = lodashGet(parsedFilter, 'skip', 0) as number;
        const limit = lodashGet(parsedFilter, 'limit', 20) as number;

        const filter: Filter<MfiRequests> = {
            ...parsedFilter,
            skip,
            limit,
            order: ['createdAt DESC'],
            include: [
                {
                    relation: 'listing',
                    scope: {
                        include: [{ relation: 'location' }],
                    },
                },
                { relation: 'buyerUser' },
                { relation: 'buyerCompany' },
                { relation: 'sellerUser' },
                { relation: 'sellerCompany' },
                { relation: 'assignedAdmin' },
            ],
        };

        const [results, totalCount] = await Promise.all([
            this.mfiRequestsRepository.find(filter),
            this.mfiRequestsRepository.count(parsedFilter.where),
        ]);

        return {
            status: 'success',
            message: 'MFI requests retrieved successfully',
            data: {
                results: results as MfiRequests[],
                totalCount: totalCount.count,
            },
        };
    }
}
