import { expect } from '@loopback/testlab';
import { ListingHelper } from '../../helpers/listing.helper';
import { Listings } from '../../models';

function makeListing(partial: Partial<Listings>): Listings {
    return partial as Listings;
}

describe('ListingHelper (unit)', () => {
    describe('getListingTitle', () => {
        it('returns empty string for null/undefined listing', () => {
            expect(ListingHelper.getListingTitle(null as any)).to.equal('');
            expect(ListingHelper.getListingTitle(undefined as any)).to.equal('');
        });

        it('converts underscores to spaces and uppercases', () => {
            const listing = makeListing({ materialItem: 'corrugated_board' });
            expect(ListingHelper.getListingTitle(listing)).to.equal('CORRUGATED BOARD');
        });

        it('uppercases a plain material item', () => {
            const listing = makeListing({ materialItem: 'hdpe' });
            expect(ListingHelper.getListingTitle(listing)).to.equal('HDPE');
        });

        it('handles multi-word snake_case material items', () => {
            const listing = makeListing({ materialItem: 'mixed_white_heavily_printed' });
            expect(ListingHelper.getListingTitle(listing)).to.equal('MIXED WHITE HEAVILY PRINTED');
        });

        it('returns empty string when materialItem is undefined', () => {
            const listing = makeListing({ materialItem: undefined });
            expect(ListingHelper.getListingTitle(listing)).to.equal('');
        });

        it('returns empty string when materialItem is empty string', () => {
            const listing = makeListing({ materialItem: '' });
            expect(ListingHelper.getListingTitle(listing)).to.equal('');
        });

        it('handles material item with no underscores', () => {
            const listing = makeListing({ materialItem: 'aluminium' });
            expect(ListingHelper.getListingTitle(listing)).to.equal('ALUMINIUM');
        });

        it('handles mixed case input', () => {
            const listing = makeListing({ materialItem: 'Natural_Rubber' });
            expect(ListingHelper.getListingTitle(listing)).to.equal('NATURAL RUBBER');
        });
    });
});
