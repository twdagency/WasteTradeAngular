/* eslint-disable @typescript-eslint/no-explicit-any */
import { repository } from '@loopback/repository';
import { MigrationScript, migrationScript } from 'loopback4-migration';
import { CompanyUsersRepository, ListingsRepository, OffersRepository } from '../repositories';
import { OfferState, OfferStatusEnum } from '../enum/offer.enum';
@migrationScript()
export class AddOfferMockData implements MigrationScript {
    version = '1.0.1';
    scriptName = 'AddOfferMockData';
    description = 'Add offer mock data';

    constructor(
        @repository(ListingsRepository)
        private listingsRepository: ListingsRepository,
        @repository(CompanyUsersRepository)
        private companyUsersRepository: CompanyUsersRepository,
        @repository(OffersRepository)
        private offersRepository: OffersRepository,
    ) {}

    async up(): Promise<void> {
        try {
            const listingSells = await this.listingsRepository.find({
                limit: 5,
                where: { listingType: 'sell' as any },
            });
            const listingWanteds = await this.listingsRepository.find({
                limit: 5,
                where: { listingType: 'wanted' as any },
            });
            const listQueryPromise = [];

            for await (const listingSell of listingSells) {
                const companyUsers = await this.companyUsersRepository.find({ include: ['company', 'user'] });
                for (const companyUser of companyUsers) {
                    listQueryPromise.push(
                        this.offersRepository.create({
                            listingId: listingSell.id,
                            buyerUserId: companyUser.user?.id,
                            buyerCompanyId: companyUser.company?.id,
                            quantity: 3,
                            offeredPricePerUnit: 100,
                            totalPrice: 300,
                            needsTransport: true,
                            status: OfferStatusEnum.PENDING,
                            state: OfferState.PENDING,
                            createdAt: new Date().toDateString(),
                            updatedAt: new Date().toDateString(),
                        }),
                    );
                }
            }

            for await (const listingWanted of listingWanteds) {
                const companyUsers = await this.companyUsersRepository.find({ include: ['company', 'user'] });
                for (const companyUser of companyUsers) {
                    listQueryPromise.push(
                        this.offersRepository.create({
                            listingId: listingWanted.id,
                            sellerUserId: companyUser.user?.id,
                            sellerCompanyId: companyUser.company?.id,
                            quantity: 3,
                            offeredPricePerUnit: 100,
                            totalPrice: 300,
                            needsTransport: true,
                            status: OfferStatusEnum.PENDING,
                            state: OfferState.PENDING,
                            createdAt: new Date().toDateString(),
                            updatedAt: new Date().toDateString(),
                        }),
                    );
                }
            }

            await Promise.all(listQueryPromise);
        } catch (error) {
            console.error('Add offer mock data up script ran failed!:', error);
        }
        console.log('Add offer mock data up script ran completed!');
    }

    async down(): Promise<void> {
        // write the statements to rollback the migration if required and possible
    }
}
