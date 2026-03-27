import { expect } from '@loopback/testlab';
import {
    mapCompanyToAccount,
    mapCompanyUserToContact,
    mapUserToContact,
    mapListingToSalesListing,
    mapOfferToSalesforceOffer,
    mapHaulageOfferToSalesforce,
    mapUserToLead,
} from '../../utils/salesforce/salesforce-object-mappers.utils';
import {
    AccountFields,
    ContactFields,
    LeadFields,
    SalesListingFields,
    OffersFields,
    HaulageOffersFields,
} from '../../utils/salesforce/generated';

function fieldNames(obj: Record<string, string>): string[] {
    return Object.values(obj);
}

function assertAllKeysValid(result: Record<string, unknown>, valid: string[], label: string): void {
    const invalid = Object.keys(result).filter(k => !valid.includes(k));
    expect(invalid).to.deepEqual([], `${label}: unknown fields: ${invalid.join(', ')}`);
}

// ─── Stub factories ────────────────────────────────────────────────────────────

const company: any = {
    id: 1, name: 'Acme Corp', addressLine1: '1 Test St', city: 'London', country: 'UK',
    postalCode: 'EC1A 1BB', stateProvince: 'England', companyType: 'Customer',
    phoneNumber: '+441234567890', mobileNumber: '+447700900000', website: 'acme.com',
    description: 'A test company', vatNumber: 'GB123456789', registrationNumber: 'REG001',
    status: 'active', companyInterest: 'Buyer', vatRegistrationCountry: 'GB',
    email: 'info@acme.com',
};

const location: any = {
    id: 5, locationName: 'Main Site', addressLine: '1 Test St', street: '1 Test St',
    city: 'London', country: 'UK', postcode: 'EC1A 1BB', stateProvince: 'England',
    mainLocation: true, loadingRamp: true, weighbridge: false, firstName: 'Jane',
    lastName: 'Doe', phoneNumber: '+441234567890', positionInCompany: 'Manager',
    selfLoadUnLoadCapability: true, containerType: ['Trailer'],
    acceptedMaterials: ['HDPE'], sitePointContact: 'Jane Doe',
    officeOpenTime: '09:00', officeCloseTime: '17:00',
};

const user: any = {
    id: 10, firstName: 'Jane', lastName: 'Doe', email: 'jane@acme.com',
    phoneNumber: '+441234567890', mobileNumber: '+447700900000',
    prefix: 'Ms', jobTitle: 'Manager', status: 'active',
    whereDidYouHearAboutUs: 'Website',
};

const companyUser: any = {
    companyRole: 'buyer', status: 'active', isPrimaryContact: true,
};

const listing: any = {
    id: 100, title: 'HDPE Bales', status: 'available', materialType: 'HDPE',
    materialPacking: 'bales', quantity: 10, materialWeightPerUnit: 1000,
    totalWeight: 10000, materialWeight: 10000, pricePerMetricTonne: 500,
    currency: 'GBP', startDate: new Date('2026-01-01'), endDate: new Date('2026-12-31'),
    createdAt: new Date(), description: 'Good quality', additionalNotes: 'None',
    wasteStoration: 'indoors', materialRemainInCountry: false,
    createdByUserId: 10, locationId: 5, numberOfLoads: 10,
};

const offer: any = {
    id: 200, listingId: 100, status: 'pending', state: 'active',
    quantity: 5, offeredPricePerUnit: 450, totalPrice: 2250, currency: 'GBP',
    message: 'Interested', buyerUserId: 10, buyerCompanyId: 1, buyerLocationId: 5,
    sellerUserId: 20, sellerCompanyId: 2, sellerLocationId: 6,
    buyerCountry: 'UK', sellerCountry: 'UK',
    earliestDeliveryDate: new Date(), latestDeliveryDate: new Date(),
    expiresAt: new Date(), createdAt: new Date(),
    incoterms: 'FOB', shippingPort: 'Felixstowe', needsTransport: true,
    rejectionReason: null, rejectionSource: null,
    rejectedByUserId: null, acceptedByUserId: null, acceptedAt: null,
};

const haulageOffer: any = {
    id: 300, offerId: 200, status: 'pending',
    trailerContainerType: 'Curtain Sider', completingCustomsClearance: false,
    transportProvider: 'own_haulage', haulageCostPerLoad: 200, currency: 'GBP',
    haulageTotal: 1000, customsFee: null,
    suggestedCollectionDate: new Date(), expectedTransitTime: '1-2 Days',
    demurrageAtDestination: 5, haulierUserId: 30, haulierCompanyId: 3,
    notes: 'Handle with care', adminMessage: null, numberOfLoads: 5,
    quantityPerLoad: 1000, shippedLoads: 0, assignedAdminId: null,
    rejectionReason: null, customRejectionReason: null,
};

// Minimal stub repo that always throws (simulates no related data — mappers handle gracefully)
const emptyRepo = { findById: async () => { throw new Error('not found'); }, find: async () => [] };
const stubRepos = {
    listingsRepository: emptyRepo,
    userRepository: emptyRepo,
    companiesRepository: emptyRepo,
    companyLocationsRepository: emptyRepo,
    offersRepository: emptyRepo,
    materialUsersRepository: emptyRepo,
};

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('Object mapper outputs use valid SF field names (regression)', () => {
    it('mapCompanyToAccount: all keys exist in AccountFields', () => {
        const result = mapCompanyToAccount(company, [location], user);
        assertAllKeysValid(result, fieldNames(AccountFields), 'mapCompanyToAccount');
    });

    it('mapCompanyToAccount with locations: all keys exist in AccountFields', () => {
        const result = mapCompanyToAccount(company, [location], undefined);
        assertAllKeysValid(result, fieldNames(AccountFields), 'mapCompanyToAccount+locations');
    });

    it('mapUserToContact: all keys exist in ContactFields', () => {
        const result = mapUserToContact(user, 'sf-account-id-123');
        assertAllKeysValid(result, fieldNames(ContactFields), 'mapUserToContact');
    });

    it('mapCompanyUserToContact: all keys exist in ContactFields', () => {
        const result = mapCompanyUserToContact(user, companyUser, 'sf-account-id-123', location);
        assertAllKeysValid(result, fieldNames(ContactFields), 'mapCompanyUserToContact');
    });

    it('mapUserToLead: all keys exist in LeadFields', async () => {
        const result = await mapUserToLead(user, company, stubRepos.materialUsersRepository);
        assertAllKeysValid(result, fieldNames(LeadFields), 'mapUserToLead');
    });

    it('mapListingToSalesListing: all keys exist in SalesListingFields', async () => {
        const result = await mapListingToSalesListing(listing, [], location);
        assertAllKeysValid(result, fieldNames(SalesListingFields), 'mapListingToSalesListing');
    });

    it('mapOfferToSalesforceOffer: all keys exist in OffersFields', async () => {
        const result = await mapOfferToSalesforceOffer(offer, {
            listingsRepository: emptyRepo,
            userRepository: emptyRepo,
            companiesRepository: emptyRepo,
            companyLocationsRepository: emptyRepo,
        });
        assertAllKeysValid(result as Record<string, unknown>, fieldNames(OffersFields), 'mapOfferToSalesforceOffer');
    });

    it('mapHaulageOfferToSalesforce: all keys exist in HaulageOffersFields', async () => {
        const result = await mapHaulageOfferToSalesforce(haulageOffer, {
            offersRepository: emptyRepo,
            listingsRepository: emptyRepo,
            userRepository: emptyRepo,
            companiesRepository: emptyRepo,
            companyLocationsRepository: emptyRepo,
        });
        assertAllKeysValid(result as Record<string, unknown>, fieldNames(HaulageOffersFields), 'mapHaulageOfferToSalesforce');
    });
});
