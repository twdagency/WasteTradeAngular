import { expect, sinon } from '@loopback/testlab';
import { DeepLI18nTranslationCronjob } from '../../components/Cronjobs/deepl-i18n-translation.cronjob';

describe('DeepLI18nTranslationCronjob (unit)', () => {
    let cronjob: DeepLI18nTranslationCronjob;
    let stubService: { translateI18nFiles: sinon.SinonStub };

    beforeEach(() => {
        stubService = {
            translateI18nFiles: sinon.stub().resolves({ success: ['fr', 'es'], failed: [] }),
        };
        cronjob = new DeepLI18nTranslationCronjob(stubService as any);
    });

    afterEach(() => sinon.restore());

    describe('triggerManualTranslation', () => {
        it('calls translateI18nFiles with default en source and all target languages when no args', async () => {
            const result = await cronjob.triggerManualTranslation();

            expect(stubService.translateI18nFiles.calledOnce).to.be.true();
            const [srcLang, targetLangs] = stubService.translateI18nFiles.firstCall.args;
            expect(srcLang).to.equal('en');
            expect(targetLangs).to.containEql('fr');
            expect(targetLangs).to.containEql('de');
            expect(result.success).to.deepEqual(['fr', 'es']);
        });

        it('uses provided source language', async () => {
            await cronjob.triggerManualTranslation('fr', ['en']);
            const [srcLang] = stubService.translateI18nFiles.firstCall.args;
            expect(srcLang).to.equal('fr');
        });

        it('uses provided target languages', async () => {
            await cronjob.triggerManualTranslation('en', ['de', 'nl']);
            const [, targetLangs] = stubService.translateI18nFiles.firstCall.args;
            expect(targetLangs).to.deepEqual(['de', 'nl']);
        });

        it('returns failed array from service', async () => {
            stubService.translateI18nFiles.resolves({ success: [], failed: ['ja', 'ko'] });
            const result = await cronjob.triggerManualTranslation();
            expect(result.failed).to.deepEqual(['ja', 'ko']);
        });

        it('propagates service errors', async () => {
            stubService.translateI18nFiles.rejects(new Error('DeepL quota exceeded'));
            await expect(cronjob.triggerManualTranslation()).to.be.rejectedWith('DeepL quota exceeded');
        });
    });

    describe('performTranslation (private)', () => {
        it('does not throw when service rejects - catches internally', async () => {
            stubService.translateI18nFiles.rejects(new Error('network error'));
            await expect((cronjob as any).performTranslation()).to.not.be.rejected();
        });

        it('calls translateI18nFiles with en source and es target', async () => {
            await (cronjob as any).performTranslation();
            const [srcLang, targetLangs] = stubService.translateI18nFiles.firstCall.args;
            expect(srcLang).to.equal('en');
            expect(targetLangs).to.deepEqual(['es']);
        });
    });
});
