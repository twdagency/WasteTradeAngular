import { UserService } from '@loopback/authentication';
import { BindingKey } from '@loopback/context';
import dotenv from 'dotenv';
import EventEmitter from 'events';
import { User } from './models';
import { Credentials } from './repositories/user.repository';
import { PasswordHasher } from './services/hash.password.bcryptjs';
import { JWTService } from './services/jwt-service';

dotenv.config();

export namespace TokenServiceConstants {
    export const TOKEN_SECRET_VALUE = process.env.TOKEN_SECRET_VALUE ?? '';
    export const TOKEN_EXPIRES_IN_VALUE = '2d';
}

export namespace TokenServiceBindings {
    export const TOKEN_SECRET = BindingKey.create<string>('authentication.jwt.secret');
    export const TOKEN_EXPIRES_IN = BindingKey.create<string>('authentication.jwt.expires.in.days');
    export const TOKEN_SERVICE = BindingKey.create<JWTService>('services.authentication.jwt.tokenservice');
}

export namespace PasswordHasherBindings {
    export const PASSWORD_HASHER = BindingKey.create<PasswordHasher>('services.hasher');
    export const ROUNDS = BindingKey.create<number>('services.hasher.round');
}

export namespace UserServiceBindings {
    export const USER_SERVICE = BindingKey.create<UserService<User, Credentials>>('services.user.service');
}

export namespace ProvinceServiceBindings {
    export const USER_SERVICE = BindingKey.create<UserService<User, Credentials>>('services.user.service');
}

export namespace MessageBusBindings {
    export const MessageBusProvider: BindingKey<EventEmitter> = BindingKey.create<EventEmitter>('messageBus.events');
}

export namespace DeepLServiceBindings {
    export const DEEPL_SERVICE = BindingKey.create<unknown>('services.deepl.service');
}
