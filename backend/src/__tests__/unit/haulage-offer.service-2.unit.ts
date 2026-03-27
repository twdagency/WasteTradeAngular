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
        overrides.statusService ?? createStubService(['updateStatus']),
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

/** Shared mocks for handleBidAction APPROVE — includes haulageLoadsRepo stubs needed by generateLoads */
function buildApproveActionMocks(haulageOfferOverrides: Record<string, any> = {}) {
    const haulageOffersRepo = createStubRepo();
    haulageOffersRepo.findById.onFirstCall().resolves(makeHaulageOffer(haulageOfferOverrides));
    haulageOffersRepo.findById.onSecondCall().resolves(makeHaulageOffer({ ...haulageOfferOverrides, status: HaulageOfferStatus.ACCEPTED }));
    haulageOffersRepo.updateById = sinon.stub().resolves();

    const offersRepo = createStubRepo();
    offersRepo.findById.resolves(makeAcceptedOffer());

    const listingsRepo = createStubRepo();
    listingsRepo.findById.resolves(makeListing());

    const userRepo = createStubRepo();
    userRepo.findById.resolves({ id: 1, email: 'h@t.com', firstName: 'H', lastName: 'U' });

    const companyLocationsRepo = createStubRepo();
    companyLocationsRepo.findById.resolves(null);

    // generateLoadsForHaulageOffer: findById for offer + find for existing loads + create
    const haulageLoadsRepo = createStubRepo();
    haulageLoadsRepo.find.resolves([]); // no existing loads
    haulageLoadsRepo.create.resolves({ id: 1 });

    return { haulageOffersRepo, offersRepo, listingsRepo, userRepo, companyLocationsRepo, haulageLoadsRepo };
}

describe('HaulageOfferService deeper coverage (unit)', () => {
    describe('getHaulageOfferById() — SQL path', () => {
        it('throws NotFound when query returns no results', async () => {
            const haulageOffersRepo = createStubRepo();
            haulageOffersRepo.execute = sinon.stub().resolves([]);
            const svc = buildHaulageOfferService({ haulageOffersRepo });

            await expect(svc.getHaulageOfferById(999, makeHaulierProfile()))
                .to.be.rejectedWith('Haulage offer not found');
        });

        it('throws Forbidden when caller is not the owner company', async () => {
            const haulageOffersRepo = createStubRepo();
            haulageOffersRepo.execute = sinon.stub().resolves([{ id: 1, haulier_company_id: 999 }]);
            const svc = buildHaulageOfferService({ haulageOffersRepo });

            await expect(svc.getHaulageOfferById(1, makeHaulierProfile({ companyId: 50 })))
                .to.be.rejectedWith('You can only view your own haulage offers');
        });

        it('returns formatted data when owner requests their offer', async () => {
            const haulageOffersRepo = createStubRepo();
            haulageOffersRepo.execute = sinon.stub().resolves([{
                id: 1,
                haulier_company_id: 50,
                offer_id: 10,
                status: HaulageOfferStatus.PENDING,
                trailer_container_type: 'Curtain Sider',
                number_of_loads: 3,
                haulage_cost_per_load: 200,
                currency: ECurrency.GBP,
                customs_fee: 0,
                haulage_total: 600,
                material_type: 'plastic',
                material_item: 'bottles',
                listing_id: 20,
                listing_title: 'Test Listing',
            }]);
            const haulageLoadsRepo = createStubRepo();
            haulageLoadsRepo.find = sinon.stub().resolves([]);
            const svc = buildHaulageOfferService({ haulageOffersRepo, haulageLoadsRepo });

            const result = await svc.getHaulageOfferById(1, makeHaulierProfile({ companyId: 50 }));
            expect(result.status).to.equal('success');
        });
    });

    describe('getMyHaulageOffers() — SQL path', () => {
        it('returns paginated results via raw SQL (two parallel execute calls)', async () => {
            const haulageOffersRepo = createStubRepo();
            // getMyHaulageOffers runs Promise.all([execute(query), execute(countQuery)])
            // both calls happen in parallel — stub resolves all calls consistently
            haulageOffersRepo.execute = sinon.stub()
                .resolves([{ id: 1, haulier_company_id: 50, status: HaulageOfferStatus.PENDING, material_type: 'plastic', material_item: 'bottles', number_of_loads: 2 }]);
            // Override second call to return count
            haulageOffersRepo.execute.onSecondCall().resolves([{ total: '2' }]);
            const svc = buildHaulageOfferService({ haulageOffersRepo });

            const result = await svc.getMyHaulageOffers(makeHaulierProfile(), { skip: 0, limit: 10 });
            expect(result.status).to.equal('success');
            expect((result.data as any).totalCount).to.be.a.Number();
        });

        it('applies status filter when provided in where clause', async () => {
            const haulageOffersRepo = createStubRepo();
            haulageOffersRepo.execute = sinon.stub().resolves([{ total: '0' }]);
            const svc = buildHaulageOfferService({ haulageOffersRepo });

            await svc.getMyHaulageOffers(makeHaulierProfile(), { where: { status: HaulageOfferStatus.PENDING } });
            const firstSql = haulageOffersRepo.execute.firstCall.args[0] as string;
            expect(firstSql).to.containEql('pending');
        });
    });

    describe('markAsShipped()', () => {
        it('throws BadRequest when offer is PENDING (not accepted/approved/partially_shipped)', async () => {
            const haulageOffersRepo = createStubRepo();
            haulageOffersRepo.findById.resolves(makeHaulageOffer({ status: HaulageOfferStatus.PENDING }));
            const svc = buildHaulageOfferService({ haulageOffersRepo });

            await expect(svc.markAsShipped(1, makeHaulierProfile(), 5))
                .to.be.rejectedWith(/Only accepted haulage offers/);
        });

        it('throws NotFound when load not found', async () => {
            const haulageOffersRepo = createStubRepo();
            haulageOffersRepo.findById.resolves(makeHaulageOffer({ status: HaulageOfferStatus.ACCEPTED }));
            const haulageLoadsRepo = createStubRepo();
            haulageLoadsRepo.findById = sinon.stub().resolves(null);
            const svc = buildHaulageOfferService({ haulageOffersRepo, haulageLoadsRepo });

            await expect(svc.markAsShipped(1, makeHaulierProfile(), 999))
                .to.be.rejectedWith('Load not found');
        });

        it('throws BadRequest when load belongs to different haulage offer', async () => {
            const haulageOffersRepo = createStubRepo();
            haulageOffersRepo.findById.resolves(makeHaulageOffer({ id: 1, status: HaulageOfferStatus.ACCEPTED }));
            const haulageLoadsRepo = createStubRepo();
            haulageLoadsRepo.findById = sinon.stub().resolves({ id: 5, haulageOfferId: 99 });
            const svc = buildHaulageOfferService({ haulageOffersRepo, haulageLoadsRepo });

            await expect(svc.markAsShipped(1, makeHaulierProfile(), 5))
                .to.be.rejectedWith('Load does not belong to this haulage offer');
        });

        it('throws BadRequest when load is already shipped', async () => {
            const haulageOffersRepo = createStubRepo();
            haulageOffersRepo.findById.resolves(makeHaulageOffer({ id: 1, status: HaulageOfferStatus.ACCEPTED }));
            const haulageLoadsRepo = createStubRepo();
            haulageLoadsRepo.findById = sinon.stub().resolves({ id: 5, haulageOfferId: 1, shippedDate: new Date() });
            const svc = buildHaulageOfferService({ haulageOffersRepo, haulageLoadsRepo });

            await expect(svc.markAsShipped(1, makeHaulierProfile(), 5))
                .to.be.rejectedWith('This load has already been shipped');
        });

        it('sets SHIPPED when all loads are shipped', async () => {
            const haulageOffersRepo = createStubRepo();
            haulageOffersRepo.findById.onFirstCall().resolves(makeHaulageOffer({ id: 1, status: HaulageOfferStatus.ACCEPTED, numberOfLoads: 1, shippedLoads: 0 }));
            haulageOffersRepo.findById.onSecondCall().resolves(makeHaulageOffer({ id: 1, status: HaulageOfferStatus.SHIPPED, shippedLoads: 1 }));
            haulageOffersRepo.updateById = sinon.stub().resolves();
            const haulageLoadsRepo = createStubRepo();
            haulageLoadsRepo.findById = sinon.stub().resolves({ id: 5, haulageOfferId: 1 });
            haulageLoadsRepo.updateById = sinon.stub().resolves();
            const svc = buildHaulageOfferService({ haulageOffersRepo, haulageLoadsRepo });

            const result = await svc.markAsShipped(1, makeHaulierProfile(), 5);
            expect(haulageOffersRepo.updateById.calledWith(1, sinon.match({ status: HaulageOfferStatus.SHIPPED }))).to.be.true();
            expect(result.status).to.equal('success');
        });

        it('sets PARTIALLY_SHIPPED when some loads remain', async () => {
            const haulageOffersRepo = createStubRepo();
            haulageOffersRepo.findById.onFirstCall().resolves(makeHaulageOffer({ id: 1, status: HaulageOfferStatus.ACCEPTED, numberOfLoads: 3, shippedLoads: 1 }));
            haulageOffersRepo.findById.onSecondCall().resolves(makeHaulageOffer({ id: 1, status: HaulageOfferStatus.PARTIALLY_SHIPPED, shippedLoads: 2 }));
            haulageOffersRepo.updateById = sinon.stub().resolves();
            const haulageLoadsRepo = createStubRepo();
            haulageLoadsRepo.findById = sinon.stub().resolves({ id: 5, haulageOfferId: 1 });
            haulageLoadsRepo.updateById = sinon.stub().resolves();
            const svc = buildHaulageOfferService({ haulageOffersRepo, haulageLoadsRepo });

            const result = await svc.markAsShipped(1, makeHaulierProfile(), 5);
            expect(haulageOffersRepo.updateById.calledWith(1, sinon.match({ status: HaulageOfferStatus.PARTIALLY_SHIPPED }))).to.be.true();
            expect(result.status).to.equal('success');
        });
    });

    describe('handleBidAction() — INFORMATION_REQUESTED state', () => {
        it('allows action on INFORMATION_REQUESTED offers (APPROVE path)', async () => {
            const mocks = buildApproveActionMocks({ status: HaulageOfferStatus.INFORMATION_REQUESTED });
            const svc = buildHaulageOfferService(mocks);

            const result = await svc.handleBidAction(1, { action: HaulageBidAction.APPROVE } as any, makeAdminProfile());
            expect(result.status).to.equal('success');
        });

        it('throws BadRequest for invalid action (partial message match)', async () => {
            const haulageOffersRepo = createStubRepo();
            haulageOffersRepo.findById.resolves(makeHaulageOffer());
            const offersRepo = createStubRepo();
            offersRepo.findById.resolves(makeAcceptedOffer());
            const listingsRepo = createStubRepo();
            listingsRepo.findById.resolves(makeListing());
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1, email: 'h@t.com' });
            const companyLocationsRepo = createStubRepo();
            companyLocationsRepo.findById.resolves(null);
            const svc = buildHaulageOfferService({ haulageOffersRepo, offersRepo, listingsRepo, userRepo, companyLocationsRepo });

            await expect(svc.handleBidAction(1, { action: 'invalid_action' } as any, makeAdminProfile()))
                .to.be.rejectedWith(/Invalid action/);
        });
    });

    describe('getAvailableLoads() — SQL path', () => {
        it('throws Forbidden for non-haulier company', async () => {
            const companiesRepo = createStubRepo();
            companiesRepo.findById.resolves({ id: 50, isHaulier: false });
            const svc = buildHaulageOfferService({ companiesRepo });

            await expect(svc.getAvailableLoads(makeHaulierProfile()))
                .to.be.rejectedWith(/forbidden/i);
        });

        it('returns paginated results for haulier (uses offersRepository.execute)', async () => {
            const companiesRepo = createStubRepo();
            companiesRepo.findById.resolves({ id: 50, isHaulier: true });
            // getAvailableLoads uses offersRepository.execute for count then data
            const offersRepo = createStubRepo();
            offersRepo.execute = sinon.stub()
                .onFirstCall().resolves([{ total: '0' }])
                .onSecondCall().resolves([]);
            const svc = buildHaulageOfferService({ companiesRepo, offersRepo });

            const result = await svc.getAvailableLoads(makeHaulierProfile());
            expect(result).to.have.property('totalCount');
            expect(result.totalCount).to.equal(0);
        });
    });
});
