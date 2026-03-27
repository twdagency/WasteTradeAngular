import { model, property } from '@loopback/repository';
import { Listings } from './listings.model';

@model()
export class CreateListing extends Listings {
    @property({
        type: 'array',
        itemType: 'object',
        required: true,
        postgresql: false,
        jsonSchema: {
            items: {
                type: 'object',
                properties: {
                    documentType: { type: 'string' },
                    documentUrl: { type: 'string' },
                },
                required: ['documentType', 'documentUrl'],
            },
        },
    })
    documents: Array<{
        documentType: string;
        documentUrl: string;
    }>;

    constructor(data?: Partial<CreateListing>) {
        super(data);
    }
}
