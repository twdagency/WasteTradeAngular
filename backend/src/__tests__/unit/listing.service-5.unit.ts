/**
 * listing.service-5.unit.ts
 * Branch-focused tests for listing.service.ts (Part 5)
 * Targets: handleAdminRequestAction switch branches, createListing validation,
 *          null checks, and status guards not covered in parts 1-4.
 */
import { expect, sinon } from '@loopback/testlab';
import { ListingService } from '../../services/listing.service';
import {
    ListingRequestActionEnum,
    ListingState,
    ListingStatus,
    ListingType,
    UserRoleEnum,
} from '../../enum';
import { createStubRepo, createStubService } from '../helpers/stub-factory';

function buildListingService(overrides: Record<string, any> = {}): ListingService {
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

function makePendingListing(overrides: Record<string, any> = {}): any {
    return {
        id: 1,
        companyId: 10,
        createdByUserId: 1,
        status: ListingStatus.PENDING,
        state: ListingState.PENDING,
        listingType: ListingType.SELL,
        quantity: 100,
        remainingQuantity: 100,
        materialType: 'plastic',
        ...overrides,
    };
}

describe('ListingService branch coverage - Part 5 (unit)', () => {
    describe('handleAdminRequestAction() — ACCEPT branch', () => {
        it('approves listing and creates notification on ACCEPT', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById
                .onFirstCall().resolves(makePendingListing())
                .onSecondCall().resolves(makePendingListing({ status: ListingStatus.AVAILABLE }));
            listingRepo.updateById = sinon.stub().resolves();
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1, email: 'u@t.com' });
            const notificationsService = createStubService(['createNotification']);
            const emailService = createStubService(['sendListingStatusUpdatedEmail']);
            const svc = buildListingService({ listingRepo, userRepo, notificationsService, emailService });

            await svc.handleAdminRequestAction(1, ListingRequestActionEnum.ACCEPT);

            expect(listingRepo.updateById.calledWith(1, sinon.match({ status: ListingStatus.AVAILABLE }))).to.be.true();
            expect(notificationsService.createNotification.calledOnce).to.be.true();
        });

        it('throws 404 when listing not found', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById.resolves(null);
            const svc = buildListingService({ listingRepo });

            await expect(svc.handleAdminRequestAction(999, ListingRequestActionEnum.ACCEPT))
                .to.be.rejectedWith(/not found|listing/i);
        });

        it('throws 400 when listing is already AVAILABLE', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById.resolves(makePendingListing({ status: ListingStatus.AVAILABLE }));
            const svc = buildListingService({ listingRepo });

            await expect(svc.handleAdminRequestAction(1, ListingRequestActionEnum.ACCEPT))
                .to.be.rejectedWith(/available|already/i);
        });

        it('throws 400 when listing is already REJECTED', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById.resolves(makePendingListing({ status: ListingStatus.REJECTED }));
            const svc = buildListingService({ listingRepo });

            await expect(svc.handleAdminRequestAction(1, ListingRequestActionEnum.ACCEPT))
                .to.be.rejectedWith(/rejected|already/i);
        });

        it('throws 400 when listing is already SOLD', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById.resolves(makePendingListing({ status: ListingStatus.SOLD }));
            const svc = buildListingService({ listingRepo });

            await expect(svc.handleAdminRequestAction(1, ListingRequestActionEnum.ACCEPT))
                .to.be.rejectedWith(/sold|already/i);
        });
    });

    describe('handleAdminRequestAction() — REJECT branch', () => {
        it('rejects listing with rejectionReason when provided', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById
                .onFirstCall().resolves(makePendingListing())
                .onSecondCall().resolves(makePendingListing({ status: ListingStatus.REJECTED }));
            listingRepo.updateById = sinon.stub().resolves();
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1, email: 'u@t.com', firstName: 'John', lastName: 'Doe' });
            const emailService = createStubService(['sendListingRejectionEmail', 'sendListingStatusUpdatedEmail']);
            const notificationsService = createStubService(['createNotification']);
            const svc = buildListingService({ listingRepo, userRepo, emailService, notificationsService });

            await svc.handleAdminRequestAction(1, ListingRequestActionEnum.REJECT, { rejectionReason: 'Invalid content' });

            const updateArg = listingRepo.updateById.firstCall.args[1];
            expect(updateArg.status).to.equal(ListingStatus.REJECTED);
            expect(updateArg.rejectionReason).to.equal('Invalid content');
            expect(emailService.sendListingRejectionEmail.calledOnce).to.be.true();
        });

        it('rejects listing without rejectionReason when not provided', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById
                .onFirstCall().resolves(makePendingListing())
                .onSecondCall().resolves(makePendingListing({ status: ListingStatus.REJECTED }));
            listingRepo.updateById = sinon.stub().resolves();
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1, email: 'u@t.com' });
            const emailService = createStubService(['sendListingRejectionEmail', 'sendListingStatusUpdatedEmail']);
            const notificationsService = createStubService(['createNotification']);
            const svc = buildListingService({ listingRepo, userRepo, emailService, notificationsService });

            await svc.handleAdminRequestAction(1, ListingRequestActionEnum.REJECT);

            const updateArg = listingRepo.updateById.firstCall.args[1];
            expect(updateArg.rejectionReason).to.be.undefined();
        });

        it('skips rejection email when user is not found (deleted user)', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById
                .onFirstCall().resolves(makePendingListing())
                .onSecondCall().resolves(makePendingListing({ status: ListingStatus.REJECTED }));
            listingRepo.updateById = sinon.stub().resolves();
            const userRepo = createStubRepo();
            // Simulate deleted user — findById throws
            userRepo.findById.rejects(new Error('Entity not found'));
            const emailService = createStubService(['sendListingRejectionEmail', 'sendListingStatusUpdatedEmail']);
            const notificationsService = createStubService(['createNotification']);
            const svc = buildListingService({ listingRepo, userRepo, emailService, notificationsService });

            // Should not throw even though user is gone
            await svc.handleAdminRequestAction(1, ListingRequestActionEnum.REJECT, { rejectionReason: 'reason' });

            expect(emailService.sendListingRejectionEmail.called).to.be.false();
        });
    });

    describe('handleAdminRequestAction() — REQUEST_INFORMATION branch', () => {
        it('sets status to PENDING and sends request-info email with message', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById
                .onFirstCall().resolves(makePendingListing())
                .onSecondCall().resolves(makePendingListing({ status: ListingStatus.PENDING }));
            listingRepo.updateById = sinon.stub().resolves();
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1, email: 'u@t.com', firstName: 'Jane', lastName: 'Doe' });
            const emailService = createStubService(['sendListingRequestInformationEmail', 'sendListingStatusUpdatedEmail']);
            const notificationsService = createStubService(['createNotification']);
            const svc = buildListingService({ listingRepo, userRepo, emailService, notificationsService });

            await svc.handleAdminRequestAction(1, ListingRequestActionEnum.REQUEST_INFORMATION, { message: 'Please provide more details' });

            const updateArg = listingRepo.updateById.firstCall.args[1];
            expect(updateArg.status).to.equal(ListingStatus.PENDING);
            expect(updateArg.message).to.equal('Please provide more details');
            expect(emailService.sendListingRequestInformationEmail.calledOnce).to.be.true();
        });

        it('omits message field from update when message not provided', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById
                .onFirstCall().resolves(makePendingListing())
                .onSecondCall().resolves(makePendingListing({ status: ListingStatus.PENDING }));
            listingRepo.updateById = sinon.stub().resolves();
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1, email: 'u@t.com' });
            const notificationsService = createStubService(['createNotification']);
            const emailService = createStubService(['sendListingRequestInformationEmail', 'sendListingStatusUpdatedEmail']);
            const svc = buildListingService({ listingRepo, userRepo, emailService, notificationsService });

            await svc.handleAdminRequestAction(1, ListingRequestActionEnum.REQUEST_INFORMATION);

            const updateArg = listingRepo.updateById.firstCall.args[1];
            expect(updateArg.message).to.be.undefined();
        });
    });

    describe('createListing() — additionalNotes validation branches', () => {
        it('throws when additionalNotes contains a phone number', async () => {
            const svc = buildListingService();

            await expect(
                svc.createListing(
                    {
                        documents: [],
                        listingType: ListingType.SELL,
                        // EFW has simplest validation: no materialForm/Item/Grading allowed
                        materialType: 'efw',
                        quantity: 10,
                        currency: 'gbp',
                        companyId: 10,
                        additionalNotes: 'Call +44 7700 900000 for details',
                    } as any,
                    '1',
                ),
            ).to.be.rejectedWith(/phone|contact/i);
        });

        it('throws when additionalNotes contains an email address', async () => {
            const svc = buildListingService();

            await expect(
                svc.createListing(
                    {
                        documents: [],
                        listingType: ListingType.SELL,
                        materialType: 'efw',
                        quantity: 10,
                        currency: 'gbp',
                        companyId: 10,
                        // EMAIL_BLOCK_REGEX is anchored (^...$), so the entire string must be an email
                        additionalNotes: 'test@example.com',
                    } as any,
                    '1',
                ),
            ).to.be.rejectedWith(/email/i);
        });
    });
});
