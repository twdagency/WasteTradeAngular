/**
 * haulage-offer.service-5.unit.ts
 * Branch-focused tests for haulage-offer.service.ts (Part 5)
 * Targets: handleBidAction switch branches (APPROVE/REJECT/REQUEST_INFORMATION/invalid),
 *          null guards, status validation conditionals.
 */
import { expect, sinon } from '@loopback/testlab';
import { HaulageOfferService } from '../../services/haulage-offer.service';
import {
    HaulageOfferStatus,
    HaulageBidAction,
    OfferStatusEnum,
    UserRoleEnum,
    ECurrency,
} from '../../enum';
import { createStubRepo, createStubService } from '../helpers/stub-factory';

function buildSvc(overrides: Record<string, any> = {}): HaulageOfferService {
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

function makeAdminProfile(overrides: Record<string, any> = {}): any {
    return { id: 99, globalRole: UserRoleEnum.ADMIN, companyId: 1, ...overrides };
}

function makeHaulageOffer(overrides: Record<string, any> = {}): any {
    return {
        id: 1,
        offerId: 10,
        haulierCompanyId: 50,
        haulierUserId: 5,
        status: HaulageOfferStatus.PENDING,
        numberOfLoads: 2,
        haulageCostPerLoad: 200,
        currency: ECurrency.GBP,
        ...overrides,
    };
}

function makeOffer(overrides: Record<string, any> = {}): any {
    return {
        id: 10,
        listingId: 20,
        status: OfferStatusEnum.ACCEPTED,
        sellerLocationId: 30,
        buyerLocationId: 31,
        createdByUserId: 7,
        ...overrides,
    };
}

function makeListing(overrides: Record<string, any> = {}): any {
    return {
        id: 20,
        listingType: 'sell',
        createdByUserId: 7,
        materialType: 'plastic',
        weightPerLoad: 5,
        ...overrides,
    };
}

function makeLocation(id: number): any {
    return { id, addressLine: '1 Main St', street: 'Main', postcode: 'W1A', city: 'London', country: 'GB' };
}

// ── shared repo setup helpers ─────────────────────────────────────────────────

function makeReposForBidAction(haulageOfferOverrides: Record<string, any> = {}) {
    const haulageOffersRepo = createStubRepo();
    haulageOffersRepo.findById
        .onFirstCall().resolves(makeHaulageOffer(haulageOfferOverrides))
        .onSecondCall().resolves(makeHaulageOffer({ ...haulageOfferOverrides, status: HaulageOfferStatus.ACCEPTED }));
    haulageOffersRepo.updateById = sinon.stub().resolves();

    const offersRepo = createStubRepo();
    offersRepo.findById.resolves(makeOffer());

    const listingsRepo = createStubRepo();
    listingsRepo.findById.resolves(makeListing());

    const userRepo = createStubRepo();
    userRepo.findById.resolves({ id: 5, email: 'haulier@t.com', firstName: 'H', lastName: 'U' });

    const companyLocationsRepo = createStubRepo();
    companyLocationsRepo.findById.resolves(makeLocation(30));

    const haulageLoadsRepo = createStubRepo();
    haulageLoadsRepo.find.resolves([]);
    haulageLoadsRepo.count.resolves({ count: 0 });
    haulageLoadsRepo.create = sinon.stub().resolves({ id: 100 });

    return { haulageOffersRepo, offersRepo, listingsRepo, userRepo, companyLocationsRepo, haulageLoadsRepo };
}

describe('HaulageOfferService branch coverage - Part 5 (unit)', () => {
    describe('handleBidAction() — APPROVE branch', () => {
        it('sets status to ACCEPTED on APPROVE action', async () => {
            const repos = makeReposForBidAction();
            const emailService = createStubService([
                'sendHaulageOfferApprovedEmail', 'sendOfferApprovedEmail',
            ]);
            const notificationService = createStubService(['createNotification']);
            const svc = buildSvc({ ...repos, emailService, notificationService });

            const result = await svc.handleBidAction(
                1,
                { action: HaulageBidAction.APPROVE },
                makeAdminProfile(),
            );

            expect(repos.haulageOffersRepo.updateById.calledWith(1, sinon.match({ status: HaulageOfferStatus.ACCEPTED }))).to.be.true();
            expect(result.status).to.equal('success');
        });

        it('sends approval email to haulier on APPROVE', async () => {
            const repos = makeReposForBidAction();
            const emailService = createStubService([
                'sendHaulageOfferApprovedEmail', 'sendOfferApprovedEmail',
            ]);
            const notificationService = createStubService(['createNotification']);
            const svc = buildSvc({ ...repos, emailService, notificationService });

            await svc.handleBidAction(1, { action: HaulageBidAction.APPROVE }, makeAdminProfile());

            expect(emailService.sendHaulageOfferApprovedEmail.calledOnce).to.be.true();
        });

        it('throws 403 when non-admin calls handleBidAction', async () => {
            const repos = makeReposForBidAction();
            const svc = buildSvc(repos);

            await expect(
                svc.handleBidAction(
                    1,
                    { action: HaulageBidAction.APPROVE },
                    { id: 1, globalRole: UserRoleEnum.USER, companyId: 50 } as any,
                ),
            ).to.be.rejectedWith(/admin|unauthorized|forbidden/i);
        });

        it('throws 400 when haulage offer status is not PENDING or INFORMATION_REQUESTED', async () => {
            const repos = makeReposForBidAction({ status: HaulageOfferStatus.ACCEPTED });
            // Reset to always return ACCEPTED status on first call
            repos.haulageOffersRepo.findById.reset();
            repos.haulageOffersRepo.findById.resolves(makeHaulageOffer({ status: HaulageOfferStatus.ACCEPTED }));
            const svc = buildSvc(repos);

            await expect(
                svc.handleBidAction(1, { action: HaulageBidAction.APPROVE }, makeAdminProfile()),
            ).to.be.rejectedWith(/status|action/i);
        });
    });

    describe('handleBidAction() — REJECT branch', () => {
        it('sets status to REJECTED on REJECT action', async () => {
            const repos = makeReposForBidAction();
            repos.haulageOffersRepo.findById
                .onSecondCall().resolves(makeHaulageOffer({ status: HaulageOfferStatus.REJECTED }));
            const emailService = createStubService(['sendHaulageOfferRejectedEmail']);
            const notificationService = createStubService(['createNotification']);
            const svc = buildSvc({ ...repos, emailService, notificationService });

            const result = await svc.handleBidAction(
                1,
                { action: HaulageBidAction.REJECT, rejectionReason: 'PRICE_TOO_HIGH' as any },
                makeAdminProfile(),
            );

            expect(repos.haulageOffersRepo.updateById.calledWith(1, sinon.match({ status: HaulageOfferStatus.REJECTED }))).to.be.true();
            expect(result.status).to.equal('success');
        });

        it('uses customRejectionReason when provided', async () => {
            const repos = makeReposForBidAction();
            repos.haulageOffersRepo.findById
                .onSecondCall().resolves(makeHaulageOffer({ status: HaulageOfferStatus.REJECTED }));
            const emailService = createStubService(['sendHaulageOfferRejectedEmail']);
            const notificationService = createStubService(['createNotification']);
            const svc = buildSvc({ ...repos, emailService, notificationService });

            await svc.handleBidAction(
                1,
                { action: HaulageBidAction.REJECT, customRejectionReason: 'Custom reason text' } as any,
                makeAdminProfile(),
            );

            expect(emailService.sendHaulageOfferRejectedEmail.calledOnce).to.be.true();
            const emailArgs = emailService.sendHaulageOfferRejectedEmail.firstCall.args;
            expect(emailArgs[3]).to.equal('Custom reason text');
        });

        it('saves rejectionReason and customRejectionReason in update payload', async () => {
            const repos = makeReposForBidAction();
            repos.haulageOffersRepo.findById
                .onSecondCall().resolves(makeHaulageOffer({ status: HaulageOfferStatus.REJECTED }));
            const emailService = createStubService(['sendHaulageOfferRejectedEmail']);
            const notificationService = createStubService(['createNotification']);
            const svc = buildSvc({ ...repos, emailService, notificationService });

            await svc.handleBidAction(
                1,
                { action: HaulageBidAction.REJECT, rejectionReason: 'PRICE_TOO_HIGH' as any, customRejectionReason: 'Too high' } as any,
                makeAdminProfile(),
            );

            const updateArg = repos.haulageOffersRepo.updateById.firstCall.args[1];
            expect(updateArg.rejectionReason).to.equal('PRICE_TOO_HIGH');
            expect(updateArg.customRejectionReason).to.equal('Too high');
        });
    });

    describe('handleBidAction() — REQUEST_INFORMATION branch', () => {
        it('sets status to INFORMATION_REQUESTED and saves adminMessage', async () => {
            const repos = makeReposForBidAction();
            repos.haulageOffersRepo.findById
                .onSecondCall().resolves(makeHaulageOffer({ status: HaulageOfferStatus.INFORMATION_REQUESTED }));
            const emailService = createStubService(['sendHaulageOfferRequestInformationEmail']);
            const notificationService = createStubService(['createNotification']);
            const svc = buildSvc({ ...repos, emailService, notificationService });

            await svc.handleBidAction(
                1,
                { action: HaulageBidAction.REQUEST_INFORMATION, message: 'Please provide insurance details' } as any,
                makeAdminProfile(),
            );

            const updateArg = repos.haulageOffersRepo.updateById.firstCall.args[1];
            expect(updateArg.status).to.equal(HaulageOfferStatus.INFORMATION_REQUESTED);
            expect(updateArg.adminMessage).to.equal('Please provide insurance details');
        });

        it('throws BadRequest when REQUEST_INFORMATION called without message', async () => {
            const repos = makeReposForBidAction();
            const svc = buildSvc(repos);

            await expect(
                svc.handleBidAction(
                    1,
                    { action: HaulageBidAction.REQUEST_INFORMATION } as any,
                    makeAdminProfile(),
                ),
            ).to.be.rejectedWith(/message.*required|required.*message/i);
        });
    });

    describe('handleBidAction() — invalid action branch', () => {
        it('throws BadRequest for unknown action', async () => {
            const repos = makeReposForBidAction();
            const svc = buildSvc(repos);

            await expect(
                svc.handleBidAction(1, { action: 'INVALID_ACTION' as any }, makeAdminProfile()),
            ).to.be.rejectedWith(/invalid action/i);
        });
    });

    describe('handleBidAction() — null guard branches', () => {
        it('throws NotFound when haulage offer not found', async () => {
            const haulageOffersRepo = createStubRepo();
            haulageOffersRepo.findById.resolves(null);
            const svc = buildSvc({ haulageOffersRepo });

            await expect(
                svc.handleBidAction(999, { action: HaulageBidAction.APPROVE }, makeAdminProfile()),
            ).to.be.rejectedWith(/not found|haulage/i);
        });

        it('throws NotFound when related offer not found', async () => {
            const haulageOffersRepo = createStubRepo();
            haulageOffersRepo.findById.resolves(makeHaulageOffer());
            const offersRepo = createStubRepo();
            offersRepo.findById.resolves(null);
            const svc = buildSvc({ haulageOffersRepo, offersRepo });

            await expect(
                svc.handleBidAction(1, { action: HaulageBidAction.APPROVE }, makeAdminProfile()),
            ).to.be.rejectedWith(/not found|offer/i);
        });

        it('throws NotFound when related listing not found', async () => {
            const haulageOffersRepo = createStubRepo();
            haulageOffersRepo.findById.resolves(makeHaulageOffer());
            const offersRepo = createStubRepo();
            offersRepo.findById.resolves(makeOffer());
            const listingsRepo = createStubRepo();
            listingsRepo.findById.resolves(null);
            const svc = buildSvc({ haulageOffersRepo, offersRepo, listingsRepo });

            await expect(
                svc.handleBidAction(1, { action: HaulageBidAction.APPROVE }, makeAdminProfile()),
            ).to.be.rejectedWith(/not found|listing/i);
        });
    });

    describe('createHaulageOffer() — additional validation branches', () => {
        it('throws when demurrageAtDestination is less than 21 days', async () => {
            const companiesRepo = createStubRepo();
            companiesRepo.findById.resolves({
                id: 50,
                isHaulier: true,
                status: 'active',
                containerTypes: ['standard'],
            });
            const offersRepo = createStubRepo();
            offersRepo.findById.resolves({
                ...makeOffer(),
                status: OfferStatusEnum.ACCEPTED,
                quantity: 5,
                earliestDeliveryDate: null,
                latestDeliveryDate: null,
            });
            const svc = buildSvc({ companiesRepo, offersRepo });

            await expect(
                svc.createHaulageOffer(
                    {
                        offerId: 10,
                        trailerContainerType: 'standard',
                        completingCustomsClearance: true,
                        haulageCostPerLoad: 100,
                        currency: ECurrency.GBP,
                        transportProvider: 'FastTrans',
                        suggestedCollectionDate: new Date(Date.now() + 86400000 * 10),
                        expectedTransitTime: '3 days',
                        demurrageAtDestination: 10, // less than 21
                    } as any,
                    { id: 1, companyId: 50, globalRole: UserRoleEnum.USER } as any,
                ),
            ).to.be.rejectedWith(/demurrage.*21|21.*days/i);
        });

        it('throws when container type is not in haulier profile', async () => {
            const companiesRepo = createStubRepo();
            companiesRepo.findById.resolves({
                id: 50,
                isHaulier: true,
                status: 'active',
                containerTypes: ['flatbed'],
            });
            const offersRepo = createStubRepo();
            offersRepo.findById.resolves({
                ...makeOffer(),
                status: OfferStatusEnum.ACCEPTED,
                quantity: 5,
                earliestDeliveryDate: null,
                latestDeliveryDate: null,
            });
            const svc = buildSvc({ companiesRepo, offersRepo });

            await expect(
                svc.createHaulageOffer(
                    {
                        offerId: 10,
                        trailerContainerType: 'refrigerated',
                        completingCustomsClearance: true,
                        haulageCostPerLoad: 100,
                        currency: ECurrency.GBP,
                        transportProvider: 'FastTrans',
                        suggestedCollectionDate: new Date(Date.now() + 86400000 * 10),
                        expectedTransitTime: '3 days',
                        demurrageAtDestination: 21,
                    } as any,
                    { id: 1, companyId: 50, globalRole: UserRoleEnum.USER } as any,
                ),
            ).to.be.rejectedWith(/container type|haulier profile/i);
        });
    });
});
