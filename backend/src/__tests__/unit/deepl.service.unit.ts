import { expect, sinon } from '@loopback/testlab';
import { DeepLService } from '../../services/deepl.service';

function makeTranslatorStub(overrides: Record<string, sinon.SinonStub> = {}): any {
    return {
        translateText: sinon.stub().resolves({ text: 'translated text', detectedSourceLang: 'EN' }),
        getSourceLanguages: sinon.stub().resolves([{ code: 'EN', name: 'English' }]),
        getTargetLanguages: sinon.stub().resolves([{ code: 'FR', name: 'French' }]),
        ...overrides,
    };
}

function makeS3Stub(overrides: Record<string, sinon.SinonStub> = {}): any {
    const listResult = {
        promise: sinon.stub().resolves({
            Contents: [{ Key: 'i18n/en.json' }],
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
    // Inject the stub translator directly
    (service as any).translator = translatorStub;
    return service;
}

describe('DeepLService (unit)', () => {
    describe('translateText', () => {
        it('returns translated text with detected source language', async () => {
            const translator = makeTranslatorStub();
            const service = makeService(translator, makeS3Stub());

            const result = await service.translateText({ text: 'Hello', targetLanguage: 'FR' });

            expect(result.translatedText).to.equal('translated text');
            expect(result.targetLanguage).to.equal('FR');
            expect(result.sourceLanguage).to.equal('EN'); // detectedSourceLang
        });

        it('uses provided sourceLanguage in request', async () => {
            const translator = makeTranslatorStub();
            const service = makeService(translator, makeS3Stub());

            const result = await service.translateText({ text: 'Hi', targetLanguage: 'DE', sourceLanguage: 'EN' });

            expect(result.sourceLanguage).to.equal('EN');
            const callArgs = translator.translateText.firstCall.args;
            expect(callArgs[0]).to.equal('Hi');
            expect(callArgs[1]).to.equal('EN');
            expect(callArgs[2]).to.equal('DE');
        });

        it('throws HttpErrors.BadRequest when translator fails', async () => {
            const translator = makeTranslatorStub({
                translateText: sinon.stub().rejects(new Error('API error')),
            });
            const service = makeService(translator, makeS3Stub());

            try {
                await service.translateText({ text: 'Hi', targetLanguage: 'FR' });
                throw new Error('Should have thrown');
            } catch (err: any) {
                expect(err.statusCode).to.equal(400);
                expect(err.message).to.containEql('Translation failed');
            }
        });

        it('throws when translator is not initialized (error wrapped as BadRequest)', async () => {
            const s3 = makeS3Stub();
            const service = new DeepLService(s3);
            // Force translator to null to simulate missing API key
            (service as any).translator = null;

            try {
                await service.translateText({ text: 'Hi', targetLanguage: 'FR' });
                throw new Error('Should have thrown');
            } catch (err: any) {
                // ServiceUnavailable is caught inside translateText and re-thrown as BadRequest
                expect(err.statusCode).to.equal(400);
                expect(err.message).to.containEql('Translation failed');
            }
        });
    });

    describe('getAvailableLanguages', () => {
        it('returns source and target language lists', async () => {
            const translator = makeTranslatorStub();
            const service = makeService(translator, makeS3Stub());

            const result = await service.getAvailableLanguages();

            expect(result.source).to.have.length(1);
            expect(result.source[0].code).to.equal('EN');
            expect(result.target[0].code).to.equal('FR');
        });
    });

    describe('translateI18nFiles', () => {
        it('skips target language that matches source language', async () => {
            const translator = makeTranslatorStub();
            const s3 = makeS3Stub();
            const service = makeService(translator, s3);

            // Stub sleep to avoid actual delays
            (service as any).sleep = sinon.stub().resolves();

            const result = await service.translateI18nFiles('en', ['en']);

            expect(result.success).to.be.empty();
            expect(result.failed).to.be.empty();
            expect(translator.translateText.called).to.be.false();
        });

        it('translates to target language and uploads to S3', async () => {
            const translator = makeTranslatorStub();
            const s3 = makeS3Stub();
            const service = makeService(translator, s3);
            (service as any).sleep = sinon.stub().resolves();

            const result = await service.translateI18nFiles('en', ['fr']);

            expect(result.success).to.containEql('fr');
            expect(result.failed).to.be.empty();
            expect(s3.upload.called).to.be.true();
        });

        it('falls back to source content and succeeds when translation fails but no existing target file', async () => {
            const translator = makeTranslatorStub({
                translateText: sinon.stub().rejects(new Error('API down')),
            });
            const s3 = makeS3Stub();
            const service = makeService(translator, s3);
            (service as any).sleep = sinon.stub().resolves();

            const result = await service.translateI18nFiles('en', ['de']);

            // headObject rejects (no existing file), so fallback upload is attempted
            expect(s3.upload.called).to.be.true();
        });

        it('throws when source file not found in S3', async () => {
            const translator = makeTranslatorStub();
            const s3 = makeS3Stub();
            // Empty S3 listing
            s3.listObjectsV2 = sinon.stub().returns({ promise: sinon.stub().resolves({ Contents: [] }) });
            const service = makeService(translator, s3);
            (service as any).sleep = sinon.stub().resolves();

            try {
                await service.translateI18nFiles('en', ['fr']);
                throw new Error('Should have thrown');
            } catch (err: any) {
                expect(err.message).to.containEql('Translation job failed');
            }
        });
    });

    describe('translateWithRetry (private — tested via translateI18nFiles)', () => {
        it('retries on rate limit error and eventually throws after maxRetries', async () => {
            const rateLimitError = new Error('Too many requests - rate limit exceeded');
            const translator = makeTranslatorStub({
                translateText: sinon.stub().rejects(rateLimitError),
            });
            const s3 = makeS3Stub();
            const service = makeService(translator, s3);
            (service as any).sleep = sinon.stub().resolves();

            // Call private method directly
            try {
                await (service as any).translateWithRetry('text', 'en', 'fr', 2, 0);
                throw new Error('Should have thrown');
            } catch (err: any) {
                expect(err.message).to.equal('Too many requests - rate limit exceeded');
                expect(translator.translateText.callCount).to.equal(2);
            }
        });
    });
});
