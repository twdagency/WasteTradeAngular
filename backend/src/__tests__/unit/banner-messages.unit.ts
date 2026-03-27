import { expect } from '@loopback/testlab';
import { BANNER_MESSAGES, BannerMessages, BannerConfig } from '../../config/banner-messages';

describe('banner-messages (unit)', () => {
    describe('BANNER_MESSAGES structure', () => {
        it('has all required keys', () => {
            expect(BANNER_MESSAGES).to.have.property('incompleteOnboarding');
            expect(BANNER_MESSAGES).to.have.property('verificationPending');
            expect(BANNER_MESSAGES).to.have.property('verificationFailed');
            expect(BANNER_MESSAGES).to.have.property('documentExpiring');
        });

        it('each entry has a non-empty message string', () => {
            const keys: (keyof BannerMessages)[] = [
                'incompleteOnboarding',
                'verificationPending',
                'verificationFailed',
                'documentExpiring',
            ];
            for (const key of keys) {
                const config: BannerConfig = BANNER_MESSAGES[key];
                expect(typeof config.message).to.equal('string');
                expect(config.message.length).to.be.greaterThan(0);
            }
        });
    });

    describe('incompleteOnboarding', () => {
        it('message contains onboarding-related text', () => {
            expect(BANNER_MESSAGES.incompleteOnboarding.message.toLowerCase()).to.match(/onboarding|account/);
        });
    });

    describe('verificationPending', () => {
        it('message references verification', () => {
            expect(BANNER_MESSAGES.verificationPending.message.toLowerCase()).to.containEql('verif');
        });
    });

    describe('verificationFailed', () => {
        it('message contains contact or support info', () => {
            const msg = BANNER_MESSAGES.verificationFailed.message.toLowerCase();
            expect(msg).to.match(/contact|support/);
        });
    });

    describe('documentExpiring', () => {
        it('message contains template placeholders', () => {
            const msg = BANNER_MESSAGES.documentExpiring.message;
            expect(msg).to.containEql('{documentName}');
            expect(msg).to.containEql('{expiryDate}');
        });

        it('placeholder replacement works with string replace', () => {
            const msg = BANNER_MESSAGES.documentExpiring.message
                .replace('{documentName}', 'Insurance Certificate')
                .replace('{expiryDate}', '31/12/2024');
            expect(msg).to.containEql('Insurance Certificate');
            expect(msg).to.containEql('31/12/2024');
            expect(msg).to.not.containEql('{documentName}');
            expect(msg).to.not.containEql('{expiryDate}');
        });
    });
});
