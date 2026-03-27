import { expect, sinon } from '@loopback/testlab';
import { ListingService } from '../../services/listing.service';
import { ListingRequestActionEnum, ListingState, ListingStatus, ListingType, MaterialType } from '../../enum';
import { OfferState, OfferStatusEnum } from '../../enum/offer.enum';
import { UserRoleEnum } from '../../enum';
import { createStubRepo, createStubService } from '../helpers/stub-factory';

function buildListingService(overrides: Record<string, any> = {}): ListingService {
    const exchangeRateService = overrides.exchangeRateService ?? {
        convertListingToBaseCurrency: sinon.stub().resolves({}),
        convertOfferToBaseCurrency: sinon.stub().resolves({ offeredPricePerUnit: 100, totalPrice: 1000, currency: 'gbp', originalCurrency: 'gbp' }),
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
        overrides.emailService ?? createStubService(['sendListingCreatedEmail', 'sendListingRejectionEmail', 'sendListingRequestInformationEmail', 'sendListingStatusUpdatedEmail', 'sendListingRenewedEmail']),
        listingExpiryService as any,
        exchangeRateService as any,
        overrides.notificationsService ?? createStubService(['createNotification']),
    );
}

function makeUserProfile(overrides: Record<string, any> = {}): any {
    return { id: 1, globalRole: UserRoleEnum.USER, companyId: 10, ...overrides };
}

function makeBaseListing(overrides: Record<string, any> = {}): any {
    return {
        id: 1,
        companyId: 10,
        createdByUserId: 1,
        status: ListingStatus.AVAILABLE,
        state: ListingState.APPROVED,
        listingType: ListingType.SELL,
        quantity: 100,
        remainingQuantity: 100,
        ...overrides,
    };
}

describe('ListingService extended coverage - Part 3 (unit)', () => {
    describe('getListings() — raw SQL path', () => {
        it('returns paginated results via dataSource.execute', async () => {
            const listingRepo = createStubRepo();
            listingRepo.dataSource = {
                execute: sinon.stub().callsFake((sql: string) => {
                    if (String(sql).includes('COUNT')) return Promise.resolve([{ count: 3 }]);
                    return Promise.resolve([
                        { id: 1, materialType: 'plastic', status: ListingStatus.AVAILABLE },
                        { id: 2, materialType: 'metal', status: ListingStatus.AVAILABLE },
                        { id: 3, materialType: 'paper', status: ListingStatus.SOLD },
                    ]);
                }),
            };
            const exchangeRateService = {
                convertListingToBaseCurrency: sinon.stub().resolves({}),
                baseCurrencyCode: 'gbp',
            };
            const svc = buildListingService({ listingRepo, exchangeRateService });

            const result = await svc.getListings({ filter: { limit: 10, skip: 0 } });
            expect(result.totalCount).to.equal(3);
            expect(result.results).to.have.length(3);
        });

        it('applies materialType filter in SQL when provided', async () => {
            const listingRepo = createStubRepo();
            const capturedSqls: string[] = [];
            listingRepo.dataSource = {
                execute: sinon.stub().callsFake((sql: string) => {
                    capturedSqls.push(String(sql));
                    if (String(sql).includes('COUNT')) return Promise.resolve([{ count: 0 }]);
                    return Promise.resolve([]);
                }),
            };
            const svc = buildListingService({ listingRepo });

            await svc.getListings({ filter: { where: { materialType: 'plastic' } as any } });
            expect(capturedSqls.some(s => s.includes('plastic'))).to.be.true();
        });

        it('applies materialItem filter in SQL when provided', async () => {
            const listingRepo = createStubRepo();
            const capturedSqls: string[] = [];
            listingRepo.dataSource = {
                execute: sinon.stub().callsFake((sql: string) => {
                    capturedSqls.push(String(sql));
                    if (String(sql).includes('COUNT')) return Promise.resolve([{ count: 0 }]);
                    return Promise.resolve([]);
                }),
            };
            const svc = buildListingService({ listingRepo });

            await svc.getListings({ filter: { where: { materialItem: 'bottles' } as any } });
            expect(capturedSqls.some(s => s.includes('bottles'))).to.be.true();
        });

        it('applies searchTerm filter in SQL when provided', async () => {
            const listingRepo = createStubRepo();
            const capturedSqls: string[] = [];
            listingRepo.dataSource = {
                execute: sinon.stub().callsFake((sql: string) => {
                    capturedSqls.push(String(sql));
                    if (String(sql).includes('COUNT')) return Promise.resolve([{ count: 0 }]);
                    return Promise.resolve([]);
                }),
            };
            const svc = buildListingService({ listingRepo });

            await svc.getListings({ filter: { where: { searchTerm: 'recycled' } as any } });
            expect(capturedSqls.some(s => s.includes('recycled'))).to.be.true();
        });

        it('filters by userId when provided', async () => {
            const listingRepo = createStubRepo();
            const capturedSqls: string[] = [];
            listingRepo.dataSource = {
                execute: sinon.stub().callsFake((sql: string) => {
                    capturedSqls.push(String(sql));
                    if (String(sql).includes('COUNT')) return Promise.resolve([{ count: 0 }]);
                    return Promise.resolve([]);
                }),
            };
            const svc = buildListingService({ listingRepo });

            await svc.getListings({ filter: {} }, 42);
            expect(capturedSqls.some(s => s.includes('42'))).to.be.true();
        });

        it('returns empty results when no listings found', async () => {
            const listingRepo = createStubRepo();
            listingRepo.dataSource = {
                execute: sinon.stub().callsFake((sql: string) => {
                    if (String(sql).includes('COUNT')) return Promise.resolve([{ count: 0 }]);
                    return Promise.resolve([]);
                }),
            };
            const svc = buildListingService({ listingRepo });

            const result = await svc.getListings({ filter: {} });
            expect(result.totalCount).to.equal(0);
            expect(result.results).to.have.length(0);
        });

        it('applies listingType filter to SQL', async () => {
            const listingRepo = createStubRepo();
            const capturedSqls: string[] = [];
            listingRepo.dataSource = {
                execute: sinon.stub().callsFake((sql: string) => {
                    capturedSqls.push(String(sql));
                    if (String(sql).includes('COUNT')) return Promise.resolve([{ count: 0 }]);
                    return Promise.resolve([]);
                }),
            };
            const svc = buildListingService({ listingRepo });

            await svc.getListings({ filter: { where: { listingType: ListingType.WANTED } as any } });
            expect(capturedSqls.some(s => s.includes('wanted'))).to.be.true();
        });

        it('applies array materialType filter with IN clause', async () => {
            const listingRepo = createStubRepo();
            const capturedSqls: string[] = [];
            listingRepo.dataSource = {
                execute: sinon.stub().callsFake((sql: string) => {
                    capturedSqls.push(String(sql));
                    if (String(sql).includes('COUNT')) return Promise.resolve([{ count: 0 }]);
                    return Promise.resolve([]);
                }),
            };
            const svc = buildListingService({ listingRepo });

            await svc.getListings({ filter: { where: { materialType: ['plastic', 'metal'] } as any } });
            expect(capturedSqls.some(s => s.includes('IN'))).to.be.true();
        });
    });

    describe('getListingById() — company member check', () => {
        it('returns listing with hasPendingOffer=true when offers exist', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById.resolves(makeBaseListing());
            const listingDocsRepo = createStubRepo(['find', 'findById', 'findOne', 'create', 'updateById', 'updateAll', 'count', 'deleteById', 'deleteAll']);
            listingDocsRepo.find.resolves([
                { id: 1, documentType: 'feature_image', documentUrl: 'http://example.com/img.jpg' },
            ]);
            const offersRepo = createStubRepo();
            offersRepo.count.resolves({ count: 5 });
            const companyRepo = createStubRepo();
            companyRepo.findById.resolves({ id: 10, name: 'Test Co', verifiedAt: new Date() });
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1, firstName: 'John', lastName: 'Doe' });
            const svc = buildListingService({ listingRepo, listingDocsRepo, offersRepo, companyRepo, userRepo });

            const result = await svc.getListingById(1, 1, false);
            expect(result.status).to.equal('success');
            // hasPendingOffer lives inside data.listing
            expect((result.data as any).listing.hasPendingOffer).to.equal(true);
        });

        it('returns listing with documents array even when empty', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById.resolves(makeBaseListing());
            const listingDocsRepo = createStubRepo(['find', 'findById', 'findOne', 'create', 'updateById', 'updateAll', 'count', 'deleteById', 'deleteAll']);
            listingDocsRepo.find.resolves([]);
            const offersRepo = createStubRepo();
            offersRepo.count.resolves({ count: 0 });
            const companyRepo = createStubRepo();
            companyRepo.findById.resolves({ id: 10, name: 'Test Co' });
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1 });
            const svc = buildListingService({ listingRepo, listingDocsRepo, offersRepo, companyRepo, userRepo });

            const result = await svc.getListingById(1, 1, false);
            expect(result.status).to.equal('success');
            expect((result.data as any).listing.documents).to.deepEqual([]);
        });

        it('non-owner non-admin cannot view pending listing', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById.resolves(makeBaseListing({
                status: ListingStatus.PENDING,
                state: ListingState.PENDING,
                createdByUserId: 999,
            }));
            const svc = buildListingService({ listingRepo });

            await expect(svc.getListingById(1, 42, false))
                .to.be.rejectedWith('You do not have permission to view this listing');
        });
    });

    describe('updateListing() — document handling', () => {
        it('updates documents when provided in update payload', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById.onFirstCall().resolves(makeBaseListing({ createdByUserId: 1 }));
            listingRepo.findById.onSecondCall().resolves(makeBaseListing({ status: ListingStatus.PENDING }));
            listingRepo.updateById.resolves();
            const offersRepo = createStubRepo();
            offersRepo.count.resolves({ count: 0 });
            const listingDocsRepo = createStubRepo(['find', 'findById', 'findOne', 'create', 'updateById', 'updateAll', 'count', 'deleteById', 'deleteAll']);
            listingDocsRepo.deleteAll.resolves();
            listingDocsRepo.create.resolves({ id: 5 });
            const svc = buildListingService({ listingRepo, offersRepo, listingDocsRepo });

            const result = await svc.updateListing(1, 1, {
                documents: [{ documentType: 'feature_image', documentUrl: 'http://s3.aws/new.jpg' }],
            } as any, makeUserProfile());

            expect(result.status).to.equal('success');
            expect(listingDocsRepo.deleteAll.calledOnce).to.be.true();
            expect(listingDocsRepo.create.calledOnce).to.be.true();
        });

        it('admin can update any listing regardless of ownership', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById.onFirstCall().resolves(makeBaseListing({ createdByUserId: 99 }));
            listingRepo.findById.onSecondCall().resolves(makeBaseListing({ status: ListingStatus.PENDING }));
            listingRepo.updateById.resolves();
            const offersRepo = createStubRepo();
            offersRepo.count.resolves({ count: 0 });
            const listingDocsRepo = createStubRepo(['find', 'findById', 'findOne', 'create', 'updateById', 'updateAll', 'count', 'deleteById', 'deleteAll']);
            listingDocsRepo.deleteAll.resolves();
            const svc = buildListingService({ listingRepo, offersRepo, listingDocsRepo });

            const result = await svc.updateListing(
                1, 1, { title: 'Updated by admin' } as any,
                makeUserProfile({ globalRole: UserRoleEnum.ADMIN }),
            );
            expect(result.status).to.equal('success');
        });
    });

    describe('getAdminListings() — SQL path', () => {
        it('returns paginated admin listings via raw SQL', async () => {
            const listingRepo = createStubRepo();
            listingRepo.dataSource = {
                execute: sinon.stub().callsFake((sql: string) => {
                    // getAdminListings countQuery returns {total} not {count}
                    if (String(sql).includes('COUNT')) return Promise.resolve([{ total: '5' }]);
                    return Promise.resolve([
                        { id: 1, material_type: 'plastic', status: ListingStatus.AVAILABLE, documents: null, currency: null },
                        { id: 2, material_type: 'metal', status: ListingStatus.PENDING, documents: null, currency: null },
                    ]);
                }),
            };
            const exchangeRateService = {
                convertListingToBaseCurrency: sinon.stub().resolves({}),
                baseCurrencyCode: 'gbp',
            };
            const svc = buildListingService({ listingRepo, exchangeRateService });

            const result = await svc.getAdminListings({ filter: { limit: 20, skip: 0 } });
            // totalCount comes directly from DB count result (may be string '5' from raw SQL)
            expect(Number(result.totalCount)).to.equal(5);
        });

        it('filters by searchTerm in admin listings', async () => {
            const listingRepo = createStubRepo();
            const capturedSqls: string[] = [];
            listingRepo.dataSource = {
                execute: sinon.stub().callsFake((sql: string) => {
                    capturedSqls.push(String(sql));
                    if (String(sql).includes('COUNT')) return Promise.resolve([{ count: 0 }]);
                    return Promise.resolve([]);
                }),
            };
            const svc = buildListingService({ listingRepo });

            await svc.getAdminListings({ filter: { where: { searchTerm: 'acme corp' } as any } });
            expect(capturedSqls.some(s => s.includes('acme'))).to.be.true();
        });

        it('filters by status in admin listings', async () => {
            const listingRepo = createStubRepo();
            const capturedSqls: string[] = [];
            listingRepo.dataSource = {
                execute: sinon.stub().callsFake((sql: string) => {
                    capturedSqls.push(String(sql));
                    if (String(sql).includes('COUNT')) return Promise.resolve([{ count: 0 }]);
                    return Promise.resolve([]);
                }),
            };
            const svc = buildListingService({ listingRepo });

            await svc.getAdminListings({ filter: { where: { status: ListingStatus.PENDING } as any } });
            expect(capturedSqls.some(s => s.includes('pending'))).to.be.true();
        });
    });

    describe('handleAdminRequestAction() — additional edge cases', () => {
        it('throws 400 when listing is already AVAILABLE (already processed)', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById.resolves(makeBaseListing({ status: ListingStatus.AVAILABLE }));
            const svc = buildListingService({ listingRepo });

            await expect(svc.handleAdminRequestAction(1, ListingRequestActionEnum.ACCEPT))
                .to.be.rejectedWith(/available/i);
        });

        it('sends rejection email on REJECT action', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById.onFirstCall().resolves(makeBaseListing({ status: ListingStatus.PENDING, state: ListingState.PENDING, createdByUserId: 5 }));
            listingRepo.findById.onSecondCall().resolves(makeBaseListing({ status: ListingStatus.REJECTED }));
            listingRepo.updateById.resolves();
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 5, email: 'user@t.com' });
            const emailService = createStubService(['sendListingRejectionEmail', 'sendListingRequestInformationEmail', 'sendListingStatusUpdatedEmail', 'sendListingCreatedEmail']);
            const svc = buildListingService({ listingRepo, userRepo, emailService });

            await svc.handleAdminRequestAction(1, ListingRequestActionEnum.REJECT, { rejectionReason: 'Test reason' });

            expect(emailService.sendListingRejectionEmail.called).to.be.true();
        });

        it('sends request info email on REQUEST_INFORMATION action', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById.onFirstCall().resolves(makeBaseListing({ status: ListingStatus.PENDING, state: ListingState.PENDING, createdByUserId: 5 }));
            listingRepo.findById.onSecondCall().resolves(makeBaseListing({ status: ListingStatus.PENDING }));
            listingRepo.updateById.resolves();
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 5, email: 'user@t.com' });
            const emailService = createStubService(['sendListingRejectionEmail', 'sendListingRequestInformationEmail', 'sendListingStatusUpdatedEmail', 'sendListingCreatedEmail']);
            const svc = buildListingService({ listingRepo, userRepo, emailService });

            await svc.handleAdminRequestAction(1, ListingRequestActionEnum.REQUEST_INFORMATION, { message: 'Need more info' });

            expect(emailService.sendListingRequestInformationEmail.called).to.be.true();
        });

        it('accept: sends status updated email on ACCEPT action', async () => {
            const listingRepo = createStubRepo();
            listingRepo.findById.onFirstCall().resolves(makeBaseListing({ status: ListingStatus.PENDING, state: ListingState.PENDING, createdByUserId: 5 }));
            listingRepo.findById.onSecondCall().resolves(makeBaseListing({ status: ListingStatus.AVAILABLE }));
            listingRepo.updateById.resolves();
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 5, email: 'user@t.com' });
            const emailService = createStubService(['sendListingRejectionEmail', 'sendListingRequestInformationEmail', 'sendListingStatusUpdatedEmail', 'sendListingCreatedEmail']);
            const notificationsService = createStubService(['createNotification']);
            const svc = buildListingService({ listingRepo, userRepo, emailService, notificationsService });

            await svc.handleAdminRequestAction(1, ListingRequestActionEnum.ACCEPT);

            expect(listingRepo.updateById.calledWith(1, sinon.match({
                status: ListingStatus.AVAILABLE,
                state: ListingState.APPROVED,
            }))).to.be.true();
        });
    });

    describe('getListingUsersCompanies()', () => {
        it('returns companies array for SELL listings', async () => {
            const listingRepo = createStubRepo();
            listingRepo.dataSource = {
                execute: sinon.stub().resolves([
                    { id: 1, name: 'Acme Corp', country: 'GB', firstName: 'John', lastName: 'Doe', username: 'jd' },
                    { id: 2, name: 'Beta Ltd', country: 'FR', firstName: 'Jane', lastName: 'Smith', username: 'js' },
                ]),
            };
            const svc = buildListingService({ listingRepo });

            const result = await svc.getListingUsersCompanies(ListingType.SELL);
            expect(result.companies).to.have.length(2);
        });

        it('returns empty companies array when no companies found', async () => {
            const listingRepo = createStubRepo();
            listingRepo.dataSource = {
                execute: sinon.stub().resolves([]),
            };
            const svc = buildListingService({ listingRepo });

            const result = await svc.getListingUsersCompanies(ListingType.SELL);
            expect(result.companies).to.deepEqual([]);
        });
    });
});
