import { HttpErrors, Middleware } from '@loopback/rest';

const responseTimeoutMiddleware: Middleware = async (middlewareCtx, next) => {
    const TIMEOUT_IN_SECONDS = 300;
    const NO_TIMEOUT_PATHS = ['/replicate-data', '/salesforce/haulage-loads'];

    if (NO_TIMEOUT_PATHS.includes(middlewareCtx?.request?.path)) {
        return next();
    }

    const result = await Promise.race([
        new Promise((_resolve, reject) => {
            setTimeout(() => {
                if (!middlewareCtx?.response?.headersSent) {
                    reject(new HttpErrors[408]());
                }
            }, 1000 * TIMEOUT_IN_SECONDS);
        }),
        next(),
    ]);
    return result;
};

export default responseTimeoutMiddleware;
