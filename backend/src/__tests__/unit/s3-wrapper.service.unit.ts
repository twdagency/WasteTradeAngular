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
        create: sinon.stub().resolves({ id: 1, fileUrl: 'https://s3.example.com/file.txt', fileName: 'file.txt', originalFileName: 'file.txt' }),
        ...overrides,
    };
}

function buildService(s3?: any, fileRepo?: any): S3WrapperService {
    return new S3WrapperService(s3 ?? makeS3(), fileRepo ?? makeFileRepo());
}

describe('S3WrapperService (unit)', () => {
    describe('uploadFileToS3()', () => {
        it('calls s3.upload and returns file URL on success', async () => {
            const s3 = makeS3();
            const svc = buildService(s3);
            const url = await svc.uploadFileToS3('test-key', 'file.txt', Buffer.from('hello'));
            expect(url).to.equal('https://s3.example.com/file.txt');
            expect(s3.upload.calledOnce).to.be.true();
        });

        it('rejects when s3.upload returns an error', async () => {
            const s3 = makeS3({
                upload: sinon.stub().callsFake((_p: any, cb: Function) => cb(new Error('S3 upload failed'), null)),
            });
            const svc = buildService(s3);
            await expect(svc.uploadFileToS3('key', 'file.txt', Buffer.from('x'))).to.be.rejectedWith('S3 upload failed');
        });

        it('uses application/octet-stream for unknown file types', async () => {
            const s3 = makeS3({
                upload: sinon.stub().callsFake((params: any, cb: Function) => {
                    expect(params.ContentType).to.equal('application/octet-stream');
                    cb(null, { Location: 'https://s3.example.com/data.bin' });
                }),
            });
            const svc = buildService(s3);
            await svc.uploadFileToS3('data.bin', 'data.unknown_ext_xyz', Buffer.from('bytes'));
        });

        it('uses correct content type for known extensions', async () => {
            const capturedParams: any[] = [];
            const s3 = makeS3({
                upload: sinon.stub().callsFake((params: any, cb: Function) => {
                    capturedParams.push(params);
                    cb(null, { Location: 'https://s3.example.com/doc.pdf' });
                }),
            });
            const svc = buildService(s3);
            await svc.uploadFileToS3('doc.pdf', 'doc.pdf', Buffer.from('pdf'));
            expect(capturedParams[0].ContentType).to.equal('application/pdf');
        });

        it('uploads to the configured bucket', async () => {
            const capturedParams: any[] = [];
            const s3 = makeS3({
                upload: sinon.stub().callsFake((params: any, cb: Function) => {
                    capturedParams.push(params);
                    cb(null, { Location: 'https://s3.example.com/f.txt' });
                }),
            });
            const svc = buildService(s3);
            await svc.uploadFileToS3('f.txt', 'f.txt', Buffer.from('x'));
            expect(capturedParams[0].Key).to.equal('f.txt');
        });
    });

    describe('deleteFile()', () => {
        it('calls s3.deleteObject and resolves on success', async () => {
            const s3 = makeS3();
            const svc = buildService(s3);
            const result = await svc.deleteFile('file-key');
            expect(s3.deleteObject.calledOnce).to.be.true();
            expect(result).to.deepEqual({});
        });

        it('rejects when s3.deleteObject returns an error', async () => {
            const s3 = makeS3({
                deleteObject: sinon.stub().callsFake((_p: any, cb: Function) => cb(new Error('Delete failed'), null)),
            });
            const svc = buildService(s3);
            await expect(svc.deleteFile('bad-key')).to.be.rejectedWith('Delete failed');
        });

        it('passes the correct key to s3.deleteObject', async () => {
            const capturedParams: any[] = [];
            const s3 = makeS3({
                deleteObject: sinon.stub().callsFake((params: any, cb: Function) => {
                    capturedParams.push(params);
                    cb(null, {});
                }),
            });
            const svc = buildService(s3);
            await svc.deleteFile('my-unique-key');
            expect(capturedParams[0].Key).to.equal('my-unique-key');
        });
    });
});
