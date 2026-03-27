/**
 * salesforce-webhook.service-5.unit.ts
 * Targets uncovered branches: field-mapping optional fields, materialLocation,
 * contactUpdate non-writable fields + memberStatus notifications,
 * haulageOfferStatusUpdate string-numeric parsing, handleLoadUpdate fallbacks,
 * processListingStatusUpdate no_changes + extended fields.
 */
import { expect, sinon } from '@loopback/testlab';
import { SalesforceWebhookService } from '../../services/salesforce/salesforce-webhook.service';
import { UserStatus } from '../../enum/user.enum';
import { CompanyStatus } from '../../enum/company.enum';
import { CompanyUserStatusEnum } from '../../enum/company-users.enum';
import { HaulageOfferStatus } from '../../enum/haulage-offer.enum';
import { ListingStatus } from '../../enum/listing.enum';
import { OfferStatusEnum } from '../../enum/offer.enum';

const PAST = new Date('2020-01-01').toISOString();
const FUTURE = new Date(Date.now() + 60_000).toISOString();

function buildService(overrides: Record<string, any> = {}) {
    const haulageOffersRepo = {
        findById: sinon.stub().resolves({
            id: 1, status: HaulageOfferStatus.ACCEPTED, numberOfLoads: 3,
            customsFee: 100, updatedAt: new Date(PAST),
        }),
        updateById: sinon.stub().resolves(),
        find: sinon.stub().resolves([]),
    };
    const haulageOfferDocsRepo = {
        findOne: sinon.stub().resolves(null),
        create: sinon.stub().resolves({ id: 1 }),
        find: sinon.stub().resolves([]),
        deleteById: sinon.stub().resolves(),
    };
    const companiesRepo = {
        findById: sinon.stub().resolves({ id: 1, name: 'ACME', status: CompanyStatus.PENDING, updatedAt: new Date(PAST) }),
        find: sinon.stub().resolves([]),
        updateById: sinon.stub().resolves(),
    };
    const userRepo = {
        findById: sinon.stub().resolves({
            id: 1, firstName: 'Jane', lastName: 'Doe', email: 'j@test.com',
            status: UserStatus.PENDING, updatedAt: new Date(PAST),
        }),
        updateById: sinon.stub().resolves(),
        find: sinon.stub().resolves([]),
    };
    const companyUsersRepo = {
        findOne: sinon.stub().resolves({ id: 10, userId: 1, companyId: 1, status: CompanyUserStatusEnum.PENDING, isPrimaryContact: false }),
        findById: sinon.stub().resolves({ id: 10 }),
        find: sinon.stub().resolves([]),
        updateById: sinon.stub().resolves(),
        updateAll: sinon.stub().resolves({ count: 1 }),
    };
    const syncLogRepo = {
        create: sinon.stub().resolves({ id: 1 }),
        find: sinon.stub().resolves([]),
    };
    const haulageLoadsRepo = {
        findById: sinon.stub().resolves({ id: 1, haulageOfferId: 1, updatedAt: new Date(PAST) }),
        find: sinon.stub().resolves([]),
        updateById: sinon.stub().resolves(),
        count: sinon.stub().resolves({ count: 1 }),
    };
    const companyDocsRepo = { updateAll: sinon.stub().resolves({ count: 0 }) };
    const locationDocsRepo = { updateAll: sinon.stub().resolves({ count: 0 }) };
    const locationsRepo = {
        find: sinon.stub().resolves([]),
        findOne: sinon.stub().resolves(null),
    };
    const listingsRepo = {
        findById: sinon.stub().resolves({ id: 1, status: ListingStatus.AVAILABLE, companyId: 5, updatedAt: new Date(PAST) }),
        find: sinon.stub().resolves([]),
        updateById: sinon.stub().resolves(),
    };
    const offersRepo = {
        findById: sinon.stub().resolves({ id: 1, status: OfferStatusEnum.PENDING, updatedAt: new Date(PAST) }),
        find: sinon.stub().resolves([]),
        updateById: sinon.stub().resolves(),
    };
    const emailService = {
        sendAccountVerificationApprovedEmail: sinon.stub().resolves(),
        sendCompanyRequestInformationEmail: sinon.stub().resolves(),
        sendAccountVerificationRejectedEmail: sinon.stub().resolves(),
        sendCompanyRejectedEmail: sinon.stub().resolves(),
    };
    const notifService = { createNotification: sinon.stub().resolves() };

    const service = new SalesforceWebhookService(
        overrides.haulageOffersRepo ?? haulageOffersRepo as any,
        overrides.haulageOfferDocsRepo ?? haulageOfferDocsRepo as any,
        overrides.companiesRepo ?? companiesRepo as any,
        overrides.userRepo ?? userRepo as any,
        overrides.companyUsersRepo ?? companyUsersRepo as any,
        overrides.syncLogRepo ?? syncLogRepo as any,
        overrides.haulageLoadsRepo ?? haulageLoadsRepo as any,
        overrides.companyDocsRepo ?? companyDocsRepo as any,
        overrides.locationDocsRepo ?? locationDocsRepo as any,
        overrides.locationsRepo ?? locationsRepo as any,
        overrides.listingsRepo ?? listingsRepo as any,
        overrides.offersRepo ?? offersRepo as any,
        overrides.emailService ?? emailService as any,
        overrides.notifService ?? notifService as any,
        undefined,
    );

    return {
        service, haulageOffersRepo, haulageOfferDocsRepo, companiesRepo,
        userRepo, companyUsersRepo, syncLogRepo, haulageLoadsRepo,
        companyDocsRepo, locationDocsRepo, locationsRepo,
        listingsRepo, offersRepo, emailService, notifService,
    };
}

describe('SalesforceWebhookService (unit) - part 5', () => {

    // ── processHaulageOfferStatusUpdate: string numeric parsing ──────────────
    describe('processHaulageOfferStatusUpdate - string numeric fields', () => {
        it('parses haulageCostPerLoad when provided as string', async () => {
            const { service, haulageOffersRepo } = buildService();
            haulageOffersRepo.findById.resolves({
                id: 1, status: HaulageOfferStatus.PENDING, numberOfLoads: 2,
                customsFee: 50, updatedAt: new Date(PAST),
            });
            const result = await service.processHaulageOfferStatusUpdate({
                haulageOfferId: 1,
                status: 'Approved',
                haulageCostPerLoad: '200.50' as any,
                updatedAt: FUTURE,
            });
            expect(result.success).to.be.true();
            const updateArgs = haulageOffersRepo.updateById.firstCall.args[1];
            expect(updateArgs.haulageCostPerLoad).to.equal(200.50);
            // haulageTotal recalculated: 200.50 * 2 + 50 = 451
            expect(updateArgs.haulageTotal).to.be.approximately(451, 0.01);
        });

        it('ignores haulageCostPerLoad when NaN string', async () => {
            const { service, haulageOffersRepo } = buildService();
            haulageOffersRepo.findById.resolves({
                id: 1, status: HaulageOfferStatus.PENDING, numberOfLoads: 2,
                customsFee: 0, updatedAt: new Date(PAST),
            });
            const result = await service.processHaulageOfferStatusUpdate({
                haulageOfferId: 1,
                status: 'Approved',
                haulageCostPerLoad: 'not-a-number' as any,
                updatedAt: FUTURE,
            });
            expect(result.success).to.be.true();
            const updateArgs = haulageOffersRepo.updateById.firstCall.args[1];
            expect(updateArgs.haulageCostPerLoad).to.be.undefined();
        });

        it('uses SF haulageTotal when haulageCostPerLoad not set', async () => {
            const { service, haulageOffersRepo } = buildService();
            haulageOffersRepo.findById.resolves({
                id: 1, status: HaulageOfferStatus.PENDING, numberOfLoads: 2,
                customsFee: 0, updatedAt: new Date(PAST),
            });
            const result = await service.processHaulageOfferStatusUpdate({
                haulageOfferId: 1,
                status: 'Approved',
                haulageTotal: '500.00' as any,
                updatedAt: FUTURE,
            });
            expect(result.success).to.be.true();
            const updateArgs = haulageOffersRepo.updateById.firstCall.args[1];
            expect(updateArgs.haulageTotal).to.equal(500.00);
        });

        it('maps optional extended fields (notes, numberOfLoads, customsFee)', async () => {
            const { service, haulageOffersRepo } = buildService();
            haulageOffersRepo.findById.resolves({
                id: 1, status: HaulageOfferStatus.PENDING, numberOfLoads: 2,
                customsFee: 0, updatedAt: new Date(PAST),
            });
            const result = await service.processHaulageOfferStatusUpdate({
                haulageOfferId: 1,
                status: 'Approved',
                notes: 'Test notes',
                numberOfLoads: 5,
                customsFee: 200,
                updatedAt: FUTURE,
            });
            expect(result.success).to.be.true();
            const updateArgs = haulageOffersRepo.updateById.firstCall.args[1];
            expect(updateArgs.notes).to.equal('Test notes');
            expect(updateArgs.numberOfLoads).to.equal(5);
            expect(updateArgs.customsFee).to.equal(200);
        });

        it('maps destinationCharges, haulageExtras, soDetails fields', async () => {
            const { service, haulageOffersRepo } = buildService();
            haulageOffersRepo.findById.resolves({
                id: 1, status: HaulageOfferStatus.PENDING, numberOfLoads: 2,
                customsFee: 0, updatedAt: new Date(PAST),
            });
            const result = await service.processHaulageOfferStatusUpdate({
                haulageOfferId: 1,
                status: 'Approved',
                destinationCharges: 'DH-123',
                haulageExtras: 'Extra fee',
                soDetails: 'SO-456',
                updatedAt: FUTURE,
            });
            expect(result.success).to.be.true();
            const updateArgs = haulageOffersRepo.updateById.firstCall.args[1];
            expect(updateArgs.destinationCharges).to.equal('DH-123');
            expect(updateArgs.haulageExtras).to.equal('Extra fee');
            expect(updateArgs.soDetails).to.equal('SO-456');
        });
    });

    // ── processListingStatusUpdate: extended fields ───────────────────────────
    describe('processListingStatusUpdate - extended fields', () => {
        it('updates rejectionReason, numberOfLoads fields', async () => {
            const { service, listingsRepo } = buildService();
            listingsRepo.findById.resolves({ id: 1, status: ListingStatus.AVAILABLE, companyId: 5, updatedAt: new Date(PAST) });
            const result = await service.processListingStatusUpdate({
                listingId: 1,
                rejectionReason: 'Policy violation',
                numberOfLoads: 10,
                updatedAt: FUTURE,
            });
            expect(result.success).to.be.true();
            expect(result.updated).to.be.true();
            const updateArgs = listingsRepo.updateById.firstCall.args[1];
            expect(updateArgs.rejectionReason).to.equal('Policy violation');
            expect(updateArgs.numberOfLoads).to.equal(10);
        });

        it('maps packagingType and storageType to lowercase', async () => {
            const { service, listingsRepo } = buildService();
            listingsRepo.findById.resolves({ id: 1, status: ListingStatus.AVAILABLE, companyId: 5, updatedAt: new Date(PAST) });
            await service.processListingStatusUpdate({
                listingId: 1,
                packagingType: 'Bags',
                storageType: 'Indoor',
                updatedAt: FUTURE,
            });
            const updateArgs = listingsRepo.updateById.firstCall.args[1];
            expect(updateArgs.materialPacking).to.equal('bags');
            expect(updateArgs.wasteStoration).to.equal('indoor');
        });

        it('maps materialType field', async () => {
            const { service, listingsRepo } = buildService();
            listingsRepo.findById.resolves({ id: 1, status: ListingStatus.AVAILABLE, companyId: 5, updatedAt: new Date(PAST) });
            await service.processListingStatusUpdate({
                listingId: 1,
                materialType: 'Plastic',
                updatedAt: FUTURE,
            });
            const updateArgs = listingsRepo.updateById.firstCall.args[1];
            expect(updateArgs.materialType).to.equal('plastic');
        });

        it('falls back to materialGroup when materialType absent', async () => {
            const { service, listingsRepo } = buildService();
            listingsRepo.findById.resolves({ id: 1, status: ListingStatus.AVAILABLE, companyId: 5, updatedAt: new Date(PAST) });
            await service.processListingStatusUpdate({
                listingId: 1,
                materialGroup: 'Metals',
                updatedAt: FUTURE,
            });
            const updateArgs = listingsRepo.updateById.firstCall.args[1];
            expect(updateArgs.materialType).to.equal('metals');
        });

        it('maps material and pricePerTonne fields', async () => {
            const { service, listingsRepo } = buildService();
            listingsRepo.findById.resolves({ id: 1, status: ListingStatus.AVAILABLE, companyId: 5, updatedAt: new Date(PAST) });
            await service.processListingStatusUpdate({
                listingId: 1,
                material: 'Copper',
                pricePerTonne: 1500,
                updatedAt: FUTURE,
            });
            const updateArgs = listingsRepo.updateById.firstCall.args[1];
            expect(updateArgs.materialItem).to.equal('Copper');
            expect(updateArgs.pricePerMetricTonne).to.equal(1500);
        });

        it('falls back to indicatedPrice when pricePerTonne absent', async () => {
            const { service, listingsRepo } = buildService();
            listingsRepo.findById.resolves({ id: 1, status: ListingStatus.AVAILABLE, companyId: 5, updatedAt: new Date(PAST) });
            await service.processListingStatusUpdate({
                listingId: 1,
                indicatedPrice: 800,
                updatedAt: FUTURE,
            });
            const updateArgs = listingsRepo.updateById.firstCall.args[1];
            expect(updateArgs.pricePerMetricTonne).to.equal(800);
        });

        it('sets locationId when materialLocation resolves to a company location', async () => {
            const locationsRepo = {
                find: sinon.stub().resolves([]),
                findOne: sinon.stub().resolves({ id: 42, locationName: 'Warehouse A' }),
            };
            const { service, listingsRepo } = buildService({ locationsRepo });
            listingsRepo.findById.resolves({ id: 1, status: ListingStatus.AVAILABLE, companyId: 5, updatedAt: new Date(PAST) });
            await service.processListingStatusUpdate({
                listingId: 1,
                materialLocation: 'Warehouse A',
                updatedAt: FUTURE,
            });
            const updateArgs = listingsRepo.updateById.firstCall.args[1];
            expect(updateArgs.locationId).to.equal(42);
        });

        it('skips locationId when materialLocation cannot be resolved', async () => {
            const { service, listingsRepo, locationsRepo } = buildService();
            listingsRepo.findById.resolves({ id: 1, status: ListingStatus.AVAILABLE, companyId: 5, updatedAt: new Date(PAST) });
            locationsRepo.findOne.resolves(null);
            // No location found — field should not be set, but other fields still update
            const result = await service.processListingStatusUpdate({
                listingId: 1,
                description: 'Test',
                materialLocation: 'Unknown Place',
                updatedAt: FUTURE,
            });
            expect(result.success).to.be.true();
            const updateArgs = listingsRepo.updateById.firstCall.args[1];
            expect(updateArgs.locationId).to.be.undefined();
        });

        it('returns no_changes when no mapped fields provided', async () => {
            const { service, listingsRepo } = buildService();
            listingsRepo.findById.resolves({ id: 1, status: ListingStatus.AVAILABLE, companyId: 5, updatedAt: new Date(PAST) });
            const result = await service.processListingStatusUpdate({
                listingId: 1,
                updatedAt: FUTURE,
                // No status, no description, no other mapped fields
            });
            expect(result.success).to.be.true();
            expect(result.reason).to.equal('no_changes');
            expect(listingsRepo.updateById.called).to.be.false();
        });

        it('maps availableFromDate to startDate', async () => {
            const { service, listingsRepo } = buildService();
            listingsRepo.findById.resolves({ id: 1, status: ListingStatus.AVAILABLE, companyId: 5, updatedAt: new Date(PAST) });
            const dateStr = '2026-06-01T00:00:00.000Z';
            await service.processListingStatusUpdate({
                listingId: 1,
                availableFromDate: dateStr,
                updatedAt: FUTURE,
            });
            const updateArgs = listingsRepo.updateById.firstCall.args[1];
            expect(updateArgs.startDate).to.be.instanceof(Date);
        });
    });

    // ── processContactUpdate: non-writable fields + memberStatus ─────────────
    describe('processContactUpdate - extra branches', () => {
        it('throws BadRequest when non-writable fields in fieldsUpdated', async () => {
            const { service } = buildService();
            let threw = false;
            try {
                await service.processContactUpdate({
                    contactId: 'C001',
                    externalId: '1',
                    updatedAt: FUTURE,
                    fieldsUpdated: ['WasteTrade_User_Id__c'],
                });
            } catch {
                threw = true;
            }
            expect(threw).to.be.true();
        });

        it('finds user by email fallback when findById returns null', async () => {
            const userRepo = {
                findById: sinon.stub().resolves(null),
                find: sinon.stub().resolves([{ id: 1, firstName: 'John', lastName: 'Doe', updatedAt: new Date(PAST) }]),
                updateById: sinon.stub().resolves(),
            };
            const { service } = buildService({ userRepo });
            const result = await service.processContactUpdate({
                contactId: 'C001',
                externalId: '1',
                email: 'john@test.com',
                firstName: 'Updated',
                updatedAt: FUTURE,
            });
            expect(result.success).to.be.true();
            expect(userRepo.find.called).to.be.true();
        });

        it('sends ACCOUNT_VERIFIED notification when memberStatus changes to ACTIVE', async () => {
            const companyUsersRepo = {
                findOne: sinon.stub().resolves({ id: 10, userId: 1, companyId: 1, status: CompanyUserStatusEnum.PENDING, isPrimaryContact: false }),
                findById: sinon.stub().resolves({ id: 10 }),
                find: sinon.stub().resolves([]),
                updateById: sinon.stub().resolves(),
                updateAll: sinon.stub().resolves({ count: 0 }),
            };
            const { service, notifService } = buildService({ companyUsersRepo });
            const result = await service.processContactUpdate({
                contactId: 'C001',
                externalId: '1',
                accountExternalId: '1',
                memberStatus: 'Active',
                updatedAt: FUTURE,
            });
            expect(result.success).to.be.true();
            expect(notifService.createNotification.called).to.be.true();
        });
    });

    // ── handleLoadUpdate: haulageOfferId+loadNumber fallback ─────────────────
    describe('handleLoadUpdate - extra lookup paths', () => {
        it('finds load by haulageOfferId + loadNumber when other methods fail', async () => {
            const haulageLoadsRepo = {
                findById: sinon.stub().rejects(new Error('not found')),
                find: sinon.stub()
                    .onFirstCall().resolves([]) // salesforceId lookup
                    .onSecondCall().resolves([{ id: 5, haulageOfferId: 2, loadNumber: 'L01', updatedAt: new Date(PAST) }]),
                updateById: sinon.stub().resolves(),
                count: sinon.stub().resolves({ count: 0 }),
            };
            const { service } = buildService({ haulageLoadsRepo });
            const result = await service.handleLoadUpdate({
                loadId: 999,
                salesforceId: 'SF_LOAD_XYZ',
                haulageOfferId: 2,
                loadNumber: 'L01',
                updatedAt: FUTURE,
            });
            expect(result.status).to.equal('success');
        });

        it('updates collectionDate and palletWeight fields', async () => {
            const { service, haulageLoadsRepo } = buildService();
            const result = await service.handleLoadUpdate({
                loadId: 1,
                collectionDate: '2026-05-01T00:00:00.000Z',
                palletWeight: '1200',
                updatedAt: FUTURE,
            });
            expect(result.updated).to.be.true();
            const updateArgs = haulageLoadsRepo.updateById.firstCall.args[1];
            expect(updateArgs.palletWeight).to.equal(1200);
            expect(updateArgs.collectionDate).to.be.instanceof(Date);
        });
    });
});
