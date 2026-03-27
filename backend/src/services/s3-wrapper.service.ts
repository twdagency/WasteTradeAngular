import { BindingScope, inject, injectable } from '@loopback/core';
import { repository } from '@loopback/repository';
import { HttpErrors, Request, Response } from '@loopback/rest';
import * as AWS from 'aws-sdk';
import * as mime from 'mime-types';
import multer from 'multer';
import { AWS_S3_BUCKET } from '../config';
import { MAX_FILE_SIZE } from '../constants/file';
import { AwsS3Bindings } from '../keys/aws';
import { File } from '../models';
import { FileRepository } from '../repositories';
import { messages } from '../constants';
import { WatermarkUtil } from '../utils/watermark.util';
// Type for multer compatibility
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MulterCompatibleRequest = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MulterCompatibleResponse = any;

@injectable({ scope: BindingScope.TRANSIENT })
export class S3WrapperService {
    constructor(
        @inject(AwsS3Bindings.AwsS3Provider)
        private s3: AWS.S3,
        @repository(FileRepository)
        public fileRepository: FileRepository,
    ) {}

    public async uploadFileToS3(fileKey: string, originalFileName: string, fileBuffer: Buffer): Promise<string> {
        const mimeType: string | false = mime.lookup(originalFileName);
        const contentType: string = mimeType || 'application/octet-stream';

        // Apply watermark if it's an image
        let processedBuffer = fileBuffer;
        if (WatermarkUtil.isImage(contentType)) {
            try {
                processedBuffer = await WatermarkUtil.applyWatermark(fileBuffer, contentType);
                console.log(`Watermark applied to ${originalFileName}`);
            } catch (error) {
                console.error(`Failed to apply watermark to ${originalFileName}:`, error);
                // Continue with original buffer if watermarking fails
            }
        }

        return new Promise<string>((resolve, reject) => {
            this.s3.upload(
                {
                    Bucket: AWS_S3_BUCKET,
                    Key: fileKey,
                    Body: processedBuffer,
                    ContentType: contentType,
                },
                (err, result) => {
                    if (err) {
                        console.log(err);
                        reject(err);
                    } else {
                        resolve(result?.Location);
                    }
                },
            );
        });
    }

    public async deleteFile(fileKey: string): Promise<AWS.S3.DeleteObjectOutput> {
        return new Promise((resolve, reject) =>
            this.s3.deleteObject(
                {
                    Bucket: AWS_S3_BUCKET,
                    Key: fileKey,
                },
                (err, data) => {
                    if (err) {
                        reject(err);
                    } else {
                        resolve(data);
                    }
                },
            ),
        );
    }

    public async uploadSingleFile(request: Request, response: Response): Promise<File> {
        return new Promise<File>((resolve, reject) => {
            const upload = multer().single('file');

            upload(request as MulterCompatibleRequest, response as MulterCompatibleResponse, () => {
                const { file } = request;
                if (file) {
                    if (file.size > MAX_FILE_SIZE) {
                        reject(new HttpErrors[403](messages.exceedMaximumFileSize));
                        return;
                    }

                    // Check allowed file types
                    // const allowedImageFormats = /\.(jpeg|jpg|tiff|png)$/i;
                    // const allowedDocumentFormats = /\.(pdf)$/i;
                    // const disallowedFormats = /\.(doc|docx|ppt|pptx|xls|xlsx|csv)$/i;

                    // if (disallowedFormats.test(file.originalname)) {
                    //     reject(
                    //         new HttpErrors[403]('Word, PPT, and spreadsheet files (including CSV) are not acceptable'),
                    //     );
                    //     return;
                    // }

                    // if (
                    //     !allowedImageFormats.test(file.originalname) &&
                    //     !allowedDocumentFormats.test(file.originalname)
                    // ) {
                    //     reject(
                    //         new HttpErrors[403](
                    //             'Only image formats (.jpeg, .jpg, .tiff, .png) and PDF documents are allowed',
                    //         ),
                    //     );
                    //     return;
                    // }

                    const time = Date.now();
                    const sanitizedName = `${file.originalname.replace(/ /g, '-')}`;
                    const fileName = `${time}_${sanitizedName}`;
                    const fileKey = `${fileName}`;

                    // Upload file with watermark (if applicable)
                    this.uploadFileToS3(fileKey, file.originalname, file.buffer)
                        .then((fileUrl) => {
                            return this.fileRepository.create({
                                fileUrl,
                                fileName,
                                originalFileName: file.originalname,
                            });
                        })
                        .then(resolve)
                        .catch(reject);
                } else {
                    reject(new HttpErrors[400](messages.noFileUploaded));
                }
            });
        });
    }

    public async uploadMultipleFiles(request: Request, response: Response): Promise<File[]> {
        return new Promise<File[]>((resolve, reject) => {
            const upload = multer().array('files');

            upload(request as MulterCompatibleRequest, response as MulterCompatibleResponse, () => {
                const files: Express.Multer.File[] = request.files as Express.Multer.File[];
                const time = Date.now();
                if (!files || files.length === 0) {
                    reject(new HttpErrors[400](messages.noFileUploaded));
                    return;
                }
                // Validate all files before processing
                for (const file of files) {
                    // Check file size - max 25MB
                    if (file.size > MAX_FILE_SIZE) {
                        reject(new HttpErrors[403](messages.exceedMaximumFileSize));
                        return;
                    }

                    // Check allowed file types
                    // const allowedImageFormats = /\.(jpeg|jpg|tiff|png)$/i;
                    // const allowedDocumentFormats = /\.(pdf)$/i;
                    // const disallowedFormats = /\.(doc|docx|ppt|pptx|xls|xlsx|csv)$/i;

                    // if (disallowedFormats.test(file.originalname)) {
                    //     reject(
                    //         new HttpErrors[403]('Word, PPT, and spreadsheet files (including CSV) are not acceptable'),
                    //     );
                    //     return;
                    // }

                    // if (
                    //     !allowedImageFormats.test(file.originalname) &&
                    //     !allowedDocumentFormats.test(file.originalname)
                    // ) {
                    //     reject(
                    //         new HttpErrors[403](
                    //             'Only image formats (.jpeg, .jpg, .tiff, .png) and PDF documents are allowed',
                    //         ),
                    //     );
                    //     return;
                    // }
                }

                // Upload all files with watermark (if applicable)
                Promise.all(
                    (Array.isArray(files) ? files : []).map((file) => {
                        const sanitizedName = `${file.originalname.replace(/ /g, '-')}`;
                        const fileName = `${time}_${sanitizedName}`;
                        const fileKey = `${fileName}`;
                        return this.uploadFileToS3(fileKey, file.originalname, file.buffer).then((fileUrl) => {
                            return this.fileRepository.create({
                                fileUrl,
                                fileName,
                                originalFileName: file.originalname,
                            });
                        });
                    }),
                )
                    .then(resolve)
                    .catch(reject);
            });
        });
    }
}
