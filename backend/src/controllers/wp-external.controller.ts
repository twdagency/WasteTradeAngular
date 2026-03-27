import { authenticate } from '@loopback/authentication';
import { service } from '@loopback/core';
import { WpExternalService } from '../services';
import { get, param, post, response } from '@loopback/rest';

@authenticate('jwt')
export class WpExternalController {
    constructor(
        @service(WpExternalService)
        public wpExternalService: WpExternalService,
    ) {}

    @post('/wp-external/sync')
    @response(200, {
        description: 'Sync data from WordPress',
    })
    async syncDataFromWordPress() {
        return this.wpExternalService.syncDataFromWP();
    }

    @get('/wp-external/{tableName}/data')
    @response(200, {
        description: 'Get data from WordPress',
    })
    async getDataFromWordPress(@param.path.string('tableName') tableName: string) {
        return this.wpExternalService.getDataFromFile(`${tableName}.json`);
    }
}
