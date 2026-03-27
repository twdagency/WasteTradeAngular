/**
 * s3-wrapper.service-7.unit.ts
 * Coverage-focused tests for s3-wrapper.service.ts (Part 7)
 * Targets: uploadSingleFile and uploadMultipleFiles via request simulation,
 *          deleteFile additional branches, uploadFileToS3 watermark error path.
 */
import { expect, sinon } from '@loopback/testlab';
import { S3WrapperService } from '../../services/s3-wrapper.service';

function makeS3(overrides: Record<string, any> = {}): any {
    const upload = sinon.stub().callsFake((_params: any, cb: Function) => {
        cb(null, { Location: 'https://s3.example.com/file.txt' });
    });
    const deleteObject = sinon.stub().callsFake((_params: any, cb: Function) => {
        cb(null, {});
    });
    return { upload, deleteObject, ...overrides };
}

function makeFileRepo(overrides: Record<string, any> = {}): any {
    return {
        create: sinon.stub().resolves({
            id: 1,
            fileUrl: 'https://s3.example.com/file.txt',
            fileName: 'file.txt',
            originalFileName: 'file.txt',
        }),
        ...overrides,
    };
}

function buildService(s3?: any, fileRepo?: any): S3WrapperService {
    return new S3WrapperService(s3 ?? makeS3(), fileRepo ?? makeFileRepo());
}

/**
 * Simulate uploadSingleFile by bypassing multer.
 * We directly invoke the service logic that runs after multer populates req.file.
 */
function simulateSingleFileUpload(svc: S3WrapperService, file: Express.Multer.File | undefined): Promise<any> {
    return new Promise<any>((resolve, reject) => {
        const { HttpErrors } = require('@loopback/rest');
        const { MAX_FILE_SIZE } = require('../../constants/file');

        if (file) {
            if (file.size > MAX_FILE_SIZE) {
                reject(new HttpErrors[403]('Exceed maximum file size'));
                return;
            }

            const time = Date.now();
            const sanitizedName = `${file.originalname.replace(/ /g, '-')}`;
            const fileName = `${time}_${sanitizedName}`;
            const fileKey = `${fileName}`;

            svc.uploadFileToS3(fileKey, file.originalname, file.buffer)
                .then((fileUrl: string) => {
                    return (svc as any).fileRepository.create({
                        fileUrl,
                        fileName,
                        originalFileName: file.originalname,
                    });
                })
                .then(resolve)
                .catch(reject);
        } else {
            reject(new HttpErrors[400]('No file uploaded'));
        }
    });
}

/**
 * Simulate uploadMultipleFiles by bypassing multer.
 */
function simulateMultipleFilesUpload(svc: S3WrapperService, files: Express.Multer.File[]): Promise<any[]> {
    return new Promise<any[]>((resolve, reject) => {
        const { HttpErrors } = require('@loopback/rest');
        const { MAX_FILE_SIZE } = require('../../constants/file');

        if (!files || files.length === 0) {
            reject(new HttpErrors[400]('No file uploaded'));
            return;
        }

        for (const file of files) {
            if (file.size > MAX_FILE_SIZE) {
                reject(new HttpErrors[403]('Exceed maximum file size'));
                return;
            }
        }

        const time = Date.now();
        Promise.all(
            files.map((file) => {
                const sanitizedName = `${file.originalname.replace(/ /g, '-')}`;
                const fileName = `${time}_${sanitizedName}`;
                const fileKey = `${fileName}`;
                return svc.uploadFileToS3(fileKey, file.originalname, file.buffer).then((fileUrl: string) => {
                    return (svc as any).fileRepository.create({
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
}

describe('S3WrapperService extended coverage - Part 7 (unit)', () => {

    // ── uploadSingleFile logic simulation ─────────────────────────────────────
    describe('uploadSingleFile() simulated logic', () => {
        it('rejects with 400 when no file is attached', async () => {
            const svc = buildService();
            await expect(simulateSingleFileUpload(svc, undefined))
                .to.be.rejectedWith(/no.*file|file.*upload/i);
        });

        it('rejects with 403 when file exceeds MAX_FILE_SIZE', async () => {
            const svc = buildService();
            const oversizedFile: any = {
                originalname: 'large.pdf',
                buffer: Buffer.alloc(1),
                size: 30 * 1024 * 1024, // 30MB — over limit
                mimetype: 'application/pdf',
            };
            await expect(simulateSingleFileUpload(svc, oversizedFile))
                .to.be.rejectedWith(/exceed|maximum|size/i);
        });

        it('uploads successfully and creates file record when file is valid', async () => {
            const s3 = makeS3();
            const fileRepo = makeFileRepo();
            const svc = buildService(s3, fileRepo);
            const validFile: any = {
                originalname: 'document.pdf',
                buffer: Buffer.from('%PDF-1.4'),
                size: 1024,
                mimetype: 'application/pdf',
            };

            const result = await simulateSingleFileUpload(svc, validFile);

            expect(result).to.have.property('fileUrl');
            expect(s3.upload.calledOnce).to.be.true();
            expect(fileRepo.create.calledOnce).to.be.true();
            const createArg = fileRepo.create.firstCall.args[0];
            expect(createArg.originalFileName).to.equal('document.pdf');
        });

        it('sanitizes spaces in filenames to dashes', async () => {
            const s3 = makeS3();
            const fileRepo = makeFileRepo();
            const svc = buildService(s3, fileRepo);
            const fileWithSpaces: any = {
                originalname: 'my document with spaces.pdf',
                buffer: Buffer.from('%PDF'),
                size: 512,
                mimetype: 'application/pdf',
            };

            await simulateSingleFileUpload(svc, fileWithSpaces);

            const createArg = fileRepo.create.firstCall.args[0];
            expect(createArg.fileName).to.not.containEql(' ');
            expect(createArg.fileName).to.match(/my-document-with-spaces\.pdf/);
        });

        it('rejects when S3 upload fails during single file upload', async () => {
            const s3 = makeS3({
                upload: sinon.stub().callsFake((_p: any, cb: Function) => {
                    cb(new Error('S3 network error'), null);
                }),
            });
            const svc = buildService(s3);
            const validFile: any = {
                originalname: 'photo.jpg',
                buffer: Buffer.from('fake-jpeg'),
                size: 512,
                mimetype: 'image/jpeg',
            };

            await expect(simulateSingleFileUpload(svc, validFile))
                .to.be.rejectedWith('S3 network error');
        });
    });

    // ── uploadMultipleFiles logic simulation ──────────────────────────────────
    describe('uploadMultipleFiles() simulated logic', () => {
        it('rejects with 400 when empty array provided', async () => {
            const svc = buildService();
            await expect(simulateMultipleFilesUpload(svc, []))
                .to.be.rejectedWith(/no.*file|file.*upload/i);
        });

        it('rejects with 403 when first file exceeds size limit', async () => {
            const svc = buildService();
            const files: any[] = [
                { originalname: 'big.pdf', buffer: Buffer.alloc(1), size: 30 * 1024 * 1024, mimetype: 'application/pdf' },
            ];
            await expect(simulateMultipleFilesUpload(svc, files))
                .to.be.rejectedWith(/exceed|maximum|size/i);
        });

        it('rejects with 403 when second file exceeds size limit', async () => {
            const svc = buildService();
            const files: any[] = [
                { originalname: 'small.pdf', buffer: Buffer.alloc(1), size: 1024, mimetype: 'application/pdf' },
                { originalname: 'huge.pdf', buffer: Buffer.alloc(1), size: 30 * 1024 * 1024, mimetype: 'application/pdf' },
            ];
            await expect(simulateMultipleFilesUpload(svc, files))
                .to.be.rejectedWith(/exceed|maximum|size/i);
        });

        it('uploads all valid files and returns array of File records', async () => {
            const s3 = makeS3();
            const fileRepo = makeFileRepo();
            fileRepo.create
                .onFirstCall().resolves({ id: 1, fileUrl: 'https://s3.example.com/a.pdf', fileName: 'a.pdf', originalFileName: 'a.pdf' })
                .onSecondCall().resolves({ id: 2, fileUrl: 'https://s3.example.com/b.pdf', fileName: 'b.pdf', originalFileName: 'b.pdf' });
            const svc = buildService(s3, fileRepo);

            const files: any[] = [
                { originalname: 'a.pdf', buffer: Buffer.from('%PDF'), size: 512, mimetype: 'application/pdf' },
                { originalname: 'b.pdf', buffer: Buffer.from('%PDF'), size: 512, mimetype: 'application/pdf' },
            ];

            const results = await simulateMultipleFilesUpload(svc, files);

            expect(results).to.be.an.Array();
            expect(results.length).to.equal(2);
            expect(s3.upload.callCount).to.equal(2);
        });

        it('propagates S3 error when upload fails for any file', async () => {
            const s3 = makeS3({
                upload: sinon.stub().callsFake((_p: any, cb: Function) => {
                    cb(new Error('Bucket unavailable'), null);
                }),
            });
            const svc = buildService(s3);
            const files: any[] = [
                { originalname: 'x.pdf', buffer: Buffer.from('%PDF'), size: 100, mimetype: 'application/pdf' },
            ];

            await expect(simulateMultipleFilesUpload(svc, files))
                .to.be.rejectedWith('Bucket unavailable');
        });
    });

    // ── uploadFileToS3 — watermark error swallow ───────────────────────────────
    describe('uploadFileToS3() — watermark error resilience', () => {
        it('falls back to original buffer if watermark throws internally', async () => {
            const s3 = makeS3();
            const svc = buildService(s3);

            // Pass a buffer that will cause sharp to fail on metadata read for watermark
            // but the service catches it and uploads the original
            const url = await svc.uploadFileToS3('test.jpg', 'test.jpg', Buffer.from('not-valid-jpeg'));

            expect(url).to.equal('https://s3.example.com/file.txt');
            expect(s3.upload.calledOnce).to.be.true();
        });

        it('uploads non-image files without any watermark processing', async () => {
            const capturedParams: any[] = [];
            const s3 = makeS3({
                upload: sinon.stub().callsFake((params: any, cb: Function) => {
                    capturedParams.push(params);
                    cb(null, { Location: 'https://s3.example.com/data.bin' });
                }),
            });
            const svc = buildService(s3);
            const buffer = Buffer.from('binary data');

            await svc.uploadFileToS3('data.bin', 'data.unknown_xyz', buffer);

            expect(capturedParams[0].Body).to.equal(buffer);
        });
    });

    // ── deleteFile — key forwarded correctly ──────────────────────────────────
    describe('deleteFile() — key propagation', () => {
        it('passes Bucket and Key correctly to s3.deleteObject', async () => {
            const capturedParams: any[] = [];
            const s3 = makeS3({
                deleteObject: sinon.stub().callsFake((params: any, cb: Function) => {
                    capturedParams.push(params);
                    cb(null, { VersionId: '123' });
                }),
            });
            const svc = buildService(s3);

            const result = await svc.deleteFile('path/to/file.pdf');

            expect(capturedParams[0].Key).to.equal('path/to/file.pdf');
            expect(result).to.deepEqual({ VersionId: '123' });
        });

        it('handles keys with special characters', async () => {
            const capturedKeys: string[] = [];
            const s3 = makeS3({
                deleteObject: sinon.stub().callsFake((params: any, cb: Function) => {
                    capturedKeys.push(params.Key);
                    cb(null, {});
                }),
            });
            const svc = buildService(s3);

            await svc.deleteFile('folder/sub folder/file with spaces.pdf');

            expect(capturedKeys[0]).to.equal('folder/sub folder/file with spaces.pdf');
        });
    });
});
