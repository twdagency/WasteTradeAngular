import { expect, sinon } from '@loopback/testlab';
import { CompanyLocationDocumentService } from '../../services/company-location-document.service';
import { CompanyUserRoleEnum } from '../../enum';

function makeLocationDocsRepo(overrides = {}) {
    return {
        find: sinon.stub().resolves([]),
        create: sinon.stub().resolves({ id: 1, companyLocationId: 10 }),
        findById: sinon.stub().resolves({ id: 1 }),
        updateById: sinon.stub().resolves(),
        deleteById: sinon.stub().resolves(),
        ...overrides,
    } as any;
}

function makeCompanyUsersRepo(companyUser: object | null) {
    return { findOne: sinon.stub().resolves(companyUser) } as any;
}

function makeLocationsRepo(location: object | null) {
    return { findById: sinon.stub().resolves(location) } as any;
}

const companyAdminRecord = { id: 1, userId: 1, companyId: 5, companyRole: CompanyUserRoleEnum.ADMIN };
const location = { id: 10, companyId: 5 };

describe('CompanyLocationDocumentService (unit)', () => {
    describe('updateCompanyLocationDocuments', () => {
        it('creates new document when no id provided', async () => {
            const docsRepo = makeLocationDocsRepo();
            const service = new CompanyLocationDocumentService(
                docsRepo,
                makeCompanyUsersRepo(companyAdminRecord),
                makeLocationsRepo(location),
            );

            const docs: any[] = [{ documentType: 'ENVIRONMENTAL_PERMIT', documentName: 'EP', documentUrl: 'http://x.com/d.pdf' }];
            const result = await service.updateCompanyLocationDocuments(docs, 10, 1);

            expect(docsRepo.create.calledOnce).to.be.true();
            expect(result.status).to.equal('success');
            expect(result.data.companyLocationDocuments).to.have.length(1);
        });

        it('updates existing document when id matches', async () => {
            const existing = [{ id: 7, documentType: 'ENVIRONMENTAL_PERMIT', documentName: 'Old', documentUrl: 'http://x.com/old.pdf', expiryDate: null, status: 'active' }];
            const docsRepo = makeLocationDocsRepo({
                find: sinon.stub().resolves(existing),
                findById: sinon.stub().resolves({ id: 7 }),
            });
            const service = new CompanyLocationDocumentService(
                docsRepo,
                makeCompanyUsersRepo(companyAdminRecord),
                makeLocationsRepo(location),
            );

            const docs: any[] = [{ id: 7, documentType: 'ENVIRONMENTAL_PERMIT', documentName: 'New', documentUrl: 'http://x.com/new.pdf' }];
            const result = await service.updateCompanyLocationDocuments(docs, 10, 1);

            expect(docsRepo.updateById.calledOnce).to.be.true();
            expect(result.status).to.equal('success');
        });

        it('sets status to PENDING when document content changes', async () => {
            const existing = [{ id: 7, documentType: 'ENVIRONMENTAL_PERMIT', documentName: 'Old', documentUrl: 'http://old.com/d.pdf', expiryDate: null, status: 'active' }];
            const docsRepo = makeLocationDocsRepo({
                find: sinon.stub().resolves(existing),
                findById: sinon.stub().resolves({ id: 7 }),
            });
            const service = new CompanyLocationDocumentService(
                docsRepo,
                makeCompanyUsersRepo(companyAdminRecord),
                makeLocationsRepo(location),
            );

            const docs: any[] = [{ id: 7, documentType: 'ENVIRONMENTAL_PERMIT', documentName: 'Old', documentUrl: 'http://new.com/d.pdf' }];
            await service.updateCompanyLocationDocuments(docs, 10, 1);

            const updateArg = docsRepo.updateById.firstCall.args[1];
            expect(updateArg.status).to.equal('pending');
        });

        it('preserves status when document content unchanged', async () => {
            // expiryDate must match exactly — both undefined (not null vs undefined mismatch)
            const existing = [{ id: 7, documentType: 'ENVIRONMENTAL_PERMIT', documentName: 'Doc', documentUrl: 'http://x.com/d.pdf', expiryDate: undefined, status: 'active' }];
            const docsRepo = makeLocationDocsRepo({
                find: sinon.stub().resolves(existing),
                findById: sinon.stub().resolves({ id: 7 }),
            });
            const service = new CompanyLocationDocumentService(
                docsRepo,
                makeCompanyUsersRepo(companyAdminRecord),
                makeLocationsRepo(location),
            );

            // Send same values — no content change → status preserved
            const docs: any[] = [{ id: 7, documentType: 'ENVIRONMENTAL_PERMIT', documentName: 'Doc', documentUrl: 'http://x.com/d.pdf', expiryDate: undefined }];
            await service.updateCompanyLocationDocuments(docs, 10, 1);

            const updateArg = docsRepo.updateById.firstCall.args[1];
            expect(updateArg.status).to.equal('active');
        });

        it('deletes documents not included in request', async () => {
            const existing = [
                { id: 7, documentType: 'EP', documentName: 'D1', documentUrl: 'http://x.com/d1.pdf' },
                { id: 8, documentType: 'WE', documentName: 'D2', documentUrl: 'http://x.com/d2.pdf' },
            ];
            const docsRepo = makeLocationDocsRepo({
                find: sinon.stub().resolves(existing),
                findById: sinon.stub().resolves({ id: 7 }),
            });
            const service = new CompanyLocationDocumentService(
                docsRepo,
                makeCompanyUsersRepo(companyAdminRecord),
                makeLocationsRepo(location),
            );

            await service.updateCompanyLocationDocuments([{ id: 7, documentType: 'EP', documentName: 'D1', documentUrl: 'http://x.com/d1.pdf' } as any], 10, 1);

            expect(docsRepo.deleteById.calledOnce).to.be.true();
            expect(docsRepo.deleteById.firstCall.args[0]).to.equal(8);
        });

        it('throws 404 when location not found', async () => {
            const service = new CompanyLocationDocumentService(
                makeLocationDocsRepo(),
                makeCompanyUsersRepo(companyAdminRecord),
                makeLocationsRepo(null),
            );

            await expect(service.updateCompanyLocationDocuments([], 999, 1)).to.be.rejectedWith(/Company location not found/);
        });

        it('throws 403 when user is not company admin', async () => {
            const service = new CompanyLocationDocumentService(
                makeLocationDocsRepo(),
                makeCompanyUsersRepo(null),
                makeLocationsRepo(location),
            );

            await expect(service.updateCompanyLocationDocuments([], 10, 1)).to.be.rejectedWith(/forbidden/i);
        });
    });
});
