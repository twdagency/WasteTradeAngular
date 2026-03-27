import { repository } from '@loopback/repository';
import { param, get, getModelSchemaRef } from '@loopback/rest';
import { CompanyLocations, Companies } from '../models';
import { CompanyLocationsRepository } from '../repositories';
import { authenticate } from '@loopback/authentication';

@authenticate('jwt')
export class CompanyLocationsCompaniesController {
    constructor(
        @repository(CompanyLocationsRepository)
        public companyLocationsRepository: CompanyLocationsRepository,
    ) {}

    @get('/company-locations/{id}/companies', {
        responses: {
            '200': {
                description: 'Companies belonging to CompanyLocations',
                content: {
                    'application/json': {
                        schema: getModelSchemaRef(Companies),
                    },
                },
            },
        },
    })
    async getCompanies(@param.path.number('id') id: typeof CompanyLocations.prototype.id): Promise<Companies> {
        return this.companyLocationsRepository.company(id);
    }
}
