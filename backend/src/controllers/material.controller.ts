import { Count, CountSchema, Filter, FilterExcludingWhere, repository, Where } from '@loopback/repository';
import { post, param, get, getModelSchemaRef, patch, put, del, requestBody, response } from '@loopback/rest';
import { Materials } from '../models';
import { MaterialsRepository } from '../repositories';
import { authenticate } from '@loopback/authentication';

@authenticate('jwt')
export class MaterialController {
    constructor(
        @repository(MaterialsRepository)
        public materialsRepository: MaterialsRepository,
    ) {}

    @post('/materials')
    @response(200, {
        description: 'Materials model instance',
        content: { 'application/json': { schema: getModelSchemaRef(Materials) } },
    })
    async create(
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(Materials, {
                        title: 'NewMaterials',
                        exclude: ['id'],
                    }),
                },
            },
        })
        materials: Omit<Materials, 'id'>,
    ): Promise<Materials> {
        return this.materialsRepository.create(materials);
    }

    @get('/materials/count')
    @response(200, {
        description: 'Materials model count',
        content: { 'application/json': { schema: CountSchema } },
    })
    async count(@param.where(Materials) where?: Where<Materials>): Promise<Count> {
        return this.materialsRepository.count(where);
    }

    @get('/materials')
    @response(200, {
        description: 'Array of Materials model instances',
        content: {
            'application/json': {
                schema: {
                    type: 'array',
                    items: getModelSchemaRef(Materials, { includeRelations: true }),
                },
            },
        },
    })
    async find(@param.filter(Materials) filter?: Filter<Materials>): Promise<Materials[]> {
        return this.materialsRepository.find(filter);
    }

    @patch('/materials')
    @response(200, {
        description: 'Materials PATCH success count',
        content: { 'application/json': { schema: CountSchema } },
    })
    async updateAll(
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(Materials, { partial: true }),
                },
            },
        })
        materials: Materials,
        @param.where(Materials) where?: Where<Materials>,
    ): Promise<Count> {
        return this.materialsRepository.updateAll(materials, where);
    }

    @get('/materials/{id}')
    @response(200, {
        description: 'Materials model instance',
        content: {
            'application/json': {
                schema: getModelSchemaRef(Materials, { includeRelations: true }),
            },
        },
    })
    async findById(
        @param.path.number('id') id: number,
        @param.filter(Materials, { exclude: 'where' }) filter?: FilterExcludingWhere<Materials>,
    ): Promise<Materials> {
        return this.materialsRepository.findById(id, filter);
    }

    @patch('/materials/{id}')
    @response(204, {
        description: 'Materials PATCH success',
    })
    async updateById(
        @param.path.number('id') id: number,
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(Materials, { partial: true }),
                },
            },
        })
        materials: Materials,
    ): Promise<void> {
        await this.materialsRepository.updateById(id, materials);
    }

    @put('/materials/{id}')
    @response(204, {
        description: 'Materials PUT success',
    })
    async replaceById(@param.path.number('id') id: number, @requestBody() materials: Materials): Promise<void> {
        await this.materialsRepository.replaceById(id, materials);
    }

    @del('/materials/{id}')
    @response(204, {
        description: 'Materials DELETE success',
    })
    async deleteById(@param.path.number('id') id: number): Promise<void> {
        await this.materialsRepository.deleteById(id);
    }
}
