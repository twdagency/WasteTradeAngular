import { repository } from '@loopback/repository';
import { param, get, getModelSchemaRef } from '@loopback/rest';
import { MaterialUsers, Materials } from '../models';
import { MaterialUsersRepository } from '../repositories';

export class MaterialUsersMaterialsController {
    constructor(
        @repository(MaterialUsersRepository)
        public materialUsersRepository: MaterialUsersRepository,
    ) {}

    @get('/material-users/{id}/materials', {
        responses: {
            '200': {
                description: 'Materials belonging to MaterialUsers',
                content: {
                    'application/json': {
                        schema: getModelSchemaRef(Materials),
                    },
                },
            },
        },
    })
    async getMaterials(@param.path.number('id') id: typeof MaterialUsers.prototype.id): Promise<Materials> {
        return this.materialUsersRepository.material(id);
    }
}
