import {
    AuthorizationContext,
    AuthorizationDecision,
    AuthorizationMetadata,
    Authorizer,
} from '@loopback/authorization';
import { Provider } from '@loopback/core';

export async function roleAuthorization(
    authorizationCtx: AuthorizationContext,
    metadata: AuthorizationMetadata,
): Promise<AuthorizationDecision> {
    const currentUserRole = authorizationCtx.principals[0].role;
    if (!metadata?.allowedRoles) {
        return AuthorizationDecision.DENY;
    }

    let isAllowed = false;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata.allowedRoles.forEach((allowedRole: any) => {
        if (allowedRole === currentUserRole) {
            isAllowed = true;
        }
    });

    return isAllowed ? AuthorizationDecision.ALLOW : AuthorizationDecision.DENY;
}

export class RoleAuthorizationProvider implements Provider<Authorizer> {
    constructor() {}

    value(): Authorizer {
        return this.authorize.bind(this);
    }

    async authorize(context: AuthorizationContext, metadata: AuthorizationMetadata): Promise<AuthorizationDecision> {
        return roleAuthorization(context, metadata);
    }
}
