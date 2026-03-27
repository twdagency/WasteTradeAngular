/**
 * listing.service-6.unit.ts
 * Coverage-focused tests for listing.service.ts (Part 6)
 * Targets: getListings filter branches, validateMaterialTypeAndProperties,
 *          validateListingDetails Phase 2 fields, createListing weight/load calc,
 *          sanitizeInput, generateWantedStatusSqlConditions paths.
 */
import { expect, sinon } from '@loopback/testlab';
import { ListingService } from '../../services/listing.service';
import {
    ListingState,
    ListingStatus,
    ListingType,
    MaterialType,
    PlasticForms,
    PlasticGradings,
    PlasticItems,
    FibreItems,
    FibreGradings,
    MetalItems,
    RubberItems,
    RenewalPeriod,
    ListingSortBy,
    WasteStoration,
} from '../../enum';
import { createStubRepo, createStubService } from '../helpers/stub-factory';

function buildSvc(overrides: Record<string, any> = {}): ListingService {
    const exchangeRateService = overrides.exchangeRateService ?? {
        convertListingToBaseCurrency: sinon.stub().resolves({}),
        convertOfferToBaseCurrency: sinon.stub().resolves({ offeredPricePerUnit: 100, totalPrice: 1000 }),
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
        overrides.emailService ?? createStubService(['sendListingCreatedEmail', 'sendListingRejectionEmail', 'sendListingRequestInformationEmail', 'sendListingStatusUpdatedEmail', 'sendListingRenewedEmail', 'sendAdminNotification']),
        listingExpiryService as any,
        exchangeRateService as any,
        overrides.notificationsService ?? createStubService(['createNotification']),
    );
}

function makeListingRow(overrides: Record<string, any> = {}): any {
    return {
        id: 1,
        companyId: 10,
        listingType: 'sell',
        status: ListingStatus.AVAILABLE,
        state: ListingState.APPROVED,
        country: 'GB',
        ...overrides,
    };
}

describe('ListingService extended coverage - Part 6 (unit)', () => {

    // ── getListings filter branches ────────────────────────────────────────────
    describe('getListings() — filter branches', () => {
        it('returns paginated listings with no filters (public)', async () => {
            const listingRepo = createStubRepo();
            listingRepo.dataSource.execute = sinon.stub()
                .onFirstCall().resolves([makeListingRow()])
                .onSecondCall().resolves([{ count: '1' }]);
            const exchangeRateService = {
                convertListingToBaseCurrency: sinon.stub().resolves({ pricePerMetricTonne: 50, currency: 'gbp' }),
                baseCurrencyCode: 'gbp',
            };
            const svc = buildSvc({ listingRepo, exchangeRateService });

            const result = await svc.getListings({});

            expect(result.results).to.be.an.Array();
            expect(Number(result.totalCount)).to.equal(1);
        });

        /** Stub that returns rows for the listing query (call 1) and count row for the count query (call 2) */
        function makeExecuteStub(rows: any[] = []): sinon.SinonStub {
            return sinon.stub()
                .onFirstCall().resolves(rows)
                .onSecondCall().resolves([{ count: String(rows.length) }]);
        }

        it('applies searchTerm filter and country iso lookup', async () => {
            const listingRepo = createStubRepo();
            listingRepo.dataSource.execute = makeExecuteStub();
            const exchangeRateService = { convertListingToBaseCurrency: sinon.stub().resolves({}), baseCurrencyCode: 'gbp' };
            const svc = buildSvc({ listingRepo, exchangeRateService });

            await svc.getListings({ filter: { where: { searchTerm: 'plastic' } as any } });

            const sqlArg = listingRepo.dataSource.execute.firstCall.args[0] as string;
            expect(sqlArg).to.containEql('ILIKE');
        });

        it('applies listingType filter', async () => {
            const listingRepo = createStubRepo();
            listingRepo.dataSource.execute = makeExecuteStub();
            const svc = buildSvc({ listingRepo });

            await svc.getListings({ filter: { where: { listingType: ListingType.WANTED } as any } });

            const sql = listingRepo.dataSource.execute.firstCall.args[0] as string;
            expect(sql).to.containEql("listing_type = 'wanted'");
        });

        it('applies materialType filter as array', async () => {
            const listingRepo = createStubRepo();
            listingRepo.dataSource.execute = makeExecuteStub();
            const svc = buildSvc({ listingRepo });

            await svc.getListings({ filter: { where: { materialType: ['plastic', 'metal'] } as any } });

            const sql = listingRepo.dataSource.execute.firstCall.args[0] as string;
            expect(sql).to.containEql('IN');
        });

        it('applies materialType filter as string', async () => {
            const listingRepo = createStubRepo();
            listingRepo.dataSource.execute = makeExecuteStub();
            const svc = buildSvc({ listingRepo });

            await svc.getListings({ filter: { where: { materialType: 'plastic' } as any } });

            const sql = listingRepo.dataSource.execute.firstCall.args[0] as string;
            expect(sql).to.containEql("material_type = 'plastic'");
        });

        it('applies materialItem filter as array', async () => {
            const listingRepo = createStubRepo();
            listingRepo.dataSource.execute = makeExecuteStub();
            const svc = buildSvc({ listingRepo });

            await svc.getListings({ filter: { where: { materialItem: ['hdpe', 'ldpe'] } as any } });

            const sql = listingRepo.dataSource.execute.firstCall.args[0] as string;
            expect(sql).to.containEql('material_item IN');
        });

        it('applies materialPacking filter as string', async () => {
            const listingRepo = createStubRepo();
            listingRepo.dataSource.execute = makeExecuteStub();
            const svc = buildSvc({ listingRepo });

            await svc.getListings({ filter: { where: { materialPacking: 'baled' } as any } });

            const sql = listingRepo.dataSource.execute.firstCall.args[0] as string;
            expect(sql).to.containEql("material_packing = 'baled'");
        });

        it('applies status filter as string', async () => {
            const listingRepo = createStubRepo();
            listingRepo.dataSource.execute = makeExecuteStub();
            const svc = buildSvc({ listingRepo });

            await svc.getListings({ filter: { where: { status: 'available' } as any } });

            const sql = listingRepo.dataSource.execute.firstCall.args[0] as string;
            expect(sql).to.containEql("l.status = 'available'");
        });

        it('applies status.neq filter', async () => {
            const listingRepo = createStubRepo();
            listingRepo.dataSource.execute = makeExecuteStub();
            const svc = buildSvc({ listingRepo });

            await svc.getListings({ filter: { where: { status: { neq: 'sold' } } as any } });

            const sql = listingRepo.dataSource.execute.firstCall.args[0] as string;
            expect(sql).to.containEql("l.status != 'sold'");
        });

        it('applies status.in array filter', async () => {
            const listingRepo = createStubRepo();
            listingRepo.dataSource.execute = makeExecuteStub();
            const svc = buildSvc({ listingRepo });

            await svc.getListings({ filter: { where: { status: { in: ['available', 'pending'] } } as any } });

            const sql = listingRepo.dataSource.execute.firstCall.args[0] as string;
            expect(sql).to.containEql("l.status IN");
        });

        it('applies status.nin array filter', async () => {
            const listingRepo = createStubRepo();
            listingRepo.dataSource.execute = makeExecuteStub();
            const svc = buildSvc({ listingRepo });

            await svc.getListings({ filter: { where: { status: { nin: ['sold', 'rejected'] } } as any } });

            const sql = listingRepo.dataSource.execute.firstCall.args[0] as string;
            expect(sql).to.containEql("l.status NOT IN");
        });

        it('applies wantedStatus filter (array)', async () => {
            const listingRepo = createStubRepo();
            listingRepo.dataSource.execute = makeExecuteStub();
            const svc = buildSvc({ listingRepo });

            await svc.getListings({ filter: { where: { wantedStatus: ['Pending', 'Rejected'] } as any } });

            const sql = listingRepo.dataSource.execute.firstCall.args[0] as string;
            expect(sql).to.containEql('wanted');
        });

        it('applies wantedStatus filter (single string)', async () => {
            const listingRepo = createStubRepo();
            listingRepo.dataSource.execute = makeExecuteStub();
            const svc = buildSvc({ listingRepo });

            await svc.getListings({ filter: { where: { wantedStatus: 'Fulfilled' } as any } });

            const sql = listingRepo.dataSource.execute.firstCall.args[0] as string;
            expect(sql).to.containEql('closed');
        });

        it('applies country filter for SELL listing type as single string', async () => {
            const listingRepo = createStubRepo();
            listingRepo.dataSource.execute = makeExecuteStub();
            const svc = buildSvc({ listingRepo });

            await svc.getListings({ filter: { where: { country: 'GB', listingType: ListingType.SELL } as any } });

            const sql = listingRepo.dataSource.execute.firstCall.args[0] as string;
            expect(sql).to.containEql('cl.country');
        });

        it('applies country filter for SELL listing type as array', async () => {
            const listingRepo = createStubRepo();
            listingRepo.dataSource.execute = makeExecuteStub();
            const svc = buildSvc({ listingRepo });

            await svc.getListings({ filter: { where: { country: ['GB', 'FR'], listingType: ListingType.SELL } as any } });

            const sql = listingRepo.dataSource.execute.firstCall.args[0] as string;
            expect(sql).to.containEql('cl.country');
        });

        it('applies country filter for non-SELL listing type as array', async () => {
            const listingRepo = createStubRepo();
            listingRepo.dataSource.execute = makeExecuteStub();
            const svc = buildSvc({ listingRepo });

            await svc.getListings({ filter: { where: { country: ['GB', 'FR'], listingType: ListingType.WANTED } as any } });

            const sql = listingRepo.dataSource.execute.firstCall.args[0] as string;
            expect(sql).to.containEql('l.country');
        });

        it('applies showFullfilledListing=true for owner (userId provided)', async () => {
            const listingRepo = createStubRepo();
            listingRepo.dataSource.execute = makeExecuteStub();
            const svc = buildSvc({ listingRepo });

            await svc.getListings({ filter: { where: { showFullfilledListing: true } as any } }, 1);

            const sql = listingRepo.dataSource.execute.firstCall.args[0] as string;
            expect(sql).to.containEql('sold');
        });

        it('applies showFullfilledListing=false for owner', async () => {
            const listingRepo = createStubRepo();
            listingRepo.dataSource.execute = makeExecuteStub();
            const svc = buildSvc({ listingRepo });

            await svc.getListings({ filter: { where: { showFullfilledListing: false } as any } }, 1);

            const sql = listingRepo.dataSource.execute.firstCall.args[0] as string;
            expect(sql).to.containEql("'pending'");
        });

        it('applies wasteStoration=indoor filter', async () => {
            const listingRepo = createStubRepo();
            listingRepo.dataSource.execute = makeExecuteStub();
            const svc = buildSvc({ listingRepo });

            await svc.getListings({ filter: { where: { wasteStoration: WasteStoration.INDOOR } as any } });

            const sql = listingRepo.dataSource.execute.firstCall.args[0] as string;
            expect(sql).to.containEql('waste_storation');
        });

        it('applies sortBy CREATED_AT_ASC', async () => {
            const listingRepo = createStubRepo();
            listingRepo.dataSource.execute = makeExecuteStub();
            const svc = buildSvc({ listingRepo });

            await svc.getListings({ filter: { where: { sortBy: ListingSortBy.CREATED_AT_ASC } as any } });

            const sql = listingRepo.dataSource.execute.firstCall.args[0] as string;
            expect(sql).to.containEql('ASC');
        });

        it('applies sortBy COUNTRY_ASC (requires company_locations join)', async () => {
            const listingRepo = createStubRepo();
            listingRepo.dataSource.execute = makeExecuteStub();
            const svc = buildSvc({ listingRepo });

            await svc.getListings({ filter: { where: { sortBy: ListingSortBy.COUNTRY_ASC } as any } });

            const sql = listingRepo.dataSource.execute.firstCall.args[0] as string;
            expect(sql).to.containEql('cl.country');
        });

        it('applies sortBy AVAILABLE_LISTINGS_ASC', async () => {
            const listingRepo = createStubRepo();
            listingRepo.dataSource.execute = makeExecuteStub();
            const svc = buildSvc({ listingRepo });

            await svc.getListings({ filter: { where: { sortBy: ListingSortBy.AVAILABLE_LISTINGS_ASC } as any } });

            const sql = listingRepo.dataSource.execute.firstCall.args[0] as string;
            expect(sql).to.containEql('CASE');
        });
    });

    // ── validateMaterialTypeAndProperties ─────────────────────────────────────
    describe('validateMaterialTypeAndProperties() via createListing()', () => {
        it('throws for METAL with invalid materialItem', async () => {
            const svc = buildSvc();

            await expect(
                svc.createListing({
                    documents: [],
                    listingType: ListingType.SELL,
                    materialType: MaterialType.METAL,
                    materialItem: 'invalid_metal',
                    quantity: 10,
                    currency: 'gbp',
                    companyId: 10,
                } as any, '1')
            ).to.be.rejectedWith(/metal/i);
        });

        it('throws for METAL when materialForm is provided', async () => {
            const svc = buildSvc();

            await expect(
                svc.createListing({
                    documents: [],
                    listingType: ListingType.SELL,
                    materialType: MaterialType.METAL,
                    materialItem: MetalItems.FF,
                    materialForm: 'sheet',
                    quantity: 10,
                    currency: 'gbp',
                    companyId: 10,
                } as any, '1')
            ).to.be.rejectedWith(/metal/i);
        });

        it('throws for RUBBER with invalid materialItem', async () => {
            const svc = buildSvc();

            await expect(
                svc.createListing({
                    documents: [],
                    listingType: ListingType.SELL,
                    materialType: MaterialType.RUBBER,
                    materialItem: 'invalid_rubber',
                    quantity: 10,
                    currency: 'gbp',
                    companyId: 10,
                } as any, '1')
            ).to.be.rejectedWith(/rubber/i);
        });

        it('throws for FIBRE when materialForm is provided', async () => {
            const svc = buildSvc();

            await expect(
                svc.createListing({
                    documents: [],
                    listingType: ListingType.SELL,
                    materialType: MaterialType.FIBRE,
                    materialItem: FibreItems.MULTI_PRINTING,
                    materialGrading: FibreGradings.HIGH,
                    materialForm: 'baled',
                    quantity: 10,
                    currency: 'gbp',
                    companyId: 10,
                } as any, '1')
            ).to.be.rejectedWith(/fibre/i);
        });

        it('throws for PLASTIC with invalid materialItem', async () => {
            const svc = buildSvc();

            await expect(
                svc.createListing({
                    documents: [],
                    listingType: ListingType.SELL,
                    materialType: MaterialType.PLASTIC,
                    materialItem: 'invalid_item',
                    materialGrading: PlasticGradings.GRADE_6,
                    materialForm: PlasticForms.BAGS,
                    quantity: 10,
                    currency: 'gbp',
                    companyId: 10,
                } as any, '1')
            ).to.be.rejectedWith(/plastic/i);
        });

        it('passes valid PLASTIC listing through validation', async () => {
            const listingRepo = createStubRepo();
            listingRepo.create = sinon.stub().resolves({ id: 1, listingType: ListingType.SELL });
            const listingDocsRepo = createStubRepo(['find', 'findById', 'findOne', 'create', 'updateById', 'updateAll', 'count', 'deleteById', 'deleteAll']);
            listingDocsRepo.create.resolves({ id: 1 });
            const companyUsersRepo = createStubRepo();
            companyUsersRepo.find.resolves([]);
            const companyRepo = createStubRepo();
            companyRepo.find.resolves([]);
            const svc = buildSvc({ listingRepo, listingDocsRepo, companyUsersRepo, companyRepo });

            const result = await svc.createListing({
                documents: [],
                listingType: ListingType.SELL,
                materialType: MaterialType.PLASTIC,
                materialItem: PlasticItems.HDPE,
                materialGrading: PlasticGradings.GRADE_6,
                materialForm: PlasticForms.BAGS,
                quantity: 10,
                currency: 'gbp',
                companyId: 10,
            } as any, '1');

            expect(result.status).to.equal('success');
        });
    });

    // ── validateListingDetails Phase 2 ────────────────────────────────────────
    describe('validateListingDetails() — Phase 2 fields', () => {
        it('throws when totalWeight < 3', async () => {
            const svc = buildSvc();

            await expect(
                svc.createListing({
                    documents: [],
                    listingType: ListingType.SELL,
                    materialType: MaterialType.EFW,
                    quantity: 10,
                    currency: 'gbp',
                    companyId: 10,
                    totalWeight: 2,
                } as any, '1')
            ).to.be.rejectedWith(/3 metric/i);
        });

        it('throws when numberOfLoads < 1', async () => {
            const svc = buildSvc();

            await expect(
                svc.createListing({
                    documents: [],
                    listingType: ListingType.SELL,
                    materialType: MaterialType.EFW,
                    quantity: 10,
                    currency: 'gbp',
                    companyId: 10,
                    numberOfLoads: 0,
                } as any, '1')
            ).to.be.rejectedWith(/loads.*1|1.*load/i);
        });

        it('throws for invalid listingRenewalPeriod', async () => {
            const svc = buildSvc();

            await expect(
                svc.createListing({
                    documents: [],
                    listingType: ListingType.SELL,
                    materialType: MaterialType.EFW,
                    quantity: 10,
                    currency: 'gbp',
                    companyId: 10,
                    listingRenewalPeriod: 'invalid_period',
                } as any, '1')
            ).to.be.rejectedWith(/renewal/i);
        });

        it('computes totalWeight from materialWeight + kg weightUnit', async () => {
            const listingRepo = createStubRepo();
            let createdData: any;
            listingRepo.create = sinon.stub().callsFake((data: any) => {
                createdData = data;
                return Promise.resolve({ id: 1, listingType: ListingType.SELL, ...data });
            });
            const listingDocsRepo = createStubRepo(['find', 'findById', 'findOne', 'create', 'updateById', 'updateAll', 'count', 'deleteById', 'deleteAll']);
            listingDocsRepo.create.resolves({ id: 1 });
            const companyRepo = createStubRepo();
            companyRepo.find.resolves([]);
            const companyUsersRepo = createStubRepo();
            companyUsersRepo.find.resolves([]);
            const svc = buildSvc({ listingRepo, listingDocsRepo, companyRepo, companyUsersRepo });

            await svc.createListing({
                documents: [],
                listingType: ListingType.SELL,
                materialType: MaterialType.EFW,
                quantity: 10,
                currency: 'gbp',
                companyId: 10,
                materialWeight: 5000,
                weightUnit: 'kg',
            } as any, '1');

            expect(createdData.totalWeight).to.equal(5); // 5000 kg = 5 MT
        });

        it('computes totalWeight from materialWeight + lbs weightUnit', async () => {
            const listingRepo = createStubRepo();
            let createdData: any;
            listingRepo.create = sinon.stub().callsFake((data: any) => {
                createdData = data;
                return Promise.resolve({ id: 1, listingType: ListingType.SELL, ...data });
            });
            const listingDocsRepo = createStubRepo(['find', 'findById', 'findOne', 'create', 'updateById', 'updateAll', 'count', 'deleteById', 'deleteAll']);
            listingDocsRepo.create.resolves({ id: 1 });
            const companyRepo = createStubRepo();
            companyRepo.find.resolves([]);
            const companyUsersRepo = createStubRepo();
            companyUsersRepo.find.resolves([]);
            const svc = buildSvc({ listingRepo, listingDocsRepo, companyRepo, companyUsersRepo });

            await svc.createListing({
                documents: [],
                listingType: ListingType.SELL,
                materialType: MaterialType.EFW,
                quantity: 10,
                currency: 'gbp',
                companyId: 10,
                materialWeight: 22046.2263,
                weightUnit: 'lbs',
            } as any, '1');

            // 22046.2263 lbs ≈ 10 MT (within tolerance)
            expect(createdData.totalWeight).to.approximately(10, 0.01);
        });

        it('computes totalWeight from quantity * materialWeightPerUnit', async () => {
            const listingRepo = createStubRepo();
            let createdData: any;
            listingRepo.create = sinon.stub().callsFake((data: any) => {
                createdData = data;
                return Promise.resolve({ id: 1, listingType: ListingType.SELL, ...data });
            });
            const listingDocsRepo = createStubRepo(['find', 'findById', 'findOne', 'create', 'updateById', 'updateAll', 'count', 'deleteById', 'deleteAll']);
            listingDocsRepo.create.resolves({ id: 1 });
            const companyRepo = createStubRepo();
            companyRepo.find.resolves([]);
            const companyUsersRepo = createStubRepo();
            companyUsersRepo.find.resolves([]);
            const svc = buildSvc({ listingRepo, listingDocsRepo, companyRepo, companyUsersRepo });

            await svc.createListing({
                documents: [],
                listingType: ListingType.SELL,
                materialType: MaterialType.EFW,
                quantity: 4,
                materialWeightPerUnit: 3,
                currency: 'gbp',
                companyId: 10,
            } as any, '1');

            expect(createdData.totalWeight).to.equal(12);
        });

        it('calculates weightPerLoad from totalWeight / numberOfLoads', async () => {
            const listingRepo = createStubRepo();
            let createdData: any;
            listingRepo.create = sinon.stub().callsFake((data: any) => {
                createdData = data;
                return Promise.resolve({ id: 1, listingType: ListingType.SELL, ...data });
            });
            const listingDocsRepo = createStubRepo(['find', 'findById', 'findOne', 'create', 'updateById', 'updateAll', 'count', 'deleteById', 'deleteAll']);
            listingDocsRepo.create.resolves({ id: 1 });
            const companyRepo = createStubRepo();
            companyRepo.find.resolves([]);
            const companyUsersRepo = createStubRepo();
            companyUsersRepo.find.resolves([]);
            const svc = buildSvc({ listingRepo, listingDocsRepo, companyRepo, companyUsersRepo });

            await svc.createListing({
                documents: [],
                listingType: ListingType.SELL,
                materialType: MaterialType.EFW,
                quantity: 10,
                currency: 'gbp',
                companyId: 10,
                totalWeight: 30,
                numberOfLoads: 3,
            } as any, '1');

            expect(createdData.weightPerLoad).to.equal(10);
        });

        it('normalizes incoterms to uppercase', async () => {
            const listingRepo = createStubRepo();
            let createdData: any;
            listingRepo.create = sinon.stub().callsFake((data: any) => {
                createdData = data;
                return Promise.resolve({ id: 1, listingType: ListingType.SELL, ...data });
            });
            const listingDocsRepo = createStubRepo(['find', 'findById', 'findOne', 'create', 'updateById', 'updateAll', 'count', 'deleteById', 'deleteAll']);
            listingDocsRepo.create.resolves({ id: 1 });
            const companyRepo = createStubRepo();
            companyRepo.find.resolves([]);
            const companyUsersRepo = createStubRepo();
            companyUsersRepo.find.resolves([]);
            const svc = buildSvc({ listingRepo, listingDocsRepo, companyRepo, companyUsersRepo });

            await svc.createListing({
                documents: [],
                listingType: ListingType.SELL,
                materialType: MaterialType.EFW,
                quantity: 10,
                currency: 'gbp',
                companyId: 10,
                incoterms: 'fob',
            } as any, '1');

            expect(createdData.incoterms).to.equal('FOB');
        });
    });

    // ── validateAdditionalNotes URL block ─────────────────────────────────────
    describe('validateAdditionalNotes() — URL block', () => {
        it('throws when additionalNotes contains a URL', async () => {
            const svc = buildSvc();

            await expect(
                svc.createListing({
                    documents: [],
                    listingType: ListingType.SELL,
                    materialType: MaterialType.EFW,
                    quantity: 10,
                    currency: 'gbp',
                    companyId: 10,
                    additionalNotes: 'Visit https://example.com for more info',
                } as any, '1')
            ).to.be.rejectedWith(/url|website|link/i);
        });
    });

    // ── validateDocuments branches ────────────────────────────────────────────
    describe('validateDocuments()', () => {
        it('throws when document is missing documentType', async () => {
            const svc = buildSvc();

            await expect(
                svc.createListing({
                    documents: [{ documentUrl: 'https://s3.example.com/doc.pdf' }],
                    listingType: ListingType.SELL,
                    materialType: MaterialType.EFW,
                    quantity: 10,
                    currency: 'gbp',
                    companyId: 10,
                } as any, '1')
            ).to.be.rejectedWith(/document.*type|type.*document/i);
        });

        it('throws when document is missing documentUrl', async () => {
            const svc = buildSvc();

            await expect(
                svc.createListing({
                    documents: [{ documentType: 'photo' }],
                    listingType: ListingType.SELL,
                    materialType: MaterialType.EFW,
                    quantity: 10,
                    currency: 'gbp',
                    companyId: 10,
                } as any, '1')
            ).to.be.rejectedWith(/document.*url|url.*document/i);
        });
    });
});
