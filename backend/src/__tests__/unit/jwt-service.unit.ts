import { expect, sinon } from '@loopback/testlab';
import { JWTService } from '../../services/jwt-service';
import { securityId } from '@loopback/security';
import { HttpErrors } from '@loopback/rest';

const SECRET = 'test-secret';
const EXPIRES_IN = '1d';

function makeService(overrides: Partial<{ userRepo: any; companyRepo: any }> = {}) {
    return new JWTService(SECRET, EXPIRES_IN, overrides.userRepo, overrides.companyRepo);
}

describe('JWTService (unit)', () => {
    describe('generateToken', () => {
        it('generates a JWT token for a valid user profile', async () => {
            const service = makeService();
            const profile: any = { id: 1, email: 'test@test.com', globalRole: 'user', [securityId]: '1' };

            const token = await service.generateToken(profile);

            expect(token).to.be.a.String();
            expect(token.split('.')).to.have.length(3);
        });

        it('throws Unauthorized when userProfile is null', async () => {
            const service = makeService();

            await expect(service.generateToken(null as any)).to.be.rejectedWith(HttpErrors.Unauthorized);
        });

        it('uses custom expiry when provided', async () => {
            const service = makeService();
            const profile: any = { id: 1, [securityId]: '1' };

            const token = await service.generateToken(profile, '1h');
            expect(token).to.be.a.String();
        });
    });

    describe('verifyToken', () => {
        it('verifies a valid token and returns user profile', async () => {
            const service = makeService();
            const profile: any = { id: 42, email: 'u@u.com', globalRole: 'user', [securityId]: '42' };
            const token = await service.generateToken(profile);

            const result = await service.verifyToken(token);

            expect(result.id).to.equal(42);
            expect(result[securityId]).to.equal('42');
        });

        it('throws Unauthorized for empty token', async () => {
            const service = makeService();

            await expect(service.verifyToken('')).to.be.rejectedWith(HttpErrors.Unauthorized);
        });

        it('throws Unauthorized for tampered token', async () => {
            const service = makeService();

            await expect(service.verifyToken('bad.token.value')).to.be.rejectedWith(HttpErrors.Unauthorized);
        });
    });

    describe('verifyTokenWithSecretKey', () => {
        it('verifies token signed with specific secret key', async () => {
            const service = makeService();
            const profile: any = { id: 7, [securityId]: '7' };
            // sign with default secret first
            const token = await service.generateToken(profile);

            const result = await service.verifyTokenWithSecretKey(token, SECRET);
            expect(result.id).to.equal(7);
        });

        it('throws Unauthorized when token does not match secret key', async () => {
            const service = makeService();
            const profile: any = { id: 1, [securityId]: '1' };
            const token = await service.generateToken(profile);

            await expect(service.verifyTokenWithSecretKey(token, 'wrong-secret')).to.be.rejectedWith(
                HttpErrors.Unauthorized,
            );
        });
    });

    describe('generateTemporaryTokenForResetPassword', () => {
        it('generates a token containing user id', async () => {
            const service = makeService();
            const user: any = { id: 99 };

            const token = await service.generateTemporaryTokenForResetPassword(user);

            expect(token).to.be.a.String();
            const decoded = await service.decodeTokenWithoutSecretKey(token);
            expect((decoded as any).id).to.equal(99);
        });

        it('throws Unauthorized when user is null', async () => {
            const service = makeService();

            await expect(service.generateTemporaryTokenForResetPassword(null as any)).to.be.rejectedWith(
                HttpErrors.Unauthorized,
            );
        });
    });

    describe('extractToken', () => {
        it('extracts Bearer token from Authorization header', () => {
            const service = makeService();
            const req: any = { headers: { authorization: 'Bearer mytoken123' } };

            const token = service.extractToken(req);

            expect(token).to.equal('mytoken123');
        });

        it('returns empty string when Authorization header is missing', () => {
            const service = makeService();
            const req: any = { headers: {} };

            const token = service.extractToken(req);

            expect(token).to.equal('');
        });
    });
});
