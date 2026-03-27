import { MigrationScript, migrationScript } from 'loopback4-migration';
import * as juggler from '@loopback/repository';
import { inject } from '@loopback/core';

@migrationScript()
export class FixCountryToIsoCode implements MigrationScript {
    version = '2.0.14';
    scriptName = 'FixCountryToIsoCode';
    description = 'Fix company country column: convert full names to ISO codes, sync is_buyer/is_seller flags';

    constructor(@inject('datasources.db') private dataSource: juggler.DataSource) {}

    async up(): Promise<void> {
        // ──────────────────────────────────────────────
        // 1. Convert full country names → ISO codes
        //    The country column must store ISO codes (e.g. 'GB', 'AE')
        // ──────────────────────────────────────────────
        const fullNameToCode: Record<string, string> = {
            'United Kingdom': 'GB',
            'United States': 'US',
            Germany: 'DE',
            France: 'FR',
            Netherlands: 'NL',
            Belgium: 'BE',
            Ireland: 'IE',
            Spain: 'ES',
            Italy: 'IT',
            Portugal: 'PT',
            Austria: 'AT',
            Switzerland: 'CH',
            Sweden: 'SE',
            Norway: 'NO',
            Denmark: 'DK',
            Finland: 'FI',
            Poland: 'PL',
            'Czech Republic': 'CZ',
            Romania: 'RO',
            Bulgaria: 'BG',
            Croatia: 'HR',
            Greece: 'GR',
            Hungary: 'HU',
            Slovakia: 'SK',
            Slovenia: 'SI',
            Lithuania: 'LT',
            Latvia: 'LV',
            Estonia: 'EE',
            Cyprus: 'CY',
            Malta: 'MT',
            Luxembourg: 'LU',
            Canada: 'CA',
            Australia: 'AU',
            'New Zealand': 'NZ',
            India: 'IN',
            China: 'CN',
            Japan: 'JP',
            'South Korea': 'KR',
            Singapore: 'SG',
            'United Arab Emirates': 'AE',
            'Saudi Arabia': 'SA',
            'South Africa': 'ZA',
            Brazil: 'BR',
            Mexico: 'MX',
            Turkey: 'TR',
            Israel: 'IL',
            Malaysia: 'MY',
            Thailand: 'TH',
            Vietnam: 'VN',
            Philippines: 'PH',
            Indonesia: 'ID',
        };

        const badRows = await this.dataSource.execute(
            `SELECT id, country FROM companies WHERE country IS NOT NULL AND LENGTH(country) > 3`,
        );
        let corrected = 0;
        let unknown = 0;
        for (const row of badRows) {
            const code = fullNameToCode[row.country];
            if (code) {
                await this.dataSource.execute(
                    `UPDATE companies SET country = $1, updated_at = NOW() WHERE id = $2`,
                    [code, row.id],
                );
                corrected++;
            } else {
                console.log(`⚠ Unknown country name '${row.country}' for company id=${row.id} — skipped`);
                unknown++;
            }
        }
        console.log(`✓ Corrected ${corrected} companies from full name → ISO code (${unknown} unknown)`);

        // ──────────────────────────────────────────────
        // 2. Fill missing country — copy from country_code, or default 'GB'
        // ──────────────────────────────────────────────
        const fillResult = await this.dataSource.execute(
            `UPDATE companies
             SET country = COALESCE(NULLIF(UPPER(country_code), ''), 'GB'),
                 country_code = COALESCE(NULLIF(country_code, ''), 'GB'),
                 updated_at = NOW()
             WHERE (country IS NULL OR country = '')`,
        );
        const filled = typeof fillResult?.count === 'number' ? fillResult.count : fillResult?.length ?? 0;
        console.log(`✓ Filled country on ${filled} companies (from country_code or default GB)`);

        // ──────────────────────────────────────────────
        // 3. Sync is_buyer / is_seller flags from company_interest
        // ──────────────────────────────────────────────
        const buyerResult = await this.dataSource.execute(
            `UPDATE companies SET is_buyer = true, updated_at = NOW()
             WHERE company_interest IN ('buyer', 'both') AND is_buyer = false`,
        );
        const buyersFixed = typeof buyerResult?.count === 'number' ? buyerResult.count : buyerResult?.length ?? 0;

        const sellerResult = await this.dataSource.execute(
            `UPDATE companies SET is_seller = true, updated_at = NOW()
             WHERE company_interest IN ('seller', 'both') AND is_seller = false`,
        );
        const sellersFixed = typeof sellerResult?.count === 'number' ? sellerResult.count : sellerResult?.length ?? 0;
        console.log(`✓ Fixed is_buyer on ${buyersFixed}, is_seller on ${sellersFixed} companies`);

        console.log('\n✓ Country ISO code fix done!');
    }

    async down(): Promise<void> {
        console.log('⚠ Rollback not needed — ISO codes are the correct format');
    }
}
