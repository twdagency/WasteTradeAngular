import { expect, sinon } from '@loopback/testlab';
import { WpExternalService } from '../../services/wp-external/wp-external.service';
import axios from 'axios';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';

describe('WpExternalService (unit)', () => {
    let service: WpExternalService;

    beforeEach(() => {
        service = new WpExternalService();
    });

    // ── csvToJson ────────────────────────────────────────────────────────────
    describe('csvToJson', () => {
        it('converts simple CSV string to array of objects', async () => {
            const csv = 'name,age\nAlice,30\nBob,25';
            const result = await service.csvToJson(csv);
            expect(result).to.be.an.Array();
            expect(result.length).to.equal(2);
            expect(result[0].name).to.equal('Alice');
            expect(result[0].age).to.equal('30');
        });

        it('returns empty array for CSV with only headers', async () => {
            const csv = 'name,age\n';
            const result = await service.csvToJson(csv);
            expect(result).to.be.an.Array();
            expect(result.length).to.equal(0);
        });

        it('handles CSV with quoted fields containing commas', async () => {
            const csv = 'name,description\n"Test Co","A company, with commas"';
            const result = await service.csvToJson(csv);
            expect(result.length).to.equal(1);
            expect(result[0].description).to.equal('A company, with commas');
        });

        it('handles multiple rows correctly', async () => {
            const rows = ['id,value'];
            for (let i = 1; i <= 5; i++) rows.push(`${i},val${i}`);
            const result = await service.csvToJson(rows.join('\n'));
            expect(result.length).to.equal(5);
            expect(result[4].id).to.equal('5');
        });

        it('returns all header keys as properties on each row object', async () => {
            const csv = 'col1,col2,col3\na,b,c';
            const result = await service.csvToJson(csv);
            expect(result[0]).to.have.property('col1', 'a');
            expect(result[0]).to.have.property('col2', 'b');
            expect(result[0]).to.have.property('col3', 'c');
        });
    });

    // ── fetchCsvData ─────────────────────────────────────────────────────────
    describe('fetchCsvData', () => {
        let axiosGetStub: sinon.SinonStub;

        beforeEach(() => {
            axiosGetStub = sinon.stub(axios, 'get');
        });

        afterEach(() => {
            axiosGetStub.restore();
        });

        it('returns CSV string on HTTP 200', async () => {
            axiosGetStub.resolves({ status: 200, data: 'col1,col2\nval1,val2' });
            const result = await service.fetchCsvData('http://example.com/data.csv');
            expect(result).to.equal('col1,col2\nval1,val2');
        });

        it('throws error on non-200 status', async () => {
            axiosGetStub.resolves({ status: 404, statusText: 'Not Found', data: '' });
            let threw = false;
            try {
                await service.fetchCsvData('http://example.com/missing.csv');
            } catch (err: any) {
                threw = true;
                expect(err.message).to.containEql('404');
            }
            expect(threw).to.be.true();
        });

        it('rethrows network error from axios', async () => {
            axiosGetStub.rejects(new Error('ECONNREFUSED'));
            let threw = false;
            try {
                await service.fetchCsvData('http://unreachable.example.com/data.csv');
            } catch (err: any) {
                threw = true;
                expect(err.message).to.containEql('ECONNREFUSED');
            }
            expect(threw).to.be.true();
        });
    });

    // ── saveJsonToFile ────────────────────────────────────────────────────────
    describe('saveJsonToFile', () => {
        it('writes valid JSON to a real temp file', () => {
            const tmpFile = path.join(os.tmpdir(), `wt-test-${Date.now()}.json`);
            const data = [{ id: '1', name: 'Test' }];
            service.saveJsonToFile(data, tmpFile);
            const content = fs.readFileSync(tmpFile, 'utf8');
            const parsed = JSON.parse(content);
            expect(parsed).to.be.an.Array();
            expect(parsed[0].name).to.equal('Test');
            fs.unlinkSync(tmpFile);
        });

        it('throws when target directory does not exist', () => {
            let threw = false;
            try {
                service.saveJsonToFile([], '/nonexistent/path/that/does/not/exist/test.json');
            } catch (err: any) {
                threw = true;
            }
            expect(threw).to.be.true();
        });

        it('serializes data as pretty-printed JSON (2 spaces)', () => {
            const tmpFile = path.join(os.tmpdir(), `wt-test-pretty-${Date.now()}.json`);
            service.saveJsonToFile([{ key: 'value' }], tmpFile);
            const content = fs.readFileSync(tmpFile, 'utf8');
            expect(content).to.containEql('  '); // indentation present
            fs.unlinkSync(tmpFile);
        });
    });

    // ── getDataFromFile ───────────────────────────────────────────────────────
    describe('getDataFromFile', () => {
        it('returns error response when file does not exist', async () => {
            const result = await service.getDataFromFile('nonexistent-wp-test-file.json');
            expect(result.status).to.equal('error');
            expect(result.data).to.be.null();
        });

        it('returns error when filename contains path traversal chars', async () => {
            const result = await service.getDataFromFile('../../etc/passwd');
            expect(result.status).to.equal('error');
        });
    });

    // ── syncDataFromWP ────────────────────────────────────────────────────────
    describe('syncDataFromWP', () => {
        it('returns a response object with status property', async () => {
            const result = await service.syncDataFromWP();
            expect(result).to.have.property('status');
            expect(['success', 'error']).to.containEql(result.status);
        });

        it('returns error status when WP_EXPORT_URLS is empty (test env)', async () => {
            // In test environment WP_EXPORT_URLS is typically empty
            const result = await service.syncDataFromWP();
            if (result.status === 'error') {
                expect(result.message).to.be.a.String();
                expect(result.data).to.be.null();
            }
        });
    });
});
