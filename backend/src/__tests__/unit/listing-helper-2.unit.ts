/**
 * listing-helper-2.unit.ts
 * Additional coverage for ListingHelper:
 * sendNotificationNewListing — companies-found, no-companyUser, empty-companies, error path.
 */
import { expect, sinon } from '@loopback/testlab';
import { ListingHelper } from '../../helpers/listing.helper';

function makeListing(overrides: Record<string, any> = {}): any {
    return {
        id: 1,
        listingType: 'sell',
        materialItem: 'hdpe',
        ...overrides,
    };
}

function makeCompaniesRepo(companies: any[] = []): any {
    return {
        execute: sinon.stub().resolves(companies),
    };
}

function makeCompanyUsersRepo(companyUser: any | null = null): any {
    return {
        findOne: sinon.stub().resolves(companyUser),
    };
}

function makeNotifService(): any {
    return {
        createNotification: sinon.stub().resolves(),
    };
}

describe('ListingHelper - Part 2 (unit)', () => {
    describe('sendNotificationNewListing()', () => {
        it('sends notification for each company user found', async () => {
            const companiesRepo = makeCompaniesRepo([{ id: 10 }, { id: 20 }]);
            const companyUsersRepo = makeCompanyUsersRepo({ userId: 5 });
            const notifService = makeNotifService();

            await ListingHelper.sendNotificationNewListing(
                companiesRepo,
                companyUsersRepo,
                notifService,
                makeListing(),
            );

            // Two companies found, each triggers createNotification (fire-and-forget)
            // Allow micro-tasks to flush
            await new Promise(r => setTimeout(r, 10));
            expect(notifService.createNotification.callCount).to.equal(2);
        });

        it('skips company when no companyUser found (userId missing)', async () => {
            const companiesRepo = makeCompaniesRepo([{ id: 10 }]);
            const companyUsersRepo = makeCompanyUsersRepo(null);
            const notifService = makeNotifService();

            await ListingHelper.sendNotificationNewListing(
                companiesRepo,
                companyUsersRepo,
                notifService,
                makeListing(),
            );

            await new Promise(r => setTimeout(r, 10));
            expect(notifService.createNotification.called).to.be.false();
        });

        it('skips company when companyUser has no userId', async () => {
            const companiesRepo = makeCompaniesRepo([{ id: 10 }]);
            const companyUsersRepo = makeCompanyUsersRepo({ userId: null });
            const notifService = makeNotifService();

            await ListingHelper.sendNotificationNewListing(
                companiesRepo,
                companyUsersRepo,
                notifService,
                makeListing(),
            );

            await new Promise(r => setTimeout(r, 10));
            expect(notifService.createNotification.called).to.be.false();
        });

        it('does nothing when no companies match favorite_materials', async () => {
            const companiesRepo = makeCompaniesRepo([]);
            const companyUsersRepo = makeCompanyUsersRepo({ userId: 1 });
            const notifService = makeNotifService();

            await ListingHelper.sendNotificationNewListing(
                companiesRepo,
                companyUsersRepo,
                notifService,
                makeListing(),
            );

            await new Promise(r => setTimeout(r, 10));
            expect(notifService.createNotification.called).to.be.false();
        });

        it('does not throw when companiesRepo.execute rejects', async () => {
            const companiesRepo = {
                execute: sinon.stub().rejects(new Error('DB error')),
            };
            const companyUsersRepo = makeCompanyUsersRepo();
            const notifService = makeNotifService();

            // Should swallow the error internally
            await expect(
                ListingHelper.sendNotificationNewListing(
                    companiesRepo as any,
                    companyUsersRepo,
                    notifService,
                    makeListing(),
                ),
            ).to.not.be.rejected();
        });

        it('passes correct notification type and payload', async () => {
            const companiesRepo = makeCompaniesRepo([{ id: 10 }]);
            const companyUsersRepo = makeCompanyUsersRepo({ userId: 7 });
            const notifService = makeNotifService();

            await ListingHelper.sendNotificationNewListing(
                companiesRepo,
                companyUsersRepo,
                notifService,
                makeListing({ id: 42, materialItem: 'corrugated_board' }),
            );

            await new Promise(r => setTimeout(r, 10));
            const [userId, notifType, payload] = notifService.createNotification.firstCall.args;
            expect(userId).to.equal(7);
            expect(notifType).to.be.a.String();
            expect(payload.listingId).to.equal(42);
            expect(payload.listingTitle).to.equal('CORRUGATED BOARD');
        });
    });
});
