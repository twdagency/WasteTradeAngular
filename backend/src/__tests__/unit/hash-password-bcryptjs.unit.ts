/**
 * hash-password-bcryptjs.unit.ts
 * Coverage for: hashPassword (standalone), BcryptHasher.hashPassword,
 * BcryptHasher.hashPasswordSync, BcryptHasher.comparePassword
 */
import { expect } from '@loopback/testlab';
import { hashPassword, BcryptHasher } from '../../services/hash.password.bcryptjs';

describe('hash.password.bcryptjs (unit)', () => {
    describe('hashPassword() standalone function', () => {
        it('returns a hashed string that is not the original password', async () => {
            const result = await hashPassword('mysecret', 4);
            expect(result).to.not.equal('mysecret');
            expect(typeof result).to.equal('string');
            expect(result.length).to.be.greaterThan(20);
        });

        it('produces different hashes on each call (salt randomness)', async () => {
            const hash1 = await hashPassword('samepassword', 4);
            const hash2 = await hashPassword('samepassword', 4);
            expect(hash1).to.not.equal(hash2);
        });
    });

    describe('BcryptHasher', () => {
        const hasher = new BcryptHasher(4 as any);

        describe('hashPassword()', () => {
            it('returns a bcrypt hash string', async () => {
                const hashed = await hasher.hashPassword('testpass');
                expect(hashed).to.not.equal('testpass');
                expect(hashed.startsWith('$2')).to.be.true();
            });
        });

        describe('hashPasswordSync()', () => {
            it('returns a bcrypt hash string synchronously', () => {
                const hashed = hasher.hashPasswordSync('syncpass');
                expect(hashed).to.not.equal('syncpass');
                expect(hashed.startsWith('$2')).to.be.true();
            });

            it('produces different hashes on each call', () => {
                const h1 = hasher.hashPasswordSync('abc');
                const h2 = hasher.hashPasswordSync('abc');
                expect(h1).to.not.equal(h2);
            });
        });

        describe('comparePassword()', () => {
            it('returns true when provided password matches stored hash', async () => {
                const stored = await hasher.hashPassword('correcthorse');
                const match = await hasher.comparePassword('correcthorse', stored);
                expect(match).to.be.true();
            });

            it('returns false when provided password does not match', async () => {
                const stored = await hasher.hashPassword('correcthorse');
                const match = await hasher.comparePassword('wrongpassword', stored);
                expect(match).to.be.false();
            });

            it('comparePassword works with hashPasswordSync output', async () => {
                const stored = hasher.hashPasswordSync('syncpassword');
                const match = await hasher.comparePassword('syncpassword', stored);
                expect(match).to.be.true();
            });
        });
    });
});
