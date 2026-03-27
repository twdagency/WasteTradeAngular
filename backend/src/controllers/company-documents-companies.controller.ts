import { repository } from '@loopback/repository';
import { param, get, getModelSchemaRef } from '@loopback/rest';
import { CompanyDocuments, Companies } from '../models';
import { CompanyDocumentsRepository } from '../repositories';
import { authenticate } from '@loopback/authentication';

@authenticate('jwt')
export class CompanyDocumentsCompaniesController {
    constructor(
        @repository(CompanyDocumentsRepository)
        public companyDocumentsRepository: CompanyDocumentsRepository,
    ) {}

    @get('/company-documents/{id}/companies', {
        responses: {
            '200': {
                description: 'Companies belonging to CompanyDocuments',
                content: {
                    'application/json': {
                        schema: getModelSchemaRef(Companies),
                    },
                },
            },
        },
    })
    async getCompanies(@param.path.number('id') id: typeof CompanyDocuments.prototype.id): Promise<Companies> {
        return this.companyDocumentsRepository.company(id);
    }
}
