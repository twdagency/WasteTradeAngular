import { inject } from '@loopback/context';
import { repository } from '@loopback/repository';
import { HttpErrors, Request } from '@loopback/rest';
import lodashSplit from 'lodash/split';
import { promisify } from 'util';
import { MyUserProfile } from '../authentication-strategies/type';
import { FORGOT_PASSWORD_TOKEN_EXPIRED } from '../config';
import { TokenServiceBindings } from '../keys';
import { User } from '../models';
import { CompaniesRepository, UserRepository } from '../repositories';
import { securityId } from '@loopback/security';

const jwt = require('jsonwebtoken');
const signAsync = promisify(jwt.sign);
const verifyAsync = promisify(jwt.verify);

interface DecodedToken {
    iat: number;
    exp: number;
    globalRole: string;
    isHaulier: boolean;
    companyId: number;
    createdAt: Date;
}

export class JWTService {
    constructor(
        @inject(TokenServiceBindings.TOKEN_SECRET)
        private jwtSecret: string,
        @inject(TokenServiceBindings.TOKEN_EXPIRES_IN)
        private jwtExpiresIn: string,
        @repository(UserRepository)
        private userRepository?: UserRepository,
        @repository(CompaniesRepository)
        private companyRepository?: CompaniesRepository,
    ) {}

    async verifyToken(token: string): Promise<MyUserProfile> {
        if (!token) {
            throw new HttpErrors.Unauthorized('error-verifying-token-token-is-null');
        }

        let userProfile: MyUserProfile;

        try {
            // decode user profile from token
            userProfile = await verifyAsync(token, this.jwtSecret);
            userProfile[securityId] = userProfile.id?.toString();
        } catch (error) {
            throw new HttpErrors.Unauthorized(`Error verifying token : ${(error as Error).message}`);
        }

        return userProfile;
    }

    async verifyTokenWithSecretKey(token: string, secretKey: string): Promise<MyUserProfile> {
        if (!token) {
            throw new HttpErrors.Unauthorized('error-verifying-token-token-is-null');
        }

        let userProfile: MyUserProfile;

        try {
            // decode user profile from token
            userProfile = await verifyAsync(token, secretKey);
            userProfile[securityId] = userProfile.id?.toString();
        } catch (error) {
            throw new HttpErrors.Unauthorized(`Error verifying token : ${(error as Error).message}`);
        }

        return userProfile;
    }

    async generateToken(userProfile: MyUserProfile, expTime?: string | number): Promise<string> {
        if (!userProfile) {
            throw new HttpErrors.Unauthorized('error-generating-token-user-profile-is-null');
        }

        // Generate a JSON Web Token
        let token: string;
        try {
            const expiresIn: string | number = expTime ?? '14d';
            token = await signAsync(userProfile, this.jwtSecret, {
                expiresIn,
            });
        } catch (error) {
            throw new HttpErrors.Unauthorized(`Error encoding token : ${error}`);
        }
        return token;
    }

    async generateTemporaryTokenForResetPassword(
        userProfile: User,
        expiresIn: string = FORGOT_PASSWORD_TOKEN_EXPIRED,
        secretKey: string | null = null,
    ): Promise<string> {
        if (!userProfile) {
            throw new HttpErrors.Unauthorized('error-generating-token-user-profile-is-null');
        }

        const payload = {
            id: userProfile.id,
        };

        // Generate a JSON Web Token
        let token: string;
        try {
            token = await signAsync(payload, secretKey ?? this.jwtSecret, {
                expiresIn: expiresIn,
            });
        } catch (error) {
            throw new HttpErrors.Unauthorized(`Error encoding token : ${error}`);
        }

        return token;
    }

    async decodeToken(token: string): Promise<DecodedToken> {
        const decodedToken = await verifyAsync(token, this.jwtSecret);
        return decodedToken;
    }

    async decodeTokenWithoutSecretKey(token: string): Promise<DecodedToken> {
        const decodedToken = await jwt.decode(token);
        return decodedToken;
    }

    extractToken(request: Request): string {
        if (request.headers.authorization && lodashSplit(request.headers.authorization, ' ')[0] === 'Bearer') {
            return lodashSplit(request.headers.authorization, ' ')[1];
        }
        return '';
    }
}
