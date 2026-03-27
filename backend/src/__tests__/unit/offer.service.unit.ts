import { expect, sinon } from '@loopback/testlab';
import { OfferService } from '../../services/offer.service';
import { ListingStatus, ListingType } from '../../enum';
import { OfferRequestActionEnum, OfferState, OfferStatusEnum } from '../../enum/offer.enum';
import { UserRoleEnum } from '../../enum';
import { createStubRepo, createStubService } from '../helpers/stub-factory';

function makeUserProfile(overrides: Record<string, any> = {}): any {
    return { id: 1, globalRole: UserRoleEnum.USER, companyId: 10, ...overrides };
}

function buildOfferService(overrides: Record<string, any> = {}): OfferService {
    const exchangeRateService = overrides.exchangeRateService ?? {
        convertOfferToBaseCurrency: sinon.stub().resolves({
            offeredPricePerUnit: 100,
            totalPrice: 1000,
            currency: 'gbp',
            originalCurrency: 'gbp',
        }),
        convertToBaseCurrency: sinon.stub().resolves(100),
        baseCurrencyCode: 'gbp',
    };
    return new OfferService(
        overrides.offersRepo ?? createStubRepo(),
        overrides.listingsRepo ?? createStubRepo(),
        overrides.companiesRepo ?? createStubRepo(),
        overrides.userRepo ?? createStubRepo(),
        overrides.companyUsersRepo ?? createStubRepo(),
        overrides.companyLocationsRepo ?? createStubRepo(),
        overrides.listingDocsRepo ?? createStubRepo(),
        overrides.emailService ?? createStubService([
            'sendOfferAcceptEmail',
            'sendOfferRejectionEmail',
            'sendOfferRequestInformationEmail',
            'sendNewHaulageOpportunityEmail',
            'sendOfferStatusUpdatedEmail',
        ]),
        exchangeRateService as any,
        overrides.notificationsService ?? createStubService(['createNotification']),
    );
}

function makeListing(overrides: Record<string, any> = {}): any {
    return {
        id: 1,
        companyId: 20,
        createdByUserId: 99,
        status: ListingStatus.AVAILABLE,
        listingType: ListingType.SELL,
        quantity: 100,
        remainingQuantity: 100,
        locationId: 5,
        ...overrides,
    };
}

function makeOffer(overrides: Record<string, any> = {}): any {
    return {
        id: 1,
        listingId: 1,
        status: OfferStatusEnum.APPROVED,
        state: OfferState.ACTIVE,
        buyerUserId: 1,
        sellerUserId: 99,
        buyerCompanyId: 10,
        sellerCompanyId: 20,
        quantity: 10,
        offeredPricePerUnit: 50,
        ...overrides,
    };
}

describe('OfferService (unit)', () => {
    describe('createOffer()', () => {
        it('throws 404 when listing not found', async () => {
            const listingsRepo = createStubRepo();
            listingsRepo.findById.rejects(Object.assign(new Error('not found'), { statusCode: 404 }));
            const svc = buildOfferService({ listingsRepo });

            await expect(svc.createOffer({
                listingId: 999,
                listingType: ListingType.SELL,
                companyId: 10,
                locationId: 5,
                createdByUserId: 1,
                quantity: 10,
                offeredPricePerUnit: 50,
                currency: 'gbp',
                expiresAt: new Date().toISOString(),
                earliestDeliveryDate: new Date().toISOString(),
                latestDeliveryDate: new Date().toISOString(),
            } as any)).to.be.rejected();
        });

        it('throws 400 when listing is not available', async () => {
            const listingsRepo = createStubRepo();
            listingsRepo.findById.resolves(makeListing({ status: ListingStatus.SOLD }));
            const svc = buildOfferService({ listingsRepo });

            await expect(svc.createOffer({
                listingId: 1,
                listingType: ListingType.SELL,
                companyId: 10,
                locationId: 5,
                createdByUserId: 1,
                quantity: 10,
                offeredPricePerUnit: 50,
                currency: 'gbp',
                expiresAt: new Date().toISOString(),
                earliestDeliveryDate: new Date().toISOString(),
                latestDeliveryDate: new Date().toISOString(),
            } as any)).to.be.rejectedWith('listing-not-available');
        });

        it('throws 400 when quantity exceeds remaining', async () => {
            const listingsRepo = createStubRepo();
            listingsRepo.findById.resolves(makeListing({ remainingQuantity: 5 }));
            const svc = buildOfferService({ listingsRepo });

            await expect(svc.createOffer({
                listingId: 1,
                listingType: ListingType.SELL,
                companyId: 10,
                locationId: 5,
                createdByUserId: 1,
                quantity: 50,
                offeredPricePerUnit: 50,
                currency: 'gbp',
                expiresAt: new Date().toISOString(),
                earliestDeliveryDate: new Date().toISOString(),
                latestDeliveryDate: new Date().toISOString(),
            } as any)).to.be.rejectedWith('quantity-exceeded');
        });

        it('throws 400 when bidding on own listing (same companyId)', async () => {
            const listingsRepo = createStubRepo();
            listingsRepo.findById.resolves(makeListing({ companyId: 10 })); // same as bid companyId
            const svc = buildOfferService({ listingsRepo });

            await expect(svc.createOffer({
                listingId: 1,
                listingType: ListingType.SELL,
                companyId: 10,
                locationId: 5,
                createdByUserId: 1,
                quantity: 5,
                offeredPricePerUnit: 50,
                currency: 'gbp',
                expiresAt: new Date().toISOString(),
                earliestDeliveryDate: new Date().toISOString(),
                latestDeliveryDate: new Date().toISOString(),
            } as any)).to.be.rejectedWith('cannot-bid-on-own-listing');
        });

        it('creates SELL offer and sets buyer/seller fields', async () => {
            const listingsRepo = createStubRepo();
            listingsRepo.findById.resolves(makeListing({ companyId: 20, locationId: 5 }));
            const offersRepo = createStubRepo();
            offersRepo.create.resolves({ id: 100, status: OfferStatusEnum.PENDING });
            const companyLocationsRepo = createStubRepo();
            companyLocationsRepo.findById.resolves({ id: 5, country: 'GB' });
            const companiesRepo = createStubRepo();
            companiesRepo.findById.onFirstCall().resolves({ id: 10, country: 'GB' });
            companiesRepo.findById.onSecondCall().resolves({ id: 20, country: 'FR' });
            const svc = buildOfferService({ listingsRepo, offersRepo, companyLocationsRepo, companiesRepo });

            const result = await svc.createOffer({
                listingId: 1,
                listingType: ListingType.SELL,
                companyId: 10,
                locationId: 5,
                createdByUserId: 1,
                quantity: 10,
                offeredPricePerUnit: 50,
                currency: 'gbp',
                expiresAt: new Date().toISOString(),
                earliestDeliveryDate: new Date().toISOString(),
                latestDeliveryDate: new Date().toISOString(),
            } as any);

            expect(result.status).to.equal(OfferStatusEnum.PENDING);
            const savedData = offersRepo.create.firstCall.args[0];
            expect(savedData.buyerCompanyId).to.equal(10);
            expect(savedData.sellerCompanyId).to.equal(20);
        });
    });

    describe('handleRequestAction()', () => {
        it('throws 404 when offer not found', async () => {
            const offersRepo = createStubRepo();
            offersRepo.findById.rejects(Object.assign(new Error('not found'), { statusCode: 404 }));
            const svc = buildOfferService({ offersRepo });

            await expect(svc.handleRequestAction(999, OfferRequestActionEnum.ACCEPT, makeUserProfile()))
                .to.be.rejected();
        });

        it('throws 400 when offer is not in APPROVED status', async () => {
            const offersRepo = createStubRepo();
            offersRepo.findById.resolves(makeOffer({ status: OfferStatusEnum.PENDING }));
            const svc = buildOfferService({ offersRepo });

            await expect(svc.handleRequestAction(1, OfferRequestActionEnum.ACCEPT, makeUserProfile()))
                .to.be.rejectedWith('offer-not-action');
        });

        it('accept: closes offer, updates listing remaining quantity', async () => {
            const offersRepo = createStubRepo();
            offersRepo.findById.resolves(makeOffer({ quantity: 10 }));
            offersRepo.updateById.resolves();
            offersRepo.updateAll.resolves();
            const listingsRepo = createStubRepo();
            listingsRepo.findById.resolves(makeListing({ remainingQuantity: 50, status: ListingStatus.AVAILABLE }));
            listingsRepo.updateById.resolves();
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 99, email: 'seller@test.com' });
            const companyLocationsRepo = createStubRepo();
            companyLocationsRepo.findById.resolves(null);
            const companyUsersRepo = createStubRepo();
            companyUsersRepo.find.resolves([]);
            const svc = buildOfferService({ offersRepo, listingsRepo, userRepo, companyLocationsRepo, companyUsersRepo });

            await svc.handleRequestAction(1, OfferRequestActionEnum.ACCEPT, makeUserProfile({ id: 5 }));

            expect(offersRepo.updateById.calledWith(1, sinon.match({
                state: OfferState.CLOSED,
                status: OfferStatusEnum.ACCEPTED,
                acceptedByUserId: 5,
            }))).to.be.true();
        });

        it('reject: sets offer to CLOSED/REJECTED with rejectionSource=seller', async () => {
            const offersRepo = createStubRepo();
            offersRepo.findById.resolves(makeOffer());
            offersRepo.updateById.resolves();
            const listingsRepo = createStubRepo();
            listingsRepo.findById.resolves(makeListing());
            const svc = buildOfferService({ offersRepo, listingsRepo });

            await svc.handleRequestAction(1, OfferRequestActionEnum.REJECT, makeUserProfile({ id: 5 }),
                { rejectionReason: 'Price too low' });

            expect(offersRepo.updateById.calledWith(1, sinon.match({
                status: OfferStatusEnum.REJECTED,
                state: OfferState.CLOSED,
                rejectionSource: 'seller',
                rejectionReason: 'Price too low',
            }))).to.be.true();
        });
    });

    describe('handleAdminRequestAction()', () => {
        it('throws 400 when offer is not PENDING', async () => {
            const offersRepo = createStubRepo();
            offersRepo.findById.resolves(makeOffer({ status: OfferStatusEnum.APPROVED }));
            const listingsRepo = createStubRepo();
            listingsRepo.findById.resolves(makeListing());
            const svc = buildOfferService({ offersRepo, listingsRepo });

            await expect(svc.handleAdminRequestAction(1, OfferRequestActionEnum.ACCEPT))
                .to.be.rejectedWith('offer-not-action');
        });

        it('accept: sets offer to APPROVED/ACTIVE', async () => {
            const offersRepo = createStubRepo();
            offersRepo.findById.resolves(makeOffer({ status: OfferStatusEnum.PENDING, state: OfferState.PENDING }));
            offersRepo.updateById.resolves();
            const listingsRepo = createStubRepo();
            listingsRepo.findById.resolves(makeListing());
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1, email: 'seller@t.com' });
            const companyLocationsRepo = createStubRepo();
            companyLocationsRepo.findById.resolves(null);
            const companyUsersRepo = createStubRepo();
            companyUsersRepo.find.resolves([]);
            const svc = buildOfferService({ offersRepo, listingsRepo, userRepo, companyLocationsRepo, companyUsersRepo });

            await svc.handleAdminRequestAction(1, OfferRequestActionEnum.ACCEPT);

            expect(offersRepo.updateById.calledWith(1, sinon.match({
                status: OfferStatusEnum.APPROVED,
                state: OfferState.ACTIVE,
            }))).to.be.true();
        });

        it('reject: sets offer to REJECTED/CLOSED with rejectionSource=admin', async () => {
            const offersRepo = createStubRepo();
            offersRepo.findById.resolves(makeOffer({ status: OfferStatusEnum.PENDING, state: OfferState.PENDING }));
            offersRepo.updateById.resolves();
            const listingsRepo = createStubRepo();
            listingsRepo.findById.resolves(makeListing());
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 99, email: 'buyer@t.com' });
            const svc = buildOfferService({ offersRepo, listingsRepo, userRepo });

            await svc.handleAdminRequestAction(1, OfferRequestActionEnum.REJECT,
                { rejectionReason: 'Unsuitable' });

            expect(offersRepo.updateById.calledWith(1, sinon.match({
                status: OfferStatusEnum.REJECTED,
                state: OfferState.CLOSED,
                rejectionSource: 'admin',
            }))).to.be.true();
        });
    });

    describe('rejectAllPendingAndApprovedOffersForListing()', () => {
        it('does nothing when no open offers exist', async () => {
            const offersRepo = createStubRepo();
            offersRepo.find.resolves([]);
            offersRepo.updateAll.resolves();
            const svc = buildOfferService({ offersRepo });

            await svc.rejectAllPendingAndApprovedOffersForListing(1);

            expect(offersRepo.updateAll.called).to.be.false();
        });

        it('bulk-rejects all pending and approved offers', async () => {
            const offersRepo = createStubRepo();
            offersRepo.find.resolves([
                makeOffer({ id: 1, status: OfferStatusEnum.PENDING }),
                makeOffer({ id: 2, status: OfferStatusEnum.APPROVED }),
            ]);
            offersRepo.updateAll.resolves();
            const svc = buildOfferService({ offersRepo });

            await svc.rejectAllPendingAndApprovedOffersForListing(1, 'Test reason');

            expect(offersRepo.updateAll.calledOnce).to.be.true();
            const [updateData, whereClause] = offersRepo.updateAll.firstCall.args;
            expect(updateData.status).to.equal(OfferStatusEnum.REJECTED);
            expect(updateData.state).to.equal(OfferState.CLOSED);
            expect(updateData.rejectionReason).to.equal('Test reason');
            expect(updateData.rejectionSource).to.equal('system');
            expect(whereClause.listingId).to.equal(1);
        });

        it('uses default rejection reason when none provided', async () => {
            const offersRepo = createStubRepo();
            offersRepo.find.resolves([makeOffer({ id: 1, status: OfferStatusEnum.PENDING })]);
            offersRepo.updateAll.resolves();
            const svc = buildOfferService({ offersRepo });

            await svc.rejectAllPendingAndApprovedOffersForListing(5);

            const [updateData] = offersRepo.updateAll.firstCall.args;
            expect(updateData.rejectionReason).to.equal('Listing marked as sold');
        });
    });
});
