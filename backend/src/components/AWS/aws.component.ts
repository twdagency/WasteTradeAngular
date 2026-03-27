import { Component, ProviderMap } from '@loopback/core';
import { AwsS3Bindings } from '../../keys/aws';
import { AwsS3Provider } from '../../services/aws-s3.service';

export class AwsComponent implements Component {
    constructor() {
        this.providers = {
            [AwsS3Bindings.AwsS3Provider.key]: AwsS3Provider,
        };
    }

    providers?: ProviderMap = {};
}
