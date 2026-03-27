import { authenticate } from '@loopback/authentication';
import { inject, service } from '@loopback/core';
import { Filter, repository } from '@loopback/repository';
import { get, getModelSchemaRef, param, response, Response, RestBindings } from '@loopback/rest';
import { SecurityBindings } from '@loopback/security';
import { MyUserProfile } from '../authentication-strategies/type';
import { AuthHelper } from '../helpers/auth.helper';
import { AuditTrail } from '../models';
import { AuditTrailRepository, UserRepository } from '../repositories';
import { AuditTrailService } from '../services';
import { PaginationList } from '../types';

@authenticate('jwt')
export class AuditTrailController {
    constructor(
        @repository(AuditTrailRepository)
        public auditTrailRepository: AuditTrailRepository,
        @repository(UserRepository)
        public userRepository: UserRepository,
        @service(AuditTrailService)
        public auditTrailService: AuditTrailService,
        @inject(RestBindings.Http.RESPONSE) private httpResponse: Response,
    ) {}

    /**
     * Get audit trails with pagination, search, and filtering
     *
     * Filter examples:
     * - Date range: ?filter={"where":{"startDate":"2025-07-11","endDate":"2025-07-12"}}
     * - User search: ?filter={"where":{"loggedUserName":"john"}}
     * - Organisation search: ?filter={"where":{"loggedCompanyName":"company"}}
     * - Role filter: ?filter={"where":{"loggedUserRole":"Admin"}}
     * - Pagination: ?filter={"skip":0,"limit":20}
     * - Combined: ?filter={"where":{"startDate":"2025-07-11","endDate":"2025-07-12","loggedUserName":"john","loggedUserRole":"Admin"},"skip":0,"limit":20}
     */
    @get('/audit-trails')
    @response(200, {
        description: 'Array of Audit Trail model instances',
        content: {
            'application/json': {
                schema: {
                    type: 'object',
                    properties: {
                        totalCount: { type: 'number' },
                        results: {
                            type: 'array',
                            items: getModelSchemaRef(AuditTrail, {
                                includeRelations: true,
                            }),
                        },
                    },
                },
            },
        },
    })
    async find(
        @inject(SecurityBindings.USER) currentUserProfile: MyUserProfile,
        @param.filter(AuditTrail) filter?: Filter<AuditTrail>,
    ): Promise<PaginationList<AuditTrail>> {
        // Check user role - only Super Admin and Admin can access audit trails
        const user = await this.userRepository.findById(currentUserProfile.id);
        const globalRole = user.globalRole;

        AuthHelper.validateAdmin(globalRole);

        return this.auditTrailService.getAuditTrails({ filter });
    }

    @get('/audit-trails/export')
    @response(200, {
        description: 'Export audit trails to CSV',
        content: {
            'text/csv': {
                schema: {
                    type: 'string',
                    format: 'binary',
                },
            },
        },
    })
    async exportToCsv(
        @inject(SecurityBindings.USER) currentUserProfile: MyUserProfile,
        @param.filter(AuditTrail) filter?: Filter<AuditTrail>,
    ): Promise<void> {
        // Check user role - only Super Admin and Admin can export audit trails
        const user = await this.userRepository.findById(currentUserProfile.id);
        const globalRole = user.globalRole;

        AuthHelper.validateAdmin(globalRole);

        // Get all audit trails
        const auditTrails =
            (
                await this.auditTrailService.getAuditTrails({
                    filter,
                })
            )?.results || [];

        // Convert to CSV
        const csvContent = this.auditTrailService.convertToCsv(auditTrails);

        // Set headers for file download
        this.httpResponse.setHeader('Content-Type', 'text/csv');
        this.httpResponse.setHeader(
            'Content-Disposition',
            `attachment; filename="audit-trails-${new Date().toISOString().split('T')[0]}.csv"`,
        );

        // Send CSV content
        this.httpResponse.send(csvContent);
    }
}
