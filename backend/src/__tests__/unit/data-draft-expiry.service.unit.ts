import { expect, sinon } from '@loopback/testlab';
import { DataDraftExpiryService } from '../../services/data-draft-expiry.service';
import { createStubRepo, createStubService } from '../helpers/stub-factory';

function buildService(overrides: Record<string, any> = {}): DataDraftExpiryService {
    return new DataDraftExpiryService(
        overrides.dataDraftRepo ?? createStubRepo(),
        overrides.companyDocsRepo ?? createStubRepo(),
        overrides.s3Service ?? createStubService(['deleteFile']),
    );
}

describe('DataDraftExpiryService (unit)', () => {
    describe('deleteExpiredDrafts()', () => {
        it('returns zero counts when no expired drafts found', async () => {
            const dataDraftRepo = createStubRepo();
            dataDraftRepo.find.resolves([]);
            const svc = buildService({ dataDraftRepo });

            const result = await svc.deleteExpiredDrafts();

            expect(result.deleted).to.equal(0);
            expect(result.s3FilesDeleted).to.equal(0);
            expect(result.errors).to.be.empty();
        });

        it('deletes expired drafts with no document URLs', async () => {
            const dataDraftRepo = createStubRepo();
            dataDraftRepo.find.resolves([
                { id: 1, data: JSON.stringify({ title: 'test' }) },
                { id: 2, data: JSON.stringify({}) },
            ]);
            dataDraftRepo.deleteById.resolves();
            const svc = buildService({ dataDraftRepo });

            const result = await svc.deleteExpiredDrafts();

            expect(result.deleted).to.equal(2);
            expect(result.s3FilesDeleted).to.equal(0);
            expect(result.errors).to.be.empty();
            expect(dataDraftRepo.deleteById.callCount).to.equal(2);
        });

        it('deletes S3 files from selectedDocumentFile when not in company_documents', async () => {
            const s3Url = 'https://bucket.s3.eu-west-1.amazonaws.com/uploads/doc.pdf';
            const dataDraftRepo = createStubRepo();
            dataDraftRepo.find.resolves([{
                id: 1,
                data: JSON.stringify({ selectedDocumentFile: [{ documentUrl: s3Url }] }),
            }]);
            dataDraftRepo.deleteById.resolves();

            const companyDocsRepo = createStubRepo();
            companyDocsRepo.findOne.resolves(null); // not found in company docs

            const s3Service = createStubService(['deleteFile']);
            const svc = buildService({ dataDraftRepo, companyDocsRepo, s3Service });

            const result = await svc.deleteExpiredDrafts();

            expect(result.deleted).to.equal(1);
            expect(result.s3FilesDeleted).to.equal(1);
            expect(s3Service.deleteFile.calledOnce).to.be.true();
            expect(s3Service.deleteFile.firstCall.args[0]).to.equal('uploads/doc.pdf');
        });

        it('skips S3 deletion when document URL exists in company_documents', async () => {
            const s3Url = 'https://bucket.s3.eu-west-1.amazonaws.com/uploads/existing.pdf';
            const dataDraftRepo = createStubRepo();
            dataDraftRepo.find.resolves([{
                id: 1,
                data: JSON.stringify({ selectedDocumentFile: [{ documentUrl: s3Url }] }),
            }]);
            dataDraftRepo.deleteById.resolves();

            const companyDocsRepo = createStubRepo();
            companyDocsRepo.findOne.resolves({ id: 99, documentUrl: s3Url }); // exists

            const s3Service = createStubService(['deleteFile']);
            const svc = buildService({ dataDraftRepo, companyDocsRepo, s3Service });

            const result = await svc.deleteExpiredDrafts();

            expect(result.deleted).to.equal(1);
            expect(result.s3FilesDeleted).to.equal(0);
            expect(s3Service.deleteFile.called).to.be.false();
        });

        it('handles selectedWasteLicenceFile S3 URLs', async () => {
            const s3Url = 'https://bucket.s3.eu-west-1.amazonaws.com/licences/wl.pdf';
            const dataDraftRepo = createStubRepo();
            dataDraftRepo.find.resolves([{
                id: 1,
                data: JSON.stringify({ selectedWasteLicenceFile: [{ documentUrl: s3Url }] }),
            }]);
            dataDraftRepo.deleteById.resolves();

            const companyDocsRepo = createStubRepo();
            companyDocsRepo.findOne.resolves(null);

            const s3Service = createStubService(['deleteFile']);
            const svc = buildService({ dataDraftRepo, companyDocsRepo, s3Service });

            const result = await svc.deleteExpiredDrafts();

            expect(result.s3FilesDeleted).to.equal(1);
            expect(s3Service.deleteFile.firstCall.args[0]).to.equal('licences/wl.pdf');
        });

        it('records error and continues when draft deletion fails', async () => {
            const dataDraftRepo = createStubRepo();
            dataDraftRepo.find.resolves([
                { id: 1, data: JSON.stringify({}) },
                { id: 2, data: JSON.stringify({}) },
            ]);
            dataDraftRepo.deleteById
                .onFirstCall().rejects(new Error('DB error'))
                .onSecondCall().resolves();
            const svc = buildService({ dataDraftRepo });

            const result = await svc.deleteExpiredDrafts();

            expect(result.deleted).to.equal(1);
            expect(result.errors).to.have.length(1);
            expect(result.errors[0]).to.match(/Failed to delete draft 1/);
        });

        it('handles invalid JSON in draft data gracefully', async () => {
            const dataDraftRepo = createStubRepo();
            dataDraftRepo.find.resolves([{ id: 1, data: 'NOT_VALID_JSON' }]);
            dataDraftRepo.deleteById.resolves();
            const svc = buildService({ dataDraftRepo });

            const result = await svc.deleteExpiredDrafts();

            // Should still delete the draft even if JSON parsing fails
            expect(result.deleted).to.equal(1);
            expect(result.errors).to.be.empty();
        });

        it('returns error result when repository.find throws', async () => {
            const dataDraftRepo = createStubRepo();
            dataDraftRepo.find.rejects(new Error('Connection refused'));
            const svc = buildService({ dataDraftRepo });

            const result = await svc.deleteExpiredDrafts();

            expect(result.deleted).to.equal(0);
            expect(result.errors).to.have.length(1);
            expect(result.errors[0]).to.match(/Failed to query expired drafts/);
        });

        it('does not delete S3 when URL has no matching S3 pattern', async () => {
            const dataDraftRepo = createStubRepo();
            dataDraftRepo.find.resolves([{
                id: 1,
                data: JSON.stringify({ selectedDocumentFile: [{ documentUrl: 'https://example.com/file.pdf' }] }),
            }]);
            dataDraftRepo.deleteById.resolves();

            const companyDocsRepo = createStubRepo();
            companyDocsRepo.findOne.resolves(null);

            const s3Service = createStubService(['deleteFile']);
            const svc = buildService({ dataDraftRepo, companyDocsRepo, s3Service });

            const result = await svc.deleteExpiredDrafts();

            expect(result.s3FilesDeleted).to.equal(0);
            expect(s3Service.deleteFile.called).to.be.false();
        });

        it('processes multiple S3 URLs from same draft', async () => {
            const dataDraftRepo = createStubRepo();
            dataDraftRepo.find.resolves([{
                id: 1,
                data: JSON.stringify({
                    selectedDocumentFile: [
                        { documentUrl: 'https://b.s3.eu-west-1.amazonaws.com/a/1.pdf' },
                        { documentUrl: 'https://b.s3.eu-west-1.amazonaws.com/a/2.pdf' },
                    ],
                    selectedWasteLicenceFile: [
                        { documentUrl: 'https://b.s3.eu-west-1.amazonaws.com/a/3.pdf' },
                    ],
                }),
            }]);
            dataDraftRepo.deleteById.resolves();

            const companyDocsRepo = createStubRepo();
            companyDocsRepo.findOne.resolves(null);

            const s3Service = createStubService(['deleteFile']);
            const svc = buildService({ dataDraftRepo, companyDocsRepo, s3Service });

            const result = await svc.deleteExpiredDrafts();

            expect(result.s3FilesDeleted).to.equal(3);
            expect(s3Service.deleteFile.callCount).to.equal(3);
        });
    });
});
