import { expect } from '@loopback/testlab';
import {
    mapCompanyToAccount,
    mapCompanyUserToContact,
    mapListingToWantedListing,
    mapCompanyDocumentToSalesforceDocument,
    mapLocationDocumentToSalesforceDocument,
    mapHaulageLoadToSalesforce,
    mapUserToContact,
    mapUserToLead,
    mapListingToSalesListing,
    mapOfferToSalesforceOffer,
    mapHaulageOfferToSalesforce,
} from '../../utils/salesforce/salesforce-object-mappers.utils';

// ─── Minimal stub factories ────────────────────────────────────────────────────

function makeCompany(overrides: Record<string, any> = {}): any {
    return {
        id: 1,
        name: 'Acme Corp',
        status: 'active',
        companyType: 'Customer',
        ...overrides,
    };
}

function makeUser(overrides: Record<string, any> = {}): any {
    return {
        id: 10,
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'jane.doe@example.com',
        phoneNumber: '+441234567890',
        ...overrides,
    };
}

function makeLocation(overrides: Record<string, any> = {}): any {
    return {
        id: 5,
        locationName: 'Main Site',
        addressLine: '1 Test Street',
        city: 'London',
        country: 'UK',
        postcode: 'EC1A 1BB',
        mainLocation: true,
        ...overrides,
    };
}

function makeListing(overrides: Record<string, any> = {}): any {
    return {
        id: 100,
        title: 'Test Listing',
        status: 'available',
        materialType: 'HDPE',
        quantity: 50,
        ...overrides,
    };
}

function makeCompanyUser(overrides: Record<string, any> = {}): any {
    return {
        companyRole: 'buyer',
        status: 'active',
        isPrimaryContact: true,
        ...overrides,
    };
}

function makeCompanyDoc(overrides: Record<string, any> = {}): any {
    return {
        id: 20,
        documentName: 'Insurance Certificate',
        documentType: 'insurance',
        documentUrl: 'https://s3.example.com/doc.pdf',
        status: 'approved',
        ...overrides,
    };
}

function makeLocationDoc(overrides: Record<string, any> = {}): any {
    return {
        id: 30,
        documentName: 'Site Certificate',
        documentType: 'site_cert',
        documentUrl: 'https://s3.example.com/site.pdf',
        status: 'pending',
        ...overrides,
    };
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('salesforce-object-mappers (unit)', () => {
    // ─── mapCompanyToAccount ───────────────────────────────────────────────────
    describe('mapCompanyToAccount', () => {
        it('minimal company produces a valid Account with Name', () => {
            const result = mapCompanyToAccount(makeCompany());
            expect(result).to.have.property('Name');
            expect(result.Name).to.be.a.String();
            expect((result.Name as string).length).to.be.greaterThan(0);
        });

        it('BillingStreet set when addressLine1 provided', () => {
            const result = mapCompanyToAccount(makeCompany({ addressLine1: '10 High St' }));
            expect(result.BillingStreet).to.equal('10 High St');
        });

        it('Phone uses phoneNumber first, falls back to mobileNumber', () => {
            const result = mapCompanyToAccount(makeCompany({ phoneNumber: '+441111111111' }));
            expect(result.Phone).to.equal('+441111111111');
        });

        it('Phone falls back to mobileNumber when phoneNumber absent', () => {
            const result = mapCompanyToAccount(makeCompany({ phoneNumber: undefined, mobileNumber: '+442222222222' }));
            expect(result.Phone).to.equal('+442222222222');
        });

        it('website gets https:// prefix when missing protocol', () => {
            const result = mapCompanyToAccount(makeCompany({ website: 'www.acme.com' }));
            expect(result.Website).to.match(/^https:\/\//);
        });

        it('website with existing protocol is unchanged', () => {
            const result = mapCompanyToAccount(makeCompany({ website: 'https://acme.com' }));
            expect(result.Website).to.equal('https://acme.com');
        });

        it('mobileNumber maps to Fax when different from phoneNumber', () => {
            const result = mapCompanyToAccount(makeCompany({
                phoneNumber: '+441111111111',
                mobileNumber: '+447777777777',
            }));
            expect(result.Fax).to.equal('+447777777777');
        });

        it('Account_Status__c is set from status', () => {
            const result = mapCompanyToAccount(makeCompany({ status: 'active' }));
            expect(result.Account_Status__c).to.equal('Active');
        });

        it('email mapped to Email__c', () => {
            const result = mapCompanyToAccount(makeCompany({ email: 'info@acme.com' }));
            expect(result.Email__c).to.equal('info@acme.com');
        });

        it('WasteTrade_Company_Id__c is set', () => {
            const result = mapCompanyToAccount(makeCompany({ id: 42 }));
            expect(result.WasteTrade_Company_Id__c).to.be.a.String();
            expect(result.WasteTrade_Company_Id__c as string).to.match(/42/);
        });

        it('location data populates ShippingStreet when provided', () => {
            const result = mapCompanyToAccount(makeCompany(), [makeLocation()]);
            expect(result).to.have.property('ShippingCity', 'London');
        });

        it('primaryUser site contact fields populated', () => {
            const result = mapCompanyToAccount(makeCompany(), [makeLocation({ firstName: undefined, lastName: undefined })], makeUser());
            expect(result.Site_Contact_First_Name__c).to.equal('Jane');
            expect(result.Site_Contact_Last_Name__c).to.equal('Doe');
        });

        it('optional fields absent when not supplied', () => {
            const result = mapCompanyToAccount(makeCompany());
            // No website → Website key absent or undefined — value should not contain garbage
            expect(result.Website).to.be.undefined();
        });

        it('output never contains undefined for Name', () => {
            const result = mapCompanyToAccount(makeCompany({ name: 'X' }));
            expect(result.Name).to.not.be.undefined();
        });
    });

    // ─── mapCompanyUserToContact ────────────────────────────────────────────────
    describe('mapCompanyUserToContact', () => {
        it('minimal data produces valid Contact with required fields', () => {
            const result = mapCompanyUserToContact(makeUser(), makeCompanyUser(), 'SF_ACCOUNT_001');
            expect(result.FirstName).to.equal('Jane');
            expect(result.LastName).to.equal('Doe');
            expect(result.Email).to.equal('jane.doe@example.com');
            expect(result.AccountId).to.equal('SF_ACCOUNT_001');
        });

        it('companyRole maps to Company_Role__c', () => {
            const result = mapCompanyUserToContact(makeUser(), makeCompanyUser({ companyRole: 'seller' }), 'SF_ACCT');
            expect(result.Company_Role__c).to.equal('SELLER');
        });

        it('status maps to Company_User_Status__c', () => {
            const result = mapCompanyUserToContact(makeUser(), makeCompanyUser({ status: 'pending' }), 'SF_ACCT');
            expect(result.Company_User_Status__c).to.equal('PENDING');
        });

        it('isPrimaryContact mapped to Is_Primary_Contact__c', () => {
            const result = mapCompanyUserToContact(makeUser(), makeCompanyUser({ isPrimaryContact: true }), 'SF_ACCT');
            expect(result.Is_Primary_Contact__c).to.be.true();
        });

        it('rejected status sets No_Longer_With_Company__c true', () => {
            const result = mapCompanyUserToContact(makeUser(), makeCompanyUser({ status: 'rejected' }), 'SF_ACCT');
            expect(result.No_Longer_With_Company__c).to.be.true();
        });

        it('WasteTrade_User_Id__c is set', () => {
            const result = mapCompanyUserToContact(makeUser({ id: 99 }), makeCompanyUser(), 'SF_ACCT');
            expect(result.WasteTrade_User_Id__c as string).to.match(/99/);
        });

        it('optional prefix maps to Title', () => {
            const result = mapCompanyUserToContact(makeUser({ prefix: 'Dr' }), makeCompanyUser(), 'SF_ACCT');
            expect(result.Title).to.equal('Dr');
        });

        it('primaryLocation populates site address', () => {
            const result = mapCompanyUserToContact(makeUser(), makeCompanyUser(), 'SF_ACCT', makeLocation());
            expect(result.Site_Location_Address__c).to.equal('Main Site');
        });

        it('output includes Last_Sync_Origin__c marker', () => {
            const result = mapCompanyUserToContact(makeUser(), makeCompanyUser(), 'SF_ACCT');
            expect(result.Last_Sync_Origin__c as string).to.match(/^WT_/);
        });
    });

    // ─── mapListingToWantedListing ─────────────────────────────────────────────
    describe('mapListingToWantedListing', () => {
        it('minimal listing produces valid Wanted_Listing record', () => {
            const result = mapListingToWantedListing(makeListing());
            expect(result.Name).to.be.a.String();
            expect((result.Name as string).length).to.be.greaterThan(0);
        });

        it('WasteTrade_Listing_Id__c is set', () => {
            const result = mapListingToWantedListing(makeListing({ id: 77 }));
            expect(result.WasteTrade_Listing_Id__c as string).to.match(/77/);
        });

        it('Listing_Status__c reflects status mapping', () => {
            const result = mapListingToWantedListing(makeListing({ status: 'available' }));
            expect(result.Listing_Status__c).to.equal('Available');
        });

        it('Material_Type__c is set from materialType', () => {
            const result = mapListingToWantedListing(makeListing({ materialType: 'PP' }));
            expect(result.Material_Type__c).to.equal('PP');
        });

        it('Quantity__c is a number', () => {
            const result = mapListingToWantedListing(makeListing({ quantity: 20 }));
            expect(result.Quantity__c).to.equal(20);
        });

        it('null optional fields do not throw', () => {
            const listing = makeListing({ description: null, createdAt: null });
            expect(() => mapListingToWantedListing(listing)).to.not.throw();
        });

        it('output includes Last_Sync_Origin__c marker', () => {
            const result = mapListingToWantedListing(makeListing());
            expect(result.Last_Sync_Origin__c as string).to.match(/^WT_/);
        });
    });

    // ─── mapCompanyDocumentToSalesforceDocument ────────────────────────────────
    describe('mapCompanyDocumentToSalesforceDocument', () => {
        it('produces Document__c with required fields', () => {
            const result = mapCompanyDocumentToSalesforceDocument(makeCompanyDoc());
            expect(result.Name).to.be.a.String();
            expect(result.Document_Type__c).to.equal('insurance');
            expect(result.Document_URL__c).to.equal('https://s3.example.com/doc.pdf');
        });

        it('WasteTrade_Document_Id__c is set', () => {
            const result = mapCompanyDocumentToSalesforceDocument(makeCompanyDoc({ id: 20 }));
            expect(result.WasteTrade_Document_Id__c as string).to.match(/20/);
        });

        it('Document_Status__c reflects status', () => {
            const result = mapCompanyDocumentToSalesforceDocument(makeCompanyDoc({ status: 'approved' }));
            expect(result.Document_Status__c).to.equal('approved');
        });

        it('Expiry_Date__c is set when expiryDate is a DD/MM/YYYY string', () => {
            // convertDateToSalesforceFormat uses local-time Date constructor → UTC ISO string,
            // so exact output depends on server timezone. Assert shape only for DD/MM/YYYY input.
            const result = mapCompanyDocumentToSalesforceDocument(makeCompanyDoc({ expiryDate: '31/12/2025' }));
            expect(result.Expiry_Date__c).to.match(/^\d{4}-\d{2}-\d{2}$/);
        });

        it('Expiry_Date__c is undefined when not provided', () => {
            const result = mapCompanyDocumentToSalesforceDocument(makeCompanyDoc({ expiryDate: undefined }));
            expect(result.Expiry_Date__c).to.be.undefined();
        });

        it('uploadedBy and reviewedBy set when ids provided', () => {
            const result = mapCompanyDocumentToSalesforceDocument(
                makeCompanyDoc({ uploadedByUserId: 5, reviewedByUserId: 6 }),
            );
            expect(result.Uploaded_By__c as string).to.match(/5/);
            expect(result.Reviewed_By__c as string).to.match(/6/);
        });

        it('optional fields absent when not supplied', () => {
            const result = mapCompanyDocumentToSalesforceDocument(
                makeCompanyDoc({ uploadedByUserId: undefined, reviewedByUserId: undefined }),
            );
            expect(result.Uploaded_By__c).to.be.undefined();
            expect(result.Reviewed_By__c).to.be.undefined();
        });
    });

    // ─── mapLocationDocumentToSalesforceDocument ───────────────────────────────
    describe('mapLocationDocumentToSalesforceDocument', () => {
        it('produces Document record with Name and type', () => {
            const result = mapLocationDocumentToSalesforceDocument(makeLocationDoc());
            expect(result.Name).to.be.a.String();
            expect(result.Document_Type__c).to.equal('site_cert');
        });

        it('WasteTrade_Document_Id__c is set', () => {
            const result = mapLocationDocumentToSalesforceDocument(makeLocationDoc({ id: 30 }));
            expect(result.WasteTrade_Document_Id__c as string).to.match(/30/);
        });

        it('Document_URL__c reflects documentUrl', () => {
            const result = mapLocationDocumentToSalesforceDocument(makeLocationDoc());
            expect(result.Document_URL__c).to.equal('https://s3.example.com/site.pdf');
        });

        it('null optional fields do not throw', () => {
            const doc = makeLocationDoc({ uploadedByUserId: null, reviewedByUserId: null, expiryDate: null });
            expect(() => mapLocationDocumentToSalesforceDocument(doc)).to.not.throw();
        });

        it('external ID generation includes non-production env prefix', () => {
            const origEnv = process.env.ENVIRONMENT;
            const origNode = process.env.NODE_ENV;
            delete process.env.ENVIRONMENT;
            process.env.NODE_ENV = 'test';
            const result = mapLocationDocumentToSalesforceDocument(makeLocationDoc({ id: 30 }));
            expect(result.WasteTrade_Document_Id__c as string).to.match(/TEST_/);
            process.env.ENVIRONMENT = origEnv!;
            process.env.NODE_ENV = origNode!;
        });
    });

    // ─── mapHaulageLoadToSalesforce ────────────────────────────────────────────
    describe('mapHaulageLoadToSalesforce', () => {
        function makeLoad(overrides: Record<string, any> = {}): any {
            return {
                id: 55,
                loadNumber: 3,
                collectionDate: '2025-06-15T09:00:00.000Z',
                grossWeight: 24500,
                palletWeight: 1200,
                loadStatus: 'Awaiting Collection',
                ...overrides,
            };
        }

        function makeHaulageOffer(overrides: Record<string, any> = {}): any {
            return {
                id: 10,
                ...overrides,
            };
        }

        it('Name is set with env prefix', () => {
            const result = mapHaulageLoadToSalesforce(makeLoad());
            expect(result.Name).to.be.a.String();
            expect((result.Name as string).length).to.be.greaterThan(0);
        });

        it('WasteTrade_Load_Id__c is set from load id', () => {
            const result = mapHaulageLoadToSalesforce(makeLoad({ id: 55 }));
            expect(result.WasteTrade_Load_Id__c as string).to.match(/55/);
        });

        it('haulage_bid_id__c is set when haulageOffer provided', () => {
            const result = mapHaulageLoadToSalesforce(makeLoad(), makeHaulageOffer({ id: 10 }));
            expect(result.haulage_bid_id__c as string).to.match(/10/);
        });

        it('haulage_bid_id__c is undefined when no haulageOffer', () => {
            const result = mapHaulageLoadToSalesforce(makeLoad());
            expect(result.haulage_bid_id__c).to.be.undefined();
        });

        it('load_number__c reflects loadNumber', () => {
            const result = mapHaulageLoadToSalesforce(makeLoad({ loadNumber: 7 }));
            expect(result.load_number__c).to.equal(7);
        });

        it('collection_date__c is formatted as YYYY-MM-DD', () => {
            const result = mapHaulageLoadToSalesforce(makeLoad({ collectionDate: '2025-09-20T00:00:00.000Z' }));
            expect(result.collection_date__c).to.match(/^\d{4}-\d{2}-\d{2}$/);
        });

        it('collection_date__c is undefined when collectionDate absent', () => {
            const result = mapHaulageLoadToSalesforce(makeLoad({ collectionDate: undefined }));
            expect(result.collection_date__c).to.be.undefined();
        });

        it('gross_weight__c is string representation of grossWeight', () => {
            const result = mapHaulageLoadToSalesforce(makeLoad({ grossWeight: 18000 }));
            expect(result.gross_weight__c).to.equal('18000');
        });

        it('load_status__c reflects loadStatus', () => {
            const result = mapHaulageLoadToSalesforce(makeLoad({ loadStatus: 'Delivered' }));
            expect(result.load_status__c).to.equal('Delivered');
        });

        it('Last_Sync_Origin__c marker begins with WT_', () => {
            const result = mapHaulageLoadToSalesforce(makeLoad());
            expect(result.Last_Sync_Origin__c as string).to.match(/^WT_/);
        });

        it('load id absent — Name falls back to load.id', () => {
            const result = mapHaulageLoadToSalesforce(makeLoad({ loadNumber: undefined, id: 99 }));
            expect(result.Name as string).to.match(/99/);
        });
    });

    // ─── mapUserToContact ──────────────────────────────────────────────────────
    describe('mapUserToContact', () => {
        it('produces Contact with required fields', () => {
            const result = mapUserToContact(makeUser(), 'SF_ACCT_007');
            expect(result.FirstName).to.equal('Jane');
            expect(result.LastName).to.equal('Doe');
            expect(result.Email).to.equal('jane.doe@example.com');
            expect(result.AccountId).to.equal('SF_ACCT_007');
        });

        it('prefix maps to Title', () => {
            const result = mapUserToContact(makeUser({ prefix: 'Dr' }), 'SF_ACCT_007');
            expect(result.Title).to.equal('Dr');
        });

        it('jobTitle maps to Job_Title__c', () => {
            const result = mapUserToContact(makeUser({ jobTitle: 'Recycling Manager' }), 'SF_ACCT_007');
            expect(result.Job_Title__c).to.equal('Recycling Manager');
        });

        it('WasteTrade_User_Id__c is set from user id', () => {
            const result = mapUserToContact(makeUser({ id: 42 }), 'SF_ACCT_007');
            expect(result.WasteTrade_User_Id__c as string).to.match(/42/);
        });

        it('Last_Sync_Origin__c marker begins with WT_', () => {
            const result = mapUserToContact(makeUser(), 'SF_ACCT_007');
            expect(result.Last_Sync_Origin__c as string).to.match(/^WT_/);
        });
    });

    // ─── mapUserToLead (async) ─────────────────────────────────────────────────
    describe('mapUserToLead', () => {
        const stubMaterialRepo = { find: async () => [] };

        it('produces Lead with required fields', async () => {
            const result = await mapUserToLead(makeUser(), makeCompany({ name: 'GreenWave Recycling Ltd' }), stubMaterialRepo);
            expect(result.FirstName).to.equal('Jane');
            expect(result.LastName).to.equal('Doe');
            expect(result.Company).to.be.a.String();
        });

        it('LeadSource maps via mapLeadSource', async () => {
            const user = makeUser({ whereDidYouHearAboutUs: 'Trade Show' });
            const result = await mapUserToLead(user, makeCompany(), stubMaterialRepo);
            expect(result.LeadSource).to.equal('Trade Show');
        });

        it('invalid email clears Email field', async () => {
            const user = makeUser({ email: 'not-valid' });
            const result = await mapUserToLead(user, makeCompany(), stubMaterialRepo);
            expect(result.Email).to.be.undefined();
        });

        it('Last_Sync_Origin__c begins with WT_', async () => {
            const result = await mapUserToLead(makeUser(), makeCompany(), stubMaterialRepo);
            expect(result.Last_Sync_Origin__c as string).to.match(/^WT_/);
        });

        it('material repo failure falls back gracefully', async () => {
            const failingRepo = { find: async () => { throw new Error('DB down'); } };
            const result = await mapUserToLead(makeUser(), makeCompany(), failingRepo);
            expect(result).to.have.property('FirstName');
        });
    });

    // ─── mapListingToSalesListing (async) ─────────────────────────────────────
    describe('mapListingToSalesListing', () => {
        it('produces SalesListing with Name and WasteTrade_Listing_Id__c', async () => {
            const result = await mapListingToSalesListing(makeListing({ id: 88, title: 'HDPE Bales Lot 5' }));
            expect(result.Name).to.be.a.String();
            expect((result.Name as string).length).to.be.greaterThan(0);
            expect(result.WasteTrade_Listing_Id__c as string).to.match(/88/);
        });

        it('Sales_Listing_Link__c contains listing id', async () => {
            const result = await mapListingToSalesListing(makeListing({ id: 77 }));
            expect(result.Sales_Listing_Link__c as string).to.match(/77/);
        });

        it('feature images extracted from documents', async () => {
            const docs = [
                { documentType: 'feature_image', documentUrl: 'https://cdn.example.com/img1.jpg' },
                { documentType: 'feature_image', documentUrl: 'cdn.example.com/img2.jpg' },
            ];
            const result = await mapListingToSalesListing(makeListing(), docs);
            expect(result.Sales_Listing_Featured_Image_Link__c).to.equal('https://cdn.example.com/img1.jpg');
            // Second image gets https:// prefix added
            expect(result.Sales_Listing_Featured_Image_Link_2__c as string).to.match(/^https:\/\//);
        });

        it('location address included when location provided', async () => {
            const result = await mapListingToSalesListing(makeListing(), [], makeLocation({ city: 'Manchester' }));
            expect(result.Pickup_Location_Address__c as string).to.match(/Manchester/);
        });

        it('Last_Sync_Origin__c begins with WT_', async () => {
            const result = await mapListingToSalesListing(makeListing());
            expect(result.Last_Sync_Origin__c as string).to.match(/^WT_/);
        });
    });

    // ─── mapOfferToSalesforceOffer (async) ────────────────────────────────────
    describe('mapOfferToSalesforceOffer', () => {
        function makeOffer(overrides: Record<string, any> = {}): any {
            return {
                id: 200,
                listingId: undefined,
                buyerUserId: undefined,
                sellerUserId: undefined,
                buyerCompanyId: undefined,
                sellerCompanyId: undefined,
                buyerLocationId: undefined,
                sellerLocationId: undefined,
                status: 'pending',
                quantity: 10,
                offeredPricePerUnit: 500,
                currency: 'GBP',
                ...overrides,
            };
        }

        const nullRepos = {
            listingsRepository: { findById: async () => { throw new Error('not found'); } },
            userRepository: { findById: async () => { throw new Error('not found'); } },
            companiesRepository: { findById: async () => { throw new Error('not found'); } },
            companyLocationsRepository: { findById: async () => { throw new Error('not found'); } },
        };

        it('produces Offer record with Name and WasteTrade_Offer_Id__c', async () => {
            const result = await mapOfferToSalesforceOffer(makeOffer({ id: 200 }), nullRepos);
            expect(result.Name).to.be.a.String();
            expect(result.WasteTrade_Offer_Id__c as string).to.match(/200/);
        });

        it('Quantity__c and bid_value__c set from offer fields', async () => {
            const result = await mapOfferToSalesforceOffer(
                makeOffer({ quantity: 25, offeredPricePerUnit: 750 }),
                nullRepos,
            );
            expect(result.Quantity__c).to.equal(25);
            expect(result.bid_value__c).to.equal(750);
        });

        it('handles missing related data gracefully (repos throw)', async () => {
            const result = await mapOfferToSalesforceOffer(
                makeOffer({ listingId: 1, buyerUserId: 2 }),
                nullRepos,
            );
            expect(result).to.have.property('Name');
        });
    });

    // ─── mapHaulageOfferToSalesforce (async) ──────────────────────────────────
    describe('mapHaulageOfferToSalesforce', () => {
        function makeHaulageOfferObj(overrides: Record<string, any> = {}): any {
            return {
                id: 300,
                offerId: undefined,
                haulierUserId: undefined,
                haulierCompanyId: undefined,
                status: 'pending',
                trailerContainerType: 'curtain_slider_standard',
                haulageCostPerLoad: 250,
                currency: 'GBP',
                ...overrides,
            };
        }

        const nullRepos = {
            offersRepository: { findById: async () => { throw new Error('not found'); } },
            listingsRepository: { findById: async () => { throw new Error('not found'); } },
            userRepository: { findById: async () => { throw new Error('not found'); } },
            companiesRepository: { findById: async () => { throw new Error('not found'); } },
            companyLocationsRepository: { findById: async () => { throw new Error('not found'); } },
        };

        it('produces HaulageOffer record with Name and external ID', async () => {
            const result = await mapHaulageOfferToSalesforce(makeHaulageOfferObj({ id: 300 }), nullRepos);
            expect(result.Name as string).to.match(/300/);
            expect(result.WasteTrade_Haulage_Offers_ID__c as string).to.match(/300/);
        });

        it('trailer_or_container__c is always Trailer', async () => {
            const result = await mapHaulageOfferToSalesforce(makeHaulageOfferObj(), nullRepos);
            expect(result.trailer_or_container__c).to.equal('Trailer');
        });

        it('trailer_type__c maps legacy value correctly', async () => {
            const result = await mapHaulageOfferToSalesforce(
                makeHaulageOfferObj({ trailerContainerType: 'walking_floor' }),
                nullRepos,
            );
            expect(result.trailer_type__c).to.equal('Walking Floor');
        });

        it('haulage__c is string representation of haulageCostPerLoad', async () => {
            const result = await mapHaulageOfferToSalesforce(
                makeHaulageOfferObj({ haulageCostPerLoad: 350 }),
                nullRepos,
            );
            expect(result.haulage__c).to.equal('350');
        });

        it('handles missing related data gracefully', async () => {
            const result = await mapHaulageOfferToSalesforce(
                makeHaulageOfferObj({ offerId: 1, haulierUserId: 2 }),
                nullRepos,
            );
            expect(result).to.have.property('Name');
        });
    });
});
