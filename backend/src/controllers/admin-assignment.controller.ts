import { authenticate } from '@loopback/authentication';
import { authorize } from '@loopback/authorization';
import { inject } from '@loopback/core';
import { post, get, param, requestBody } from '@loopback/rest';
import { SecurityBindings, UserProfile } from '@loopback/security';
import { AdminAssignmentService } from '../services';
import { service } from '@loopback/core';

export class AdminAssignmentController {
    constructor(
        @service(AdminAssignmentService)
        public adminAssignmentService: AdminAssignmentService,
    ) {}

    /**
     * Assign an admin to a record
     */
    @post('/admin/assign')
    @authenticate('jwt')
    @authorize({ allowedRoles: ['admin', 'super_admin', 'sales_admin'] })
    async assignAdmin(
        @requestBody({
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        required: ['recordType', 'recordId'],
                        properties: {
                            recordType: {
                                type: 'string',
                                enum: ['user', 'listing', 'wanted_listing', 'offer', 'haulage_offer'],
                            },
                            recordId: { type: 'number' },
                            adminId: { type: 'number', nullable: true },
                        },
                    },
                },
            },
        })
        data: {
            recordType: string;
            recordId: number;
            adminId: number | null;
        },
    ): Promise<{ success: boolean; message: string }> {
        return this.adminAssignmentService.assignAdmin(data.recordType, data.recordId, data.adminId ?? null);
    }

    /**
     * Get all records assigned to a specific admin
     */
    @get('/admin/assigned/{adminId}')
    @authenticate('jwt')
    @authorize({ allowedRoles: ['admin', 'super_admin', 'sales_admin'] })
    async getAssignedRecords(
        @param.path.number('adminId') adminId: number,
        @param.query.string('recordType') recordType?: string,
    ): Promise<any> {
        return this.adminAssignmentService.getAssignedRecords(adminId, recordType);
    }

    /**
     * Get my assigned records (current admin)
     */
    @get('/admin/my-assigned')
    @authenticate('jwt')
    @authorize({ allowedRoles: ['admin', 'super_admin', 'sales_admin'] })
    async getMyAssignedRecords(
        @inject(SecurityBindings.USER) currentUser: UserProfile,
        @param.query.string('recordType') recordType?: string,
    ): Promise<any> {
        return this.adminAssignmentService.getAssignedRecords(currentUser.id, recordType);
    }
}
