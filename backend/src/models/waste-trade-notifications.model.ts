import { model, property, belongsTo } from '@loopback/repository';
import { Base } from './base.model';
import { User } from './user.model';
import { NotificationType } from '../enum';

@model({
    settings: { idInjection: false, postgresql: { schema: 'public', table: 'waste_trade_notifications' } },
})
export class WasteTradeNotifications extends Base {
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
        jsonSchema: {
            nullable: false,
            enum: Object.values(NotificationType),
            description: 'Type of notification',
        },
        postgresql: { columnName: 'type', dataType: 'character varying', dataLength: 50, nullable: 'NO' },
    })
    type: NotificationType;

    @property({
        type: 'object',
        required: true,
        jsonSchema: { nullable: false },
        postgresql: { columnName: 'data', dataType: 'jsonb', nullable: 'NO' },
    })
    data: object;

    @property({
        type: 'boolean',
        required: true,
        default: false,
        jsonSchema: { nullable: false },
        postgresql: { columnName: 'is_read', dataType: 'boolean', nullable: 'NO' },
    })
    isRead: boolean;

    @property({
        type: 'date',
        jsonSchema: { nullable: true },
        postgresql: { columnName: 'read_at', dataType: 'timestamp without time zone', nullable: 'YES' },
    })
    readAt?: Date | null;

    @belongsTo(
        () => User,
        {
            keyFrom: 'userId',
            keyTo: 'id',
        },
        {
            postgresql: {
                columnName: 'user_id',
                dataType: 'integer',
                nullable: 'YES',
            },
        },
    )
    userId: number;

    constructor(data?: Partial<WasteTradeNotifications>) {
        super(data);
    }
}

export interface WasteTradeNotificationsRelations {
    user?: User;
}

export type WasteTradeNotificationsWithRelations = WasteTradeNotifications & WasteTradeNotificationsRelations;
