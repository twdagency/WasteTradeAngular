import { expect } from '@loopback/testlab';
import { checkValidMaterial, checkValidContainerType, checkValidAreaCovered } from '../../utils/check-valid';
import { MaterialEnum, ContainerType, AreaCovered } from '../../enum';

describe('check-valid utils (unit)', () => {
    describe('checkValidMaterial', () => {
        it('returns true for valid material values', () => {
            expect(checkValidMaterial([MaterialEnum.LDPE, MaterialEnum.PET, MaterialEnum.HDPE])).to.be.true();
        });

        it('returns true for single valid material', () => {
            expect(checkValidMaterial([MaterialEnum.PP])).to.be.true();
        });

        it('returns false for invalid material string', () => {
            expect(checkValidMaterial(['polystyrene_foam'])).to.be.false();
        });

        it('returns false for mixed valid and invalid', () => {
            expect(checkValidMaterial([MaterialEnum.PET, 'not_a_material'])).to.be.false();
        });

        it('returns true for empty array', () => {
            expect(checkValidMaterial([])).to.be.true();
        });

        it('returns false for non-array input', () => {
            expect(checkValidMaterial(null as any)).to.be.false();
            expect(checkValidMaterial('ldpe' as any)).to.be.false();
        });
    });

    describe('checkValidContainerType', () => {
        it('returns true for valid container types', () => {
            expect(checkValidContainerType([ContainerType.CURTAIN_SIDER])).to.be.true();
        });

        it('returns true for multiple valid container types', () => {
            expect(checkValidContainerType([ContainerType.CURTAIN_SIDER, ContainerType.CONTAINERS])).to.be.true();
        });

        it('returns false for invalid container type string', () => {
            expect(checkValidContainerType(['flatbed_truck'])).to.be.false();
        });

        it('returns false for mixed valid and invalid', () => {
            expect(checkValidContainerType([ContainerType.CURTAIN_SIDER, 'invalid_type'])).to.be.false();
        });

        it('returns true for empty array', () => {
            expect(checkValidContainerType([])).to.be.true();
        });

        it('returns false for non-array input', () => {
            expect(checkValidContainerType(null as any)).to.be.false();
        });
    });

    describe('checkValidAreaCovered', () => {
        it('returns true for valid area values', () => {
            expect(checkValidAreaCovered([AreaCovered.UK_ONLY])).to.be.true();
            expect(checkValidAreaCovered([AreaCovered.WORLDWIDE])).to.be.true();
        });

        it('returns false for invalid area string', () => {
            expect(checkValidAreaCovered(['south_america'])).to.be.false();
        });

        it('returns false for mixed valid and invalid', () => {
            expect(checkValidAreaCovered([AreaCovered.UK_ONLY, 'moon_base'])).to.be.false();
        });

        it('returns true for empty array', () => {
            expect(checkValidAreaCovered([])).to.be.true();
        });

        it('returns false for null/undefined input', () => {
            expect(checkValidAreaCovered(null as any)).to.be.false();
            expect(checkValidAreaCovered(undefined as any)).to.be.false();
        });
    });
});
