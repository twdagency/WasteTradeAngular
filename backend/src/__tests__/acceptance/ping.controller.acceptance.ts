import { Client, expect } from '@loopback/testlab';
import { WasteTradeApplication } from '../..';
import { setupApplication } from './test-helper';

describe('PingController', () => {
    let app: WasteTradeApplication;
    let client: Client;

    before('setupApplication', async function () {
        // eslint-disable-next-line @typescript-eslint/no-invalid-this
        this.timeout(10000); // Increase timeout to 10 seconds
        ({ app, client } = await setupApplication());
    });

    after(async () => {
        await app.stop();
    });

    it('invokes GET /ping', async () => {
        const res = await client.get('/ping?msg=world').expect(200);
        expect(res.body).to.containEql({ greeting: 'Hello from LoopBack' });
    });
});
