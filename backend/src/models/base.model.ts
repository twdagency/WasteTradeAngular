import { Entity, property } from '@loopback/repository';

export class Base extends Entity {
    @property({
        type: 'date',
        default: () => new Date(),
        postgresql: {
            columnName: 'created_at',
            dataType: 'timestamp with time zone',
            nullable: 'YES',
        },
    })
    createdAt?: Date;

    @property({
        type: 'date',
        default: () => new Date(),
        postgresql: {
            columnName: 'updated_at',
            dataType: 'timestamp with time zone',
            nullable: 'YES',
        },
    })
    updatedAt?: Date;

    constructor(data?: Partial<Base>) {
        super(data);
    }
}

export interface BaseRelations {
    // describe navigational properties here
}

export type BaseWithRelations = Base;
