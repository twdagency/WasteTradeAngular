import { HttpErrors } from '@loopback/rest';
import { CompanyUserRoleEnum, UserRoleEnum } from '../enum';
import { messages } from '../constants';

export namespace AuthHelper {
    export function validateSuperAdmin(globalRole: UserRoleEnum): void {
        if (globalRole !== UserRoleEnum.SUPER_ADMIN) {
            throw new HttpErrors.Forbidden(messages.unauthorized);
        }
    }

    export function validateAdmin(globalRole: UserRoleEnum): void {
        if (![UserRoleEnum.SUPER_ADMIN, UserRoleEnum.ADMIN, UserRoleEnum.SALES_ADMIN].includes(globalRole)) {
            throw new HttpErrors.Forbidden(messages.unauthorized);
        }
    }

    export function isAdmin(globalRole: UserRoleEnum): boolean {
        return [UserRoleEnum.SUPER_ADMIN, UserRoleEnum.ADMIN, UserRoleEnum.SALES_ADMIN].includes(globalRole);
    }

    export function validateCompanyAdmin(companyRole: string): void {
        if (companyRole !== CompanyUserRoleEnum.ADMIN) {
            throw new HttpErrors.Forbidden(messages.unauthorized);
        }
    }
}
