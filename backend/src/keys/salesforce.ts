import { BindingKey } from '@loopback/core';
import { SalesforceConfig } from '../types/salesforce';

export namespace SalesforceBindings {
    export const CONFIG = BindingKey.create<SalesforceConfig>('salesforce.config');
    export const SERVICE = BindingKey.create('salesforce.service');
    export const SYNC_SERVICE = BindingKey.create('salesforce.sync.service');
}
