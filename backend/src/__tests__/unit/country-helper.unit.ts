/**
 * country-helper.unit.ts
 * Tests for country.helper.ts
 * CountryHelper is currently an empty namespace stub.
 */
import { expect } from '@loopback/testlab';

describe('CountryHelper (unit)', () => {
    it('country.helper module loads without error', async () => {
        // The module exports: export namespace CountryHelper {}
        // An empty namespace compiles to nothing at runtime; just verify import succeeds.
        let error: unknown = null;
        try {
            await import('../../helpers/country.helper');
        } catch (e) {
            error = e;
        }
        expect(error).to.be.null();
    });

    it('country.helper module exports are defined', async () => {
        const mod = await import('../../helpers/country.helper');
        // Module object itself should exist even if CountryHelper namespace is empty
        expect(mod).to.not.be.undefined();
    });
});
