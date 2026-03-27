import { BindingScope, injectable } from '@loopback/core';
import { Filter, repository } from '@loopback/repository';
import { HttpErrors } from '@loopback/rest';
import { MyUserProfile } from '../authentication-strategies/type';
import { AssignAdminDataType, UserRoleEnum, UserStatus } from '../enum';
import { AuthHelper } from '../helpers/auth.helper';
import { AssignAdmin } from '../models';
import { PaginationList } from '../types';
import {
    HaulageOffersRepository,
    ListingsRepository,
    MfiRequestsRepository,
    OffersRepository,
    SampleRequestsRepository,
    UserRepository,
} from '../repositories';

@injectable({ scope: BindingScope.TRANSIENT })
export class AssignAdminService {
    constructor(
        @repository(UserRepository)
        public userRepository: UserRepository,
        @repository(ListingsRepository)
        public listingsRepository: ListingsRepository,
        @repository(OffersRepository)
        public offersRepository: OffersRepository,
        @repository(HaulageOffersRepository)
        public haulageOffersRepository: HaulageOffersRepository,
        @repository(SampleRequestsRepository)
        public sampleRequestsRepository: SampleRequestsRepository,
        @repository(MfiRequestsRepository)
        public mfiRequestsRepository: MfiRequestsRepository,
    ) {}

    async assignAdmin(
        dataBody: {
            dataId: number;
            dataType: AssignAdminDataType;
            assignedAdminId: number | null;
        },
        currentUser: MyUserProfile,
    ): Promise<AssignAdmin | null> {
        AuthHelper.validateAdmin(currentUser.globalRole);

        const { dataId, dataType, assignedAdminId } = dataBody;

        // Verify admin exists if assignedAdminId is provided
        if (assignedAdminId !== null) {
            const admin = await this.userRepository.findById(assignedAdminId);
            if (!admin) {
                throw new HttpErrors.NotFound(`Admin user with id ${assignedAdminId} not found`);
            }

            if (!AuthHelper.isAdmin(admin.globalRole)) {
                throw new HttpErrors.BadRequest(`User ${assignedAdminId} is not an admin`);
            }
        }

        const assignAdmin: AssignAdmin | null = assignedAdminId
            ? {
                  assignedAdminId: assignedAdminId ?? undefined,
                  assignedBy: currentUser.id,
                  assignedAt: new Date(),
              }
            : null;

        switch (dataType) {
            case AssignAdminDataType.USERS: {
                const user = await this.userRepository.findById(dataId);

                if (!user) {
                    throw new HttpErrors.NotFound(`User with id ${dataId} not found`);
                }

                await this.userRepository.updateById(dataId, { assignAdmin });

                return assignAdmin;
            }
            case AssignAdminDataType.LISTINGS: {
                const listing = await this.listingsRepository.findById(dataId);

                if (!listing) {
                    throw new HttpErrors.NotFound(`Listing with id ${dataId} not found`);
                }

                await this.listingsRepository.updateById(dataId, { assignAdmin });

                return assignAdmin;
            }
            case AssignAdminDataType.OFFERS: {
                const offer = await this.offersRepository.findById(dataId);

                if (!offer) {
                    throw new HttpErrors.NotFound(`Offer with id ${dataId} not found`);
                }

                await this.offersRepository.updateById(dataId, { assignAdmin });

                return assignAdmin;
            }
            case AssignAdminDataType.HAULAGE_OFFERS: {
                const haulageOffer = await this.haulageOffersRepository.findById(dataId);

                if (!haulageOffer) {
                    throw new HttpErrors.NotFound(`Haulage offer with id ${dataId} not found`);
                }

                await this.haulageOffersRepository.updateById(dataId, { assignAdmin });

                return assignAdmin;
            }
            case AssignAdminDataType.SAMPLES: {
                const sample = await this.sampleRequestsRepository.findById(dataId);

                if (!sample) {
                    throw new HttpErrors.NotFound(`Sample request with id ${dataId} not found`);
                }

                await this.sampleRequestsRepository.updateById(dataId, { assignAdmin });

                return assignAdmin;
            }
            case AssignAdminDataType.MFI: {
                const mfi = await this.mfiRequestsRepository.findById(dataId);

                if (!mfi) {
                    throw new HttpErrors.NotFound(`MFI request with id ${dataId} not found`);
                }

                await this.mfiRequestsRepository.updateById(dataId, { assignAdmin });

                return assignAdmin;
            }

            default:
                throw new HttpErrors.BadRequest(`Invalid data type: ${dataType}`);
        }
    }

    async getAdminsToAssign(filter: Filter<Record<string, unknown>> = {}): Promise<
        PaginationList<{
            id: number;
            firstName: string;
            lastName: string;
            email: string;
            globalRole: UserRoleEnum;
        }>
    > {
        const skip = filter.skip ?? 0;
        const limit = filter.limit ?? 20;

        // Filter only admin users (super_admin, admin, sales_admin)
        const whereClause = {
            globalRole: {
                inq: [UserRoleEnum.SUPER_ADMIN, UserRoleEnum.ADMIN, UserRoleEnum.SALES_ADMIN],
            },
            status: UserStatus.ACTIVE,
        };

        const [admins, totalCount] = await Promise.all([
            this.userRepository.find({
                where: whereClause,
                skip,
                limit,
                fields: ['id', 'firstName', 'lastName', 'email', 'globalRole'],
                order: ['firstName ASC', 'lastName ASC'],
            }),
            this.userRepository.count(whereClause),
        ]);

        const results = admins.map((admin) => ({
            id: admin.id!,
            firstName: admin.firstName,
            lastName: admin.lastName,
            email: admin.email,
            globalRole: admin.globalRole,
        }));

        return {
            results,
            totalCount: totalCount.count,
        };
    }

    async unassignAdminFromAllRecords(adminId: number): Promise<void> {
        // Unassign admin from all record types by finding records and updating them
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const whereClause: any = {
            'assignAdmin.assignedAdminId': adminId,
        };

        await Promise.all([
            // Unassign from users
            this.userRepository.updateAll({ assignAdmin: null }, whereClause),
            // Unassign from listings
            this.listingsRepository.updateAll({ assignAdmin: null }, whereClause),
            // Unassign from offers
            this.offersRepository.updateAll({ assignAdmin: null }, whereClause),
            // Unassign from haulage offers
            this.haulageOffersRepository.updateAll({ assignAdmin: null }, whereClause),
            // Unassign from sample requests
            this.sampleRequestsRepository.updateAll({ assignAdmin: null }, whereClause),
            // Unassign from MFI requests
            this.mfiRequestsRepository.updateAll({ assignAdmin: null }, whereClause),
        ]);
    }
}
