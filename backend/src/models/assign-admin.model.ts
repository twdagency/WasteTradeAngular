import { Model, model, property } from '@loopback/repository';
import { User } from './user.model';

@model()
export class AssignAdmin {
    @property({
        type: 'number',
        jsonSchema: { nullable: true },
    })
    assignedAdminId?: number;

    @property({
        type: 'number',
        jsonSchema: { nullable: true },
    })
    assignedBy?: number | Partial<User>;

    @property({
        type: 'date',
        jsonSchema: { nullable: true },
    })
    assignedAt?: Date;

    assignedAdmin?: Partial<User>;
}
