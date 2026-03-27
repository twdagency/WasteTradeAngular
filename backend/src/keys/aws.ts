import { BindingKey } from '@loopback/core';
import AWS from 'aws-sdk';
import { AwsS3Config } from '../types/aws';

export namespace AwsS3Bindings {
    export const AwsS3Provider = BindingKey.create<AWS.S3>('aws.s3');
    export const Config = BindingKey.create<AwsS3Config>('aws.s3.config');
}
