import { model, property } from '@loopback/repository';
import { UrlTypeEnum } from '../enum';

@model({
    name: 'Reset Password Request',
})
export class ResetPasswordRequest {
    @property({
        type: 'string',
        required: true,
    })
    newPassword: string;

    @property({
        type: 'string',
        required: true,
    })
    confirmNewPassword: string;

    @property({
        type: 'string',
        required: true,
    })
    resetPasswordToken: string;

    @property({
        type: 'string',
        required: false,
    })
    urlType?: UrlTypeEnum;
}

export interface IResetPasswordRequestRelations {
    // describe navigational properties here
}

export type ResetPasswordRequestWithRelations = ResetPasswordRequest & IResetPasswordRequestRelations;
