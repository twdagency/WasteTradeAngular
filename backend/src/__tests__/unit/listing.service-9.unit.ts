/**
 * listing.service-9.unit.ts
 * Coverage targets:
 *  - getListingById: sell listing path, wanted listing path, admin bypass,
 *    visibility guards (pending/rejected), location loading, user not found
 *  - createListing: weight conversion branches (kg, lbs, default unit),
 *    quantity*weightPerUnit calc, totalWeight < 3 & numberOfLoads < 1 guards
 *  - deleteListing: accepted offers guard, pending offers guard, success path
 *  - getAdminListings: wantedStatus filter, state filter branches
 */
import { expect, sinon } from '@loopback/testlab';
import { ListingService } from '../../services/listing.service';
import { ListingState, ListingStatus, ListingType, MaterialType, ListingImageType } from '../../enum';
import { createStubRepo, createStubService } from '../helpers/stub-factory';

function buildSvc(overrides: Record<string, any> = {}): ListingService {
    const exchangeRateService = overrides.exchangeRateService ?? {
        convertListingToBaseCurrency: sinon.stub().resolves({}),
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
        overrides.emailService ?? createStubService(['sendListingCreatedEmail', 'sendListingRejectionEmail', 'sendListingStatusUpdatedEmail', 'sendListingRenewedEmail']),
        listingExpiryService as any,
        exchangeRateService as any,
        overrides.notificationsService ?? createStubService(['createNotification']),
    );
}

function makeListing(overrides: any = {}): any {
    return {
        id: 1,
        companyId: 10,
        createdByUserId: 5,
        listingType: ListingType.SELL,
        status: ListingStatus.AVAILABLE,
        state: ListingState.APPROVED,
        country: 'GB',
        pricePerMetricTonne: null,
        currency: null,
        locationId: null,
        ...overrides,
    };
}

describe('ListingService — Part 9 (unit)', () => {

    // ── getListingById — visibility guards ────────────────────────────────
    describe('getListingById() — visibility', () => {
        it('throws 404 when listing not found', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById.resolves(null);
            const svc = buildSvc({ listingRepo });
            await expect(svc.getListingById(999)).to.be.rejected();
        });

        it('throws 403 when non-owner views pending listing', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById.resolves(makeListing({ state: ListingState.PENDING, status: ListingStatus.PENDING }));
            const svc = buildSvc({ listingRepo });
            // userId 99 is not the owner (owner is 5)
            await expect(svc.getListingById(1, 99)).to.be.rejectedWith(/permission/i);
        });

        it('throws 403 when anonymous views pending listing', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById.resolves(makeListing({ state: ListingState.PENDING, status: ListingStatus.PENDING }));
            const svc = buildSvc({ listingRepo });
            await expect(svc.getListingById(1, undefined)).to.be.rejectedWith(/permission/i);
        });

        it('throws 403 when non-owner views rejected listing', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById.resolves(makeListing({ state: ListingState.REJECTED, status: ListingStatus.REJECTED }));
            const svc = buildSvc({ listingRepo });
            await expect(svc.getListingById(1, 99)).to.be.rejectedWith(/permission/i);
        });

        it('admin bypasses pending visibility check', async () => {
            const listingRepo = createStubRepo();
            const listingDocsRepo = createStubRepo(['find', 'findById', 'create', 'updateById', 'deleteById', 'deleteAll']);
            const offersRepo = createStubRepo();
            const companyRepo = createStubRepo();
            const userRepo = createStubRepo();

            listingRepo.findById.resolves(makeListing({ state: ListingState.PENDING, status: ListingStatus.PENDING }));
            listingDocsRepo.find.resolves([]);
            offersRepo.count.resolves({ count: 0 });
            companyRepo.findById.resolves({ id: 10, name: 'Acme', verifiedAt: null });
            userRepo.findById.resolves({ id: 5, firstName: 'Jane', lastName: 'Doe', username: 'jdoe', email: 'j@t.com' });

            const svc = buildSvc({ listingRepo, listingDocsRepo, offersRepo, companyRepo, userRepo });
            const result = await svc.getListingById(1, 1, true); // isAdmin=true
            expect(result.status).to.equal('success');
        });
    });

    // ── getListingById — sell listing path ────────────────────────────────
    describe('getListingById() — sell listing', () => {
        it('returns sell listing with company verifiedAt and createdBy', async () => {
            const listingRepo = createStubRepo();
            const listingDocsRepo = createStubRepo(['find', 'findById', 'create', 'updateById', 'deleteById', 'deleteAll']);
            const offersRepo = createStubRepo();
            const companyRepo = createStubRepo();
            const userRepo = createStubRepo();

            listingRepo.findById.resolves(makeListing());
            listingDocsRepo.find.resolves([]);
            offersRepo.count.resolves({ count: 0 });
            companyRepo.findById.resolves({ id: 10, name: 'Acme', verifiedAt: '2025-01-01' });
            userRepo.findById.resolves({ id: 5, firstName: 'Jane', lastName: 'Doe', username: 'jdoe', email: 'j@t.com' });

            const svc = buildSvc({ listingRepo, listingDocsRepo, offersRepo, companyRepo, userRepo });
            const result = await svc.getListingById(1, 5);

            expect(result.status).to.equal('success');
            expect((result.data as any).company.verifiedAt).to.equal('2025-01-01');
            expect((result.data as any).createdBy.user.username).to.equal('jdoe');
        });

        it('includes locationDetails when sell listing has locationId', async () => {
            const listingRepo = createStubRepo();
            const listingDocsRepo = createStubRepo(['find', 'findById', 'create', 'updateById', 'deleteById', 'deleteAll']);
            const offersRepo = createStubRepo();
            const companyRepo = createStubRepo();
            const userRepo = createStubRepo();
            const companyLocationsRepo = createStubRepo();

            listingRepo.findById.resolves(makeListing({ locationId: 20 }));
            listingDocsRepo.find.resolves([]);
            offersRepo.count.resolves({ count: 0 });
            companyRepo.findById.resolves({ id: 10, name: 'Acme', verifiedAt: null });
            userRepo.findById.rejects(new Error('User not found'));
            companyLocationsRepo.findById.resolves({ id: 20, addressLine: '1 Road', street: 'High St', postcode: 'AB1 2CD', city: 'London', country: 'GB', stateProvince: null });

            const svc = buildSvc({ listingRepo, listingDocsRepo, offersRepo, companyRepo, userRepo, companyLocationsRepo });
            const result = await svc.getListingById(1, 5);

            expect(result.status).to.equal('success');
            expect((result.data as any).locationDetails).to.not.be.null();
            expect((result.data as any).locationDetails.address.city).to.equal('London');
        });

        it('returns null locationDetails when location not found', async () => {
            const listingRepo = createStubRepo();
            const listingDocsRepo = createStubRepo(['find', 'findById', 'create', 'updateById', 'deleteById', 'deleteAll']);
            const offersRepo = createStubRepo();
            const companyRepo = createStubRepo();
            const userRepo = createStubRepo();
            const companyLocationsRepo = createStubRepo();

            listingRepo.findById.resolves(makeListing({ locationId: 20 }));
            listingDocsRepo.find.resolves([]);
            offersRepo.count.resolves({ count: 0 });
            companyRepo.findById.resolves({ id: 10, name: 'Acme', verifiedAt: null });
            userRepo.findById.resolves({ id: 5, firstName: 'Jane', lastName: 'Doe', username: 'jdoe' });
            companyLocationsRepo.findById.rejects(new Error('Not found'));

            const svc = buildSvc({ listingRepo, listingDocsRepo, offersRepo, companyRepo, userRepo, companyLocationsRepo });
            const result = await svc.getListingById(1, 5);

            expect((result.data as any).locationDetails).to.be.null();
        });

        it('throws 404 when company not found', async () => {
            const listingRepo = createStubRepo();
            const listingDocsRepo = createStubRepo(['find', 'findById', 'create', 'updateById', 'deleteById', 'deleteAll']);
            const offersRepo = createStubRepo();
            const companyRepo = createStubRepo();

            listingRepo.findById.resolves(makeListing());
            listingDocsRepo.find.resolves([]);
            offersRepo.count.resolves({ count: 0 });
            companyRepo.findById.resolves(null);

            const svc = buildSvc({ listingRepo, listingDocsRepo, offersRepo, companyRepo });
            await expect(svc.getListingById(1, 5)).to.be.rejectedWith(/company/i);
        });
    });

    // ── getListingById — wanted listing path ──────────────────────────────
    describe('getListingById() — wanted listing', () => {
        it('returns wanted listing with buyerDetails and materialInformation', async () => {
            const listingRepo = createStubRepo();
            const listingDocsRepo = createStubRepo(['find', 'findById', 'create', 'updateById', 'deleteById', 'deleteAll']);
            const offersRepo = createStubRepo();
            const companyRepo = createStubRepo();
            const userRepo = createStubRepo();

            listingRepo.findById.resolves(makeListing({
                listingType: ListingType.WANTED,
                status: ListingStatus.AVAILABLE,
                state: ListingState.APPROVED,
            }));
            listingDocsRepo.find.resolves([]);
            offersRepo.count.resolves({ count: 0 });
            companyRepo.findById.resolves({
                id: 10, name: 'BuyerCo', email: 'b@t.com', phoneNumber: '123',
                mobileNumber: null, website: null, description: null, vatNumber: null,
                registrationNumber: null, companyType: null, companyInterest: null,
                isBuyer: true, isSeller: false, isHaulier: false,
                favoriteMaterials: [], containerTypes: [], areasCovered: [],
                addressLine1: '1 St', addressLine2: null, city: 'London',
                country: 'GB', stateProvince: null, postalCode: 'AB1',
            });
            userRepo.findById.resolves({ id: 5, firstName: 'Jane', lastName: 'Doe', email: 'j@t.com', username: 'jdoe', phoneNumber: null });

            const svc = buildSvc({ listingRepo, listingDocsRepo, offersRepo, companyRepo, userRepo });
            const result = await svc.getListingById(1, 5);

            expect(result.status).to.equal('success');
            expect((result.data as any).buyerDetails).to.not.be.undefined();
            expect((result.data as any).buyerDetails.companyName).to.equal('BuyerCo');
            expect((result.data as any).materialInformation).to.not.be.undefined();
        });

        it('returns null contactPerson when user not found for wanted listing', async () => {
            const listingRepo = createStubRepo();
            const listingDocsRepo = createStubRepo(['find', 'findById', 'create', 'updateById', 'deleteById', 'deleteAll']);
            const offersRepo = createStubRepo();
            const companyRepo = createStubRepo();
            const userRepo = createStubRepo();

            listingRepo.findById.resolves(makeListing({ listingType: ListingType.WANTED, status: ListingStatus.AVAILABLE, state: ListingState.APPROVED }));
            listingDocsRepo.find.resolves([]);
            offersRepo.count.resolves({ count: 0 });
            companyRepo.findById.resolves({ id: 10, name: 'BuyerCo', email: null, phoneNumber: null, isBuyer: true });
            userRepo.findById.rejects(new Error('deleted'));

            const svc = buildSvc({ listingRepo, listingDocsRepo, offersRepo, companyRepo, userRepo });
            const result = await svc.getListingById(1, 5);

            expect((result.data as any).buyerDetails.contactPerson).to.be.null();
        });
    });

    // ── createListing — weight conversion branches ────────────────────────
    describe('createListing() — weight conversion', () => {
        function makeCreateData(overrides: any = {}): any {
            return {
                documents: [],
                companyId: 10,
                listingType: ListingType.SELL,
                materialType: MaterialType.EFW,
                ...overrides,
            };
        }

        it('converts materialWeight from kg to Mt', async () => {
            const listingRepo = createStubRepo();
            listingRepo.create.resolves({ id: 1, listingType: ListingType.SELL });
            const listingDocsRepo = createStubRepo(['find', 'create', 'deleteAll', 'deleteById']);
            listingDocsRepo.create.resolves({ id: 1 });
            const companyUsersRepo = createStubRepo();
            companyUsersRepo.find.resolves([]);
            const companyRepo = createStubRepo();
            companyRepo.findOne.resolves(null);

            const svc = buildSvc({ listingRepo, listingDocsRepo, companyUsersRepo, companyRepo });
            await svc.createListing(makeCreateData({
                materialWeight: 2000,
                weightUnit: 'kg',
            }), '10');

            const createArg = listingRepo.create.firstCall.args[0];
            expect(createArg.totalWeight).to.be.approximately(2, 0.01);
        });

        it('converts materialWeight from lbs to Mt', async () => {
            const listingRepo = createStubRepo();
            listingRepo.create.resolves({ id: 1, listingType: ListingType.SELL });
            const listingDocsRepo = createStubRepo(['find', 'create', 'deleteAll', 'deleteById']);
            listingDocsRepo.create.resolves({ id: 1 });
            const companyUsersRepo = createStubRepo();
            companyUsersRepo.find.resolves([]);
            const companyRepo = createStubRepo();
            companyRepo.findOne.resolves(null);

            const svc = buildSvc({ listingRepo, listingDocsRepo, companyUsersRepo, companyRepo });
            await svc.createListing(makeCreateData({
                materialWeight: 2204.62263,
                weightUnit: 'lbs',
            }), '10');

            const createArg = listingRepo.create.firstCall.args[0];
            expect(createArg.totalWeight).to.be.approximately(1, 0.01);
        });

        it('defaults materialWeight to Mt when unknown unit', async () => {
            const listingRepo = createStubRepo();
            listingRepo.create.resolves({ id: 1, listingType: ListingType.SELL });
            const listingDocsRepo = createStubRepo(['find', 'create', 'deleteAll', 'deleteById']);
            listingDocsRepo.create.resolves({ id: 1 });
            const companyUsersRepo = createStubRepo();
            companyUsersRepo.find.resolves([]);
            const companyRepo = createStubRepo();
            companyRepo.findOne.resolves(null);

            const svc = buildSvc({ listingRepo, listingDocsRepo, companyUsersRepo, companyRepo });
            await svc.createListing(makeCreateData({
                materialWeight: 50,
                weightUnit: 'tonnes',
            }), '10');

            const createArg = listingRepo.create.firstCall.args[0];
            expect(createArg.totalWeight).to.equal(50);
        });

        it('calculates totalWeight from quantity * materialWeightPerUnit when no materialWeight', async () => {
            const listingRepo = createStubRepo();
            listingRepo.create.resolves({ id: 1, listingType: ListingType.SELL });
            const listingDocsRepo = createStubRepo(['find', 'create', 'deleteAll', 'deleteById']);
            listingDocsRepo.create.resolves({ id: 1 });
            const companyUsersRepo = createStubRepo();
            companyUsersRepo.find.resolves([]);
            const companyRepo = createStubRepo();
            companyRepo.findOne.resolves(null);

            const svc = buildSvc({ listingRepo, listingDocsRepo, companyUsersRepo, companyRepo });
            await svc.createListing(makeCreateData({
                quantity: 5,
                materialWeightPerUnit: 10,
            }), '10');

            const createArg = listingRepo.create.firstCall.args[0];
            expect(createArg.totalWeight).to.equal(50);
        });

        it('throws 422 when totalWeight < 3', async () => {
            const svc = buildSvc();
            await expect(svc.createListing({
                documents: [],
                companyId: 10,
                listingType: ListingType.SELL,
                materialType: MaterialType.EFW,
                totalWeight: 2,
            } as any, '10')).to.be.rejectedWith(/3 metric/i);
        });

        it('throws 422 when numberOfLoads < 1', async () => {
            const svc = buildSvc();
            await expect(svc.createListing({
                documents: [],
                companyId: 10,
                listingType: ListingType.SELL,
                materialType: MaterialType.EFW,
                numberOfLoads: 0,
            } as any, '10')).to.be.rejectedWith(/at least 1/i);
        });
    });

    // ── deleteListing — offer guards ──────────────────────────────────────
    describe('deleteListing() — offer guards', () => {
        it('throws 400 when accepted offers exist', async () => {
            const listingRepo = createStubRepo();
            const offersRepo = createStubRepo();

            listingRepo.findById.resolves(makeListing());
            offersRepo.find.resolves([{ id: 10, status: 'accepted' }]);

            const svc = buildSvc({ listingRepo, offersRepo });
            await expect(svc.deleteListing(1, '5')).to.be.rejectedWith(/approved/i);
        });

        it('throws 400 when pending offers exist', async () => {
            const listingRepo = createStubRepo();
            const offersRepo = createStubRepo();

            listingRepo.findById.resolves(makeListing());
            offersRepo.find.resolves([]);
            offersRepo.count.resolves({ count: 2 });

            const svc = buildSvc({ listingRepo, offersRepo });
            await expect(svc.deleteListing(1, '5')).to.be.rejectedWith(/pending/i);
        });

        it('deletes listing when no offers exist', async () => {
            const listingRepo = createStubRepo();
            const listingDocsRepo = createStubRepo(['find', 'create', 'updateById', 'deleteById', 'deleteAll']);
            const offersRepo = createStubRepo();

            listingRepo.findById.resolves(makeListing());
            offersRepo.find.resolves([]);
            offersRepo.count.resolves({ count: 0 });
            listingDocsRepo.deleteAll.resolves();
            listingRepo.dataSource.execute = sinon.stub().resolves();
            listingRepo.deleteById.resolves();

            const svc = buildSvc({ listingRepo, listingDocsRepo, offersRepo });
            await svc.deleteListing(1, '5');

            expect(listingRepo.deleteById.calledWith(1)).to.be.true();
        });
    });

    // ── getAdminListings — filter branches ────────────────────────────────
    describe('getAdminListings() — filter branches', () => {
        function makeRow(overrides: any = {}): any {
            return {
                id: 1, company_id: 10, listing_type: 'sell', status: 'available',
                state: 'approved', material_type: 'plastic',
                first_name: 'John', last_name: 'Doe', email: 'j@t.com', username: 'jdoe',
                number_of_offers: '0', best_offer: null, best_offer_currency: null,
                has_notes: false, price_per_metric_tonne: null, currency: null,
                ...overrides,
            };
        }

        it('filters by string status', async () => {
            const listingRepo = createStubRepo();
            listingRepo.dataSource.execute = sinon.stub()
                .onFirstCall().resolves([makeRow()])
                .onSecondCall().resolves([{ total: '1' }]);
            const svc = buildSvc({ listingRepo });

            const result = await svc.getAdminListings({
                filter: { where: { status: 'available' } as any },
            });

            expect(result.totalCount).to.equal('1');
            const sql = listingRepo.dataSource.execute.firstCall.args[0] as string;
            expect(sql).to.containEql("l.status = 'available'");
        });

        it('filters by status neq object', async () => {
            const listingRepo = createStubRepo();
            listingRepo.dataSource.execute = sinon.stub()
                .onFirstCall().resolves([makeRow()])
                .onSecondCall().resolves([{ total: '1' }]);
            const svc = buildSvc({ listingRepo });

            await svc.getAdminListings({
                filter: { where: { status: { neq: 'sold' } } as any },
            });

            const sql = listingRepo.dataSource.execute.firstCall.args[0] as string;
            expect(sql).to.containEql("l.status != 'sold'");
        });

        it('filters by state string', async () => {
            const listingRepo = createStubRepo();
            listingRepo.dataSource.execute = sinon.stub()
                .onFirstCall().resolves([makeRow()])
                .onSecondCall().resolves([{ total: '1' }]);
            const svc = buildSvc({ listingRepo });

            await svc.getAdminListings({
                filter: { where: { state: 'approved' } as any },
            });

            const sql = listingRepo.dataSource.execute.firstCall.args[0] as string;
            expect(sql).to.containEql("l.state = 'approved'");
        });

        it('uses wanted type query when listingType is WANTED', async () => {
            const listingRepo = createStubRepo();
            listingRepo.dataSource.execute = sinon.stub()
                .onFirstCall().resolves([makeRow({ listing_type: 'wanted', status: 'available', state: 'active' })])
                .onSecondCall().resolves([{ total: '1' }]);
            const svc = buildSvc({ listingRepo });

            const result = await svc.getAdminListings({ listingType: ListingType.WANTED });

            expect(result.results).to.have.length(1);
            expect((result.results[0] as any).wantedStatus).to.not.be.undefined();
        });

        it('filters by company name', async () => {
            const listingRepo = createStubRepo();
            listingRepo.dataSource.execute = sinon.stub()
                .onFirstCall().resolves([])
                .onSecondCall().resolves([{ total: '0' }]);
            const svc = buildSvc({ listingRepo });

            await svc.getAdminListings({
                filter: { where: { company: 'Acme' } as any },
            });

            const sql = listingRepo.dataSource.execute.firstCall.args[0] as string;
            expect(sql).to.containEql("c.name ILIKE '%Acme%'");
        });
    });
});
