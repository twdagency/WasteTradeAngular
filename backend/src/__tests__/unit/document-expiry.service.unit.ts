import { expect, sinon } from '@loopback/testlab';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
dayjs.extend(customParseFormat);
import { DocumentExpiryService } from '../../services/document-expiry.service';

function makeDocsRepo(docs: object[] = []) {
    return { find: sinon.stub().resolves(docs) } as any;
}

function makeUserRepo(user: object | null = { id: 1, firstName: 'Jane', email: 'jane@example.com' }) {
    return { findById: sinon.stub().resolves(user) } as any;
}

function makeNotifService() {
    return { createNotification: sinon.stub().resolves() } as any;
}

function makeEmailService() {
    return { sendDocumentExpiryEmail: sinon.stub().resolves() } as any;
}

// Helper: build a DD/MM/YYYY date N days from now (UTC midnight to match dayjs.utc diff)
function dateInDays(n: number): string {
    const d = new Date();
    d.setUTCHours(0, 0, 0, 0);
    d.setUTCDate(d.getUTCDate() + n);
    const day = d.getUTCDate().toString().padStart(2, '0');
    const month = (d.getUTCMonth() + 1).toString().padStart(2, '0');
    const year = d.getUTCFullYear();
    return `${day}/${month}/${year}`;
}

describe('DocumentExpiryService (unit)', () => {
    describe('checkDocumentExpiry', () => {
        it('returns empty errors when no documents', async () => {
            const service = new DocumentExpiryService(makeDocsRepo([]), makeUserRepo(), makeNotifService(), makeEmailService());

            const result = await service.checkDocumentExpiry();

            expect(result.errors).to.be.empty();
        });

        it('skips documents with invalid date format', async () => {
            const docs = [{ id: 1, expiryDate: '2025-12-31', uploadedByUserId: 1, documentType: 'EP', documentName: 'Doc' }];
            const notifService = makeNotifService();
            const service = new DocumentExpiryService(makeDocsRepo(docs), makeUserRepo(), notifService, makeEmailService());

            await service.checkDocumentExpiry();

            expect(notifService.createNotification.called).to.be.false();
        });

        it('sends notification when document expires at 30-day interval', async () => {
            const docs = [{ id: 1, expiryDate: dateInDays(30), uploadedByUserId: 1, documentType: 'EP', documentName: 'Permit', status: 'active' }];
            const notifService = makeNotifService();
            const emailService = makeEmailService();
            const service = new DocumentExpiryService(makeDocsRepo(docs), makeUserRepo(), notifService, emailService);

            await service.checkDocumentExpiry();

            expect(notifService.createNotification.calledOnce).to.be.true();
            // 30 days is also in EMAIL_INTERVALS
            expect(emailService.sendDocumentExpiryEmail.calledOnce).to.be.true();
        });

        it('sends notification but not email at 20-day interval', async () => {
            const docs = [{ id: 1, expiryDate: dateInDays(20), uploadedByUserId: 1, documentType: 'EP', documentName: 'Permit', status: 'active' }];
            const notifService = makeNotifService();
            const emailService = makeEmailService();
            const service = new DocumentExpiryService(makeDocsRepo(docs), makeUserRepo(), notifService, emailService);

            await service.checkDocumentExpiry();

            expect(notifService.createNotification.calledOnce).to.be.true();
            expect(emailService.sendDocumentExpiryEmail.called).to.be.false();
        });

        it('skips notification when user not found', async () => {
            const docs = [{ id: 1, expiryDate: dateInDays(7), uploadedByUserId: 99, documentType: 'EP', documentName: 'Permit', status: 'active' }];
            const notifService = makeNotifService();
            const service = new DocumentExpiryService(makeDocsRepo(docs), makeUserRepo(null), notifService, makeEmailService());

            const result = await service.checkDocumentExpiry();

            expect(notifService.createNotification.called).to.be.false();
            expect(result.errors).to.be.empty();
        });

        it('collects errors without throwing when processing fails', async () => {
            const docs = [{ id: 1, expiryDate: dateInDays(30), uploadedByUserId: 1, documentType: 'EP', documentName: 'Permit', status: 'active' }];
            const notifService = { createNotification: sinon.stub().rejects(new Error('db failure')) } as any;
            const service = new DocumentExpiryService(makeDocsRepo(docs), makeUserRepo(), notifService, makeEmailService());

            const result = await service.checkDocumentExpiry();

            expect(result.errors.length).to.be.greaterThan(0);
        });
    });
});
