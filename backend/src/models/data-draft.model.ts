import { model, property } from '@loopback/repository';
import { DataDraftTypeEnum } from '../enum';
import { Base } from './base.model';

@model({
    settings: { idInjection: false, postgresql: { schema: 'public', table: 'data_drafts' } },
})
export class DataDraft extends Base {
    @property({
        type: 'number',
        generated: true,
        jsonSchema: { nullable: false },
        id: true,
        postgresql: { columnName: 'id', dataType: 'integer', nullable: 'NO' },
    })
    id?: number;

    @property({
        type: 'string',
        required: true,
        jsonSchema: {
            nullable: false,
            enum: Object.values(DataDraftTypeEnum),
            description: 'Type of data draft',
        },
        length: 50,
        postgresql: { columnName: 'type', dataType: 'character varying', dataLength: 50, nullable: 'NO' },
    })
    type: DataDraftTypeEnum;

    @property({
        type: 'string',
        required: true,
        jsonSchema: { nullable: false, description: 'Stringified JSON data of the draft' },
        postgresql: { columnName: 'data', dataType: 'text', nullable: 'NO' },
    })
    data: string;

    @property({
        type: 'string',
        required: false,
        jsonSchema: { nullable: false },
        postgresql: { columnName: 'email', dataType: 'character varying', dataLength: 255, nullable: 'YES' },
    })
    email: string;

    @property({
        type: 'string',
        required: false,
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'secret', dataType: 'character varying', dataLength: 255, nullable: 'YES' },
    })
    secret: string;

    constructor(data?: Partial<DataDraft>) {
        super(data);
    }
}

export interface DataDraftRelations {
    // describe navigational properties here
}

export type DataDraftWithRelations = DataDraft & DataDraftRelations;
