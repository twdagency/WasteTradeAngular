import { model, property } from '@loopback/repository';
import { Companies } from './companies.model';

@model({
    name: 'Update Company Request',
})
export class UpdateCompanyRequest extends Companies {
    @property({ type: 'string' })
    otherMaterial: string;
}

export interface IUpdateCompanyRequestRelations {
    // describe navigational properties here
}

export type UpdateCompanyRequestWithRelations = UpdateCompanyRequest & IUpdateCompanyRequestRelations;
