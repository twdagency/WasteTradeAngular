import { Client, expect } from '@loopback/testlab';
import { WasteTradeApplication } from '../..';
import { setupApplication } from './test-helper';

describe('DocsController', () => {
    let app: WasteTradeApplication;
    let client: Client;
    let originalNodeEnv: string | undefined;

    before('setupApplication', async () => {
        originalNodeEnv = process.env.NODE_ENV;
        process.env.NODE_ENV = 'development';
        ({ app, client } = await setupApplication());
    }).timeout(10000);

    after(async () => {
        await app.stop();
        process.env.NODE_ENV = originalNodeEnv;
    });

    it('invokes GET /docs/files', async () => {
        const res = await client.get('/docs/files').expect(200);
        expect(res.body).to.be.Array();
        expect(res.body.length).to.be.greaterThan(0);
    });

    it('invokes GET /docs/file', async () => {
        const res = await client.get('/docs/file').query({ path: 'Phase 1/DOCUMENTATION_INDEX.md' }).expect(200);
        expect(res.text).to.containEql('WasteTrade Documentation Index');
    });
});
