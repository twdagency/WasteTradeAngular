/**
 * listing.service-8.unit.ts
 * Coverage for: updateListing, renewListing, markListingAsSold,
 *               handleAdminRequestAction, getListingUsersCompanies,
 *               deleteListing
 */
import { expect, sinon } from '@loopback/testlab';
import { ListingService } from '../../services/listing.service';
import {
    ListingState,
    ListingStatus,
    ListingType,
    MaterialType,
    ListingRequestActionEnum,
} from '../../enum';
import { createStubRepo, createStubService } from '../helpers/stub-factory';

function buildSvc(overrides: Record<string, any> = {}): {
    svc: ListingService;
    listingRepo: any;
    listingDocsRepo: any;
    offersRepo: any;
    userRepo: any;
    emailService: any;
    notificationsService: any;
    companyRepo: any;
    companyUsersRepo: any;
} {
    const listingRepo = overrides.listingRepo ?? createStubRepo();
    const listingDocsRepo = overrides.listingDocsRepo ?? createStubRepo(['find', 'findById', 'findOne', 'create', 'updateById', 'updateAll', 'count', 'deleteById', 'deleteAll']);
    const companyRepo = overrides.companyRepo ?? createStubRepo();
    const companyUsersRepo = overrides.companyUsersRepo ?? createStubRepo();
    const companyLocationsRepo = overrides.companyLocationsRepo ?? createStubRepo();
    const userRepo = overrides.userRepo ?? createStubRepo();
    const offersRepo = overrides.offersRepo ?? createStubRepo();
    const emailService = overrides.emailService ?? createStubService([
        'sendListingCreatedEmail', 'sendListingRejectionEmail',
        'sendListingRequestInformationEmail', 'sendListingStatusUpdatedEmail',
        'sendListingRenewedEmail', 'sendAdminNotification',
    ]);
    const listingExpiryService = overrides.listingExpiryService ?? {
        calculateExpiryInfo: sinon.stub().returns({ isExpired: false, isNearingExpiry: false }),
    };
    const exchangeRateService = overrides.exchangeRateService ?? {
        convertListingToBaseCurrency: sinon.stub().resolves({}),
        baseCurrencyCode: 'gbp',
    };
    const notificationsService = overrides.notificationsService ?? createStubService(['createNotification']);

    const svc = new ListingService(
        listingRepo,
        listingDocsRepo,
        companyRepo,
        companyUsersRepo,
        companyLocationsRepo,
        userRepo,
        offersRepo,
        emailService,
        listingExpiryService as any,
        exchangeRateService as any,
        notificationsService,
    );

    return { svc, listingRepo, listingDocsRepo, offersRepo, userRepo, emailService, notificationsService, companyRepo, companyUsersRepo };
}

function makeExistingListing(overrides: any = {}): any {
    return {
        id: 1,
        companyId: 10,
        createdByUserId: 5,
        listingType: ListingType.SELL,
        status: ListingStatus.AVAILABLE,
        state: ListingState.APPROVED,
        country: 'GB',
        totalWeight: 100,
        numberOfLoads: 10,
        ...overrides,
    };
}

describe('ListingService — Part 8 (unit)', () => {

    // ── updateListing ─────────────────────────────────────────────────────
    describe('updateListing()', () => {
        it('throws 404 when listing not found', async () => {
            const { svc, listingRepo } = buildSvc();
            listingRepo.findById.resolves(null);
            await expect(svc.updateListing(999, 5, {})).to.be.rejected();
        });

        it('throws 403 when non-owner non-admin edits', async () => {
            const { svc, listingRepo } = buildSvc();
            listingRepo.findById.resolves(makeExistingListing());
            await expect(svc.updateListing(1, 999, {})).to.be.rejected();
        });

        it('throws 400 when listing is PENDING', async () => {
            const { svc, listingRepo } = buildSvc();
            listingRepo.findById.resolves(makeExistingListing({ status: ListingStatus.PENDING }));
            await expect(svc.updateListing(1, 5, {})).to.be.rejected();
        });

        it('throws 400 when listing is SOLD', async () => {
            const { svc, listingRepo } = buildSvc();
            listingRepo.findById.resolves(makeExistingListing({ status: ListingStatus.SOLD }));
            await expect(svc.updateListing(1, 5, {})).to.be.rejected();
        });

        it('throws 400 when listing is EXPIRED', async () => {
            const { svc, listingRepo } = buildSvc();
            listingRepo.findById.resolves(makeExistingListing({ status: ListingStatus.EXPIRED }));
            await expect(svc.updateListing(1, 5, {})).to.be.rejected();
        });

        it('throws 400 when listing has offers', async () => {
            const { svc, listingRepo, offersRepo } = buildSvc();
            listingRepo.findById.resolves(makeExistingListing());
            offersRepo.count.resolves({ count: 3 });
            await expect(svc.updateListing(1, 5, {})).to.be.rejected();
        });

        it('updates listing successfully with sanitized data', async () => {
            const { svc, listingRepo, offersRepo } = buildSvc();
            const existing = makeExistingListing();
            listingRepo.findById.resolves(existing);
            offersRepo.count.resolves({ count: 0 });
            listingRepo.updateById.resolves();

            const result = await svc.updateListing(1, 5, {
                quantity: 20,
                pricePerMetricTonne: 150,
            } as any);

            expect(listingRepo.updateById.calledOnce).to.be.true();
            expect(result.status).to.equal('success');
        });

        it('recalculates weightPerLoad when totalWeight and numberOfLoads change', async () => {
            const { svc, listingRepo, offersRepo } = buildSvc();
            listingRepo.findById.resolves(makeExistingListing());
            offersRepo.count.resolves({ count: 0 });
            listingRepo.updateById.resolves();

            await svc.updateListing(1, 5, {
                totalWeight: 60,
                numberOfLoads: 3,
            } as any);

            const updateArg = listingRepo.updateById.firstCall.args[1];
            expect(updateArg.weightPerLoad).to.equal(20);
        });

        it('handles endDate field in update data', async () => {
            const { svc, listingRepo, offersRepo } = buildSvc();
            listingRepo.findById.resolves(makeExistingListing());
            offersRepo.count.resolves({ count: 0 });
            listingRepo.updateById.resolves();

            await svc.updateListing(1, 5, {
                endDate: '2026-12-31',
            } as any);

            const updateArg = listingRepo.updateById.firstCall.args[1];
            expect(updateArg.endDate).to.be.instanceOf(Date);
        });

        it('handles listingDuration for backward compatibility', async () => {
            const { svc, listingRepo, offersRepo } = buildSvc();
            listingRepo.findById.resolves(makeExistingListing());
            offersRepo.count.resolves({ count: 0 });
            listingRepo.updateById.resolves();

            await svc.updateListing(1, 5, {
                listingDuration: '2026-12-31',
            } as any);

            const updateArg = listingRepo.updateById.firstCall.args[1];
            expect(updateArg.endDate).to.be.instanceOf(Date);
        });

        it('sets 90-day default when listingRenewalPeriod cleared', async () => {
            const { svc, listingRepo, offersRepo } = buildSvc();
            listingRepo.findById.resolves(makeExistingListing({ startDate: '2026-01-01' }));
            offersRepo.count.resolves({ count: 0 });
            listingRepo.updateById.resolves();

            await svc.updateListing(1, 5, {
                listingRenewalPeriod: '',
            } as any);

            const updateArg = listingRepo.updateById.firstCall.args[1];
            expect(updateArg.endDate).to.be.instanceOf(Date);
        });

        it('clears endDate when listingRenewalPeriod set to ongoing', async () => {
            const { svc, listingRepo, offersRepo } = buildSvc();
            listingRepo.findById.resolves(makeExistingListing());
            offersRepo.count.resolves({ count: 0 });
            listingRepo.updateById.resolves();

            await svc.updateListing(1, 5, {
                listingRenewalPeriod: '2_weeks',
            } as any);

            const updateArg = listingRepo.updateById.firstCall.args[1];
            expect(updateArg.endDate).to.be.null();
        });

        it('replaces documents when provided', async () => {
            const { svc, listingRepo, listingDocsRepo, offersRepo } = buildSvc();
            listingRepo.findById.resolves(makeExistingListing());
            offersRepo.count.resolves({ count: 0 });
            listingRepo.updateById.resolves();
            listingDocsRepo.deleteAll.resolves();
            listingDocsRepo.create.resolves({ id: 1 });

            await svc.updateListing(1, 5, {
                documents: [{ documentType: 'photo', documentUrl: 'https://s3/a.jpg' }],
            } as any);

            expect(listingDocsRepo.deleteAll.calledOnce).to.be.true();
        });

        it('allows admin to edit any listing', async () => {
            const { svc, listingRepo, offersRepo } = buildSvc();
            listingRepo.findById.resolves(makeExistingListing({ createdByUserId: 999 }));
            offersRepo.count.resolves({ count: 0 });
            listingRepo.updateById.resolves();

            const result = await svc.updateListing(1, 1, {}, { globalRole: 'admin' });
            expect(result.status).to.equal('success');
        });

        it('sanitizes NaN numeric fields to undefined', async () => {
            const { svc, listingRepo, offersRepo } = buildSvc();
            listingRepo.findById.resolves(makeExistingListing());
            offersRepo.count.resolves({ count: 0 });
            listingRepo.updateById.resolves();

            await svc.updateListing(1, 5, {
                locationId: 'not-a-number',
                quantity: '',
            } as any);

            const updateArg = listingRepo.updateById.firstCall.args[1];
            expect(updateArg.locationId).to.be.undefined();
        });
    });

    // ── renewListing ──────────────────────────────────────────────────────
    describe('renewListing()', () => {
        it('throws 404 when listing not found', async () => {
            const { svc, listingRepo } = buildSvc();
            listingRepo.findById.resolves(null);
            await expect(svc.renewListing(999, 5, '90_days')).to.be.rejected();
        });

        it('throws 403 when non-owner tries to renew', async () => {
            const { svc, listingRepo } = buildSvc();
            listingRepo.findById.resolves(makeExistingListing());
            await expect(svc.renewListing(1, 999, '90_days')).to.be.rejected();
        });

        it('throws 400 when listing is SOLD', async () => {
            const { svc, listingRepo } = buildSvc();
            listingRepo.findById.resolves(makeExistingListing({ status: ListingStatus.SOLD }));
            await expect(svc.renewListing(1, 5, '90_days')).to.be.rejected();
        });

        it('throws 400 when listing is REJECTED', async () => {
            const { svc, listingRepo } = buildSvc();
            listingRepo.findById.resolves(makeExistingListing({ state: ListingState.REJECTED }));
            await expect(svc.renewListing(1, 5, '90_days')).to.be.rejected();
        });

        it('throws 400 when listing has renewalPeriod (ongoing)', async () => {
            const { svc, listingRepo } = buildSvc();
            listingRepo.findById.resolves(makeExistingListing({ listingRenewalPeriod: '2_weeks' }));
            await expect(svc.renewListing(1, 5, '90_days')).to.be.rejected();
        });

        it('throws 400 when listing not expired and not nearing expiry', async () => {
            const { svc, listingRepo } = buildSvc();
            listingRepo.findById.resolves(makeExistingListing({ listingRenewalPeriod: null }));
            await expect(svc.renewListing(1, 5, '90_days')).to.be.rejected();
        });

        it('renews expired listing with 90_days and sets status to AVAILABLE', async () => {
            const listingExpiryService = {
                calculateExpiryInfo: sinon.stub().returns({ isExpired: true, isNearingExpiry: false }),
            };
            const { svc, listingRepo, userRepo, notificationsService, emailService } = buildSvc({ listingExpiryService });
            listingRepo.findById.resolves(makeExistingListing({
                status: ListingStatus.EXPIRED,
                listingRenewalPeriod: null,
                endDate: '2026-01-01',
            }));
            userRepo.findById.resolves({ id: 5, firstName: 'Jane', lastName: 'Doe', email: 'jane@t.com' });
            listingRepo.updateById.resolves();

            const result = await svc.renewListing(1, 5, '90_days');

            expect(result.status).to.equal('success');
            expect((result.data as any).newEndDate).to.be.a.String();
            expect(listingRepo.updateById.calledOnce).to.be.true();
            const updateArg = listingRepo.updateById.firstCall.args[1];
            expect(updateArg.status).to.equal(ListingStatus.AVAILABLE);
        });

        it('renews nearing-expiry listing with 2_weeks without status change', async () => {
            const listingExpiryService = {
                calculateExpiryInfo: sinon.stub().returns({ isExpired: false, isNearingExpiry: true }),
            };
            const { svc, listingRepo, userRepo } = buildSvc({ listingExpiryService });
            listingRepo.findById.resolves(makeExistingListing({
                listingRenewalPeriod: null,
                endDate: new Date(Date.now() + 3 * 86400000).toISOString(),
            }));
            userRepo.findById.resolves({ id: 5, firstName: 'Jane', email: 'jane@t.com' });
            listingRepo.updateById.resolves();

            const result = await svc.renewListing(1, 5, '2_weeks');

            expect(result.status).to.equal('success');
            const updateArg = listingRepo.updateById.firstCall.args[1];
            expect(updateArg.status).to.be.undefined();
        });

        it('continues without email when user not found', async () => {
            const listingExpiryService = {
                calculateExpiryInfo: sinon.stub().returns({ isExpired: true, isNearingExpiry: false }),
            };
            const { svc, listingRepo, userRepo, emailService } = buildSvc({ listingExpiryService });
            listingRepo.findById.resolves(makeExistingListing({
                status: ListingStatus.EXPIRED,
                listingRenewalPeriod: null,
            }));
            userRepo.findById.rejects(new Error('User not found'));
            listingRepo.updateById.resolves();

            const result = await svc.renewListing(1, 5, '90_days');

            expect(result.status).to.equal('success');
            expect(emailService.sendListingRenewedEmail.called).to.be.false();
        });
    });

    // ── markListingAsSold ─────────────────────────────────────────────────
    describe('markListingAsSold()', () => {
        it('throws 404 when listing not found', async () => {
            const { svc, listingRepo } = buildSvc();
            listingRepo.findById.resolves(null);
            await expect(svc.markListingAsSold(999, 5)).to.be.rejected();
        });

        it('throws 403 when non-owner marks as sold', async () => {
            const { svc, listingRepo } = buildSvc();
            listingRepo.findById.resolves(makeExistingListing());
            await expect(svc.markListingAsSold(1, 999)).to.be.rejected();
        });

        it('throws 400 when already sold', async () => {
            const { svc, listingRepo } = buildSvc();
            listingRepo.findById.resolves(makeExistingListing({ status: ListingStatus.SOLD }));
            await expect(svc.markListingAsSold(1, 5)).to.be.rejected();
        });

        it('throws 400 when not approved', async () => {
            const { svc, listingRepo } = buildSvc();
            listingRepo.findById.resolves(makeExistingListing({ state: ListingState.PENDING }));
            await expect(svc.markListingAsSold(1, 5)).to.be.rejected();
        });

        it('throws 400 when not available', async () => {
            const { svc, listingRepo } = buildSvc();
            listingRepo.findById.resolves(makeExistingListing({ status: ListingStatus.PENDING }));
            await expect(svc.markListingAsSold(1, 5)).to.be.rejected();
        });

        it('marks listing as sold and rejects pending offers', async () => {
            const { svc, listingRepo, offersRepo } = buildSvc();
            listingRepo.findById.resolves(makeExistingListing());
            listingRepo.updateById.resolves();
            offersRepo.find.resolves([
                { id: 10, status: 'pending' },
                { id: 11, status: 'approved' },
            ]);
            offersRepo.updateById.resolves();

            const result = await svc.markListingAsSold(1, 5);

            expect(result.status).to.equal('success');
            expect(listingRepo.updateById.calledOnce).to.be.true();
            expect(offersRepo.updateById.calledTwice).to.be.true();
        });

        it('succeeds with no pending offers', async () => {
            const { svc, listingRepo, offersRepo } = buildSvc();
            listingRepo.findById.resolves(makeExistingListing());
            listingRepo.updateById.resolves();
            offersRepo.find.resolves([]);

            const result = await svc.markListingAsSold(1, 5);

            expect(result.status).to.equal('success');
            expect(offersRepo.updateById.called).to.be.false();
        });
    });

    // ── handleAdminRequestAction ──────────────────────────────────────────
    describe('handleAdminRequestAction()', () => {
        it('throws 404 when listing not found', async () => {
            const { svc, listingRepo } = buildSvc();
            listingRepo.findById.resolves(null);
            await expect(svc.handleAdminRequestAction(999, 'accept')).to.be.rejected();
        });

        it('throws 400 when listing already available', async () => {
            const { svc, listingRepo } = buildSvc();
            listingRepo.findById.resolves(makeExistingListing({ status: ListingStatus.AVAILABLE }));
            await expect(svc.handleAdminRequestAction(1, 'accept')).to.be.rejected();
        });

        it('throws 400 when listing already rejected', async () => {
            const { svc, listingRepo } = buildSvc();
            listingRepo.findById.resolves(makeExistingListing({ status: ListingStatus.REJECTED }));
            await expect(svc.handleAdminRequestAction(1, 'accept')).to.be.rejected();
        });

        it('throws 400 when listing already sold', async () => {
            const { svc, listingRepo } = buildSvc();
            listingRepo.findById.resolves(makeExistingListing({ status: ListingStatus.SOLD }));
            await expect(svc.handleAdminRequestAction(1, 'accept')).to.be.rejected();
        });

        it('accepts listing — sets AVAILABLE+APPROVED, sends notification+email', async () => {
            const { svc, listingRepo, userRepo, notificationsService, emailService } = buildSvc();
            listingRepo.findById.resolves(makeExistingListing({ status: ListingStatus.PENDING, state: ListingState.PENDING }));
            listingRepo.updateById.resolves();
            userRepo.findById.resolves({ id: 5, firstName: 'Jane', email: 'jane@t.com' });

            await svc.handleAdminRequestAction(1, ListingRequestActionEnum.ACCEPT);

            expect(listingRepo.updateById.called).to.be.true();
            expect(notificationsService.createNotification.called).to.be.true();
            expect(emailService.sendListingStatusUpdatedEmail.calledOnce).to.be.true();
        });

        it('rejects listing — sets REJECTED, sends rejection email', async () => {
            const { svc, listingRepo, userRepo, emailService } = buildSvc();
            listingRepo.findById.resolves(makeExistingListing({ status: ListingStatus.PENDING, state: ListingState.PENDING }));
            listingRepo.updateById.resolves();
            userRepo.findById.resolves({ id: 5, firstName: 'Jane', email: 'jane@t.com' });

            await svc.handleAdminRequestAction(1, ListingRequestActionEnum.REJECT, {
                rejectionReason: 'Bad quality',
            });

            expect(emailService.sendListingRejectionEmail.calledOnce).to.be.true();
        });

        it('request_information — sets PENDING, sends info-request email', async () => {
            const { svc, listingRepo, userRepo, emailService } = buildSvc();
            listingRepo.findById.resolves(makeExistingListing({ status: ListingStatus.PENDING, state: ListingState.PENDING }));
            listingRepo.updateById.resolves();
            userRepo.findById.resolves({ id: 5, firstName: 'Jane', email: 'jane@t.com' });

            await svc.handleAdminRequestAction(1, ListingRequestActionEnum.REQUEST_INFORMATION, {
                message: 'Need more photos',
            });

            expect(emailService.sendListingRequestInformationEmail.calledOnce).to.be.true();
        });

        it('skips emails when user not found', async () => {
            const { svc, listingRepo, userRepo, emailService } = buildSvc();
            listingRepo.findById.resolves(makeExistingListing({ status: ListingStatus.PENDING, state: ListingState.PENDING }));
            listingRepo.updateById.resolves();
            userRepo.findById.rejects(new Error('Not found'));

            await svc.handleAdminRequestAction(1, ListingRequestActionEnum.REJECT, {
                rejectionReason: 'Bad',
            });

            expect(emailService.sendListingRejectionEmail.called).to.be.false();
        });
    });

    // ── deleteListing ─────────────────────────────────────────────────────
    describe('deleteListing()', () => {
        it('throws 404 when listing not found', async () => {
            const { svc, listingRepo } = buildSvc();
            listingRepo.findById.resolves(null);
            await expect(svc.deleteListing(999, '5')).to.be.rejected();
        });

        it('throws 403 when non-owner deletes', async () => {
            const { svc, listingRepo } = buildSvc();
            listingRepo.findById.resolves(makeExistingListing());
            await expect(svc.deleteListing(1, '999')).to.be.rejected();
        });
    });

    // ── getListingUsersCompanies ──────────────────────────────────────────
    describe('getListingUsersCompanies()', () => {
        it('returns companies for SELL listing type', async () => {
            const listingRepo = createStubRepo();
            listingRepo.dataSource.execute = sinon.stub().resolves([
                { id: 1, name: 'ACME', country: 'GB', first_name: 'John', last_name: 'Doe', username: 'jdoe' },
            ]);
            const { svc } = buildSvc({ listingRepo });

            const result = await svc.getListingUsersCompanies(ListingType.SELL);

            expect(result.companies).to.have.length(1);
            const sql = listingRepo.dataSource.execute.firstCall.args[0] as string;
            expect(sql).to.containEql('cl.country');
        });

        it('returns companies for WANTED listing type', async () => {
            const listingRepo = createStubRepo();
            listingRepo.dataSource.execute = sinon.stub().resolves([
                { id: 2, name: 'BetaCo', country: 'FR', first_name: 'Jane', last_name: 'Doe', username: 'jdoe2' },
            ]);
            const { svc } = buildSvc({ listingRepo });

            const result = await svc.getListingUsersCompanies(ListingType.WANTED);

            expect(result.companies).to.have.length(1);
            const sql = listingRepo.dataSource.execute.firstCall.args[0] as string;
            expect(sql).to.containEql('l.country');
        });

        it('returns empty array when no results', async () => {
            const listingRepo = createStubRepo();
            listingRepo.dataSource.execute = sinon.stub().resolves(null);
            const { svc } = buildSvc({ listingRepo });

            const result = await svc.getListingUsersCompanies(ListingType.SELL);

            expect(result.companies).to.be.an.Array();
            expect(result.companies).to.have.length(0);
        });
    });

    // ── getAdminListingById ───────────────────────────────────────────────
    describe('getAdminListingById()', () => {
        it('throws 404 when listing not found', async () => {
            const listingRepo = createStubRepo();
            listingRepo.dataSource.execute = sinon.stub().resolves([]);
            const listingDocsRepo = createStubRepo(['find', 'findById', 'findOne', 'create', 'updateById', 'updateAll', 'count', 'deleteById', 'deleteAll']);
            listingDocsRepo.find.resolves([]);
            const { svc } = buildSvc({ listingRepo, listingDocsRepo });

            await expect(svc.getAdminListingById(999)).to.be.rejected();
        });

        it('returns listing data with documents', async () => {
            const listingRepo = createStubRepo();
            listingRepo.dataSource.execute = sinon.stub().resolves([{
                id: 1,
                company_id: 10,
                listing_type: 'sell',
                status: 'available',
                state: 'approved',
                material_type: 'plastic',
                first_name: 'John',
                last_name: 'Doe',
                user_email: 'john@t.com',
                username: 'jdoe',
                number_of_offers: '3',
                best_offer: 100,
                best_offer_currency: 'gbp',
            }]);
            const listingDocsRepo = createStubRepo(['find', 'findById', 'findOne', 'create', 'updateById', 'updateAll', 'count', 'deleteById', 'deleteAll']);
            listingDocsRepo.find.resolves([
                { id: 1, documentType: 'feature_image', documentUrl: 'https://s3/img.jpg' },
                { id: 2, documentType: 'photo', documentUrl: 'https://s3/p1.jpg' },
            ]);
            const { svc } = buildSvc({ listingRepo, listingDocsRepo });

            const result = await svc.getAdminListingById(1);

            expect(result.status).to.equal('success');
            expect((result.data as any).documents.all).to.have.length(2);
        });
    });
});
