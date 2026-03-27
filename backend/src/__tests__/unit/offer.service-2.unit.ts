import { expect, sinon } from '@loopback/testlab';
import { OfferService } from '../../services/offer.service';
import { ListingStatus, ListingType } from '../../enum';
import { OfferRequestActionEnum, OfferState, OfferStatusEnum } from '../../enum/offer.enum';
import { UserRoleEnum } from '../../enum';
import { createStubRepo, createStubService } from '../helpers/stub-factory';

function makeUserProfile(overrides: Record<string, any> = {}): any {
    return { id: 1, globalRole: UserRoleEnum.USER, companyId: 10, ...overrides };
}

function buildOfferService(overrides: Record<string, any> = {}): OfferService {
    const exchangeRateService = overrides.exchangeRateService ?? {
        convertOfferToBaseCurrency: sinon.stub().resolves({ offeredPricePerUnit: 100, totalPrice: 1000, currency: 'gbp', originalCurrency: 'gbp' }),
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

describe('OfferService deeper coverage (unit)', () => {
    describe('getOffers() — raw SQL path', () => {
        it('returns paginated results as buyer (isSeller=false)', async () => {
            const offersRepo = createStubRepo();
            // getOffers runs Promise.all([execute(countSql), execute(dataSql)]) — parallel
            offersRepo.dataSource = {
                execute: sinon.stub().callsFake((sql: string) => {
                    if (String(sql).includes('COUNT')) return Promise.resolve([{ totalCount: 1 }]);
                    return Promise.resolve([{ id: 1, listing_title: 'Test' }]);
                }),
            };
            const svc = buildOfferService({ offersRepo });

            const result = await svc.getOffers(
                { filter: { where: { isSeller: false } as any } },
                makeUserProfile(),
            );
            expect(result.totalCount).to.equal(1);
            expect(result.results).to.have.length(1);
        });

        it('returns paginated results as seller (isSeller=true)', async () => {
            const offersRepo = createStubRepo();
            offersRepo.dataSource = {
                execute: sinon.stub().callsFake((sql: string) => {
                    if (String(sql).includes('COUNT')) return Promise.resolve([{ totalCount: 2 }]);
                    return Promise.resolve([{ id: 1, listing_title: 'A' }, { id: 2, listing_title: 'B' }]);
                }),
            };
            const svc = buildOfferService({ offersRepo });

            const result = await svc.getOffers(
                { filter: { where: { isSeller: true } as any } },
                makeUserProfile(),
            );
            expect(result.totalCount).to.equal(2);
        });

        it('applies listingId filter when provided', async () => {
            const offersRepo = createStubRepo();
            const capturedSqls: string[] = [];
            offersRepo.dataSource = {
                execute: sinon.stub().callsFake((sql: string) => {
                    capturedSqls.push(String(sql));
                    if (String(sql).includes('COUNT')) return Promise.resolve([{ totalCount: 0 }]);
                    return Promise.resolve([]);
                }),
            };
            const svc = buildOfferService({ offersRepo });

            await svc.getOffers(
                { filter: { where: { listingId: 42, isSeller: true } as any } },
                makeUserProfile(),
            );
            expect(capturedSqls.some(s => s.includes('42'))).to.be.true();
        });

        it('applies materialItem filter when provided', async () => {
            const offersRepo = createStubRepo();
            const capturedSqls: string[] = [];
            offersRepo.dataSource = {
                execute: sinon.stub().callsFake((sql: string) => {
                    capturedSqls.push(String(sql));
                    if (String(sql).includes('COUNT')) return Promise.resolve([{ totalCount: 0 }]);
                    return Promise.resolve([]);
                }),
            };
            const svc = buildOfferService({ offersRepo });

            await svc.getOffers(
                { filter: { where: { isSeller: false, materialItem: 'plastic' } as any } },
                makeUserProfile(),
            );
            expect(capturedSqls.some(s => s.includes('plastic'))).to.be.true();
        });
    });

    describe('handleRequestAction() — extended', () => {
        it('throws 400 when listing is not AVAILABLE', async () => {
            const offersRepo = createStubRepo();
            offersRepo.findById.resolves(makeOffer());
            const listingsRepo = createStubRepo();
            listingsRepo.findById.resolves(makeListing({ status: ListingStatus.SOLD }));
            const svc = buildOfferService({ offersRepo, listingsRepo });

            await expect(svc.handleRequestAction(1, OfferRequestActionEnum.ACCEPT, makeUserProfile()))
                .to.be.rejectedWith(/available/i);
        });

        it('accept: reduces remaining quantity, does NOT mark SOLD when quantity remains', async () => {
            const offersRepo = createStubRepo();
            offersRepo.findById.resolves(makeOffer({ quantity: 10 }));
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

            const listingUpdate = listingsRepo.updateById.firstCall.args[1];
            expect(listingUpdate.remainingQuantity).to.equal(40); // 50 - 10
            expect(listingUpdate.status).to.be.undefined();  // not SOLD
        });

        it('accept: marks listing SOLD and rejects other offers when quantity hits zero', async () => {
            const offersRepo = createStubRepo();
            offersRepo.findById.resolves(makeOffer({ quantity: 100 }));
            offersRepo.updateById.resolves();
            offersRepo.updateAll.resolves();
            const listingsRepo = createStubRepo();
            listingsRepo.findById.resolves(makeListing({ remainingQuantity: 100, id: 1 }));
            listingsRepo.updateById.resolves();
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 99 });
            const companyLocationsRepo = createStubRepo();
            companyLocationsRepo.findById.resolves(null);
            const companyUsersRepo = createStubRepo();
            companyUsersRepo.find.resolves([]);
            const svc = buildOfferService({ offersRepo, listingsRepo, userRepo, companyLocationsRepo, companyUsersRepo });

            await svc.handleRequestAction(1, OfferRequestActionEnum.ACCEPT, makeUserProfile({ id: 5 }));

            // updateAll called to reject remaining offers
            expect(offersRepo.updateAll.called).to.be.true();
            const updateAllData = offersRepo.updateAll.firstCall.args[0];
            expect(updateAllData.status).to.equal(OfferStatusEnum.REJECTED);
            expect(updateAllData.rejectionSource).to.equal('system');
        });

        it('reject: uses default reason when none provided', async () => {
            const offersRepo = createStubRepo();
            offersRepo.findById.resolves(makeOffer());
            offersRepo.updateById.resolves();
            const listingsRepo = createStubRepo();
            listingsRepo.findById.resolves(makeListing());
            const svc = buildOfferService({ offersRepo, listingsRepo });

            await svc.handleRequestAction(1, OfferRequestActionEnum.REJECT, makeUserProfile());

            const updateArg = offersRepo.updateById.firstCall.args[1];
            expect(updateArg.rejectionReason).to.equal('Offer rejected by seller');
            expect(updateArg.rejectionSource).to.equal('seller');
        });

        it('throws 404 for unknown action', async () => {
            const offersRepo = createStubRepo();
            offersRepo.findById.resolves(makeOffer());
            const listingsRepo = createStubRepo();
            listingsRepo.findById.resolves(makeListing());
            const svc = buildOfferService({ offersRepo, listingsRepo });

            await expect(svc.handleRequestAction(1, 'unknown_action' as any, makeUserProfile()))
                .to.be.rejected();
        });
    });

    describe('handleAdminRequestAction() — extended', () => {
        it('request_information: uses default message when none provided', async () => {
            const offersRepo = createStubRepo();
            offersRepo.findById.onFirstCall().resolves(makeOffer({ status: OfferStatusEnum.PENDING, state: OfferState.PENDING }));
            offersRepo.findById.onSecondCall().resolves(makeOffer({ status: OfferStatusEnum.PENDING }));
            offersRepo.updateById.resolves();
            const listingsRepo = createStubRepo();
            listingsRepo.findById.resolves(makeListing());
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1, email: 'a@b.com' });
            const svc = buildOfferService({ offersRepo, listingsRepo, userRepo });

            await svc.handleAdminRequestAction(1, OfferRequestActionEnum.REQUEST_INFORMATION);

            const updateArg = offersRepo.updateById.firstCall.args[1];
            expect(updateArg.message).to.equal('Please check the offer and provide more information');
        });

        it('reject: uses "Other" rejection reason from message field', async () => {
            const offersRepo = createStubRepo();
            offersRepo.findById.onFirstCall().resolves(makeOffer({ status: OfferStatusEnum.PENDING, state: OfferState.PENDING }));
            offersRepo.findById.onSecondCall().resolves(makeOffer({ status: OfferStatusEnum.REJECTED }));
            offersRepo.updateById.resolves();
            const listingsRepo = createStubRepo();
            listingsRepo.findById.resolves(makeListing());
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 1, email: 'a@b.com' });
            const svc = buildOfferService({ offersRepo, listingsRepo, userRepo });

            await svc.handleAdminRequestAction(1, OfferRequestActionEnum.REJECT, {
                rejectionReason: 'Other',
                message: 'Custom reason text',
            });

            const updateArg = offersRepo.updateById.firstCall.args[1];
            expect(updateArg.rejectionReason).to.equal('Custom reason text');
        });

        it('throws 404 for unknown action', async () => {
            const offersRepo = createStubRepo();
            offersRepo.findById.onFirstCall().resolves(makeOffer({ status: OfferStatusEnum.PENDING }));
            const listingsRepo = createStubRepo();
            listingsRepo.findById.resolves(makeListing());
            const svc = buildOfferService({ offersRepo, listingsRepo });

            await expect(svc.handleAdminRequestAction(1, 'bad_action'))
                .to.be.rejected();
        });
    });

    describe('getOffersAdmin() — raw SQL path', () => {
        it('returns paginated admin results', async () => {
            const offersRepo = createStubRepo();
            // getOffersAdmin fires Promise.all([execute(countSql), execute(dataSql, [limit, skip])]) in parallel
            // The count query has no params; the data query receives [limit, skip] as second arg
            const executeStub = sinon.stub().callsFake((_sql: string, params?: any[]) => {
                if (params && params.length > 0) {
                    // data query — returns rows
                    return Promise.resolve([{ id: 1 }, { id: 2 }, { id: 3 }]);
                }
                // count query — returns totalCount
                return Promise.resolve([{ totalCount: 3 }]);
            });
            offersRepo.dataSource = { execute: executeStub };
            const svc = buildOfferService({ offersRepo });

            const result = await svc.getOffersAdmin({ skip: 0, limit: 20 });
            expect(result.totalCount).to.equal(3);
            expect(result.results).to.have.length(3);
        });

        it('applies status filter in admin SQL', async () => {
            const offersRepo = createStubRepo();
            const capturedSqls: string[] = [];
            offersRepo.dataSource = {
                execute: sinon.stub().callsFake((sql: string) => {
                    capturedSqls.push(String(sql));
                    if (String(sql).includes('COUNT')) return Promise.resolve([{ totalCount: 0 }]);
                    return Promise.resolve([]);
                }),
            };
            const svc = buildOfferService({ offersRepo });

            await svc.getOffersAdmin({ where: { status: OfferStatusEnum.PENDING } });
            expect(capturedSqls.some(s => s.includes('pending'))).to.be.true();
        });
    });
});
