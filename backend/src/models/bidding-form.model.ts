import { Entity, model, property } from '@loopback/repository';
import { ECurrency } from '../enum';

@model()
export class BiddingForm extends Entity {
    @property({
        type: 'number',
        required: true,
    })
    listingId: number;

    @property({
        type: 'string',
        required: true,
    })
    listingType: string;

    @property({
        type: 'number',
        required: true,
    })
    companyId: number;

    @property({
        type: 'number',
        required: true,
    })
    locationId: number;

    @property({
        type: 'number',
        required: true,
    })
    createdByUserId: number;

    @property({
        type: 'number',
        required: true,
    })
    quantity: number;

    @property({
        type: 'number',
        required: true,
    })
    offeredPricePerUnit: number;

    @property({
        type: 'string',
        required: true,
        jsonSchema: { enum: Object.values(ECurrency) },
    })
    currency: ECurrency;

    @property({
        type: 'string',
        required: true,
    })
    incoterms: string;

    @property({
        type: 'string',
        required: false,
    })
    shippingPort: string;

    @property({
        type: 'string',
        required: true,
    })
    earliestDeliveryDate: string;

    @property({
        type: 'string',
        required: true,
    })
    latestDeliveryDate: string;

    @property({
        type: 'string',
        required: true,
    })
    expiresAt: string;
}
