import { inject } from '@loopback/core';
import { compare, genSalt, genSaltSync, hash, hashSync } from 'bcryptjs';
import { PasswordHasherBindings } from '../keys';

/**
 * Service HashPassword using module 'bcryptjs'.
 * It takes in a plain password, generates a salt with given
 * round and returns the hashed password as a string
 */
export type HashPassword = (password: string, rounds: number) => Promise<string>;
// bind function to `services.bcryptjs.HashPassword`
export async function hashPassword(password: string, rounds: number): Promise<string> {
    const salt = await genSalt(rounds);
    return hash(password, salt);
}

export interface PasswordHasher<T = string> {
    hashPassword(password: T): Promise<T>;
    hashPasswordSync(password: T): T;
    comparePassword(providedPass: T, storedPass: T): Promise<boolean>;
}

export class BcryptHasher implements PasswordHasher<string> {
    constructor(
        @inject(PasswordHasherBindings.ROUNDS)
        private readonly rounds: number,
    ) {}

    public async hashPassword(password: string): Promise<string> {
        const salt = await genSalt(this.rounds);
        return hash(password, salt);
    }

    public hashPasswordSync(password: string): string {
        const salt = genSaltSync(this.rounds);
        return hashSync(password, salt);
    }

    public async comparePassword(providedPass: string, storedPass: string): Promise<boolean> {
        const passwordIsMatched = await compare(providedPass, storedPass);
        return passwordIsMatched;
    }
}
