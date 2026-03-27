import { expect, sinon } from '@loopback/testlab';
import { ListingService } from '../../services/listing.service';
import { ListingRequestActionEnum, ListingState, ListingStatus, ListingType, MaterialType } from '../../enum';
import { OfferState, OfferStatusEnum } from '../../enum/offer.enum';
import { UserRoleEnum } from '../../enum';
import { createStubRepo, createStubService } from '../helpers/stub-factory';

function buildListingService(overrides: Record<string, any> = {}): ListingService {
    const exchangeRateService = overrides.exchangeRateService ?? {
        convertListingToBaseCurrency: sinon.stub().resolves({}),
        convertOfferToBaseCurrency: sinon.stub().resolves({ offeredPricePerUnit: 100, totalPrice: 1000, currency: 'gbp', originalCurrency: 'gbp' }),
        baseCurrencyCode: 'gbp',
    };
    const listingExpiryService = overrides.listingExpiryService ?? {
        calculateExpiryInfo: sinon.stub().returns({ isExpired: false, isNearingExpiry: false }),
    };
    return new ListingService(
        overrides.listingRepo ?? createStubRepo(),
        overrides.listingDocsRepo ?? createStubRepo(['find', 'findById', 'findOne', 'create', 'updateById', 'updateAll', 'count', 'deleteById', 'deleteAll']),
        overrides.companyRepo ?? createStubRepo(),
        overrides.companyUsersRepo ?? createStubRepo(),
        overrides.companyLocationsRepo ?? createStubRepo(),
        overrides.userRepo ?? createStubRepo(),
        overrides.offersRepo ?? createStubRepo(),
        overrides.emailService ?? createStubService(['sendListingCreatedEmail', 'sendListingRejectionEmail', 'sendListingRequestInformationEmail', 'sendListingStatusUpdatedEmail', 'sendListingRenewedEmail']),
        listingExpiryService as any,
        exchangeRateService as any,
        overrides.notificationsService ?? createStubService(['createNotification']),
    );
}

function makeBaseListing(overrides: Record<string, any> = {}): any {
    return {
        id: 1,
        companyId: 10,
        createdByUserId: 1,
        status: ListingStatus.AVAILABLE,
        state: ListingState.APPROVED,
        listingType: ListingType.SELL,
        quantity: 100,
        remainingQuantity: 100,
        ...overrides,
    };
}

describe('ListingService deeper coverage (unit)', () => {
    describe('getListingById() — extended', () => {
        it('throws 403 when rejected listing accessed by non-owner', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById.resolves(makeBaseListing({ state: ListingState.REJECTED, createdByUserId: 99 }));
            const svc = buildListingService({ listingRepo });

            await expect(svc.getListingById(1, 1, false))
                .to.be.rejectedWith('You do not have permission to view this listing');
        });

        it('allows owner to view their own rejected listing', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById.resolves(makeBaseListing({ state: ListingState.REJECTED, createdByUserId: 1 }));
            const listingDocsRepo = createStubRepo(['find', 'findById', 'findOne', 'create', 'updateById', 'updateAll', 'count', 'deleteById', 'deleteAll']);
            listingDocsRepo.find.resolves([]);
            const offersRepo = createStubRepo();
            offersRepo.count.resolves({ count: 0 });
            const companyRepo = createStubRepo();
            companyRepo.findById.resolves({ id: 10, name: 'Test Co' });
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1, firstName: 'A', lastName: 'B' });
            const svc = buildListingService({ listingRepo, listingDocsRepo, offersRepo, companyRepo, userRepo });

            const result = await svc.getListingById(1, 1, false);
            expect(result.status).to.equal('success');
        });

        it('returns wantedStatus for WANTED listing type', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById.resolves(makeBaseListing({ listingType: ListingType.WANTED }));
            const listingDocsRepo = createStubRepo(['find', 'findById', 'findOne', 'create', 'updateById', 'updateAll', 'count', 'deleteById', 'deleteAll']);
            listingDocsRepo.find.resolves([]);
            const offersRepo = createStubRepo();
            offersRepo.count.resolves({ count: 0 });
            const companyRepo = createStubRepo();
            companyRepo.findById.resolves({ id: 10, name: 'Test Co' });
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1 });
            const svc = buildListingService({ listingRepo, listingDocsRepo, offersRepo, companyRepo, userRepo });

            const result = await svc.getListingById(1, 1, true);
            expect(result.status).to.equal('success');
            expect((result.data as any).listing.wantedStatus).to.not.be.undefined();
        });

        it('calculates expiry info for AVAILABLE listing', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById.resolves(makeBaseListing({ status: ListingStatus.AVAILABLE }));
            const listingDocsRepo = createStubRepo(['find', 'findById', 'findOne', 'create', 'updateById', 'updateAll', 'count', 'deleteById', 'deleteAll']);
            listingDocsRepo.find.resolves([]);
            const offersRepo = createStubRepo();
            offersRepo.count.resolves({ count: 1 });
            const companyRepo = createStubRepo();
            companyRepo.findById.resolves({ id: 10, name: 'Test Co' });
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1 });
            const listingExpiryService = { calculateExpiryInfo: sinon.stub().returns({ isExpired: false, isNearingExpiry: true, daysUntilExpiry: 5 }) };
            const svc = buildListingService({ listingRepo, listingDocsRepo, offersRepo, companyRepo, userRepo, listingExpiryService });

            const result = await svc.getListingById(1, 1, true);
            expect(result.status).to.equal('success');
            expect(listingExpiryService.calculateExpiryInfo.calledOnce).to.be.true();
        });
    });

    describe('markListingAsSold()', () => {
        it('throws 403 when non-owner tries to mark as sold', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById.resolves(makeBaseListing({ createdByUserId: 99 }));
            const svc = buildListingService({ listingRepo });

            await expect(svc.markListingAsSold(1, 1)).to.be.rejectedWith(/forbidden/i);
        });

        it('throws 400 when listing already sold', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById.resolves(makeBaseListing({ createdByUserId: 1, status: ListingStatus.SOLD }));
            const svc = buildListingService({ listingRepo });

            await expect(svc.markListingAsSold(1, 1)).to.be.rejectedWith(/sold/i);
        });

        it('throws 400 when listing state is not APPROVED', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById.resolves(makeBaseListing({ createdByUserId: 1, state: ListingState.PENDING }));
            const svc = buildListingService({ listingRepo });

            await expect(svc.markListingAsSold(1, 1)).to.be.rejectedWith(/approved/i);
        });

        it('throws 400 when listing status is not AVAILABLE', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById.resolves(makeBaseListing({ createdByUserId: 1, state: ListingState.APPROVED, status: ListingStatus.EXPIRED }));
            const svc = buildListingService({ listingRepo });

            await expect(svc.markListingAsSold(1, 1)).to.be.rejectedWith(/available/i);
        });

        it('marks listing as sold, sets remaining to 0, rejects pending offers', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById.onFirstCall().resolves(makeBaseListing({ createdByUserId: 1 }));
            listingRepo.findById.onSecondCall().resolves(makeBaseListing({ status: ListingStatus.SOLD, remainingQuantity: 0 }));
            listingRepo.updateById.resolves();
            const offersRepo = createStubRepo();
            offersRepo.find.resolves([
                { id: 10, status: OfferStatusEnum.PENDING, state: OfferState.PENDING },
                { id: 11, status: OfferStatusEnum.APPROVED, state: OfferState.ACTIVE },
            ]);
            offersRepo.updateById.resolves();
            const svc = buildListingService({ listingRepo, offersRepo });

            const result = await svc.markListingAsSold(1, 1);

            expect(listingRepo.updateById.calledWith(1, sinon.match({ status: ListingStatus.SOLD, remainingQuantity: 0, numberOfLoads: 0 }))).to.be.true();
            expect(offersRepo.updateById.callCount).to.equal(2);
            expect(result.status).to.equal('success');
        });

        it('succeeds with no offers to reject', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById.onFirstCall().resolves(makeBaseListing({ createdByUserId: 1 }));
            listingRepo.findById.onSecondCall().resolves(makeBaseListing({ status: ListingStatus.SOLD }));
            listingRepo.updateById.resolves();
            const offersRepo = createStubRepo();
            offersRepo.find.resolves([]);
            const svc = buildListingService({ listingRepo, offersRepo });

            const result = await svc.markListingAsSold(1, 1);
            expect(result.status).to.equal('success');
            expect(offersRepo.updateById.called).to.be.false();
        });
    });

    describe('handleAdminRequestAction()', () => {
        it('throws 400 when listing is already AVAILABLE', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById.resolves(makeBaseListing({ status: ListingStatus.AVAILABLE }));
            const svc = buildListingService({ listingRepo });

            await expect(svc.handleAdminRequestAction(1, ListingRequestActionEnum.ACCEPT))
                .to.be.rejectedWith(/available/i);
        });

        it('throws 400 when listing is already REJECTED', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById.resolves(makeBaseListing({ status: ListingStatus.REJECTED }));
            const svc = buildListingService({ listingRepo });

            await expect(svc.handleAdminRequestAction(1, ListingRequestActionEnum.ACCEPT))
                .to.be.rejectedWith(/rejected/i);
        });

        it('throws 400 when listing is already SOLD', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById.resolves(makeBaseListing({ status: ListingStatus.SOLD }));
            const svc = buildListingService({ listingRepo });

            await expect(svc.handleAdminRequestAction(1, ListingRequestActionEnum.ACCEPT))
                .to.be.rejectedWith(/sold/i);
        });

        it('accept: sets listing to AVAILABLE/APPROVED', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById.onFirstCall().resolves(makeBaseListing({ status: ListingStatus.PENDING, state: ListingState.PENDING, createdByUserId: 5 }));
            listingRepo.findById.onSecondCall().resolves(makeBaseListing({ status: ListingStatus.AVAILABLE, state: ListingState.APPROVED }));
            listingRepo.updateById.resolves();
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 5, email: 'user@t.com' });
            const notificationsService = createStubService(['createNotification']);
            const emailService = createStubService(['sendListingRejectionEmail', 'sendListingRequestInformationEmail', 'sendListingStatusUpdatedEmail', 'sendListingCreatedEmail']);
            const svc = buildListingService({ listingRepo, userRepo, notificationsService, emailService });

            await svc.handleAdminRequestAction(1, ListingRequestActionEnum.ACCEPT);

            expect(listingRepo.updateById.calledWith(1, sinon.match({
                status: ListingStatus.AVAILABLE,
                state: ListingState.APPROVED,
            }))).to.be.true();
        });

        it('reject: sets listing to REJECTED/REJECTED with reason', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById.onFirstCall().resolves(makeBaseListing({ status: ListingStatus.PENDING, state: ListingState.PENDING, createdByUserId: 5 }));
            listingRepo.findById.onSecondCall().resolves(makeBaseListing({ status: ListingStatus.REJECTED, state: ListingState.REJECTED }));
            listingRepo.updateById.resolves();
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 5, email: 'user@t.com' });
            const emailService = createStubService(['sendListingRejectionEmail', 'sendListingRequestInformationEmail', 'sendListingStatusUpdatedEmail', 'sendListingCreatedEmail']);
            const svc = buildListingService({ listingRepo, userRepo, emailService });

            await svc.handleAdminRequestAction(1, ListingRequestActionEnum.REJECT, { rejectionReason: 'Invalid material' });

            expect(listingRepo.updateById.calledWith(1, sinon.match({
                status: ListingStatus.REJECTED,
                state: ListingState.REJECTED,
                rejectionReason: 'Invalid material',
            }))).to.be.true();
        });

        it('request_information: sets listing back to PENDING with message', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById.onFirstCall().resolves(makeBaseListing({ status: ListingStatus.PENDING, state: ListingState.PENDING, createdByUserId: 5 }));
            listingRepo.findById.onSecondCall().resolves(makeBaseListing({ status: ListingStatus.PENDING, state: ListingState.PENDING }));
            listingRepo.updateById.resolves();
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 5, email: 'user@t.com' });
            const emailService = createStubService(['sendListingRejectionEmail', 'sendListingRequestInformationEmail', 'sendListingStatusUpdatedEmail', 'sendListingCreatedEmail']);
            const svc = buildListingService({ listingRepo, userRepo, emailService });

            await svc.handleAdminRequestAction(1, ListingRequestActionEnum.REQUEST_INFORMATION, { message: 'Please add more photos' });

            expect(listingRepo.updateById.calledWith(1, sinon.match({
                status: ListingStatus.PENDING,
                state: ListingState.PENDING,
                message: 'Please add more photos',
            }))).to.be.true();
        });

        it('continues gracefully when user is not found (deleted user)', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById.onFirstCall().resolves(makeBaseListing({ status: ListingStatus.PENDING, state: ListingState.PENDING, createdByUserId: 999 }));
            listingRepo.findById.onSecondCall().resolves(makeBaseListing({ status: ListingStatus.AVAILABLE }));
            listingRepo.updateById.resolves();
            const userRepo = createStubRepo();
            userRepo.findById.rejects(new Error('User not found'));
            const emailService = createStubService(['sendListingRejectionEmail', 'sendListingRequestInformationEmail', 'sendListingStatusUpdatedEmail', 'sendListingCreatedEmail']);
            const svc = buildListingService({ listingRepo, userRepo, emailService });

            // Should not throw even if user not found
            await svc.handleAdminRequestAction(1, ListingRequestActionEnum.ACCEPT);

            expect(listingRepo.updateById.calledOnce).to.be.true();
        });
    });

    describe('renewListing() — extended', () => {
        it('throws 400 when listing state is REJECTED', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById.resolves(makeBaseListing({ createdByUserId: 1, state: ListingState.REJECTED }));
            const svc = buildListingService({ listingRepo });

            await expect(svc.renewListing(1, 1, '90_days')).to.be.rejectedWith(/rejected/i);
        });

        it('throws 400 when listing has an ongoing renewal period', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById.resolves(makeBaseListing({ createdByUserId: 1, listingRenewalPeriod: 'monthly' }));
            const svc = buildListingService({ listingRepo });

            await expect(svc.renewListing(1, 1, '90_days')).to.be.rejectedWith(/renewal/i);
        });

        it('renews 2_weeks: adds 14 days to endDate', async () => {
            const futureDate = new Date(Date.now() + 86400000 * 3); // expires in 3 days (nearing expiry)
            const listingRepo = createStubRepo();
            listingRepo.findById.onFirstCall().resolves(makeBaseListing({ createdByUserId: 1, status: ListingStatus.AVAILABLE, endDate: futureDate }));
            listingRepo.findById.onSecondCall().resolves(makeBaseListing({ endDate: new Date(futureDate.getTime() + 86400000 * 14) }));
            listingRepo.updateById.resolves();
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1, email: 'a@b.com' });
            const listingExpiryService = { calculateExpiryInfo: sinon.stub().returns({ isExpired: false, isNearingExpiry: true }) };
            const svc = buildListingService({ listingRepo, userRepo, listingExpiryService });

            const result = await svc.renewListing(1, 1, '2_weeks');
            expect(result.status).to.equal('success');
            const updateArg = listingRepo.updateById.firstCall.args[1];
            const diffDays = Math.round((updateArg.endDate.getTime() - futureDate.getTime()) / (1000 * 60 * 60 * 24));
            expect(diffDays).to.be.within(13, 15);
        });

        it('sets status to AVAILABLE when listing was EXPIRED', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById.onFirstCall().resolves(makeBaseListing({ createdByUserId: 1, status: ListingStatus.EXPIRED }));
            listingRepo.findById.onSecondCall().resolves(makeBaseListing({ status: ListingStatus.AVAILABLE }));
            listingRepo.updateById.resolves();
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1 });
            const listingExpiryService = { calculateExpiryInfo: sinon.stub().returns({ isExpired: true, isNearingExpiry: false }) };
            const svc = buildListingService({ listingRepo, userRepo, listingExpiryService });

            await svc.renewListing(1, 1, '90_days');

            const updateArg = listingRepo.updateById.firstCall.args[1];
            expect(updateArg.status).to.equal(ListingStatus.AVAILABLE);
        });
    });
});
