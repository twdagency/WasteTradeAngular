import { expect, sinon } from '@loopback/testlab';
import { ListingService } from '../../services/listing.service';
import { ListingState, ListingStatus, ListingType, UserRoleEnum } from '../../enum';
import { OfferStatusEnum } from '../../enum/offer.enum';
import { createStubRepo, createStubService } from '../helpers/stub-factory';

function buildListingService(overrides: Record<string, any> = {}): ListingService {
    const exchangeRateService = overrides.exchangeRateService ?? {
        convertListingToBaseCurrency: sinon.stub().resolves({}),
        convertOfferToBaseCurrency: sinon.stub().resolves({ offeredPricePerUnit: 100, totalPrice: 1000 }),
        baseCurrencyCode: 'gbp',
    };
    const listingExpiryService = overrides.listingExpiryService ?? {
        calculateExpiryInfo: sinon.stub().returns({ isExpired: false, isNearingExpiry: true }),
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

describe('ListingService extended coverage - Part 4 (unit)', () => {
    describe('renewListing()', () => {
        it('throws 404 when listing not found', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById.resolves(null);
            const svc = buildListingService({ listingRepo });

            await expect(svc.renewListing(999, 1, '2_weeks')).to.be.rejectedWith(/not found|listing/i);
        });

        it('throws 403 when caller is not owner', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById.resolves(makeBaseListing({ createdByUserId: 99 }));
            const svc = buildListingService({ listingRepo });

            await expect(svc.renewListing(1, 1, '2_weeks')).to.be.rejected();
        });

        it('throws 400 when listing is already SOLD', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById.resolves(makeBaseListing({ status: ListingStatus.SOLD, createdByUserId: 1 }));
            const svc = buildListingService({ listingRepo });

            await expect(svc.renewListing(1, 1, '2_weeks')).to.be.rejectedWith(/sold/i);
        });

        it('throws 400 when listing is REJECTED state', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById.resolves(makeBaseListing({ state: ListingState.REJECTED, createdByUserId: 1 }));
            const svc = buildListingService({ listingRepo });

            await expect(svc.renewListing(1, 1, '2_weeks')).to.be.rejectedWith(/rejected/i);
        });

        it('throws 400 when listing has auto-renewal period set', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById.resolves(makeBaseListing({ listingRenewalPeriod: '90_days', createdByUserId: 1 }));
            const svc = buildListingService({ listingRepo });

            await expect(svc.renewListing(1, 1, '2_weeks')).to.be.rejectedWith(/renewal/i);
        });

        it('throws 400 when listing is not expired or nearing expiry', async () => {
            const listingExpiryService = { calculateExpiryInfo: sinon.stub().returns({ isExpired: false, isNearingExpiry: false }) };
            const listingRepo = createStubRepo();
            listingRepo.findById.resolves(makeBaseListing({ createdByUserId: 1 }));
            const svc = buildListingService({ listingRepo, listingExpiryService });

            await expect(svc.renewListing(1, 1, '2_weeks')).to.be.rejectedWith(/eligible/i);
        });

        it('successfully renews an expired listing with 2_weeks period', async () => {
            const listingExpiryService = { calculateExpiryInfo: sinon.stub().returns({ isExpired: true, isNearingExpiry: false }) };
            const listingRepo = createStubRepo();
            listingRepo.findById
                .onFirstCall().resolves(makeBaseListing({ createdByUserId: 1, status: ListingStatus.EXPIRED, endDate: null }))
                .onSecondCall().resolves(makeBaseListing({ status: ListingStatus.AVAILABLE }));
            listingRepo.updateById.resolves();
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1, email: 'u@t.com', firstName: 'John', lastName: 'Doe' });
            const emailService = createStubService(['sendListingRenewedEmail']);
            const notificationsService = createStubService(['createNotification']);
            const svc = buildListingService({ listingRepo, userRepo, emailService, notificationsService, listingExpiryService });

            const result = await svc.renewListing(1, 1, '2_weeks');

            expect(result.status).to.equal('success');
            const updateArg = listingRepo.updateById.firstCall.args[1];
            expect(updateArg.status).to.equal(ListingStatus.AVAILABLE);
        });

        it('successfully renews with 90_days period without changing status when not expired', async () => {
            const listingExpiryService = { calculateExpiryInfo: sinon.stub().returns({ isExpired: false, isNearingExpiry: true }) };
            const listingRepo = createStubRepo();
            listingRepo.findById
                .onFirstCall().resolves(makeBaseListing({ createdByUserId: 1, status: ListingStatus.AVAILABLE }))
                .onSecondCall().resolves(makeBaseListing({ status: ListingStatus.AVAILABLE }));
            listingRepo.updateById.resolves();
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1, email: 'u@t.com' });
            const emailService = createStubService(['sendListingRenewedEmail']);
            const notificationsService = createStubService(['createNotification']);
            const svc = buildListingService({ listingRepo, userRepo, emailService, notificationsService, listingExpiryService });

            const result = await svc.renewListing(1, 1, '90_days');

            expect(result.status).to.equal('success');
            const updateArg = listingRepo.updateById.firstCall.args[1];
            expect(updateArg.status).to.be.undefined();
        });
    });

    describe('markListingAsSold()', () => {
        it('throws 404 when listing not found', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById.resolves(null);
            const svc = buildListingService({ listingRepo });

            await expect(svc.markListingAsSold(999, 1)).to.be.rejectedWith(/not found|listing/i);
        });

        it('throws 403 when caller is not owner', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById.resolves(makeBaseListing({ createdByUserId: 99 }));
            const svc = buildListingService({ listingRepo });

            await expect(svc.markListingAsSold(1, 1)).to.be.rejected();
        });

        it('throws 400 when listing is already SOLD', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById.resolves(makeBaseListing({ status: ListingStatus.SOLD, createdByUserId: 1 }));
            const svc = buildListingService({ listingRepo });

            await expect(svc.markListingAsSold(1, 1)).to.be.rejectedWith(/sold/i);
        });

        it('throws 400 when listing state is not APPROVED', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById.resolves(makeBaseListing({ state: ListingState.PENDING, createdByUserId: 1 }));
            const svc = buildListingService({ listingRepo });

            await expect(svc.markListingAsSold(1, 1)).to.be.rejectedWith(/approved/i);
        });

        it('throws 400 when listing status is not AVAILABLE', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById.resolves(makeBaseListing({ status: ListingStatus.PENDING, state: ListingState.APPROVED, createdByUserId: 1 }));
            const svc = buildListingService({ listingRepo });

            await expect(svc.markListingAsSold(1, 1)).to.be.rejectedWith(/available/i);
        });

        it('marks listing as sold and rejects pending offers', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById
                .onFirstCall().resolves(makeBaseListing({ createdByUserId: 1 }))
                .onSecondCall().resolves(makeBaseListing({ status: ListingStatus.SOLD }));
            listingRepo.updateById.resolves();
            const offersRepo = createStubRepo();
            offersRepo.find.resolves([
                { id: 5, status: OfferStatusEnum.PENDING },
                { id: 6, status: OfferStatusEnum.APPROVED },
            ]);
            offersRepo.updateById.resolves();
            const svc = buildListingService({ listingRepo, offersRepo });

            const result = await svc.markListingAsSold(1, 1);

            expect(result.status).to.equal('success');
            expect(listingRepo.updateById.calledWith(1, sinon.match({ status: ListingStatus.SOLD }))).to.be.true();
            expect(offersRepo.updateById.callCount).to.equal(2);
        });

        it('marks listing as sold when there are no pending offers', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById
                .onFirstCall().resolves(makeBaseListing({ createdByUserId: 1 }))
                .onSecondCall().resolves(makeBaseListing({ status: ListingStatus.SOLD }));
            listingRepo.updateById.resolves();
            const offersRepo = createStubRepo();
            offersRepo.find.resolves([]);
            const svc = buildListingService({ listingRepo, offersRepo });

            const result = await svc.markListingAsSold(1, 1);

            expect(result.status).to.equal('success');
            expect(offersRepo.updateById.called).to.be.false();
        });
    });

    describe('deleteListing()', () => {
        it('throws 404 when listing not found', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById.resolves(null);
            const svc = buildListingService({ listingRepo });

            await expect(svc.deleteListing(999, '1')).to.be.rejectedWith(/not found|listing/i);
        });

        it('throws 403 when non-owner non-admin tries to delete', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById.resolves(makeBaseListing({ createdByUserId: 99 }));
            const svc = buildListingService({ listingRepo });

            await expect(svc.deleteListing(1, '1')).to.be.rejectedWith(/permission|forbidden|authorized/i);
        });

        it('deletes listing when called by owner', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById.resolves(makeBaseListing({ createdByUserId: 1 }));
            listingRepo.deleteById = sinon.stub().resolves();
            listingRepo.dataSource = { execute: sinon.stub().resolves([]) };
            const offersRepo = createStubRepo();
            // First: find accepted offers (empty), then count pending offers (0)
            offersRepo.find.resolves([]);
            offersRepo.count.resolves({ count: 0 });
            const listingDocsRepo = createStubRepo(['find', 'findById', 'findOne', 'create', 'updateById', 'updateAll', 'count', 'deleteById', 'deleteAll']);
            listingDocsRepo.deleteAll.resolves();
            const svc = buildListingService({ listingRepo, offersRepo, listingDocsRepo });

            await svc.deleteListing(1, '1');

            expect(listingRepo.deleteById.calledWith(1)).to.be.true();
        });

        it('throws error when listing has accepted offers', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById.resolves(makeBaseListing({ createdByUserId: 1 }));
            const offersRepo = createStubRepo();
            // Accepted offers present — should throw
            offersRepo.find.resolves([{ id: 1, status: 'accepted' }]);
            const svc = buildListingService({ listingRepo, offersRepo });

            await expect(svc.deleteListing(1, '1')).to.be.rejectedWith(/offer|cannot delete/i);
        });
    });

    describe('getAdminListingById()', () => {
        it('throws NotFound when listing not found via raw SQL', async () => {
            const listingRepo = createStubRepo();
            listingRepo.dataSource = {
                execute: sinon.stub().resolves([]),
            };
            const svc = buildListingService({ listingRepo });

            await expect(svc.getAdminListingById(999)).to.be.rejectedWith(/not found|listing/i);
        });

        it('returns listing data on success', async () => {
            const listingRepo = createStubRepo();
            listingRepo.dataSource = {
                execute: sinon.stub().resolves([{
                    id: 1,
                    material_type: 'plastic',
                    listing_type: 'sell',
                    status: ListingStatus.AVAILABLE,
                    state: 'approved',
                    start_date: null,
                    rejection_reason: null,
                    currency: null,
                }]),
            };
            const listingDocsRepo = createStubRepo(['find', 'findById', 'findOne', 'create', 'updateById', 'updateAll', 'count', 'deleteById', 'deleteAll']);
            listingDocsRepo.find.resolves([]);
            const svc = buildListingService({ listingRepo, listingDocsRepo });

            const result = await svc.getAdminListingById(1);
            expect(result.status).to.equal('success');
        });
    });

    describe('getListings() — wanted listing type', () => {
        it('applies listingType=wanted filter in SQL', async () => {
            const listingRepo = createStubRepo();
            const capturedSqls: string[] = [];
            listingRepo.dataSource = {
                execute: sinon.stub().callsFake((sql: string) => {
                    capturedSqls.push(String(sql));
                    if (String(sql).includes('COUNT')) return Promise.resolve([{ count: 0 }]);
                    return Promise.resolve([]);
                }),
            };
            const svc = buildListingService({ listingRepo });

            await svc.getListings({ filter: { where: { listingType: ListingType.WANTED } as any } });
            expect(capturedSqls.some(s => s.toLowerCase().includes('wanted'))).to.be.true();
        });

        it('applies country filter in SQL when provided', async () => {
            const listingRepo = createStubRepo();
            const capturedSqls: string[] = [];
            listingRepo.dataSource = {
                execute: sinon.stub().callsFake((sql: string) => {
                    capturedSqls.push(String(sql));
                    if (String(sql).includes('COUNT')) return Promise.resolve([{ count: 0 }]);
                    return Promise.resolve([]);
                }),
            };
            const svc = buildListingService({ listingRepo });

            await svc.getListings({ filter: { where: { country: 'GB' } as any } });
            const combined = capturedSqls.join(' ');
            expect(combined.includes('GB') || combined.includes('country')).to.be.true();
        });
    });
});
