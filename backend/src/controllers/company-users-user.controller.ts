import { repository } from '@loopback/repository';
import { param, get, getModelSchemaRef } from '@loopback/rest';
import { CompanyUsers, User } from '../models';
import { CompanyUsersRepository } from '../repositories';
import { authenticate } from '@loopback/authentication';

@authenticate('jwt')
export class CompanyUsersUserController {
    constructor(
        @repository(CompanyUsersRepository)
        public companyUsersRepository: CompanyUsersRepository,
    ) {}

    @get('/company-users/{id}/user', {
        responses: {
            '200': {
                description: 'User belonging to CompanyUsers',
                content: {
                    'application/json': {
                        schema: getModelSchemaRef(User),
                    },
                },
            },
        },
    })
    async getUser(@param.path.number('id') id: typeof CompanyUsers.prototype.id): Promise<User> {
        return this.companyUsersRepository.user(id);
    }
}
