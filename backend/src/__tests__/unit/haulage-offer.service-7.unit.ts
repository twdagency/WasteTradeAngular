/**
 * haulage-offer.service-7.unit.ts
 * Coverage-focused tests for haulage-offer.service.ts (Part 7)
 * Targets: updateHaulageOffer (ownership, status guards, recalc branches),
 *          withdrawHaulageOffer (ownership, accepted guard, success),
 *          getHaulageOfferById (not-found, forbidden, success via execute stub),
 *          syncHaulageOfferDocumentsFromSalesforce (no-sf-service, empty-docs, upsert paths),
 *          getApprovedHauliersForAdmin (admin guard, with/without search),
 *          getMyHaulageOffers (execute stub).
 */
import { expect, sinon } from '@loopback/testlab';
import { HaulageOfferService } from '../../services/haulage-offer.service';
import {
    HaulageOfferStatus,
    OfferStatusEnum,
    UserRoleEnum,
    ECurrency,
    CompanyStatus,
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
        id: 1,
        offerId: 10,
        haulierCompanyId: 50,
        haulierUserId: 1,
        status: HaulageOfferStatus.PENDING,
        numberOfLoads: 3,
        haulageCostPerLoad: 100,
        haulageTotal: 300,
        customsFee: 0,
        currency: ECurrency.GBP,
        completingCustomsClearance: true,
        ...overrides,
    };
}

describe('HaulageOfferService extended coverage - Part 7 (unit)', () => {

    // ── updateHaulageOffer — ownership guard ───────────────────────────────────
    describe('updateHaulageOffer() — guards', () => {
        it('throws 403 when caller does not own the haulage offer', async () => {
            const haulageOffersRepo = createStubRepo();
            haulageOffersRepo.findById.resolves(makeHaulageOffer({ haulierCompanyId: 99 })); // different company
            const svc = buildSvc({ haulageOffersRepo });

            await expect(
                svc.updateHaulageOffer(1, {} as any, makeUserProfile({ companyId: 50 })),
            ).to.be.rejectedWith(/only update your own/i);
        });

        it('throws 400 when haulage offer is APPROVED', async () => {
            const haulageOffersRepo = createStubRepo();
            haulageOffersRepo.findById.resolves(makeHaulageOffer({ status: HaulageOfferStatus.APPROVED }));
            const svc = buildSvc({ haulageOffersRepo });

            await expect(
                svc.updateHaulageOffer(1, {} as any, makeUserProfile()),
            ).to.be.rejectedWith(/approved or accepted/i);
        });

        it('throws 400 when haulage offer is ACCEPTED', async () => {
            const haulageOffersRepo = createStubRepo();
            haulageOffersRepo.findById.resolves(makeHaulageOffer({ status: HaulageOfferStatus.ACCEPTED }));
            const svc = buildSvc({ haulageOffersRepo });

            await expect(
                svc.updateHaulageOffer(1, {} as any, makeUserProfile()),
            ).to.be.rejectedWith(/approved or accepted/i);
        });

        it('throws 400 when demurrageAtDestination is less than 21', async () => {
            const haulageOffersRepo = createStubRepo();
            haulageOffersRepo.findById.resolves(makeHaulageOffer());
            const svc = buildSvc({ haulageOffersRepo });

            await expect(
                svc.updateHaulageOffer(1, { demurrageAtDestination: 10 } as any, makeUserProfile()),
            ).to.be.rejectedWith(/demurrage.*21|21.*days/i);
        });
    });

    describe('updateHaulageOffer() — recalculation branches', () => {
        it('recalculates customsFee when completingCustomsClearance changes to false (GBP)', async () => {
            const haulageOffersRepo = createStubRepo();
            const existing = makeHaulageOffer({ completingCustomsClearance: true, customsFee: 0, currency: ECurrency.GBP });
            haulageOffersRepo.findById
                .onFirstCall().resolves(existing)
                .onSecondCall().resolves({ ...existing, customsFee: 200 });
            haulageOffersRepo.updateById.resolves();
            const svc = buildSvc({ haulageOffersRepo });

            await svc.updateHaulageOffer(1, { completingCustomsClearance: false } as any, makeUserProfile());

            const updateArg = haulageOffersRepo.updateById.firstCall.args[1];
            expect(updateArg.customsFee).to.equal(200);
        });

        it('recalculates customsFee for EUR currency', async () => {
            const haulageOffersRepo = createStubRepo();
            const existing = makeHaulageOffer({ completingCustomsClearance: true, customsFee: 0, currency: ECurrency.EUR });
            haulageOffersRepo.findById
                .onFirstCall().resolves(existing)
                .onSecondCall().resolves({ ...existing, customsFee: 230 });
            haulageOffersRepo.updateById.resolves();
            const svc = buildSvc({ haulageOffersRepo });

            await svc.updateHaulageOffer(1, { completingCustomsClearance: false } as any, makeUserProfile());

            const updateArg = haulageOffersRepo.updateById.firstCall.args[1];
            expect(updateArg.customsFee).to.equal(230);
        });

        it('recalculates customsFee for USD currency', async () => {
            const haulageOffersRepo = createStubRepo();
            const existing = makeHaulageOffer({ completingCustomsClearance: true, customsFee: 0, currency: ECurrency.USD });
            haulageOffersRepo.findById
                .onFirstCall().resolves(existing)
                .onSecondCall().resolves({ ...existing, customsFee: 250 });
            haulageOffersRepo.updateById.resolves();
            const svc = buildSvc({ haulageOffersRepo });

            await svc.updateHaulageOffer(1, { completingCustomsClearance: false } as any, makeUserProfile());

            const updateArg = haulageOffersRepo.updateById.firstCall.args[1];
            expect(updateArg.customsFee).to.equal(250);
        });

        it('recalculates haulageTotal when haulageCostPerLoad changes', async () => {
            const haulageOffersRepo = createStubRepo();
            const existing = makeHaulageOffer({ haulageCostPerLoad: 100, numberOfLoads: 3, customsFee: 0 });
            haulageOffersRepo.findById
                .onFirstCall().resolves(existing)
                .onSecondCall().resolves({ ...existing, haulageCostPerLoad: 150, haulageTotal: 450 });
            haulageOffersRepo.updateById.resolves();
            const svc = buildSvc({ haulageOffersRepo });

            await svc.updateHaulageOffer(1, { haulageCostPerLoad: 150 } as any, makeUserProfile());

            const updateArg = haulageOffersRepo.updateById.firstCall.args[1];
            expect(updateArg.haulageTotal).to.equal(450); // 150*3 + 0
        });

        it('resets WITHDRAWN status back to PENDING on edit', async () => {
            const haulageOffersRepo = createStubRepo();
            const existing = makeHaulageOffer({ status: HaulageOfferStatus.WITHDRAWN });
            haulageOffersRepo.findById
                .onFirstCall().resolves(existing)
                .onSecondCall().resolves({ ...existing, status: HaulageOfferStatus.PENDING });
            haulageOffersRepo.updateById.resolves();
            const svc = buildSvc({ haulageOffersRepo });

            await svc.updateHaulageOffer(1, { notes: 'Updated notes' } as any, makeUserProfile());

            const updateArg = haulageOffersRepo.updateById.firstCall.args[1];
            expect(updateArg.status).to.equal(HaulageOfferStatus.PENDING);
        });

        it('does NOT reset status when status is PENDING', async () => {
            const haulageOffersRepo = createStubRepo();
            const existing = makeHaulageOffer({ status: HaulageOfferStatus.PENDING });
            haulageOffersRepo.findById
                .onFirstCall().resolves(existing)
                .onSecondCall().resolves(existing);
            haulageOffersRepo.updateById.resolves();
            const svc = buildSvc({ haulageOffersRepo });

            await svc.updateHaulageOffer(1, { notes: 'Some notes' } as any, makeUserProfile());

            const updateArg = haulageOffersRepo.updateById.firstCall.args[1];
            expect(updateArg.status).to.be.undefined();
        });

        it('returns success with updated offer data', async () => {
            const haulageOffersRepo = createStubRepo();
            const existing = makeHaulageOffer();
            const updated = { ...existing, notes: 'New notes' };
            haulageOffersRepo.findById
                .onFirstCall().resolves(existing)
                .onSecondCall().resolves(updated);
            haulageOffersRepo.updateById.resolves();
            const svc = buildSvc({ haulageOffersRepo });

            const result = await svc.updateHaulageOffer(1, { notes: 'New notes' } as any, makeUserProfile());

            expect(result.status).to.equal('success');
            expect(result.data).to.deepEqual(updated);
        });
    });

    // ── withdrawHaulageOffer ───────────────────────────────────────────────────
    describe('withdrawHaulageOffer()', () => {
        it('throws 403 when caller does not own the offer', async () => {
            const haulageOffersRepo = createStubRepo();
            haulageOffersRepo.findById.resolves(makeHaulageOffer({ haulierCompanyId: 99 }));
            const svc = buildSvc({ haulageOffersRepo });

            await expect(
                svc.withdrawHaulageOffer(1, makeUserProfile({ companyId: 50 })),
            ).to.be.rejectedWith(/only withdraw your own/i);
        });

        it('throws 400 when offer is already ACCEPTED', async () => {
            const haulageOffersRepo = createStubRepo();
            haulageOffersRepo.findById.resolves(makeHaulageOffer({ status: HaulageOfferStatus.ACCEPTED }));
            const svc = buildSvc({ haulageOffersRepo });

            await expect(
                svc.withdrawHaulageOffer(1, makeUserProfile()),
            ).to.be.rejectedWith(/already been accepted/i);
        });

        it('sets status to WITHDRAWN and returns success', async () => {
            const haulageOffersRepo = createStubRepo();
            const existing = makeHaulageOffer({ status: HaulageOfferStatus.PENDING });
            const withdrawn = { ...existing, status: HaulageOfferStatus.WITHDRAWN };
            haulageOffersRepo.findById
                .onFirstCall().resolves(existing)
                .onSecondCall().resolves(withdrawn);
            haulageOffersRepo.updateById.resolves();
            const svc = buildSvc({ haulageOffersRepo });

            const result = await svc.withdrawHaulageOffer(1, makeUserProfile());

            expect(haulageOffersRepo.updateById.calledWith(
                1,
                sinon.match({ status: HaulageOfferStatus.WITHDRAWN }),
            )).to.be.true();
            expect(result.status).to.equal('success');
        });

        it('can withdraw REJECTED offers', async () => {
            const haulageOffersRepo = createStubRepo();
            const existing = makeHaulageOffer({ status: HaulageOfferStatus.REJECTED });
            haulageOffersRepo.findById
                .onFirstCall().resolves(existing)
                .onSecondCall().resolves({ ...existing, status: HaulageOfferStatus.WITHDRAWN });
            haulageOffersRepo.updateById.resolves();
            const svc = buildSvc({ haulageOffersRepo });

            const result = await svc.withdrawHaulageOffer(1, makeUserProfile());

            expect(result.status).to.equal('success');
        });
    });

    // ── getHaulageOfferById ────────────────────────────────────────────────────
    describe('getHaulageOfferById()', () => {
        function makeExecuteRepo(rows: any[]): any {
            const repo = createStubRepo();
            (repo as any).execute = sinon.stub().resolves(rows);
            return repo;
        }

        it('throws NotFound when no rows returned', async () => {
            const haulageOffersRepo = makeExecuteRepo([]);
            const svc = buildSvc({ haulageOffersRepo });

            await expect(
                svc.getHaulageOfferById(999, makeUserProfile()),
            ).to.be.rejectedWith(/not found/i);
        });

        it('throws 403 when haulier company does not match currentUser company', async () => {
            const row = {
                id: 1,
                haulier_company_id: 99, // different from user's companyId=50
                offer_id: 10,
                haulier_user_id: 1,
                trailer_container_type: 'standard',
                completing_customs_clearance: true,
                number_of_loads: 2,
                quantity_per_load: 5,
                haulage_cost_per_load: 100,
                currency: ECurrency.GBP,
                customs_fee: 0,
                haulage_total: 200,
                transport_provider: 'FastTrans',
                suggested_collection_date: new Date(),
                expected_transit_time: '3 days',
                demurrage_at_destination: 21,
                status: HaulageOfferStatus.PENDING,
            };
            const haulageOffersRepo = makeExecuteRepo([row]);
            const svc = buildSvc({ haulageOffersRepo });

            await expect(
                svc.getHaulageOfferById(1, makeUserProfile({ companyId: 50 })),
            ).to.be.rejectedWith(/only view your own/i);
        });

        it('returns formatted haulage offer data when ownership matches', async () => {
            const row: any = {
                id: 1,
                haulier_company_id: 50,
                offer_id: 10,
                haulier_user_id: 1,
                trailer_container_type: 'standard',
                completing_customs_clearance: true,
                number_of_loads: 2,
                quantity_per_load: 5,
                haulage_cost_per_load: 100,
                currency: ECurrency.GBP,
                customs_fee: 0,
                haulage_total: 200,
                transport_provider: 'FastTrans',
                suggested_collection_date: new Date(),
                expected_transit_time: '3 days',
                demurrage_at_destination: 21,
                status: HaulageOfferStatus.PENDING,
                material_type: 'Plastic',
                material_item: 'Bottles',
                material_form: null,
                material_grading: null,
                material_color: null,
                material_finishing: null,
                material_packing: null,
                material_weight_per_unit: null,
                weight_per_load: null,
                waste_storation: null,
                listing_id: 20,
                listing_title: 'Test Listing',
                seller_location_id: null,
                buyer_location_id: null,
                seller_office_open_time: null,
                seller_office_close_time: null,
                buyer_office_open_time: null,
                buyer_office_close_time: null,
                seller_access_restrictions: null,
                buyer_access_restrictions: null,
                seller_address_line_1: null,
                buyer_address_line_1: null,
                seller_company_id: 5,
                seller_company_name: 'SellerCo',
                seller_company_country: 'GB',
                seller_city: 'London',
                seller_postal_code: 'SW1A',
                buyer_company_id: 6,
                buyer_company_name: 'BuyerCo',
                buyer_company_country: 'DE',
                buyer_city: 'Berlin',
                buyer_postal_code: '10115',
                seller_user_id: 7,
                buyer_user_id: 8,
                seller_username: 'seller1',
                buyer_username: 'buyer1',
                offer_quantity: 2,
                earliest_delivery_date: null,
                latest_delivery_date: null,
                offered_price_per_unit: 50,
                offer_currency: ECurrency.GBP,
                offer_total_price: 100,
                offer_incoterms: 'CIF',
                notes: null,
                created_at: new Date(),
                updated_at: new Date(),
            };
            const haulageOffersRepo = makeExecuteRepo([row]);
            const svc = buildSvc({ haulageOffersRepo });

            const result = await svc.getHaulageOfferById(1, makeUserProfile({ companyId: 50 }));

            expect(result.status).to.equal('success');
            const data = result.data as any;
            expect(data.id).to.equal(1);
            expect(data.materialName).to.equal('Plastic-Bottles');
        });

        it('uses N/A for materialName when material_type is null', async () => {
            const row: any = {
                id: 2,
                haulier_company_id: 50,
                offer_id: 10,
                material_type: null,
                material_item: null,
                seller_location_id: null,
                buyer_location_id: null,
                seller_office_open_time: null,
                seller_office_close_time: null,
                buyer_office_open_time: null,
                buyer_office_close_time: null,
                seller_access_restrictions: null,
                buyer_access_restrictions: null,
                earliest_delivery_date: null,
                latest_delivery_date: null,
            };
            const haulageOffersRepo = makeExecuteRepo([row]);
            const svc = buildSvc({ haulageOffersRepo });

            const result = await svc.getHaulageOfferById(2, makeUserProfile({ companyId: 50 }));

            expect((result.data as any).materialName).to.equal('N/A');
        });
    });

    // ── syncHaulageOfferDocumentsFromSalesforce ────────────────────────────────
    describe('syncHaulageOfferDocumentsFromSalesforce()', () => {
        it('returns immediately when no salesforceService injected', async () => {
            const svc = buildSvc(); // no salesforceService
            // Should resolve without error
            await svc.syncHaulageOfferDocumentsFromSalesforce(1);
        });

        it('logs SUCCESS with 0 docs when Salesforce returns empty array', async () => {
            const salesforceSyncLogRepo = createStubRepo();
            salesforceSyncLogRepo.create.resolves({});

            const salesforceService = {
                queryHaulageOfferDocuments: sinon.stub().resolves([]),
                buildDocumentDownloadUrl: sinon.stub().returns('https://sf.example.com/doc'),
            };

            const svc = buildSvc({ salesforceSyncLogRepo });
            (svc as any).salesforceService = salesforceService;

            await svc.syncHaulageOfferDocumentsFromSalesforce(5);

            expect(salesforceSyncLogRepo.create.calledOnce).to.be.true();
            const logArg = salesforceSyncLogRepo.create.firstCall.args[0];
            expect(logArg.status).to.equal('SUCCESS');
            expect(logArg.objectType).to.equal('HaulageOfferDocuments');
        });

        it('creates new documents when they do not exist in DB', async () => {
            const salesforceSyncLogRepo = createStubRepo();
            salesforceSyncLogRepo.create.resolves({});

            const haulageOfferDocsRepo = createStubRepo();
            haulageOfferDocsRepo.findOne.resolves(null); // not existing
            haulageOfferDocsRepo.create.resolves({ id: 10 });

            const salesforceService = {
                queryHaulageOfferDocuments: sinon.stub().resolves([
                    { Id: 'sf-doc-1', Title: 'Invoice 1' },
                ]),
                buildDocumentDownloadUrl: sinon.stub().returns('https://sf.example.com/doc/sf-doc-1'),
            };

            const svc = buildSvc({ haulageOfferDocsRepo, salesforceSyncLogRepo });
            (svc as any).salesforceService = salesforceService;

            await svc.syncHaulageOfferDocumentsFromSalesforce(5);

            expect(haulageOfferDocsRepo.create.calledOnce).to.be.true();
            const createArg = haulageOfferDocsRepo.create.firstCall.args[0];
            expect(createArg.salesforceId).to.equal('sf-doc-1');
            expect(createArg.documentTitle).to.equal('Invoice 1');
        });

        it('updates existing documents when they already exist in DB', async () => {
            const salesforceSyncLogRepo = createStubRepo();
            salesforceSyncLogRepo.create.resolves({});

            const haulageOfferDocsRepo = createStubRepo();
            haulageOfferDocsRepo.findOne.resolves({ id: 99, salesforceId: 'sf-doc-2' }); // exists
            haulageOfferDocsRepo.updateById.resolves();

            const salesforceService = {
                queryHaulageOfferDocuments: sinon.stub().resolves([
                    { Id: 'sf-doc-2', Title: 'Updated Invoice' },
                ]),
                buildDocumentDownloadUrl: sinon.stub().returns('https://sf.example.com/doc/sf-doc-2'),
            };

            const svc = buildSvc({ haulageOfferDocsRepo, salesforceSyncLogRepo });
            (svc as any).salesforceService = salesforceService;

            await svc.syncHaulageOfferDocumentsFromSalesforce(5);

            expect(haulageOfferDocsRepo.updateById.calledWith(99, sinon.match({ documentTitle: 'Updated Invoice' }))).to.be.true();
        });

        it('logs FAILED and continues when SF query throws', async () => {
            const salesforceSyncLogRepo = createStubRepo();
            salesforceSyncLogRepo.create.resolves({});

            const salesforceService = {
                queryHaulageOfferDocuments: sinon.stub().rejects(new Error('SF connection failed')),
                buildDocumentDownloadUrl: sinon.stub(),
            };

            const svc = buildSvc({ salesforceSyncLogRepo });
            (svc as any).salesforceService = salesforceService;

            // Should not throw
            await svc.syncHaulageOfferDocumentsFromSalesforce(5);

            expect(salesforceSyncLogRepo.create.calledOnce).to.be.true();
            const logArg = salesforceSyncLogRepo.create.firstCall.args[0];
            expect(logArg.status).to.equal('FAILED');
            expect(logArg.errorMessage).to.match(/SF connection failed/);
        });
    });

    // ── getApprovedHauliersForAdmin ────────────────────────────────────────────
    describe('getApprovedHauliersForAdmin()', () => {
        it('throws 403 when caller is not an admin', async () => {
            const svc = buildSvc();

            await expect(
                svc.getApprovedHauliersForAdmin(makeUserProfile({ globalRole: UserRoleEnum.USER })),
            ).to.be.rejectedWith(/admin|forbidden|unauthorized/i);
        });

        it('returns paginated list without search filter', async () => {
            const companyUsersRepo = createStubRepo();
            companyUsersRepo.dataSource = {
                execute: sinon.stub()
                    .onFirstCall().resolves([{ totalCount: 2 }])
                    .onSecondCall().resolves([
                        { userId: 1, firstName: 'Alice', lastName: 'Smith', email: 'a@t.com', companyId: 10, companyName: 'Co1', containerTypes: ['standard'] },
                        { userId: 2, firstName: 'Bob', lastName: 'Jones', email: 'b@t.com', companyId: 20, companyName: 'Co2', containerTypes: null },
                    ]),
            };
            const svc = buildSvc({ companyUsersRepo });

            const result = await svc.getApprovedHauliersForAdmin(makeAdminProfile(), { skip: 0, limit: 20 });

            expect(result.status).to.equal('success');
            expect((result.data as any).totalCount).to.equal(2);
            expect((result.data as any).results).to.have.length(2);
        });

        it('applies search parameter to SQL query', async () => {
            const executeSpy = sinon.stub()
                .onFirstCall().resolves([{ totalCount: 1 }])
                .onSecondCall().resolves([
                    { userId: 3, firstName: 'Carol', lastName: 'White', email: 'c@t.com', companyId: 30, companyName: 'Co3', containerTypes: [] },
                ]);
            const companyUsersRepo = createStubRepo();
            companyUsersRepo.dataSource = { execute: executeSpy };
            const svc = buildSvc({ companyUsersRepo });

            const result = await svc.getApprovedHauliersForAdmin(makeAdminProfile(), { search: 'carol', skip: 0, limit: 10 });

            expect(result.status).to.equal('success');
            // Verify search param was passed to the second execute call
            const secondCallArgs = executeSpy.secondCall.args;
            expect(JSON.stringify(secondCallArgs)).to.match(/carol/i);
        });

        it('defaults containerTypes to empty array when null in DB', async () => {
            const companyUsersRepo = createStubRepo();
            companyUsersRepo.dataSource = {
                execute: sinon.stub()
                    .onFirstCall().resolves([{ totalCount: 1 }])
                    .onSecondCall().resolves([
                        { userId: 4, firstName: 'D', lastName: 'D', email: 'd@t.com', companyId: 40, companyName: 'Co4', containerTypes: null },
                    ]),
            };
            const svc = buildSvc({ companyUsersRepo });

            const result = await svc.getApprovedHauliersForAdmin(makeAdminProfile());

            const row = (result.data as any).results[0];
            expect(row.containerTypes).to.deepEqual([]);
        });
    });

    // ── getMyHaulageOffers ─────────────────────────────────────────────────────
    describe('getMyHaulageOffers()', () => {
        it('returns paginated formatted results', async () => {
            const row: any = {
                id: 1,
                offer_id: 10,
                listing_id: 20,
                haulier_company_id: 50,
                haulier_user_id: 1,
                trailer_container_type: 'standard',
                completing_customs_clearance: true,
                number_of_loads: 2,
                quantity_per_load: 5,
                material_weight_per_unit: null,
                haulage_cost_per_load: 100,
                currency: ECurrency.GBP,
                customs_fee: 0,
                haulage_total: 200,
                transport_provider: 'FastTrans',
                suggested_collection_date: new Date(),
                expected_transit_time: '3 days',
                demurrage_at_destination: 21,
                notes: null,
                status: HaulageOfferStatus.PENDING,
                created_at: new Date(),
                updated_at: new Date(),
                material_type: 'Plastic',
                material_item: 'Bottles',
                material_form: null,
                material_grading: null,
                material_color: null,
                material_finishing: null,
                material_packing: null,
                seller_company_id: 5,
                seller_company_name: 'SellerCo',
                seller_company_country: 'GB',
                buyer_company_id: 6,
                buyer_company_name: 'BuyerCo',
                buyer_company_country: 'DE',
                seller_location_id: null,
                buyer_location_id: null,
                offer_quantity: 2,
                earliest_delivery_date: null,
                latest_delivery_date: null,
                offered_price_per_unit: 50,
                offer_currency: ECurrency.GBP,
            };

            const haulageOffersRepo = createStubRepo();
            (haulageOffersRepo as any).execute = sinon.stub()
                .onFirstCall().resolves([row])
                .onSecondCall().resolves([{ total: '1' }]);
            const svc = buildSvc({ haulageOffersRepo });

            const result = await svc.getMyHaulageOffers(makeUserProfile(), { skip: 0, limit: 10 });

            expect(result.status).to.equal('success');
            expect((result.data as any).totalCount).to.equal(1);
            const items = (result.data as any).results;
            expect(items).to.have.length(1);
            expect(items[0].materialName).to.equal('Plastic-Bottles');
        });

        it('filters by status when filter.where.status is provided', async () => {
            const executeSpy = sinon.stub()
                .onFirstCall().resolves([])
                .onSecondCall().resolves([{ total: '0' }]);
            const haulageOffersRepo = createStubRepo();
            (haulageOffersRepo as any).execute = executeSpy;
            const svc = buildSvc({ haulageOffersRepo });

            await svc.getMyHaulageOffers(makeUserProfile(), { skip: 0, limit: 10, where: { status: HaulageOfferStatus.APPROVED } });

            const firstCallSql = executeSpy.firstCall.args[0] as string;
            expect(firstCallSql).to.match(/approved/i);
        });

        it('handles empty results with zero total count', async () => {
            const haulageOffersRepo = createStubRepo();
            (haulageOffersRepo as any).execute = sinon.stub()
                .onFirstCall().resolves([])
                .onSecondCall().resolves([{ total: '0' }]);
            const svc = buildSvc({ haulageOffersRepo });

            const result = await svc.getMyHaulageOffers(makeUserProfile(), {});

            expect((result.data as any).totalCount).to.equal(0);
            expect((result.data as any).results).to.have.length(0);
        });
    });
});
