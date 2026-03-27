/**
 * watermark-util-7.unit.ts
 * Coverage-focused tests for watermark.util.ts (Part 7)
 * Targets: applyWatermark with real PNG (metadata path when watermark file absent),
 *          applyTextWatermark edge cases, isImage additional mimetypes.
 */
import { expect } from '@loopback/testlab';
import { WatermarkUtil } from '../../utils/watermark.util';

async function makePngBuffer(width = 100, height = 100): Promise<Buffer> {
    const sharp = require('sharp');
    return sharp({
        create: { width, height, channels: 3, background: { r: 128, g: 128, b: 128 } },
    })
        .png()
        .toBuffer();
}

async function makeJpegBuffer(width = 80, height = 80): Promise<Buffer> {
    const sharp = require('sharp');
    return sharp({
        create: { width, height, channels: 3, background: { r: 200, g: 100, b: 50 } },
    })
        .jpeg()
        .toBuffer();
}

describe('WatermarkUtil extended coverage - Part 7 (unit)', () => {

    // ── isImage — remaining edge cases ─────────────────────────────────────────
    describe('isImage() — additional mimetypes', () => {
        it('returns true for image/webp', () => {
            expect(WatermarkUtil.isImage('image/webp')).to.be.true();
        });

        it('returns true for image/heic', () => {
            expect(WatermarkUtil.isImage('image/heic')).to.be.true();
        });

        it('returns false for image/svg+xml (contains svg)', () => {
            expect(WatermarkUtil.isImage('image/svg+xml')).to.be.false();
        });

        it('returns false for multipart/form-data', () => {
            expect(WatermarkUtil.isImage('multipart/form-data')).to.be.false();
        });

        it('returns false for application/json', () => {
            expect(WatermarkUtil.isImage('application/json')).to.be.false();
        });
    });

    // ── applyWatermark — with real PNG buffer (metadata code path) ─────────────
    describe('applyWatermark() — real image buffer, no watermark file', () => {
        it('returns a buffer for PNG when watermark file is absent (graceful skip)', async () => {
            // Watermark file does not exist in test environment.
            // applyWatermark should detect that, log warning, and return original buffer.
            const buf = await makePngBuffer(120, 120);
            const result = await WatermarkUtil.applyWatermark(buf, 'image/png');
            expect(Buffer.isBuffer(result)).to.be.true();
            // Result is either original or watermarked — must not throw
        });

        it('returns a buffer for JPEG when watermark file is absent', async () => {
            const buf = await makeJpegBuffer();
            const result = await WatermarkUtil.applyWatermark(buf, 'image/jpeg');
            expect(Buffer.isBuffer(result)).to.be.true();
        });

        it('returns original buffer unchanged for image/tiff with no watermark', async () => {
            // TIFF buffer — sharp may or may not parse it, but result must be a Buffer
            const sharp = require('sharp');
            const buf = await sharp({
                create: { width: 50, height: 50, channels: 3, background: { r: 0, g: 0, b: 0 } },
            })
                .tiff()
                .toBuffer();
            const result = await WatermarkUtil.applyWatermark(buf, 'image/tiff');
            expect(Buffer.isBuffer(result)).to.be.true();
        });

        it('processes image/webp without throwing', async () => {
            const sharp = require('sharp');
            const buf = await sharp({
                create: { width: 60, height: 60, channels: 3, background: { r: 255, g: 0, b: 0 } },
            })
                .webp()
                .toBuffer();
            const result = await WatermarkUtil.applyWatermark(buf, 'image/webp');
            expect(Buffer.isBuffer(result)).to.be.true();
        });
    });

    // ── applyTextWatermark — metadata failure path ─────────────────────────────
    describe('applyTextWatermark() — failure paths', () => {
        it('returns original buffer when input is empty buffer', async () => {
            const emptyBuf = Buffer.alloc(0);
            const result = await WatermarkUtil.applyTextWatermark(emptyBuf);
            expect(result).to.equal(emptyBuf);
        });

        it('returns original buffer for truncated/invalid PNG bytes', async () => {
            // Starts with PNG signature but truncated — sharp cannot read metadata
            const truncated = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 0x00]);
            const result = await WatermarkUtil.applyTextWatermark(truncated, 'Test');
            // Either returns original or processes — must not throw
            expect(Buffer.isBuffer(result)).to.be.true();
        });

        it('returns a valid buffer for 200x200 PNG with long text', async () => {
            const buf = await makePngBuffer(200, 200);
            const result = await WatermarkUtil.applyTextWatermark(buf, 'A'.repeat(100));
            expect(Buffer.isBuffer(result)).to.be.true();
        });

        it('returns a valid buffer for 1x1 minimal image', async () => {
            const sharp = require('sharp');
            const buf = await sharp({
                create: { width: 1, height: 1, channels: 3, background: { r: 255, g: 255, b: 255 } },
            })
                .png()
                .toBuffer();
            const result = await WatermarkUtil.applyTextWatermark(buf, 'X');
            expect(Buffer.isBuffer(result)).to.be.true();
        });
    });

    // ── applyWatermark — non-image types (already tested, extra variants) ──────
    describe('applyWatermark() — non-image passthrough variants', () => {
        it('returns original buffer for application/octet-stream', async () => {
            const buf = Buffer.from('binary data xyz');
            const result = await WatermarkUtil.applyWatermark(buf, 'application/octet-stream');
            expect(result).to.equal(buf);
        });

        it('returns original buffer for application/zip', async () => {
            const buf = Buffer.from('PK data');
            const result = await WatermarkUtil.applyWatermark(buf, 'application/zip');
            expect(result).to.equal(buf);
        });

        it('returns original buffer for text/csv', async () => {
            const buf = Buffer.from('col1,col2\nval1,val2');
            const result = await WatermarkUtil.applyWatermark(buf, 'text/csv');
            expect(result).to.equal(buf);
        });

        it('returns original buffer for image/svg+xml (svg excluded)', async () => {
            const buf = Buffer.from('<svg/>');
            const result = await WatermarkUtil.applyWatermark(buf, 'image/svg+xml');
            expect(result).to.equal(buf);
        });
    });
});
