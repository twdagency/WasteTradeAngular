import { Count, CountSchema, Filter, FilterExcludingWhere, repository, Where } from '@loopback/repository';
import { post, param, get, getModelSchemaRef, patch, put, del, requestBody, response } from '@loopback/rest';
import { MaterialUsers } from '../models';
import { MaterialUsersRepository } from '../repositories';

export class MaterialUsersController {
    constructor(
        @repository(MaterialUsersRepository)
        public materialUsersRepository: MaterialUsersRepository,
    ) {}

    @post('/material-users')
    @response(200, {
        description: 'MaterialUsers model instance',
        content: { 'application/json': { schema: getModelSchemaRef(MaterialUsers) } },
    })
    async create(
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(MaterialUsers, {
                        title: 'NewMaterialUsers',
                        exclude: ['id'],
                    }),
                },
            },
        })
        materialUsers: Omit<MaterialUsers, 'id'>,
    ): Promise<MaterialUsers> {
        return this.materialUsersRepository.create(materialUsers);
    }

    @get('/material-users/count')
    @response(200, {
        description: 'MaterialUsers model count',
        content: { 'application/json': { schema: CountSchema } },
    })
    async count(@param.where(MaterialUsers) where?: Where<MaterialUsers>): Promise<Count> {
        return this.materialUsersRepository.count(where);
    }

    @get('/material-users')
    @response(200, {
        description: 'Array of MaterialUsers model instances',
        content: {
            'application/json': {
                schema: {
                    type: 'array',
                    items: getModelSchemaRef(MaterialUsers, { includeRelations: true }),
                },
            },
        },
    })
    async find(@param.filter(MaterialUsers) filter?: Filter<MaterialUsers>): Promise<MaterialUsers[]> {
        return this.materialUsersRepository.find(filter);
    }

    @patch('/material-users')
    @response(200, {
        description: 'MaterialUsers PATCH success count',
        content: { 'application/json': { schema: CountSchema } },
    })
    async updateAll(
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(MaterialUsers, { partial: true }),
                },
            },
        })
        materialUsers: MaterialUsers,
        @param.where(MaterialUsers) where?: Where<MaterialUsers>,
    ): Promise<Count> {
        return this.materialUsersRepository.updateAll(materialUsers, where);
    }

    @get('/material-users/{id}')
    @response(200, {
        description: 'MaterialUsers model instance',
        content: {
            'application/json': {
                schema: getModelSchemaRef(MaterialUsers, { includeRelations: true }),
            },
        },
    })
    async findById(
        @param.path.number('id') id: number,
        @param.filter(MaterialUsers, { exclude: 'where' }) filter?: FilterExcludingWhere<MaterialUsers>,
    ): Promise<MaterialUsers> {
        return this.materialUsersRepository.findById(id, filter);
    }

    @patch('/material-users/{id}')
    @response(204, {
        description: 'MaterialUsers PATCH success',
    })
    async updateById(
        @param.path.number('id') id: number,
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(MaterialUsers, { partial: true }),
                },
            },
        })
        materialUsers: MaterialUsers,
    ): Promise<void> {
        await this.materialUsersRepository.updateById(id, materialUsers);
    }

    @put('/material-users/{id}')
    @response(204, {
        description: 'MaterialUsers PUT success',
    })
    async replaceById(@param.path.number('id') id: number, @requestBody() materialUsers: MaterialUsers): Promise<void> {
        await this.materialUsersRepository.replaceById(id, materialUsers);
    }

    @del('/material-users/{id}')
    @response(204, {
        description: 'MaterialUsers DELETE success',
    })
    async deleteById(@param.path.number('id') id: number): Promise<void> {
        await this.materialUsersRepository.deleteById(id);
    }
}
