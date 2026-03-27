import { expect, sinon } from '@loopback/testlab';
import { AuditTrailService } from '../../services/audit-trail.service';
import { AuditTrail } from '../../models';
import { UserRoleEnum, AuditTrailUserRoleEnum, AuditTrailSiteTypeEnum } from '../../enum';

function buildService(): { service: AuditTrailService; repo: any } {
    const repo: any = {
        create: sinon.stub().resolves({ id: 1 }),
        execute: sinon.stub().resolves([]),
        dataSource: { execute: sinon.stub() },
    };
    return { service: new AuditTrailService(repo), repo };
}

function makeRequest(overrides: Partial<any> = {}): any {
    return {
        path: '/listings/1',
        method: 'GET',
        headers: { 'user-agent': 'test-agent' },
        body: {},
        connection: {},
        socket: {},
        ...overrides,
    };
}

function makeProfile(overrides: Partial<any> = {}): any {
    return {
        id: 1,
        email: 'user@test.com',
        firstName: 'Jane',
        lastName: 'Doe',
        username: 'janedoe',
        name: 'Jane Doe',
        companyName: 'ACME',
        globalRole: UserRoleEnum.USER,
        isHaulier: false,
        isBuyer: true,
        isSeller: false,
        companyId: 10,
        createdAt: new Date(),
        ...overrides,
    };
}

describe('AuditTrailService — Part 3 (unit)', () => {
    describe('getAuditTrails() — filter parameters', () => {
        it('returns paginated audit trails with no filters', async () => {
            const { service, repo } = buildService();
            repo.execute
                .onFirstCall().resolves([
                    { id: 1, type: 'Auth', action: '/auth/login', method: 'POST', logged_user_name: 'Alice', site_type: 'Admin', logged_company_name: 'Corp', logged_user_role: 'admin', created_at: new Date(), updated_at: new Date() },
                ])
                .onSecondCall().resolves([{ total: '1' }]);

            const result = await service.getAuditTrails({ filter: { limit: 10, skip: 0 } });

            expect(result.totalCount).to.equal(1);
            expect(result.results).to.have.length(1);
        });

        it('applies loggedUserName filter in query', async () => {
            const { service, repo } = buildService();
            const capturedParams: any[][] = [];
            repo.execute.callsFake((_sql: string, params: any[]) => {
                capturedParams.push(params);
                return Promise.resolve([{ total: '0' }]);
            });

            await service.getAuditTrails({ filter: { where: { loggedUserName: 'Alice' } as any } });

            expect(capturedParams.some(p => p.some((v: any) => String(v).includes('Alice')))).to.be.true();
        });

        it('applies loggedCompanyName filter in query', async () => {
            const { service, repo } = buildService();
            const capturedParams: any[][] = [];
            repo.execute.callsFake((_sql: string, params: any[]) => {
                capturedParams.push(params);
                return Promise.resolve([{ total: '0' }]);
            });

            await service.getAuditTrails({ filter: { where: { loggedCompanyName: 'ACME' } as any } });

            expect(capturedParams.some(p => p.some((v: any) => String(v).includes('ACME')))).to.be.true();
        });

        it('applies loggedUserRole filter in query', async () => {
            const { service, repo } = buildService();
            const capturedParams: any[][] = [];
            repo.execute.callsFake((_sql: string, params: any[]) => {
                capturedParams.push(params);
                return Promise.resolve([{ total: '0' }]);
            });

            await service.getAuditTrails({ filter: { where: { loggedUserRole: 'admin' } as any } });

            expect(capturedParams.some(p => p.includes('admin'))).to.be.true();
        });

        it('applies method filter (uppercased) in query', async () => {
            const { service, repo } = buildService();
            const capturedParams: any[][] = [];
            repo.execute.callsFake((_sql: string, params: any[]) => {
                capturedParams.push(params);
                return Promise.resolve([{ total: '0' }]);
            });

            await service.getAuditTrails({ filter: { where: { method: 'post' } as any } });

            expect(capturedParams.some(p => p.includes('POST'))).to.be.true();
        });

        it('applies action pattern filter in query', async () => {
            const { service, repo } = buildService();
            const capturedSqls: string[] = [];
            repo.execute.callsFake((sql: string, params: any[]) => {
                capturedSqls.push(String(sql));
                return Promise.resolve([{ total: '0' }]);
            });

            await service.getAuditTrails({ filter: { where: { action: '/listings/{id}' } as any } });

            expect(capturedSqls.some(s => s.includes('action ~'))).to.be.true();
        });

        it('applies startDate and endDate filters in query', async () => {
            const { service, repo } = buildService();
            const capturedParams: any[][] = [];
            repo.execute.callsFake((_sql: string, params: any[]) => {
                capturedParams.push(params);
                return Promise.resolve([{ total: '0' }]);
            });

            await service.getAuditTrails({
                filter: {
                    where: {
                        startDate: '2025-01-01',
                        endDate: '2025-12-31',
                    } as any,
                },
            });

            const allParams = capturedParams.flat();
            expect(allParams.some((v: any) => v instanceof Date)).to.be.true();
        });

        it('returns 0 totalCount when no results match', async () => {
            const { service, repo } = buildService();
            repo.execute
                .onFirstCall().resolves([])
                .onSecondCall().resolves([{ total: '0' }]);

            const result = await service.getAuditTrails({ filter: {} });

            expect(result.totalCount).to.equal(0);
            expect(result.results).to.have.length(0);
        });

        it('maps raw SQL row fields to AuditTrail model correctly', async () => {
            const { service, repo } = buildService();
            repo.execute
                .onFirstCall().resolves([{
                    id: 42,
                    type: 'Listing Management',
                    action: '/listings/1',
                    method: 'GET',
                    ip_address: '10.0.0.1',
                    user_agent: 'Mozilla',
                    response_status: 200,
                    logged_user_name: 'Bob Smith',
                    logged_user_role: 'seller',
                    logged_company_name: 'Sell Corp',
                    site_type: 'Trader',
                    username: 'bobsmith',
                    user_id: 7,
                    company_id: 3,
                    created_at: new Date('2025-06-01'),
                    updated_at: new Date('2025-06-01'),
                }])
                .onSecondCall().resolves([{ total: '1' }]);

            const result = await service.getAuditTrails({ filter: {} });

            const trail = result.results[0];
            expect(trail.id).to.equal(42);
            expect(trail.action).to.equal('/listings/1');
            expect(trail.ipAddress).to.equal('10.0.0.1');
            expect(trail.loggedUserName).to.equal('Bob Smith');
            expect(trail.loggedUserRole).to.equal('seller');
            expect(trail.userId).to.equal(7);
            expect(trail.companyId).to.equal(3);
        });
    });

    describe('createAuditTrailFromRequest() — remaining role branches', () => {
        it('sets SUPER_ADMIN role and WASTE_TRADE siteType', async () => {
            const { service, repo } = buildService();
            const profile = makeProfile({ globalRole: UserRoleEnum.SUPER_ADMIN });

            await service.createAuditTrailFromRequest(makeRequest(), profile);

            const arg = repo.create.firstCall.args[0];
            expect(arg.loggedUserRole).to.equal(AuditTrailUserRoleEnum.SUPER_ADMIN);
            expect(arg.siteType).to.equal(AuditTrailSiteTypeEnum.WASTE_TRADE);
        });

        it('sets ADMIN role and WASTE_TRADE siteType', async () => {
            const { service, repo } = buildService();
            const profile = makeProfile({ globalRole: UserRoleEnum.ADMIN });

            await service.createAuditTrailFromRequest(makeRequest(), profile);

            const arg = repo.create.firstCall.args[0];
            expect(arg.loggedUserRole).to.equal(AuditTrailUserRoleEnum.ADMIN);
            expect(arg.siteType).to.equal(AuditTrailSiteTypeEnum.WASTE_TRADE);
        });

        it('sets HAULIER role when isHaulier=true', async () => {
            const { service, repo } = buildService();
            const profile = makeProfile({ isHaulier: true, isBuyer: false, isSeller: false });

            await service.createAuditTrailFromRequest(makeRequest(), profile);

            const arg = repo.create.firstCall.args[0];
            expect(arg.loggedUserRole).to.equal(AuditTrailUserRoleEnum.HAULIER);
            expect(arg.siteType).to.equal(AuditTrailSiteTypeEnum.HAULIER);
        });

        it('sets SELLER role and TRADER siteType when only isSeller=true', async () => {
            const { service, repo } = buildService();
            const profile = makeProfile({ isHaulier: false, isBuyer: false, isSeller: true });

            await service.createAuditTrailFromRequest(makeRequest(), profile);

            const arg = repo.create.firstCall.args[0];
            expect(arg.loggedUserRole).to.equal(AuditTrailUserRoleEnum.SELLER);
            expect(arg.siteType).to.equal(AuditTrailSiteTypeEnum.TRADER);
        });

        it('extracts IP from x-client-ip when other headers absent', async () => {
            const { service, repo } = buildService();
            const req = makeRequest({ headers: { 'x-client-ip': '172.16.0.1', 'user-agent': 'ua' } });

            await service.createAuditTrailFromRequest(req, makeProfile({ globalRole: UserRoleEnum.ADMIN }));

            const arg = repo.create.firstCall.args[0];
            expect(arg.ipAddress).to.equal('172.16.0.1');
        });

        it('extracts IP from socket.remoteAddress as fallback', async () => {
            const { service, repo } = buildService();
            const req = makeRequest({
                headers: { 'user-agent': 'ua' },
                connection: {},
                socket: { remoteAddress: '192.168.0.10' },
            });

            await service.createAuditTrailFromRequest(req, makeProfile({ globalRole: UserRoleEnum.ADMIN }));

            const arg = repo.create.firstCall.args[0];
            expect(arg.ipAddress).to.equal('192.168.0.10');
        });

        it('maps various path types correctly', async () => {
            const { service, repo } = buildService();
            const pathMap: Record<string, string> = {
                '/users/1': 'User Management',
                '/offers/5': 'Offer Management',
                '/materials/3': 'Material Management',
                '/notifications/9': 'Notification',
                '/files/x': 'File Management',
                '/salesforce/sync': 'Salesforce Integration',
                '/audit-trails': 'Audit Trails',
            };

            for (const [path, expectedType] of Object.entries(pathMap)) {
                repo.create.reset();
                await service.createAuditTrailFromRequest(makeRequest({ path }), makeProfile({ globalRole: UserRoleEnum.ADMIN }));
                const arg = repo.create.firstCall.args[0];
                expect(arg.type).to.equal(expectedType);
            }
        });
    });

    describe('convertToCsv() — edge cases', () => {
        it('returns no-data message for empty array', () => {
            const { service } = buildService();
            const result = service.convertToCsv([]);
            expect(result).to.equal('No audit trails found');
        });

        it('wraps fields with newlines in double quotes', () => {
            const { service } = buildService();
            const trail = new AuditTrail();
            trail.createdAt = new Date('2025-06-01T10:00:00Z');
            trail.loggedUserName = 'Line1\nLine2';
            trail.siteType = 'Trader';
            trail.loggedCompanyName = 'Corp';
            trail.loggedUserRole = 'buyer';
            trail.type = 'Auth';
            trail.action = '/auth/login';

            const csv = service.convertToCsv([trail]);
            expect(csv).to.match(/"Line1\nLine2"/);
        });
    });
});
