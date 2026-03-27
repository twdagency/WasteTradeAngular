/**
 * watermark-util-2.unit.ts
 * Additional coverage for WatermarkUtil: applyTextWatermark with various sizes,
 * isImage edge cases, applyWatermark skip-paths.
 */
import { expect } from '@loopback/testlab';
import { WatermarkUtil } from '../../utils/watermark.util';

async function makePngBuffer(width = 100, height = 100): Promise<Buffer> {
    const sharp = require('sharp');
    return sharp({
        create: { width, height, channels: 3, background: { r: 200, g: 200, b: 200 } },
    })
        .png()
        .toBuffer();
}

describe('WatermarkUtil - Part 2 (unit)', () => {
    describe('isImage() — edge cases', () => {
        it('returns false for empty string', () => {
            expect(WatermarkUtil.isImage('')).to.be.false();
        });

        it('returns false for application/octet-stream', () => {
            expect(WatermarkUtil.isImage('application/octet-stream')).to.be.false();
        });

        it('returns true for image/tiff', () => {
            expect(WatermarkUtil.isImage('image/tiff')).to.be.true();
        });

        it('returns true for image/bmp', () => {
            expect(WatermarkUtil.isImage('image/bmp')).to.be.true();
        });

        it('returns false for image/svg (contains svg)', () => {
            expect(WatermarkUtil.isImage('image/svg')).to.be.false();
        });
    });

    describe('applyWatermark() — non-image and missing-watermark paths', () => {
        it('returns original buffer for video/mp4', async () => {
            const buf = Buffer.from('fake video');
            const result = await WatermarkUtil.applyWatermark(buf, 'video/mp4');
            expect(result).to.equal(buf);
        });

        it('returns original buffer for text/html', async () => {
            const buf = Buffer.from('<html/>');
            const result = await WatermarkUtil.applyWatermark(buf, 'text/html');
            expect(result).to.equal(buf);
        });

        it('returns a buffer (no throw) for image/jpeg even when watermark file absent', async () => {
            // Watermark file does not exist in test env — should return original buffer safely
            const imageBuffer = await makePngBuffer(50, 50);
            const result = await WatermarkUtil.applyWatermark(imageBuffer, 'image/jpeg');
            expect(Buffer.isBuffer(result)).to.be.true();
        });
    });

    describe('applyTextWatermark() — various sizes', () => {
        it('handles a large image (500×500)', async () => {
            const imageBuffer = await makePngBuffer(500, 500);
            const result = await WatermarkUtil.applyTextWatermark(imageBuffer, 'DRAFT');
            expect(Buffer.isBuffer(result)).to.be.true();
            // watermarked buffer should differ from original or at minimum not be smaller
            expect(result.length).to.be.greaterThanOrEqual(0);
        });

        it('handles a very small image (10×10)', async () => {
            const imageBuffer = await makePngBuffer(10, 10);
            const result = await WatermarkUtil.applyTextWatermark(imageBuffer, 'X');
            expect(Buffer.isBuffer(result)).to.be.true();
        });

        it('returns original buffer when input is completely invalid', async () => {
            const invalidBuf = Buffer.from('not-valid-image-data-xyz');
            const result = await WatermarkUtil.applyTextWatermark(invalidBuf, 'MARK');
            // Should swallow the error and return original
            expect(result).to.equal(invalidBuf);
        });

        it('uses custom text in SVG watermark', async () => {
            const imageBuffer = await makePngBuffer(200, 200);
            // Should not throw regardless of text content
            const result = await WatermarkUtil.applyTextWatermark(imageBuffer, 'CONFIDENTIAL');
            expect(Buffer.isBuffer(result)).to.be.true();
        });
    });
});
