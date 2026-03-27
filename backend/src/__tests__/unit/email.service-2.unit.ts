import { expect, sinon } from '@loopback/testlab';
import { EmailService } from '../../services/email.service';

// Stub sgMail globally before instantiating service
const sgMail = require('@sendgrid/mail');

function makeUser(overrides: Record<string, any> = {}): any {
    return {
        id: 1,
        email: 'user@test.com',
        firstName: 'John',
        lastName: 'Doe',
        globalRole: 'user',
        ...overrides,
    };
}

function makeListing(overrides: Record<string, any> = {}): any {
    return {
        id: 10,
        title: 'Test Listing',
        listingType: 'sell',
        materialName: 'Plastic',
        createdAt: new Date().toISOString(),
        ...overrides,
    };
}

function makeOffer(overrides: Record<string, any> = {}): any {
    return {
        id: 20,
        price: 100,
        createdAt: new Date(),
        ...overrides,
    };
}

describe('EmailService (unit)', () => {
    let service: EmailService;
    let sendStub: sinon.SinonStub;

    beforeEach(() => {
        sendStub = sinon.stub().resolves([{ statusCode: 202 }]);
        sgMail.send = sendStub;
        service = new EmailService();
    });

    afterEach(() => {
        sinon.restore();
    });

    it('sendResetPasswordEmail calls sgMail.send with correct subject', async () => {
        const user = makeUser();
        await service.sendResetPasswordEmail(user, 'https://reset.url');

        expect(sendStub.calledOnce).to.be.true();
        const msg = sendStub.firstCall.args[0];
        expect(msg.to).to.equal('user@test.com');
        expect(msg.subject).to.equal('Forgotten Password');
    });

    it('sendResetPasswordEmail uses "Set Your Password" subject for admin creation', async () => {
        const user = makeUser();
        await service.sendResetPasswordEmail(user, 'https://reset.url', true);

        const msg = sendStub.firstCall.args[0];
        expect(msg.subject).to.equal('WasteTrade Admin - Set Your Password');
    });

    it('sendResetPasswordEmail swallows errors gracefully', async () => {
        sendStub.rejects(new Error('SMTP error'));
        const user = makeUser();
        // Should NOT throw
        await service.sendResetPasswordEmail(user, 'https://reset.url');
        expect(sendStub.calledOnce).to.be.true();
    });

    it('sendAdminNotification calls sgMail.send with company onboarding subject', async () => {
        const company: any = { id: 1, name: 'AcmeCorp' };
        await service.sendAdminNotification(company);

        expect(sendStub.calledOnce).to.be.true();
        const msg = sendStub.firstCall.args[0];
        expect(msg.subject).to.equal('New Company Onboarding Completed');
    });

    it('sendEditProfileEmail sends to user email with Profile Updates subject', async () => {
        const user = makeUser();
        await service.sendEditProfileEmail(user);

        expect(sendStub.calledOnce).to.be.true();
        const msg = sendStub.firstCall.args[0];
        expect(msg.to).to.equal('user@test.com');
        expect(msg.subject).to.equal('Profile Updates');
    });

    it('sendOfferAcceptEmail sends with Offer Accepted subject', async () => {
        const offer = makeOffer();
        const user = makeUser();
        await service.sendOfferAcceptEmail(offer, user);

        expect(sendStub.calledOnce).to.be.true();
        const msg = sendStub.firstCall.args[0];
        expect(msg.subject).to.equal('Offer Accepted');
        expect(msg.to).to.equal('user@test.com');
    });

    it('sendOfferRejectionEmail sends with Offer Rejected subject', async () => {
        const offer = makeOffer();
        const user = makeUser();
        await service.sendOfferRejectionEmail(offer, user, 'Too expensive');

        expect(sendStub.calledOnce).to.be.true();
        const msg = sendStub.firstCall.args[0];
        expect(msg.subject).to.equal('Offer Rejected');
    });

    it('sendOfferRequestInformationEmail sends with correct subject', async () => {
        const offer = makeOffer();
        const user = makeUser();
        await service.sendOfferRequestInformationEmail(offer, user, 'Please clarify');

        const msg = sendStub.firstCall.args[0];
        expect(msg.subject).to.equal('Offer Request Information');
    });

    it('sendListingApprovalEmail sends with Listing Approved subject', async () => {
        const listing = makeListing();
        const user = makeUser();
        await service.sendListingApprovalEmail(listing, user);

        const msg = sendStub.firstCall.args[0];
        expect(msg.subject).to.equal('Listing Approved');
        expect(msg.to).to.equal('user@test.com');
    });

    it('sendListingRejectionEmail sends with Listing Rejected subject', async () => {
        const listing = makeListing();
        const user = makeUser();
        await service.sendListingRejectionEmail(listing, user, 'Unsuitable');

        const msg = sendStub.firstCall.args[0];
        expect(msg.subject).to.equal('Listing Rejected');
    });

    it('sendListingRejectionEmail defaults rejectionReason when undefined', async () => {
        const listing = makeListing();
        const user = makeUser();
        await service.sendListingRejectionEmail(listing, user, undefined);

        expect(sendStub.calledOnce).to.be.true();
    });

    it('sendListingRequestInformationEmail sends with Listing Request Information subject', async () => {
        const listing = makeListing();
        const user = makeUser();
        await service.sendListingRequestInformationEmail(listing, user, 'More info needed');

        const msg = sendStub.firstCall.args[0];
        expect(msg.subject).to.equal('Listing Request Information');
    });

    it('sendListingExpiryWarning includes days remaining in subject for sell listing', async () => {
        const listing = makeListing({ listingType: 'sell' });
        const user = makeUser();
        await service.sendListingExpiryWarning(listing, user, 7);

        const msg = sendStub.firstCall.args[0];
        expect(msg.subject).to.match(/7 Days/);
    });

    it('sendListingExpiryWarning uses singular Day for 1 day remaining', async () => {
        const listing = makeListing({ listingType: 'wanted' });
        const user = makeUser();
        await service.sendListingExpiryWarning(listing, user, 1);

        const msg = sendStub.firstCall.args[0];
        expect(msg.subject).to.match(/1 Day/);
    });

    it('sendCompanyRejectedEmail sends with rejected subject', async () => {
        const user = makeUser();
        await service.sendCompanyRejectedEmail(user, 'Incomplete documents');

        const msg = sendStub.firstCall.args[0];
        expect(msg.subject).to.equal('Account Application Rejected');
    });

    it('sendCompanyRequestInformationEmail sends with correct subject', async () => {
        const user = makeUser();
        await service.sendCompanyRequestInformationEmail(user, 'Please provide VAT');

        const msg = sendStub.firstCall.args[0];
        expect(msg.subject).to.equal('Additional Information Required - WasteTrade Application');
    });

    it('sendAccountVerificationRequiredEmail sends with correct subject', async () => {
        const user = makeUser();
        await service.sendAccountVerificationRequiredEmail(user);

        const msg = sendStub.firstCall.args[0];
        expect(msg.subject).to.equal('Complete Your WasteTrade Account');
    });

    it('sendAccountVerificationApprovedEmail sends with Account Verified subject', async () => {
        const user = makeUser();
        await service.sendAccountVerificationApprovedEmail(user);

        const msg = sendStub.firstCall.args[0];
        expect(msg.subject).to.equal('Account Verified');
    });

    it('sendCompleteAccountDraftEmail sends to userProfile email', async () => {
        const userProfile: any = { email: 'draft@test.com', firstName: 'Draft', lastName: 'User' };
        await service.sendCompleteAccountDraftEmail('https://draft.url', userProfile);

        const msg = sendStub.firstCall.args[0];
        expect(msg.to).to.equal('draft@test.com');
        expect(msg.subject).to.equal('WasteTrade - Continue Your Registration');
    });

    it('sendDocumentExpiryEmail sends with expiry subject', async () => {
        const user = makeUser();
        await service.sendDocumentExpiryEmail(user, '31/12/2025');

        const msg = sendStub.firstCall.args[0];
        expect(msg.subject).to.equal('Wastetrade - Document Expiry');
    });

    it('sendListingRenewedEmail sends with Listing Renewed subject', async () => {
        const user = makeUser();
        await service.sendListingRenewedEmail(user, 'Plastic Waste');

        const msg = sendStub.firstCall.args[0];
        expect(msg.subject).to.equal('WasteTrade - Listing Renewed');
    });

    it('sendOfferApprovedEmail sends with Offer Approved subject', async () => {
        const user = makeUser();
        await service.sendOfferApprovedEmail(user, 'Plastic Bottles');

        const msg = sendStub.firstCall.args[0];
        expect(msg.subject).to.equal('WasteTrade - Offer Approved');
    });

    it('sendAccountArchivedEmail sends with archived subject', async () => {
        const user = makeUser();
        await service.sendAccountArchivedEmail(user);

        const msg = sendStub.firstCall.args[0];
        expect(msg.subject).to.equal('WasteTrade Admin - Your Account Has Been Archived');
    });

    it('sendHaulageOfferApprovedEmail sends with approved subject', async () => {
        const user = makeUser();
        await service.sendHaulageOfferApprovedEmail(user, null, null);

        const msg = sendStub.firstCall.args[0];
        expect(msg.subject).to.equal('Your offer has been approved');
    });

    it('sendHaulageOfferRejectedEmail sends with rejected subject', async () => {
        const user = makeUser();
        await service.sendHaulageOfferRejectedEmail(user, null, null, 'Not suitable');

        const msg = sendStub.firstCall.args[0];
        expect(msg.subject).to.equal('Your offer has been rejected');
    });

    it('sendHaulageOfferRequestInformationEmail sends with request info subject', async () => {
        const user = makeUser();
        await service.sendHaulageOfferRequestInformationEmail(user, null, null, 'Clarify dimensions');

        const msg = sendStub.firstCall.args[0];
        expect(msg.subject).to.equal('Your offer has been requested for more information');
    });

    it('sendHaulageBidOpenForEditsEmail sends with correct subject', async () => {
        const user = makeUser();
        await service.sendHaulageBidOpenForEditsEmail(user, { id: 1 }, { id: 2 });

        const msg = sendStub.firstCall.args[0];
        expect(msg.subject).to.equal('WasteTrade - Haulage Bid Opened for Edits');
    });

    it('sendNewHaulageOpportunityEmail sends with opportunity subject', async () => {
        const user = makeUser();
        await service.sendNewHaulageOpportunityEmail(user);

        const msg = sendStub.firstCall.args[0];
        expect(msg.subject).to.equal('WasteTrade - New Haulage Opportunity');
    });

    it('sendInvitedToJoinCompanyEmail sends with invite subject', async () => {
        const user = makeUser();
        await service.sendInvitedToJoinCompanyEmail(user, 'AcmeCorp', 'https://invite.url');

        const msg = sendStub.firstCall.args[0];
        expect(msg.subject).to.match(/invited to join AcmeCorp/);
    });

    it('sendCompanyAdminReceivedRequestedJoinCompanyEmail sends to admin email', async () => {
        const companyAdmin = { email: 'admin@co.com', firstName: 'Admin', lastName: 'User' };
        const companyUser = { email: 'user@co.com', firstName: 'User', lastName: 'One' };
        await service.sendCompanyAdminReceivedRequestedJoinCompanyEmail(companyAdmin, companyUser, 'AcmeCorp', 'Hi');

        const msg = sendStub.firstCall.args[0];
        expect(msg.to).to.equal('admin@co.com');
        expect(msg.subject).to.match(/New Join Request for AcmeCorp/);
    });

    it('sendUserReceiveRejectedJoinCompanyEmail sends with decline subject', async () => {
        const user = { email: 'u@co.com', firstName: 'User', lastName: 'One' };
        await service.sendUserReceiveRejectedJoinCompanyEmail(user, 'AcmeCorp', 'Not approved');

        const msg = sendStub.firstCall.args[0];
        expect(msg.subject).to.match(/was declined/);
    });

    it('sendUserReceiveRoleChangeEmail includes new role in subject', async () => {
        const user = { email: 'u@co.com', firstName: 'U', lastName: 'O', role: 'buyer' };
        await service.sendUserReceiveRoleChangeEmail(user, 'AcmeCorp');

        const msg = sendStub.firstCall.args[0];
        expect(msg.subject).to.match(/buyer/);
    });

    it('sendUserReceiveUnlinkedFromCompanyEmail sends with removed subject', async () => {
        const user = { email: 'u@co.com', firstName: 'U', lastName: 'O' };
        await service.sendUserReceiveUnlinkedFromCompanyEmail(user, 'AcmeCorp');

        const msg = sendStub.firstCall.args[0];
        expect(msg.subject).to.match(/removed from AcmeCorp/);
    });

    it('all send methods swallow errors and do not throw', async () => {
        sendStub.rejects(new Error('Network error'));
        const user = makeUser();

        // None of these should throw
        await service.sendOfferRejectionEmail(makeOffer(), user);
        await service.sendListingApprovalEmail(makeListing(), user);
        await service.sendAccountArchivedEmail(user);
        await service.sendDocumentExpiryEmail(user, '01/01/2026');

        expect(sendStub.callCount).to.equal(4);
    });
});
