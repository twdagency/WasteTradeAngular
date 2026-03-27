import { Middleware, Request } from '@loopback/rest';
import * as jwt from 'jsonwebtoken';
import { MyUserProfile } from '../authentication-strategies/type';
import { AuditTrailService } from '../services';

export interface AuditTrailMiddlewareOptions {
    excludePaths?: string[];
    excludeMethods?: string[];
}

// Define the whitelist of paths that should be audited
interface AuditRule {
    method: string;
    pathPattern: RegExp;
    description: string;
}

const AUDIT_WHITELIST: AuditRule[] = [
    { method: 'GET', pathPattern: /^\/audit-trails\/export$/, description: 'Export audit logs' },
    { method: 'GET', pathPattern: /^\/company-locations\/\d+$/, description: 'View specific company location' },
    { method: 'DELETE', pathPattern: /^\/listings\/\d+$/, description: 'Delete listing' },
    { method: 'GET', pathPattern: /^\/listings\/admin\/companies$/, description: 'Admin view listings by companies' },
    { method: 'PATCH', pathPattern: /^\/listings\/\d+$/, description: 'Edit listing' },
    { method: 'POST', pathPattern: /^\/listing-requests$/, description: 'Submit listing request' },
    { method: 'POST', pathPattern: /^\/listings$/, description: 'Create listing' },
    { method: 'POST', pathPattern: /^\/login$/, description: 'Log in' },
    { method: 'GET', pathPattern: /^\/logout$/, description: 'Log out' },
    { method: 'PATCH', pathPattern: /^\/companies\/\d+$/, description: 'Edit company' },
    { method: 'POST', pathPattern: /^\/company-documents$/, description: 'Upload company document' },
    { method: 'POST', pathPattern: /^\/company-documents\/me$/, description: 'Upload my company document' },
    { method: 'POST', pathPattern: /^\/company-locations$/, description: 'Add new company location' },
    { method: 'PATCH', pathPattern: /^\/offers\/admin\/\d+\/accept$/, description: 'Approve offer' },
    { method: 'PATCH', pathPattern: /^\/offers\/admin\/\d+\/reject$/, description: 'Reject offer' },
    { method: 'PATCH', pathPattern: /^\/offers\/\d+\/accept$/, description: 'Accept offer' },
    { method: 'PATCH', pathPattern: /^\/offers\/\d+\/reject$/, description: 'Reject offer' },
    { method: 'POST', pathPattern: /^\/offers$/, description: 'Create offer' },
    { method: 'PATCH', pathPattern: /^\/users\/admin\/\d+\/approve$/, description: 'Approve user registration' },
    { method: 'PATCH', pathPattern: /^\/users\/me$/, description: 'Update my profile' },
    // Haulage bid management endpoints
    { method: 'GET', pathPattern: /^\/admin\/haulage-bids$/, description: 'View all haulage bids' },
    { method: 'GET', pathPattern: /^\/admin\/haulage-bids\/\d+$/, description: 'View haulage bid details' },
    { method: 'GET', pathPattern: /^\/admin\/hauliers$/, description: 'View approved hauliers' },
    { method: 'GET', pathPattern: /^\/admin\/sample-requests$/, description: 'View sample requests' },
    { method: 'GET', pathPattern: /^\/admin\/mfi-requests$/, description: 'View mfi requests' },
    { method: 'POST', pathPattern: /^\/admin\/haulage-offers$/, description: 'Create haulage offer on behalf' },
    { method: 'PATCH', pathPattern: /^\/haulage-offers\/\d+\/actions$/, description: 'Haulage bid actions' },
    {
        method: 'PATCH',
        pathPattern: /^\/haulage-offers\/\d+\/mark-shipped$/,
        description: 'Mark haulage offer as shipped',
    },
];

export const createAuditTrailMiddleware = (options: AuditTrailMiddlewareOptions = {}): Middleware => {
    return async (middlewareCtx, next) => {
        const { request, response } = middlewareCtx;

        const token = request?.headers?.authorization?.replace('Bearer ', '') ?? '';

        // Check if this request should be audited
        if (!shouldAudit(request.path, request.method, token)) {
            return next();
        }

        // Check if user is authenticated
        const userProfile = jwt.decode(token) as MyUserProfile;

        // Only audit authenticated requests (except login which may not have a valid token yet)
        if (!userProfile?.id && request.path !== '/login') {
            return next();
        }

        const auditTrailService = (await middlewareCtx.get('services.AuditTrailService')) as AuditTrailService;
        let responseStatus: number | undefined;

        try {
            // Execute the next middleware/controller
            const result = await next();

            responseStatus = response.statusCode ?? 200;

            return result;
        } catch (err) {
            // For errors, get status from error object or set default
            if (err && typeof err === 'object' && 'statusCode' in err) {
                responseStatus = (err as { statusCode: number }).statusCode;
            } else if (err && typeof err === 'object' && 'status' in err) {
                responseStatus = (err as { status: number }).status;
            } else {
                responseStatus = 500;
            }

            // Re-throw the error
            throw err;
        } finally {
            // eslint-disable-next-line no-void
            void createAuditTrail(middlewareCtx, userProfile, responseStatus, auditTrailService);
        }
    };
};

function shouldAudit(path: string, method: string, accessToken: string): boolean {
    // For login, we don't require a token
    if (path === '/login' && method.toUpperCase() === 'POST') {
        return true;
    }

    // For other endpoints, require a token
    if (!accessToken) {
        return false;
    }

    const upperMethod = method.toUpperCase();

    // Check if the path and method match any rule in the whitelist
    return AUDIT_WHITELIST.some((rule) => {
        return rule.method === upperMethod && rule.pathPattern.test(path);
    });
}

async function createAuditTrail(
    middlewareCtx: { request: unknown },
    userProfile: MyUserProfile,
    responseStatus: number | undefined,
    auditTrailService: AuditTrailService,
): Promise<void> {
    try {
        // Handle null or undefined userProfile to prevent null reference errors
        if (!userProfile) {
            // Skip audit trail creation if userProfile is null
            return;
        }

        // Ensure userProfile has required properties to prevent null reference errors
        const safeUserProfile: MyUserProfile = {
            ...userProfile,
            globalRole: userProfile.globalRole || 'user',
        };

        await auditTrailService.createAuditTrailFromRequest(
            middlewareCtx.request as Request,
            safeUserProfile,
            responseStatus,
        );
    } catch (error) {
        // Log the error but don't throw it to avoid breaking the main request
        console.error('Failed to create audit trail: ', error);
    }
}
