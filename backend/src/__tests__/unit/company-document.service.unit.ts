import { expect, sinon } from '@loopback/testlab';
import { CompanyDocumentService } from '../../services/company-document.service';
import { CompanyUserRoleEnum } from '../../enum';

function makeDocsRepo(overrides = {}) {
    return {
        find: sinon.stub().resolves([]),
        create: sinon.stub().resolves({ id: 1, documentType: 'ENVIRONMENTAL_PERMIT', status: 'pending' }),
        deleteAll: sinon.stub().resolves(),
        findById: sinon.stub().resolves({ id: 1 }),
        updateById: sinon.stub().resolves(),
        deleteById: sinon.stub().resolves(),
        ...overrides,
    } as any;
}

function makeCompanyUsersRepo(companyUser: object | null) {
    return { findOne: sinon.stub().resolves(companyUser) } as any;
}

function makeCompaniesRepo(company: object | null = null) {
    return {
        findOne: sinon.stub().resolves(company),
        updateById: sinon.stub().resolves(),
    } as any;
}

const adminUserProfile: any = { id: 1, companyId: 5 };
const companyAdminRecord = { id: 10, userId: 1, companyId: 5, companyRole: CompanyUserRoleEnum.ADMIN, user: { status: 'active' } };

describe('CompanyDocumentService (unit)', () => {
    describe('createCompanyDocument', () => {
        it('creates documents and returns success', async () => {
            const docsRepo = makeDocsRepo();
            const usersRepo = makeCompanyUsersRepo(companyAdminRecord);
            const companiesRepo = makeCompaniesRepo();
            const service = new CompanyDocumentService(docsRepo, usersRepo, companiesRepo);

            const payload: any = {
                documents: [
                    { documentType: 'ENVIRONMENTAL_PERMIT', documentUrl: 'http://example.com/doc.pdf' },
                ],
            };

            const result = await service.createCompanyDocument(payload, adminUserProfile);

            expect(docsRepo.create.calledOnce).to.be.true();
            expect(result.status).to.equal('success');
        });

        it('throws 401 when user is not company admin', async () => {
            const docsRepo = makeDocsRepo();
            const usersRepo = makeCompanyUsersRepo(null);
            const service = new CompanyDocumentService(docsRepo, usersRepo, makeCompaniesRepo());

            const payload: any = { documents: [{ documentType: 'ENVIRONMENTAL_PERMIT', documentUrl: 'http://x.com/d.pdf' }] };

            await expect(service.createCompanyDocument(payload, adminUserProfile)).to.be.rejectedWith(/unauthorized/i);
        });

        it('deletes existing documents before creating new ones', async () => {
            const existing = [{ id: 1, companyId: 5 }];
            const docsRepo = makeDocsRepo({ find: sinon.stub().resolves(existing) });
            const usersRepo = makeCompanyUsersRepo(companyAdminRecord);
            const service = new CompanyDocumentService(docsRepo, usersRepo, makeCompaniesRepo());

            const payload: any = { documents: [{ documentType: 'ENVIRONMENTAL_PERMIT', documentUrl: 'http://x.com/d.pdf' }] };

            await service.createCompanyDocument(payload, adminUserProfile);

            expect(docsRepo.deleteAll.calledOnce).to.be.true();
        });

        it('throws 422 for invalid expiry date format', async () => {
            const docsRepo = makeDocsRepo();
            const usersRepo = makeCompanyUsersRepo(companyAdminRecord);
            const service = new CompanyDocumentService(docsRepo, usersRepo, makeCompaniesRepo());

            const payload: any = {
                documents: [
                    { documentType: 'ENVIRONMENTAL_PERMIT', documentUrl: 'http://x.com/d.pdf', expiryDate: 'not-a-date' },
                ],
            };

            await expect(service.createCompanyDocument(payload, adminUserProfile)).to.be.rejectedWith(/invalid-expiry-date/);
        });
    });

    describe('updateCompanyDocuments', () => {
        it('throws 403 when user is not company admin', async () => {
            const docsRepo = makeDocsRepo();
            const usersRepo = makeCompanyUsersRepo(null);
            const service = new CompanyDocumentService(docsRepo, usersRepo, makeCompaniesRepo());

            await expect(service.updateCompanyDocuments([], 5, 1)).to.be.rejectedWith(/forbidden/i);
        });

        it('creates new document when no id provided', async () => {
            const docsRepo = makeDocsRepo({ find: sinon.stub().resolves([]) });
            const usersRepo = makeCompanyUsersRepo({ ...companyAdminRecord });
            const service = new CompanyDocumentService(docsRepo, usersRepo, makeCompaniesRepo());

            const docs: any[] = [{ documentType: 'WASTE_EXEMPTION', documentUrl: 'http://x.com/d.pdf', documentName: 'Waste' }];
            const result = await service.updateCompanyDocuments(docs, 5, 1);

            expect(docsRepo.create.calledOnce).to.be.true();
            expect(result.status).to.equal('success');
        });

        it('updates existing document when id provided', async () => {
            const existingDoc = { id: 7, documentType: 'ENVIRONMENTAL_PERMIT', documentName: 'Old', documentUrl: 'http://x.com/old.pdf', expiryDate: null };
            const docsRepo = makeDocsRepo({
                find: sinon.stub().resolves([existingDoc]),
                findById: sinon.stub().resolves({ id: 7 }),
            });
            const usersRepo = makeCompanyUsersRepo({ ...companyAdminRecord });
            const service = new CompanyDocumentService(docsRepo, usersRepo, makeCompaniesRepo());

            const docs: any[] = [{ id: 7, documentType: 'ENVIRONMENTAL_PERMIT', documentName: 'New', documentUrl: 'http://x.com/new.pdf' }];
            const result = await service.updateCompanyDocuments(docs, 5, 1);

            expect(docsRepo.updateById.calledOnce).to.be.true();
            expect(result.status).to.equal('success');
        });

        it('deletes documents not present in update list', async () => {
            const existingDocs = [
                { id: 7, documentType: 'ENVIRONMENTAL_PERMIT', documentName: 'Doc', documentUrl: 'http://x.com/d.pdf' },
                { id: 8, documentType: 'WASTE_EXEMPTION', documentName: 'Doc2', documentUrl: 'http://x.com/d2.pdf' },
            ];
            const docsRepo = makeDocsRepo({
                find: sinon.stub().resolves(existingDocs),
                findById: sinon.stub().resolves({ id: 7 }),
            });
            const usersRepo = makeCompanyUsersRepo({ ...companyAdminRecord });
            const service = new CompanyDocumentService(docsRepo, usersRepo, makeCompaniesRepo());

            // Only keep id=7
            const docs: any[] = [{ id: 7, documentType: 'ENVIRONMENTAL_PERMIT', documentName: 'Doc', documentUrl: 'http://x.com/d.pdf' }];
            await service.updateCompanyDocuments(docs, 5, 1);

            expect(docsRepo.deleteById.calledOnce).to.be.true();
            expect(docsRepo.deleteById.firstCall.args[0]).to.equal(8);
        });
    });
});
