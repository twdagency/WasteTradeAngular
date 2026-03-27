import { model, property } from '@loopback/repository';
import { TransportProvider, ExpectedTransitTime, ECurrency } from '../enum';

@model()
export class CreateHaulageOffer {
    @property({
        type: 'number',
        required: true,
    })
    offerId: number;

    @property({
        type: 'string',
        required: true,
    })
    trailerContainerType: string;

    @property({
        type: 'boolean',
        default: false,
    })
    completingCustomsClearance?: boolean;

    @property({
        type: 'number',
        required: true,
    })
    haulageCostPerLoad: number;

    @property({
        type: 'number',
        description: 'Quantity per load (e.g., weight per load) provided by haulier',
    })
    quantityPerLoad?: number;

    @property({
        type: 'string',
        required: true,
        jsonSchema: {
            enum: Object.values(ECurrency),
        },
    })
    currency: ECurrency;

    @property({
        type: 'string',
        required: true,
        jsonSchema: {
            enum: Object.values(TransportProvider),
        },
    })
    transportProvider: TransportProvider;

    @property({
        type: 'date',
        required: true,
    })
    suggestedCollectionDate: Date;

    @property({
        type: 'string',
        required: true,
        jsonSchema: {
            enum: Object.values(ExpectedTransitTime),
        },
    })
    expectedTransitTime: ExpectedTransitTime;

    @property({
        type: 'number',
        required: true,
    })
    demurrageAtDestination: number;

    @property({
        type: 'string',
    })
    notes?: string;

    @property({
        type: 'number',
        description: 'Optional: Company admin can select which haulier user in their company creates the offer',
    })
    haulierUserId?: number;

    constructor(data?: Partial<CreateHaulageOffer>) {
        Object.assign(this, data);
    }
}
