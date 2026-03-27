/**
 * salesforce-webhook.service-4.unit.ts
 * Coverage for: processListingStatusUpdate, processOfferStatusUpdate
 * loop-prevention, missing-id, not-found, stale-update branches.
 */
import { expect, sinon } from '@loopback/testlab';
import { SalesforceWebhookService } from '../../services/salesforce/salesforce-webhook.service';
import { UserStatus } from '../../enum/user.enum';
import { CompanyStatus } from '../../enum/company.enum';
import { CompanyUserStatusEnum } from '../../enum/company-users.enum';

const PAST = new Date('2020-01-01').toISOString();
const FUTURE = new Date(Date.now() + 60_000).toISOString();

function buildService(overrides: Record<string, any> = {}) {
    const haulageOffersRepo = {
        findById: sinon.stub().resolves({ id: 1, status: 'pending', numberOfLoads: 2, updatedAt: new Date(PAST) }),
        findOne: sinon.stub().resolves(null),
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
        findOne: sinon.stub().resolves({ id: 10, userId: 1, companyId: 1, status: CompanyUserStatusEnum.PENDING }),
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
    };
    const companyDocsRepo = { updateAll: sinon.stub().resolves({ count: 0 }) };
    const locationDocsRepo = { updateAll: sinon.stub().resolves({ count: 0 }) };
    const locationsRepo = {
        find: sinon.stub().resolves([]),
        findOne: sinon.stub().resolves(null),
    };
    const listingsRepo = {
        findById: sinon.stub().resolves({ id: 1, status: 'available', updatedAt: new Date(PAST) }),
        find: sinon.stub().resolves([]),
        updateById: sinon.stub().resolves(),
    };
    const offersRepo = {
        findById: sinon.stub().resolves({ id: 1, status: 'pending', updatedAt: new Date(PAST) }),
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

    return { service, listingsRepo, offersRepo, syncLogRepo };
}

describe('SalesforceWebhookService (unit) - part 4', () => {

    describe('processListingStatusUpdate()', () => {
        it('returns loop_prevention when originMarker starts with WT_', async () => {
            const { service } = buildService();

            const result = await service.processListingStatusUpdate({
                listingId: 1,
                updatedAt: FUTURE,
                originMarker: 'WT_sync_12345',
            });

            expect(result.success).to.be.true();
            expect(result.reason).to.equal('loop_prevention');
            expect(result.updated).to.be.false();
        });

        it('returns missing_id when neither listingId nor externalId provided', async () => {
            const { service } = buildService();

            const result = await service.processListingStatusUpdate({
                updatedAt: FUTURE,
            });

            expect(result.success).to.be.false();
            expect(result.reason).to.equal('missing_id');
        });

        it('returns not_found when listing does not exist', async () => {
            const listingsRepo = {
                findById: sinon.stub().rejects(new Error('not found')),
                find: sinon.stub().resolves([]),
                updateById: sinon.stub().resolves(),
            };
            const { service } = buildService({ listingsRepo });

            const result = await service.processListingStatusUpdate({
                listingId: 9999,
                updatedAt: FUTURE,
            });

            expect(result.success).to.be.false();
            expect(result.reason).to.equal('not_found');
        });

        it('returns stale_event when listing updatedAt is newer than payload', async () => {
            const listingsRepo = {
                findById: sinon.stub().resolves({ id: 1, status: 'available', updatedAt: new Date(FUTURE) }),
                find: sinon.stub().resolves([]),
                updateById: sinon.stub().resolves(),
            };
            const { service } = buildService({ listingsRepo });

            const result = await service.processListingStatusUpdate({
                listingId: 1,
                updatedAt: PAST,
            });

            expect(result.updated).to.be.false();
            expect(result.reason).to.equal('stale_event');
        });

        it('updates listing status when payload is newer', async () => {
            const listingsRepo = {
                findById: sinon.stub().resolves({ id: 1, status: 'available', updatedAt: new Date(PAST) }),
                find: sinon.stub().resolves([]),
                updateById: sinon.stub().resolves(),
            };
            const { service } = buildService({ listingsRepo });

            const result = await service.processListingStatusUpdate({
                listingId: 1,
                status: 'Approved',
                updatedAt: FUTURE,
            });

            expect(result.success).to.be.true();
            expect(result.updated).to.be.true();
        });

        it('resolves listingId from numeric externalId string', async () => {
            const listingsRepo = {
                findById: sinon.stub().resolves({ id: 42, status: 'available', updatedAt: new Date(PAST) }),
                find: sinon.stub().resolves([]),
                updateById: sinon.stub().resolves(),
            };
            const { service } = buildService({ listingsRepo });

            // extractWasteTradeId strips env prefix then parseInt — plain number works
            const result = await service.processListingStatusUpdate({
                externalId: '42',
                updatedAt: FUTURE,
            });

            expect(result.success).to.be.true();
        });
    });

    describe('processOfferStatusUpdate()', () => {
        it('returns loop_prevention when originMarker starts with WT_', async () => {
            const { service } = buildService();

            const result = await service.processOfferStatusUpdate({
                offerId: 1,
                updatedAt: FUTURE,
                originMarker: 'WT_api_update',
            });

            expect(result.success).to.be.true();
            expect(result.reason).to.equal('loop_prevention');
            expect(result.updated).to.be.false();
        });

        it('returns missing_id when neither offerId nor externalId provided', async () => {
            const { service } = buildService();

            const result = await service.processOfferStatusUpdate({
                updatedAt: FUTURE,
            });

            expect(result.success).to.be.false();
            expect(result.reason).to.equal('missing_id');
        });

        it('returns not_found when offer does not exist', async () => {
            const offersRepo = {
                findById: sinon.stub().rejects(new Error('not found')),
                find: sinon.stub().resolves([]),
                updateById: sinon.stub().resolves(),
            };
            const { service } = buildService({ offersRepo });

            const result = await service.processOfferStatusUpdate({
                offerId: 8888,
                updatedAt: FUTURE,
            });

            expect(result.success).to.be.false();
            expect(result.reason).to.equal('not_found');
        });

        it('returns stale_event when offer updatedAt is newer than payload', async () => {
            const offersRepo = {
                findById: sinon.stub().resolves({ id: 1, status: 'pending', updatedAt: new Date(FUTURE) }),
                find: sinon.stub().resolves([]),
                updateById: sinon.stub().resolves(),
            };
            const { service } = buildService({ offersRepo });

            const result = await service.processOfferStatusUpdate({
                offerId: 1,
                updatedAt: PAST,
            });

            expect(result.updated).to.be.false();
            expect(result.reason).to.equal('stale_event');
        });

        it('updates offer when payload is newer', async () => {
            const offersRepo = {
                findById: sinon.stub().resolves({ id: 1, status: 'pending', updatedAt: new Date(PAST) }),
                find: sinon.stub().resolves([]),
                updateById: sinon.stub().resolves(),
            };
            const { service } = buildService({ offersRepo });

            const result = await service.processOfferStatusUpdate({
                offerId: 1,
                status: 'Accepted',
                updatedAt: FUTURE,
            });

            expect(result.success).to.be.true();
            expect(result.updated).to.be.true();
        });

        it('resolves offerId from numeric externalId string', async () => {
            const offersRepo = {
                findById: sinon.stub().resolves({ id: 77, status: 'pending', updatedAt: new Date(PAST) }),
                find: sinon.stub().resolves([]),
                updateById: sinon.stub().resolves(),
            };
            const { service } = buildService({ offersRepo });

            // extractWasteTradeId strips env prefix then parseInt — plain number works
            const result = await service.processOfferStatusUpdate({
                externalId: '77',
                updatedAt: FUTURE,
            });

            expect(result.success).to.be.true();
        });
    });
});
