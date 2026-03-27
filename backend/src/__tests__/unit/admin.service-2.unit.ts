import { expect, sinon } from '@loopback/testlab';
import { AdminService } from '../../services/admin.service';
import { UserRoleEnum, UserStatus } from '../../enum';
import { createStubRepo, createStubService } from '../helpers/stub-factory';

function buildService(overrides: Record<string, any> = {}): AdminService {
    return new AdminService(
        overrides.userRepo ?? createStubRepo(),
        overrides.emailService ?? createStubService(['sendAccountArchivedEmail', 'sendResetPasswordEmail']),
        overrides.userService ?? createStubService(['forgetPassword']),
        overrides.assignAdminService ?? createStubService(['unassignAdminFromAllRecords']),
        overrides.passwordHasher ?? { hashPassword: sinon.stub().resolves('hashed-pw') },
    );
}

const superAdmin: any = { id: 1, globalRole: UserRoleEnum.SUPER_ADMIN };
const admin: any = { id: 2, globalRole: UserRoleEnum.ADMIN };
const salesAdmin: any = { id: 3, globalRole: UserRoleEnum.SALES_ADMIN };
const regularUser: any = { id: 4, globalRole: UserRoleEnum.USER };

describe('AdminService deeper coverage (unit)', () => {
    describe('checkPermissionAdmin()', () => {
        it('throws Forbidden for USER role', () => {
            const svc = buildService();
            expect(() => svc.checkPermissionAdmin(regularUser)).to.throw(/forbidden/i);
        });

        it('throws Forbidden for SALES_ADMIN role', () => {
            const svc = buildService();
            expect(() => svc.checkPermissionAdmin(salesAdmin)).to.throw(/forbidden/i);
        });

        it('does NOT throw for ADMIN role', () => {
            const svc = buildService();
            expect(() => svc.checkPermissionAdmin(admin)).to.not.throw();
        });

        it('does NOT throw for SUPER_ADMIN role', () => {
            const svc = buildService();
            expect(() => svc.checkPermissionAdmin(superAdmin)).to.not.throw();
        });
    });

    describe('createAdmin()', () => {
        it('creates admin user and calls forgetPassword', async () => {
            const userRepo = createStubRepo();
            userRepo.create.resolves({ id: 50, email: 'new@admin.com' });
            const userService = createStubService(['forgetPassword']);
            const svc = buildService({ userRepo, userService });

            const result = await svc.createAdmin(
                { firstName: 'New', lastName: 'Admin', email: 'New@Admin.com', globalRole: UserRoleEnum.ADMIN } as any,
                superAdmin,
            );

            expect(result.status).to.equal('success');
            expect(result.data?.id).to.equal(50);
            expect(userRepo.create.calledOnce).to.be.true();
            // Email should be lowercased
            const createArg = userRepo.create.firstCall.args[0];
            expect(createArg.email).to.equal('new@admin.com');
            expect(userService.forgetPassword.calledOnce).to.be.true();
        });

        it('throws Forbidden when non-super_admin tries to create super_admin', async () => {
            const svc = buildService();

            await expect(
                svc.createAdmin(
                    { firstName: 'S', lastName: 'A', email: 'sa@test.com', globalRole: UserRoleEnum.SUPER_ADMIN } as any,
                    admin,
                ),
            ).to.be.rejectedWith(/forbidden|permission/i);
        });

        it('throws Conflict on duplicate email (pg error 23505)', async () => {
            const userRepo = createStubRepo();
            const dupError: any = new Error('duplicate key value violates unique constraint "users_email_idx"');
            dupError.code = '23505';
            userRepo.create.rejects(dupError);
            const svc = buildService({ userRepo });

            await expect(
                svc.createAdmin(
                    { firstName: 'A', lastName: 'B', email: 'dup@test.com', globalRole: UserRoleEnum.ADMIN } as any,
                    superAdmin,
                ),
            ).to.be.rejectedWith(/email-admin-is-already-existed/);
        });

        it('throws Forbidden when caller is USER', async () => {
            const svc = buildService();
            await expect(
                svc.createAdmin({ firstName: 'A', lastName: 'B', email: 'x@y.com', globalRole: UserRoleEnum.ADMIN } as any, regularUser),
            ).to.be.rejectedWith(/forbidden/i);
        });
    });

    describe('getAdminDetail()', () => {
        it('returns admin data when found', async () => {
            const userRepo = createStubRepo();
            userRepo.findOne.resolves({ id: 10, firstName: 'Alice', lastName: 'Smith', globalRole: UserRoleEnum.ADMIN });
            const svc = buildService({ userRepo });

            const result = await svc.getAdminDetail(10, superAdmin);

            expect(result.status).to.equal('success');
            expect(result.data?.id).to.equal(10);
        });

        it('throws NotFound when admin not found', async () => {
            const userRepo = createStubRepo();
            userRepo.findOne.resolves(null);
            const svc = buildService({ userRepo });

            await expect(svc.getAdminDetail(999, superAdmin)).to.be.rejectedWith(/admin-not-found/);
        });

        it('throws Forbidden for USER caller', async () => {
            const svc = buildService();
            await expect(svc.getAdminDetail(1, regularUser)).to.be.rejectedWith(/forbidden/i);
        });
    });

    describe('editAdmin()', () => {
        it('updates admin fields successfully', async () => {
            const userRepo = createStubRepo();
            userRepo.findOne.resolves({ id: 5, globalRole: UserRoleEnum.ADMIN });
            userRepo.updateById.resolves();
            const svc = buildService({ userRepo });

            const result = await svc.editAdmin(
                5,
                { firstName: 'Updated', lastName: 'Name', email: 'Updated@Test.com', globalRole: UserRoleEnum.ADMIN } as any,
                superAdmin,
            );

            expect(result.status).to.equal('success');
            const updateArg = userRepo.updateById.firstCall.args[1];
            expect(updateArg.email).to.equal('updated@test.com');
        });

        it('throws NotFound when admin does not exist', async () => {
            const userRepo = createStubRepo();
            userRepo.findOne.resolves(null);
            const svc = buildService({ userRepo });

            await expect(
                svc.editAdmin(999, { firstName: 'X' } as any, superAdmin),
            ).to.be.rejectedWith(/admin-not-found/);
        });

        it('throws Forbidden when non-super_admin tries to change role', async () => {
            const userRepo = createStubRepo();
            userRepo.findOne.resolves({ id: 5, globalRole: UserRoleEnum.ADMIN });
            const svc = buildService({ userRepo });

            await expect(
                svc.editAdmin(5, { globalRole: UserRoleEnum.SUPER_ADMIN } as any, admin),
            ).to.be.rejectedWith(/forbidden|permission/i);
        });

        it('throws Conflict on duplicate email during update', async () => {
            const userRepo = createStubRepo();
            userRepo.findOne.resolves({ id: 5, globalRole: UserRoleEnum.ADMIN });
            const dupError: any = new Error('duplicate key value violates unique constraint "users_email_idx"');
            dupError.code = '23505';
            userRepo.updateById.rejects(dupError);
            const svc = buildService({ userRepo });

            await expect(
                svc.editAdmin(5, { email: 'dup@test.com', globalRole: UserRoleEnum.ADMIN } as any, superAdmin),
            ).to.be.rejectedWith(/email-admin-is-already-existed/);
        });
    });

    describe('archiveOrActiveAdmin()', () => {
        it('archives admin, sends email, and unassigns from all records', async () => {
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 5, globalRole: UserRoleEnum.ADMIN, email: 'a@a.com' });
            userRepo.updateById.resolves();
            const emailService = createStubService(['sendAccountArchivedEmail']);
            const assignAdminService = createStubService(['unassignAdminFromAllRecords']);
            const svc = buildService({ userRepo, emailService, assignAdminService });

            const result = await svc.archiveOrActiveAdmin(5, UserStatus.ARCHIVED, superAdmin);

            expect(result.status).to.equal('success');
            expect(emailService.sendAccountArchivedEmail.calledOnce).to.be.true();
            expect(assignAdminService.unassignAdminFromAllRecords.calledOnce).to.be.true();
        });

        it('activates admin without sending email', async () => {
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 5, globalRole: UserRoleEnum.ADMIN });
            userRepo.updateById.resolves();
            const emailService = createStubService(['sendAccountArchivedEmail']);
            const svc = buildService({ userRepo, emailService });

            const result = await svc.archiveOrActiveAdmin(5, UserStatus.ACTIVE, superAdmin);

            expect(result.status).to.equal('success');
            expect(emailService.sendAccountArchivedEmail.called).to.be.false();
        });

        it('throws BadRequest for invalid status', async () => {
            const svc = buildService();
            await expect(
                svc.archiveOrActiveAdmin(5, 'invalid' as any, superAdmin),
            ).to.be.rejectedWith(/invalid-status/);
        });

        it('throws BadRequest when trying to archive a regular USER', async () => {
            const userRepo = createStubRepo();
            userRepo.findById.resolves({ id: 5, globalRole: UserRoleEnum.USER });
            const svc = buildService({ userRepo });

            await expect(
                svc.archiveOrActiveAdmin(5, UserStatus.ARCHIVED, superAdmin),
            ).to.be.rejectedWith(/cannot-archive-or-active/);
        });

        it('throws Forbidden for SALES_ADMIN caller', async () => {
            const svc = buildService();
            await expect(
                svc.archiveOrActiveAdmin(5, UserStatus.ARCHIVED, salesAdmin),
            ).to.be.rejectedWith(/forbidden/i);
        });
    });
});
