import { Entity, model, property } from '@loopback/repository';

@model({
    settings: { idInjection: false, postgresql: { schema: 'public', table: 'materials' } },
})
export class Materials extends Entity {
    @property({
        type: 'number',
        required: true,
        jsonSchema: { nullable: false },
        id: 1,
        postgresql: { columnName: 'id', dataType: 'integer', nullable: 'NO' },
    })
    id: number;

    @property({
        type: 'number',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'parent_id', dataType: 'integer', nullable: 'YES' },
    })
    parentId?: number;

    @property({
        type: 'number',
        required: true,
        jsonSchema: { nullable: false },
        postgresql: { columnName: 'created_by_user_id', dataType: 'integer', nullable: 'NO' },
    })
    createdByUserId: number;

    @property({
        type: 'string',
        required: true,
        jsonSchema: { nullable: false },
        length: 100,
        postgresql: { columnName: 'name', dataType: 'character varying', dataLength: 100, nullable: 'NO' },
    })
    name: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'description', dataType: 'text', nullable: 'YES' },
    })
    description?: string;

    @property({
        type: 'boolean',
        required: true,
        jsonSchema: { nullable: false },
        postgresql: { columnName: 'is_custom', dataType: 'boolean', nullable: 'NO' },
    })
    isCustom: boolean;

    @property({
        type: 'boolean',
        required: true,
        jsonSchema: { nullable: false },
        postgresql: { columnName: 'is_active', dataType: 'boolean', nullable: 'NO' },
    })
    isActive: boolean;

    @property({
        type: 'date',
        required: true,
        jsonSchema: { nullable: false },
        postgresql: { columnName: 'created_at', dataType: 'timestamp without time zone', nullable: 'NO' },
    })
    createdAt: string;

    @property({
        type: 'date',
        required: true,
        jsonSchema: { nullable: false },
        postgresql: { columnName: 'updated_at', dataType: 'timestamp without time zone', nullable: 'NO' },
    })
    updatedAt: string;

    // Define well-known properties here

    constructor(data?: Partial<Materials>) {
        super(data);
    }
}

export interface MaterialsRelations {
    // describe navigational properties here
}

export type MaterialsWithRelations = Materials & MaterialsRelations;
