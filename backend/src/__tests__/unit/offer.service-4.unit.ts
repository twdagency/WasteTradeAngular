/**
 * offer.service-4.unit.ts
 * Coverage for: createOffer (SELL/WANTED/invalid paths),
 * rejectAllPendingAndApprovedOffersForListing,
 * getOffersAdmin extended sort/filter branches
 */
import { expect, sinon } from '@loopback/testlab';
import { OfferService } from '../../services/offer.service';
import { ListingStatus, ListingType } from '../../enum';
import { OfferSortBy, OfferState, OfferStatusEnum } from '../../enum/offer.enum';
import { UserRoleEnum } from '../../enum';
import { createStubRepo, createStubService } from '../helpers/stub-factory';

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

function makeBiddingForm(overrides: Record<string, any> = {}): any {
    return {
        listingId: 1,
        listingType: ListingType.SELL,
        companyId: 10,
        locationId: 3,
        createdByUserId: 1,
        quantity: 10,
        offeredPricePerUnit: 50,
        currency: 'gbp',
        expiresAt: new Date(Date.now() + 86400000).toISOString(),
        earliestDeliveryDate: new Date(Date.now() + 86400000).toISOString(),
        latestDeliveryDate: new Date(Date.now() + 172800000).toISOString(),
        incoterms: 'EXW',
        shippingPort: '',
        ...overrides,
    };
}

describe('OfferService coverage - Part 4 (unit)', () => {
    describe('createOffer() — SELL listing path', () => {
        it('throws 404 when listing not found', async () => {
            const listingsRepo = createStubRepo();
            listingsRepo.findById.resolves(null);
            const svc = buildOfferService({ listingsRepo });

            await expect(svc.createOffer(makeBiddingForm())).to.be.rejected();
        });

        it('throws 400 when listing is not AVAILABLE', async () => {
            const listingsRepo = createStubRepo();
            listingsRepo.findById.resolves(makeListing({ status: ListingStatus.SOLD }));
            const svc = buildOfferService({ listingsRepo });

            await expect(svc.createOffer(makeBiddingForm())).to.be.rejected();
        });

        it('throws 400 when quantity exceeds remaining', async () => {
            const listingsRepo = createStubRepo();
            listingsRepo.findById.resolves(makeListing({ remainingQuantity: 5 }));
            const svc = buildOfferService({ listingsRepo });

            await expect(svc.createOffer(makeBiddingForm({ quantity: 50 }))).to.be.rejectedWith(/quantity/i);
        });

        it('throws 400 when bidder is the listing creator', async () => {
            const listingsRepo = createStubRepo();
            listingsRepo.findById.resolves(makeListing({ createdByUserId: 1 }));
            const svc = buildOfferService({ listingsRepo });

            // createdByUserId=1 same as listing.createdByUserId=1
            await expect(svc.createOffer(makeBiddingForm({ createdByUserId: 1 }))).to.be.rejected();
        });

        it('throws 400 when bidder company is same as listing company', async () => {
            const listingsRepo = createStubRepo();
            listingsRepo.findById.resolves(makeListing({ companyId: 10 }));
            const svc = buildOfferService({ listingsRepo });

            // companyId=10 matches listing.companyId=10
            await expect(svc.createOffer(makeBiddingForm({ companyId: 10 }))).to.be.rejected();
        });

        it('throws 404 when buyer location not found (SELL)', async () => {
            const listingsRepo = createStubRepo();
            listingsRepo.findById.resolves(makeListing());
            const companyLocationsRepo = createStubRepo();
            companyLocationsRepo.findById.resolves(null); // buyer location not found
            const svc = buildOfferService({ listingsRepo, companyLocationsRepo });

            await expect(svc.createOffer(makeBiddingForm())).to.be.rejected();
        });

        it('creates offer successfully for SELL listing', async () => {
            const listingsRepo = createStubRepo();
            listingsRepo.findById.resolves(makeListing());
            const companyLocationsRepo = createStubRepo();
            companyLocationsRepo.findById.resolves({ id: 3, country: 'GB' });
            const companiesRepo = createStubRepo();
            companiesRepo.findById
                .onFirstCall().resolves({ id: 10, country: 'GB' })
                .onSecondCall().resolves({ id: 20, country: 'FR' });
            const offersRepo = createStubRepo();
            offersRepo.create.resolves({ id: 42, listingId: 1 });
            const svc = buildOfferService({ listingsRepo, companyLocationsRepo, companiesRepo, offersRepo });

            const result = await svc.createOffer(makeBiddingForm());
            expect(result.id).to.equal(42);
        });
    });

    describe('createOffer() — WANTED listing path', () => {
        it('throws 404 when seller location not found (WANTED)', async () => {
            const listingsRepo = createStubRepo();
            listingsRepo.findById.resolves(makeListing({ listingType: ListingType.WANTED }));
            const companyLocationsRepo = createStubRepo();
            companyLocationsRepo.findById.resolves(null);
            const svc = buildOfferService({ listingsRepo, companyLocationsRepo });

            await expect(svc.createOffer(makeBiddingForm({ listingType: ListingType.WANTED }))).to.be.rejected();
        });

        it('creates offer successfully for WANTED listing', async () => {
            const listingsRepo = createStubRepo();
            listingsRepo.findById.resolves(makeListing({ listingType: ListingType.WANTED, createdByUserId: 99 }));
            const companyLocationsRepo = createStubRepo();
            companyLocationsRepo.findById.resolves({ id: 3, country: 'FR' });
            const companiesRepo = createStubRepo();
            companiesRepo.findById
                .onFirstCall().resolves({ id: 10, country: 'FR' })
                .onSecondCall().resolves({ id: 20, country: 'GB' });
            const offersRepo = createStubRepo();
            offersRepo.create.resolves({ id: 55, listingId: 1 });
            const svc = buildOfferService({ listingsRepo, companyLocationsRepo, companiesRepo, offersRepo });

            const result = await svc.createOffer(makeBiddingForm({ listingType: ListingType.WANTED }));
            expect(result.id).to.equal(55);
        });

        it('throws 400 for invalid listing type', async () => {
            const listingsRepo = createStubRepo();
            listingsRepo.findById.resolves(makeListing());
            const companyLocationsRepo = createStubRepo();
            companyLocationsRepo.findById.resolves({ id: 3, country: 'GB' });
            const companiesRepo = createStubRepo();
            companiesRepo.findById
                .onFirstCall().resolves({ id: 10, country: 'GB' })
                .onSecondCall().resolves({ id: 20, country: 'FR' });
            const svc = buildOfferService({ listingsRepo, companyLocationsRepo, companiesRepo });

            await expect(svc.createOffer(makeBiddingForm({ listingType: 'unknown_type' }))).to.be.rejected();
        });
    });

    describe('rejectAllPendingAndApprovedOffersForListing()', () => {
        it('returns immediately when no offers to reject', async () => {
            const offersRepo = createStubRepo();
            offersRepo.find.resolves([]);
            const svc = buildOfferService({ offersRepo });

            // Should not throw and updateAll should not be called
            await svc.rejectAllPendingAndApprovedOffersForListing(1);
            expect(offersRepo.updateAll.called).to.be.false();
        });

        it('rejects all pending/approved offers with system reason', async () => {
            const offersRepo = createStubRepo();
            offersRepo.find.resolves([
                { id: 1, status: OfferStatusEnum.PENDING, state: OfferState.PENDING },
                { id: 2, status: OfferStatusEnum.APPROVED, state: OfferState.ACTIVE },
            ]);
            offersRepo.updateAll.resolves({ count: 2 });
            const svc = buildOfferService({ offersRepo });

            await svc.rejectAllPendingAndApprovedOffersForListing(5);
            expect(offersRepo.updateAll.calledOnce).to.be.true();
            const [updateData] = offersRepo.updateAll.firstCall.args;
            expect(updateData.status).to.equal(OfferStatusEnum.REJECTED);
            expect(updateData.rejectionSource).to.equal('system');
        });

        it('uses provided custom rejection reason', async () => {
            const offersRepo = createStubRepo();
            offersRepo.find.resolves([{ id: 1, status: OfferStatusEnum.PENDING }]);
            offersRepo.updateAll.resolves({ count: 1 });
            const svc = buildOfferService({ offersRepo });

            await svc.rejectAllPendingAndApprovedOffersForListing(5, 'Listing withdrawn by seller');
            const [updateData] = offersRepo.updateAll.firstCall.args;
            expect(updateData.rejectionReason).to.equal('Listing withdrawn by seller');
        });
    });

    describe('getOffersAdmin() — additional sort branches', () => {
        function makeAdminOffersRepo(capturedSqls: string[]): any {
            const repo = createStubRepo();
            repo.dataSource = {
                execute: sinon.stub().callsFake((sql: string, params?: any[]) => {
                    capturedSqls.push(String(sql));
                    if (params && params.length > 0) return Promise.resolve([]);
                    return Promise.resolve([{ totalCount: 0 }]);
                }),
            };
            return repo;
        }

        it('applies sellerCompanyNameAsc sort', async () => {
            const sqls: string[] = [];
            const offersRepo = makeAdminOffersRepo(sqls);
            const svc = buildOfferService({ offersRepo });

            await svc.getOffersAdmin({ where: { sortBy: OfferSortBy.SELLER_COMPANY_NAME_ASC } as any });
            expect(sqls.some(s => s.includes('sc.name ASC'))).to.be.true();
        });

        it('applies buyerCompanyNameDesc sort', async () => {
            const sqls: string[] = [];
            const offersRepo = makeAdminOffersRepo(sqls);
            const svc = buildOfferService({ offersRepo });

            await svc.getOffersAdmin({ where: { sortBy: OfferSortBy.BUYER_COMPANY_NAME_DESC } as any });
            expect(sqls.some(s => s.includes('DESC'))).to.be.true();
        });

        it('applies buyerName filter', async () => {
            const sqls: string[] = [];
            const offersRepo = makeAdminOffersRepo(sqls);
            const svc = buildOfferService({ offersRepo });

            await svc.getOffersAdmin({ where: { buyerName: 'Alice' } as any });
            expect(sqls.some(s => s.includes('Alice'))).to.be.true();
        });

        it('applies sellerName filter', async () => {
            const sqls: string[] = [];
            const offersRepo = makeAdminOffersRepo(sqls);
            const svc = buildOfferService({ offersRepo });

            await svc.getOffersAdmin({ where: { sellerName: 'Robert' } as any });
            expect(sqls.some(s => s.includes('Robert'))).to.be.true();
        });

        it('applies status filter', async () => {
            const sqls: string[] = [];
            const offersRepo = makeAdminOffersRepo(sqls);
            const svc = buildOfferService({ offersRepo });

            await svc.getOffersAdmin({ where: { status: OfferStatusEnum.APPROVED } as any });
            expect(sqls.some(s => s.includes('approved'))).to.be.true();
        });

        it('applies location array filter', async () => {
            const sqls: string[] = [];
            const offersRepo = makeAdminOffersRepo(sqls);
            const svc = buildOfferService({ offersRepo });

            await svc.getOffersAdmin({ where: { location: ['United Kingdom', 'France'] } as any });
            expect(sqls.some(s => s.includes('United Kingdom'))).to.be.true();
        });

        it('applies materialType filter', async () => {
            const sqls: string[] = [];
            const offersRepo = makeAdminOffersRepo(sqls);
            const svc = buildOfferService({ offersRepo });

            await svc.getOffersAdmin({ where: { materialType: 'HDPE' } as any });
            expect(sqls.some(s => s.includes('HDPE'))).to.be.true();
        });
    });
});
