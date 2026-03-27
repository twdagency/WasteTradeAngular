import sharp from 'sharp';
import * as path from 'path';
import * as fs from 'fs';

// Utility class for adding watermarks to images
export class WatermarkUtil {
    private static readonly WATERMARK_PATH = path.join(__dirname, '../../public/asserts/watermark-full.png');
    private static readonly WATERMARK_OPACITY = 1.0; // 100% opacity (fully visible, no transparency)
    private static readonly USE_TILED_PATTERN = false; // Use full watermark overlay (no tiling)

    // Check if a file is an image based on mimetype
    static isImage(mimetype: string): boolean {
        return mimetype.startsWith('image/') && !mimetype.includes('svg');
    }

    // Apply watermark to an image buffer
    static async applyWatermark(imageBuffer: Buffer, mimetype: string): Promise<Buffer> {
        // Skip if not an image or if watermark doesn't exist
        if (!this.isImage(mimetype)) {
            return imageBuffer;
        }

        // Check if watermark file exists
        if (!fs.existsSync(this.WATERMARK_PATH)) {
            console.warn(`Watermark file not found at ${this.WATERMARK_PATH}. Skipping watermark.`);
            return imageBuffer;
        }

        try {
            // Get image metadata
            const image = sharp(imageBuffer);
            const metadata = await image.metadata();

            if (!metadata.width || !metadata.height) {
                console.warn('Unable to get image dimensions. Skipping watermark.');
                return imageBuffer;
            }

            if (this.USE_TILED_PATTERN) {
                // Apply tiled watermark pattern across entire image
                return await this.applyTiledWatermark(imageBuffer, metadata.width, metadata.height);
            } else {
                // Apply single watermark at bottom-right corner
                return await this.applySingleWatermark(imageBuffer, metadata.width, metadata.height);
            }
        } catch (error) {
            console.error('Error applying watermark:', error);
            // Return original image if watermarking fails
            return imageBuffer;
        }
    }

    // Apply tiled watermark pattern across entire image
    private static async applyTiledWatermark(
        imageBuffer: Buffer,
        imageWidth: number,
        imageHeight: number,
    ): Promise<Buffer> {
        // Watermark will be resized to match image dimensions in applySingleWatermark
        const watermarkWidth = imageWidth;

        // Resize watermark
        const watermarkBuffer = await sharp(this.WATERMARK_PATH)
            .resize(watermarkWidth, null, {
                fit: 'contain',
                withoutEnlargement: true,
            })
            .toBuffer();

        const watermarkMetadata = await sharp(watermarkBuffer).metadata();
        const watermarkHeight = watermarkMetadata.height || 0;

        // Calculate spacing - tighter spacing to avoid gaps
        const horizontalSpacing = Math.floor(watermarkWidth * 1.2); // 20% gap (very close together)
        const verticalSpacing = Math.floor(watermarkHeight * 1.2); // 20% gap (very close together)

        // Calculate how many watermarks fit
        const cols = Math.ceil(imageWidth / horizontalSpacing) + 2;
        const rows = Math.ceil(imageHeight / verticalSpacing) + 2;

        // Create SVG with tiled watermarks (NO rotation - watermark file is already rotated)
        // Use offset pattern to fill gaps better
        const watermarkDataUrl = `data:image/png;base64,${watermarkBuffer.toString('base64')}`;

        const svgWatermark = `
            <svg width="${imageWidth}" height="${imageHeight}">
                <defs>
                    <pattern id="watermarkPattern" x="0" y="0" width="${horizontalSpacing}" height="${verticalSpacing}" patternUnits="userSpaceOnUse">
                        <image 
                            href="${watermarkDataUrl}" 
                            x="0" 
                            y="0" 
                            width="${watermarkWidth}" 
                            height="${watermarkHeight}"
                            opacity="${this.WATERMARK_OPACITY}"
                        />
                    </pattern>
                    <pattern id="watermarkPatternOffset" x="${horizontalSpacing / 2}" y="${verticalSpacing / 2}" width="${horizontalSpacing}" height="${verticalSpacing}" patternUnits="userSpaceOnUse">
                        <image 
                            href="${watermarkDataUrl}" 
                            x="0" 
                            y="0" 
                            width="${watermarkWidth}" 
                            height="${watermarkHeight}"
                            opacity="${this.WATERMARK_OPACITY}"
                        />
                    </pattern>
                </defs>
                <rect width="${imageWidth}" height="${imageHeight}" fill="url(#watermarkPattern)" />
                <rect width="${imageWidth}" height="${imageHeight}" fill="url(#watermarkPatternOffset)" />
            </svg>
        `;

        // Apply tiled watermark to image
        const watermarkedBuffer = await sharp(imageBuffer)
            .composite([
                {
                    input: Buffer.from(svgWatermark),
                    top: 0,
                    left: 0,
                },
            ])
            .toBuffer();

        return watermarkedBuffer;
    }

    // Apply full watermark overlay (simple overlay on top of image)
    private static async applySingleWatermark(
        imageBuffer: Buffer,
        imageWidth: number,
        imageHeight: number,
    ): Promise<Buffer> {
        // Resize watermark to cover entire image (crop and center, maintain aspect ratio)
        const watermarkBuffer = await sharp(this.WATERMARK_PATH)
            .resize(imageWidth, imageHeight, {
                fit: 'cover', // Cover entire image, crop excess, maintain aspect ratio
                position: 'center', // Center the watermark
            })
            .toBuffer();

        // Simply overlay watermark on top of image
        const watermarkedBuffer = await sharp(imageBuffer)
            .composite([
                {
                    input: watermarkBuffer,
                    top: 0,
                    left: 0,
                    blend: 'over', // Overlay on top
                },
            ])
            .toBuffer();

        return watermarkedBuffer;
    }

    // Create a simple text watermark if no watermark image exists
    static async applyTextWatermark(imageBuffer: Buffer, text: string = 'WasteTrade'): Promise<Buffer> {
        try {
            const image = sharp(imageBuffer);
            const metadata = await image.metadata();

            if (!metadata.width || !metadata.height) {
                return imageBuffer;
            }

            // Create SVG text watermark
            const fontSize = Math.floor(metadata.width * 0.05); // 5% of image width
            const svgText = `
                <svg width="${metadata.width}" height="${metadata.height}">
                    <text
                        x="${metadata.width - 20}"
                        y="${metadata.height - 20}"
                        font-family="Arial, sans-serif"
                        font-size="${fontSize}"
                        fill="white"
                        fill-opacity="0.5"
                        text-anchor="end"
                        alignment-baseline="baseline"
                    >${text}</text>
                </svg>
            `;

            const watermarkedBuffer = await image
                .composite([
                    {
                        input: Buffer.from(svgText),
                        top: 0,
                        left: 0,
                    },
                ])
                .toBuffer();

            return watermarkedBuffer;
        } catch (error) {
            console.error('Error applying text watermark:', error);
            return imageBuffer;
        }
    }
}
