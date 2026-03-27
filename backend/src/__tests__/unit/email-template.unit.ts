import { expect } from '@loopback/testlab';
import {
    getResetPasswordEmailTemplate,
    getAdminNotificationTemplate,
    getEditProfileEmailTemplate,
    getOfferAcceptEmailTemplate,
    getOfferRejectionEmailTemplate,
    getListingApprovalEmailTemplate,
    getListingRejectionEmailTemplate,
    getListingExpiryWarningEmailTemplate,
    getCompanyApprovedEmailTemplate,
    getCompanyRejectedEmailTemplate,
    getDocumentExpiryEmailTemplate,
    getListingRenewedEmailTemplate,
    getOfferApprovedEmailTemplate,
    getAccountArchivedEmailTemplate,
    getHaulageOfferApprovedEmailTemplate,
    getHaulageOfferRejectedEmailTemplate,
    getInvitedToJoinCompanyEmailTemplate,
    getCompanyAdminReceivRequestedJoinCompanyEmailTemplate,
    getCompanyAdminReceiveInviteAcceptedEmailTemplate,
    getUserReceiveRejectedJoinCompanyEmailTemplate,
    getUserReceiveRoleChangeEmailTemplate,
    getUserReceiveUnlinkedFromCompanyEmailTemplate,
    getCompleteAccountDraftEmailTemplate,
} from '../../utils/email-template';
import { ListingType, MaterialType } from '../../enum';
import { User, Offers, Listings, Companies } from '../../models';

function makeUser(partial: Partial<User> = {}): User {
    return {
        firstName: 'Sarah',
        lastName: 'Johnson',
        email: 'sarah.johnson@acmerecycling.co.uk',
        username: 'sarah.johnson',
        ...partial,
    } as User;
}

function makeOffer(partial: Partial<Offers> = {}): Offers {
    return {
        id: 'offer-a1b2c3',
        offeredPricePerUnit: 145.5,
        quantity: 20,
        currency: 'gbp',
        earliestDeliveryDate: '2026-04-01',
        latestDeliveryDate: '2026-04-30',
        status: 'pending',
        ...partial,
    } as unknown as Offers;
}

function makeListing(partial: Partial<Listings> = {}): Listings {
    return {
        id: 'listing-x9y8z7',
        title: 'HDPE Bales – 20MT Available',
        materialItem: 'hdpe',
        materialType: MaterialType.PLASTIC,
        materialForm: 'bales',
        materialFinishing: 'baled',
        materialGrading: 'a_grade',
        materialPacking: 'bales',
        quantity: 20,
        materialWeightPerUnit: 1000,
        remainingQuantity: 18,
        locationOther: 'Manchester, UK',
        listingType: ListingType.SELL,
        createdAt: new Date('2026-03-01'),
        ...partial,
    } as unknown as Listings;
}

describe('email-template utils (unit)', () => {
    describe('getResetPasswordEmailTemplate', () => {
        it('includes user name and reset URL in standard reset email', () => {
            const user = makeUser();
            const url = 'https://app.wastetrade.com/reset?token=abc123';
            const html = getResetPasswordEmailTemplate(user, url);
            expect(html).to.containEql('Sarah');
            expect(html).to.containEql('Johnson');
            expect(html).to.containEql(url);
            expect(html).to.containEql('sarah.johnson');
        });

        it('renders admin-created variant with welcome message when isCreatedAdmin=true', () => {
            const user = makeUser();
            const url = 'https://app.wastetrade.com/set-password?token=xyz987';
            const html = getResetPasswordEmailTemplate(user, url, true);
            expect(html).to.containEql('Sarah');
            expect(html).to.containEql('Welcome to WasteTrade');
            expect(html).to.containEql(url);
            expect(html).to.not.containEql('sarah.johnson'); // username not shown in admin variant
        });
    });

    describe('getAdminNotificationTemplate', () => {
        it('includes company name and registration number', () => {
            const company = {
                id: 'co-001',
                name: 'Acme Recycling Ltd',
                registrationNumber: 'GB12345678',
            } as unknown as Companies;
            const html = getAdminNotificationTemplate(company);
            expect(html).to.containEql('Acme Recycling Ltd');
            expect(html).to.containEql('GB12345678');
            expect(html).to.containEql('co-001');
        });
    });

    describe('getEditProfileEmailTemplate', () => {
        it('addresses user by full name and mentions profile update', () => {
            const user = makeUser();
            const html = getEditProfileEmailTemplate(user);
            expect(html).to.containEql('Sarah Johnson');
            expect(html).to.containEql('profile information has successfully been updated');
        });
    });

    describe('getOfferAcceptEmailTemplate', () => {
        it('includes offer details and user name', () => {
            const user = makeUser();
            const offer = makeOffer();
            const html = getOfferAcceptEmailTemplate(offer, user);
            expect(html).to.containEql('Sarah Johnson');
            expect(html).to.containEql('offer-a1b2c3');
            expect(html).to.containEql('145.5');
            expect(html).to.containEql('20');
            expect(html).to.containEql('gbp');
        });
    });

    describe('getOfferRejectionEmailTemplate', () => {
        it('includes rejection reason when provided', () => {
            const user = makeUser();
            const offer = makeOffer();
            const html = getOfferRejectionEmailTemplate(offer, user, 'Price below market rate');
            expect(html).to.containEql('Sarah Johnson');
            expect(html).to.containEql('Price below market rate');
            expect(html).to.containEql('offer-a1b2c3');
        });

        it('uses default reason when not provided', () => {
            const user = makeUser();
            const offer = makeOffer();
            const html = getOfferRejectionEmailTemplate(offer, user);
            expect(html).to.containEql('does not meet the current requirements');
        });
    });

    describe('getListingApprovalEmailTemplate', () => {
        it('includes listing ID and user name', () => {
            const user = makeUser();
            const listing = makeListing();
            const html = getListingApprovalEmailTemplate(listing, user);
            expect(html).to.containEql('Sarah Johnson');
            expect(html).to.containEql('listing-x9y8z7');
        });
    });

    describe('getListingRejectionEmailTemplate', () => {
        it('includes custom rejection reason', () => {
            const user = makeUser();
            const listing = makeListing();
            const html = getListingRejectionEmailTemplate(listing, user, 'Missing compliance documents');
            expect(html).to.containEql('Missing compliance documents');
            expect(html).to.containEql('listing-x9y8z7');
        });

        it('uses default rejection reason when not provided', () => {
            const user = makeUser();
            const listing = makeListing();
            const html = getListingRejectionEmailTemplate(listing, user);
            expect(html).to.containEql('does not meet the current requirements');
        });
    });

    describe('getListingExpiryWarningEmailTemplate', () => {
        it('includes listing title, days remaining, and listing type label', () => {
            const user = makeUser();
            const listing = makeListing({ listingType: ListingType.SELL });
            const html = getListingExpiryWarningEmailTemplate(listing, user, 7);
            expect(html).to.containEql('7');
            expect(html).to.containEql('Sales');
            expect(html).to.containEql('listing-x9y8z7');
        });

        it('uses Wanted label for WANTED listing type', () => {
            const user = makeUser();
            const listing = makeListing({ listingType: ListingType.WANTED });
            const html = getListingExpiryWarningEmailTemplate(listing, user, 3);
            expect(html).to.containEql('Wanted');
        });
    });

    describe('getCompanyApprovedEmailTemplate', () => {
        it('includes user email and platform link', () => {
            const user = makeUser();
            const html = getCompanyApprovedEmailTemplate(user);
            expect(html).to.containEql('sarah.johnson@acmerecycling.co.uk');
            expect(html).to.containEql('verified');
        });
    });

    describe('getCompanyRejectedEmailTemplate', () => {
        it('includes user name and custom rejection reason', () => {
            const user = makeUser();
            const html = getCompanyRejectedEmailTemplate(user, 'Incomplete VAT documentation');
            expect(html).to.containEql('Sarah Johnson');
            expect(html).to.containEql('Incomplete VAT documentation');
        });

        it('uses default reason when not provided', () => {
            const user = makeUser();
            const html = getCompanyRejectedEmailTemplate(user);
            expect(html).to.containEql('does not meet our current requirements');
        });
    });

    describe('getDocumentExpiryEmailTemplate', () => {
        it('includes first name and expiry date', () => {
            const user = makeUser();
            const html = getDocumentExpiryEmailTemplate(user, '2026-06-30');
            expect(html).to.containEql('Sarah');
            expect(html).to.containEql('2026-06-30');
        });
    });

    describe('getListingRenewedEmailTemplate', () => {
        it('includes listing title and manual renewal wording', () => {
            const user = makeUser();
            const html = getListingRenewedEmailTemplate(user, 'HDPE Bales – 20MT', true);
            expect(html).to.containEql('HDPE Bales – 20MT');
            expect(html).to.containEql('manually');
        });

        it('uses automatically wording when isManual=false', () => {
            const user = makeUser();
            const html = getListingRenewedEmailTemplate(user, 'Corrugated Board Bales', false);
            expect(html).to.containEql('automatically');
        });
    });

    describe('getOfferApprovedEmailTemplate', () => {
        it('includes user first name and listing title', () => {
            const user = makeUser();
            const html = getOfferApprovedEmailTemplate(user, 'HDPE Bales – 20MT');
            expect(html).to.containEql('Sarah');
            expect(html).to.containEql('HDPE Bales – 20MT');
        });
    });

    describe('getAccountArchivedEmailTemplate', () => {
        it('includes user first name and archived message', () => {
            const user = makeUser();
            const html = getAccountArchivedEmailTemplate(user);
            expect(html).to.containEql('Sarah');
            expect(html).to.containEql('archived');
        });
    });

    describe('getHaulageOfferApprovedEmailTemplate', () => {
        it('includes pickup and destination countries', () => {
            const user = makeUser();
            const html = getHaulageOfferApprovedEmailTemplate(
                user,
                { country: 'United Kingdom' },
                { country: 'Germany' },
            );
            expect(html).to.containEql('Sarah');
            expect(html).to.containEql('United Kingdom');
            expect(html).to.containEql('Germany');
            expect(html).to.containEql('approved');
        });
    });

    describe('getHaulageOfferRejectedEmailTemplate', () => {
        it('includes countries and rejection reason', () => {
            const user = makeUser();
            const html = getHaulageOfferRejectedEmailTemplate(
                user,
                { country: 'United Kingdom' },
                { country: 'France' },
                'Load weight exceeds vehicle capacity',
            );
            expect(html).to.containEql('United Kingdom');
            expect(html).to.containEql('France');
            expect(html).to.containEql('Load weight exceeds vehicle capacity');
        });

        it('handles null locations gracefully', () => {
            const user = makeUser();
            const html = getHaulageOfferRejectedEmailTemplate(user, null, null, 'Route unavailable');
            expect(html).to.containEql('Route unavailable');
        });
    });

    describe('getInvitedToJoinCompanyEmailTemplate', () => {
        it('includes user first name, company name, and invite URL', () => {
            const user = makeUser();
            const inviteUrl = 'https://app.wastetrade.com/invite?token=inv123';
            const html = getInvitedToJoinCompanyEmailTemplate(user, 'Acme Recycling Ltd', inviteUrl);
            expect(html).to.containEql('Sarah');
            expect(html).to.containEql('Acme Recycling Ltd');
            expect(html).to.containEql(inviteUrl);
        });
    });

    describe('getCompanyAdminReceivRequestedJoinCompanyEmailTemplate', () => {
        it('includes admin name, requesting user details, company name, and note', () => {
            const admin = { email: 'admin@acmerecycling.co.uk', firstName: 'James', lastName: 'Pemberton' };
            const requester = { email: 'tom.harris@greenloop.co.uk', firstName: 'Tom', lastName: 'Harris' };
            const html = getCompanyAdminReceivRequestedJoinCompanyEmailTemplate(
                admin,
                requester,
                'Acme Recycling Ltd',
                'Referred by Jane from procurement',
            );
            expect(html).to.containEql('James');
            expect(html).to.containEql('Tom Harris');
            expect(html).to.containEql('tom.harris@greenloop.co.uk');
            expect(html).to.containEql('Acme Recycling Ltd');
            expect(html).to.containEql('Referred by Jane from procurement');
        });
    });

    describe('getCompanyAdminReceiveInviteAcceptedEmailTemplate', () => {
        it('includes admin name, new member name, role, and company name', () => {
            const admin = { email: 'admin@acmerecycling.co.uk', firstName: 'James', lastName: 'Pemberton' };
            const member = {
                email: 'lucy.walker@acmerecycling.co.uk',
                firstName: 'Lucy',
                lastName: 'Walker',
                role: 'buyer',
            };
            const html = getCompanyAdminReceiveInviteAcceptedEmailTemplate(admin, member, 'Acme Recycling Ltd');
            expect(html).to.containEql('James');
            expect(html).to.containEql('Lucy Walker');
            expect(html).to.containEql('buyer');
            expect(html).to.containEql('Acme Recycling Ltd');
        });
    });

    describe('getUserReceiveRejectedJoinCompanyEmailTemplate', () => {
        it('includes user first name and company name', () => {
            const user = { email: 'tom.harris@greenloop.co.uk', firstName: 'Tom', lastName: 'Harris' };
            const html = getUserReceiveRejectedJoinCompanyEmailTemplate(user, 'Acme Recycling Ltd', '');
            expect(html).to.containEql('Tom');
            expect(html).to.containEql('Acme Recycling Ltd');
        });

        it('includes optional message when provided', () => {
            const user = { email: 'tom.harris@greenloop.co.uk', firstName: 'Tom', lastName: 'Harris' };
            const html = getUserReceiveRejectedJoinCompanyEmailTemplate(
                user,
                'Acme Recycling Ltd',
                'Please reapply in 3 months.',
            );
            expect(html).to.containEql('Please reapply in 3 months.');
        });
    });

    describe('getUserReceiveRoleChangeEmailTemplate', () => {
        it('includes user first name, company name, and new role', () => {
            const user = {
                email: 'lucy.walker@acmerecycling.co.uk',
                firstName: 'Lucy',
                lastName: 'Walker',
                role: 'seller',
            };
            const html = getUserReceiveRoleChangeEmailTemplate(user, 'Acme Recycling Ltd');
            expect(html).to.containEql('Lucy');
            expect(html).to.containEql('Acme Recycling Ltd');
            expect(html).to.containEql('seller');
        });
    });

    describe('getUserReceiveUnlinkedFromCompanyEmailTemplate', () => {
        it('includes user first name and company name', () => {
            const user = { email: 'lucy.walker@acmerecycling.co.uk', firstName: 'Lucy', lastName: 'Walker' };
            const html = getUserReceiveUnlinkedFromCompanyEmailTemplate(user, 'Acme Recycling Ltd');
            expect(html).to.containEql('Lucy');
            expect(html).to.containEql('Acme Recycling Ltd');
            expect(html).to.containEql('removed');
        });
    });

    describe('getCompleteAccountDraftEmailTemplate', () => {
        it('includes draft URL and user first name', () => {
            const draftUrl = 'https://app.wastetrade.com/register/draft?token=drft456';
            const html = getCompleteAccountDraftEmailTemplate(draftUrl, { firstName: 'Sarah' });
            expect(html).to.containEql(draftUrl);
            expect(html).to.containEql('Sarah');
            expect(html).to.containEql('31 days');
        });

        it('falls back to User when firstName is missing', () => {
            const draftUrl = 'https://app.wastetrade.com/register/draft?token=drft789';
            const html = getCompleteAccountDraftEmailTemplate(draftUrl, {});
            expect(html).to.containEql('User');
        });
    });
});
