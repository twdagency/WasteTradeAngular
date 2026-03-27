import { model, property } from '@loopback/repository';
import { Base } from '.';

@model()
export class File extends Base {
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
        jsonSchema: { nullable: false },
        postgresql: { columnName: 'file_name', dataType: 'character varying', dataLength: 255 },
    })
    fileName: string;

    @property({
        type: 'string',
        required: true,
        jsonSchema: { nullable: false },
        postgresql: { columnName: 'origin_file_name', dataType: 'character varying', dataLength: 255 },
    })
    originalFileName: string;

    @property({
        type: 'string',
        required: true,
        jsonSchema: { nullable: false },
        postgresql: { columnName: 'file_url', dataType: 'character varying', dataLength: 1024 },
    })
    fileUrl: string;

    constructor(data?: Partial<File>) {
        super(data);
    }
}

export interface FileRelations {
    // describe navigational properties here
}

export type FileWithRelations = File & FileRelations;
