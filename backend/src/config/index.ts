import dotenv from 'dotenv';
import path from 'path';
import { EnvironmentEnum } from '../enum';

dotenv.config({ path: path.join(__dirname, '../../', '.env') });

export const NODE_ENV = process.env?.NODE_ENV as EnvironmentEnum;
export const BE_BASE_URL = process.env?.BE_BASE_URL;
export const FE_BASE_URL = process.env?.FE_BASE_URL ?? '';

export const ACCESS_TOKEN_EXPIRED = process.env?.ACCESS_TOKEN_EXPIRED ?? '10000d';
export const FORGOT_PASSWORD_TOKEN_EXPIRED = process.env?.FORGOT_PASSWORD_TOKEN_EXPIRED ?? '6h';
export const COMPLETE_ACCOUNT_DRAFT_EXPIRED_DAYS = process.env?.COMPLETE_ACCOUNT_DRAFT_EXPIRED_DAYS ?? '31d';

export const DB_URL = process.env?.POSTGRES_URL;
export const DB_HOST = process.env?.POSTGRES_HOST;
export const DB_PORT = process.env?.POSTGRES_PORT;
export const DB_USER = process.env?.POSTGRES_USER;
export const DB_PASSWORD = process.env?.POSTGRES_PASSWORD;
export const DB_NAME = process.env?.POSTGRES_NAME;

export const AWS_S3_BUCKET = process.env.AWS_S3_BUCKET ?? '';
export const AWS_S3_ACCESS_KEY_ID = process.env.AWS_S3_ACCESS_KEY_ID;
export const AWS_S3_SECRET_ACCESS_KEY = process.env.AWS_S3_SECRET_ACCESS_KEY;
export const AWS_S3_REGION = process.env.AWS_S3_REGION;
export const AWS_S3_ENDPOINT = process.env.AWS_S3_ENDPOINT;

export const SENDGRID_API_KEY = process.env?.SENDGRID_API_KEY;
export const SENDGRID_SENDER = process.env?.SENDGRID_SENDER;

export const REDIS_HOST = process.env?.REDIS_HOST ?? 'localhost';
export const REDIS_PORT = Number(process.env?.REDIS_PORT ?? 6379);
export const REDIS_PASSWORD = process.env?.REDIS_PASSWORD ?? undefined;
export const REDIS_DB = Number(process.env?.REDIS_DB ?? 0);

export const ADMIN_EMAIL = process.env?.ADMIN_EMAIL ?? 'admin@yopmail.com';

export const DEEPL_API_KEY = process.env?.DEEPL_API_KEY ?? '';
export const DEEPL_I18N_S3_BUCKET = process.env?.DEEPL_I18N_S3_BUCKET ?? AWS_S3_BUCKET;
export const DEEPL_I18N_S3_PATH = process.env?.DEEPL_I18N_S3_PATH ?? 'i18n';

export const WP_EXPORT_URLS = JSON.parse(process.env?.WP_EXPORT_URLS ?? '[]') as {
    tableName: string;
    exportUrl: string;
}[];
