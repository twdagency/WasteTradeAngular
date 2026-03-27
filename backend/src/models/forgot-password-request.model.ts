import { model, property } from '@loopback/repository';

@model({
    name: 'Forgot Password Request',
})
export class ForgotPasswordRequest {
    @property({
        type: 'string',
        required: true,
    })
    email: string;
}

export interface IForgotPasswordRequestRelations {
    // describe navigational properties here
}

export type ForgotPasswordRequestWithRelations = ForgotPasswordRequest & IForgotPasswordRequestRelations;
