import { expect } from '@loopback/testlab';
import {
    getMaterialDisplayName,
    getMaterialCode,
    isValidMaterialCode,
    getAllMaterialOptions,
} from '../../utils/material-mapping';

describe('material-mapping utils (unit)', () => {
    describe('getMaterialDisplayName', () => {
        it('returns display name for a valid item code', () => {
            expect(getMaterialDisplayName('hdpe', 'item')).to.equal('HDPE');
            expect(getMaterialDisplayName('pet', 'item')).to.equal('PET');
            expect(getMaterialDisplayName('copper', 'item')).to.equal('Copper');
        });

        it('is case-insensitive for input code', () => {
            expect(getMaterialDisplayName('HDPE', 'item')).to.equal('HDPE');
            expect(getMaterialDisplayName('PET', 'item')).to.equal('PET');
        });

        it('returns display name for form type', () => {
            expect(getMaterialDisplayName('bottles', 'form')).to.equal('Bottles');
            expect(getMaterialDisplayName('film', 'form')).to.equal('Film');
        });

        it('returns display name for grading type (plastic)', () => {
            expect(getMaterialDisplayName('a_grade', 'grading')).to.equal('A Grade');
            expect(getMaterialDisplayName('mixed', 'grading')).to.equal('Mixed');
        });

        it('returns display name for grading type (fibre)', () => {
            expect(getMaterialDisplayName('kraft', 'grading')).to.equal('Kraft');
            expect(getMaterialDisplayName('high', 'grading')).to.equal('High');
        });

        it('returns display name for colour type', () => {
            expect(getMaterialDisplayName('black', 'colour')).to.equal('Black');
            expect(getMaterialDisplayName('natural', 'colour')).to.equal('Natural');
        });

        it('returns display name for finishing type', () => {
            expect(getMaterialDisplayName('flakes', 'finishing')).to.equal('Flakes');
            expect(getMaterialDisplayName('regrind', 'finishing')).to.equal('Regrind');
        });

        it('returns display name for packing type', () => {
            expect(getMaterialDisplayName('bales', 'packing')).to.equal('Bales');
            expect(getMaterialDisplayName('bulk_bags', 'packing')).to.equal('Bulk Bags');
        });

        it('returns display name for material type', () => {
            expect(getMaterialDisplayName('plastic', 'type')).to.equal('Plastic');
            expect(getMaterialDisplayName('metal', 'type')).to.equal('Metals');
            expect(getMaterialDisplayName('fibre', 'type')).to.equal('Fibre');
        });

        it('returns original code for unknown item code', () => {
            expect(getMaterialDisplayName('unknown_polymer_xyz', 'item')).to.equal('unknown_polymer_xyz');
        });

        it('returns original code for unknown form', () => {
            expect(getMaterialDisplayName('antigravity_capsule', 'form')).to.equal('antigravity_capsule');
        });
    });

    describe('getMaterialCode', () => {
        it('returns code for a known display name (item)', () => {
            expect(getMaterialCode('HDPE', 'item')).to.equal('hdpe');
            expect(getMaterialCode('Copper', 'item')).to.equal('copper');
        });

        it('is case-insensitive for display name lookup', () => {
            expect(getMaterialCode('hdpe', 'item')).to.equal('hdpe');
            expect(getMaterialCode('PLASTIC', 'type')).to.equal('plastic');
        });

        it('returns code for colour display name', () => {
            expect(getMaterialCode('Black', 'colour')).to.equal('black');
            expect(getMaterialCode('Natural', 'colour')).to.equal('natural');
        });

        it('returns code for finishing display name', () => {
            expect(getMaterialCode('Flakes', 'finishing')).to.equal('flakes');
            expect(getMaterialCode('Regrind', 'finishing')).to.equal('regrind');
        });

        it('returns code for packing display name', () => {
            expect(getMaterialCode('Bales', 'packing')).to.equal('bales');
            expect(getMaterialCode('Bulk Bags', 'packing')).to.equal('bulk_bags');
        });

        it('returns original displayName for unknown display name', () => {
            expect(getMaterialCode('Unobtanium Alloy', 'item')).to.equal('Unobtanium Alloy');
        });
    });

    describe('isValidMaterialCode', () => {
        it('returns true for valid item codes', () => {
            expect(isValidMaterialCode('hdpe', 'item')).to.be.true();
            expect(isValidMaterialCode('pet', 'item')).to.be.true();
            expect(isValidMaterialCode('copper', 'item')).to.be.true();
        });

        it('returns false for invalid item codes', () => {
            expect(isValidMaterialCode('unobtanium', 'item')).to.be.false();
        });

        it('returns true for valid form codes', () => {
            expect(isValidMaterialCode('bottles', 'form')).to.be.true();
            expect(isValidMaterialCode('film', 'form')).to.be.true();
        });

        it('returns false for invalid form codes', () => {
            expect(isValidMaterialCode('antigravity_pod', 'form')).to.be.false();
        });

        it('returns true for valid grading codes (plastic and fibre)', () => {
            expect(isValidMaterialCode('a_grade', 'grading')).to.be.true();
            expect(isValidMaterialCode('kraft', 'grading')).to.be.true();
        });

        it('returns true for valid colour codes', () => {
            expect(isValidMaterialCode('black', 'colour')).to.be.true();
            expect(isValidMaterialCode('WHITE', 'colour')).to.be.true();
        });

        it('returns true for valid finishing codes', () => {
            expect(isValidMaterialCode('flakes', 'finishing')).to.be.true();
        });

        it('returns true for valid packing codes', () => {
            expect(isValidMaterialCode('bales', 'packing')).to.be.true();
            expect(isValidMaterialCode('bulk_bags', 'packing')).to.be.true();
        });

        it('returns true for valid type codes', () => {
            expect(isValidMaterialCode('plastic', 'type')).to.be.true();
            expect(isValidMaterialCode('metal', 'type')).to.be.true();
        });

        it('returns false for invalid type', () => {
            expect(isValidMaterialCode('cardboard', 'type')).to.be.false();
        });

        it('returns false for unknown mapping type', () => {
            expect(isValidMaterialCode('hdpe', 'unknown' as any)).to.be.false();
        });
    });

    describe('getAllMaterialOptions', () => {
        it('returns array of MaterialOption objects for item type', () => {
            const options = getAllMaterialOptions('item');
            expect(options).to.be.Array();
            expect(options.length).to.be.above(0);
            const hdpe = options.find((o) => o.code === 'hdpe');
            expect(hdpe).to.not.be.undefined();
            expect(hdpe!.name).to.equal('HDPE');
        });

        it('returns correct shape for colour type', () => {
            const options = getAllMaterialOptions('colour');
            expect(options.length).to.be.above(0);
            options.forEach((o) => {
                expect(o).to.have.properties(['code', 'name']);
            });
        });

        it('returns combined plastic + fibre options for grading type', () => {
            const options = getAllMaterialOptions('grading');
            const codes = options.map((o) => o.code);
            expect(codes).to.containEql('a_grade');
            expect(codes).to.containEql('kraft');
        });

        it('returns empty array for unknown type', () => {
            const options = getAllMaterialOptions('unknown' as any);
            expect(options).to.deepEqual([]);
        });

        it('returns packing options', () => {
            const options = getAllMaterialOptions('packing');
            const codes = options.map((o) => o.code);
            expect(codes).to.containEql('bales');
            expect(codes).to.containEql('bulk_bags');
        });
    });
});
