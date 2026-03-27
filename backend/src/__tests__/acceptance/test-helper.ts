import { WasteTradeApplication } from '../..';
import { createRestAppClient, givenHttpServerConfig, Client } from '@loopback/testlab';

/**
 * Check if tests are allowed to run in current environment
 */
function checkTestEnvironment() {
    const env = process.env.ENVIRONMENT?.toLowerCase() || 'dev';
    const allowedEnvs = ['dev', 'local', 'test', 'uat'];

    if (!allowedEnvs.includes(env)) {
        throw new Error(
            `❌ Tests cannot run in ${env} environment. Only allowed in: ${allowedEnvs.join(', ')}`,
        );
    }
}

export async function setupApplication(): Promise<AppWithClient> {
    checkTestEnvironment();
    const restConfig = givenHttpServerConfig({
        // Customize the server configuration here.
        // Empty values (undefined, '') will be ignored by the helper.
        //
        // host: process.env.HOST,
        // port: +process.env.PORT,
    });

    const app = new WasteTradeApplication({
        rest: restConfig,
    });

    await app.boot();
    await app.start();

    const client = createRestAppClient(app);

    return { app, client };
}

export interface AppWithClient {
    app: WasteTradeApplication;
    client: Client;
}

/**
 * Test user credentials - using preset admin accounts from migration [1.0.12]
 * These accounts are created automatically via the CreatePresetAdminAccounts migration
 */
export const TEST_USERS = {
    superAdmin: {
        email: 'superadmin@wastetrade.com',
        password: 'Test@123',
    },
    seller: {
        email: 'test1@wastetrade.com',
        password: 'Test@123',
    },
    buyer: {
        email: 'test2@wastetrade.com',
        password: 'Test@123',
    },
    haulier: {
        email: 'test3@wastetrade.com',
        password: 'Test@123',
    },
};

/**
 * Login helper to get JWT token for testing
 */
export async function loginUser(client: Client, email: string, password: string): Promise<string> {
    try {
        const response = await client.post('/login').send({ email, password });

        if (response.body?.data?.accessToken) {
            return response.body.data.accessToken;
        }
    } catch {
        // Login endpoint may fail if test user doesn't exist
    }

    const msg = `Login failed for ${email} — test user may not exist in DB. Run migration [2.0.7] to seed test accounts.`;
    console.warn(`⚠️ ${msg}`);
    throw new Error(msg);
}

/**
 * Skip test suite if login fails (test users not seeded).
 * Use in before() hooks to gracefully skip instead of failing.
 */
export async function loginOrSkip(
    client: Client,
    email: string,
    password: string,
    context: Mocha.Context,
): Promise<string> {
    try {
        return await loginUser(client, email, password);
    } catch {
        console.warn(`⚠️ Skipping suite — ${email} not available`);
        context.skip();
        return ''; // unreachable but satisfies TS
    }
}

/**
 * Get super admin token
 */
export async function getSuperAdminToken(client: Client): Promise<string> {
    return loginUser(client, TEST_USERS.superAdmin.email, TEST_USERS.superAdmin.password);
}

/**
 * Get admin token
 */
export async function getAdminToken(client: Client): Promise<string> {
    return loginUser(client, TEST_USERS.superAdmin.email, TEST_USERS.superAdmin.password);
}

/**
 * Get seller token
 */
export async function getSellerToken(client: Client): Promise<string> {
    return loginUser(client, TEST_USERS.seller.email, TEST_USERS.seller.password);
}

/**
 * Get buyer token
 */
export async function getBuyerToken(client: Client): Promise<string> {
    return loginUser(client, TEST_USERS.buyer.email, TEST_USERS.buyer.password);
}

/**
 * Get haulier token
 */
export async function getHaulierToken(client: Client): Promise<string> {
    return loginUser(client, TEST_USERS.haulier.email, TEST_USERS.haulier.password);
}
