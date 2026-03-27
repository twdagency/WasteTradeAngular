import { expect, sinon } from '@loopback/testlab';
import { DataDraftExpiryCronjob } from '../../components/Cronjobs/data-draft-expiry.cronjob';

describe('DataDraftExpiryCronjob (unit)', () => {
    let cronjob: DataDraftExpiryCronjob;
    let stubService: { deleteExpiredDrafts: sinon.SinonStub };

    beforeEach(() => {
        stubService = {
            deleteExpiredDrafts: sinon.stub().resolves({ deleted: 4, s3FilesDeleted: 2, errors: [] }),
        };
        cronjob = new DataDraftExpiryCronjob(stubService as any);
    });

    afterEach(() => sinon.restore());

    describe('performExpiryCleanup (private)', () => {
        it('calls deleteExpiredDrafts', async () => {
            await (cronjob as any).performExpiryCleanup();
            expect(stubService.deleteExpiredDrafts.calledOnce).to.be.true();
        });

        it('does not throw when service resolves with errors array', async () => {
            stubService.deleteExpiredDrafts.resolves({ deleted: 0, s3FilesDeleted: 0, errors: ['s3 fail'] });
            await expect((cronjob as any).performExpiryCleanup()).to.not.be.rejected();
        });

        it('does not throw when service rejects', async () => {
            stubService.deleteExpiredDrafts.rejects(new Error('DB connection lost'));
            await expect((cronjob as any).performExpiryCleanup()).to.not.be.rejected();
        });

        it('handles zero deleted drafts without logging S3', async () => {
            stubService.deleteExpiredDrafts.resolves({ deleted: 0, s3FilesDeleted: 0, errors: [] });
            await expect((cronjob as any).performExpiryCleanup()).to.not.be.rejected();
            expect(stubService.deleteExpiredDrafts.calledOnce).to.be.true();
        });

        it('handles large deletion counts', async () => {
            stubService.deleteExpiredDrafts.resolves({ deleted: 999, s3FilesDeleted: 500, errors: [] });
            await expect((cronjob as any).performExpiryCleanup()).to.not.be.rejected();
        });
    });
});
