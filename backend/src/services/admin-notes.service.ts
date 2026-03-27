import { injectable, BindingScope } from '@loopback/core';
import { repository } from '@loopback/repository';
import { AdminNotesRepository } from '../repositories';
import { AdminNotes } from '../models';
import { HttpErrors } from '@loopback/rest';

@injectable({ scope: BindingScope.TRANSIENT })
export class AdminNotesService {
    constructor(
        @repository(AdminNotesRepository)
        public adminNotesRepository: AdminNotesRepository,
    ) {}

    /**
     * Create a new admin note
     */
    async createNote(data: {
        recordType: string;
        recordId: number;
        noteText: string;
        createdByAdminId: number;
    }): Promise<AdminNotes> {
        const allowedRecordTypes = ['user', 'listing', 'wanted_listing', 'offer', 'haulage_offer', 'sample', 'mfi'];
        if (!allowedRecordTypes.includes(data.recordType)) {
            throw new HttpErrors.BadRequest(`Invalid record type: ${data.recordType}`);
        }

        const now = new Date().toISOString();
        const normalizedText = data.noteText.trim();

        const existingNote = await this.adminNotesRepository.findOne({
            where: { recordType: data.recordType, recordId: data.recordId },
            order: ['updatedAt DESC', 'id DESC'],
        });

        if (existingNote?.id) {
            await this.adminNotesRepository.updateById(existingNote.id, {
                noteText: normalizedText,
                updatedByAdminId: data.createdByAdminId,
                updatedAt: now,
            });
            return this.adminNotesRepository.findById(existingNote.id);
        }

        return this.adminNotesRepository.create({
            ...data,
            noteText: normalizedText,
            updatedByAdminId: data.createdByAdminId,
            createdAt: now,
            updatedAt: now,
        });
    }

    /**
     * Get all notes for a specific record
     */
    async getNotesForRecord(recordType: string, recordId: number): Promise<AdminNotes[]> {
        const allowedRecordTypes = ['user', 'listing', 'wanted_listing', 'offer', 'haulage_offer', 'sample', 'mfi'];
        if (!allowedRecordTypes.includes(recordType)) {
            throw new HttpErrors.BadRequest(`Invalid record type: ${recordType}`);
        }

        return this.adminNotesRepository.find({
            where: {
                recordType,
                recordId,
            },
            include: [{ relation: 'createdByAdmin' }, { relation: 'updatedByAdmin' }],
            order: ['updatedAt DESC', 'id DESC'],
        });
    }

    /**
     * Update an existing note
     */
    async updateNote(id: number, noteText: string, updatedByAdminId: number): Promise<void> {
        const note = await this.adminNotesRepository.findById(id);
        if (!note) {
            throw new HttpErrors.NotFound(`Note with id ${id} not found`);
        }

        await this.adminNotesRepository.updateById(id, {
            noteText: noteText.trim(),
            updatedByAdminId,
            updatedAt: new Date().toISOString(),
        });
    }

    /**
     * Delete a note
     */
    async deleteNote(id: number): Promise<void> {
        await this.adminNotesRepository.deleteById(id);
    }

    /**
     * Get a single note by ID
     */
    async getNoteById(id: number): Promise<AdminNotes> {
        return this.adminNotesRepository.findById(id, {
            include: [{ relation: 'createdByAdmin' }, { relation: 'updatedByAdmin' }],
        });
    }
}
