import { Entity, model, property } from '@loopback/repository';
@model()
export class OnboardingCompanyDocs extends Entity {
    @property({
        type: 'array',
        itemType: 'object',
        required: true,
        jsonSchema: {
            items: {
                type: 'object',
                properties: {
                    documentType: { type: 'string' },
                    documentUrl: { type: 'string' },
                    expiryDate: { type: 'string' },
                },
                required: ['documentType', 'documentUrl'],
            },
        },
    })
    documents: Array<{
        documentType: string;
        documentUrl: string;
        expiryDate?: string;
    }>;

    @property({
        type: 'boolean',
        jsonSchema: { nullable: true },
    })
    boxClearingAgent: boolean;
}
