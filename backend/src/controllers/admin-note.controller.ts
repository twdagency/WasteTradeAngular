import { authenticate } from '@loopback/authentication';
import { inject, service } from '@loopback/core';
import { repository } from '@loopback/repository';
import { get, param, post, requestBody } from '@loopback/rest';
import { SecurityBindings } from '@loopback/security';
import { MyUserProfile } from '../authentication-strategies/type';
import { AdminNoteDataType } from '../enum';
import { AdminNote } from '../models';
import { UserRepository } from '../repositories';
import { AdminNoteService } from '../services';
import { IDataResponse } from '../types';

export class AdminNoteController {
    constructor(
        @service(AdminNoteService)
        public adminNoteService: AdminNoteService,
        @repository(UserRepository)
        public userRepository: UserRepository,
    ) {}

    @post('/admin-notes')
    @authenticate('jwt')
    async createOrUpdateNote(
        @inject(SecurityBindings.USER) currentUser: MyUserProfile,
        @requestBody({
            content: {
                'application/json': {
                    schema: {
                        type: 'object',
                        required: ['dataId', 'dataType', 'value'],
                        properties: {
                            dataId: {
                                type: 'number',
                                description: 'ID of the object to add/update note',
                            },
                            dataType: {
                                type: 'string',
                                enum: Object.values(AdminNoteDataType),
                                description: 'Type of the data object',
                            },
                            value: {
                                type: 'string',
                                description: 'Note content',
                            },
                        },
                    },
                },
            },
        })
        data: {
            dataId: number;
            dataType: AdminNoteDataType;
            value: string;
        },
    ): Promise<AdminNote> {
        return this.adminNoteService.createOrUpdateNote(data, currentUser);
    }

    @get('/admin-notes/{dataType}/{dataId}')
    @authenticate('jwt')
    async getAdminNoteDetail(
        @inject(SecurityBindings.USER) currentUser: MyUserProfile,
        @param.path.string('dataType') dataType: AdminNoteDataType,
        @param.path.number('dataId') dataId: number,
    ): Promise<
        IDataResponse<{
            value: string;
            updatedAt: Date;
            updatedBy: { id: number; firstName: string; lastName: string; email: string; role: string } | null;
        } | null>
    > {
        return this.adminNoteService.getAdminNoteDetail(dataId, dataType, currentUser);
    }
}
