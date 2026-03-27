import { model, property } from '@loopback/repository';
import { User } from './user.model';

@model()
export class AdminNote {
    @property({
        type: 'string',
        jsonSchema: { nullable: true },
    })
    value?: string;

    @property({
        type: 'number',
        jsonSchema: { nullable: true },
    })
    updatedBy?: number | User;

    @property({
        type: 'date',
        jsonSchema: { nullable: true },
    })
    updatedAt?: Date;
}
