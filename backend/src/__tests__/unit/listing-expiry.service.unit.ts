import { expect, sinon } from '@loopback/testlab';
import { ListingExpiryService } from '../../services/listing-expiry.service';
import { ListingStatus, RenewalPeriod } from '../../enum';

function makeListingsRepo(listings: object[] = []) {
    return {
        find: sinon.stub().resolves(listings),
        updateById: sinon.stub().resolves(),
    } as any;
}

function makeUserRepo(user: object = { id: 1, email: 'u@u.com', firstName: 'A', lastName: 'B' }) {
    return { findById: sinon.stub().resolves(user) } as any;
}

function makeEmailService() {
    return {
        sendListingExpiryWarning: sinon.stub().resolves(),
        sendListingRenewedEmail: sinon.stub().resolves(),
    } as any;
}

function makeNotifService() {
    return { createNotification: sinon.stub().resolves() } as any;
}

function daysAgo(n: number): Date {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d;
}

function daysFromNow(n: number): Date {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return d;
}

describe('ListingExpiryService (unit)', () => {
    describe('calculateExpiryInfo', () => {
        it('marks listing as expired when endDate is in the past', () => {
            const service = new ListingExpiryService(makeListingsRepo(), makeUserRepo(), makeEmailService(), makeNotifService());
            const listing: any = { endDate: daysAgo(5), createdAt: daysAgo(100) };

            const info = service.calculateExpiryInfo(listing);

            expect(info.isExpired).to.be.true();
            expect(info.daysUntilExpiry).to.equal(0);
        });

        it('marks listing as nearing expiry within 7 days', () => {
            const service = new ListingExpiryService(makeListingsRepo(), makeUserRepo(), makeEmailService(), makeNotifService());
            const listing: any = { endDate: daysFromNow(3), createdAt: daysAgo(10) };

            const info = service.calculateExpiryInfo(listing);

            expect(info.isNearingExpiry).to.be.true();
            expect(info.isExpired).to.be.false();
        });

        it('falls back to 90 days from creation when no endDate', () => {
            const service = new ListingExpiryService(makeListingsRepo(), makeUserRepo(), makeEmailService(), makeNotifService());
            const listing: any = { createdAt: daysAgo(95) };

            const info = service.calculateExpiryInfo(listing);

            expect(info.isExpired).to.be.true();
        });

        it('reports not expired for listing with future endDate', () => {
            const service = new ListingExpiryService(makeListingsRepo(), makeUserRepo(), makeEmailService(), makeNotifService());
            const listing: any = { endDate: daysFromNow(30), createdAt: daysAgo(10) };

            const info = service.calculateExpiryInfo(listing);

            expect(info.isExpired).to.be.false();
            expect(info.isNearingExpiry).to.be.false();
        });
    });

    describe('getExpiredListings', () => {
        it('returns expired non-recurring listings', async () => {
            const listings = [
                { id: 1, status: ListingStatus.AVAILABLE, endDate: daysAgo(3), createdAt: daysAgo(50) },
                { id: 2, status: ListingStatus.AVAILABLE, endDate: daysFromNow(10), createdAt: daysAgo(5) },
                { id: 3, status: ListingStatus.AVAILABLE, endDate: daysAgo(1), createdAt: daysAgo(30), listingRenewalPeriod: RenewalPeriod.WEEKLY },
            ];
            const service = new ListingExpiryService(makeListingsRepo(listings), makeUserRepo(), makeEmailService(), makeNotifService());

            const expired = await service.getExpiredListings();

            // id=1 expired, id=2 future, id=3 ongoing (skipped)
            expect(expired).to.have.length(1);
            expect((expired[0] as any).id).to.equal(1);
        });
    });

    describe('markExpiredListings', () => {
        it('updates expired listings to EXPIRED status', async () => {
            const listings = [{ id: 1, status: ListingStatus.AVAILABLE, endDate: daysAgo(2), createdAt: daysAgo(40) }];
            const repo = makeListingsRepo(listings);
            const service = new ListingExpiryService(repo, makeUserRepo(), makeEmailService(), makeNotifService());

            const result = await service.markExpiredListings();

            expect(result.updated).to.equal(1);
            expect(repo.updateById.calledOnce).to.be.true();
            expect(repo.updateById.firstCall.args[1]).to.containEql({ status: ListingStatus.EXPIRED });
        });
    });

    describe('sendExpiryWarnings', () => {
        it('sends email for each nearing-expiry listing', async () => {
            const listings = [{ id: 1, status: ListingStatus.AVAILABLE, endDate: daysFromNow(3), createdAt: daysAgo(10), createdByUserId: 1 }];
            const emailService = makeEmailService();
            const service = new ListingExpiryService(makeListingsRepo(listings), makeUserRepo(), emailService, makeNotifService());

            const result = await service.sendExpiryWarnings();

            expect(result.sent).to.equal(1);
            expect(result.failed).to.equal(0);
            expect(emailService.sendListingExpiryWarning.calledOnce).to.be.true();
        });

        it('increments failed count when email throws', async () => {
            const listings = [{ id: 1, status: ListingStatus.AVAILABLE, endDate: daysFromNow(3), createdAt: daysAgo(10), createdByUserId: 1 }];
            const emailService = { sendListingExpiryWarning: sinon.stub().rejects(new Error('SMTP error')), sendListingRenewedEmail: sinon.stub() } as any;
            const service = new ListingExpiryService(makeListingsRepo(listings), makeUserRepo(), emailService, makeNotifService());

            const result = await service.sendExpiryWarnings();

            expect(result.failed).to.equal(1);
            expect(result.sent).to.equal(0);
        });
    });

    describe('renewOngoingListings', () => {
        it('renews listings and sends email/notification', async () => {
            const listings = [{
                id: 1, status: ListingStatus.AVAILABLE,
                endDate: daysAgo(1), createdAt: daysAgo(30),
                createdByUserId: 1, listingRenewalPeriod: RenewalPeriod.WEEKLY,
                listingType: 'sell',
            }];
            const repo = makeListingsRepo(listings);
            const emailService = makeEmailService();
            const notifService = makeNotifService();
            const service = new ListingExpiryService(repo, makeUserRepo(), emailService, notifService);

            const result = await service.renewOngoingListings();

            expect(result.renewed).to.equal(1);
            expect(repo.updateById.calledOnce).to.be.true();
        });
    });
});
