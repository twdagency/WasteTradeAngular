import { expect } from '@loopback/testlab';
import {
    mapLeadSource,
    mapWasteTradePublicationStatus,
    mapMaterialPicklist,
    mapPackagingTypePicklist,
    mapStorageTypePicklist,
    mapCountryCodeToFullName,
    mapTrailerType,
    mapContainerType,
    mapTrailerOrContainer,
    mapDemurrage,
} from '../../utils/salesforce/salesforce-mapping.utils';

describe('salesforce-mapping-utils (unit)', () => {
    // ─── mapLeadSource ─────────────────────────────────────────────────────────
    describe('mapLeadSource', () => {
        it('undefined returns Website', () => {
            expect(mapLeadSource(undefined)).to.equal('Website');
        });

        it('direct enum value Advertisement', () => {
            expect(mapLeadSource('Advertisement')).to.equal('Advertisement');
        });

        it('legacy snake_case google_search → Google AdWords', () => {
            expect(mapLeadSource('google_search')).to.equal('Google AdWords');
        });

        it('legacy trade show values map to Trade Show', () => {
            expect(mapLeadSource('prse_trade_show')).to.equal('Trade Show');
            expect(mapLeadSource('k_show')).to.equal('Trade Show');
            expect(mapLeadSource('interpack')).to.equal('Trade Show');
        });

        it('word_of_mouth → External Referral', () => {
            expect(mapLeadSource('word_of_mouth')).to.equal('External Referral');
        });

        it('lowercase website → Website', () => {
            expect(mapLeadSource('website')).to.equal('Website');
        });

        it('unknown value falls back to Other', () => {
            expect(mapLeadSource('completely_unknown_source_xyz')).to.equal('Other');
        });

        it('Trade Show direct value', () => {
            expect(mapLeadSource('Trade Show')).to.equal('Trade Show');
        });
    });

// ─── mapWasteTradePublicationStatus ────────────────────────────────────────
    describe('mapWasteTradePublicationStatus', () => {
        it('available → Published', () => {
            expect(mapWasteTradePublicationStatus('available')).to.equal('Published');
        });

        it('pending → Draft', () => {
            expect(mapWasteTradePublicationStatus('pending')).to.equal('Draft');
        });

        it('rejected → Archived', () => {
            expect(mapWasteTradePublicationStatus('rejected')).to.equal('Archived');
        });

        it('expired → Archived', () => {
            expect(mapWasteTradePublicationStatus('expired')).to.equal('Archived');
        });

        it('undefined → Draft', () => {
            expect(mapWasteTradePublicationStatus(undefined)).to.equal('Draft');
        });
    });

    // ─── mapMaterialPicklist ───────────────────────────────────────────────────
    describe('mapMaterialPicklist', () => {
        it('undefined returns undefined', () => {
            expect(mapMaterialPicklist(undefined)).to.be.undefined();
        });

        it('hdpe → HDPE', () => {
            expect(mapMaterialPicklist('hdpe')).to.equal('HDPE');
        });

        it('HDPE (uppercase) → HDPE', () => {
            expect(mapMaterialPicklist('HDPE')).to.equal('HDPE');
        });

        it('polyethylene → PE', () => {
            expect(mapMaterialPicklist('polyethylene')).to.equal('PE');
        });

        it('mixed → OTHER (MIX)', () => {
            expect(mapMaterialPicklist('mixed')).to.equal('OTHER (MIX)');
        });

        it('unknown value defaults to Plastic', () => {
            expect(mapMaterialPicklist('some_rare_polymer')).to.equal('Plastic');
        });
    });

    // ─── mapPackagingTypePicklist ──────────────────────────────────────────────
    describe('mapPackagingTypePicklist', () => {
        it('undefined returns undefined', () => {
            expect(mapPackagingTypePicklist(undefined)).to.be.undefined();
        });

        it('bales → Bales', () => {
            expect(mapPackagingTypePicklist('bales')).to.equal('Bales');
        });

        it('singular bale → Bales', () => {
            expect(mapPackagingTypePicklist('bale')).to.equal('Bales');
        });

        it('pellets → Granules', () => {
            expect(mapPackagingTypePicklist('pellets')).to.equal('Granules');
        });

        it('flakes → Loose', () => {
            expect(mapPackagingTypePicklist('flakes')).to.equal('Loose');
        });

        it('unknown defaults to Loose', () => {
            expect(mapPackagingTypePicklist('some_packaging')).to.equal('Loose');
        });
    });

    // ─── mapStorageTypePicklist ────────────────────────────────────────────────
    describe('mapStorageTypePicklist', () => {
        it('undefined returns undefined', () => {
            expect(mapStorageTypePicklist(undefined)).to.be.undefined();
        });

        it('indoors → Indoors', () => {
            expect(mapStorageTypePicklist('indoors')).to.equal('Indoors');
        });

        it('outdoors → Outdoors', () => {
            expect(mapStorageTypePicklist('outdoors')).to.equal('Outdoors');
        });

        it('warehouse → Indoors', () => {
            expect(mapStorageTypePicklist('warehouse')).to.equal('Indoors');
        });

        it('unknown defaults to Indoors', () => {
            expect(mapStorageTypePicklist('unknown_storage')).to.equal('Indoors');
        });
    });

// ─── mapCountryCodeToFullName ──────────────────────────────────────────────
    describe('mapCountryCodeToFullName', () => {
        it('UK → United Kingdom', () => {
            expect(mapCountryCodeToFullName('UK')).to.equal('United Kingdom');
        });

        it('GB → United Kingdom', () => {
            expect(mapCountryCodeToFullName('GB')).to.equal('United Kingdom');
        });

        it('US → United States', () => {
            expect(mapCountryCodeToFullName('US')).to.equal('United States');
        });

        it('DE → Germany', () => {
            expect(mapCountryCodeToFullName('DE')).to.equal('Germany');
        });

        it('lowercase uk → United Kingdom (case-insensitive via toUpperCase)', () => {
            expect(mapCountryCodeToFullName('uk')).to.equal('United Kingdom');
        });

        it('unknown code returned as-is', () => {
            expect(mapCountryCodeToFullName('XY')).to.equal('XY');
        });
    });

    // ─── mapTrailerType ────────────────────────────────────────────────────────
    describe('mapTrailerType', () => {
        it('undefined returns undefined', () => {
            expect(mapTrailerType(undefined)).to.be.undefined();
        });

        it('direct SF value Curtain Sider passes through', () => {
            expect(mapTrailerType('Curtain Sider')).to.equal('Curtain Sider');
        });

        it('direct SF value Walking Floor passes through', () => {
            expect(mapTrailerType('Walking Floor')).to.equal('Walking Floor');
        });

        it('direct SF value Tipper Trucks passes through', () => {
            expect(mapTrailerType('Tipper Trucks')).to.equal('Tipper Trucks');
        });

        it('direct SF value Containers passes through', () => {
            expect(mapTrailerType('Containers')).to.equal('Containers');
        });

        it('legacy curtain_slider_standard → Curtain Sider', () => {
            expect(mapTrailerType('curtain_slider_standard')).to.equal('Curtain Sider');
        });

        it('legacy curtain_slider_high_cube → Curtain Sider', () => {
            expect(mapTrailerType('curtain_slider_high_cube')).to.equal('Curtain Sider');
        });

        it('legacy walking_floor → Walking Floor', () => {
            expect(mapTrailerType('walking_floor')).to.equal('Walking Floor');
        });

        it('legacy tipper → Tipper Trucks', () => {
            expect(mapTrailerType('tipper')).to.equal('Tipper Trucks');
        });

        it('legacy tipper_trucks → Tipper Trucks', () => {
            expect(mapTrailerType('tipper_trucks')).to.equal('Tipper Trucks');
        });

        it('unknown type returns undefined', () => {
            expect(mapTrailerType('flatbed_xyz')).to.be.undefined();
        });
    });

    // ─── mapContainerType ──────────────────────────────────────────────────────
    describe('mapContainerType', () => {
        it('always returns undefined (WT does not use containers)', () => {
            expect(mapContainerType('20ft')).to.be.undefined();
            expect(mapContainerType(undefined)).to.be.undefined();
            expect(mapContainerType("40' Container - High Cube")).to.be.undefined();
        });
    });

    // ─── mapTrailerOrContainer ─────────────────────────────────────────────────
    describe('mapTrailerOrContainer', () => {
        it('always returns Trailer regardless of input', () => {
            expect(mapTrailerOrContainer('Container')).to.equal('Trailer');
            expect(mapTrailerOrContainer(undefined)).to.equal('Trailer');
            expect(mapTrailerOrContainer('Trailer')).to.equal('Trailer');
        });
    });

    // ─── mapDemurrage ──────────────────────────────────────────────────────────
    describe('mapDemurrage', () => {
        it('undefined returns undefined', () => {
            expect(mapDemurrage(undefined)).to.be.undefined();
        });

        it('0 returns "0"', () => {
            expect(mapDemurrage(0)).to.equal('0');
        });

        it('15 returns "15"', () => {
            expect(mapDemurrage(15)).to.equal('15');
        });

        it('clamps at 31', () => {
            expect(mapDemurrage(50)).to.equal('31');
        });

        it('clamps at 0 for negative values', () => {
            expect(mapDemurrage(-5)).to.equal('0');
        });
    });

});
