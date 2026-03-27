import { bind, BindingScope } from '@loopback/core';
import sgMail, { MailDataRequired } from '@sendgrid/mail';
import dayjs from 'dayjs';
import * as fs from 'fs';
import get from 'lodash/get';
import * as path from 'path';
import { MyUserProfile } from '../authentication-strategies/type';
import { ADMIN_EMAIL, SENDGRID_API_KEY, SENDGRID_SENDER } from '../config';
import { ListingHelper } from '../helpers';
import { Companies, CompanyLocations, Listings, Offers, User } from '../models';
import {
    getAccountArchivedEmailTemplate,
    getAccountVerificationApprovedEmailTemplate,
    getAccountVerificationRequiredEmailTemplate,
    getAdminNotificationTemplate,
    getCompanyAdminReceiveInviteAcceptedEmailTemplate,
    getCompanyAdminReceivRequestedJoinCompanyEmailTemplate,
    getCompanyApprovedEmailTemplate,
    getCompanyRejectedEmailTemplate,
    getCompanyRequestInformationEmailTemplate,
    getCompleteAccountDraftEmailTemplate,
    getDocumentExpiryEmailTemplate,
    getEditProfileEmailTemplate,
    getHaulageBidOpenForEditsEmailTemplate,
    getHaulageOfferApprovedEmailTemplate,
    getHaulageOfferRejectedEmailTemplate,
    getHaulageOfferRequestInformationEmailTemplate,
    getInvitedToJoinCompanyEmailTemplate,
    getListingApprovalEmailTemplate,
    getListingExpiryWarningEmailTemplate,
    getListingRejectionEmailTemplate,
    getListingRenewedEmailTemplate,
    getListingRequestInformationEmailTemplate,
    getListingStatusUpdatedEmailTemplate,
    getNewHaulageOpportunityEmailTemplate,
    getOfferAcceptEmailTemplate,
    getOfferApprovedEmailTemplate,
    getOfferRejectionEmailTemplate,
    getOfferRequestInformationEmailTemplate,
    getOfferStatusUpdatedEmailTemplate,
    getResetPasswordEmailTemplate,
    getUserReceiveRejectedJoinCompanyEmailTemplate,
    getUserReceiveRoleChangeEmailTemplate,
    getUserReceiveUnlinkedFromCompanyEmailTemplate,
} from '../utils/email-template';

sgMail.setApiKey(SENDGRID_API_KEY!);

// CC email address to be added to all emails
// const CC_EMAIL = ['thanhhoangnguyen@b13technology.com', 'thinguyen@b13technology.com'];
const CC_EMAIL: string[] = [];

@bind({ scope: BindingScope.TRANSIENT })
export class EmailService {
    constructor() {}

    async sendResetPasswordEmail(user: User, resetPasswordUrl: string, isCreatedAdmin: boolean = false): Promise<void> {
        const email: string = get(user, 'email', '');

        const message: MailDataRequired = {
            to: email,
            cc: CC_EMAIL,
            from: SENDGRID_SENDER ?? '',
            html: getResetPasswordEmailTemplate(user, resetPasswordUrl, isCreatedAdmin),
            subject: isCreatedAdmin ? 'WasteTrade Admin - Set Your Password' : 'Forgotten Password',
        };

        try {
            await sgMail.send(message);
        } catch (error) {
            console.log(
                `Error sending email sendResetPasswordEmail (isCreatedAdmin: ${isCreatedAdmin}):`,
                error,
                error?.response?.body,
            );
        }
    }

    async sendAdminNotification(company: Companies): Promise<void> {
        console.log('ADMIN_EMAIL', ADMIN_EMAIL);
        const message: MailDataRequired = {
            to: ADMIN_EMAIL,
            cc: CC_EMAIL,
            from: SENDGRID_SENDER ?? '',
            html: getAdminNotificationTemplate(company),
            subject: 'New Company Onboarding Completed',
        };

        try {
            await sgMail.send(message);
        } catch (error) {
            console.log('Error sending admin notification:', error, error?.response?.body);
        }
    }

    async sendEditProfileEmail(user: User): Promise<void> {
        console.log('ADMIN_EMAIL', ADMIN_EMAIL);
        const message: MailDataRequired = {
            to: user.email,
            cc: CC_EMAIL,
            from: SENDGRID_SENDER ?? '',
            html: getEditProfileEmailTemplate(user),
            subject: 'Profile Updates',
        };

        try {
            await sgMail.send(message);
        } catch (error) {
            console.log('Error sending admin notification:', error, error?.response?.body);
        }
    }

    async sendOfferAcceptEmail(offer: Offers, user: User): Promise<void> {
        const message: MailDataRequired = {
            to: user.email,
            cc: CC_EMAIL,
            from: SENDGRID_SENDER ?? '',
            html: getOfferAcceptEmailTemplate(offer, user),
            subject: 'Offer Accepted',
        };

        try {
            await sgMail.send(message);
        } catch (error) {
            console.log('Error sending offer accept email:', error, error?.response?.body);
        }
    }

    async sendOfferRejectionEmail(offer: Offers, user: User, rejectionReason?: string): Promise<void> {
        const message: MailDataRequired = {
            to: user.email,
            cc: CC_EMAIL,
            from: SENDGRID_SENDER ?? '',
            html: getOfferRejectionEmailTemplate(offer, user, rejectionReason),
            subject: 'Offer Rejected',
        };

        try {
            await sgMail.send(message);
        } catch (error) {
            console.log('Error sending offer rejection email:', error, error?.response?.body);
        }
    }

    async sendOfferRequestInformationEmail(offer: Offers, user: User, messageFromAdmin?: string): Promise<void> {
        const message: MailDataRequired = {
            to: user.email,
            cc: CC_EMAIL,
            from: SENDGRID_SENDER ?? '',
            html: getOfferRequestInformationEmailTemplate(offer, user, messageFromAdmin),
            subject: 'Offer Request Information',
        };

        try {
            await sgMail.send(message);
        } catch (error) {
            console.log('Error sending offer request information email:', error, error?.response?.body);
        }
    }

    async sendListingApprovalEmail(listing: Listings, user: User): Promise<void> {
        const message: MailDataRequired = {
            to: user.email,
            cc: CC_EMAIL,
            from: SENDGRID_SENDER ?? '',
            html: getListingApprovalEmailTemplate(listing, user),
            subject: 'Listing Approved',
        };

        try {
            await sgMail.send(message);
        } catch (error) {
            console.log('Error sending listing approval email:', error, error?.response?.body);
        }
    }

    async sendListingRejectionEmail(listing: Listings, user: User, rejectionReason?: string): Promise<void> {
        if (rejectionReason === undefined) {
            rejectionReason = 'Unsuitable listing';
        }
        const message: MailDataRequired = {
            to: user.email,
            cc: CC_EMAIL,
            from: SENDGRID_SENDER ?? '',
            html: getListingRejectionEmailTemplate(listing, user, rejectionReason),
            subject: 'Listing Rejected',
        };

        try {
            await sgMail.send(message);
        } catch (error) {
            console.log('Error sending listing rejection email:', error, error?.response?.body);
        }
    }

    async sendListingRequestInformationEmail(listing: Listings, user: User, messageFromAdmin?: string): Promise<void> {
        if (messageFromAdmin === undefined) {
            messageFromAdmin = 'Please check the listing and provide more information';
        }
        const message: MailDataRequired = {
            to: user.email,
            cc: CC_EMAIL,
            from: SENDGRID_SENDER ?? '',
            html: getListingRequestInformationEmailTemplate(listing, user, messageFromAdmin),
            subject: 'Listing Request Information',
        };

        try {
            await sgMail.send(message);
        } catch (error) {
            console.log('Error sending listing request information email:', error, error?.response?.body);
        }
    }

    async sendListingExpiryWarning(listing: Listings, user: User, daysRemaining: number): Promise<void> {
        const listingType = listing.listingType === 'sell' ? 'Sales' : 'Wanted';
        const message: MailDataRequired = {
            to: user.email,
            cc: CC_EMAIL,
            from: SENDGRID_SENDER ?? '',
            html: getListingExpiryWarningEmailTemplate(listing, user, daysRemaining),
            subject: `Your ${listingType} Listing Expires in ${daysRemaining} Day${daysRemaining !== 1 ? 's' : ''}`,
        };

        try {
            await sgMail.send(message);
        } catch (error) {
            console.log('Error sending listing expiry warning email:', error, error?.response?.body);
        }
    }

    async sendCompanyApprovedEmail(user: User): Promise<void> {
        // Read social media images
        const group60 = fs.readFileSync(path.join(__dirname, '../../public/asserts/Group 60.png'));
        const group61 = fs.readFileSync(path.join(__dirname, '../../public/asserts/Group 61.png'));
        const group62 = fs.readFileSync(path.join(__dirname, '../../public/asserts/Group 62.png'));
        const group63 = fs.readFileSync(path.join(__dirname, '../../public/asserts/Group 63.png'));

        const message = {
            to: user.email,
            cc: CC_EMAIL,
            from: SENDGRID_SENDER ?? '',
            html: getCompanyApprovedEmailTemplate(user),
            subject: 'Account Verified',
            attachments: [
                {
                    content: group60.toString('base64'),
                    filename: 'Group 60.png',
                    type: 'image/png',
                    disposition: 'inline',
                    content_id: 'group60',
                },
                {
                    content: group61.toString('base64'),
                    filename: 'Group 61.png',
                    type: 'image/png',
                    disposition: 'inline',
                    content_id: 'group61',
                },
                {
                    content: group62.toString('base64'),
                    filename: 'Group 62.png',
                    type: 'image/png',
                    disposition: 'inline',
                    content_id: 'group62',
                },
                {
                    content: group63.toString('base64'),
                    filename: 'Group 63.png',
                    type: 'image/png',
                    disposition: 'inline',
                    content_id: 'group63',
                },
            ],
        };

        try {
            await sgMail.send(message);
            console.log('✅ Company approved email sent successfully');
        } catch (error) {
            console.log('Error sending company approved email:', error, error?.response?.body);
        }
    }

    async sendCompanyRejectedEmail(user: User, rejectReason?: string): Promise<void> {
        const message: MailDataRequired = {
            to: user.email,
            cc: CC_EMAIL,
            from: SENDGRID_SENDER ?? '',
            html: getCompanyRejectedEmailTemplate(user, rejectReason),
            subject: 'Account Application Rejected',
        };

        try {
            await sgMail.send(message);
        } catch (error) {
            console.log('Error sending company rejected email:', error, error?.response?.body);
        }
    }

    async sendCompanyRequestInformationEmail(user: User, messageFromAdmin?: string): Promise<void> {
        const message: MailDataRequired = {
            to: user.email,
            cc: CC_EMAIL,
            from: SENDGRID_SENDER ?? '',
            html: getCompanyRequestInformationEmailTemplate(user, messageFromAdmin),
            subject: 'Additional Information Required - WasteTrade Application',
        };

        try {
            await sgMail.send(message);
        } catch (error) {
            console.log('Error sending company request information email:', error, error?.response?.body);
        }
    }

    async sendAccountVerificationRequiredEmail(user: User): Promise<void> {
        const message: MailDataRequired = {
            to: user.email,
            cc: CC_EMAIL,
            from: SENDGRID_SENDER ?? '',
            html: getAccountVerificationRequiredEmailTemplate(user),
            subject: 'Complete Your WasteTrade Account',
        };

        try {
            await sgMail.send(message);
        } catch (error) {
            console.log('Error sending account verification required email:', error, error?.response?.body);
        }
    }

    async sendAccountVerificationApprovedEmail(user: User): Promise<void> {
        const message: MailDataRequired = {
            to: user.email,
            cc: CC_EMAIL,
            from: SENDGRID_SENDER ?? '',
            html: getAccountVerificationApprovedEmailTemplate(user),
            subject: 'Account Verified',
        };

        try {
            await sgMail.send(message);
        } catch (error) {
            console.log('Error sending account verification approved email:', error, error?.response?.body);
        }
    }

    async sendOfferStatusUpdatedEmail(offer: Offers, listing: Listings, user: User): Promise<void> {
        const message: MailDataRequired = {
            to: user.email,
            cc: CC_EMAIL,
            from: SENDGRID_SENDER ?? '',
            html: getOfferStatusUpdatedEmailTemplate(offer, listing, user),
            subject: `Bid Status Update  | ${ListingHelper.getListingTitle(listing)} | ${dayjs(offer.createdAt).format('DD/MM/YYYY')}`,
        };

        try {
            await sgMail.send(message);
        } catch (error) {
            console.log('Error sending offer status updated email:', error, error?.response?.body);
        }
    }

    async sendListingStatusUpdatedEmail(listing: Listings, user: User): Promise<void> {
        const message: MailDataRequired = {
            to: user.email,
            cc: CC_EMAIL,
            from: SENDGRID_SENDER ?? '',
            html: getListingStatusUpdatedEmailTemplate(listing, user),
            subject: `New ${ListingHelper.getListingTitle(listing)} Just Added!`,
        };

        try {
            await sgMail.send(message);
        } catch (error) {
            console.log('Error sending listing status updated email:', error, error?.response?.body);
        }
    }

    async sendCompleteAccountDraftEmail(draftUrl: string, userProfile: Partial<MyUserProfile>): Promise<void> {
        const message: MailDataRequired = {
            to: userProfile.email,
            cc: CC_EMAIL,
            from: SENDGRID_SENDER ?? '',
            html: getCompleteAccountDraftEmailTemplate(draftUrl, userProfile),
            subject: `WasteTrade - Continue Your Registration`,
        };

        try {
            await sgMail.send(message);
        } catch (error) {
            console.log('Error sending complete account draft email:', error, error?.response?.body);
        }
    }

    async sendDocumentExpiryEmail(
        user: User,
        expiryDate: string, // DD/MM/YYYY
    ): Promise<void> {
        const message: MailDataRequired = {
            to: user.email,
            cc: CC_EMAIL,
            from: SENDGRID_SENDER ?? '',
            html: getDocumentExpiryEmailTemplate(user, expiryDate),
            subject: 'Wastetrade - Document Expiry',
        };

        try {
            await sgMail.send(message);
        } catch (error) {
            console.log('Error sending document expiry email:', error, error?.response?.body);
        }
    }

    async sendListingRenewedEmail(user: User, listingTitle: string, isManual: boolean = true): Promise<void> {
        const message: MailDataRequired = {
            to: user.email,
            cc: CC_EMAIL,
            from: SENDGRID_SENDER ?? '',
            html: getListingRenewedEmailTemplate(user, listingTitle, isManual),
            subject: `WasteTrade - Listing Renewed`,
        };

        try {
            await sgMail.send(message);
        } catch (error) {
            console.log('Error sending listing renewed email:', error, error?.response?.body);
        }
    }

    async sendOfferApprovedEmail(user: User, listingTitle: string): Promise<void> {
        const message: MailDataRequired = {
            to: user.email,
            cc: CC_EMAIL,
            from: SENDGRID_SENDER ?? '',
            html: getOfferApprovedEmailTemplate(user, listingTitle),
            subject: 'WasteTrade - Offer Approved',
        };

        try {
            await sgMail.send(message);
        } catch (error) {
            console.log('Error sending offer approved email:', error, error?.response?.body);
        }
    }

    async sendAccountArchivedEmail(user: User): Promise<void> {
        const message: MailDataRequired = {
            to: user.email,
            cc: CC_EMAIL,
            from: SENDGRID_SENDER ?? '',
            html: getAccountArchivedEmailTemplate(user),
            subject: 'WasteTrade Admin - Your Account Has Been Archived',
        };

        try {
            await sgMail.send(message);
        } catch (error) {
            console.log('Error sending account archived email:', error, error?.response?.body);
        }
    }

    async sendHaulageOfferApprovedEmail(
        user: User,
        pickupLocation: Partial<CompanyLocations> | null,
        destinationLocation: Partial<CompanyLocations> | null,
    ): Promise<void> {
        const message: MailDataRequired = {
            to: user.email,
            cc: CC_EMAIL,
            from: SENDGRID_SENDER ?? '',
            html: getHaulageOfferApprovedEmailTemplate(user, pickupLocation, destinationLocation),
            subject: 'Your offer has been approved',
        };

        try {
            await sgMail.send(message);
        } catch (error) {
            console.log('Error sending haulage offer approved email:', error, error?.response?.body);
        }
    }

    async sendHaulageOfferRejectedEmail(
        user: User,
        pickupLocation: Partial<CompanyLocations> | null,
        destinationLocation: Partial<CompanyLocations> | null,
        rejectionReason?: string,
    ): Promise<void> {
        const message: MailDataRequired = {
            to: user.email,
            cc: CC_EMAIL,
            from: SENDGRID_SENDER ?? '',
            html: getHaulageOfferRejectedEmailTemplate(user, pickupLocation, destinationLocation, rejectionReason),
            subject: 'Your offer has been rejected',
        };

        try {
            await sgMail.send(message);
        } catch (error) {
            console.log('Error sending haulage offer rejected email:', error, error?.response?.body);
        }
    }

    async sendHaulageOfferRequestInformationEmail(
        user: User,
        pickupLocation: Partial<CompanyLocations> | null,
        destinationLocation: Partial<CompanyLocations> | null,
        message?: string,
    ): Promise<void> {
        const emailMessage: MailDataRequired = {
            to: user.email,
            cc: CC_EMAIL,
            from: SENDGRID_SENDER ?? '',
            html: getHaulageOfferRequestInformationEmailTemplate(user, pickupLocation, destinationLocation, message),
            subject: 'Your offer has been requested for more information',
        };

        try {
            await sgMail.send(emailMessage);
        } catch (error) {
            console.log('Error sending haulage offer request information email:', error, error?.response?.body);
        }
    }

    async sendHaulageBidOpenForEditsEmail(user: User, haulageOffer: any, offer: any): Promise<void> {
        const message: MailDataRequired = {
            to: user.email,
            cc: CC_EMAIL,
            from: SENDGRID_SENDER ?? '',
            html: getHaulageBidOpenForEditsEmailTemplate(user, haulageOffer, offer),
            subject: 'WasteTrade - Haulage Bid Opened for Edits',
        };

        try {
            await sgMail.send(message);
        } catch (error) {
            console.log('Error sending haulage bid open for edits email:', error, error?.response?.body);
        }
    }

    async sendNewHaulageOpportunityEmail(user: User): Promise<void> {
        const message: MailDataRequired = {
            to: user.email,
            cc: CC_EMAIL,
            from: SENDGRID_SENDER ?? '',
            html: getNewHaulageOpportunityEmailTemplate(user),
            subject: 'WasteTrade - New Haulage Opportunity',
        };

        try {
            await sgMail.send(message);
        } catch (error) {
            console.log('Error sending haulage bid open for edits email:', error, error?.response?.body);
        }
    }

    async sendInvitedToJoinCompanyEmail(user: User, companyName: string, inviteUrl: string): Promise<void> {
        const message: MailDataRequired = {
            to: user.email,
            cc: CC_EMAIL,
            from: SENDGRID_SENDER ?? '',
            html: getInvitedToJoinCompanyEmailTemplate(user, companyName, inviteUrl),
            subject: `WasteTrade - You've been invited to join ${companyName}`,
        };

        try {
            await sgMail.send(message);
        } catch (error) {
            console.log('Error sending invite join company email:', error, error?.response?.body);
        }
    }

    async sendCompanyAdminReceivedRequestedJoinCompanyEmail(
        companyAdmin: { email: string; firstName: string; lastName: string },
        companyUser: { email: string; firstName: string; lastName: string },
        companyName: string,
        note: string,
    ): Promise<void> {
        const message: MailDataRequired = {
            to: companyAdmin.email,
            cc: CC_EMAIL,
            from: SENDGRID_SENDER ?? '',
            html: getCompanyAdminReceivRequestedJoinCompanyEmailTemplate(companyAdmin, companyUser, companyName, note),
            subject: `WasteTrade - New Join Request for ${companyName}`,
        };

        try {
            await sgMail.send(message);
        } catch (error) {
            console.log(
                'Error sending company admin received requested join company email:',
                error,
                error?.response?.body,
            );
        }
    }

    async sendCompanyAdminReceiveInviteAcceptedEmail(
        companyAdmin: { email: string; firstName: string; lastName: string },
        companyUser: { email: string; firstName: string; lastName: string; role: string },
        companyName: string,
    ): Promise<void> {
        const message: MailDataRequired = {
            to: companyAdmin.email,
            cc: CC_EMAIL,
            from: SENDGRID_SENDER ?? '',
            html: getCompanyAdminReceiveInviteAcceptedEmailTemplate(companyAdmin, companyUser, companyName),
            subject: `WasteTrade - ${companyUser.firstName} joined ${companyName}`,
        };

        try {
            await sgMail.send(message);
        } catch (error) {
            console.log('Error sending company admin receive invite accepted email:', error, error?.response?.body);
        }
    }

    async sendUserReceiveRejectedJoinCompanyEmail(
        user: { email: string; firstName: string; lastName: string },
        companyName: string,
        messageFromAdmin: string = '',
    ): Promise<void> {
        const message: MailDataRequired = {
            to: user.email,
            cc: CC_EMAIL,
            from: SENDGRID_SENDER ?? '',
            html: getUserReceiveRejectedJoinCompanyEmailTemplate(user, companyName, messageFromAdmin ?? ''),
            subject: `WasteTrade - Your request to join ${companyName} was declined`,
        };

        try {
            await sgMail.send(message);
        } catch (error) {
            console.log('Error sending user receive rejected join company email:', error, error?.response?.body);
        }
    }

    async sendUserReceiveRoleChangeEmail(
        user: { email: string; firstName: string; lastName: string; role: string },
        companyName: string,
    ): Promise<void> {
        const message: MailDataRequired = {
            to: user.email,
            cc: CC_EMAIL,
            from: SENDGRID_SENDER ?? '',
            html: getUserReceiveRoleChangeEmailTemplate(user, companyName),
            subject: `WasteTrade - Your role has changed to ${user.role}`,
        };

        try {
            await sgMail.send(message);
        } catch (error) {
            console.log('Error sending user receive role change email:', error, error?.response?.body);
        }
    }

    async sendUserReceiveUnlinkedFromCompanyEmail(
        user: { email: string; firstName: string; lastName: string },
        companyName: string,
    ): Promise<void> {
        const message: MailDataRequired = {
            to: user.email,
            cc: CC_EMAIL,
            from: SENDGRID_SENDER ?? '',
            html: getUserReceiveUnlinkedFromCompanyEmailTemplate(user, companyName),
            subject: `WasteTrade - You've been removed from ${companyName}`,
        };

        try {
            await sgMail.send(message);
        } catch (error) {
            console.log('Error sending user receive unlinked from company email:', error, error?.response?.body);
        }
    }
}
