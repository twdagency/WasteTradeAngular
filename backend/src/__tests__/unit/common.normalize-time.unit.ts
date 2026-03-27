import { expect } from '@loopback/testlab';

import { normalizeTimeToPostgres } from '../../utils/common';

describe('normalizeTimeToPostgres (unit)', () => {
    it('normalizes H:M:SS and HH:MM:SS to HH:MM:SS', () => {
        expect(normalizeTimeToPostgres('11:1:00')).to.equal('11:01:00');
        expect(normalizeTimeToPostgres('1:3:00')).to.equal('01:03:00');
        expect(normalizeTimeToPostgres('09:07:05')).to.equal('09:07:05');
        expect(normalizeTimeToPostgres('9:7')).to.equal('09:07:00');
    });

    it('extracts time from ISO strings', () => {
        expect(normalizeTimeToPostgres('2025-04-29T08:00:00Z')).to.equal('08:00:00');
    });

    it('returns null for invalid values', () => {
        expect(normalizeTimeToPostgres('25:00:00')).to.equal(null);
        expect(normalizeTimeToPostgres('12:60:00')).to.equal(null);
        expect(normalizeTimeToPostgres('not-a-time')).to.equal(null);
    });
});
