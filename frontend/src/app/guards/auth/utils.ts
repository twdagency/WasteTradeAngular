import { User } from 'app/models/auth.model';
import { ROUTES, ROUTES_WITH_SLASH } from '../../constants/route.const';
import { GuardRequireRole, Role } from '../../types/auth';

export const getDefaultRouteByRole = (user: User) => {
  switch (user.user.globalRole) {
    case Role.ADMIN:
    case Role.SALES_ADMIN:
    case Role.SUPER_ADMIN:
      return ROUTES.commercialManagement;

    case Role.USER:
      return user.company?.isHaulier ? ROUTES.availableLoads : ROUTES_WITH_SLASH.buy;
  }
};

const getUserGuardRoles = (user: User): GuardRequireRole[] => {
  const userGuardRoles = [];

  if ([Role.SUPER_ADMIN, Role.ADMIN, Role.SALES_ADMIN].includes(user.user.globalRole)) {
    userGuardRoles.push(GuardRequireRole.SuperAdmin);
  }

  if (user?.company) {
    if (user.company.isHaulier) {
      userGuardRoles.push(GuardRequireRole.Haulier);
    } else {
      userGuardRoles.push(GuardRequireRole.Trading);
    }
  } else if (!userGuardRoles.includes(GuardRequireRole.SuperAdmin)) {
    // default role to Trading if no company is associated
    userGuardRoles.push(GuardRequireRole.Trading);
  }

  return userGuardRoles;
};

export const checkAllowAccessAuthPage = (user: User, requireRole: GuardRequireRole[]) => {
  const userGuardRoles = getUserGuardRoles(user);

  return userGuardRoles.some((r) => requireRole.includes(r));
};
