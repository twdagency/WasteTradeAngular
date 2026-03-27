import { expect, sinon } from '@loopback/testlab';
import { AuditTrailService } from '../../services/audit-trail.service';
import { AuditTrail } from '../../models';
import { AuditTrailSiteTypeEnum, AuditTrailUserRoleEnum, UserRoleEnum } from '../../enum';
import { MyUserProfile } from '../../authentication-strategies/type';

function makeProfile(overrides: Partial<MyUserProfile> = {}): MyUserProfile {
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
        isSeller: false,
        companyId: 10,
        createdAt: new Date(),
        ...overrides,
    } as any;
}

function makeRequest(overrides: Partial<any> = {}): any {
    return {
        path: '/listings/1',
        method: 'GET',
        headers: { 'user-agent': 'jest', 'x-forwarded-for': '127.0.0.1' },
        body: {},
        connection: {},
        socket: {},
        ...overrides,
    };
}

function buildService(): { service: AuditTrailService; repo: any } {
    const repo: any = {
        create: sinon.stub().resolves({ id: 1 }),
        execute: sinon.stub().resolves([]),
        dataSource: { execute: sinon.stub() },
    };
    return { service: new AuditTrailService(repo), repo };
}

describe('AuditTrailService deeper coverage (unit)', () => {
    describe('createAuditTrail()', () => {
        it('delegates directly to repository.create', async () => {
            const { service, repo } = buildService();
            const data: any = { userId: 1, type: 'Auth', action: '/auth/login', method: 'POST' };
            await service.createAuditTrail(data);
            expect(repo.create.calledOnceWith(data)).to.be.true();
        });
    });

    describe('createAuditTrailFromRequest() — role/siteType mapping', () => {
        it('maps SALES_ADMIN to default (empty loggedUserRole)', async () => {
            const { service, repo } = buildService();
            const req = makeRequest({ path: '/users', method: 'GET' });
            const profile = makeProfile({ globalRole: UserRoleEnum.SALES_ADMIN });

            await service.createAuditTrailFromRequest(req, profile, 200);

            const arg = repo.create.firstCall.args[0];
            expect(arg.loggedUserRole).to.equal('');
            expect(arg.siteType).to.equal('');
        });

        it('sets BUYER role and TRADER siteType when isBuyer=true, isSeller=false', async () => {
            const { service, repo } = buildService();
            const req = makeRequest({ path: '/offers', method: 'POST' });
            const profile = makeProfile({ isBuyer: true, isSeller: false, isHaulier: false });

            await service.createAuditTrailFromRequest(req, profile);

            const arg = repo.create.firstCall.args[0];
            expect(arg.loggedUserRole).to.equal(AuditTrailUserRoleEnum.BUYER);
            expect(arg.siteType).to.equal(AuditTrailSiteTypeEnum.TRADER);
        });

        it('sets BUYER role when both isBuyer and isSeller are true', async () => {
            const { service, repo } = buildService();
            const req = makeRequest({ path: '/offers', method: 'POST' });
            const profile = makeProfile({ isBuyer: true, isSeller: true, isHaulier: false });

            await service.createAuditTrailFromRequest(req, profile);

            const arg = repo.create.firstCall.args[0];
            expect(arg.loggedUserRole).to.equal(AuditTrailUserRoleEnum.BUYER);
            expect(arg.siteType).to.equal(AuditTrailSiteTypeEnum.TRADER);
        });

        it('stores userId and companyId from profile', async () => {
            const { service, repo } = buildService();
            const profile = makeProfile({ id: 42, companyId: 99 });

            await service.createAuditTrailFromRequest(makeRequest(), profile);

            const arg = repo.create.firstCall.args[0];
            expect(arg.userId).to.equal(42);
            expect(arg.companyId).to.equal(99);
        });

        it('stores username, loggedUserName, loggedCompanyName from profile', async () => {
            const { service, repo } = buildService();
            const profile = makeProfile({ username: 'jdoe', name: 'Jane Doe', companyName: 'ACME Ltd' });

            await service.createAuditTrailFromRequest(makeRequest(), profile);

            const arg = repo.create.firstCall.args[0];
            expect(arg.username).to.equal('jdoe');
            expect(arg.loggedUserName).to.equal('Jane Doe');
            expect(arg.loggedCompanyName).to.equal('ACME Ltd');
        });

        it('extracts IP from x-real-ip when x-forwarded-for is absent', async () => {
            const { service, repo } = buildService();
            const req = makeRequest({ headers: { 'x-real-ip': '192.168.1.1', 'user-agent': 'ua' } });

            await service.createAuditTrailFromRequest(req, makeProfile({ globalRole: UserRoleEnum.ADMIN }));

            const arg = repo.create.firstCall.args[0];
            expect(arg.ipAddress).to.equal('192.168.1.1');
        });

        it('redacts token and apiKey sensitive fields', async () => {
            const { service, repo } = buildService();
            const req = makeRequest({
                body: { name: 'test', token: 'abc123', apiKey: 'key-xyz', data: { refreshToken: 'rt' } },
            });

            await service.createAuditTrailFromRequest(req, makeProfile({ globalRole: UserRoleEnum.ADMIN }));

            const arg = repo.create.firstCall.args[0];
            expect((arg.requestBody as any).token).to.equal('[REDACTED]');
            expect((arg.requestBody as any).apiKey).to.equal('[REDACTED]');
            expect((arg.requestBody as any).data.refreshToken).to.equal('[REDACTED]');
            expect((arg.requestBody as any).name).to.equal('test');
        });

        it('returns undefined requestBody when body is empty', async () => {
            const { service, repo } = buildService();
            const req = makeRequest({ body: null });

            await service.createAuditTrailFromRequest(req, makeProfile({ globalRole: UserRoleEnum.ADMIN }));

            const arg = repo.create.firstCall.args[0];
            expect(arg.requestBody).to.be.undefined();
        });

        it('maps /auth path to Authentication type', async () => {
            const { service, repo } = buildService();
            const req = makeRequest({ path: '/auth/login' });

            await service.createAuditTrailFromRequest(req, makeProfile({ globalRole: UserRoleEnum.ADMIN }));

            const arg = repo.create.firstCall.args[0];
            expect(arg.type).to.equal('Authentication');
        });

        it('maps /companies path to Company Management type', async () => {
            const { service, repo } = buildService();
            const req = makeRequest({ path: '/companies/5' });

            await service.createAuditTrailFromRequest(req, makeProfile({ globalRole: UserRoleEnum.ADMIN }));

            const arg = repo.create.firstCall.args[0];
            expect(arg.type).to.equal('Company Management');
        });

        it('maps unknown path to Other type', async () => {
            const { service, repo } = buildService();
            const req = makeRequest({ path: '/unknown-resource/123' });

            await service.createAuditTrailFromRequest(req, makeProfile({ globalRole: UserRoleEnum.ADMIN }));

            const arg = repo.create.firstCall.args[0];
            expect(arg.type).to.equal('Other');
        });

        it('strips query string from path before type mapping', async () => {
            const { service, repo } = buildService();
            const req = makeRequest({ path: '/listings?status=active' });

            await service.createAuditTrailFromRequest(req, makeProfile({ globalRole: UserRoleEnum.ADMIN }));

            const arg = repo.create.firstCall.args[0];
            expect(arg.type).to.equal('Listing Management');
        });
    });

    describe('convertToCsv()', () => {
        it('returns header + data row for single audit trail', () => {
            const { service } = buildService();
            const trail = new AuditTrail();
            trail.createdAt = new Date('2025-06-01T10:00:00Z');
            trail.loggedUserName = 'Jane Doe';
            trail.siteType = 'Trader';
            trail.loggedCompanyName = 'ACME';
            trail.loggedUserRole = 'buyer';
            trail.type = 'Listing Management';
            trail.action = '/listings/1';

            const csv = service.convertToCsv([trail]);

            expect(csv).to.match(/Timestamp/);
            expect(csv).to.match(/Jane Doe/);
            expect(csv).to.match(/ACME/);
            expect(csv).to.match(/buyer/);
        });

        it('wraps fields containing commas in double quotes', () => {
            const { service } = buildService();
            const trail = new AuditTrail();
            trail.createdAt = new Date('2025-06-01T10:00:00Z');
            trail.loggedUserName = 'Smith, John';
            trail.siteType = 'Trader';
            trail.loggedCompanyName = 'ACME, Ltd';
            trail.loggedUserRole = 'buyer';
            trail.type = 'Listing Management';
            trail.action = '/listings/1';

            const csv = service.convertToCsv([trail]);

            expect(csv).to.match(/"Smith, John"/);
            expect(csv).to.match(/"ACME, Ltd"/);
        });

        it('includes correct number of rows (header + data)', () => {
            const { service } = buildService();
            const makeTrail = (name: string) => {
                const t = new AuditTrail();
                t.createdAt = new Date();
                t.loggedUserName = name;
                t.siteType = 'Trader';
                t.loggedCompanyName = 'Corp';
                t.loggedUserRole = 'buyer';
                t.type = 'Auth';
                t.action = '/auth/login';
                return t;
            };

            const csv = service.convertToCsv([makeTrail('Alice'), makeTrail('Bob')]);
            const lines = csv.split('\n');
            expect(lines).to.have.length(3); // header + 2 data rows
        });
    });
});
