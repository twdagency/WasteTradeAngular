import { expect, sinon } from '@loopback/testlab';
import { AccountStatusService } from '../../services/account-status.service';
import { CompanyStatus } from '../../enum';

function makeCompanyUsersRepo(company: object | null) {
    return {
        findOne: sinon.stub().resolves(company ? { company } : null),
    } as any;
}

function makeCompaniesRepo(company: object) {
    return {
        findById: sinon.stub().resolves(company),
        find: sinon.stub().resolves([]),
    } as any;
}

function makeDocsRepo(docs: object[] = []) {
    return { find: sinon.stub().resolves(docs) } as any;
}

function makeLocationsRepo(locations: object[] = []) {
    return { find: sinon.stub().resolves(locations) } as any;
}

function makeUserRepo() {
    return { findById: sinon.stub().resolves(null) } as any;
}

function makeService({
    company = { id: 1, status: CompanyStatus.ACTIVE, vatNumber: 'GB123', isHaulier: false },
    docs = [{ id: 1 }],
    locations = [{ id: 1 }],
    companyUserFound = true,
} = {}) {
    const companyUsersRepo = makeCompanyUsersRepo(companyUserFound ? company : null);
    const companiesRepo = makeCompaniesRepo(company);
    const docsRepo = makeDocsRepo(docs);
    const locationsRepo = makeLocationsRepo(locations);
    const userRepo = makeUserRepo();
    return new AccountStatusService(userRepo, companiesRepo, companyUsersRepo, docsRepo, locationsRepo);
}

describe('AccountStatusService (unit)', () => {
    describe('getAccountStatus', () => {
        it('returns showBanner false when no company associated', async () => {
            const service = makeService({ companyUserFound: false });

            const result = await service.getAccountStatus(1);

            expect(result.showBanner).to.be.false();
        });

        it('returns verification_failed for REJECTED company', async () => {
            const service = makeService({
                company: { id: 1, status: CompanyStatus.REJECTED, vatNumber: 'GB123', isHaulier: false },
            });

            const result = await service.getAccountStatus(1);

            expect(result.showBanner).to.be.true();
            expect(result.bannerType).to.equal('verification_failed');
        });

        it('returns verification_failed for REQUEST_INFORMATION company', async () => {
            const service = makeService({
                company: {
                    id: 1,
                    status: CompanyStatus.REQUEST_INFORMATION,
                    adminMessage: 'Please update docs',
                    vatNumber: 'GB123',
                    isHaulier: false,
                } as any,
            });

            const result = await service.getAccountStatus(1);

            expect(result.showBanner).to.be.true();
            expect(result.bannerType).to.equal('verification_failed');
            expect(result.message).to.equal('Please update docs');
        });

        it('returns incomplete_onboarding for PENDING company missing documents', async () => {
            const service = makeService({
                company: { id: 1, status: CompanyStatus.PENDING, vatNumber: 'GB123', isHaulier: false },
                docs: [],
                locations: [{ id: 1 }],
            });

            const result = await service.getAccountStatus(1);

            expect(result.showBanner).to.be.true();
            expect(result.bannerType).to.equal('incomplete_onboarding');
        });

        it('returns verification_pending for PENDING company with all steps complete', async () => {
            const service = makeService({
                company: { id: 1, status: CompanyStatus.PENDING, vatNumber: 'GB123', isHaulier: false },
                docs: [{ id: 1 }],
                locations: [{ id: 1 }],
            });

            const result = await service.getAccountStatus(1);

            expect(result.showBanner).to.be.true();
            expect(result.bannerType).to.equal('verification_pending');
        });

        it('returns showBanner false for fully active company', async () => {
            const service = makeService({
                company: { id: 1, status: CompanyStatus.ACTIVE, vatNumber: 'GB123', isHaulier: false },
                docs: [{ id: 1 }],
                locations: [{ id: 1 }],
            });

            const result = await service.getAccountStatus(1);

            expect(result.showBanner).to.be.false();
        });

        it('skips document/location checks for haulier companies', async () => {
            const service = makeService({
                company: { id: 1, status: CompanyStatus.PENDING, vatNumber: 'GB123', isHaulier: true },
                docs: [],
                locations: [],
            });

            const result = await service.getAccountStatus(1);

            // Haulier skips onboarding check → goes to verification_pending
            expect(result.bannerType).to.equal('verification_pending');
        });
    });
});
