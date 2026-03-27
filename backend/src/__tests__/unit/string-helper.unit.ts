import { expect } from '@loopback/testlab';
import { StringHelper } from '../../helpers/string.helper';

describe('StringHelper (unit)', () => {
    describe('capitalizeFirstLetter', () => {
        it('capitalizes first letter and lowercases rest', () => {
            expect(StringHelper.capitalizeFirstLetter('recycling')).to.equal('Recycling');
            expect(StringHelper.capitalizeFirstLetter('ALUMINIUM')).to.equal('Aluminium');
            expect(StringHelper.capitalizeFirstLetter('pLASTIC')).to.equal('Plastic');
        });

        it('handles single character', () => {
            expect(StringHelper.capitalizeFirstLetter('a')).to.equal('A');
            expect(StringHelper.capitalizeFirstLetter('Z')).to.equal('Z');
        });

        it('returns empty string for falsy input', () => {
            expect(StringHelper.capitalizeFirstLetter('')).to.equal('');
            expect(StringHelper.capitalizeFirstLetter(null as any)).to.equal('');
            expect(StringHelper.capitalizeFirstLetter(undefined as any)).to.equal('');
        });
    });

    describe('snakeCaseToTitleCase', () => {
        it('converts snake_case to Title Case', () => {
            expect(StringHelper.snakeCaseToTitleCase('material_type')).to.equal('Material Type');
            expect(StringHelper.snakeCaseToTitleCase('acme_recycling_ltd')).to.equal('Acme Recycling Ltd');
            expect(StringHelper.snakeCaseToTitleCase('corrugated_board')).to.equal('Corrugated Board');
        });

        it('handles single word', () => {
            expect(StringHelper.snakeCaseToTitleCase('plastic')).to.equal('Plastic');
        });

        it('handles multiple underscores', () => {
            expect(StringHelper.snakeCaseToTitleCase('mixed_white_heavily_printed')).to.equal(
                'Mixed White Heavily Printed',
            );
        });

        it('returns empty string for falsy input', () => {
            expect(StringHelper.snakeCaseToTitleCase('')).to.equal('');
            expect(StringHelper.snakeCaseToTitleCase(null as any)).to.equal('');
        });
    });
});
