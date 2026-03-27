import { AuthenticationStrategy } from '@loopback/authentication';
import { inject } from '@loopback/context';
import { HttpErrors, Request } from '@loopback/rest';
import { UserProfile } from '@loopback/security';
import { TokenServiceBindings } from '../keys';
import { JWTService } from '../services/jwt-service';

export class JWTAuthenticationStrategy implements AuthenticationStrategy {
    name = 'jwt';

    constructor(
        @inject(TokenServiceBindings.TOKEN_SERVICE)
        public tokenService: JWTService,
    ) {}

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async authenticate(request: Request): Promise<any> {
        const token: string = this.extractCredentials(request);
        const userProfile: UserProfile = await this.tokenService.verifyToken(token);
        return userProfile;
    }

    extractCredentials(request: Request): string {
        if (!request.headers.authorization) {
            // INFO: original message: "Authorization header not found."
            throw new HttpErrors.Unauthorized('authorization-header-not-found');
        }

        // for example: Bearer xxx.yyy.zzz
        const authHeaderValue = request.headers.authorization;

        if (!authHeaderValue.startsWith('Bearer')) {
            // INFO: original message: "Authorization header is not of type 'Bearer'."
            throw new HttpErrors.Unauthorized('authorization-header-is-not-of-type-bearer');
        }

        //split the string into 2 parts: 'Bearer ' and the `xxx.yyy.zzz`
        const parts = authHeaderValue.split(' ');
        if (parts.length !== 2)
            // INFO: original message: "Authorization header value has too many parts. It must follow the pattern: 'Bearer xx.yy.zz' where xx.yy.zz is a valid JWT token."
            throw new HttpErrors.Unauthorized(
                'authorization-header-value-has-too-many-parts-it-must-follow-the-pattern-bearer-xx-yy-zz-where-xx-yy-zz-is-a-valid-jwt-token',
            );
        const token = parts[1];

        return token;
    }
}
