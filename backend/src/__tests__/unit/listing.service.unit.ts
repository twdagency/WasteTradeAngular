import { expect, sinon } from '@loopback/testlab';
import { ListingService } from '../../services/listing.service';
import { ListingState, ListingStatus, ListingType, MaterialType, ListingImageType } from '../../enum';
import { OfferState, OfferStatusEnum } from '../../enum/offer.enum';
import { UserRoleEnum } from '../../enum';
import { createStubRepo, createStubService } from '../helpers/stub-factory';

function makeUserProfile(overrides: Record<string, any> = {}): any {
    return { id: 1, globalRole: UserRoleEnum.USER, companyId: 10, ...overrides };
}

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
        overrides.emailService ?? createStubService(['sendListingCreatedEmail']),
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

describe('ListingService (unit)', () => {
    describe('createListing()', () => {
        it('throws 422 when document is missing documentType', async () => {
            const svc = buildListingService();

            await expect(svc.createListing({
                documents: [{ documentUrl: 'http://example.com/file.pdf' }],
                companyId: 10,
                listingType: ListingType.SELL,
            } as any, '1')).to.be.rejectedWith('missing-document-type');
        });

        it('throws 422 when document is missing documentUrl', async () => {
            const svc = buildListingService();

            await expect(svc.createListing({
                documents: [{ documentType: ListingImageType.FEATURE_IMAGE }],
                companyId: 10,
                listingType: ListingType.SELL,
            } as any, '1')).to.be.rejectedWith('missing-document-url');
        });

        it('throws 422 when companyId is missing', async () => {
            const svc = buildListingService();

            await expect(svc.createListing({
                documents: [],
                listingType: ListingType.SELL,
                materialType: MaterialType.EFW,
            } as any, '1')).to.be.rejectedWith('Company ID is required and must be a valid number');
        });

        it('creates listing and returns success', async () => {
            const listingRepo = createStubRepo();
            const createdListing = { id: 5, companyId: 10, createdByUserId: 1, status: ListingStatus.PENDING };
            listingRepo.create.resolves(createdListing);
            const listingDocsRepo = createStubRepo(['find', 'findById', 'findOne', 'create', 'updateById', 'updateAll', 'count', 'deleteById', 'deleteAll']);
            listingDocsRepo.create.resolves({ id: 1 });
            const companyUsersRepo = createStubRepo();
            companyUsersRepo.find.resolves([]);
            const svc = buildListingService({ listingRepo, listingDocsRepo, companyUsersRepo });

            const result = await svc.createListing({
                documents: [{ documentType: ListingImageType.FEATURE_IMAGE, documentUrl: 'http://s3.aws/img.jpg' }],
                companyId: 10,
                listingType: ListingType.SELL,
                materialType: MaterialType.EFW,
            } as any, '1');

            expect(result.status).to.equal('success');
            expect(listingRepo.create.calledOnce).to.be.true();
            const savedListing = listingRepo.create.firstCall.args[0];
            expect(savedListing.status).to.equal(ListingStatus.PENDING);
            expect(savedListing.state).to.equal(ListingState.PENDING);
        });

        it('defaults endDate to 90 days when no renewal period set', async () => {
            const listingRepo = createStubRepo();
            listingRepo.create.resolves({ id: 5, companyId: 10 });
            const listingDocsRepo = createStubRepo(['find', 'findById', 'findOne', 'create', 'updateById', 'updateAll', 'count', 'deleteById', 'deleteAll']);
            listingDocsRepo.create.resolves({ id: 1 });
            const companyUsersRepo = createStubRepo();
            companyUsersRepo.find.resolves([]);
            const svc = buildListingService({ listingRepo, listingDocsRepo, companyUsersRepo });

            await svc.createListing({
                documents: [],
                companyId: 10,
                listingType: ListingType.SELL,
                materialType: MaterialType.EFW,
                // no listingRenewalPeriod, no endDate
            } as any, '1');

            const savedData = listingRepo.create.firstCall.args[0];
            expect(savedData.endDate).to.be.instanceOf(Date);
            // Should be ~90 days ahead
            const diffDays = Math.round((savedData.endDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
            expect(diffDays).to.be.within(88, 92);
        });

        it('omits endDate when listingRenewalPeriod is set (ongoing)', async () => {
            const listingRepo = createStubRepo();
            listingRepo.create.resolves({ id: 5, companyId: 10 });
            const listingDocsRepo = createStubRepo(['find', 'findById', 'findOne', 'create', 'updateById', 'updateAll', 'count', 'deleteById', 'deleteAll']);
            listingDocsRepo.create.resolves({ id: 1 });
            const companyUsersRepo = createStubRepo();
            companyUsersRepo.find.resolves([]);
            const svc = buildListingService({ listingRepo, listingDocsRepo, companyUsersRepo });

            await svc.createListing({
                documents: [],
                companyId: 10,
                listingType: ListingType.SELL,
                materialType: MaterialType.EFW,
                listingRenewalPeriod: 'monthly',
            } as any, '1');

            const savedData = listingRepo.create.firstCall.args[0];
            expect(savedData.endDate).to.be.undefined();
        });
    });

    describe('getListingById()', () => {
        it('throws 404 when listing not found', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById.rejects({ statusCode: 404 });
            const svc = buildListingService({ listingRepo });

            await expect(svc.getListingById(999)).to.be.rejected();
        });

        it('throws 403 when pending listing accessed by non-owner', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById.resolves(makeBaseListing({ status: ListingStatus.PENDING, state: ListingState.PENDING, createdByUserId: 99 }));
            const svc = buildListingService({ listingRepo });

            await expect(svc.getListingById(1, 1 /* different userId */, false))
                .to.be.rejectedWith('You do not have permission to view this listing');
        });

        it('allows owner to view their own pending listing', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById.resolves(makeBaseListing({ status: ListingStatus.PENDING, state: ListingState.PENDING, createdByUserId: 1 }));
            const listingDocsRepo = createStubRepo(['find', 'findById', 'findOne', 'create', 'updateById', 'updateAll', 'count', 'deleteById', 'deleteAll']);
            listingDocsRepo.find.resolves([]);
            const offersRepo = createStubRepo();
            offersRepo.count.resolves({ count: 0 });
            const companyRepo = createStubRepo();
            companyRepo.findById.resolves({ id: 10, name: 'Test Co', verifiedAt: new Date() });
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1, firstName: 'A', lastName: 'B' });
            const svc = buildListingService({ listingRepo, listingDocsRepo, offersRepo, companyRepo, userRepo });

            const result = await svc.getListingById(1, 1, false);
            expect(result.status).to.equal('success');
        });

        it('admin can view any listing regardless of state', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById.resolves(makeBaseListing({ status: ListingStatus.PENDING, state: ListingState.PENDING, createdByUserId: 99 }));
            const listingDocsRepo = createStubRepo(['find', 'findById', 'findOne', 'create', 'updateById', 'updateAll', 'count', 'deleteById', 'deleteAll']);
            listingDocsRepo.find.resolves([]);
            const offersRepo = createStubRepo();
            offersRepo.count.resolves({ count: 0 });
            const companyRepo = createStubRepo();
            companyRepo.findById.resolves({ id: 10, name: 'Test Co' });
            const userRepo = createStubRepo();
            userRepo.findById.resolves(null);
            const svc = buildListingService({ listingRepo, listingDocsRepo, offersRepo, companyRepo, userRepo });

            const result = await svc.getListingById(1, 1, true /* isAdmin */);
            expect(result.status).to.equal('success');
        });
    });

    describe('deleteListing()', () => {
        it('throws 403 when user is not the owner', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById.resolves(makeBaseListing({ createdByUserId: 99 }));
            const svc = buildListingService({ listingRepo });

            await expect(svc.deleteListing(1, '1')).to.be.rejectedWith('forbidden');
        });

        it('throws 400 when listing has accepted offers', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById.resolves(makeBaseListing({ createdByUserId: 1 }));
            const offersRepo = createStubRepo();
            offersRepo.find.resolves([{ id: 10, status: OfferStatusEnum.ACCEPTED }]);
            offersRepo.count.resolves({ count: 0 });
            const svc = buildListingService({ listingRepo, offersRepo });

            await expect(svc.deleteListing(1, '1')).to.be.rejectedWith('cannot-delete-listing-with-approved-offers');
        });

        it('deletes listing when owner and no blocking offers', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById.resolves(makeBaseListing({ createdByUserId: 1 }));
            listingRepo.dataSource = { execute: sinon.stub().resolves() };
            listingRepo.deleteById.resolves();
            const offersRepo = createStubRepo();
            offersRepo.find.resolves([]);
            offersRepo.count.resolves({ count: 0 });
            const listingDocsRepo = createStubRepo(['find', 'findById', 'findOne', 'create', 'updateById', 'updateAll', 'count', 'deleteById', 'deleteAll']);
            listingDocsRepo.deleteAll.resolves();
            const svc = buildListingService({ listingRepo, offersRepo, listingDocsRepo });

            await svc.deleteListing(1, '1');

            expect(listingRepo.deleteById.calledWith(1)).to.be.true();
        });
    });

    describe('updateListing()', () => {
        it('throws 403 when non-owner non-admin tries to update', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById.resolves(makeBaseListing({ createdByUserId: 99, status: ListingStatus.AVAILABLE }));
            const svc = buildListingService({ listingRepo });

            await expect(svc.updateListing(1, 1, {}, makeUserProfile({ globalRole: UserRoleEnum.USER })))
                .to.be.rejectedWith('forbidden');
        });

        it('throws 400 when listing is pending', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById.resolves(makeBaseListing({ createdByUserId: 1, status: ListingStatus.PENDING, state: ListingState.PENDING }));
            const svc = buildListingService({ listingRepo });

            await expect(svc.updateListing(1, 1, {}, makeUserProfile()))
                .to.be.rejectedWith('listing-not-available');
        });

        it('throws 400 when listing has existing offers', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById.resolves(makeBaseListing({ createdByUserId: 1 }));
            const offersRepo = createStubRepo();
            offersRepo.count.resolves({ count: 2 });
            const svc = buildListingService({ listingRepo, offersRepo });

            await expect(svc.updateListing(1, 1, {}, makeUserProfile()))
                .to.be.rejectedWith('cannot-edit-listing-with-offers');
        });

        it('sets status and state back to PENDING after update', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById.onFirstCall().resolves(makeBaseListing({ createdByUserId: 1 }));
            listingRepo.findById.onSecondCall().resolves(makeBaseListing({ createdByUserId: 1, status: ListingStatus.PENDING, state: ListingState.PENDING }));
            listingRepo.updateById.resolves();
            const offersRepo = createStubRepo();
            offersRepo.count.resolves({ count: 0 });
            const listingDocsRepo = createStubRepo(['find', 'findById', 'findOne', 'create', 'updateById', 'updateAll', 'count', 'deleteById', 'deleteAll']);
            listingDocsRepo.deleteAll.resolves();
            const svc = buildListingService({ listingRepo, offersRepo, listingDocsRepo });

            const result = await svc.updateListing(1, 1, { title: 'New title' } as any, makeUserProfile());

            expect(result.status).to.equal('success');
            const updateArg = listingRepo.updateById.firstCall.args[1];
            expect(updateArg.status).to.equal(ListingStatus.PENDING);
            expect(updateArg.state).to.equal(ListingState.PENDING);
        });
    });

    describe('renewListing()', () => {
        it('throws 403 when non-owner tries to renew', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById.resolves(makeBaseListing({ createdByUserId: 99 }));
            const svc = buildListingService({ listingRepo });

            await expect(svc.renewListing(1, 1, '90_days')).to.be.rejectedWith('forbidden');
        });

        it('throws 400 when listing is sold', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById.resolves(makeBaseListing({ createdByUserId: 1, status: ListingStatus.SOLD }));
            const svc = buildListingService({ listingRepo });

            await expect(svc.renewListing(1, 1, '90_days')).to.be.rejectedWith('listing-already-sold');
        });

        it('throws 400 when listing is not near expiry', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById.resolves(makeBaseListing({ createdByUserId: 1, status: ListingStatus.AVAILABLE }));
            const listingExpiryService = {
                calculateExpiryInfo: sinon.stub().returns({ isExpired: false, isNearingExpiry: false }),
            };
            const svc = buildListingService({ listingRepo, listingExpiryService });

            await expect(svc.renewListing(1, 1, '90_days')).to.be.rejectedWith('listing-not-eligible-for-renewal');
        });
    });
});
