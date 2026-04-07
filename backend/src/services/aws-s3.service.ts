import { BindingScope, inject, injectable, Provider } from '@loopback/core';
import * as AWS from 'aws-sdk';
import { AwsS3Bindings } from '../keys/aws';
import { AwsS3Config } from '../types/aws';

@injectable({ scope: BindingScope.TRANSIENT })
export class AwsS3Provider implements Provider<AWS.S3> {
    constructor(
        @inject(AwsS3Bindings.Config)
        private readonly config: AwsS3Config,
    ) {
        AWS.config.update(Object.assign({}, { signatureVersion: 'v4' }, this.config));
    }

    value(): AWS.S3 {
        const opts: AWS.S3.ClientConfiguration = {
            httpOptions: {
                connectTimeout: 10000,
                timeout: 30000,
            },
        };
        if (this.config.endpoint) {
            opts.endpoint = this.config.endpoint;
            opts.s3ForcePathStyle = true;
        }
        return new AWS.S3(opts);
    }
}
