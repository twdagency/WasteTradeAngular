import { Count, CountSchema, Filter, FilterExcludingWhere, repository, Where } from '@loopback/repository';
import { post, param, get, getModelSchemaRef, patch, put, del, requestBody, response } from '@loopback/rest';
import { File } from '../models';
import { FileRepository } from '../repositories';
import { authenticate } from '@loopback/authentication';

@authenticate('jwt')
export class FileController {
    constructor(
        @repository(FileRepository)
        public fileRepository: FileRepository,
    ) {}

    @post('/files')
    @response(200, {
        description: 'File model instance',
        content: { 'application/json': { schema: getModelSchemaRef(File) } },
    })
    async create(
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(File, {
                        title: 'NewFile',
                        exclude: ['id'],
                    }),
                },
            },
        })
        file: Omit<File, 'id'>,
    ): Promise<File> {
        return this.fileRepository.create(file);
    }

    @get('/files/count')
    @response(200, {
        description: 'File model count',
        content: { 'application/json': { schema: CountSchema } },
    })
    async count(@param.where(File) where?: Where<File>): Promise<Count> {
        return this.fileRepository.count(where);
    }

    @get('/files')
    @response(200, {
        description: 'Array of File model instances',
        content: {
            'application/json': {
                schema: {
                    type: 'array',
                    items: getModelSchemaRef(File, { includeRelations: true }),
                },
            },
        },
    })
    async find(@param.filter(File) filter?: Filter<File>): Promise<File[]> {
        return this.fileRepository.find(filter);
    }

    @patch('/files')
    @response(200, {
        description: 'File PATCH success count',
        content: { 'application/json': { schema: CountSchema } },
    })
    async updateAll(
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(File, { partial: true }),
                },
            },
        })
        file: File,
        @param.where(File) where?: Where<File>,
    ): Promise<Count> {
        return this.fileRepository.updateAll(file, where);
    }

    @get('/files/{id}')
    @response(200, {
        description: 'File model instance',
        content: {
            'application/json': {
                schema: getModelSchemaRef(File, { includeRelations: true }),
            },
        },
    })
    async findById(
        @param.path.number('id') id: number,
        @param.filter(File, { exclude: 'where' }) filter?: FilterExcludingWhere<File>,
    ): Promise<File> {
        return this.fileRepository.findById(id, filter);
    }

    @patch('/files/{id}')
    @response(204, {
        description: 'File PATCH success',
    })
    async updateById(
        @param.path.number('id') id: number,
        @requestBody({
            content: {
                'application/json': {
                    schema: getModelSchemaRef(File, { partial: true }),
                },
            },
        })
        file: File,
    ): Promise<void> {
        await this.fileRepository.updateById(id, file);
    }

    @put('/files/{id}')
    @response(204, {
        description: 'File PUT success',
    })
    async replaceById(@param.path.number('id') id: number, @requestBody() file: File): Promise<void> {
        await this.fileRepository.replaceById(id, file);
    }

    @del('/files/{id}')
    @response(204, {
        description: 'File DELETE success',
    })
    async deleteById(@param.path.number('id') id: number): Promise<void> {
        await this.fileRepository.deleteById(id);
    }
}
