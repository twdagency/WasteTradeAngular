import { repository } from '@loopback/repository';
import { param, get, getModelSchemaRef } from '@loopback/rest';
import { MaterialUsers, User } from '../models';
import { MaterialUsersRepository } from '../repositories';

export class MaterialUsersUserController {
    constructor(
        @repository(MaterialUsersRepository)
        public materialUsersRepository: MaterialUsersRepository,
    ) {}

    @get('/material-users/{id}/user', {
        responses: {
            '200': {
                description: 'User belonging to MaterialUsers',
                content: {
                    'application/json': {
                        schema: getModelSchemaRef(User),
                    },
                },
            },
        },
    })
    async getUser(@param.path.number('id') id: typeof MaterialUsers.prototype.id): Promise<User> {
        return this.materialUsersRepository.user(id);
    }
}
