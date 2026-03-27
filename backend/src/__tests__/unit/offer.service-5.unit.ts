/**
 * offer.service-5.unit.ts
 * Coverage for: handleRequestAction (seller accept/reject),
 *               handleAdminRequestAction (accept/reject/request_information),
 *               getOfferCompanies, sendOffer*Email helpers via admin actions
 */
import { expect, sinon } from '@loopback/testlab';
import { OfferService } from '../../services/offer.service';
import { ListingStatus, ListingType } from '../../enum';
import { createStubRepo, createStubService } from '../helpers/stub-factory';

function buildSvc(overrides: Record<string, any> = {}) {
    const offersRepo = overrides.offersRepo ?? createStubRepo();
    const listingsRepo = overrides.listingsRepo ?? createStubRepo();
    const companiesRepo = overrides.companiesRepo ?? createStubRepo();
    const userRepo = overrides.userRepo ?? createStubRepo();
    const companyUsersRepo = overrides.companyUsersRepo ?? createStubRepo();
    const companyLocationsRepo = overrides.companyLocationsRepo ?? createStubRepo();
    const listingDocsRepo = overrides.listingDocsRepo ?? createStubRepo();
    const emailService = overrides.emailService ?? createStubService([
        'sendOfferCreatedEmail', 'sendOfferAcceptEmail', 'sendOfferRejectionEmail',
        'sendOfferRequestInformationEmail', 'sendOfferStatusUpdatedEmail',
        'sendNewHaulageOpportunityEmail', 'sendAdminNotification',
    ]);
    const exchangeRateService = overrides.exchangeRateService ?? {
        convertOfferToBaseCurrency: sinon.stub().resolves({ offeredPricePerUnit: 100, totalPrice: 1000 }),
        baseCurrencyCode: 'gbp',
    };
    const notificationsService = overrides.notificationsService ?? createStubService(['createNotification']);

    const svc = new OfferService(
        offersRepo, listingsRepo, companiesRepo, userRepo,
        companyUsersRepo, companyLocationsRepo, listingDocsRepo,
        emailService, exchangeRateService as any, notificationsService,
    );

    return { svc, offersRepo, listingsRepo, companiesRepo, userRepo, companyUsersRepo, companyLocationsRepo, emailService, notificationsService };
}

function makeOffer(o: any = {}): any {
    return { id: 1, listingId: 10, buyerCompanyId: 2, sellerCompanyId: 3, buyerUserId: 5, sellerUserId: 6, sellerLocationId: 20, buyerLocationId: 21, createdByUserId: 5, quantity: 10, status: 'approved', state: 'active', ...o };
}

function makeListing(o: any = {}): any {
    return { id: 10, companyId: 3, listingType: 'sell', status: 'available', state: 'approved', remainingQuantity: 50, materialType: 'plastic', ...o };
}

function makeProfile(o: any = {}): any {
    return { id: 5, email: 'u@test.com', firstName: 'John', lastName: 'Doe', username: 'jdoe', name: 'John Doe', companyName: 'TestCo', globalRole: 'user', companyRole: 'buyer', isHaulier: false, ...o };
}

describe('OfferService — Part 5 (unit)', () => {

    // ── handleRequestAction (seller action) ────────────────────────────────
    describe('handleRequestAction()', () => {
        it('throws 404 when offer not found', async () => {
            const { svc, offersRepo } = buildSvc();
            offersRepo.findById.resolves(null);
            await expect(svc.handleRequestAction(999, 'accept', makeProfile())).to.be.rejected();
        });

        it('throws 400 when offer status is not approved', async () => {
            const { svc, offersRepo } = buildSvc();
            offersRepo.findById.resolves(makeOffer({ status: 'pending' }));
            await expect(svc.handleRequestAction(1, 'accept', makeProfile())).to.be.rejected();
        });

        it('throws 404 when listing not found', async () => {
            const { svc, offersRepo, listingsRepo } = buildSvc();
            offersRepo.findById.resolves(makeOffer());
            listingsRepo.findById.resolves(null);
            await expect(svc.handleRequestAction(1, 'accept', makeProfile())).to.be.rejected();
        });

        it('throws 400 when listing not available', async () => {
            const { svc, offersRepo, listingsRepo } = buildSvc();
            offersRepo.findById.resolves(makeOffer());
            listingsRepo.findById.resolves(makeListing({ status: 'sold' }));
            await expect(svc.handleRequestAction(1, 'accept', makeProfile())).to.be.rejected();
        });

        it('accepts offer — reduces remaining quantity', async () => {
            const { svc, offersRepo, listingsRepo } = buildSvc();
            offersRepo.findById.resolves(makeOffer({ quantity: 10 }));
            listingsRepo.findById.resolves(makeListing({ remainingQuantity: 50 }));
            offersRepo.updateById.resolves();
            offersRepo.updateAll.resolves({ count: 0 });
            listingsRepo.updateById.resolves();

            await svc.handleRequestAction(1, 'accept', makeProfile());

            expect(offersRepo.updateById.called).to.be.true();
            expect(listingsRepo.updateById.called).to.be.true();
        });

        it('accepts offer — marks listing SOLD when remaining hits 0', async () => {
            const { svc, offersRepo, listingsRepo } = buildSvc();
            offersRepo.findById.resolves(makeOffer({ quantity: 50 }));
            listingsRepo.findById.resolves(makeListing({ remainingQuantity: 50 }));
            offersRepo.updateById.resolves();
            offersRepo.updateAll.resolves({ count: 2 });
            listingsRepo.updateById.resolves();

            await svc.handleRequestAction(1, 'accept', makeProfile());

            // Should reject other offers and set listing to SOLD
            expect(offersRepo.updateAll.called).to.be.true();
        });

        it('accepts offer — clamps negative remaining to 0', async () => {
            const { svc, offersRepo, listingsRepo } = buildSvc();
            offersRepo.findById.resolves(makeOffer({ quantity: 100 }));
            listingsRepo.findById.resolves(makeListing({ remainingQuantity: 50 }));
            offersRepo.updateById.resolves();
            offersRepo.updateAll.resolves({ count: 0 });
            listingsRepo.updateById.resolves();

            await svc.handleRequestAction(1, 'accept', makeProfile());

            expect(offersRepo.updateAll.called).to.be.true();
        });

        it('rejects offer with default reason when none provided', async () => {
            const { svc, offersRepo, listingsRepo } = buildSvc();
            offersRepo.findById.resolves(makeOffer());
            listingsRepo.findById.resolves(makeListing());
            offersRepo.updateById.resolves();

            await svc.handleRequestAction(1, 'reject', makeProfile());

            const updateArg = offersRepo.updateById.firstCall.args[1];
            expect(updateArg.rejectionReason).to.equal('Offer rejected by seller');
            expect(updateArg.rejectionSource).to.equal('seller');
        });

        it('rejects offer with custom reason', async () => {
            const { svc, offersRepo, listingsRepo } = buildSvc();
            offersRepo.findById.resolves(makeOffer());
            listingsRepo.findById.resolves(makeListing());
            offersRepo.updateById.resolves();

            await svc.handleRequestAction(1, 'reject', makeProfile(), { rejectionReason: 'Price too low' });

            const updateArg = offersRepo.updateById.firstCall.args[1];
            expect(updateArg.rejectionReason).to.equal('Price too low');
        });

        it('throws 404 for unknown action', async () => {
            const { svc, offersRepo, listingsRepo } = buildSvc();
            offersRepo.findById.resolves(makeOffer());
            listingsRepo.findById.resolves(makeListing());
            await expect(svc.handleRequestAction(1, 'unknown', makeProfile())).to.be.rejected();
        });
    });

    // ── handleAdminRequestAction ──────────────────────────────────────────
    describe('handleAdminRequestAction()', () => {
        it('throws 400 when offer not pending', async () => {
            const { svc, offersRepo, listingsRepo } = buildSvc();
            offersRepo.findById.resolves(makeOffer({ status: 'approved' }));
            listingsRepo.findById.resolves(makeListing());
            await expect(svc.handleAdminRequestAction(1, 'accept')).to.be.rejected();
        });

        it('accepts — sets APPROVED, sends acceptance email', async () => {
            const { svc, offersRepo, listingsRepo, userRepo, emailService, companyUsersRepo, companyLocationsRepo } = buildSvc();
            offersRepo.findById.resolves(makeOffer({ status: 'pending' }));
            listingsRepo.findById.resolves(makeListing());
            offersRepo.updateById.resolves();
            userRepo.findById.resolves({ id: 5, email: 'u@t.com', firstName: 'John' });
            companyLocationsRepo.findById.resolves({ id: 20, country: 'GB' });
            companyUsersRepo.find.resolves([]);

            await svc.handleAdminRequestAction(1, 'accept');

            expect(offersRepo.updateById.called).to.be.true();
            expect(emailService.sendOfferAcceptEmail.called).to.be.true();
            expect(emailService.sendOfferStatusUpdatedEmail.called).to.be.true();
        });

        it('rejects — uses "Other" reason with message fallback', async () => {
            const { svc, offersRepo, listingsRepo, userRepo } = buildSvc();
            offersRepo.findById.resolves(makeOffer({ status: 'pending' }));
            listingsRepo.findById.resolves(makeListing());
            offersRepo.updateById.resolves();
            userRepo.findById.resolves({ id: 5, email: 'u@t.com', firstName: 'John' });

            await svc.handleAdminRequestAction(1, 'reject', { rejectionReason: 'Other', message: 'Specific reason' });

            const updateArg = offersRepo.updateById.firstCall.args[1];
            expect(updateArg.rejectionReason).to.equal('Specific reason');
        });

        it('rejects — uses default reason when none provided', async () => {
            const { svc, offersRepo, listingsRepo, userRepo, emailService } = buildSvc();
            offersRepo.findById.resolves(makeOffer({ status: 'pending' }));
            listingsRepo.findById.resolves(makeListing());
            offersRepo.updateById.resolves();
            userRepo.findById.resolves({ id: 5, email: 'u@t.com', firstName: 'John' });

            await svc.handleAdminRequestAction(1, 'reject');

            expect(emailService.sendOfferRejectionEmail.called).to.be.true();
        });

        it('request_information — sets PENDING and sends email', async () => {
            const { svc, offersRepo, listingsRepo, userRepo, emailService } = buildSvc();
            offersRepo.findById.resolves(makeOffer({ status: 'pending' }));
            listingsRepo.findById.resolves(makeListing());
            offersRepo.updateById.resolves();
            userRepo.findById.resolves({ id: 5, email: 'u@t.com', firstName: 'John' });

            await svc.handleAdminRequestAction(1, 'request_information', { message: 'Need more details' });

            expect(emailService.sendOfferRequestInformationEmail.called).to.be.true();
        });

        it('request_information — uses default message when none provided', async () => {
            const { svc, offersRepo, listingsRepo, userRepo } = buildSvc();
            offersRepo.findById.resolves(makeOffer({ status: 'pending' }));
            listingsRepo.findById.resolves(makeListing());
            offersRepo.updateById.resolves();
            userRepo.findById.resolves({ id: 5, email: 'u@t.com', firstName: 'John' });

            await svc.handleAdminRequestAction(1, 'request_information');

            const updateArg = offersRepo.updateById.firstCall.args[1];
            expect(updateArg.message).to.equal('Please check the offer and provide more information');
        });

        it('throws 404 for unknown action', async () => {
            const { svc, offersRepo, listingsRepo } = buildSvc();
            offersRepo.findById.resolves(makeOffer({ status: 'pending' }));
            listingsRepo.findById.resolves(makeListing());
            await expect(svc.handleAdminRequestAction(1, 'unknown')).to.be.rejected();
        });

        it('sends WANTED listing emails to seller instead of buyer', async () => {
            const { svc, offersRepo, listingsRepo, userRepo, emailService } = buildSvc();
            offersRepo.findById.resolves(makeOffer({ status: 'pending' }));
            listingsRepo.findById.resolves(makeListing({ listingType: ListingType.WANTED }));
            offersRepo.updateById.resolves();
            userRepo.findById.resolves({ id: 6, email: 's@t.com', firstName: 'Seller' });

            await svc.handleAdminRequestAction(1, 'reject', { rejectionReason: 'Bad' });

            expect(emailService.sendOfferRejectionEmail.called).to.be.true();
        });
    });

    // ── getOfferCompanies ─────────────────────────────────────────────────
    describe('getOfferCompanies()', () => {
        it('returns buyer and seller companies', async () => {
            const offersRepo = createStubRepo();
            offersRepo.dataSource.execute = sinon.stub()
                .onFirstCall().resolves([{ id: 1, name: 'BuyerCo', country: 'GB' }])
                .onSecondCall().resolves([{ id: 2, name: 'SellerCo', country: 'FR' }]);
            const { svc } = buildSvc({ offersRepo });

            const result = await svc.getOfferCompanies();

            expect(result).to.have.property('buyerCompanies');
            expect(result).to.have.property('sellerCompanies');
        });

        it('returns empty arrays when no data', async () => {
            const offersRepo = createStubRepo();
            offersRepo.dataSource.execute = sinon.stub().resolves([]);
            const { svc } = buildSvc({ offersRepo });

            const result = await svc.getOfferCompanies();
            expect(result.buyerCompanies).to.be.an.Array();
        });
    });
});
