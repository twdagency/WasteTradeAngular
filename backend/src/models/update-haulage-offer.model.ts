import { model, property } from '@loopback/repository';
import { TransportProvider, ExpectedTransitTime, ECurrency } from '../enum';

@model()
export class UpdateHaulageOffer {
    @property({
        type: 'string',
    })
    trailerContainerType?: string;

    @property({
        type: 'boolean',
    })
    completingCustomsClearance?: boolean;

    @property({
        type: 'number',
    })
    haulageCostPerLoad?: number;

    @property({
        type: 'number',
        description: 'Quantity per load (e.g., weight per load)',
    })
    quantityPerLoad?: number;

    @property({
        type: 'string',
        jsonSchema: {
            enum: Object.values(ECurrency),
        },
    })
    currency?: ECurrency;

    @property({
        type: 'string',
        jsonSchema: {
            enum: Object.values(TransportProvider),
        },
    })
    transportProvider?: TransportProvider;

    @property({
        type: 'date',
    })
    suggestedCollectionDate?: Date;

    @property({
        type: 'string',
        jsonSchema: {
            enum: Object.values(ExpectedTransitTime),
        },
    })
    expectedTransitTime?: ExpectedTransitTime;

    @property({
        type: 'number',
    })
    demurrageAtDestination?: number;

    @property({
        type: 'string',
    })
    notes?: string;

    constructor(data?: Partial<UpdateHaulageOffer>) {
        Object.assign(this, data);
    }
}
