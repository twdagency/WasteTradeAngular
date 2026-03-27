import { Entity, model, property, belongsTo } from '@loopback/repository';
import { Materials } from './materials.model';
import { User } from './user.model';

@model({
    settings: { idInjection: false, postgresql: { schema: 'public', table: 'material_users' } },
})
export class MaterialUsers extends Entity {
    @property({
        type: 'number',
        id: true,
        generated: true,
        jsonSchema: { nullable: false },
        postgresql: { columnName: 'id', dataType: 'integer', nullable: 'NO' },
    })
    id?: number;

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

    @belongsTo(() => Materials, {}, {postgresql: {columnName: 'material_id'}})
    materialId: number;

    @belongsTo(() => User, {}, {postgresql: {columnName: 'user_id'}})
    userId: number;

    constructor(data?: Partial<MaterialUsers>) {
        super(data);
    }
}

export interface MaterialUsersRelations {
    // describe navigational properties here
}

export type MaterialUsersWithRelations = MaterialUsers & MaterialUsersRelations;
