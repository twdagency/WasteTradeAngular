import { MigrationScript, migrationScript } from 'loopback4-migration';
import * as juggler from '@loopback/repository';
import { inject } from '@loopback/core';

@migrationScript()
export class FixTestDataCountryAndEmail implements MigrationScript {
    version = '2.0.13';
    scriptName = 'FixTestDataCountryAndEmail';
    description =
        'Fix company country, is_buyer/is_seller flags, and update @yopmail.com emails to @gmail.com';

    constructor(@inject('datasources.db') private dataSource: juggler.DataSource) {}

    async up(): Promise<void> {
        // ──────────────────────────────────────────────
        // 1. Set country + country_code on ALL companies missing country
        //    Default to GB / United Kingdom for all test data
        // ──────────────────────────────────────────────
        const companyCountryResult = await this.dataSource.execute(
            `UPDATE companies
             SET country = 'United Kingdom',
                 country_code = COALESCE(NULLIF(country_code, ''), 'GB'),
                 updated_at = NOW()
             WHERE (country IS NULL OR country = '')`,
        );
        const companiesUpdated =
            typeof companyCountryResult?.count === 'number' ? companyCountryResult.count : companyCountryResult?.length ?? 0;
        console.log(`✓ Updated ${companiesUpdated} companies with country = 'United Kingdom'`);

        // ──────────────────────────────────────────────
        // 2. Sync is_buyer / is_seller flags from company_interest
        //    company_interest was set in 2.0.12 but the boolean flags were not
        //    Frontend resolveAccountType() depends on these flags
        // ──────────────────────────────────────────────
        const buyerResult = await this.dataSource.execute(
            `UPDATE companies
             SET is_buyer = true, updated_at = NOW()
             WHERE company_interest IN ('buyer', 'both')
               AND is_buyer = false`,
        );
        const buyersFixed =
            typeof buyerResult?.count === 'number' ? buyerResult.count : buyerResult?.length ?? 0;

        const sellerResult = await this.dataSource.execute(
            `UPDATE companies
             SET is_seller = true, updated_at = NOW()
             WHERE company_interest IN ('seller', 'both')
               AND is_seller = false`,
        );
        const sellersFixed =
            typeof sellerResult?.count === 'number' ? sellerResult.count : sellerResult?.length ?? 0;
        console.log(`✓ Fixed is_buyer on ${buyersFixed} companies, is_seller on ${sellersFixed} companies`);

        // ──────────────────────────────────────────────
        // 3. Update @yopmail.com user emails to @gmail.com
        //    Skip where target email already exists (unique constraint on users.email)
        // ──────────────────────────────────────────────
        const yopmailUsers = await this.dataSource.execute(
            `SELECT id, email FROM users WHERE email LIKE '%@yopmail.com' ORDER BY id`,
        );
        let usersUpdated = 0;
        let usersSkipped = 0;

        for (const user of yopmailUsers) {
            const newEmail = user.email.replace('@yopmail.com', '@gmail.com');
            const existing = await this.dataSource.execute(
                `SELECT id FROM users WHERE email = $1`,
                [newEmail],
            );
            if (existing.length > 0) {
                console.log(`⚠ Skipped ${user.email} → ${newEmail} (already exists)`);
                usersSkipped++;
                continue;
            }
            await this.dataSource.execute(
                `UPDATE users SET email = $1, updated_at = NOW() WHERE id = $2`,
                [newEmail, user.id],
            );
            usersUpdated++;
        }
        console.log(`✓ Updated ${usersUpdated} user emails from @yopmail.com to @gmail.com (${usersSkipped} skipped)`);

        // ──────────────────────────────────────────────
        // 4. Update @yopmail.com company emails to @gmail.com
        //    Skip where target email already exists
        // ──────────────────────────────────────────────
        const yopmailCompanies = await this.dataSource.execute(
            `SELECT id, email FROM companies WHERE email LIKE '%@yopmail.com' ORDER BY id`,
        );
        let companyEmailsUpdated = 0;
        let companyEmailsSkipped = 0;

        for (const company of yopmailCompanies) {
            const newEmail = company.email.replace('@yopmail.com', '@gmail.com');
            const existing = await this.dataSource.execute(
                `SELECT id FROM companies WHERE email = $1`,
                [newEmail],
            );
            if (existing.length > 0) {
                console.log(`⚠ Skipped company ${company.email} → ${newEmail} (already exists)`);
                companyEmailsSkipped++;
                continue;
            }
            await this.dataSource.execute(
                `UPDATE companies SET email = $1, updated_at = NOW() WHERE id = $2`,
                [newEmail, company.id],
            );
            companyEmailsUpdated++;
        }
        console.log(`✓ Updated ${companyEmailsUpdated} company emails from @yopmail.com to @gmail.com (${companyEmailsSkipped} skipped)`);

        console.log('\n✓ Country & email migration done!');
    }

    async down(): Promise<void> {
        // Reverse email changes
        await this.dataSource.execute(
            `UPDATE users
             SET email = REPLACE(email, '@gmail.com', '@yopmail.com'),
                 updated_at = NOW()
             WHERE email LIKE '%@gmail.com'
               AND id IN (
                   SELECT id FROM users WHERE email LIKE '%@gmail.com'
               )`,
        );

        await this.dataSource.execute(
            `UPDATE companies
             SET email = REPLACE(email, '@gmail.com', '@yopmail.com'),
                 updated_at = NOW()
             WHERE email LIKE '%@gmail.com'`,
        );

        // Clear country on test companies
        await this.dataSource.execute(
            `UPDATE companies
             SET country = NULL
             WHERE email LIKE 'contact@company%'`,
        );

        console.log('✓ Rollback complete');
    }
}
