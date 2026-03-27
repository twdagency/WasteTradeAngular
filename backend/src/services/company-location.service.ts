import { BindingScope, injectable, service } from '@loopback/core';
import { Filter, repository } from '@loopback/repository';
import { HttpErrors } from '@loopback/rest';
import { MyUserProfile } from '../authentication-strategies/type';
import { messages } from '../constants';
import { messagesOfCompanyLocation } from '../constants/company-location';
import { CompanyUserRoleEnum } from '../enum';
import { CompanyLocationDocuments, CompanyLocations } from '../models';
import {
    CompanyLocationDocumentsRepository,
    CompanyLocationsRepository,
    CompanyUsersRepository,
} from '../repositories';
import { IDataResponse, PaginationList } from '../types';
import { normalizeTimeToPostgres } from '../utils/common';
import { CompanyLocationDocumentService } from './company-location-document.service';

@injectable({ scope: BindingScope.TRANSIENT })
export class CompanyLocationService {
    constructor(
        @repository(CompanyLocationsRepository)
        public companyLocationsRepository: CompanyLocationsRepository,
        @repository(CompanyLocationDocumentsRepository)
        public companyLocationDocumentsRepository: CompanyLocationDocumentsRepository,
        @repository(CompanyUsersRepository)
        public companyUserRepository: CompanyUsersRepository,

        @service(CompanyLocationDocumentService)
        public companyLocationDocumentService: CompanyLocationDocumentService,
    ) {}

    public async createCompanyLocation(
        companyLocation: Omit<CompanyLocations, 'id'>,
        companyLocationDocuments: CompanyLocationDocuments[],
        currentUserProfile: MyUserProfile,
    ): Promise<
        IDataResponse<{
            companyLocation: CompanyLocations;
            companyLocationDocuments: CompanyLocationDocuments[];
        } | null>
    > {
        try {
            const companyUser = await this.companyUserRepository.findOne({
                where: {
                    userId: Number(currentUserProfile.id),
                    companyId: currentUserProfile.companyId,
                    companyRole: CompanyUserRoleEnum.ADMIN,
                },
            });

            if (!companyUser) {
                throw new HttpErrors[403](messages.forbidden);
            }

            const officeOpenTimeRaw = companyLocation.officeOpenTime;
            const officeCloseTimeRaw = companyLocation.officeCloseTime;

            const officeOpenTime =
                officeOpenTimeRaw !== undefined && officeOpenTimeRaw !== null && officeOpenTimeRaw.trim() !== ''
                    ? normalizeTimeToPostgres(officeOpenTimeRaw)
                    : undefined;
            const officeCloseTime =
                officeCloseTimeRaw !== undefined && officeCloseTimeRaw !== null && officeCloseTimeRaw.trim() !== ''
                    ? normalizeTimeToPostgres(officeCloseTimeRaw)
                    : undefined;

            if (officeOpenTimeRaw && officeOpenTime === null) {
                throw new HttpErrors[422](messages.invalidOfficeTime);
            }
            if (officeCloseTimeRaw && officeCloseTime === null) {
                throw new HttpErrors[422](messages.invalidOfficeTime);
            }

            if (companyLocation.mainLocation) {
                await this.companyLocationsRepository.updateAll(
                    {
                        mainLocation: false,
                    },
                    {
                        companyId: currentUserProfile.companyId,
                    },
                );
            }

            // Strip fields not defined in CompanyLocations model (e.g. wasteLicence from frontend)
            const { wasteLicence, ...cleanLocation } = companyLocation as any;

            const companyLocationData = await this.companyLocationsRepository.create({
                ...cleanLocation,
                mainLocation: companyLocation.mainLocation ?? false,
                officeOpenTime: officeOpenTime ?? undefined,
                officeCloseTime: officeCloseTime ?? undefined,
                companyId: currentUserProfile.companyId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });

            const {
                data: { companyLocationDocuments: updatedCompanyLocationDocuments = [] },
            } = await this.companyLocationDocumentService.updateCompanyLocationDocuments(
                companyLocationDocuments,
                companyLocationData.id ?? 0,
                currentUserProfile.id,
            );

            return {
                status: 'success',
                message: messagesOfCompanyLocation.createCompanyLocationSuccess,
                data: {
                    companyLocation: companyLocationData,
                    companyLocationDocuments: updatedCompanyLocationDocuments || ([] as CompanyLocationDocuments[]),
                },
            };
        } catch (error) {
            if (error instanceof HttpErrors.HttpError) {
                return {
                    status: 'error',
                    message: error.message,
                    data: null,
                };
            }

            console.error(`companyLocationService.createCompanyLocation ~ createCompanyLocation ~ error: ${error}`);
            return {
                status: 'error',
                message: messages.serverError,
                data: null,
            };
        }
    }

    public async updateCompanyLocation(
        id: number,
        companyLocation: Omit<CompanyLocations, 'id'>,
        companyLocationDocuments: CompanyLocationDocuments[],
        currentUserProfile: MyUserProfile,
    ): Promise<IDataResponse<null>> {
        try {
            const foundCompanyLocation = await this.companyLocationsRepository.findById(id);

            if (!foundCompanyLocation) {
                throw new HttpErrors[404](messages.companyLocationNotFound);
            }

            const officeOpenTimeRaw = companyLocation.officeOpenTime;
            const officeCloseTimeRaw = companyLocation.officeCloseTime;

            const officeOpenTime =
                officeOpenTimeRaw !== undefined && officeOpenTimeRaw !== null && officeOpenTimeRaw.trim() !== ''
                    ? normalizeTimeToPostgres(officeOpenTimeRaw)
                    : undefined;
            const officeCloseTime =
                officeCloseTimeRaw !== undefined && officeCloseTimeRaw !== null && officeCloseTimeRaw.trim() !== ''
                    ? normalizeTimeToPostgres(officeCloseTimeRaw)
                    : undefined;

            if (officeOpenTimeRaw && officeOpenTime === null) {
                throw new HttpErrors[422](messages.invalidOfficeTime);
            }
            if (officeCloseTimeRaw && officeCloseTime === null) {
                throw new HttpErrors[422](messages.invalidOfficeTime);
            }

            // Strip fields not defined in CompanyLocations model (e.g. wasteLicence from frontend)
            const { wasteLicence: _wl, ...cleanLocation } = companyLocation as any;

            await this.companyLocationsRepository.updateById(id, {
                ...cleanLocation,
                officeOpenTime: officeOpenTime ?? undefined,
                officeCloseTime: officeCloseTime ?? undefined,
                updatedAt: new Date().toISOString(),
            });

            await this.companyLocationDocumentService.updateCompanyLocationDocuments(
                companyLocationDocuments,
                id,
                currentUserProfile.id,
            );

            return {
                status: 'success',
                message: messagesOfCompanyLocation.updateCompanyLocationSuccess,
                data: null,
            };
        } catch (error) {
            if (error instanceof HttpErrors.HttpError) {
                return {
                    status: 'error',
                    message: error.message,
                    data: null,
                };
            }

            return {
                status: 'error',
                message: messages.serverError,
                data: null,
            };
        }
    }

    public async getCompanyLocationList(
        filter: Filter<CompanyLocations>,
        currentUserProfile: MyUserProfile,
    ): Promise<PaginationList<CompanyLocations & { companyLocationDocuments: CompanyLocationDocuments[] }>> {
        filter = filter || {};
        if (filter.where) {
            filter.where = {
                ...filter.where,
                companyId: currentUserProfile.companyId,
            };
        } else {
            filter.where = {
                companyId: currentUserProfile.companyId,
            };
        }

        const [count, companyLocations] = await Promise.all([
            this.companyLocationsRepository.count(filter.where),
            this.companyLocationsRepository.find(filter),
        ]);

        return {
            totalCount: count.count,
            results: await Promise.all(
                companyLocations.map(async (location) => {
                    const companyLocationDocuments = await this.companyLocationDocumentsRepository.find({
                        where: {
                            companyLocationId: location.id,
                        },
                    });

                    return {
                        ...location.toJSON(),
                        companyLocationDocuments: (companyLocationDocuments || []) as CompanyLocationDocuments[],
                    } as CompanyLocations & { companyLocationDocuments: CompanyLocationDocuments[] };
                }),
            ),
        };
    }
}
