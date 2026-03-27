import { injectable, BindingScope } from '@loopback/core';
import { repository } from '@loopback/repository';
import { UserRepository, ListingsRepository, OffersRepository, HaulageOffersRepository } from '../repositories';
import { HttpErrors } from '@loopback/rest';
import { AuthHelper } from '../helpers/auth.helper';
import { ListingType } from '../enum';

@injectable({ scope: BindingScope.TRANSIENT })
export class AdminAssignmentService {
    constructor(
        @repository(UserRepository)
        public userRepository: UserRepository,
        @repository(ListingsRepository)
        public listingsRepository: ListingsRepository,
        @repository(OffersRepository)
        public offersRepository: OffersRepository,
        @repository(HaulageOffersRepository)
        public haulageOffersRepository: HaulageOffersRepository,
    ) {}

    /**
     * Assign an admin to a record
     */
    async assignAdmin(
        recordType: string,
        recordId: number,
        adminId: number | null,
    ): Promise<{ success: boolean; message: string }> {
        const allowedRecordTypes = ['user', 'listing', 'wanted_listing', 'offer', 'haulage_offer'];
        if (!allowedRecordTypes.includes(recordType)) {
            throw new HttpErrors.BadRequest(`Invalid record type: ${recordType}`);
        }

        // Verify admin exists if adminId is provided
        if (adminId !== null) {
            const admin = await this.userRepository.findById(adminId);
            if (!admin) {
                throw new HttpErrors.NotFound(`Admin user with id ${adminId} not found`);
            }

            if (!AuthHelper.isAdmin(admin.globalRole)) {
                throw new HttpErrors.BadRequest(`User ${adminId} is not an admin`);
            }
        }

        // Update the record based on type
        switch (recordType) {
            case 'user':
                await this.userRepository.updateById(recordId, { assignedAdminId: adminId });
                break;
            case 'listing':
            case 'wanted_listing':
                await this.listingsRepository.updateById(recordId, { assignedAdminId: adminId });
                break;
            case 'offer':
                await this.offersRepository.updateById(recordId, { assignedAdminId: adminId });
                break;
            case 'haulage_offer':
                await this.haulageOffersRepository.updateById(recordId, { assignedAdminId: adminId });
                break;
        }

        const message = adminId ? `Record assigned to admin ${adminId} successfully` : 'Record unassigned successfully';

        return { success: true, message };
    }

    /**
     * Get all records assigned to a specific admin
     */
    async getAssignedRecords(adminId: number, recordType?: string): Promise<any> {
        const result: any = {};
        const allowedRecordTypes = ['user', 'listing', 'wanted_listing', 'offer', 'haulage_offer'];
        if (recordType && !allowedRecordTypes.includes(recordType)) {
            throw new HttpErrors.BadRequest(`Invalid record type: ${recordType}`);
        }

        if (!recordType || recordType === 'user') {
            result.users = await this.userRepository.find({
                where: { assignedAdminId: adminId },
            });
        }

        if (!recordType || recordType === 'listing' || recordType === 'wanted_listing') {
            const listingWhere: any = { assignedAdminId: adminId };
            if (recordType === 'listing') {
                listingWhere.listingType = ListingType.SELL;
            }
            if (recordType === 'wanted_listing') {
                listingWhere.listingType = ListingType.WANTED;
            }
            result.listings = await this.listingsRepository.find({
                where: listingWhere,
            });
        }

        if (!recordType || recordType === 'offer') {
            result.offers = await this.offersRepository.find({
                where: { assignedAdminId: adminId },
            });
        }

        if (!recordType || recordType === 'haulage_offer') {
            result.haulageOffers = await this.haulageOffersRepository.find({
                where: { assignedAdminId: adminId },
            });
        }

        return result;
    }
}
