import { Entity, model, property, belongsTo } from '@loopback/repository';
import { User } from './user.model';

@model({
    settings: {
        idInjection: false,
        postgresql: { schema: 'public', table: 'admin_notes' },
    },
})
export class AdminNotes extends Entity {
    @property({
        type: 'number',
        id: true,
        generated: true,
        postgresql: { columnName: 'id', dataType: 'integer', nullable: 'NO' },
    })
    id?: number;

    @property({
        type: 'string',
        required: true,
        length: 50,
        postgresql: { columnName: 'record_type', dataType: 'character varying', dataLength: 50, nullable: 'NO' },
    })
    recordType: string; // 'user', 'listing', 'offer', 'haulage_offer', 'sample', 'mfi'

    @property({
        type: 'number',
        required: true,
        postgresql: { columnName: 'record_id', dataType: 'integer', nullable: 'NO' },
    })
    recordId: number;

    @property({
        type: 'string',
        required: true,
        postgresql: { columnName: 'note_text', dataType: 'text', nullable: 'NO' },
    })
    noteText: string;

    @belongsTo(
        () => User,
        { name: 'createdByAdmin' },
        {
            postgresql: {
                columnName: 'created_by_admin_id',
                dataType: 'integer',
                nullable: 'NO',
            },
        },
    )
    createdByAdminId: number;

    @belongsTo(
        () => User,
        { name: 'updatedByAdmin' },
        {
            postgresql: {
                columnName: 'updated_by_admin_id',
                dataType: 'integer',
                nullable: 'YES',
            },
        },
    )
    updatedByAdminId?: number;

    @property({
        type: 'date',
        required: true,
        postgresql: { columnName: 'created_at', dataType: 'timestamp without time zone', nullable: 'NO' },
    })
    createdAt: string;

    @property({
        type: 'date',
        required: true,
        postgresql: { columnName: 'updated_at', dataType: 'timestamp without time zone', nullable: 'NO' },
    })
    updatedAt: string;

    constructor(data?: Partial<AdminNotes>) {
        super(data);
    }
}

export interface AdminNotesRelations {
    createdByAdmin?: User;
    updatedByAdmin?: User;
}

export type AdminNotesWithRelations = AdminNotes & AdminNotesRelations;
