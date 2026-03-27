/**
 * account-status.service-2.unit.ts
 * Additional coverage for AccountStatusService:
 * document-expiry banner, parseDocumentDate paths,
 * getDocumentDisplayName variants, vatNumber-missing step,
 * ACTIVE company with expiring doc.
 */
import { expect, sinon } from '@loopback/testlab';
import { AccountStatusService } from '../../services/account-status.service';
import { CompanyStatus } from '../../enum';

function makeService({
    company = { id: 1, status: CompanyStatus.ACTIVE, vatNumber: 'GB123', isHaulier: false },
    docs = [] as any[],
    locations = [{ id: 1 }] as any[],
    companyUserFound = true,
} = {}) {
    const companyUsersRepo = {
        findOne: sinon.stub().resolves(companyUserFound ? { company } : null),
    } as any;
    const companiesRepo = {
        findById: sinon.stub().resolves(company),
        find: sinon.stub().resolves([]),
    } as any;
    const docsRepo = { find: sinon.stub().resolves(docs) } as any;
    const locationsRepo = { find: sinon.stub().resolves(locations) } as any;
    const userRepo = { findById: sinon.stub().resolves(null) } as any;
    return new AccountStatusService(userRepo, companiesRepo, companyUsersRepo, docsRepo, locationsRepo);
}

/** Returns a date-string N days from now in DD/MM/YYYY format */
function daysFromNow(n: number): string {
    const d = new Date();
    d.setDate(d.getDate() + n);
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    return `${dd}/${mm}/${d.getFullYear()}`;
}

/** Returns ISO date string N days from now */
function isoFromNow(n: number): string {
    const d = new Date();
    d.setDate(d.getDate() + n);
    return d.toISOString();
}

describe('AccountStatusService - Part 2 (unit)', () => {
    describe('document_expiring banner', () => {
        it('shows document_expiring when ACTIVE company has doc expiring in 15 days', async () => {
            const service = makeService({
                company: { id: 1, status: CompanyStatus.ACTIVE, vatNumber: 'GB123', isHaulier: false },
                docs: [{ id: 1, expiryDate: daysFromNow(15), documentType: 'ENVIRONMENTAL_PERMIT', documentName: 'Env Permit' }],
                locations: [{ id: 1 }],
            });

            const result = await service.getAccountStatus(1);

            expect(result.showBanner).to.be.true();
            expect(result.bannerType).to.equal('document_expiring');
            expect(result.documentDetails).to.not.be.undefined();
            expect(result.documentDetails!.daysRemaining).to.be.greaterThan(0);
        });

        it('shows document_expiring with WASTE_EXEMPTION display name', async () => {
            const service = makeService({
                company: { id: 1, status: CompanyStatus.ACTIVE, vatNumber: 'GB123', isHaulier: false },
                docs: [{ id: 2, expiryDate: daysFromNow(5), documentType: 'WASTE_EXEMPTION', documentName: 'Waste Exemption Doc' }],
                locations: [{ id: 1 }],
            });

            const result = await service.getAccountStatus(1);

            expect(result.bannerType).to.equal('document_expiring');
            expect(result.documentDetails!.name).to.equal('Waste Exemption');
        });

        it('shows document_expiring with WASTE_CARRIER_LICENSE display name', async () => {
            const service = makeService({
                company: { id: 1, status: CompanyStatus.ACTIVE, vatNumber: 'GB123', isHaulier: false },
                docs: [{ id: 3, expiryDate: daysFromNow(10), documentType: 'WASTE_CARRIER_LICENSE', documentName: 'Carrier Lic' }],
                locations: [{ id: 1 }],
            });

            const result = await service.getAccountStatus(1);

            expect(result.bannerType).to.equal('document_expiring');
            expect(result.documentDetails!.name).to.equal('Waste Carrier License');
        });

        it('uses documentName for "other" documentType', async () => {
            const service = makeService({
                company: { id: 1, status: CompanyStatus.ACTIVE, vatNumber: 'GB123', isHaulier: false },
                docs: [{ id: 4, expiryDate: daysFromNow(7), documentType: 'other', documentName: 'Custom Doc Name' }],
                locations: [{ id: 1 }],
            });

            const result = await service.getAccountStatus(1);

            expect(result.bannerType).to.equal('document_expiring');
            expect(result.documentDetails!.name).to.equal('Custom Doc Name');
        });

        it('does NOT show expiry banner when doc expires in 60 days (outside 30-day window)', async () => {
            const service = makeService({
                company: { id: 1, status: CompanyStatus.ACTIVE, vatNumber: 'GB123', isHaulier: false },
                docs: [{ id: 5, expiryDate: daysFromNow(60), documentType: 'ENVIRONMENTAL_PERMIT', documentName: 'EP' }],
                locations: [{ id: 1 }],
            });

            const result = await service.getAccountStatus(1);

            expect(result.showBanner).to.be.false();
        });

        it('does NOT show expiry banner when doc is already expired', async () => {
            const service = makeService({
                company: { id: 1, status: CompanyStatus.ACTIVE, vatNumber: 'GB123', isHaulier: false },
                docs: [{ id: 6, expiryDate: daysFromNow(-5), documentType: 'ENVIRONMENTAL_PERMIT', documentName: 'EP' }],
                locations: [{ id: 1 }],
            });

            const result = await service.getAccountStatus(1);

            // expired doc is not in the warning window
            expect(result.bannerType).to.not.equal('document_expiring');
        });
    });

    describe('parseDocumentDate() — via checkDocumentExpiry', () => {
        it('handles ISO date format (fallback path)', async () => {
            const service = makeService({
                company: { id: 1, status: CompanyStatus.ACTIVE, vatNumber: 'GB123', isHaulier: false },
                docs: [{ id: 7, expiryDate: isoFromNow(20), documentType: 'ENVIRONMENTAL_PERMIT', documentName: 'EP' }],
                locations: [{ id: 1 }],
            });

            const result = await service.getAccountStatus(1);

            expect(result.bannerType).to.equal('document_expiring');
        });

        it('ignores document with no expiryDate', async () => {
            const service = makeService({
                company: { id: 1, status: CompanyStatus.ACTIVE, vatNumber: 'GB123', isHaulier: false },
                docs: [{ id: 8, expiryDate: null, documentType: 'ENVIRONMENTAL_PERMIT', documentName: 'EP' }],
                locations: [{ id: 1 }],
            });

            const result = await service.getAccountStatus(1);

            expect(result.showBanner).to.be.false();
        });
    });

    describe('incomplete_onboarding — missing vatNumber', () => {
        it('shows incomplete_onboarding when vatNumber is missing', async () => {
            const service = makeService({
                company: { id: 1, status: CompanyStatus.PENDING, vatNumber: '', isHaulier: false },
                docs: [{ id: 1 }],
                locations: [{ id: 1 }],
            });

            const result = await service.getAccountStatus(1);

            expect(result.showBanner).to.be.true();
            expect(result.bannerType).to.equal('incomplete_onboarding');
        });

        it('shows incomplete_onboarding when both docs and locations missing', async () => {
            const service = makeService({
                company: { id: 1, status: CompanyStatus.PENDING, vatNumber: 'GB123', isHaulier: false },
                docs: [],
                locations: [],
            });

            const result = await service.getAccountStatus(1);

            expect(result.showBanner).to.be.true();
            expect(result.bannerType).to.equal('incomplete_onboarding');
        });
    });
});
