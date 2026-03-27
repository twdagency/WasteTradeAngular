import { Entity, model, property } from '@loopback/repository';

@model({
    settings: { idInjection: false, postgresql: { schema: 'public', table: 'messages' } },
})
export class Messages extends Entity {
    @property({
        type: 'number',
        required: true,
        jsonSchema: { nullable: false },
        id: 1,
        postgresql: { columnName: 'id', dataType: 'integer', nullable: 'NO' },
    })
    id: number;

    @property({
        type: 'number',
        required: true,
        jsonSchema: { nullable: false },
        postgresql: { columnName: 'conversation_id', dataType: 'integer', nullable: 'NO' },
    })
    conversationId: number;

    @property({
        type: 'number',
        required: true,
        jsonSchema: { nullable: false },
        postgresql: { columnName: 'sender_id', dataType: 'integer', nullable: 'NO' },
    })
    senderId: number;

    @property({
        type: 'number',
        required: true,
        jsonSchema: { nullable: false },
        postgresql: { columnName: 'sender_company_id', dataType: 'integer', nullable: 'NO' },
    })
    senderCompanyId: number;

    @property({
        type: 'string',
        required: true,
        jsonSchema: { nullable: false },
        postgresql: { columnName: 'message_content', dataType: 'text', nullable: 'NO' },
    })
    messageContent: string;

    @property({
        type: 'string',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'attachments', dataType: 'jsonb', nullable: 'YES' },
    })
    attachments?: string;

    @property({
        type: 'boolean',
        required: true,
        jsonSchema: { nullable: false },
        postgresql: { columnName: 'is_system_message', dataType: 'boolean', nullable: 'NO' },
    })
    isSystemMessage: boolean;

    @property({
        type: 'date',
        required: true,
        jsonSchema: { nullable: false },
        postgresql: { columnName: 'created_at', dataType: 'timestamp without time zone', nullable: 'NO' },
    })
    createdAt: string;

    // Define well-known properties here

    constructor(data?: Partial<Messages>) {
        super(data);
    }
}

export interface MessagesRelations {
    // describe navigational properties here
}

export type MessagesWithRelations = Messages & MessagesRelations;
