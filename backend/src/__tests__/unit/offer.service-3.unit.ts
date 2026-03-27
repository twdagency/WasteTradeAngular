import { expect, sinon } from '@loopback/testlab';
import { OfferService } from '../../services/offer.service';
import { ListingStatus, ListingType } from '../../enum';
import { OfferRequestActionEnum, OfferSortBy, OfferState, OfferStatusEnum } from '../../enum/offer.enum';
import { UserRoleEnum } from '../../enum';
import { createStubRepo, createStubService } from '../helpers/stub-factory';

function makeUserProfile(overrides: Record<string, any> = {}): any {
    return { id: 1, globalRole: UserRoleEnum.USER, companyId: 10, ...overrides };
}

function buildOfferService(overrides: Record<string, any> = {}): OfferService {
    const exchangeRateService = overrides.exchangeRateService ?? {
        convertOfferToBaseCurrency: sinon.stub().resolves({
            offeredPricePerUnit: 100,
            totalPrice: 1000,
            currency: 'gbp',
            originalCurrency: 'gbp',
        }),
        convertToBaseCurrency: sinon.stub().resolves(100),
        baseCurrencyCode: 'gbp',
    };
    return new OfferService(
        overrides.offersRepo ?? createStubRepo(),
        overrides.listingsRepo ?? createStubRepo(),
        overrides.companiesRepo ?? createStubRepo(),
        overrides.userRepo ?? createStubRepo(),
        overrides.companyUsersRepo ?? createStubRepo(),
        overrides.companyLocationsRepo ?? createStubRepo(),
        overrides.listingDocsRepo ?? createStubRepo(),
        overrides.emailService ?? createStubService([
            'sendOfferAcceptEmail',
            'sendOfferRejectionEmail',
            'sendOfferRequestInformationEmail',
            'sendNewHaulageOpportunityEmail',
            'sendOfferStatusUpdatedEmail',
        ]),
        exchangeRateService as any,
        overrides.notificationsService ?? createStubService(['createNotification']),
    );
}

function makeListing(overrides: Record<string, any> = {}): any {
    return {
        id: 1,
        companyId: 20,
        createdByUserId: 99,
        status: ListingStatus.AVAILABLE,
        listingType: ListingType.SELL,
        quantity: 100,
        remainingQuantity: 100,
        locationId: 5,
        ...overrides,
    };
}

function makeOffer(overrides: Record<string, any> = {}): any {
    return {
        id: 1,
        listingId: 1,
        status: OfferStatusEnum.APPROVED,
        state: OfferState.ACTIVE,
        buyerUserId: 1,
        sellerUserId: 99,
        buyerCompanyId: 10,
        sellerCompanyId: 20,
        quantity: 10,
        offeredPricePerUnit: 50,
        createdByUserId: 1,
        ...overrides,
    };
}

describe('OfferService extended coverage - Part 3 (unit)', () => {
    describe('getOfferById() — SQL path', () => {
        it('throws 404 when offer SQL returns null result', async () => {
            const offersRepo = createStubRepo();
            // When execute returns null, offer?.[0] is undefined, ?? offer gives null, triggers 404
            offersRepo.dataSource = { execute: sinon.stub().resolves(null) };
            const svc = buildOfferService({ offersRepo });

            await expect(svc.getOfferById(999, makeUserProfile()))
                .to.be.rejectedWith('Offer not found');
        });

        it('returns offer data when found as buyer', async () => {
            const offersRepo = createStubRepo();
            offersRepo.dataSource = {
                execute: sinon.stub().resolves([{
                    id: 1,
                    status: OfferStatusEnum.APPROVED,
                    state: OfferState.ACTIVE,
                    buyer_company_id: 10,
                    seller_company_id: 20,
                    listing_id: 1,
                    offered_price_per_unit: 50,
                    total_price: 500,
                    currency: 'gbp',
                    quantity: 10,
                    created_by_user_id: 1,
                    listing_location_id: null,
                }]),
            };
            const listingDocsRepo = createStubRepo();
            listingDocsRepo.find.resolves([]);
            const svc = buildOfferService({ offersRepo, listingDocsRepo });

            const result = await svc.getOfferById(1, makeUserProfile({ companyId: 10 }));
            expect(result.status).to.equal('success');
        });

        it('allows admin to view any offer regardless of company', async () => {
            const offersRepo = createStubRepo();
            offersRepo.dataSource = {
                execute: sinon.stub().resolves([{
                    id: 1,
                    status: OfferStatusEnum.PENDING,
                    state: OfferState.PENDING,
                    buyer_company_id: 10,
                    seller_company_id: 20,
                    listing_id: 1,
                    offered_price_per_unit: 50,
                    total_price: 500,
                    currency: 'gbp',
                    quantity: 10,
                    created_by_user_id: 1,
                    listing_location_id: null,
                    rejection_source: null,
                }]),
            };
            const listingDocsRepo = createStubRepo();
            listingDocsRepo.find.resolves([]);
            const svc = buildOfferService({ offersRepo, listingDocsRepo });

            // Admin passes isAdmin=true
            const result = await svc.getOfferById(1, makeUserProfile({ globalRole: UserRoleEnum.ADMIN }), true);
            expect(result.status).to.equal('success');
        });

        it('throws 403 when seller views admin-rejected offer', async () => {
            const offersRepo = createStubRepo();
            offersRepo.dataSource = {
                execute: sinon.stub().resolves([{
                    id: 1,
                    status: OfferStatusEnum.REJECTED,
                    state: OfferState.CLOSED,
                    buyer_company_id: 10,
                    seller_company_id: 20,
                    listing_id: 1,
                    offered_price_per_unit: 50,
                    total_price: 500,
                    currency: 'gbp',
                    quantity: 10,
                    created_by_user_id: 1,
                    listing_location_id: null,
                    rejection_source: 'admin',
                }]),
            };
            const svc = buildOfferService({ offersRepo });

            // Seller (companyId=20) views admin-rejected offer
            await expect(svc.getOfferById(1, makeUserProfile({ companyId: 20 }), false))
                .to.be.rejectedWith('This offer is not available');
        });

        it('throws 403 when seller views pending offer they did not create', async () => {
            const offersRepo = createStubRepo();
            offersRepo.dataSource = {
                execute: sinon.stub().resolves([{
                    id: 1,
                    status: OfferStatusEnum.PENDING,
                    state: OfferState.PENDING,
                    buyer_company_id: 10,
                    seller_company_id: 20,
                    listing_id: 1,
                    offered_price_per_unit: 50,
                    total_price: 500,
                    currency: 'gbp',
                    quantity: 10,
                    created_by_user_id: 5,   // not this user
                    listing_location_id: null,
                    rejection_source: null,
                }]),
            };
            const svc = buildOfferService({ offersRepo });

            // Seller companyId=20, userId=99 (not creator 5) — allowedStates check fails
            await expect(svc.getOfferById(1, makeUserProfile({ id: 99, companyId: 20 }), false))
                .to.be.rejectedWith('This offer is not available');
        });
    });

    describe('getOffersAdmin() — filter coverage', () => {
        it('applies buyerCompanyName filter in admin offers SQL', async () => {
            const offersRepo = createStubRepo();
            const capturedSqls: string[] = [];
            offersRepo.dataSource = {
                execute: sinon.stub().callsFake((sql: string, params?: any[]) => {
                    capturedSqls.push(String(sql));
                    if (params && params.length > 0) return Promise.resolve([]);
                    return Promise.resolve([{ totalCount: 0 }]);
                }),
            };
            const svc = buildOfferService({ offersRepo });

            await svc.getOffersAdmin({ where: { buyerCompanyName: 'Acme' } as any });
            expect(capturedSqls.some(s => s.includes('Acme'))).to.be.true();
        });

        it('applies sellerCompanyName filter in admin offers SQL', async () => {
            const offersRepo = createStubRepo();
            const capturedSqls: string[] = [];
            offersRepo.dataSource = {
                execute: sinon.stub().callsFake((sql: string, params?: any[]) => {
                    capturedSqls.push(String(sql));
                    if (params && params.length > 0) return Promise.resolve([]);
                    return Promise.resolve([{ totalCount: 0 }]);
                }),
            };
            const svc = buildOfferService({ offersRepo });

            await svc.getOffersAdmin({ where: { sellerCompanyName: 'BetaCorp' } as any });
            expect(capturedSqls.some(s => s.includes('BetaCorp'))).to.be.true();
        });

        it('applies state filter in admin offers SQL', async () => {
            const offersRepo = createStubRepo();
            const capturedSqls: string[] = [];
            offersRepo.dataSource = {
                execute: sinon.stub().callsFake((sql: string, params?: any[]) => {
                    capturedSqls.push(String(sql));
                    if (params && params.length > 0) return Promise.resolve([]);
                    return Promise.resolve([{ totalCount: 0 }]);
                }),
            };
            const svc = buildOfferService({ offersRepo });

            await svc.getOffersAdmin({ where: { state: OfferState.ACTIVE } as any });
            expect(capturedSqls.some(s => s.includes('active'))).to.be.true();
        });

        it('applies sortBy buyerCompanyNameAsc in admin offers SQL', async () => {
            const offersRepo = createStubRepo();
            const capturedSqls: string[] = [];
            offersRepo.dataSource = {
                execute: sinon.stub().callsFake((sql: string, params?: any[]) => {
                    capturedSqls.push(String(sql));
                    if (params && params.length > 0) return Promise.resolve([]);
                    return Promise.resolve([{ totalCount: 0 }]);
                }),
            };
            const svc = buildOfferService({ offersRepo });

            await svc.getOffersAdmin({ where: { sortBy: OfferSortBy.BUYER_COMPANY_NAME_ASC } as any });
            expect(capturedSqls.some(s => s.includes('bc.name ASC'))).to.be.true();
        });

        it('applies searchTerm filter in admin offers SQL', async () => {
            const offersRepo = createStubRepo();
            const capturedSqls: string[] = [];
            offersRepo.dataSource = {
                execute: sinon.stub().callsFake((sql: string, params?: any[]) => {
                    capturedSqls.push(String(sql));
                    if (params && params.length > 0) return Promise.resolve([]);
                    return Promise.resolve([{ totalCount: 0 }]);
                }),
            };
            const svc = buildOfferService({ offersRepo });

            await svc.getOffersAdmin({ where: { searchTerm: 'polymer' } as any });
            expect(capturedSqls.some(s => s.toLowerCase().includes('polymer'))).to.be.true();
        });

        it('applies listingId filter in admin offers SQL', async () => {
            const offersRepo = createStubRepo();
            const capturedSqls: string[] = [];
            offersRepo.dataSource = {
                execute: sinon.stub().callsFake((sql: string, params?: any[]) => {
                    capturedSqls.push(String(sql));
                    if (params && params.length > 0) return Promise.resolve([]);
                    return Promise.resolve([{ totalCount: 0 }]);
                }),
            };
            const svc = buildOfferService({ offersRepo });

            await svc.getOffersAdmin({ where: { listingId: 77 } as any });
            expect(capturedSqls.some(s => s.includes('77'))).to.be.true();
        });

        it('returns formatted results with currency conversion', async () => {
            const offersRepo = createStubRepo();
            offersRepo.dataSource = {
                execute: sinon.stub().callsFake((_sql: string, params?: any[]) => {
                    if (params && params.length > 0) {
                        return Promise.resolve([{
                            id: 1,
                            status: OfferStatusEnum.PENDING,
                            state: OfferState.PENDING,
                            offered_price_per_unit: 50,
                            total_price: 500,
                            currency: 'gbp',
                            quantity: 10,
                            created_at: new Date(),
                        }]);
                    }
                    return Promise.resolve([{ totalCount: 1 }]);
                }),
            };
            const exchangeRateService = {
                convertOfferToBaseCurrency: sinon.stub().resolves({ offeredPricePerUnit: 50, totalPrice: 500, currency: 'gbp', originalCurrency: 'gbp' }),
                convertToBaseCurrency: sinon.stub().resolves(50),
                baseCurrencyCode: 'gbp',
            };
            const svc = buildOfferService({ offersRepo, exchangeRateService });

            const result = await svc.getOffersAdmin({ skip: 0, limit: 20 });
            expect(result.totalCount).to.equal(1);
            expect(result.results).to.have.length(1);
        });
    });

    describe('handleRequestAction() — extended branch coverage', () => {
        it('accept: clamps remainingQuantity to 0 when offer qty exceeds remaining', async () => {
            const offersRepo = createStubRepo();
            offersRepo.findById.resolves(makeOffer({ quantity: 200 })); // more than remaining
            offersRepo.updateById.resolves();
            offersRepo.updateAll.resolves();
            const listingsRepo = createStubRepo();
            listingsRepo.findById.resolves(makeListing({ remainingQuantity: 50 }));
            listingsRepo.updateById.resolves();
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 99 });
            const companyLocationsRepo = createStubRepo();
            companyLocationsRepo.findById.resolves(null);
            const companyUsersRepo = createStubRepo();
            companyUsersRepo.find.resolves([]);
            const svc = buildOfferService({ offersRepo, listingsRepo, userRepo, companyLocationsRepo, companyUsersRepo });

            await svc.handleRequestAction(1, OfferRequestActionEnum.ACCEPT, makeUserProfile({ id: 5 }));

            // updateAll called because remainingQty hit 0
            expect(offersRepo.updateAll.called).to.be.true();
            const updateAllData = offersRepo.updateAll.firstCall.args[0];
            expect(updateAllData.rejectionSource).to.equal('system');
        });

        it('reject: sets correct rejectionSource as seller', async () => {
            const offersRepo = createStubRepo();
            offersRepo.findById.resolves(makeOffer());
            offersRepo.updateById.resolves();
            const listingsRepo = createStubRepo();
            listingsRepo.findById.resolves(makeListing());
            const svc = buildOfferService({ offersRepo, listingsRepo });

            await svc.handleRequestAction(1, OfferRequestActionEnum.REJECT, makeUserProfile({ id: 5 }),
                { rejectionReason: 'Price not acceptable' });

            const updateArg = offersRepo.updateById.firstCall.args[1];
            expect(updateArg.status).to.equal(OfferStatusEnum.REJECTED);
            expect(updateArg.state).to.equal(OfferState.CLOSED);
            expect(updateArg.rejectionSource).to.equal('seller');
            expect(updateArg.rejectedByUserId).to.equal(5);
        });

        it('throws 404 for unknown action', async () => {
            const offersRepo = createStubRepo();
            offersRepo.findById.resolves(makeOffer());
            const listingsRepo = createStubRepo();
            listingsRepo.findById.resolves(makeListing());
            const svc = buildOfferService({ offersRepo, listingsRepo });

            await expect(svc.handleRequestAction(1, 'counter_offer' as any, makeUserProfile()))
                .to.be.rejected();
        });

        it('throws 400 when listing status is not AVAILABLE', async () => {
            const offersRepo = createStubRepo();
            offersRepo.findById.resolves(makeOffer());
            const listingsRepo = createStubRepo();
            listingsRepo.findById.resolves(makeListing({ status: ListingStatus.SOLD }));
            const svc = buildOfferService({ offersRepo, listingsRepo });

            await expect(svc.handleRequestAction(1, OfferRequestActionEnum.ACCEPT, makeUserProfile()))
                .to.be.rejected();
        });
    });

    describe('handleAdminRequestAction() — extended branch coverage', () => {
        it('accept: uses default rejection reason when none provided on reject', async () => {
            const offersRepo = createStubRepo();
            offersRepo.findById.onFirstCall().resolves(makeOffer({ status: OfferStatusEnum.PENDING, state: OfferState.PENDING }));
            offersRepo.findById.onSecondCall().resolves(makeOffer({ status: OfferStatusEnum.REJECTED }));
            offersRepo.updateById.resolves();
            const listingsRepo = createStubRepo();
            listingsRepo.findById.resolves(makeListing());
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1, email: 'u@t.com' });
            const svc = buildOfferService({ offersRepo, listingsRepo, userRepo });

            await svc.handleAdminRequestAction(1, OfferRequestActionEnum.REJECT);

            const updateArg = offersRepo.updateById.firstCall.args[1];
            expect(updateArg.rejectionReason).to.equal('Unsuitable offer');
            expect(updateArg.rejectionSource).to.equal('admin');
        });

        it('reject: Other reason uses message field for rejection reason', async () => {
            const offersRepo = createStubRepo();
            offersRepo.findById.onFirstCall().resolves(makeOffer({ status: OfferStatusEnum.PENDING, state: OfferState.PENDING }));
            offersRepo.findById.onSecondCall().resolves(makeOffer({ status: OfferStatusEnum.REJECTED }));
            offersRepo.updateById.resolves();
            const listingsRepo = createStubRepo();
            listingsRepo.findById.resolves(makeListing());
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1, email: 'u@t.com' });
            const svc = buildOfferService({ offersRepo, listingsRepo, userRepo });

            await svc.handleAdminRequestAction(1, OfferRequestActionEnum.REJECT, {
                rejectionReason: 'Other',
                message: 'Specific custom reason',
            });

            const updateArg = offersRepo.updateById.firstCall.args[1];
            expect(updateArg.rejectionReason).to.equal('Specific custom reason');
        });

        it('request_information: stores message on offer record', async () => {
            const offersRepo = createStubRepo();
            offersRepo.findById.onFirstCall().resolves(makeOffer({ status: OfferStatusEnum.PENDING, state: OfferState.PENDING }));
            offersRepo.findById.onSecondCall().resolves(makeOffer({ status: OfferStatusEnum.PENDING, message: 'Check your docs' }));
            offersRepo.updateById.resolves();
            const listingsRepo = createStubRepo();
            listingsRepo.findById.resolves(makeListing());
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1, email: 'u@t.com' });
            const svc = buildOfferService({ offersRepo, listingsRepo, userRepo });

            await svc.handleAdminRequestAction(1, OfferRequestActionEnum.REQUEST_INFORMATION, {
                message: 'Check your docs',
            });

            const updateArg = offersRepo.updateById.firstCall.args[1];
            expect(updateArg.message).to.equal('Check your docs');
            expect(updateArg.status).to.equal(OfferStatusEnum.PENDING);
            expect(updateArg.state).to.equal(OfferState.PENDING);
        });

        it('accept: sends status updated email after successful accept', async () => {
            const offersRepo = createStubRepo();
            offersRepo.findById.onFirstCall().resolves(makeOffer({ status: OfferStatusEnum.PENDING, state: OfferState.PENDING, createdByUserId: 5 }));
            offersRepo.findById.onSecondCall().resolves(makeOffer({ status: OfferStatusEnum.APPROVED }));
            offersRepo.updateById.resolves();
            const listingsRepo = createStubRepo();
            listingsRepo.findById.resolves(makeListing());
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 5, email: 'buyer@t.com' });
            const companyLocationsRepo = createStubRepo();
            companyLocationsRepo.findById.resolves(null);
            const companyUsersRepo = createStubRepo();
            companyUsersRepo.find.resolves([]);
            const emailService = createStubService([
                'sendOfferAcceptEmail',
                'sendOfferRejectionEmail',
                'sendOfferRequestInformationEmail',
                'sendNewHaulageOpportunityEmail',
                'sendOfferStatusUpdatedEmail',
            ]);
            const notificationsService = createStubService(['createNotification']);
            const svc = buildOfferService({ offersRepo, listingsRepo, userRepo, companyLocationsRepo, companyUsersRepo, emailService, notificationsService });

            await svc.handleAdminRequestAction(1, OfferRequestActionEnum.ACCEPT);

            expect(offersRepo.updateById.calledWith(1, sinon.match({
                status: OfferStatusEnum.APPROVED,
                state: OfferState.ACTIVE,
            }))).to.be.true();
            expect(emailService.sendOfferStatusUpdatedEmail.called).to.be.true();
        });
    });

    describe('getOfferCompanies()', () => {
        it('returns buyer and seller companies from SQL', async () => {
            const offersRepo = createStubRepo();
            offersRepo.dataSource = {
                execute: sinon.stub().resolves([{
                    buyer_companies: JSON.stringify([{ id: 10, name: 'Buyer Co' }]),
                    seller_companies: JSON.stringify([{ id: 20, name: 'Seller Co' }]),
                }]),
            };
            const svc = buildOfferService({ offersRepo });

            const result = await svc.getOfferCompanies();
            expect(result).to.have.property('buyerCompanies');
            expect(result).to.have.property('sellerCompanies');
        });

        it('returns empty arrays when no companies found', async () => {
            const offersRepo = createStubRepo();
            offersRepo.dataSource = {
                execute: sinon.stub().resolves([{
                    buyer_companies: null,
                    seller_companies: null,
                }]),
            };
            const svc = buildOfferService({ offersRepo });

            const result = await svc.getOfferCompanies();
            expect(result.buyerCompanies).to.deepEqual([]);
            expect(result.sellerCompanies).to.deepEqual([]);
        });
    });
});
