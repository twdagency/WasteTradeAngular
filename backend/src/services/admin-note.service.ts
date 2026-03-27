import { BindingScope, injectable } from '@loopback/core';
import { repository } from '@loopback/repository';
import { HttpErrors } from '@loopback/rest';
import { MyUserProfile } from '../authentication-strategies/type';
import { AdminNoteDataType } from '../enum';
import { AuthHelper } from '../helpers/auth.helper';
import { AdminNote, User } from '../models';
import {
    HaulageOffersRepository,
    ListingsRepository,
    MfiRequestsRepository,
    OffersRepository,
    SampleRequestsRepository,
    UserRepository,
    CompanyUsersRepository,
} from '../repositories';
import { IDataResponse } from '../types';

@injectable({ scope: BindingScope.TRANSIENT })
export class AdminNoteService {
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
        @repository(CompanyUsersRepository)
        public companyUsersRepository: CompanyUsersRepository,
    ) {}

    async createOrUpdateNote(
        dataBody: {
            dataId: number;
            dataType: AdminNoteDataType;
            value: string;
        },
        currentUser: MyUserProfile,
    ): Promise<AdminNote> {
        AuthHelper.validateAdmin(currentUser.globalRole);

        const { dataId, dataType, value } = dataBody;
        const adminNote: AdminNote = {
            value: value,
            updatedBy: currentUser.id,
            updatedAt: new Date(),
        };

        switch (dataType) {
            case AdminNoteDataType.USERS: {
                const user = await this.userRepository.findById(dataId);

                if (!user) {
                    throw new HttpErrors.NotFound(`User with id ${dataId} not found`);
                }

                await this.userRepository.updateById(dataId, { adminNote });

                return adminNote;
            }
            case AdminNoteDataType.LISTINGS: {
                const listing = await this.listingsRepository.findById(dataId);

                if (!listing) {
                    throw new HttpErrors.NotFound(`Listing with id ${dataId} not found`);
                }

                await this.listingsRepository.updateById(dataId, { adminNote });

                return adminNote;
            }
            case AdminNoteDataType.OFFERS: {
                const offer = await this.offersRepository.findById(dataId);

                if (!offer) {
                    throw new HttpErrors.NotFound(`Offer with id ${dataId} not found`);
                }

                await this.offersRepository.updateById(dataId, { adminNote });

                return adminNote;
            }
            case AdminNoteDataType.HAULAGE_OFFERS: {
                const haulageOffer = await this.haulageOffersRepository.findById(dataId);

                if (!haulageOffer) {
                    throw new HttpErrors.NotFound(`Haulage offer with id ${dataId} not found`);
                }

                await this.haulageOffersRepository.updateById(dataId, { adminNote });

                return adminNote;
            }
            case AdminNoteDataType.SAMPLES: {
                const sample = await this.sampleRequestsRepository.findById(dataId);

                if (!sample) {
                    throw new HttpErrors.NotFound(`Sample request with id ${dataId} not found`);
                }

                await this.sampleRequestsRepository.updateById(dataId, { adminNote });

                return adminNote;
            }
            case AdminNoteDataType.MFI: {
                const mfi = await this.mfiRequestsRepository.findById(dataId);

                if (!mfi) {
                    throw new HttpErrors.NotFound(`MFI request with id ${dataId} not found`);
                }

                await this.mfiRequestsRepository.updateById(dataId, { adminNote });

                return adminNote;
            }

            default:
                throw new HttpErrors.BadRequest(`Invalid data type: ${dataType}`);
        }
    }

    async getAdminNoteDetail(
        dataId: number,
        dataType: AdminNoteDataType,
        currentUser: MyUserProfile,
    ): Promise<
        IDataResponse<{
            value: string;
            updatedAt: Date;
            updatedBy: { id: number; firstName: string; lastName: string; email: string; role: string } | null;
        } | null>
    > {
        AuthHelper.validateAdmin(currentUser.globalRole);

        let record: { adminNote?: AdminNote } | null;
        let adminNote: AdminNote | null = null;

        switch (dataType) {
            case AdminNoteDataType.USERS: {
                record = await this.userRepository.findById(dataId);

                if (!record) {
                    throw new HttpErrors.NotFound(`User with id ${dataId} not found`);
                }

                adminNote = record.adminNote ?? null;

                break;
            }
            case AdminNoteDataType.LISTINGS: {
                record = await this.listingsRepository.findById(dataId);

                if (!record) {
                    throw new HttpErrors.NotFound(`Listing with id ${dataId} not found`);
                }

                adminNote = record.adminNote ?? null;

                break;
            }
            case AdminNoteDataType.OFFERS: {
                record = await this.offersRepository.findById(dataId);

                if (!record) {
                    throw new HttpErrors.NotFound(`Offer with id ${dataId} not found`);
                }

                adminNote = record.adminNote ?? null;

                break;
            }
            case AdminNoteDataType.HAULAGE_OFFERS: {
                record = await this.haulageOffersRepository.findById(dataId);

                if (!record) {
                    throw new HttpErrors.NotFound(`Haulage offer with id ${dataId} not found`);
                }

                adminNote = record.adminNote ?? null;

                break;
            }
            case AdminNoteDataType.SAMPLES: {
                record = await this.sampleRequestsRepository.findById(dataId);

                if (!record) {
                    throw new HttpErrors.NotFound(`Sample request with id ${dataId} not found`);
                }

                adminNote = record.adminNote ?? null;

                break;
            }
            case AdminNoteDataType.MFI: {
                record = await this.mfiRequestsRepository.findById(dataId);

                if (!record) {
                    throw new HttpErrors.NotFound(`MFI request with id ${dataId} not found`);
                }

                adminNote = record.adminNote ?? null;

                break;
            }
            default:
                throw new HttpErrors.BadRequest(`Invalid data type: ${dataType}`);
        }

        if (!adminNote?.updatedBy) {
            return {
                status: 'success',
                message: 'Admin note retrieved successfully',
                data: null,
            };
        }

        const updatedByUser = await this.userRepository.findById(adminNote.updatedBy as number);

        return {
            status: 'success',
            message: 'Admin note retrieved successfully',
            data: {
                value: adminNote?.value ?? '',
                updatedAt: adminNote?.updatedAt ?? new Date(),
                updatedBy: updatedByUser
                    ? {
                          id: updatedByUser.id as number,
                          firstName: updatedByUser.firstName,
                          lastName: updatedByUser.lastName,
                          email: updatedByUser.email,
                          role: updatedByUser.globalRole as string,
                      }
                    : null,
            },
        };
    }
}
