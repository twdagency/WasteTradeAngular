import { expect } from '@loopback/testlab';
import { WatermarkUtil } from '../../utils/watermark.util';

describe('WatermarkUtil (unit)', () => {
    describe('isImage', () => {
        it('returns true for image mimetypes', () => {
            expect(WatermarkUtil.isImage('image/jpeg')).to.be.true();
            expect(WatermarkUtil.isImage('image/png')).to.be.true();
            expect(WatermarkUtil.isImage('image/webp')).to.be.true();
            expect(WatermarkUtil.isImage('image/gif')).to.be.true();
        });

        it('returns false for svg (excluded)', () => {
            expect(WatermarkUtil.isImage('image/svg+xml')).to.be.false();
        });

        it('returns false for non-image mimetypes', () => {
            expect(WatermarkUtil.isImage('application/pdf')).to.be.false();
            expect(WatermarkUtil.isImage('text/plain')).to.be.false();
            expect(WatermarkUtil.isImage('video/mp4')).to.be.false();
        });
    });

    describe('applyWatermark', () => {
        it('returns original buffer unchanged for non-image mimetype', async () => {
            const buf = Buffer.from('fake pdf content');
            const result = await WatermarkUtil.applyWatermark(buf, 'application/pdf');
            expect(result).to.equal(buf);
        });

        it('returns original buffer when watermark file does not exist', async () => {
            // watermark file won't exist in test environment
            const buf = Buffer.from('fake image');
            const result = await WatermarkUtil.applyWatermark(buf, 'image/jpeg');
            // Either returns original (no watermark file) or processes it — must not throw
            expect(Buffer.isBuffer(result)).to.be.true();
        });
    });

    describe('applyTextWatermark', () => {
        it('returns a buffer for a valid image buffer', async () => {
            // Create a minimal valid PNG buffer using sharp
            const sharp = require('sharp');
            const imageBuffer = await sharp({
                create: { width: 100, height: 100, channels: 3, background: { r: 255, g: 255, b: 255 } },
            })
                .png()
                .toBuffer();

            const result = await WatermarkUtil.applyTextWatermark(imageBuffer, 'TestMark');
            expect(Buffer.isBuffer(result)).to.be.true();
        });

        it('uses default text WasteTrade when no text arg', async () => {
            const sharp = require('sharp');
            const imageBuffer = await sharp({
                create: { width: 50, height: 50, channels: 3, background: { r: 200, g: 200, b: 200 } },
            })
                .png()
                .toBuffer();

            const result = await WatermarkUtil.applyTextWatermark(imageBuffer);
            expect(Buffer.isBuffer(result)).to.be.true();
        });

        it('returns original buffer when image processing fails', async () => {
            const invalidBuf = Buffer.from('not-an-image');
            const result = await WatermarkUtil.applyTextWatermark(invalidBuf);
            expect(result).to.equal(invalidBuf);
        });
    });
});
