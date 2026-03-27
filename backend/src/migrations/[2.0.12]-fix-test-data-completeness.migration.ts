import { MigrationScript, migrationScript } from 'loopback4-migration';
import * as juggler from '@loopback/repository';
import { inject } from '@loopback/core';

@migrationScript()
export class FixTestDataCompleteness implements MigrationScript {
    version = '2.0.12';
    scriptName = 'FixTestDataCompleteness';
    description =
        'Link test users to companies, create documents/locations, fill all fields so computed statuses match real users';

    constructor(@inject('datasources.db') private dataSource: juggler.DataSource) {}

    async up(): Promise<void> {
        // 1. Get all test users and companies
        const testUsers = await this.dataSource.execute(
            `SELECT id, email FROM users WHERE email LIKE '%@yopmail.com' ORDER BY id`,
        );
        const testCompanies = await this.dataSource.execute(
            `SELECT id, name, is_seller, is_buyer FROM companies WHERE email LIKE 'contact@company%' ORDER BY id`,
        );

        if (!testUsers.length || !testCompanies.length) {
            console.log('⚠ No test users or companies found — skipping');
            return;
        }

        // Find admin users for reviewer/assignee references
        const adminUsers = await this.dataSource.execute(
            `SELECT id FROM users WHERE global_role IN ('admin', 'super_admin') ORDER BY id LIMIT 5`,
        );
        const adminIds = adminUsers.map((u: { id: number }) => u.id);

        // ──────────────────────────────────────────────
        // 2. Create company_users records (link users → companies)
        // ──────────────────────────────────────────────
        let companyUsersCreated = 0;
        for (let i = 0; i < testUsers.length; i++) {
            const user = testUsers[i];
            const company = testCompanies[i % testCompanies.length];
            const isPrimary = i < testCompanies.length; // First user per company is primary contact
            const role = i < 5 ? 'admin' : i % 2 === 0 ? 'seller' : 'buyer';

            const existing = await this.dataSource.execute(
                `SELECT id FROM company_users WHERE user_id = $1 AND company_id = $2`,
                [user.id, company.id],
            );
            if (existing.length > 0) continue;

            await this.dataSource.execute(
                `INSERT INTO company_users (user_id, company_id, company_role, is_primary_contact, status, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
                [user.id, company.id, role, isPrimary, 'active'],
            );
            companyUsersCreated++;
        }
        console.log(`✓ Created ${companyUsersCreated} company_users links`);

        // ──────────────────────────────────────────────
        // 4. Fill missing user fields
        //    → lastLoginAt, whereDidYouHearAboutUs, email prefs, assignedAdminId
        // ──────────────────────────────────────────────
        const hearAboutOptions = [
            'google_search',
            'prse_trade_show',
            'word_of_mouth',
            'sustainability_show',
            'plastics_live_trade_show',
            'k_show',
        ];
        for (let i = 0; i < testUsers.length; i++) {
            const user = testUsers[i];
            const hearAbout = hearAboutOptions[Math.floor(Math.random() * hearAboutOptions.length)];
            const daysAgo = Math.floor(Math.random() * 30);
            const lastLogin = new Date();
            lastLogin.setDate(lastLogin.getDate() - daysAgo);

            // Assign admin to non-admin users (like real onboarded users)
            const assignedAdmin = adminIds.length > 0 ? adminIds[i % adminIds.length] : null;

            await this.dataSource.execute(
                `UPDATE users SET
                    last_login_at = $1,
                    where_did_you_hear_about_us = $2,
                    receive_email_for_offers_on_my_listings = true,
                    receive_email_for_new_matching_listings = true,
                    assigned_admin_id = $3
                 WHERE id = $4`,
                [lastLogin.toISOString(), hearAbout, assignedAdmin, user.id],
            );
        }
        console.log(`✓ Updated ${testUsers.length} users with missing fields`);

        // ──────────────────────────────────────────────
        // 5. Fill missing company fields
        //    → vatNumber (onboarding step 1), companyInterest, registrationNumber
        //    → favoriteMaterials (non-empty), mobileNumber, description, etc.
        //    → status = 'active' + verifiedAt (registrationStatus=COMPLETE, overallStatus=COMPLETE)
        // ──────────────────────────────────────────────
        const interests = ['buyer', 'seller', 'both'];
        const materialOptions = ['HDPE', 'LDPE', 'PET', 'PP', 'PVC', 'PS', 'ABS', 'Nylon'];
        for (let i = 0; i < testCompanies.length; i++) {
            const company = testCompanies[i];
            const interest = interests[i % interests.length];
            const regNum = `REG-${100000 + i}`;
            const vatNum = `GB${200000000 + i}`;

            // Pick 2-4 favorite materials
            const shuffledMats = [...materialOptions].sort(() => Math.random() - 0.5);
            const favMaterials = shuffledMats.slice(0, 2 + Math.floor(Math.random() * 3));

            await this.dataSource.execute(
                `UPDATE companies SET
                    company_interest = $1,
                    registration_number = $2,
                    vat_number = $3,
                    vat_registration_country = 'GB',
                    description = $4,
                    box_clearing_agent = false,
                    verified_at = NOW(),
                    website = $5,
                    country_code = 'GB',
                    state_province = 'England',
                    status = 'active',
                    mobile_number = $6,
                    favorite_materials = $7
                 WHERE id = $8`,
                [
                    interest,
                    regNum,
                    vatNum,
                    `Test company ${company.name} - waste trading and recycling services`,
                    `https://www.${company.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
                    `+44 7${Math.floor(Math.random() * 900000000) + 100000000}`,
                    JSON.stringify(favMaterials),
                    company.id,
                ],
            );
        }
        console.log(`✓ Updated ${testCompanies.length} companies with full profile fields`);

        // ──────────────────────────────────────────────
        // 6. Create company_documents (approved) for each company
        //    → hasApprovedDocuments = true (onboarding step 2 complete)
        //    3 doc types per company: environmental_permit, waste_exemption, waste_carrier_license
        // ──────────────────────────────────────────────
        const documentTypes = [
            { type: 'environmental_permit', name: 'Environmental Permit' },
            { type: 'waste_exemption', name: 'Waste Exemption Certificate' },
            { type: 'waste_carrier_license', name: 'Waste Carrier License' },
        ];
        let docsCreated = 0;

        for (const company of testCompanies) {
            const primaryUser = await this.dataSource.execute(
                `SELECT user_id FROM company_users WHERE company_id = $1 ORDER BY is_primary_contact DESC, id ASC LIMIT 1`,
                [company.id],
            );
            const uploaderId = primaryUser.length > 0 ? primaryUser[0].user_id : testUsers[0].id;
            const reviewerId = adminIds.length > 0 ? adminIds[0] : uploaderId;

            for (const docType of documentTypes) {
                const existingDoc = await this.dataSource.execute(
                    `SELECT id FROM company_documents WHERE company_id = $1 AND document_type = $2`,
                    [company.id, docType.type],
                );
                if (existingDoc.length > 0) continue;

                // Expiry 1-2 years in the future
                const expiryDate = new Date();
                expiryDate.setFullYear(expiryDate.getFullYear() + 1 + Math.floor(Math.random() * 2));
                const expiryStr = `${expiryDate.getDate().toString().padStart(2, '0')}/${(expiryDate.getMonth() + 1).toString().padStart(2, '0')}/${expiryDate.getFullYear()}`;

                await this.dataSource.execute(
                    `INSERT INTO company_documents
                        (company_id, uploaded_by_user_id, reviewed_by_user_id, document_type, document_name, document_url, status, reviewed_at, expiry_date, is_synced_salesforce, created_at, updated_at)
                     VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), $8, false, NOW(), NOW())`,
                    [
                        company.id,
                        uploaderId,
                        reviewerId,
                        docType.type,
                        `${docType.name} - ${company.name}`,
                        `https://s3.amazonaws.com/wastetrade-test/documents/${company.id}/${docType.type}.pdf`,
                        'approved',
                        expiryStr,
                    ],
                );
                docsCreated++;
            }
        }
        console.log(`✓ Created ${docsCreated} approved company documents`);

        // ──────────────────────────────────────────────
        // 7. Create company_locations (complete) for each company
        //    → hasCompleteLocations = true (onboarding step 3 complete)
        //    Required: locationName, addressLine, city, country
        //    Also fills: siteSpecificInstructions, selfLoadUnLoadCapability, accessRestrictions
        // ──────────────────────────────────────────────
        const locationData = [
            { name: 'Main Warehouse', city: 'London', address: '100 Industrial Way', postcode: 'E1 6AN', country: 'United Kingdom' },
            { name: 'Processing Facility', city: 'Manchester', address: '42 Recycling Road', postcode: 'M1 1AA', country: 'United Kingdom' },
            { name: 'Distribution Centre', city: 'Birmingham', address: '7 Commerce Park', postcode: 'B1 2RA', country: 'United Kingdom' },
            { name: 'Sorting Plant', city: 'Leeds', address: '55 Green Lane', postcode: 'LS1 4AP', country: 'United Kingdom' },
            { name: 'Collection Depot', city: 'Bristol', address: '23 Harbour View', postcode: 'BS1 5QD', country: 'United Kingdom' },
            { name: 'Head Office', city: 'Edinburgh', address: '12 Royal Mile', postcode: 'EH1 1BB', country: 'United Kingdom' },
            { name: 'Recycling Hub', city: 'Cardiff', address: '88 Bay Terrace', postcode: 'CF10 4PA', country: 'United Kingdom' },
            { name: 'Storage Yard', city: 'Liverpool', address: '16 Dock Road', postcode: 'L3 4BB', country: 'United Kingdom' },
            { name: 'Testing Lab', city: 'Glasgow', address: '33 Kelvin Way', postcode: 'G3 7SA', country: 'United Kingdom' },
            { name: 'Shipping Terminal', city: 'Southampton', address: '1 Port Gate', postcode: 'SO14 3FJ', country: 'United Kingdom' },
        ];
        const containerTypes = ['Curtain Sider', 'Containers', 'Tipper Trucks', 'Walking Floor'];
        const acceptedMats = ['HDPE', 'LDPE', 'PET', 'PP', 'PVC', 'PS'];
        const siteInstructions = [
            'Please report to reception on arrival. PPE required at all times.',
            'Use gate B for deliveries. Speed limit 5mph on site.',
            'Contact site manager before unloading. Hard hat area.',
            'Weigh in at front gate. Follow one-way system.',
            'Check in with security. No photography on site.',
        ];
        const accessRestrictionOptions = [
            'Max vehicle height 4.2m',
            'No articulated vehicles over 40t',
            'Access restricted to business hours only',
            'Width restriction 2.5m at entrance',
            'None',
        ];
        let locsCreated = 0;

        for (let i = 0; i < testCompanies.length; i++) {
            const company = testCompanies[i];
            const loc = locationData[i % locationData.length];

            const existingLoc = await this.dataSource.execute(
                `SELECT id FROM company_locations WHERE company_id = $1`,
                [company.id],
            );
            if (existingLoc.length > 0) continue;

            const contactUser = await this.dataSource.execute(
                `SELECT u.first_name, u.last_name, u.phone_number, u.prefix
                 FROM users u JOIN company_users cu ON cu.user_id = u.id
                 WHERE cu.company_id = $1 ORDER BY cu.is_primary_contact DESC LIMIT 1`,
                [company.id],
            );
            const contact = contactUser.length > 0
                ? contactUser[0]
                : { first_name: 'John', last_name: 'Doe', phone_number: '+44 20 70000000', prefix: 'mr' };

            const companyContainers = [...containerTypes]
                .sort(() => Math.random() - 0.5)
                .slice(0, 2 + Math.floor(Math.random() * 2));
            const companyMaterials = [...acceptedMats]
                .sort(() => Math.random() - 0.5)
                .slice(0, 2 + Math.floor(Math.random() * 3));

            await this.dataSource.execute(
                `INSERT INTO company_locations
                    (company_id, location_name, prefix, first_name, last_name, position_in_company, site_point_contact,
                     phone_number, address_line, street, postcode, city, country, state_province,
                     office_open_time, office_close_time, loading_ramp, weighbridge,
                     container_type, accepted_materials, site_specific_instructions,
                     self_load_unload_capability, access_restrictions,
                     main_location, created_at, updated_at)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14,
                         $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, NOW(), NOW())`,
                [
                    company.id,
                    loc.name,
                    contact.prefix || 'mr',
                    contact.first_name,
                    contact.last_name,
                    'Site Manager',
                    `${contact.first_name} ${contact.last_name}`,
                    contact.phone_number,
                    loc.address,
                    loc.address,
                    loc.postcode,
                    loc.city,
                    loc.country,
                    'England',
                    '08:00',
                    '17:00',
                    Math.random() > 0.3,  // loadingRamp
                    Math.random() > 0.5,  // weighbridge
                    JSON.stringify(companyContainers),
                    JSON.stringify(companyMaterials),
                    siteInstructions[i % siteInstructions.length],
                    Math.random() > 0.4,  // selfLoadUnLoadCapability
                    accessRestrictionOptions[i % accessRestrictionOptions.length],
                    true, // mainLocation
                ],
            );
            locsCreated++;
        }
        console.log(`✓ Created ${locsCreated} complete company locations`);

        // ──────────────────────────────────────────────
        // 8. Link listings to company locations + fill remaining listing fields
        //    → locationId, endDate, viewCount, capacityPerMonth
        // ──────────────────────────────────────────────
        const testListings = await this.dataSource.execute(
            `SELECT l.id, l.company_id, l.start_date FROM listings l
             WHERE l.title LIKE '%For Sale%' OR l.title LIKE '%Wanted%'`,
        );
        let listingsUpdated = 0;

        for (const listing of testListings) {
            // Find location for this listing's company
            const companyLoc = await this.dataSource.execute(
                `SELECT id FROM company_locations WHERE company_id = $1 LIMIT 1`,
                [listing.company_id],
            );
            const locationId = companyLoc.length > 0 ? companyLoc[0].id : null;

            // End date 30-180 days after start
            const startDate = listing.start_date ? new Date(listing.start_date) : new Date();
            const endDate = new Date(startDate);
            endDate.setDate(endDate.getDate() + 30 + Math.floor(Math.random() * 150));

            const viewCount = Math.floor(Math.random() * 500);
            const capacityPerMonth = Math.floor(Math.random() * 50) + 5; // 5-55 loads/month

            await this.dataSource.execute(
                `UPDATE listings SET
                    location_id = $1,
                    end_date = $2,
                    view_count = $3,
                    capacity_per_month = $4
                 WHERE id = $5`,
                [locationId, endDate.toISOString(), viewCount, capacityPerMonth, listing.id],
            );
            listingsUpdated++;
        }
        console.log(`✓ Updated ${listingsUpdated} listings (locationId, endDate, viewCount, capacityPerMonth)`);

        // ──────────────────────────────────────────────
        // 9. Summary — expected computed statuses:
        //    • onboardingStatus  = SITE_LOCATION_ADDED (all 3 steps complete)
        //    • registrationStatus = COMPLETE (company.status = active)
        //    • overallStatus     = COMPLETE (company.status = active)
        // ──────────────────────────────────────────────
        console.log('\n✓ Test data completeness fix done!');
        console.log(`  - ${companyUsersCreated} company_users links`);
        console.log(`  - ${testUsers.length} users updated (lastLogin, hearAbout, email prefs, assignedAdmin)`);
        console.log(`  - ${testCompanies.length} companies updated (VAT, interest, reg, favMaterials, mobile, status=active)`);
        console.log(`  - ${docsCreated} approved company documents`);
        console.log(`  - ${locsCreated} complete company locations (with siteInstructions, selfLoad, accessRestrictions)`);
        console.log(`  - ${listingsUpdated} listings updated (locationId, endDate, viewCount, capacityPerMonth)`);
        console.log('  → onboardingStatus = SITE_LOCATION_ADDED');
        console.log('  → registrationStatus = COMPLETE');
        console.log('  → overallStatus = COMPLETE');
    }

    async down(): Promise<void> {
        const testCompanies = await this.dataSource.execute(
            `SELECT id FROM companies WHERE email LIKE 'contact@company%'`,
        );
        const testUsers = await this.dataSource.execute(
            `SELECT id FROM users WHERE email LIKE '%@yopmail.com'`,
        );

        if (testCompanies.length > 0) {
            const companyIds = testCompanies.map((c: { id: number }) => c.id);

            await this.dataSource.execute(
                `DELETE FROM company_locations WHERE company_id = ANY($1::int[])`,
                [companyIds],
            );
            console.log(`✓ Removed company_locations for ${companyIds.length} test companies`);

            await this.dataSource.execute(
                `DELETE FROM company_documents WHERE company_id = ANY($1::int[])`,
                [companyIds],
            );
            console.log(`✓ Removed company_documents for ${companyIds.length} test companies`);
        }

        if (testUsers.length > 0) {
            const userIds = testUsers.map((u: { id: number }) => u.id);

            await this.dataSource.execute(
                `DELETE FROM company_users WHERE user_id = ANY($1::int[])`,
                [userIds],
            );
            console.log(`✓ Removed company_users links for ${userIds.length} test users`);
        }

        // Reset listing fields (non-destructive — just nulls optional fields)
        await this.dataSource.execute(
            `UPDATE listings SET location_id = NULL, end_date = NULL, view_count = NULL, capacity_per_month = NULL
             WHERE title LIKE '%For Sale%' OR title LIKE '%Wanted%'`,
        );
        console.log('✓ Reset listing optional fields');

        console.log('✓ Rollback complete');
    }
}
