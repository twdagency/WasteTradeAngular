import { sinon } from '@loopback/testlab';
import { expect } from '@loopback/testlab';
import { EmailService } from '../../services/email.service';

// We need to intercept sgMail.send after the module is loaded.
// The service does: import sgMail from '@sendgrid/mail'; sgMail.send(...)
// Requiring via require() gives us the same module.exports object so we can mutate .send.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const sgMailModule = require('@sendgrid/mail');

describe('EmailService (unit)', () => {
    let service: EmailService;
    let originalSend: any;
    let capturedMessages: any[];

    beforeEach(() => {
        capturedMessages = [];
        originalSend = sgMailModule.send;
        sgMailModule.send = async (msg: any) => {
            capturedMessages.push(msg);
            return [{} as any, {}];
        };
        service = new EmailService();
    });

    afterEach(() => {
        sgMailModule.send = originalSend;
    });

    it('sendResetPasswordEmail sends to user email with "Forgotten Password" subject', async () => {
        const user: any = { email: 'user@test.com', firstName: 'Alice', lastName: 'Smith' };

        await service.sendResetPasswordEmail(user, 'https://reset.url/token');

        expect(capturedMessages).to.have.length(1);
        expect(capturedMessages[0].to).to.equal('user@test.com');
        expect(capturedMessages[0].subject).to.equal('Forgotten Password');
    });

    it('sendResetPasswordEmail uses admin subject when isCreatedAdmin=true', async () => {
        const user: any = { email: 'admin@test.com', firstName: 'Bob', lastName: 'Jones' };

        await service.sendResetPasswordEmail(user, 'https://reset.url/token', true);

        expect(capturedMessages[0].subject).to.equal('WasteTrade Admin - Set Your Password');
    });

    it('sendOfferAcceptEmail sends to user with "Offer Accepted" subject', async () => {
        const offer: any = { id: 1, createdAt: new Date().toISOString() };
        const user: any = { email: 'buyer@test.com', firstName: 'Carol', lastName: 'White' };

        await service.sendOfferAcceptEmail(offer, user);

        expect(capturedMessages).to.have.length(1);
        expect(capturedMessages[0].to).to.equal('buyer@test.com');
        expect(capturedMessages[0].subject).to.equal('Offer Accepted');
    });

    it('sendListingApprovalEmail sends to user with "Listing Approved" subject', async () => {
        const listing: any = { id: 10, listingType: 'sell', title: 'Test Listing' };
        const user: any = { email: 'seller@test.com', firstName: 'Dave', lastName: 'Green' };

        await service.sendListingApprovalEmail(listing, user);

        expect(capturedMessages).to.have.length(1);
        expect(capturedMessages[0].to).to.equal('seller@test.com');
        expect(capturedMessages[0].subject).to.equal('Listing Approved');
    });

    it('sendUserReceiveRejectedJoinCompanyEmail uses correct recipient and subject', async () => {
        const user = { email: 'rejected@test.com', firstName: 'Eve', lastName: 'Black' };

        await service.sendUserReceiveRejectedJoinCompanyEmail(user, 'GreenCorp');

        expect(capturedMessages).to.have.length(1);
        expect(capturedMessages[0].to).to.equal('rejected@test.com');
        expect((capturedMessages[0].subject as string).includes('GreenCorp')).to.be.true();
        expect((capturedMessages[0].subject as string).includes('declined')).to.be.true();
    });

    it('sendCompanyAdminReceivedRequestedJoinCompanyEmail sends to admin email', async () => {
        const admin = { email: 'admin@corp.com', firstName: 'Admin', lastName: 'User' };
        const requester = { email: 'new@user.com', firstName: 'New', lastName: 'User' };

        await service.sendCompanyAdminReceivedRequestedJoinCompanyEmail(admin, requester, 'MyCorp', 'Hello');

        expect(capturedMessages).to.have.length(1);
        expect(capturedMessages[0].to).to.equal('admin@corp.com');
        expect((capturedMessages[0].subject as string).includes('MyCorp')).to.be.true();
    });

    it('sendCompanyAdminReceiveInviteAcceptedEmail sends to admin with joined user name in subject', async () => {
        const admin = { email: 'admin@corp.com', firstName: 'Admin', lastName: 'User' };
        const companyUser = { email: 'new@user.com', firstName: 'Frank', lastName: 'Hill', role: 'seller' };

        await service.sendCompanyAdminReceiveInviteAcceptedEmail(admin, companyUser, 'BigCorp');

        expect(capturedMessages).to.have.length(1);
        expect(capturedMessages[0].to).to.equal('admin@corp.com');
        expect((capturedMessages[0].subject as string).includes('Frank')).to.be.true();
        expect((capturedMessages[0].subject as string).includes('BigCorp')).to.be.true();
    });

    it('does not throw when sgMail.send rejects (error is swallowed)', async () => {
        // Simulate SendGrid failure
        sgMailModule.send = async () => { throw new Error('SendGrid down'); };
        const user: any = { email: 'x@test.com', firstName: 'X', lastName: 'Y' };

        // Should not throw — errors are caught internally
        await service.sendResetPasswordEmail(user, 'https://url');
    });
});
