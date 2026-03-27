/**
 * company-document.service-2.unit.ts
 * Coverage for: updateCompanyDocuments, createCompanyDocument boxClearingAgent path
 */
import { expect, sinon } from '@loopback/testlab';
import { CompanyDocumentService } from '../../services/company-document.service';
import { CompanyDocumentStatus, CompanyUserRoleEnum, UserStatus } from '../../enum';
import { createStubRepo } from '../helpers/stub-factory';

function buildSvc(overrides: Record<string, any> = {}) {
    const companyDocsRepo = overrides.companyDocsRepo ?? createStubRepo();
    const companyUserRepo = overrides.companyUserRepo ?? createStubRepo();
    const companiesRepo = overrides.companiesRepo ?? createStubRepo();
    const sfSync = overrides.sfSync ?? { syncCompanyDocument: sinon.stub().resolves() };
    const svc = new (CompanyDocumentService as any)(companyDocsRepo, companyUserRepo, companiesRepo, sfSync);
    return { svc, companyDocsRepo, companyUserRepo, companiesRepo };
}

describe('CompanyDocumentService Part 2 (unit)', () => {
    describe('updateCompanyDocuments()', () => {
        it('throws 403 when user is not company admin', async () => {
            const companyUserRepo = createStubRepo();
            companyUserRepo.findOne.resolves(null);
            const { svc } = buildSvc({ companyUserRepo });
            await expect(svc.updateCompanyDocuments([], 10, 5)).to.be.rejected();
        });

        it('updates existing document and deletes removed ones', async () => {
            const companyUserRepo = createStubRepo();
            companyUserRepo.findOne.resolves({ id: 1, userId: 5, companyId: 10, user: { status: UserStatus.ACTIVE } });
            const companyDocsRepo = createStubRepo();
            companyDocsRepo.find.resolves([{ id: 100, companyId: 10 }, { id: 101, companyId: 10 }]);
            companyDocsRepo.updateById.resolves();
            companyDocsRepo.findById.resolves({ id: 100, companyId: 10, status: CompanyDocumentStatus.ACTIVE });
            companyDocsRepo.deleteById = sinon.stub().resolves();
            const { svc } = buildSvc({ companyDocsRepo, companyUserRepo });

            const result = await svc.updateCompanyDocuments(
                [{ id: 100, documentType: 'cert', documentName: 'cert.pdf', documentUrl: 'url', expiryDate: null }],
                10, 5,
            );
            expect(result.status).to.equal('success');
            expect(companyDocsRepo.updateById.calledOnce).to.be.true();
            // doc 101 should be deleted
            expect(companyDocsRepo.deleteById.calledWith(101)).to.be.true();
        });

        it('creates new document when no id provided', async () => {
            const companyUserRepo = createStubRepo();
            companyUserRepo.findOne.resolves({ id: 1, userId: 5, companyId: 10, user: { status: UserStatus.ACTIVE } });
            const companyDocsRepo = createStubRepo();
            companyDocsRepo.find.resolves([]);
            companyDocsRepo.create.resolves({ id: 200, companyId: 10 });
            const { svc } = buildSvc({ companyDocsRepo, companyUserRepo });

            const result = await svc.updateCompanyDocuments(
                [{ documentType: 'cert', documentName: 'cert.pdf', documentUrl: 'url', expiryDate: null }],
                10, 5,
            );
            expect(result.status).to.equal('success');
            expect(companyDocsRepo.create.calledOnce).to.be.true();
        });

        it('throws 404 when updating nonexistent document', async () => {
            const companyUserRepo = createStubRepo();
            companyUserRepo.findOne.resolves({ id: 1, userId: 5, companyId: 10, user: { status: UserStatus.ACTIVE } });
            const companyDocsRepo = createStubRepo();
            companyDocsRepo.find.resolves([]);
            const { svc } = buildSvc({ companyDocsRepo, companyUserRepo });

            await expect(svc.updateCompanyDocuments(
                [{ id: 999, documentType: 'cert' }],
                10, 5,
            )).to.be.rejectedWith(/not found/);
        });

        it('sets REJECTED status when user status is REJECTED', async () => {
            const companyUserRepo = createStubRepo();
            companyUserRepo.findOne.resolves({ id: 1, userId: 5, companyId: 10, user: { status: UserStatus.REJECTED } });
            const companyDocsRepo = createStubRepo();
            companyDocsRepo.find.resolves([]);
            companyDocsRepo.create.resolves({ id: 300, companyId: 10 });
            const { svc } = buildSvc({ companyDocsRepo, companyUserRepo });

            await svc.updateCompanyDocuments(
                [{ documentType: 'cert', documentUrl: 'url' }],
                10, 5,
            );
            const createArg = companyDocsRepo.create.firstCall.args[0];
            expect(createArg.status).to.equal(CompanyDocumentStatus.REJECTED);
        });

        it('sets REQUEST_INFORMATION status when user status matches', async () => {
            const companyUserRepo = createStubRepo();
            companyUserRepo.findOne.resolves({ id: 1, userId: 5, companyId: 10, user: { status: UserStatus.REQUEST_INFORMATION } });
            const companyDocsRepo = createStubRepo();
            companyDocsRepo.find.resolves([]);
            companyDocsRepo.create.resolves({ id: 301, companyId: 10 });
            const { svc } = buildSvc({ companyDocsRepo, companyUserRepo });

            await svc.updateCompanyDocuments(
                [{ documentType: 'cert', documentUrl: 'url' }],
                10, 5,
            );
            const createArg = companyDocsRepo.create.firstCall.args[0];
            expect(createArg.status).to.equal(CompanyDocumentStatus.REQUEST_INFORMATION);
        });
    });

    describe('createCompanyDocument() — boxClearingAgent path', () => {
        it('updates company boxClearingAgent when provided', async () => {
            const companyUserRepo = createStubRepo();
            companyUserRepo.findOne.resolves({ id: 1 });
            const companyDocsRepo = createStubRepo();
            companyDocsRepo.find.resolves([]);
            companyDocsRepo.create.resolves({ id: 50 });
            const companiesRepo = createStubRepo();
            companiesRepo.findOne.resolves({ id: 10, name: 'Co' });
            companiesRepo.updateById.resolves();
            const { svc } = buildSvc({ companyUserRepo, companyDocsRepo, companiesRepo });

            const profile = { id: 5, companyId: 10, globalRole: 'user', companyRole: 'admin' };
            const result = await svc.createCompanyDocument(
                { documents: [{ documentType: 'cert', documentUrl: 'url' }], boxClearingAgent: 'AgentX' } as any,
                profile as any,
            );
            expect(result.status).to.equal('success');
            expect(companiesRepo.updateById.calledOnce).to.be.true();
        });
    });
});
