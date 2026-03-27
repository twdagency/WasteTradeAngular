import { expect, sinon } from '@loopback/testlab';
import { AuditTrailService } from '../../services/audit-trail.service';
import { AuditTrailSiteTypeEnum, AuditTrailUserRoleEnum, UserRoleEnum } from '../../enum';
import { MyUserProfile } from '../../authentication-strategies/type';

function makeRequest(overrides: Partial<any> = {}): any {
    return {
        path: '/listings/123',
        method: 'GET',
        headers: { 'user-agent': 'test-agent', 'x-forwarded-for': '1.2.3.4' },
        body: { title: 'test' },
        connection: {},
        socket: {},
        ...overrides,
    };
}

function makeUserProfile(overrides: Partial<MyUserProfile> = {}): MyUserProfile {
    return {
        id: 1,
        email: 'user@test.com',
        firstName: 'Jane',
        lastName: 'Doe',
        username: 'janedoe',
        name: 'Jane Doe',
        companyName: 'ACME',
        globalRole: UserRoleEnum.USER,
        companyRole: undefined as any,
        isHaulier: false,
        isBuyer: true,
        isSeller: true,
        companyId: 10,
        createdAt: new Date(),
        ...overrides,
    } as any;
}

describe('AuditTrailService (unit)', () => {
    let auditTrailRepository: any;
    let service: AuditTrailService;

    beforeEach(() => {
        auditTrailRepository = {
            create: sinon.stub().resolves({ id: 1 }),
            execute: sinon.stub().resolves([]),
            dataSource: { execute: sinon.stub() },
        };
        service = new AuditTrailService(auditTrailRepository);
    });

    it('createAuditTrailFromRequest sets correct siteType and role for SUPER_ADMIN', async () => {
        const req = makeRequest({ path: '/auth/login', method: 'POST' });
        const profile = makeUserProfile({ globalRole: UserRoleEnum.SUPER_ADMIN });

        await service.createAuditTrailFromRequest(req, profile, 200);

        const createArg = auditTrailRepository.create.firstCall.args[0];
        expect(createArg.loggedUserRole).to.equal(AuditTrailUserRoleEnum.SUPER_ADMIN);
        expect(createArg.siteType).to.equal(AuditTrailSiteTypeEnum.WASTE_TRADE);
        expect(createArg.method).to.equal('POST');
        expect(createArg.responseStatus).to.equal(200);
    });

    it('createAuditTrailFromRequest sets correct role for ADMIN', async () => {
        const req = makeRequest({ path: '/users', method: 'GET' });
        const profile = makeUserProfile({ globalRole: UserRoleEnum.ADMIN });

        await service.createAuditTrailFromRequest(req, profile);

        const createArg = auditTrailRepository.create.firstCall.args[0];
        expect(createArg.loggedUserRole).to.equal(AuditTrailUserRoleEnum.ADMIN);
        expect(createArg.siteType).to.equal(AuditTrailSiteTypeEnum.WASTE_TRADE);
    });

    it('createAuditTrailFromRequest sets Haulier role when isHaulier=true', async () => {
        const req = makeRequest({ path: '/companies', method: 'GET' });
        const profile = makeUserProfile({ isHaulier: true, isBuyer: false, isSeller: false });

        await service.createAuditTrailFromRequest(req, profile);

        const createArg = auditTrailRepository.create.firstCall.args[0];
        expect(createArg.loggedUserRole).to.equal(AuditTrailUserRoleEnum.HAULIER);
        expect(createArg.siteType).to.equal(AuditTrailSiteTypeEnum.HAULIER);
    });

    it('createAuditTrailFromRequest sets Seller siteType=TRADER when only seller', async () => {
        const req = makeRequest({ path: '/listings', method: 'POST' });
        const profile = makeUserProfile({ isHaulier: false, isBuyer: false, isSeller: true });

        await service.createAuditTrailFromRequest(req, profile);

        const createArg = auditTrailRepository.create.firstCall.args[0];
        expect(createArg.loggedUserRole).to.equal(AuditTrailUserRoleEnum.SELLER);
        expect(createArg.siteType).to.equal(AuditTrailSiteTypeEnum.TRADER);
    });

    it('createAuditTrailFromRequest strips sensitive fields from requestBody', async () => {
        const req = makeRequest({
            path: '/auth',
            method: 'POST',
            body: { email: 'a@b.com', password: 'secret123', passwordHash: 'hash' },
        });
        const profile = makeUserProfile({ globalRole: UserRoleEnum.ADMIN });

        await service.createAuditTrailFromRequest(req, profile);

        const createArg = auditTrailRepository.create.firstCall.args[0];
        expect(createArg.requestBody).to.containEql({ email: 'a@b.com' });
        expect((createArg.requestBody as any).password).to.equal('[REDACTED]');
        expect((createArg.requestBody as any).passwordHash).to.equal('[REDACTED]');
    });

    it('createAuditTrailFromRequest extracts IP from x-forwarded-for header', async () => {
        const req = makeRequest({ headers: { 'x-forwarded-for': '10.0.0.1', 'user-agent': 'ua' } });
        const profile = makeUserProfile({ globalRole: UserRoleEnum.ADMIN });

        await service.createAuditTrailFromRequest(req, profile);

        const createArg = auditTrailRepository.create.firstCall.args[0];
        expect(createArg.ipAddress).to.equal('10.0.0.1');
    });

    it('convertToCsv returns no-data message for empty array', () => {
        const result = service.convertToCsv([]);
        expect(result).to.equal('No audit trails found');
    });
});
