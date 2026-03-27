/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
import 'reflect-metadata';
import { AuthenticationComponent, registerAuthenticationStrategy } from '@loopback/authentication';
import { SECURITY_SCHEME_SPEC } from '@loopback/authentication-jwt';
import { BootMixin } from '@loopback/boot';
import { ApplicationConfig, BindingKey, Constructor, createBindingFromClass } from '@loopback/core';
import { CronComponent } from '@loopback/cron';
import { RepositoryMixin } from '@loopback/repository';
import { RestApplication, RestBindings } from '@loopback/rest';
import { RestExplorerBindings, RestExplorerComponent } from '@loopback/rest-explorer';
import { ServiceMixin } from '@loopback/service-proxy';
import { MigrationBindings, MigrationComponent } from 'loopback4-migration';
import path from 'path';
import { JWTAuthenticationStrategy } from './authentication-strategies/jwt-strategy';
import { AwsComponent } from './components/AWS/aws.component';
import * as CronJobs from './components/Cronjobs';
import { AWS_S3_ACCESS_KEY_ID, AWS_S3_REGION, AWS_S3_SECRET_ACCESS_KEY, NODE_ENV } from './config';
import { REQUEST_BODY_LIMIT_SIZE } from './constants';
import { PasswordHasherBindings, TokenServiceBindings, TokenServiceConstants, DeepLServiceBindings } from './keys';
import { AwsS3Bindings } from './keys/aws';
import { SalesforceBindings } from './keys/salesforce';
import { MySequence } from './sequence';
import { JWTService, MyUserService, DeepLService } from './services';
import { SalesforceService } from './services/salesforce/salesforce.service';
import { SalesforceSyncService } from './services/salesforce/salesforce-sync.service';
import { BcryptHasher } from './services/hash.password.bcryptjs';
import { AwsS3Config } from './types/aws';
import { SalesforceConfig } from './types/salesforce';
import { EnvironmentEnum } from './enum';
import { AuditTrailService } from './services';
import { createAuditTrailMiddleware } from './middleware/audit-trail.middleware';
import responseTimeoutMiddleware from './middleware/response-timeout';

export { ApplicationConfig };

export interface IPackageInfo {
    name: string;
    version: string;
    description: string;
}

export const PackageKey = BindingKey.create<IPackageInfo>('application.package');
const pkg: IPackageInfo = require('../package.json');

export class WasteTradeApplication extends BootMixin(ServiceMixin(RepositoryMixin(RestApplication))) {
    constructor(options: ApplicationConfig = {}) {
        super(options);

        // Set up the custom sequence
        this.sequence(MySequence);

        const disableOpenAPI: boolean = NODE_ENV === EnvironmentEnum.PRODUCTION;

        // Set up default home page
        this.static('/', path.join(__dirname, '../public'));

        // Bind authentication component related elements
        this.component(AuthenticationComponent);
        registerAuthenticationStrategy(this, JWTAuthenticationStrategy);

        if (!disableOpenAPI) {
            // Customize @loopback/rest-explorer configuration here
            this.configure(RestExplorerBindings.COMPONENT).to({
                path: '/explorer',
            });
            this.component(RestExplorerComponent);
        }

        if (String(process.env.IS_BACKGROUND) === 'true') {
            // Bind cron component
            this.component(CronComponent);

            // Bind migration component related elements
            this.component(MigrationComponent);
        }

        this.service(MyUserService);
        // this.service(NotificationService);

        this.projectRoot = __dirname;
        // Customize @loopback/boot Booter Conventions here
        this.bootOptions = {
            controllers: {
                // Customize ControllerBooter Conventions here
                dirs: ['controllers'],
                extensions: ['.controller.js'],
                nested: true,
            },
        };

        this.addSecuritySpec();
        this.setUpBindings();
        this.setUpMiddleware();
    }

    setUpBindings(): void {
        // Bind package.json to the application context
        this.bind(PackageKey).to(pkg);
        // Configure migration component
        this.bind(MigrationBindings.CONFIG).to({
            // Update this version to run migrations
            appVersion: '2.0.22', // !NOTE: Use this option to replace the app version in package.json
            dataSourceName: 'db',
        });

        // Bind AWS credentials
        this.bind(AwsS3Bindings.Config).to({
            accessKeyId: AWS_S3_ACCESS_KEY_ID,
            secretAccessKey: AWS_S3_SECRET_ACCESS_KEY,
            region: AWS_S3_REGION,
        } as AwsS3Config);
        this.component(AwsComponent);

        // Bind Salesforce configuration
        this.bind(SalesforceBindings.CONFIG).to({
            clientId: process.env.SALESFORCE_CLIENT_ID || '',
            clientSecret: process.env.SALESFORCE_CLIENT_SECRET || '',
            username: process.env.SALESFORCE_USERNAME || '',
            password: process.env.SALESFORCE_PASSWORD || '',
            securityToken: process.env.SALESFORCE_SECURITY_TOKEN || '',
            sandboxUrl: process.env.SALESFORCE_SANDBOX_URL,
            productionUrl: process.env.SALESFORCE_PRODUCTION_URL,
            apiVersion: process.env.SALESFORCE_API_VERSION || '58.0',
            syncEnabled: process.env.SALESFORCE_SYNC_ENABLED === 'true',
        } as SalesforceConfig);

        // Bind Salesforce services
        this.bind(SalesforceBindings.SERVICE).toClass(SalesforceService);
        this.bind(SalesforceBindings.SYNC_SERVICE).toClass(SalesforceSyncService);
        // Bind cron jobs only when background processes are enabled
        if (process.env.IS_BACKGROUND === 'true') {
            Object.entries(CronJobs).forEach(([_key, value]) => {
                this.add(createBindingFromClass(value as Constructor<unknown>));
            });
        }

        // this.dataSource(DbDataSource, 'db')

        this.bind(TokenServiceBindings.TOKEN_SECRET).to(TokenServiceConstants.TOKEN_SECRET_VALUE);

        this.bind(TokenServiceBindings.TOKEN_EXPIRES_IN).to(TokenServiceConstants.TOKEN_EXPIRES_IN_VALUE);

        this.bind(TokenServiceBindings.TOKEN_SERVICE).toClass(JWTService);

        // Bind bcrypt hash services - utilized by 'UserController' and 'MyUserService'
        this.bind(PasswordHasherBindings.ROUNDS).to(10);
        this.bind(PasswordHasherBindings.PASSWORD_HASHER).toClass(BcryptHasher);

        // Bind audit trail service
        this.bind('services.AuditTrailService').toClass(AuditTrailService);

        // Bind DeepL service
        this.bind(DeepLServiceBindings.DEEPL_SERVICE).toClass(DeepLService);

        // Increase request body size limit
        this.bind(RestBindings.REQUEST_BODY_PARSER_OPTIONS).to({ limit: REQUEST_BODY_LIMIT_SIZE });
    }

    setUpMiddleware(): void {
        // Add audit trail middleware
        this.middleware(
            createAuditTrailMiddleware({
                excludePaths: ['/ping', '/health', '/explorer'],
                excludeMethods: ['OPTIONS'],
            }),
        );

        // Add response timeout middleware
        this.middleware(responseTimeoutMiddleware);
    }

    addSecuritySpec(): void {
        this.api({
            openapi: '3.0.0',
            info: {
                title: 'WasteTrade Application',
                version: '1.0.1',
            },
            paths: {},
            components: { securitySchemes: SECURITY_SCHEME_SPEC },
            security: [
                {
                    // secure all endpoints with 'jwt'
                    jwt: [],
                },
            ],
            servers: [{ url: '/' }],
        });
    }
}
