/**
 * deepl.service-2.unit.ts
 * Additional coverage for: restoreFromBackup (timestamp, no-timestamp, no-backups, error),
 * translateI18nFiles (existing target-file preserved, translation-fails-with-existing-file),
 * countStringValues via translateI18nFiles side-effect.
 */
import { expect, sinon } from '@loopback/testlab';
import { DeepLService } from '../../services/deepl.service';

function makeTranslatorStub(overrides: Record<string, sinon.SinonStub> = {}): any {
    return {
        translateText: sinon.stub().resolves({ text: 'translated', detectedSourceLang: 'EN' }),
        getSourceLanguages: sinon.stub().resolves([{ code: 'EN', name: 'English' }]),
        getTargetLanguages: sinon.stub().resolves([{ code: 'FR', name: 'French' }]),
        ...overrides,
    };
}

function makeS3Stub(overrides: Partial<Record<string, any>> = {}): any {
    const listResult = {
        promise: sinon.stub().resolves({
            Contents: [{ Key: 'i18n/en.json', LastModified: new Date('2024-01-01') }],
        }),
    };
    const getResult = {
        promise: sinon.stub().resolves({
            Body: Buffer.from(JSON.stringify({ greeting: 'Hello', nested: { bye: 'Goodbye' } })),
        }),
    };
    const headResult = { promise: sinon.stub().rejects(new Error('not found')) };
    const uploadResult = { promise: sinon.stub().resolves({}) };
    const copyResult = { promise: sinon.stub().resolves({}) };

    return {
        listObjectsV2: sinon.stub().returns(listResult),
        getObject: sinon.stub().returns(getResult),
        headObject: sinon.stub().returns(headResult),
        upload: sinon.stub().returns(uploadResult),
        copyObject: sinon.stub().returns(copyResult),
        ...overrides,
    };
}

function makeService(translatorStub: any, s3Stub: any): DeepLService {
    const service = new DeepLService(s3Stub);
    (service as any).translator = translatorStub;
    return service;
}

describe('DeepLService - Part 2 (unit)', () => {

    describe('restoreFromBackup()', () => {
        it('restores using specific timestamp (copyObject called)', async () => {
            const s3 = makeS3Stub();
            const service = makeService(makeTranslatorStub(), s3);

            const result = await service.restoreFromBackup('fr', 1700000000000);

            expect(result).to.be.true();
            expect(s3.copyObject.calledOnce).to.be.true();
            const copyArg = s3.copyObject.firstCall.args[0];
            expect(copyArg.Key).to.containEql('fr.json');
        });

        it('returns false when no backups found (no-timestamp path)', async () => {
            const emptyListResult = {
                promise: sinon.stub().resolves({ Contents: [] }),
            };
            const s3 = makeS3Stub({
                listObjectsV2: sinon.stub().returns(emptyListResult),
            });
            const service = makeService(makeTranslatorStub(), s3);

            const result = await service.restoreFromBackup('de');

            expect(result).to.be.false();
        });

        it('picks most recent backup when multiple exist (no-timestamp path)', async () => {
            const older = new Date('2023-01-01');
            const newer = new Date('2024-06-01');
            const listResult = {
                promise: sinon.stub().resolves({
                    Contents: [
                        { Key: 'i18n/backup/fr_1000.json', LastModified: older },
                        { Key: 'i18n/backup/fr_2000.json', LastModified: newer },
                    ],
                }),
            };
            const s3 = makeS3Stub({ listObjectsV2: sinon.stub().returns(listResult) });
            const service = makeService(makeTranslatorStub(), s3);

            const result = await service.restoreFromBackup('fr');

            expect(result).to.be.true();
            const copyArg = s3.copyObject.firstCall.args[0];
            // Most recent backup should be fr_2000.json
            expect(copyArg.CopySource).to.containEql('fr_2000.json');
        });

        it('returns false when copyObject throws', async () => {
            const listResult = {
                promise: sinon.stub().resolves({
                    Contents: [{ Key: 'i18n/backup/es_1000.json', LastModified: new Date() }],
                }),
            };
            const copyErrorResult = {
                promise: sinon.stub().rejects(new Error('S3 copy failed')),
            };
            const s3 = makeS3Stub({
                listObjectsV2: sinon.stub().returns(listResult),
                copyObject: sinon.stub().returns(copyErrorResult),
            });
            const service = makeService(makeTranslatorStub(), s3);

            const result = await service.restoreFromBackup('es');

            expect(result).to.be.false();
        });
    });

    describe('translateI18nFiles() — existing-target-file branches', () => {
        it('preserves existing target file when translateNestedObject throws (not per-key error)', async () => {
            // translateNestedObject itself throws — not a per-key error, so whole lang fails
            const translator = makeTranslatorStub();
            const headResult = { promise: sinon.stub().resolves({}) }; // target file exists
            const s3 = makeS3Stub({ headObject: sinon.stub().returns(headResult) });
            const service = makeService(translator, s3);
            (service as any).sleep = sinon.stub().resolves();
            // Force translateNestedObject to throw at the object level
            (service as any).translateNestedObject = sinon.stub().rejects(new Error('nested object failure'));

            const result = await service.translateI18nFiles('en', ['fr']);

            // existing file preserved → pushed to failed
            expect(result.failed).to.containEql('fr');
            expect(result.success).to.not.containEql('fr');
        });

        it('uploads source content as fallback when no existing target and translateNestedObject throws', async () => {
            const translator = makeTranslatorStub();
            // headObject fails → no existing target file
            const headResult = { promise: sinon.stub().rejects(new Error('not found')) };
            const s3 = makeS3Stub({ headObject: sinon.stub().returns(headResult) });
            const service = makeService(translator, s3);
            (service as any).sleep = sinon.stub().resolves();
            (service as any).translateNestedObject = sinon.stub().rejects(new Error('quota exceeded'));

            const result = await service.translateI18nFiles('en', ['de']);

            // fallback upload succeeds → pushed to success
            expect(result.success).to.containEql('de');
            expect(s3.upload.called).to.be.true();
        });

        it('handles multiple languages: skips source, translates others', async () => {
            const translator = makeTranslatorStub();
            const s3 = makeS3Stub();
            const service = makeService(translator, s3);
            (service as any).sleep = sinon.stub().resolves();

            const result = await service.translateI18nFiles('en', ['en', 'fr', 'es']);

            // 'en' skipped, 'fr' and 'es' translated
            expect(result.success).to.have.length(2);
            expect(result.success).to.containEql('fr');
            expect(result.success).to.containEql('es');
        });

        it('translates nested object content (countStringValues exercises nested path)', async () => {
            const translator = makeTranslatorStub();
            // Source file has nested structure with array — non-string values kept as-is
            const body = JSON.stringify({
                title: 'Hello',
                section: { label: 'World', count: 42 },
                items: ['a', 'b'],
            });
            const getResult = { promise: sinon.stub().resolves({ Body: Buffer.from(body) }) };
            const s3 = makeS3Stub({ getObject: sinon.stub().returns(getResult) });
            const service = makeService(translator, s3);
            (service as any).sleep = sinon.stub().resolves();

            const result = await service.translateI18nFiles('en', ['it']);

            expect(result.success).to.containEql('it');
        });
    });
});
