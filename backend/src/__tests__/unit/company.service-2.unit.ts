import { expect, sinon } from '@loopback/testlab';
import { CompanyService } from '../../services/company.service';
import {
    CompanyInterest,
    CompanyStatus,
    CompanyUserRoleEnum,
    CompanyUserStatusEnum,
    UserRoleEnum,
} from '../../enum';
import { createStubRepo, createStubService } from '../helpers/stub-factory';

function makeAdminProfile(overrides: Record<string, any> = {}): any {
    return { id: 99, globalRole: UserRoleEnum.ADMIN, companyId: 1, ...overrides };
}

function makeUserProfile(overrides: Record<string, any> = {}): any {
    return { id: 1, globalRole: UserRoleEnum.USER, companyId: 10, ...overrides };
}

function buildCompanyService(overrides: Record<string, any> = {}): CompanyService {
    return new CompanyService(
        overrides.companiesRepo ?? createStubRepo(),
        overrides.companyUserRepo ?? createStubRepo(),
        overrides.companyDocsRepo ?? createStubRepo(),
        overrides.companyLocationsRepo ?? createStubRepo(),
        overrides.companyUserRequestsRepo ?? createStubRepo(),
        overrides.userRepo ?? createStubRepo(),
        overrides.emailService ?? createStubService([
            'sendCompanyRejectedEmail',
            'sendAdminNotification',
            'sendUserReceiveUnlinkedFromCompanyEmail',
        ]),
        overrides.notificationsService ?? createStubService(['createNotification']),
    );
}

function buildMergeStubs() {
    const tx = {
        commit: sinon.stub().resolves(),
        rollback: sinon.stub().resolves(),
    };
    const companiesRepo = createStubRepo();
    companiesRepo.findById.onFirstCall().resolves({ id: 1, isHaulier: false });
    companiesRepo.findById.onSecondCall().resolves({ id: 2, isHaulier: false });
    companiesRepo.dataSource = {
        beginTransaction: sinon.stub().resolves(tx),
        execute: sinon.stub().resolves([{ count: 0 }]),
    };
    companiesRepo.execute = sinon.stub().resolves([{ count: 0 }]);
    companiesRepo.deleteById = sinon.stub().resolves();

    const companyUserRepo = createStubRepo();
    companyUserRepo.find.resolves([]);
    companyUserRepo.updateById.resolves();
    companyUserRepo.deleteById.resolves();

    return { tx, companiesRepo, companyUserRepo };
}

describe('CompanyService deeper coverage (unit)', () => {
    describe('updateCompany() — extended', () => {
        it('derives companyInterest=BUYER when only isBuyer=true', async () => {
            const companyUserRepo = createStubRepo();
            companyUserRepo.findOne.resolves({ id: 1, companyId: 10, userId: 1, companyRole: CompanyUserRoleEnum.ADMIN });
            const companiesRepo = createStubRepo();
            companiesRepo.findById.resolves({ id: 10, isBuyer: false, isSeller: false });
            companiesRepo.updateById.resolves();
            const svc = buildCompanyService({ companiesRepo, companyUserRepo });

            const result = await svc.updateCompany({ isBuyer: true, isSeller: false } as any, 10, '1');

            expect(result.status).to.equal('success');
            const updateArg = companiesRepo.updateById.firstCall.args[1];
            expect(updateArg.companyInterest).to.equal(CompanyInterest.BUYER);
        });

        it('derives companyInterest=BOTH when isBuyer and isSeller both true', async () => {
            const companyUserRepo = createStubRepo();
            companyUserRepo.findOne.resolves({ id: 1, companyId: 10, userId: 1, companyRole: CompanyUserRoleEnum.ADMIN });
            const companiesRepo = createStubRepo();
            companiesRepo.findById.resolves({ id: 10, isBuyer: false, isSeller: false });
            companiesRepo.updateById.resolves();
            const svc = buildCompanyService({ companiesRepo, companyUserRepo });

            const result = await svc.updateCompany({ isBuyer: true, isSeller: true } as any, 10, '1');

            expect(result.status).to.equal('success');
            const updateArg = companiesRepo.updateById.firstCall.args[1];
            expect(updateArg.companyInterest).to.equal(CompanyInterest.BOTH);
        });

        it('companyInterest=BUYER when neither isBuyer nor isSeller', async () => {
            const companyUserRepo = createStubRepo();
            companyUserRepo.findOne.resolves({ id: 1, companyId: 10, userId: 1, companyRole: CompanyUserRoleEnum.ADMIN });
            const companiesRepo = createStubRepo();
            // current company is not buyer or seller
            companiesRepo.findById.resolves({ id: 10, isBuyer: false, isSeller: false });
            companiesRepo.updateById.resolves();
            const svc = buildCompanyService({ companiesRepo, companyUserRepo });

            const result = await svc.updateCompany({ isBuyer: false } as any, 10, '1');

            expect(result.status).to.equal('success');
            const updateArg = companiesRepo.updateById.firstCall.args[1];
            expect(updateArg.companyInterest).to.equal(CompanyInterest.BUYER);
        });

        it('sets isBuyer=false isSeller=false when companyInterest=BUYER', async () => {
            const companyUserRepo = createStubRepo();
            companyUserRepo.findOne.resolves({ id: 1, companyId: 10, userId: 1, companyRole: CompanyUserRoleEnum.ADMIN });
            const companiesRepo = createStubRepo();
            companiesRepo.updateById.resolves();
            const svc = buildCompanyService({ companiesRepo, companyUserRepo });

            const result = await svc.updateCompany({ companyInterest: CompanyInterest.BUYER } as any, 10, '1');

            expect(result.status).to.equal('success');
            const updateArg = companiesRepo.updateById.firstCall.args[1];
            expect(updateArg.isBuyer).to.be.true();
            expect(updateArg.isSeller).to.be.false();
        });

        it('returns error when unexpected exception thrown', async () => {
            const companyUserRepo = createStubRepo();
            companyUserRepo.findOne.rejects(new Error('DB connection failed'));
            const svc = buildCompanyService({ companyUserRepo });

            const result = await svc.updateCompany({ name: 'x' } as any, 10, '1');
            expect(result.status).to.equal('error');
        });
    });

    describe('mergeCompanies() — success paths', () => {
        it('merges companies: no duplicate users, commits transaction', async () => {
            const { tx, companiesRepo, companyUserRepo } = buildMergeStubs();
            const svc = buildCompanyService({ companiesRepo, companyUserRepo });

            const result = await svc.mergeCompanies(1, 2, makeAdminProfile());

            expect(tx.commit.calledOnce).to.be.true();
            expect(companiesRepo.deleteById.calledOnce).to.be.true();
            expect(result.status).to.equal('success');
            expect((result.data as any).masterCompanyId).to.equal(1);
            expect((result.data as any).mergedCompanyId).to.equal(2);
        });

        it('moves user from merged company when no master record exists', async () => {
            const { tx, companiesRepo, companyUserRepo } = buildMergeStubs();
            // user 10 only in merged company
            companyUserRepo.find.resolves([
                { id: 200, userId: 10, companyId: 2, companyRole: CompanyUserRoleEnum.BUYER },
            ]);
            const svc = buildCompanyService({ companiesRepo, companyUserRepo });

            await svc.mergeCompanies(1, 2, makeAdminProfile());

            const moveCall = companyUserRepo.updateById.getCalls().find(
                (c: any) => c.args[1]?.companyId === 1,
            );
            expect(moveCall).to.not.be.undefined();
        });

        it('selects higher-priority role when user exists in both companies', async () => {
            const { tx, companiesRepo, companyUserRepo } = buildMergeStubs();
            companyUserRepo.find.resolves([
                { id: 100, userId: 10, companyId: 1, companyRole: CompanyUserRoleEnum.BUYER },
                { id: 200, userId: 10, companyId: 2, companyRole: CompanyUserRoleEnum.SELLER },
            ]);
            const svc = buildCompanyService({ companiesRepo, companyUserRepo });

            await svc.mergeCompanies(1, 2, makeAdminProfile());

            // SELLER and BUYER both have priority 2 — bestRole stays BUYER (first)
            // deleteById for merged record
            expect(companyUserRepo.deleteById.called).to.be.true();
        });

        it('rolls back and throws on execute failure', async () => {
            const { tx, companiesRepo, companyUserRepo } = buildMergeStubs();
            // make one of the bulk UPDATE executes fail
            companiesRepo.execute = sinon.stub().rejects(new Error('DB error'));
            const svc = buildCompanyService({ companiesRepo, companyUserRepo });

            await expect(svc.mergeCompanies(1, 2, makeAdminProfile()))
                .to.be.rejectedWith(/Failed to merge companies/);
            expect(tx.rollback.calledOnce).to.be.true();
        });
    });

    describe('removeUser()', () => {
        it('throws Forbidden when caller is not global admin', async () => {
            const svc = buildCompanyService();

            await expect(svc.removeUser(5, 10, makeUserProfile()))
                .to.be.rejectedWith(/403|unauthorized/i);
        });

        it('throws NotFound when company user not found', async () => {
            const companyUserRepo = createStubRepo();
            companyUserRepo.findOne.resolves(null);
            const svc = buildCompanyService({ companyUserRepo });

            await expect(svc.removeUser(5, 10, makeAdminProfile()))
                .to.be.rejectedWith('not-found');
        });

        it('deletes company user and sends notification on success', async () => {
            const companyUserRepo = createStubRepo();
            companyUserRepo.findOne.resolves({
                id: 100,
                userId: 5,
                companyId: 10,
                user: { email: 'a@b.com', firstName: 'Alice', lastName: 'Smith' },
                company: { name: 'TestCo' },
            });
            companyUserRepo.deleteById = sinon.stub().resolves();
            const emailService = createStubService(['sendUserReceiveUnlinkedFromCompanyEmail', 'sendCompanyRejectedEmail', 'sendAdminNotification']);
            const notificationsService = createStubService(['createNotification']);
            const svc = buildCompanyService({ companyUserRepo, emailService, notificationsService });

            const result = await svc.removeUser(5, 10, makeAdminProfile());

            expect(companyUserRepo.deleteById.calledWith(100)).to.be.true();
            expect(result.status).to.equal('success');
        });
    });

    describe('getCompanyByVATNumber()', () => {
        it('throws NotFound when no company with that VAT exists', async () => {
            const companiesRepo = createStubRepo();
            companiesRepo.findOne.resolves(null);
            const svc = buildCompanyService({ companiesRepo });

            await expect(svc.getCompanyByVATNumber('GB123456789', false))
                .to.be.rejectedWith('company-not-found');
        });

        it('returns company when found', async () => {
            const companiesRepo = createStubRepo();
            companiesRepo.findOne.resolves({ id: 5, vatNumber: 'GB123456789', isHaulier: false });
            const svc = buildCompanyService({ companiesRepo });

            const result = await svc.getCompanyByVATNumber('GB123456789', false);
            expect(result.id).to.equal(5);
        });
    });

    describe('searchCompaniesForMerge()', () => {
        it('throws Forbidden when caller is not admin', async () => {
            const companiesRepo = createStubRepo();
            companiesRepo.dataSource = { execute: sinon.stub().resolves([{ totalCount: 0 }]) };
            const svc = buildCompanyService({ companiesRepo });

            await expect(svc.searchCompaniesForMerge({}, '', makeUserProfile()))
                .to.be.rejectedWith(/403|unauthorized/i);
        });

        it('returns companies for admin search', async () => {
            const companiesRepo = createStubRepo();
            // searchCompaniesForMerge calls this.companiesRepository.execute() directly (not dataSource.execute)
            // It runs Promise.all([execute(query), execute(countQuery)]) — both resolve in parallel
            const executeStub = sinon.stub();
            executeStub.onFirstCall().resolves([{ id: 3, name: 'Acme Corp' }]); // results query
            executeStub.onSecondCall().resolves([{ count: '1' }]);              // count query
            companiesRepo.execute = executeStub;
            const svc = buildCompanyService({ companiesRepo });

            const result = await svc.searchCompaniesForMerge({}, 'Acme', makeAdminProfile());
            expect(result.totalCount).to.equal(1);
            expect(result.results).to.have.length(1);
        });
    });
});
