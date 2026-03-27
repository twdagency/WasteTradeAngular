import { authenticate } from '@loopback/authentication';
import { authorize } from '@loopback/authorization';
import { inject } from '@loopback/core';
import { get, post, patch, del, param, requestBody, HttpErrors } from '@loopback/rest';
import { SecurityBindings, UserProfile } from '@loopback/security';
import { AdminNotesService } from '../services';
import { service } from '@loopback/core';
import { AdminNotes } from '../models';

export class AdminNotesController {
    constructor(
        @service(AdminNotesService)
        public adminNotesService: AdminNotesService,
    ) {}

    /**
     * Create a new admin note
     */
    @post('/admin/notes')
    @authenticate('jwt')
    @authorize({ allowedRoles: ['admin', 'super_admin', 'sales_admin'] })
    async createNote(
        @inject(SecurityBindings.USER) currentUser: UserProfile,
        @requestBody({
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        required: ['recordType', 'recordId', 'noteText'],
                        properties: {
                            recordType: {
                                type: 'string',
                                enum: ['user', 'listing', 'wanted_listing', 'offer', 'haulage_offer', 'sample', 'mfi'],
                            },
                            recordId: { type: 'number' },
                            noteText: { type: 'string' },
                        },
                    },
                },
            },
        })
        data: {
            recordType: string;
            recordId: number;
            noteText: string;
        },
    ): Promise<AdminNotes> {
        const noteText = data.noteText ?? '';
        if (noteText.length > 4000) {
            throw new HttpErrors.BadRequest('Note text is too long');
        }

        return this.adminNotesService.createNote({
            ...data,
            noteText,
            createdByAdminId: currentUser.id,
        });
    }

    /**
     * Get all notes for a specific record
     */
    @get('/admin/notes/{recordType}/{recordId}')
    @authenticate('jwt')
    @authorize({ allowedRoles: ['admin', 'super_admin', 'sales_admin'] })
    async getNotes(
        @param.path.string('recordType') recordType: string,
        @param.path.number('recordId') recordId: number,
    ): Promise<AdminNotes[]> {
        return this.adminNotesService.getNotesForRecord(recordType, recordId);
    }

    /**
     * Update an existing note
     */
    @patch('/admin/notes/{id}')
    @authenticate('jwt')
    @authorize({ allowedRoles: ['admin', 'super_admin', 'sales_admin'] })
    async updateNote(
        @inject(SecurityBindings.USER) currentUser: UserProfile,
        @param.path.number('id') id: number,
        @requestBody({
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        required: ['noteText'],
                        properties: {
                            noteText: { type: 'string' },
                        },
                    },
                },
            },
        })
        data: { noteText: string },
    ): Promise<{ success: boolean; message: string }> {
        const noteText = data.noteText ?? '';
        if (noteText.length > 4000) {
            throw new HttpErrors.BadRequest('Note text is too long');
        }

        await this.adminNotesService.updateNote(id, noteText, currentUser.id);
        return { success: true, message: 'Note updated successfully' };
    }

    /**
     * Delete a note
     */
    @del('/admin/notes/{id}')
    @authenticate('jwt')
    @authorize({ allowedRoles: ['admin', 'super_admin', 'sales_admin'] })
    async deleteNote(@param.path.number('id') id: number): Promise<{ success: boolean; message: string }> {
        await this.adminNotesService.deleteNote(id);
        return { success: true, message: 'Note deleted successfully' };
    }

    /**
     * Get a single note by ID
     */
    @get('/admin/notes/{id}')
    @authenticate('jwt')
    @authorize({ allowedRoles: ['admin', 'super_admin', 'sales_admin'] })
    async getNoteById(@param.path.number('id') id: number): Promise<AdminNotes> {
        return this.adminNotesService.getNoteById(id);
    }
}
