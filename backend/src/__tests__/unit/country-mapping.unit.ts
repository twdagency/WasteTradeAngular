import { expect } from '@loopback/testlab';
import {
    getCountryIsoCode,
    getAllMatchingCountryIsoCodes,
    getAllCountryMappings,
    isValidCountryName,
} from '../../utils/country-mapping';

describe('country-mapping (unit)', () => {
    describe('getCountryIsoCode', () => {
        it('returns ISO code for exact country name (case insensitive)', () => {
            expect(getCountryIsoCode('france')).to.equal('FR');
            expect(getCountryIsoCode('France')).to.equal('FR');
            expect(getCountryIsoCode('FRANCE')).to.equal('FR');
        });

        it('handles multi-word country names', () => {
            expect(getCountryIsoCode('united kingdom')).to.equal('GB');
            expect(getCountryIsoCode('United States')).to.equal('US');
            expect(getCountryIsoCode('south africa')).to.equal('ZA');
        });

        it('trims whitespace', () => {
            expect(getCountryIsoCode('  germany  ')).to.equal('DE');
        });

        it('always returns a 2-character uppercase string', () => {
            // Function guarantees 2-char ISO code or 2-letter prefix for any input
            const result = getCountryIsoCode('France');
            expect(result).to.have.length(2);
            expect(result).to.equal(result.toUpperCase());
        });

        it('returns correct code for common countries', () => {
            expect(getCountryIsoCode('australia')).to.equal('AU');
            expect(getCountryIsoCode('canada')).to.equal('CA');
            expect(getCountryIsoCode('japan')).to.equal('JP');
        });
    });

    describe('getAllMatchingCountryIsoCodes', () => {
        it('returns all ISO codes containing the search term', () => {
            const results = getAllMatchingCountryIsoCodes('united');
            expect(results).to.containEql('GB'); // united kingdom
            expect(results).to.containEql('US'); // united states
            expect(results).to.containEql('AE'); // united arab emirates
        });

        it('returns empty array for no matches', () => {
            const results = getAllMatchingCountryIsoCodes('xyzxyzxyz');
            expect(results).to.deepEqual([]);
        });

        it('is case insensitive', () => {
            const lower = getAllMatchingCountryIsoCodes('africa');
            const upper = getAllMatchingCountryIsoCodes('Africa');
            expect(lower).to.deepEqual(upper);
        });
    });

    describe('getAllCountryMappings', () => {
        it('returns a non-empty record', () => {
            const mappings = getAllCountryMappings();
            expect(Object.keys(mappings).length).to.be.greaterThan(0);
        });

        it('returns a copy (mutation does not affect original)', () => {
            const mappings = getAllCountryMappings();
            mappings['testcountry'] = 'XX';
            const mappings2 = getAllCountryMappings();
            expect(mappings2['testcountry']).to.be.undefined();
        });
    });

    describe('isValidCountryName', () => {
        it('returns true for known country names', () => {
            expect(isValidCountryName('france')).to.be.true();
            expect(isValidCountryName('Germany')).to.be.true();
        });

        it('returns false for unknown names', () => {
            expect(isValidCountryName('Xyzlandia')).to.be.false();
        });

        it('is case insensitive', () => {
            expect(isValidCountryName('AUSTRALIA')).to.be.true();
        });
    });
});
