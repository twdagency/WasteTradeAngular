import { model, property } from '@loopback/repository';
import { HaulageBidAction, HaulageBidRejectionReason } from '../enum';

@model()
export class HaulageBidActionRequest {
    @property({
        type: 'string',
        required: true,
        jsonSchema: {
            enum: Object.values(HaulageBidAction),
        },
    })
    action: HaulageBidAction;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
    })
    message?: string;

    @property({
        type: 'string',
        jsonSchema: {
            nullable: true,
            enum: Object.values(HaulageBidRejectionReason),
        },
    })
    rejectionReason?: HaulageBidRejectionReason;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
    })
    customRejectionReason?: string;

    @property({
        type: 'boolean',
        default: true,
        jsonSchema: { nullable: false },
    })
    sendEmail?: boolean;

    constructor(data?: Partial<HaulageBidActionRequest>) {
        Object.assign(this, data);
    }
}
