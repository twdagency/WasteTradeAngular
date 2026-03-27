import { Request, Response } from 'express';
import { messages } from '../constants';
import { redisService } from '../services';

// Configuration
const MAX_ATTEMPTS = 5; // Maximum allowed attempts
const BLOCK_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const WINDOW_DURATION = 60 * 60 * 1000; // 1 hour in milliseconds
// const BLOCK_DURATION = 15 * 60 * 1000; // 15 minutes in milliseconds for testing
// const WINDOW_DURATION = 5 * 60 * 1000; // 5 minutes in milliseconds for testing

// Middleware to check if an email is blocked
interface ForgotPasswordRequest extends Request {
    body: {
        email?: string;
    };
}

interface ErrorResponse {
    error: {
        statusCode: number;
        message: string;
    };
}

export const forgotPasswordCheckBlockedEmail = async (
    req: ForgotPasswordRequest,
    res: Response<ErrorResponse>,
    next: () => void,
): Promise<void> => {
    const email = req.body?.email;

    if (!email) {
        return next(); // If no email is provided, skip the check
    }

    const now = Date.now();
    const recordKey = `forgot-password:${email}`;

    // Get the record from Redis
    const recordString = await redisService.redisClient.get(recordKey);
    const record = recordString ? JSON.parse(recordString) : null;

    if (record) {
        // Check if the email is currently blocked
        if (record.blockUntil > now) {
            res.status(429).json({
                error: {
                    statusCode: 429,
                    message: messages.forgotPasswordRateLimit,
                },
            });

            return;
        }

        // If the email is not blocked but within the window duration
        if (now - record.blockUntil <= WINDOW_DURATION) {
            if (record.count >= MAX_ATTEMPTS) {
                // Block the email for BLOCK_DURATION
                const newRecord = { count: 0, blockUntil: now + BLOCK_DURATION };
                await redisService.redisClient.set(recordKey, JSON.stringify(newRecord), 'PX', BLOCK_DURATION);
                res.status(429).json({
                    error: {
                        statusCode: 429,
                        message: messages.forgotPasswordRateLimit,
                    },
                });

                return;
            }

            // Increment the attempt count
            record.count += 1;
            await redisService.redisClient.set(recordKey, JSON.stringify(record), 'PX', WINDOW_DURATION);
        } else {
            // Reset the count if outside the window duration
            const newRecord = { count: 1, blockUntil: now };
            await redisService.redisClient.set(recordKey, JSON.stringify(newRecord), 'PX', WINDOW_DURATION);
        }
    } else {
        // Create a new record for the email
        const newRecord = { count: 1, blockUntil: now };
        await redisService.redisClient.set(recordKey, JSON.stringify(newRecord), 'PX', WINDOW_DURATION);
    }

    next(); // Proceed to the next middleware or controller
};
