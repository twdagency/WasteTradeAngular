import { expect } from '@loopback/testlab';
import { CompanyStatus } from '../../enum';
import { AccountStatusService } from '../../services/account-status.service';

describe('AccountStatusService (unit)', () => {
    const companyBase = {
        id: 42,
        status: CompanyStatus.ACTIVE,
        vatNumber: 'GB123',
        isHaulier: false,
    };

    function makeService(overrides: {
        company?: Partial<typeof companyBase & { adminMessage?: string }>;
        documents?: object[];
        locations?: object[];
        companyUser?: { company: typeof companyBase } | null;
    } = {}) {
        const company = { ...companyBase, ...overrides.company };
        const companyUser =
            overrides.companyUser === null
                ? null
                : { company: overrides.companyUser?.company ?? company };

        const companyUsersRepository = { findOne: async () => companyUser };
        const companiesRepository = { findById: async () => company };
        const companyDocumentsRepository = { find: async () => overrides.documents ?? [] };
        const companyLocationsRepository = { find: async () => overrides.locations ?? [{ id: 1 }] };

        return new AccountStatusService(
            {} as any,
            companiesRepository as any,
            companyUsersRepository as any,
            companyDocumentsRepository as any,
            companyLocationsRepository as any,
        );
    }

    it('returns missing_documents when only company_documents step is missing (ACTIVE)', async () => {
        const svc = makeService({ documents: [] });
        const r = await svc.getAccountStatus(1);
        expect(r.showBanner).to.equal(true);
        expect(r.bannerType).to.equal('missing_documents');
        expect(r.message).to.containEql('documents');
    });

    it('returns missing_documents before verification_pending when company is PENDING', async () => {
        const svc = makeService({
            company: { status: CompanyStatus.PENDING },
            documents: [],
        });
        const r = await svc.getAccountStatus(1);
        expect(r.bannerType).to.equal('missing_documents');
    });

    it('returns incomplete_onboarding when multiple onboarding steps are missing (non-ACTIVE)', async () => {
        const svc = makeService({
            company: { status: CompanyStatus.PENDING, vatNumber: '' },
            documents: [],
            locations: [{ id: 1 }],
        });
        const r = await svc.getAccountStatus(1);
        expect(r.bannerType).to.equal('incomplete_onboarding');
    });

    it('returns no banner when company has documents and locations', async () => {
        const svc = makeService({
            documents: [{ id: 1, companyId: 42, expiryDate: undefined }],
        });
        const r = await svc.getAccountStatus(1);
        expect(r.showBanner).to.equal(false);
    });

    it('returns no company message when user has no company', async () => {
        const svc = makeService({ companyUser: null });
        const r = await svc.getAccountStatus(1);
        expect(r.showBanner).to.equal(false);
        expect(r.message).to.equal('No company associated with user');
    });
});
