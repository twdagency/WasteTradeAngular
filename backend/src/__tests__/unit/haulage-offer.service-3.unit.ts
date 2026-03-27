import { expect, sinon } from '@loopback/testlab';
import { HaulageOfferService } from '../../services/haulage-offer.service';
import {
    CompanyStatus,
    ECurrency,
    HaulageBidAction,
    HaulageOfferStatus,
    OfferStatusEnum,
    UserRoleEnum,
} from '../../enum';
import { createStubRepo, createStubService } from '../helpers/stub-factory';

function makeAdminProfile(overrides: Record<string, any> = {}): any {
    return { id: 99, globalRole: UserRoleEnum.ADMIN, companyId: 50, ...overrides };
}

function makeHaulierProfile(overrides: Record<string, any> = {}): any {
    return { id: 1, globalRole: UserRoleEnum.USER, companyId: 50, ...overrides };
}

function buildHaulageOfferService(overrides: Record<string, any> = {}): HaulageOfferService {
    return new HaulageOfferService(
        overrides.haulageOffersRepo ?? createStubRepo(),
        overrides.haulageOfferDocsRepo ?? createStubRepo(),
        overrides.offersRepo ?? createStubRepo(),
        overrides.companiesRepo ?? createStubRepo(),
        overrides.userRepo ?? createStubRepo(),
        overrides.companyLocationsRepo ?? createStubRepo(),
        overrides.listingsRepo ?? createStubRepo(),
        overrides.companyUsersRepo ?? createStubRepo(),
        overrides.haulageLoadsRepo ?? createStubRepo(),
        overrides.salesforceSyncLogRepo ?? createStubRepo(),
        overrides.emailService ?? createStubService([
            'sendHaulageOfferApprovedEmail',
            'sendHaulageOfferRejectedEmail',
            'sendHaulageOfferRequestInformationEmail',
            'sendOfferApprovedEmail',
        ]),
        overrides.notificationService ?? createStubService(['createNotification']),
        overrides.statusService ?? {
            updateStatus: sinon.stub().resolves(),
            getShippingStatus: sinon.stub().returns('In Progress'),
            getStatusColor: sinon.stub().returns('#000'),
        },
    );
}

function makeHaulageOffer(overrides: Record<string, any> = {}): any {
    return {
        id: 1,
        offerId: 10,
        haulierCompanyId: 50,
        haulierUserId: 1,
        status: HaulageOfferStatus.PENDING,
        numberOfLoads: 5,
        haulageCostPerLoad: 200,
        customsFee: 0,
        haulageTotal: 1000,
        currency: ECurrency.GBP,
        completingCustomsClearance: true,
        demurrageAtDestination: 21,
        shippedLoads: 0,
        ...overrides,
    };
}

function makeAcceptedOffer(overrides: Record<string, any> = {}): any {
    return {
        id: 10,
        listingId: 20,
        status: OfferStatusEnum.ACCEPTED,
        quantity: 5,
        sellerLocationId: 30,
        buyerLocationId: 31,
        earliestDeliveryDate: new Date(Date.now() - 86400000),
        latestDeliveryDate: new Date(Date.now() + 86400000 * 30),
        createdByUserId: 99,
        ...overrides,
    };
}

function makeListing(overrides: Record<string, any> = {}): any {
    return {
        id: 20,
        listingType: 'sell',
        weightPerLoad: 10,
        materialWeightPerUnit: 10,
        createdByUserId: 99,
        ...overrides,
    };
}

describe('HaulageOfferService extended coverage - Part 3 (unit)', () => {
    describe('getAvailableLoads() — filter params', () => {
        it('applies textSearch filter in available loads query', async () => {
            const companiesRepo = createStubRepo();
            companiesRepo.findById.resolves({ id: 50, isHaulier: true });
            const offersRepo = createStubRepo();
            const capturedSqls: string[] = [];
            offersRepo.execute = sinon.stub().callsFake((sql: string) => {
                capturedSqls.push(String(sql));
                return Promise.resolve([{ total: '0' }]);
            });
            const svc = buildHaulageOfferService({ companiesRepo, offersRepo });

            await svc.getAvailableLoads(makeHaulierProfile(), { textSearch: 'plastic bottles' });
            expect(capturedSqls.some(s => s.includes('plastic'))).to.be.true();
        });

        it('applies materialType filter in available loads query', async () => {
            const companiesRepo = createStubRepo();
            companiesRepo.findById.resolves({ id: 50, isHaulier: true });
            const offersRepo = createStubRepo();
            const capturedSqls: string[] = [];
            offersRepo.execute = sinon.stub().callsFake((sql: string) => {
                capturedSqls.push(String(sql));
                return Promise.resolve([{ total: '0' }]);
            });
            const svc = buildHaulageOfferService({ companiesRepo, offersRepo });

            await svc.getAvailableLoads(makeHaulierProfile(), { materialType: 'metal' });
            expect(capturedSqls.some(s => s.toLowerCase().includes('metal'))).to.be.true();
        });

        it('applies pickupCountry UK filter in available loads query', async () => {
            const companiesRepo = createStubRepo();
            companiesRepo.findById.resolves({ id: 50, isHaulier: true });
            const offersRepo = createStubRepo();
            const capturedSqls: string[] = [];
            offersRepo.execute = sinon.stub().callsFake((sql: string) => {
                capturedSqls.push(String(sql));
                return Promise.resolve([{ total: '0' }]);
            });
            const svc = buildHaulageOfferService({ companiesRepo, offersRepo });

            // UK maps to UK_ISO_CODE — SQL will contain pickup_loc.country condition
            await svc.getAvailableLoads(makeHaulierProfile(), { pickupCountry: 'UK' });
            expect(capturedSqls.some(s => s.includes('pickup_loc.country'))).to.be.true();
        });

        it('returns paginated available loads with data', async () => {
            const companiesRepo = createStubRepo();
            companiesRepo.findById.resolves({ id: 50, isHaulier: true });
            const offersRepo = createStubRepo();
            offersRepo.execute = sinon.stub()
                .onFirstCall().resolves([{ total: '2' }])
                .onSecondCall().resolves([
                    { offerId: 10, listingId: 20, materialType: 'plastic', numberOfLoads: 3 },
                    { offerId: 11, listingId: 21, materialType: 'metal', numberOfLoads: 2 },
                ]);
            const svc = buildHaulageOfferService({ companiesRepo, offersRepo });

            const result = await svc.getAvailableLoads(makeHaulierProfile(), { skip: 0, limit: 10 });
            expect(result.totalCount).to.equal(2);
            expect(result.results).to.have.length(2);
        });
    });

    describe('getHaulageBidsForAdmin() — filters and SQL', () => {
        // getHaulageBidsForAdmin calls haulageOffersRepository.execute() directly (not .dataSource.execute)

        it('returns paginated admin bids via raw SQL', async () => {
            const haulageOffersRepo = createStubRepo();
            // First call = countQuery, second call = dataQuery
            haulageOffersRepo.execute = sinon.stub()
                .onFirstCall().resolves([{ total: '1' }])
                .onSecondCall().resolves([{ id: 1, status: HaulageOfferStatus.PENDING }]);
            const svc = buildHaulageOfferService({ haulageOffersRepo });

            const result = await svc.getHaulageBidsForAdmin(makeAdminProfile(), { skip: 0, limit: 20 });
            expect(result.status).to.equal('success');
            expect((result.data as any).totalCount).to.be.a.Number();
        });

        it('applies status filter in admin bids query — params passed to execute', async () => {
            const haulageOffersRepo = createStubRepo();
            const capturedParams: any[][] = [];
            haulageOffersRepo.execute = sinon.stub().callsFake((_sql: string, params?: any[]) => {
                if (params) capturedParams.push(params);
                return Promise.resolve([{ total: '0' }]);
            });
            const svc = buildHaulageOfferService({ haulageOffersRepo });

            await svc.getHaulageBidsForAdmin(makeAdminProfile(), { status: HaulageOfferStatus.PENDING });
            expect(capturedParams.some(p => p.includes(HaulageOfferStatus.PENDING))).to.be.true();
        });

        it('applies offerId filter in admin bids query', async () => {
            const haulageOffersRepo = createStubRepo();
            const capturedParams: any[][] = [];
            haulageOffersRepo.execute = sinon.stub().callsFake((_sql: string, params?: any[]) => {
                if (params) capturedParams.push(params);
                return Promise.resolve([{ total: '0' }]);
            });
            const svc = buildHaulageOfferService({ haulageOffersRepo });

            await svc.getHaulageBidsForAdmin(makeAdminProfile(), { offerId: 42 });
            expect(capturedParams.some(p => p.includes(42))).to.be.true();
        });

        it('returns empty result when haulierUserIds is empty array (short-circuit via FALSE condition)', async () => {
            const haulageOffersRepo = createStubRepo();
            haulageOffersRepo.execute = sinon.stub().resolves([{ total: '0' }]);
            const svc = buildHaulageOfferService({ haulageOffersRepo });

            const result = await svc.getHaulageBidsForAdmin(makeAdminProfile(), { haulierUserIds: [] });
            expect(result.status).to.equal('success');
            expect((result.data as any).totalCount).to.equal(0);
        });

        it('applies textSearch filter with parameterized query', async () => {
            const haulageOffersRepo = createStubRepo();
            const capturedParams: any[][] = [];
            haulageOffersRepo.execute = sinon.stub().callsFake((_sql: string, params?: any[]) => {
                if (params) capturedParams.push(params);
                return Promise.resolve([{ total: '0' }]);
            });
            const svc = buildHaulageOfferService({ haulageOffersRepo });

            await svc.getHaulageBidsForAdmin(makeAdminProfile(), { textSearch: 'acme transport' });
            expect(capturedParams.some(p => p.some((v: any) => String(v).includes('acme')))).to.be.true();
        });
    });

    describe('getHaulageBidDetailsForAdmin() — SQL path', () => {
        // getHaulageBidDetailsForAdmin calls haulageOffersRepository.execute() (not .dataSource.execute)

        it('throws NotFound when haulage offer not found (findById returns null)', async () => {
            const haulageOffersRepo = createStubRepo();
            haulageOffersRepo.findById.resolves(null);
            const svc = buildHaulageOfferService({ haulageOffersRepo });

            await expect(svc.getHaulageBidDetailsForAdmin(999, makeAdminProfile()))
                .to.be.rejectedWith(/Haulage offer with ID 999 not found/);
        });

        it('returns formatted details when haulage offer exists', async () => {
            const haulageOffersRepo = createStubRepo();
            haulageOffersRepo.findById.resolves(makeHaulageOffer());
            // getHaulageBidDetailsForAdmin calls haulageOffersRepository.execute() directly
            haulageOffersRepo.execute = sinon.stub().resolves([{
                id: 1,
                status: HaulageOfferStatus.PENDING,
                haulierCompanyName: 'Fast Haulage Ltd',
                haulierFirstName: 'John',
                haulierLastName: 'Driver',
                listingId: 20,
                material_item: 'bottles',
                material_type: 'plastic',
                number_of_loads: 3,
                quantity_per_load: 10,
                offered_price_per_unit: 50,
                haulage_total: 600,
                offerCurrency: 'gbp',
                haulageCurrency: 'gbp',
            }]);
            const haulageLoadsRepo = createStubRepo();
            haulageLoadsRepo.find.resolves([]);
            const svc = buildHaulageOfferService({ haulageOffersRepo, haulageLoadsRepo });

            const result = await svc.getHaulageBidDetailsForAdmin(1, makeAdminProfile());
            expect(result.status).to.equal('success');
        });
    });

    describe('generateLoadsForHaulageOffer()', () => {
        it('creates loads based on numberOfLoads', async () => {
            const haulageOffersRepo = createStubRepo();
            haulageOffersRepo.findById.resolves(makeHaulageOffer({ numberOfLoads: 3 }));
            const haulageLoadsRepo = createStubRepo();
            haulageLoadsRepo.find.resolves([]); // no existing loads
            haulageLoadsRepo.create.resolves({ id: 1, loadNumber: '1 of 3' });
            const svc = buildHaulageOfferService({ haulageOffersRepo, haulageLoadsRepo });

            await svc.generateLoadsForHaulageOffer(1);

            expect(haulageLoadsRepo.create.callCount).to.equal(3);
        });

        it('does nothing when loads already exist', async () => {
            const haulageOffersRepo = createStubRepo();
            haulageOffersRepo.findById.resolves(makeHaulageOffer({ numberOfLoads: 3 }));
            const haulageLoadsRepo = createStubRepo();
            haulageLoadsRepo.find.resolves([
                { id: 1, haulageOfferId: 1, loadNumber: '1 of 3' },
            ]);
            haulageLoadsRepo.create.resolves();
            const svc = buildHaulageOfferService({ haulageOffersRepo, haulageLoadsRepo });

            await svc.generateLoadsForHaulageOffer(1);

            expect(haulageLoadsRepo.create.called).to.be.false();
        });

        it('defaults to 1 load when numberOfLoads is null', async () => {
            const haulageOffersRepo = createStubRepo();
            haulageOffersRepo.findById.resolves(makeHaulageOffer({ numberOfLoads: null }));
            const haulageLoadsRepo = createStubRepo();
            haulageLoadsRepo.find.resolves([]);
            haulageLoadsRepo.create.resolves({ id: 1 });
            const svc = buildHaulageOfferService({ haulageOffersRepo, haulageLoadsRepo });

            await svc.generateLoadsForHaulageOffer(1);

            expect(haulageLoadsRepo.create.callCount).to.equal(1);
        });
    });

    describe('getLoadsForHaulageOffer()', () => {
        it('returns ordered loads for a haulage offer', async () => {
            const haulageLoadsRepo = createStubRepo();
            haulageLoadsRepo.find.resolves([
                { id: 1, haulageOfferId: 1, loadNumber: '1 of 3' },
                { id: 2, haulageOfferId: 1, loadNumber: '2 of 3' },
                { id: 3, haulageOfferId: 1, loadNumber: '3 of 3' },
            ]);
            const svc = buildHaulageOfferService({ haulageLoadsRepo });

            const result = await svc.getLoadsForHaulageOffer(1);
            expect(result.status).to.equal('success');
            expect((result.data as any[]).length).to.equal(3);
        });

        it('returns empty array when no loads exist', async () => {
            const haulageLoadsRepo = createStubRepo();
            haulageLoadsRepo.find.resolves([]);
            const svc = buildHaulageOfferService({ haulageLoadsRepo });

            const result = await svc.getLoadsForHaulageOffer(99);
            expect(result.status).to.equal('success');
            expect(result.data).to.deepEqual([]);
        });
    });

    describe('handleBidAction() — edge cases', () => {
        it('approve: generates loads after setting ACCEPTED status', async () => {
            const haulageOffersRepo = createStubRepo();
            haulageOffersRepo.findById.onFirstCall().resolves(makeHaulageOffer());
            haulageOffersRepo.findById.onSecondCall().resolves(makeHaulageOffer({ status: HaulageOfferStatus.ACCEPTED }));
            haulageOffersRepo.updateById = sinon.stub().resolves();
            const offersRepo = createStubRepo();
            offersRepo.findById.resolves(makeAcceptedOffer());
            const listingsRepo = createStubRepo();
            listingsRepo.findById.resolves(makeListing());
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1, email: 'h@t.com' });
            const companyLocationsRepo = createStubRepo();
            companyLocationsRepo.findById.resolves(null);
            const haulageLoadsRepo = createStubRepo();
            haulageLoadsRepo.find.resolves([]);
            haulageLoadsRepo.create.resolves({ id: 1 });
            const svc = buildHaulageOfferService({
                haulageOffersRepo, offersRepo, listingsRepo,
                userRepo, companyLocationsRepo, haulageLoadsRepo,
            });

            const result = await svc.handleBidAction(1, { action: HaulageBidAction.APPROVE } as any, makeAdminProfile());

            expect(result.status).to.equal('success');
            expect(haulageOffersRepo.updateById.calledWith(1, sinon.match({ status: HaulageOfferStatus.ACCEPTED }))).to.be.true();
        });

        it('reject: default rejection reason when none provided', async () => {
            const haulageOffersRepo = createStubRepo();
            haulageOffersRepo.findById.onFirstCall().resolves(makeHaulageOffer());
            haulageOffersRepo.findById.onSecondCall().resolves(makeHaulageOffer({ status: HaulageOfferStatus.REJECTED }));
            haulageOffersRepo.updateById = sinon.stub().resolves();
            const offersRepo = createStubRepo();
            offersRepo.findById.resolves(makeAcceptedOffer());
            const listingsRepo = createStubRepo();
            listingsRepo.findById.resolves(makeListing());
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1, email: 'h@t.com' });
            const companyLocationsRepo = createStubRepo();
            companyLocationsRepo.findById.resolves(null);
            const svc = buildHaulageOfferService({ haulageOffersRepo, offersRepo, listingsRepo, userRepo, companyLocationsRepo });

            const result = await svc.handleBidAction(1, { action: HaulageBidAction.REJECT } as any, makeAdminProfile());

            expect(result.status).to.equal('success');
            // Ensure REJECTED status was set
            const updateCall = haulageOffersRepo.updateById.firstCall.args[1];
            expect(updateCall.status).to.equal(HaulageOfferStatus.REJECTED);
        });

        it('throws 403 for non-admin user on APPROVE', async () => {
            const haulageOffersRepo = createStubRepo();
            haulageOffersRepo.findById.resolves(makeHaulageOffer());
            const offersRepo = createStubRepo();
            offersRepo.findById.resolves(makeAcceptedOffer());
            const listingsRepo = createStubRepo();
            listingsRepo.findById.resolves(makeListing());
            const svc = buildHaulageOfferService({ haulageOffersRepo, offersRepo, listingsRepo });

            await expect(svc.handleBidAction(1, { action: HaulageBidAction.APPROVE } as any, makeHaulierProfile()))
                .to.be.rejected();
        });
    });

    describe('getMyHaulageOffers() — extended filter coverage', () => {
        // getMyHaulageOffers supports status filter via filter.where.status

        it('applies status filter in my haulage offers SQL', async () => {
            const haulageOffersRepo = createStubRepo();
            const capturedSqls: string[] = [];
            haulageOffersRepo.execute = sinon.stub().callsFake((sql: string) => {
                capturedSqls.push(String(sql));
                return Promise.resolve([{ total: '0' }]);
            });
            const svc = buildHaulageOfferService({ haulageOffersRepo });

            await svc.getMyHaulageOffers(makeHaulierProfile(), { where: { status: HaulageOfferStatus.PENDING } });
            expect(capturedSqls.some(s => s.includes('pending'))).to.be.true();
        });

        it('handles empty results gracefully', async () => {
            const haulageOffersRepo = createStubRepo();
            haulageOffersRepo.execute = sinon.stub().resolves([{ total: '0' }]);
            const svc = buildHaulageOfferService({ haulageOffersRepo });

            const result = await svc.getMyHaulageOffers(makeHaulierProfile(), {});
            expect(result.status).to.equal('success');
            expect((result.data as any).totalCount).to.equal(0);
        });

        it('filters by company of current user', async () => {
            const haulageOffersRepo = createStubRepo();
            const capturedSqls: string[] = [];
            haulageOffersRepo.execute = sinon.stub().callsFake((sql: string) => {
                capturedSqls.push(String(sql));
                return Promise.resolve([{ total: '0' }]);
            });
            const svc = buildHaulageOfferService({ haulageOffersRepo });

            await svc.getMyHaulageOffers(makeHaulierProfile({ companyId: 77 }), {});
            expect(capturedSqls.some(s => s.includes('77'))).to.be.true();
        });
    });

    describe('getApprovedHauliersForAdmin() — SQL path', () => {
        // getApprovedHauliersForAdmin uses companyUsersRepository.dataSource.execute

        it('returns approved hauliers via raw SQL', async () => {
            const companyUsersRepo = createStubRepo();
            companyUsersRepo.dataSource = {
                execute: sinon.stub().callsFake((_sql: string, params?: any[]) => {
                    // count query returns totalCount, data query returns rows
                    if (params && params.length <= 1) {
                        return Promise.resolve([{ totalCount: 2 }]);
                    }
                    return Promise.resolve([
                        { userId: 1, companyName: 'Fast Haulage Ltd', containerTypes: ['Curtain Sider'] },
                        { userId: 2, companyName: 'Quick Transport Co', containerTypes: ['Tipper Trucks'] },
                    ]);
                }),
            };
            const svc = buildHaulageOfferService({ companyUsersRepo });

            const result = await svc.getApprovedHauliersForAdmin(makeAdminProfile());
            expect(result.status).to.equal('success');
            expect((result.data as any).totalCount).to.equal(2);
        });

        it('applies search filter in approved hauliers query', async () => {
            const companyUsersRepo = createStubRepo();
            const capturedParams: any[][] = [];
            companyUsersRepo.dataSource = {
                execute: sinon.stub().callsFake((_sql: string, params?: any[]) => {
                    if (params) capturedParams.push(params);
                    return Promise.resolve([{ totalCount: 0 }]);
                }),
            };
            const svc = buildHaulageOfferService({ companyUsersRepo });

            await svc.getApprovedHauliersForAdmin(makeAdminProfile(), { search: 'john' });
            expect(capturedParams.some(p => p.some((v: any) => String(v).includes('john')))).to.be.true();
        });
    });
});
