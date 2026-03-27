/**
 * haulage-offer.service-6.unit.ts
 * Coverage-focused tests for haulage-offer.service.ts (Part 6)
 * Targets: adminCreateHaulageOfferOnBehalf, getCompanyHauliers, validateInternalNotes,
 *          updateHaulageOffer, getHaulageOffers, getHaulageOfferById, deleteHaulageOffer.
 */
import { expect, sinon } from '@loopback/testlab';
import { HaulageOfferService } from '../../services/haulage-offer.service';
import {
    HaulageOfferStatus,
    OfferStatusEnum,
    UserRoleEnum,
    ECurrency,
    CompanyStatus,
    CompanyUserStatusEnum,
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

function makeUserProfile(overrides: Record<string, any> = {}): any {
    return { id: 1, globalRole: UserRoleEnum.USER, companyId: 50, ...overrides };
}

function makeHaulageOffer(overrides: Record<string, any> = {}): any {
    return {
        id: 1, offerId: 10, haulierCompanyId: 50, haulierUserId: 1,
        status: HaulageOfferStatus.PENDING,
        numberOfLoads: 2, haulageCostPerLoad: 200, currency: ECurrency.GBP,
        ...overrides,
    };
}

function makeOffer(overrides: Record<string, any> = {}): any {
    return {
        id: 10, listingId: 20, status: OfferStatusEnum.ACCEPTED,
        quantity: 5, sellerLocationId: 30, buyerLocationId: 31,
        createdByUserId: 7,
        ...overrides,
    };
}

describe('HaulageOfferService extended coverage - Part 6 (unit)', () => {

    // ── validateInternalNotes ─────────────────────────────────────────────────
    describe('validateInternalNotes() via adminCreateHaulageOfferOnBehalf()', () => {
        it('throws 422 when notes contains a phone number', async () => {
            const companiesRepo = createStubRepo();
            companiesRepo.findById.resolves({ id: 1, isHaulier: true, status: CompanyStatus.ACTIVE, containerTypes: ['standard'] });
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1, email: 'u@t.com' });
            const companyUsersRepo = createStubRepo();
            companyUsersRepo.findOne.resolves({ id: 1, companyId: 1, userId: 1 });
            const offersRepo = createStubRepo();
            offersRepo.findById.resolves(makeOffer());
            const listingsRepo = createStubRepo();
            listingsRepo.findById.resolves({ id: 20, weightPerLoad: 5 });
            const haulageOffersRepo = createStubRepo();
            haulageOffersRepo.findOne = sinon.stub().resolves(null);

            const svc = buildSvc({ companiesRepo, userRepo, companyUsersRepo, offersRepo, listingsRepo, haulageOffersRepo });

            await expect(
                svc.adminCreateHaulageOfferOnBehalf({
                    offerId: 10,
                    haulierCompanyId: 1,
                    haulierUserId: 1,
                    trailerContainerType: 'standard',
                    completingCustomsClearance: true,
                    haulageCostPerLoad: 100,
                    currency: ECurrency.GBP,
                    transportProvider: 'FastTrans',
                    suggestedCollectionDate: new Date(Date.now() + 86400000 * 10),
                    expectedTransitTime: '3 days',
                    demurrageAtDestination: 21,
                    notes: 'Call +44 7700 900000',
                } as any, makeAdminProfile())
            ).to.be.rejectedWith(/phone/i);
        });

        it('throws 422 when notes contains an email', async () => {
            const companiesRepo = createStubRepo();
            companiesRepo.findById.resolves({ id: 1, isHaulier: true, status: CompanyStatus.ACTIVE, containerTypes: ['standard'] });
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1, email: 'u@t.com' });
            const companyUsersRepo = createStubRepo();
            companyUsersRepo.findOne.resolves({ id: 1, companyId: 1, userId: 1 });
            const offersRepo = createStubRepo();
            offersRepo.findById.resolves(makeOffer());
            const listingsRepo = createStubRepo();
            listingsRepo.findById.resolves({ id: 20, weightPerLoad: 5 });
            const haulageOffersRepo = createStubRepo();
            haulageOffersRepo.findOne = sinon.stub().resolves(null);

            const svc = buildSvc({ companiesRepo, userRepo, companyUsersRepo, offersRepo, listingsRepo, haulageOffersRepo });

            await expect(
                svc.adminCreateHaulageOfferOnBehalf({
                    offerId: 10,
                    haulierCompanyId: 1,
                    haulierUserId: 1,
                    trailerContainerType: 'standard',
                    completingCustomsClearance: true,
                    haulageCostPerLoad: 100,
                    currency: ECurrency.GBP,
                    transportProvider: 'FastTrans',
                    suggestedCollectionDate: new Date(Date.now() + 86400000 * 10),
                    expectedTransitTime: '3 days',
                    demurrageAtDestination: 21,
                    notes: 'Contact test@example.com for info',
                } as any, makeAdminProfile())
            ).to.be.rejectedWith(/email/i);
        });

        it('throws 422 when notes contains a URL', async () => {
            const companiesRepo = createStubRepo();
            companiesRepo.findById.resolves({ id: 1, isHaulier: true, status: CompanyStatus.ACTIVE, containerTypes: ['standard'] });
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1, email: 'u@t.com' });
            const companyUsersRepo = createStubRepo();
            companyUsersRepo.findOne.resolves({ id: 1, companyId: 1, userId: 1 });
            const offersRepo = createStubRepo();
            offersRepo.findById.resolves(makeOffer());
            const listingsRepo = createStubRepo();
            listingsRepo.findById.resolves({ id: 20, weightPerLoad: 5 });
            const haulageOffersRepo = createStubRepo();
            haulageOffersRepo.findOne = sinon.stub().resolves(null);

            const svc = buildSvc({ companiesRepo, userRepo, companyUsersRepo, offersRepo, listingsRepo, haulageOffersRepo });

            await expect(
                svc.adminCreateHaulageOfferOnBehalf({
                    offerId: 10,
                    haulierCompanyId: 1,
                    haulierUserId: 1,
                    trailerContainerType: 'standard',
                    completingCustomsClearance: true,
                    haulageCostPerLoad: 100,
                    currency: ECurrency.GBP,
                    transportProvider: 'FastTrans',
                    suggestedCollectionDate: new Date(Date.now() + 86400000 * 10),
                    expectedTransitTime: '3 days',
                    demurrageAtDestination: 21,
                    notes: 'Visit https://competitor.com',
                } as any, makeAdminProfile())
            ).to.be.rejectedWith(/url|website|link/i);
        });
    });

    // ── adminCreateHaulageOfferOnBehalf ────────────────────────────────────────
    describe('adminCreateHaulageOfferOnBehalf()', () => {
        it('throws 403 when caller is not admin', async () => {
            const svc = buildSvc();

            await expect(
                svc.adminCreateHaulageOfferOnBehalf({
                    offerId: 10, haulierCompanyId: 1, haulierUserId: 1,
                    trailerContainerType: 'standard', completingCustomsClearance: true,
                    haulageCostPerLoad: 100, currency: ECurrency.GBP,
                    transportProvider: 'FastTrans',
                    suggestedCollectionDate: new Date(),
                    expectedTransitTime: '3 days', demurrageAtDestination: 21,
                } as any, makeUserProfile())
            ).to.be.rejectedWith(/admin|forbidden|unauthorized/i);
        });

        it('throws 400 when selected company is not a haulier', async () => {
            const companiesRepo = createStubRepo();
            companiesRepo.findById.resolves({ id: 1, isHaulier: false, status: CompanyStatus.ACTIVE });
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1 });
            const svc = buildSvc({ companiesRepo, userRepo });

            await expect(
                svc.adminCreateHaulageOfferOnBehalf({
                    offerId: 10, haulierCompanyId: 1, haulierUserId: 1,
                    trailerContainerType: 'standard', completingCustomsClearance: true,
                    haulageCostPerLoad: 100, currency: ECurrency.GBP,
                    transportProvider: 'FastTrans',
                    suggestedCollectionDate: new Date(),
                    expectedTransitTime: '3 days', demurrageAtDestination: 21,
                } as any, makeAdminProfile())
            ).to.be.rejectedWith(/not a haulier/i);
        });

        it('throws 400 when selected haulier is not approved', async () => {
            const companiesRepo = createStubRepo();
            companiesRepo.findById.resolves({ id: 1, isHaulier: true, status: CompanyStatus.PENDING });
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1 });
            const svc = buildSvc({ companiesRepo, userRepo });

            await expect(
                svc.adminCreateHaulageOfferOnBehalf({
                    offerId: 10, haulierCompanyId: 1, haulierUserId: 1,
                    trailerContainerType: 'standard', completingCustomsClearance: true,
                    haulageCostPerLoad: 100, currency: ECurrency.GBP,
                    transportProvider: 'FastTrans',
                    suggestedCollectionDate: new Date(),
                    expectedTransitTime: '3 days', demurrageAtDestination: 21,
                } as any, makeAdminProfile())
            ).to.be.rejectedWith(/not approved/i);
        });

        it('throws 400 when user does not belong to haulier company', async () => {
            const companiesRepo = createStubRepo();
            companiesRepo.findById.resolves({ id: 1, isHaulier: true, status: CompanyStatus.ACTIVE, containerTypes: ['standard'] });
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1 });
            const companyUsersRepo = createStubRepo();
            companyUsersRepo.findOne.resolves(null); // no match
            const svc = buildSvc({ companiesRepo, userRepo, companyUsersRepo });

            await expect(
                svc.adminCreateHaulageOfferOnBehalf({
                    offerId: 10, haulierCompanyId: 1, haulierUserId: 1,
                    trailerContainerType: 'standard', completingCustomsClearance: true,
                    haulageCostPerLoad: 100, currency: ECurrency.GBP,
                    transportProvider: 'FastTrans',
                    suggestedCollectionDate: new Date(),
                    expectedTransitTime: '3 days', demurrageAtDestination: 21,
                } as any, makeAdminProfile())
            ).to.be.rejectedWith(/does not belong/i);
        });

        it('throws 409 when haulage offer already exists for this haulier and offer', async () => {
            const companiesRepo = createStubRepo();
            companiesRepo.findById.resolves({ id: 1, isHaulier: true, status: CompanyStatus.ACTIVE, containerTypes: ['standard'] });
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1 });
            const companyUsersRepo = createStubRepo();
            companyUsersRepo.findOne.resolves({ id: 1, companyId: 1, userId: 1 });
            const offersRepo = createStubRepo();
            offersRepo.findById.resolves(makeOffer());
            const listingsRepo = createStubRepo();
            listingsRepo.findById.resolves({ id: 20, weightPerLoad: 5 });
            const haulageOffersRepo = createStubRepo();
            haulageOffersRepo.findOne = sinon.stub().resolves({ id: 99 }); // already exists

            const svc = buildSvc({ companiesRepo, userRepo, companyUsersRepo, offersRepo, listingsRepo, haulageOffersRepo });

            await expect(
                svc.adminCreateHaulageOfferOnBehalf({
                    offerId: 10, haulierCompanyId: 1, haulierUserId: 1,
                    trailerContainerType: 'standard', completingCustomsClearance: true,
                    haulageCostPerLoad: 100, currency: ECurrency.GBP,
                    transportProvider: 'FastTrans',
                    suggestedCollectionDate: new Date(Date.now() + 86400000 * 10),
                    expectedTransitTime: '3 days', demurrageAtDestination: 21,
                } as any, makeAdminProfile())
            ).to.be.rejectedWith(/already exists/i);
        });

        it('creates haulage offer and returns success', async () => {
            const companiesRepo = createStubRepo();
            companiesRepo.findById.resolves({ id: 1, isHaulier: true, status: CompanyStatus.ACTIVE, containerTypes: ['standard'] });
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1 });
            const companyUsersRepo = createStubRepo();
            companyUsersRepo.findOne.resolves({ id: 1, companyId: 1, userId: 1 });
            const offersRepo = createStubRepo();
            offersRepo.findById.resolves(makeOffer({ earliestDeliveryDate: null, latestDeliveryDate: null }));
            const listingsRepo = createStubRepo();
            listingsRepo.findById.resolves({ id: 20, weightPerLoad: 5 });
            const haulageOffersRepo = createStubRepo();
            haulageOffersRepo.findOne = sinon.stub().resolves(null);
            haulageOffersRepo.create = sinon.stub().resolves({ id: 100, offerId: 10, status: HaulageOfferStatus.PENDING });

            const svc = buildSvc({ companiesRepo, userRepo, companyUsersRepo, offersRepo, listingsRepo, haulageOffersRepo });

            const result = await svc.adminCreateHaulageOfferOnBehalf({
                offerId: 10, haulierCompanyId: 1, haulierUserId: 1,
                trailerContainerType: 'standard', completingCustomsClearance: true,
                haulageCostPerLoad: 100, currency: ECurrency.GBP,
                transportProvider: 'FastTrans',
                suggestedCollectionDate: new Date(Date.now() + 86400000 * 10),
                expectedTransitTime: '3 days', demurrageAtDestination: 21,
            } as any, makeAdminProfile());

            expect(result.status).to.equal('success');
        });

        it('calculates EUR customs fee when not completing customs clearance', async () => {
            const companiesRepo = createStubRepo();
            companiesRepo.findById.resolves({ id: 1, isHaulier: true, status: CompanyStatus.ACTIVE, containerTypes: ['standard'] });
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1 });
            const companyUsersRepo = createStubRepo();
            companyUsersRepo.findOne.resolves({ id: 1, companyId: 1, userId: 1 });
            const offersRepo = createStubRepo();
            offersRepo.findById.resolves(makeOffer({ earliestDeliveryDate: null, latestDeliveryDate: null }));
            const listingsRepo = createStubRepo();
            listingsRepo.findById.resolves({ id: 20, weightPerLoad: 5 });
            const haulageOffersRepo = createStubRepo();
            haulageOffersRepo.findOne = sinon.stub().resolves(null);
            let createdData: any;
            haulageOffersRepo.create = sinon.stub().callsFake((d: any) => {
                createdData = d;
                return Promise.resolve({ id: 100, ...d });
            });

            const svc = buildSvc({ companiesRepo, userRepo, companyUsersRepo, offersRepo, listingsRepo, haulageOffersRepo });

            await svc.adminCreateHaulageOfferOnBehalf({
                offerId: 10, haulierCompanyId: 1, haulierUserId: 1,
                trailerContainerType: 'standard', completingCustomsClearance: false,
                haulageCostPerLoad: 100, currency: ECurrency.EUR,
                transportProvider: 'FastTrans',
                suggestedCollectionDate: new Date(Date.now() + 86400000 * 10),
                expectedTransitTime: '3 days', demurrageAtDestination: 21,
            } as any, makeAdminProfile());

            expect(createdData.customsFee).to.equal(230);
        });
    });

    // ── getCompanyHauliers ─────────────────────────────────────────────────────
    describe('getCompanyHauliers()', () => {
        it('throws 403 when company is not a haulier', async () => {
            const companiesRepo = createStubRepo();
            companiesRepo.findById.resolves({ id: 50, isHaulier: false });
            const svc = buildSvc({ companiesRepo });

            await expect(
                svc.getCompanyHauliers(makeUserProfile({ companyId: 50 }))
            ).to.be.rejectedWith(/haulier/i);
        });

        it('returns empty data when no active company users', async () => {
            const companiesRepo = createStubRepo();
            companiesRepo.findById.resolves({ id: 50, isHaulier: true });
            const companyUsersRepo = createStubRepo();
            companyUsersRepo.find.resolves([]);
            const svc = buildSvc({ companiesRepo, companyUsersRepo });

            const result = await svc.getCompanyHauliers(makeUserProfile({ companyId: 50 }));

            expect(result.status).to.equal('success');
            expect(result.data).to.be.an.Array();
            expect((result.data as any[]).length).to.equal(0);
        });

        it('returns hauliers matching search criteria', async () => {
            const companiesRepo = createStubRepo();
            companiesRepo.findById.resolves({ id: 50, isHaulier: true });
            const companyUsersRepo = createStubRepo();
            companyUsersRepo.find.resolves([
                { id: 1, userId: 1, companyId: 50, status: CompanyUserStatusEnum.ACTIVE },
                { id: 2, userId: 2, companyId: 50, status: CompanyUserStatusEnum.ACTIVE },
            ]);
            const userRepo = createStubRepo();
            userRepo.find = sinon.stub().resolves([
                { id: 1, firstName: 'Alice', lastName: 'Smith', email: 'alice@t.com' },
            ]);
            const svc = buildSvc({ companiesRepo, companyUsersRepo, userRepo });

            const result = await svc.getCompanyHauliers(makeUserProfile({ companyId: 50 }), 'alice');

            expect(result.status).to.equal('success');
            expect((result.data as any[]).length).to.equal(1);
        });
    });

    // ── createHaulageOffer — customs fee branches ──────────────────────────────
    describe('createHaulageOffer() — customs fee by currency', () => {
        function makeSetupRepos(currency: ECurrency) {
            const companiesRepo = createStubRepo();
            companiesRepo.findById.resolves({ id: 50, isHaulier: true, status: CompanyStatus.ACTIVE, containerTypes: ['standard'] });
            const offersRepo = createStubRepo();
            offersRepo.findById.resolves(makeOffer({ earliestDeliveryDate: null, latestDeliveryDate: null }));
            const listingsRepo = createStubRepo();
            listingsRepo.findById.resolves({ id: 20, weightPerLoad: 5 });
            const haulageOffersRepo = createStubRepo();
            let captured: any;
            haulageOffersRepo.create = sinon.stub().callsFake((d: any) => {
                captured = d;
                return Promise.resolve({ id: 100, ...d });
            });
            return { companiesRepo, offersRepo, listingsRepo, haulageOffersRepo, getCaptured: () => captured };
        }

        it('charges GBP 200 customs fee when not completing customs clearance in GBP', async () => {
            const { companiesRepo, offersRepo, listingsRepo, haulageOffersRepo, getCaptured } = makeSetupRepos(ECurrency.GBP);
            const svc = buildSvc({ companiesRepo, offersRepo, listingsRepo, haulageOffersRepo });

            await svc.createHaulageOffer({
                offerId: 10, trailerContainerType: 'standard', completingCustomsClearance: false,
                haulageCostPerLoad: 100, currency: ECurrency.GBP,
                transportProvider: 'FastTrans',
                suggestedCollectionDate: new Date(Date.now() + 86400000 * 10),
                expectedTransitTime: '3 days', demurrageAtDestination: 21,
            } as any, makeUserProfile({ companyId: 50 }));

            expect(getCaptured().customsFee).to.equal(200);
        });

        it('charges USD 250 customs fee when not completing customs clearance in USD', async () => {
            const { companiesRepo, offersRepo, listingsRepo, haulageOffersRepo, getCaptured } = makeSetupRepos(ECurrency.USD);
            const svc = buildSvc({ companiesRepo, offersRepo, listingsRepo, haulageOffersRepo });

            await svc.createHaulageOffer({
                offerId: 10, trailerContainerType: 'standard', completingCustomsClearance: false,
                haulageCostPerLoad: 100, currency: ECurrency.USD,
                transportProvider: 'FastTrans',
                suggestedCollectionDate: new Date(Date.now() + 86400000 * 10),
                expectedTransitTime: '3 days', demurrageAtDestination: 21,
            } as any, makeUserProfile({ companyId: 50 }));

            expect(getCaptured().customsFee).to.equal(250);
        });

        it('uses haulierUserId from different company member when explicitly provided', async () => {
            const companiesRepo = createStubRepo();
            companiesRepo.findById.resolves({ id: 50, isHaulier: true, status: CompanyStatus.ACTIVE, containerTypes: ['standard'] });
            const offersRepo = createStubRepo();
            offersRepo.findById.resolves(makeOffer({ earliestDeliveryDate: null, latestDeliveryDate: null }));
            const listingsRepo = createStubRepo();
            listingsRepo.findById.resolves({ id: 20, weightPerLoad: 5 });
            const companyUsersRepo = createStubRepo();
            companyUsersRepo.findOne.resolves({ id: 5, companyId: 50, userId: 2, status: CompanyUserStatusEnum.ACTIVE });
            const haulageOffersRepo = createStubRepo();
            let captured: any;
            haulageOffersRepo.create = sinon.stub().callsFake((d: any) => {
                captured = d;
                return Promise.resolve({ id: 100, ...d });
            });

            const svc = buildSvc({ companiesRepo, offersRepo, listingsRepo, companyUsersRepo, haulageOffersRepo });

            await svc.createHaulageOffer({
                offerId: 10, trailerContainerType: 'standard', completingCustomsClearance: true,
                haulageCostPerLoad: 100, currency: ECurrency.GBP,
                transportProvider: 'FastTrans',
                suggestedCollectionDate: new Date(Date.now() + 86400000 * 10),
                expectedTransitTime: '3 days', demurrageAtDestination: 21,
                haulierUserId: 2, // different member
            } as any, makeUserProfile({ id: 1, companyId: 50 }));

            expect(captured.haulierUserId).to.equal(2);
        });

        it('throws when selected haulier is not an approved member', async () => {
            const companiesRepo = createStubRepo();
            companiesRepo.findById.resolves({ id: 50, isHaulier: true, status: CompanyStatus.ACTIVE, containerTypes: ['standard'] });
            const offersRepo = createStubRepo();
            offersRepo.findById.resolves(makeOffer({ earliestDeliveryDate: null, latestDeliveryDate: null }));
            const companyUsersRepo = createStubRepo();
            companyUsersRepo.findOne.resolves(null); // not found
            const svc = buildSvc({ companiesRepo, offersRepo, companyUsersRepo });

            await expect(
                svc.createHaulageOffer({
                    offerId: 10, trailerContainerType: 'standard', completingCustomsClearance: true,
                    haulageCostPerLoad: 100, currency: ECurrency.GBP,
                    transportProvider: 'FastTrans',
                    suggestedCollectionDate: new Date(Date.now() + 86400000 * 10),
                    expectedTransitTime: '3 days', demurrageAtDestination: 21,
                    haulierUserId: 99,
                } as any, makeUserProfile({ id: 1, companyId: 50 }))
            ).to.be.rejectedWith(/not an approved member/i);
        });

        it('throws when offer is not ACCEPTED', async () => {
            const companiesRepo = createStubRepo();
            companiesRepo.findById.resolves({ id: 50, isHaulier: true, status: CompanyStatus.ACTIVE });
            const offersRepo = createStubRepo();
            offersRepo.findById.resolves(makeOffer({ status: OfferStatusEnum.PENDING }));
            const svc = buildSvc({ companiesRepo, offersRepo });

            await expect(
                svc.createHaulageOffer({
                    offerId: 10, trailerContainerType: 'standard', completingCustomsClearance: true,
                    haulageCostPerLoad: 100, currency: ECurrency.GBP,
                    transportProvider: 'FastTrans',
                    suggestedCollectionDate: new Date(),
                    expectedTransitTime: '3 days', demurrageAtDestination: 21,
                } as any, makeUserProfile({ companyId: 50 }))
            ).to.be.rejectedWith(/accepted/i);
        });

        it('throws when company is not a haulier', async () => {
            const companiesRepo = createStubRepo();
            companiesRepo.findById.resolves({ id: 50, isHaulier: false });
            const svc = buildSvc({ companiesRepo });

            await expect(
                svc.createHaulageOffer({
                    offerId: 10, trailerContainerType: 'standard', completingCustomsClearance: true,
                    haulageCostPerLoad: 100, currency: ECurrency.GBP,
                    transportProvider: 'FastTrans',
                    suggestedCollectionDate: new Date(),
                    expectedTransitTime: '3 days', demurrageAtDestination: 21,
                } as any, makeUserProfile({ companyId: 50 }))
            ).to.be.rejectedWith(/haulier/i);
        });
    });
});
