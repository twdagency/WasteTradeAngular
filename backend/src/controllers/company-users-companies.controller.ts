import { repository } from '@loopback/repository';
import { param, get, getModelSchemaRef } from '@loopback/rest';
import { CompanyUsers, Companies } from '../models';
import { CompanyUsersRepository } from '../repositories';
import { authenticate } from '@loopback/authentication';

@authenticate('jwt')
export class CompanyUsersCompaniesController {
    constructor(
        @repository(CompanyUsersRepository)
        public companyUsersRepository: CompanyUsersRepository,
    ) {}

    @get('/company-users/{id}/companies', {
        responses: {
            '200': {
                description: 'Companies belonging to CompanyUsers',
                content: {
                    'application/json': {
                        schema: getModelSchemaRef(Companies),
                    },
                },
            },
        },
    })
    async getCompanies(@param.path.number('id') id: typeof CompanyUsers.prototype.id): Promise<Companies> {
        return this.companyUsersRepository.company(id);
    }
}
