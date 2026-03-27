import { bind, BindingScope } from '@loopback/context';
import { Filter, repository } from '@loopback/repository';
import { Request } from '@loopback/rest';
import dayjs from 'dayjs';
import { get } from 'lodash';
import { MyUserProfile } from '../authentication-strategies/type';
import { AuditTrailSiteTypeEnum, AuditTrailUserRoleEnum, UserRoleEnum } from '../enum';
import { AuditTrail } from '../models';
import { AuditTrailRepository } from '../repositories';
import { PaginationList } from '../types';

export interface CreateAuditTrailData {
    userId: number;
    companyId?: number;
    type: string;
    action: string;
    method: string;
    ipAddress?: string;
    userAgent?: string;
    requestBody?: object;
    responseStatus?: number;
}

@bind({ scope: BindingScope.TRANSIENT })
export class AuditTrailService {
    constructor(
        @repository(AuditTrailRepository)
        public auditTrailRepository: AuditTrailRepository,
    ) {}

    async createAuditTrail(data: CreateAuditTrailData): Promise<AuditTrail> {
        return this.auditTrailRepository.create(data);
    }

    async createAuditTrailFromRequest(
        request: Request,
        userProfile: MyUserProfile,
        responseStatus?: number,
    ): Promise<AuditTrail> {
        const type = this.getTypeFromPath(request.path);
        const action = request.path;
        const method = request.method;
        const ipAddress = this.getClientIpAddress(request);
        const userAgent = request.headers['user-agent'];
        const requestBody = this.sanitizeRequestBody(request.body);

        let loggedUserRole: string = '';
        let siteType: string = '';

        // Handle case where userProfile or globalRole might be null/undefined
        const userGlobalRole = userProfile?.globalRole ?? UserRoleEnum.USER;

        switch (userGlobalRole) {
            case UserRoleEnum.SUPER_ADMIN: {
                loggedUserRole = AuditTrailUserRoleEnum.SUPER_ADMIN;
                siteType = AuditTrailSiteTypeEnum.WASTE_TRADE;

                break;
            }
            case UserRoleEnum.ADMIN: {
                loggedUserRole = AuditTrailUserRoleEnum.ADMIN;
                siteType = AuditTrailSiteTypeEnum.WASTE_TRADE;

                break;
            }
            case UserRoleEnum.USER: {
                if (userProfile.isHaulier) {
                    loggedUserRole = AuditTrailUserRoleEnum.HAULIER;
                    siteType = AuditTrailSiteTypeEnum.HAULIER;
                } else if (userProfile.isBuyer && userProfile.isSeller) {
                    loggedUserRole = AuditTrailUserRoleEnum.BUYER;
                    siteType = AuditTrailSiteTypeEnum.TRADER;
                } else if (userProfile.isSeller) {
                    loggedUserRole = AuditTrailUserRoleEnum.SELLER;
                    siteType = AuditTrailSiteTypeEnum.TRADER;
                } else if (userProfile.isBuyer) {
                    loggedUserRole = AuditTrailUserRoleEnum.BUYER;
                    siteType = AuditTrailSiteTypeEnum.TRADER;
                }

                break;
            }
            default:
                break;
        }

        return this.auditTrailRepository.create({
            type,
            action,
            method,
            ipAddress,
            userAgent,
            requestBody,
            responseStatus,
            loggedUserName: userProfile?.name || '',
            loggedCompanyName: userProfile?.companyName || '',
            loggedUserRole,
            siteType,
            username: userProfile?.username || '',
            userId: userProfile?.id || 0,
            companyId: userProfile?.companyId || 0,
        });
    }

    async getAuditTrails({ filter }: { filter?: Filter<AuditTrail> }): Promise<PaginationList<AuditTrail>> {
        const skip: number = get(filter, 'skip', 0);
        const limit: number = get(filter, 'limit', 10);
        const loggedUserName = get(filter?.where, 'loggedUserName', null) as string | null;
        const loggedCompanyName = get(filter?.where, 'loggedCompanyName', null) as string | null;
        const loggedUserRole = get(filter?.where, 'loggedUserRole', null) as string | null;
        const method = get(filter?.where, 'method', null) as string | null;
        const action = get(filter?.where, 'action', null) as string | null;
        const startDate = get(filter?.where, 'startDate', null) as string | null;
        const endDate = get(filter?.where, 'endDate', null) as string | null;
        const conditions: string[] = [];
        const params: (string | Date | number)[] = [];
        let paramIndex = 1;

        // Search by loggedUserName (user filter)
        if (loggedUserName) {
            conditions.push(`logged_user_name ILIKE $${paramIndex}`);
            params.push(`%${loggedUserName}%`);
            paramIndex++;
        }

        // Search by loggedCompanyName (organisation filter)
        if (loggedCompanyName) {
            conditions.push(`logged_company_name ILIKE $${paramIndex}`);
            params.push(`%${loggedCompanyName}%`);
            paramIndex++;
        }

        // Filter by role
        if (loggedUserRole) {
            conditions.push(`logged_user_role = $${paramIndex}`);
            params.push(loggedUserRole);
            paramIndex++;
        }

        // Filter by method (GET, POST, PATCH, DELETE)
        if (method) {
            conditions.push(`method = $${paramIndex}`);
            params.push(method.toUpperCase());
            paramIndex++;
        }

        // Filter by action (path/endpoint) with pattern matching
        // Supports patterns like /listings/{id} to match /listings/123
        if (action) {
            // Convert pattern like /listings/{id} to SQL regex pattern /listings/[0-9]+
            const regexPattern = action.replace(/\{id\}/g, '[0-9]+');
            conditions.push(`action ~ $${paramIndex}`);
            params.push(`^${regexPattern}$`);
            paramIndex++;
        }

        if (startDate) {
            conditions.push(`created_at >= $${paramIndex}`);
            params.push(new Date(startDate));
            paramIndex++;
        }

        if (endDate) {
            conditions.push(`created_at <= $${paramIndex}`);
            params.push(new Date(endDate + 'T23:59:59.999Z')); // Include the entire end date
            paramIndex++;
        }

        // Build the WHERE clause
        const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

        // Get total count
        const countQuery = `
            SELECT COUNT(*) as total 
            FROM audit_trails 
            ${whereClause}
        `;
        // Get paginated results
        const dataQuery = `
            SELECT * 
            FROM audit_trails 
            ${whereClause}
            ORDER BY created_at DESC 
            LIMIT $${paramIndex} OFFSET $${paramIndex + 1}
        `;

        const [results, totalResult] = await Promise.all([
            this.auditTrailRepository.execute(dataQuery, [...params, limit, skip]),
            this.auditTrailRepository.execute(countQuery, params),
        ]);

        const totalCount = parseInt(totalResult[0]?.total || '0', 10);

        // Map raw results to AuditTrail model instances
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const auditTrails = results.map((row: Record<string, any>) => {
            const auditTrail = new AuditTrail();

            auditTrail.id = row.id;
            auditTrail.type = row.type;
            auditTrail.action = row.action;
            auditTrail.method = row.method;
            auditTrail.ipAddress = row.ip_address;
            auditTrail.userAgent = row.user_agent;
            // auditTrail.requestBody = row.request_body;
            auditTrail.responseStatus = row.response_status;
            auditTrail.loggedUserName = row.logged_user_name;
            auditTrail.loggedUserRole = row.logged_user_role;
            auditTrail.loggedCompanyName = row.logged_company_name;
            auditTrail.siteType = row.site_type;
            auditTrail.username = row.username;
            auditTrail.userId = row.user_id;
            auditTrail.companyId = row.company_id;
            auditTrail.createdAt = row.created_at;
            auditTrail.updatedAt = row.updated_at;

            return auditTrail;
        });

        return {
            results: auditTrails,
            totalCount,
        };
    }

    private getTypeFromPath(path: string): string {
        // Remove query parameters and leading slash
        const cleanPath = path.split('?')[0].replace(/^\//, '');

        // Extract the main resource from the path
        const pathSegments = cleanPath.split('/');
        const mainResource = pathSegments[0];

        // Map common path patterns to types
        const typeMapping: { [key: string]: string } = {
            auth: 'Authentication',
            users: 'User Management',
            companies: 'Company Management',
            listings: 'Listing Management',
            offers: 'Offer Management',
            materials: 'Material Management',
            notifications: 'Notification',
            files: 'File Management',
            upload: 'File Upload',
            'company-documents': 'Company Documents',
            'company-locations': 'Company Locations',
            'company-users': 'Company Users',
            'account-status': 'Account Status',
            'listing-documents': 'Listing Documents',
            'material-users': 'Material Users',
            salesforce: 'Salesforce Integration',
            translation: 'Translation',
            cronjob: 'System Jobs',
            'audit-trails': 'Audit Trails',
        };

        return typeMapping[mainResource] || 'Other';
    }

    private getClientIpAddress(request: Request): string | undefined {
        // Check for various headers that might contain the real IP
        return (
            (request.headers['x-forwarded-for'] as string) ??
            (request.headers['x-real-ip'] as string) ??
            (request.headers['x-client-ip'] as string) ??
            request.connection?.remoteAddress ??
            request.socket?.remoteAddress ??
            undefined
        );
    }

    private sanitizeRequestBody(body: unknown): object | undefined {
        if (!body) return undefined;

        // Create a copy to avoid modifying the original
        const sanitized = JSON.parse(JSON.stringify(body));

        // Remove sensitive fields
        const sensitiveFields = [
            'password',
            'passwordHash',
            'token',
            'accessToken',
            'refreshToken',
            'secret',
            'apiKey',
            'privateKey',
            'captchaToken',
            'mFullToken',
        ];

        const removeSensitiveFields = (obj: unknown): unknown => {
            if (Array.isArray(obj)) {
                return obj.map(removeSensitiveFields);
            }

            if (obj && typeof obj === 'object') {
                const cleaned: Record<string, unknown> = {};
                for (const [key, value] of Object.entries(obj)) {
                    const lowerKey = key.toLowerCase();
                    if (sensitiveFields.some((field) => lowerKey.includes(field.toLowerCase()))) {
                        cleaned[key] = '[REDACTED]';
                    } else {
                        cleaned[key] = removeSensitiveFields(value);
                    }
                }
                return cleaned;
            }

            return obj;
        };

        return removeSensitiveFields(sanitized) as object;
    }

    public convertToCsv(auditTrails: AuditTrail[]): string {
        if (auditTrails.length === 0) {
            return 'No audit trails found';
        }

        // Define CSV headers
        const headers = ['Timestamp', 'Name of User', 'Type', 'Organisation', 'Role of User', 'Action'];

        // Create CSV rows
        const rows = auditTrails.map((auditTrail) => [
            dayjs(auditTrail.createdAt).format('YYYY-MM-DD HH:mm') ?? '',
            auditTrail.loggedUserName ?? '',
            auditTrail.siteType ?? '',
            auditTrail.loggedCompanyName ?? '',
            auditTrail.loggedUserRole ?? '',
            `${auditTrail.type} '${auditTrail.action}'`,
        ]);

        // Combine headers and rows
        const csvRows = [headers, ...rows];

        // Convert to CSV string
        return csvRows
            .map((row) =>
                row
                    .map((field) => {
                        // Escape quotes and wrap in quotes if contains comma, quote, or newline
                        if (
                            field.includes(',') ||
                            field.includes('"') ||
                            field.includes('\n') ||
                            field.includes('\r')
                        ) {
                            return `"${field.replace(/"/g, '""')}"`;
                        }
                        return field;
                    })
                    .join(','),
            )
            .join('\n');
    }
}
