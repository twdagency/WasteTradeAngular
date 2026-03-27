import { authenticate } from '@loopback/authentication';
import { inject, service } from '@loopback/core';
import { post, Request, requestBody, Response, RestBindings } from '@loopback/rest';
import { File } from '../models';
import { S3WrapperService } from '../services';

export class UploadFileController {
    constructor(
        @service(S3WrapperService)
        private s3WrapperService: S3WrapperService,
    ) {}

    @authenticate('jwt')
    @post('/upload-file', {
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                        },
                    },
                },
                description: 'Uploaded image url',
            },
        },
    })
    async uploadDocs(
        @requestBody.file()
        request: Request,
        @inject(RestBindings.Http.RESPONSE) response: Response,
    ): Promise<String> {
        const createdFile: File = await this.s3WrapperService.uploadSingleFile(request, response).catch((error) => {
            throw error;
        });
        return createdFile.fileUrl;
    }

    @authenticate('jwt')
    @post('/upload-multiple-files', {
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                        },
                    },
                },
                description: 'Uploaded company docs url',
            },
        },
    })
    async uploadMultipleDocs(
        @inject(RestBindings.Http.REQUEST) request: Request,
        @inject(RestBindings.Http.RESPONSE) response: Response,
    ): Promise<String[]> {
        const createdFiles: File[] = await this.s3WrapperService
            .uploadMultipleFiles(request, response)
            .catch((error) => {
                throw error;
            });
        return createdFiles.map((file) => file.fileUrl);
    }

    @post('/upload-file-haulier', {
        responses: {
            200: {
                content: {
                    'application/json': {
                        schema: {
                            type: 'object',
                        },
                    },
                },
                description: 'Uploaded docs url',
            },
        },
    })
    async uploadDocsHaulier(
        @inject(RestBindings.Http.REQUEST) request: Request,
        @inject(RestBindings.Http.RESPONSE) response: Response,
    ): Promise<String[]> {
        const createdFiles: File[] = await this.s3WrapperService
            .uploadMultipleFiles(request, response)
            .catch((error) => {
                throw error;
            });
        return createdFiles.map((file) => file.fileUrl);
    }
}
