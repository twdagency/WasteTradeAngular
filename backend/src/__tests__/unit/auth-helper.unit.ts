import { expect } from '@loopback/testlab';
import { AuthHelper } from '../../helpers/auth.helper';
import { CompanyUserRoleEnum, UserRoleEnum } from '../../enum';

describe('AuthHelper (unit)', () => {
    describe('validateSuperAdmin', () => {
        it('does not throw for super_admin', () => {
            expect(() => AuthHelper.validateSuperAdmin(UserRoleEnum.SUPER_ADMIN)).to.not.throw();
        });

        it('throws Forbidden for admin role', () => {
            expect(() => AuthHelper.validateSuperAdmin(UserRoleEnum.ADMIN)).to.throw(/unauthorized/);
        });

        it('throws Forbidden for sales_admin role', () => {
            expect(() => AuthHelper.validateSuperAdmin(UserRoleEnum.SALES_ADMIN)).to.throw(/unauthorized/);
        });

        it('throws Forbidden for regular user', () => {
            expect(() => AuthHelper.validateSuperAdmin(UserRoleEnum.USER)).to.throw(/unauthorized/);
        });
    });

    describe('validateAdmin', () => {
        it('does not throw for super_admin', () => {
            expect(() => AuthHelper.validateAdmin(UserRoleEnum.SUPER_ADMIN)).to.not.throw();
        });

        it('does not throw for admin', () => {
            expect(() => AuthHelper.validateAdmin(UserRoleEnum.ADMIN)).to.not.throw();
        });

        it('does not throw for sales_admin', () => {
            expect(() => AuthHelper.validateAdmin(UserRoleEnum.SALES_ADMIN)).to.not.throw();
        });

        it('throws Forbidden for regular user', () => {
            expect(() => AuthHelper.validateAdmin(UserRoleEnum.USER)).to.throw(/unauthorized/);
        });
    });

    describe('isAdmin', () => {
        it('returns true for super_admin', () => {
            expect(AuthHelper.isAdmin(UserRoleEnum.SUPER_ADMIN)).to.be.true();
        });

        it('returns true for admin', () => {
            expect(AuthHelper.isAdmin(UserRoleEnum.ADMIN)).to.be.true();
        });

        it('returns true for sales_admin', () => {
            expect(AuthHelper.isAdmin(UserRoleEnum.SALES_ADMIN)).to.be.true();
        });

        it('returns false for regular user', () => {
            expect(AuthHelper.isAdmin(UserRoleEnum.USER)).to.be.false();
        });
    });

    describe('validateCompanyAdmin', () => {
        it('does not throw for company admin role', () => {
            expect(() => AuthHelper.validateCompanyAdmin(CompanyUserRoleEnum.ADMIN)).to.not.throw();
        });

        it('throws Forbidden for seller role', () => {
            expect(() => AuthHelper.validateCompanyAdmin(CompanyUserRoleEnum.SELLER)).to.throw(/unauthorized/);
        });

        it('throws Forbidden for buyer role', () => {
            expect(() => AuthHelper.validateCompanyAdmin(CompanyUserRoleEnum.BUYER)).to.throw(/unauthorized/);
        });

        it('throws Forbidden for haulier role', () => {
            expect(() => AuthHelper.validateCompanyAdmin(CompanyUserRoleEnum.HAULIER)).to.throw(/unauthorized/);
        });
    });
});
