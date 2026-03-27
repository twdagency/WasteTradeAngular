import { expect, sinon } from '@loopback/testlab';
import { HaulageOfferService } from '../../services/haulage-offer.service';
import {
    CompanyStatus,
    CompanyUserStatusEnum,
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
        earliestDeliveryDate: new Date(Date.now() - 86400000), // yesterday
        latestDeliveryDate: new Date(Date.now() + 86400000 * 30), // 30 days ahead
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

describe('HaulageOfferService (unit)', () => {
    describe('createHaulageOffer()', () => {
        it('throws Forbidden when company is not a haulier', async () => {
            const companiesRepo = createStubRepo();
            companiesRepo.findById.resolves({ id: 50, isHaulier: false, status: CompanyStatus.ACTIVE });
            const svc = buildHaulageOfferService({ companiesRepo });

            await expect(svc.createHaulageOffer({
                offerId: 10,
                trailerContainerType: 'Curtain Sider',
                haulageCostPerLoad: 200,
                currency: ECurrency.GBP,
                demurrageAtDestination: 21,
                completingCustomsClearance: true,
                suggestedCollectionDate: new Date(),
                transportProvider: 'own_haulage',
                expectedTransitTime: '1-2 Days',
            } as any, makeHaulierProfile())).to.be.rejectedWith('Only hauliers can make haulage offers');
        });

        it('throws Forbidden when haulier company is not ACTIVE', async () => {
            const companiesRepo = createStubRepo();
            companiesRepo.findById.resolves({ id: 50, isHaulier: true, status: CompanyStatus.PENDING });
            const svc = buildHaulageOfferService({ companiesRepo });

            await expect(svc.createHaulageOffer({
                offerId: 10,
                trailerContainerType: 'Curtain Sider',
                haulageCostPerLoad: 200,
                currency: ECurrency.GBP,
                demurrageAtDestination: 21,
                completingCustomsClearance: true,
                suggestedCollectionDate: new Date(),
                transportProvider: 'own_haulage',
                expectedTransitTime: '1-2 Days',
            } as any, makeHaulierProfile())).to.be.rejectedWith('Your account is being verified by an administrator. You will be unable to make an offer until approved.');
        });

        it('throws BadRequest when underlying offer is not ACCEPTED', async () => {
            const companiesRepo = createStubRepo();
            companiesRepo.findById.resolves({ id: 50, isHaulier: true, status: CompanyStatus.ACTIVE, containerTypes: ['Curtain Sider'] });
            const offersRepo = createStubRepo();
            offersRepo.findById.resolves({ id: 10, status: OfferStatusEnum.APPROVED });
            const svc = buildHaulageOfferService({ companiesRepo, offersRepo });

            await expect(svc.createHaulageOffer({
                offerId: 10,
                trailerContainerType: 'Curtain Sider',
                haulageCostPerLoad: 200,
                currency: ECurrency.GBP,
                demurrageAtDestination: 21,
                completingCustomsClearance: true,
                suggestedCollectionDate: new Date(Date.now() + 86400000),
                transportProvider: 'own_haulage',
                expectedTransitTime: '1-2 Days',
            } as any, makeHaulierProfile())).to.be.rejectedWith('Haulage offers can only be made on accepted buyer offers');
        });

        it('throws BadRequest when demurrage is less than 21 days', async () => {
            const companiesRepo = createStubRepo();
            companiesRepo.findById.resolves({ id: 50, isHaulier: true, status: CompanyStatus.ACTIVE, containerTypes: ['Curtain Sider'] });
            const offersRepo = createStubRepo();
            offersRepo.findById.resolves(makeAcceptedOffer());
            const svc = buildHaulageOfferService({ companiesRepo, offersRepo });

            await expect(svc.createHaulageOffer({
                offerId: 10,
                trailerContainerType: 'Curtain Sider',
                haulageCostPerLoad: 200,
                currency: ECurrency.GBP,
                demurrageAtDestination: 10, // too low
                completingCustomsClearance: true,
                suggestedCollectionDate: new Date(Date.now() + 86400000),
                transportProvider: 'own_haulage',
                expectedTransitTime: '1-2 Days',
            } as any, makeHaulierProfile())).to.be.rejectedWith('Demurrage must be at least 21 days');
        });

        it('throws BadRequest when container type not in haulier profile', async () => {
            const companiesRepo = createStubRepo();
            companiesRepo.findById.resolves({
                id: 50, isHaulier: true, status: CompanyStatus.ACTIVE,
                containerTypes: ['Tipper Trucks'], // only has Tipper Trucks
            });
            const offersRepo = createStubRepo();
            offersRepo.findById.resolves(makeAcceptedOffer());
            const listingsRepo = createStubRepo();
            listingsRepo.findById.resolves(makeListing());
            const svc = buildHaulageOfferService({ companiesRepo, offersRepo, listingsRepo });

            await expect(svc.createHaulageOffer({
                offerId: 10,
                trailerContainerType: 'Curtain Sider', // not in profile
                haulageCostPerLoad: 200,
                currency: ECurrency.GBP,
                demurrageAtDestination: 21,
                completingCustomsClearance: true,
                suggestedCollectionDate: new Date(Date.now() + 86400000),
                transportProvider: 'own_haulage',
                expectedTransitTime: '1-2 Days',
            } as any, makeHaulierProfile())).to.be.rejectedWith('Selected container type is not associated with your haulier profile');
        });

        it('creates haulage offer with correct customs fee for GBP non-clearing', async () => {
            const companiesRepo = createStubRepo();
            companiesRepo.findById.resolves({
                id: 50, isHaulier: true, status: CompanyStatus.ACTIVE,
                containerTypes: ['Curtain Sider'],
            });
            const offersRepo = createStubRepo();
            offersRepo.findById.resolves(makeAcceptedOffer({ quantity: 3 }));
            const listingsRepo = createStubRepo();
            listingsRepo.findById.resolves(makeListing({ weightPerLoad: 5 }));
            const haulageOffersRepo = createStubRepo();
            haulageOffersRepo.create.resolves({ id: 100, status: HaulageOfferStatus.PENDING });
            const svc = buildHaulageOfferService({ companiesRepo, offersRepo, listingsRepo, haulageOffersRepo });

            const result = await svc.createHaulageOffer({
                offerId: 10,
                trailerContainerType: 'Curtain Sider',
                haulageCostPerLoad: 200,
                currency: ECurrency.GBP,
                demurrageAtDestination: 21,
                completingCustomsClearance: false, // will apply customs fee
                suggestedCollectionDate: new Date(Date.now() + 86400000),
                transportProvider: 'own_haulage',
                expectedTransitTime: '1-2 Days',
            } as any, makeHaulierProfile());

            expect(result.status).to.equal('success');
            const saved = haulageOffersRepo.create.firstCall.args[0];
            expect(saved.customsFee).to.equal(200); // GBP customs fee
            expect(saved.haulageTotal).to.equal(200 * 3 + 200); // cost * loads + customs
            expect(saved.status).to.equal(HaulageOfferStatus.PENDING);
        });

        it('applies EUR customs fee when currency is EUR', async () => {
            const companiesRepo = createStubRepo();
            companiesRepo.findById.resolves({ id: 50, isHaulier: true, status: CompanyStatus.ACTIVE, containerTypes: ['Curtain Sider'] });
            const offersRepo = createStubRepo();
            offersRepo.findById.resolves(makeAcceptedOffer({ quantity: 2 }));
            const listingsRepo = createStubRepo();
            listingsRepo.findById.resolves(makeListing());
            const haulageOffersRepo = createStubRepo();
            haulageOffersRepo.create.resolves({ id: 101, status: HaulageOfferStatus.PENDING });
            const svc = buildHaulageOfferService({ companiesRepo, offersRepo, listingsRepo, haulageOffersRepo });

            await svc.createHaulageOffer({
                offerId: 10,
                trailerContainerType: 'Curtain Sider',
                haulageCostPerLoad: 100,
                currency: ECurrency.EUR,
                demurrageAtDestination: 30,
                completingCustomsClearance: false,
                suggestedCollectionDate: new Date(Date.now() + 86400000),
                transportProvider: 'own_haulage',
                expectedTransitTime: '1-2 Days',
            } as any, makeHaulierProfile());

            const saved = haulageOffersRepo.create.firstCall.args[0];
            expect(saved.customsFee).to.equal(230); // EUR customs fee
        });
    });

    describe('withdrawHaulageOffer()', () => {
        it('throws Forbidden when caller does not own the offer', async () => {
            const haulageOffersRepo = createStubRepo();
            haulageOffersRepo.findById.resolves(makeHaulageOffer({ haulierCompanyId: 999 }));
            const svc = buildHaulageOfferService({ haulageOffersRepo });

            await expect(svc.withdrawHaulageOffer(1, makeHaulierProfile({ companyId: 50 })))
                .to.be.rejectedWith('You can only withdraw your own haulage offers');
        });

        it('throws BadRequest when offer is already ACCEPTED', async () => {
            const haulageOffersRepo = createStubRepo();
            haulageOffersRepo.findById.resolves(makeHaulageOffer({ status: HaulageOfferStatus.ACCEPTED }));
            const svc = buildHaulageOfferService({ haulageOffersRepo });

            await expect(svc.withdrawHaulageOffer(1, makeHaulierProfile()))
                .to.be.rejectedWith('Cannot withdraw an offer that has already been accepted. Please contact support@wastetrade.com');
        });

        it('sets status to WITHDRAWN on success', async () => {
            const haulageOffersRepo = createStubRepo();
            haulageOffersRepo.findById.onFirstCall().resolves(makeHaulageOffer({ status: HaulageOfferStatus.PENDING }));
            haulageOffersRepo.findById.onSecondCall().resolves(makeHaulageOffer({ status: HaulageOfferStatus.WITHDRAWN }));
            haulageOffersRepo.updateById.resolves();
            const svc = buildHaulageOfferService({ haulageOffersRepo });

            const result = await svc.withdrawHaulageOffer(1, makeHaulierProfile());

            expect(haulageOffersRepo.updateById.calledWith(1, sinon.match({ status: HaulageOfferStatus.WITHDRAWN })))
                .to.be.true();
            expect(result.status).to.equal('success');
        });
    });

    describe('updateHaulageOffer()', () => {
        it('throws Forbidden when caller does not own the offer', async () => {
            const haulageOffersRepo = createStubRepo();
            haulageOffersRepo.findById.resolves(makeHaulageOffer({ haulierCompanyId: 999 }));
            const svc = buildHaulageOfferService({ haulageOffersRepo });

            await expect(svc.updateHaulageOffer(1, {}, makeHaulierProfile({ companyId: 50 })))
                .to.be.rejectedWith('You can only update your own haulage offers');
        });

        it('throws BadRequest when offer is APPROVED (final state)', async () => {
            const haulageOffersRepo = createStubRepo();
            haulageOffersRepo.findById.resolves(makeHaulageOffer({ status: HaulageOfferStatus.APPROVED }));
            const svc = buildHaulageOfferService({ haulageOffersRepo });

            await expect(svc.updateHaulageOffer(1, {}, makeHaulierProfile()))
                .to.be.rejectedWith('Cannot update haulage offers that have been approved or accepted');
        });

        it('throws BadRequest when demurrage update is below 21 days', async () => {
            const haulageOffersRepo = createStubRepo();
            haulageOffersRepo.findById.resolves(makeHaulageOffer({ status: HaulageOfferStatus.PENDING }));
            const svc = buildHaulageOfferService({ haulageOffersRepo });

            await expect(svc.updateHaulageOffer(1, { demurrageAtDestination: 10 }, makeHaulierProfile()))
                .to.be.rejectedWith('Demurrage must be at least 21 days');
        });

        it('resets WITHDRAWN offer to PENDING on edit', async () => {
            const haulageOffersRepo = createStubRepo();
            const withdrawnOffer = makeHaulageOffer({ status: HaulageOfferStatus.WITHDRAWN });
            haulageOffersRepo.findById.onFirstCall().resolves(withdrawnOffer);
            haulageOffersRepo.findById.onSecondCall().resolves(makeHaulageOffer({ status: HaulageOfferStatus.PENDING }));
            haulageOffersRepo.updateById.resolves();
            const svc = buildHaulageOfferService({ haulageOffersRepo });

            const result = await svc.updateHaulageOffer(1, { notes: 'updated notes' }, makeHaulierProfile());

            const updateArg = haulageOffersRepo.updateById.firstCall.args[1];
            expect(updateArg.status).to.equal(HaulageOfferStatus.PENDING);
            expect(result.status).to.equal('success');
        });
    });

    describe('handleBidAction()', () => {
        function setupBidActionMocks(haulageOfferOverrides: Record<string, any> = {}) {
            const haulageOffersRepo = createStubRepo();
            haulageOffersRepo.findById.onFirstCall().resolves(makeHaulageOffer(haulageOfferOverrides));
            haulageOffersRepo.findById.onSecondCall().resolves(makeHaulageOffer({ ...haulageOfferOverrides, status: HaulageOfferStatus.ACCEPTED }));
            haulageOffersRepo.updateById.resolves();

            const offersRepo = createStubRepo();
            offersRepo.findById.resolves(makeAcceptedOffer());

            const listingsRepo = createStubRepo();
            listingsRepo.findById.resolves(makeListing());

            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1, email: 'haulier@test.com', firstName: 'H', lastName: 'U' });

            const companyLocationsRepo = createStubRepo();
            companyLocationsRepo.findById.resolves({ id: 30, addressLine: '1 St', city: 'London', country: 'GB' });

            const haulageLoadsRepo = createStubRepo();
            haulageLoadsRepo.create.resolves({ id: 1 });
            haulageLoadsRepo.find.resolves([]);

            return { haulageOffersRepo, offersRepo, listingsRepo, userRepo, companyLocationsRepo, haulageLoadsRepo };
        }

        it('throws Forbidden when caller is not admin', async () => {
            const mocks = setupBidActionMocks();
            const svc = buildHaulageOfferService(mocks);

            await expect(svc.handleBidAction(1,
                { action: HaulageBidAction.APPROVE } as any,
                makeHaulierProfile() // non-admin
            )).to.be.rejectedWith(/403|unauthorized/i);
        });

        it('throws BadRequest when haulage offer is not in PENDING state', async () => {
            const mocks = setupBidActionMocks({ status: HaulageOfferStatus.ACCEPTED });
            const svc = buildHaulageOfferService(mocks);

            await expect(svc.handleBidAction(1,
                { action: HaulageBidAction.APPROVE } as any,
                makeAdminProfile()
            )).to.be.rejectedWith('Cannot perform action on haulage offer with status: accepted');
        });

        it('approve: sets status to ACCEPTED and sends notifications', async () => {
            const mocks = setupBidActionMocks();
            const svc = buildHaulageOfferService(mocks);

            const result = await svc.handleBidAction(1,
                { action: HaulageBidAction.APPROVE } as any,
                makeAdminProfile()
            );

            expect(mocks.haulageOffersRepo.updateById.calledWith(1, sinon.match({ status: HaulageOfferStatus.ACCEPTED })))
                .to.be.true();
            expect(result.status).to.equal('success');
        });

        it('reject: sets status to REJECTED with rejection reason', async () => {
            const haulageOffersRepo = createStubRepo();
            haulageOffersRepo.findById.onFirstCall().resolves(makeHaulageOffer());
            haulageOffersRepo.findById.onSecondCall().resolves(makeHaulageOffer({ status: HaulageOfferStatus.REJECTED }));
            haulageOffersRepo.updateById.resolves();
            const offersRepo = createStubRepo();
            offersRepo.findById.resolves(makeAcceptedOffer());
            const listingsRepo = createStubRepo();
            listingsRepo.findById.resolves(makeListing());
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1, email: 'h@t.com' });
            const companyLocationsRepo = createStubRepo();
            companyLocationsRepo.findById.resolves(null);
            const svc = buildHaulageOfferService({ haulageOffersRepo, offersRepo, listingsRepo, userRepo, companyLocationsRepo });

            const result = await svc.handleBidAction(1,
                { action: HaulageBidAction.REJECT, customRejectionReason: 'Incomplete docs' } as any,
                makeAdminProfile()
            );

            expect(haulageOffersRepo.updateById.calledWith(1, sinon.match({ status: HaulageOfferStatus.REJECTED })))
                .to.be.true();
            expect(result.status).to.equal('success');
        });

        it('request_information: sets status to INFORMATION_REQUESTED', async () => {
            const haulageOffersRepo = createStubRepo();
            haulageOffersRepo.findById.onFirstCall().resolves(makeHaulageOffer());
            haulageOffersRepo.findById.onSecondCall().resolves(makeHaulageOffer({ status: HaulageOfferStatus.INFORMATION_REQUESTED }));
            haulageOffersRepo.updateById.resolves();
            const offersRepo = createStubRepo();
            offersRepo.findById.resolves(makeAcceptedOffer());
            const listingsRepo = createStubRepo();
            listingsRepo.findById.resolves(makeListing());
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1, email: 'h@t.com' });
            const companyLocationsRepo = createStubRepo();
            companyLocationsRepo.findById.resolves(null);
            const svc = buildHaulageOfferService({ haulageOffersRepo, offersRepo, listingsRepo, userRepo, companyLocationsRepo });

            await svc.handleBidAction(1,
                { action: HaulageBidAction.REQUEST_INFORMATION, message: 'Please provide docs' } as any,
                makeAdminProfile()
            );

            expect(haulageOffersRepo.updateById.calledWith(1, sinon.match({ status: HaulageOfferStatus.INFORMATION_REQUESTED })))
                .to.be.true();
        });

        it('throws BadRequest when request_information has no message', async () => {
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

            await expect(svc.handleBidAction(1,
                { action: HaulageBidAction.REQUEST_INFORMATION } as any, // no message
                makeAdminProfile()
            )).to.be.rejectedWith('Message is required when requesting more information');
        });
    });

    describe('getCompanyHauliers()', () => {
        it('throws Forbidden when company is not a haulier', async () => {
            const companiesRepo = createStubRepo();
            companiesRepo.findById.resolves({ id: 50, isHaulier: false });
            const svc = buildHaulageOfferService({ companiesRepo });

            await expect(svc.getCompanyHauliers(makeHaulierProfile()))
                .to.be.rejectedWith('Only haulier companies can access this endpoint');
        });

        it('returns empty list when no approved company users exist', async () => {
            const companiesRepo = createStubRepo();
            companiesRepo.findById.resolves({ id: 50, isHaulier: true });
            const companyUsersRepo = createStubRepo();
            companyUsersRepo.find.resolves([]);
            const svc = buildHaulageOfferService({ companiesRepo, companyUsersRepo });

            const result = await svc.getCompanyHauliers(makeHaulierProfile());

            expect(result.status).to.equal('success');
            expect(result.data).to.deepEqual([]);
        });

        it('returns haulier users from approved company members', async () => {
            const companiesRepo = createStubRepo();
            companiesRepo.findById.resolves({ id: 50, isHaulier: true });
            const companyUsersRepo = createStubRepo();
            companyUsersRepo.find.resolves([
                { userId: 1, companyId: 50, status: CompanyUserStatusEnum.ACTIVE },
                { userId: 2, companyId: 50, status: CompanyUserStatusEnum.ACTIVE },
            ]);
            const userRepo = createStubRepo();
            userRepo.find.resolves([
                { id: 1, firstName: 'Alice', lastName: 'Smith', email: 'a@t.com', username: '11223344' },
                { id: 2, firstName: 'Bob', lastName: 'Jones', email: 'b@t.com', username: '22334455' },
            ]);
            const svc = buildHaulageOfferService({ companiesRepo, companyUsersRepo, userRepo });

            const result = await svc.getCompanyHauliers(makeHaulierProfile());

            expect(result.status).to.equal('success');
            expect((result.data as any[]).length).to.equal(2);
        });
    });
});
