import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

// Allowed MIME types for image uploads (inferred from base64 data URI prefix)
const ALLOWED_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
  'image/gif',
]);

/** Extract MIME type from a base64 data URI, e.g. data:image/png;base64,... */
function extractMimeType(dataUri: string): string | null {
  const match = dataUri.match(/^data:([a-zA-Z0-9][a-zA-Z0-9!#$&\-^_]+\/[a-zA-Z0-9][a-zA-Z0-9!#$&\-^_]+);base64,/);
  return match ? match[1].toLowerCase() : null;
}

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);
  private readonly configured: boolean;

  constructor(private configService: ConfigService) {
    const cloudName  = configService.get<string>('CLOUDINARY_CLOUD_NAME');
    const apiKey     = configService.get<string>('CLOUDINARY_API_KEY');
    const apiSecret  = configService.get<string>('CLOUDINARY_API_SECRET');

    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret, secure: true });
      this.configured = true;
      this.logger.log('Cloudinary configured ✓');
    } else {
      this.configured = false;
      const isProd = process.env.NODE_ENV === 'production';
      if (isProd) {
        // In production, missing Cloudinary config is a hard error — no raw base64 in DB
        throw new Error(
          'CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET must be set in production. ' +
          'Add these to your Render environment variables.',
        );
      }
      this.logger.warn(
        'Cloudinary credentials not set. Avatar uploads will fall back to storing base64 in DB (dev only). ' +
        'Add CLOUDINARY_* env vars before going to production.',
      );
    }
  }

  /**
   * Validate and upload a base64 data URI or public URL to Cloudinary.
   * - Rejects non-image MIME types (XSS-via-upload prevention)
   * - Rejects files larger than 5MB
   * - Falls back to returning source string in development if Cloudinary unconfigured
   */
  async uploadImage(
    source: string,
    folder: string = 'kryros/avatars',
    publicId?: string,
  ): Promise<string> {
    // Validate MIME type for base64 uploads
    if (CloudinaryService.isBase64(source)) {
      const mimeType = extractMimeType(source);

      if (!mimeType) {
        throw new BadRequestException('Invalid image format: cannot determine MIME type');
      }

      if (!ALLOWED_IMAGE_TYPES.has(mimeType)) {
        throw new BadRequestException(
          `Unsupported image type: ${mimeType}. Allowed types: jpeg, png, webp, gif`,
        );
      }

      // Rough base64 size check (base64 is ~33% larger than binary)
      const base64Data = source.split(',')[1] || '';
      const approxBytes = (base64Data.length * 3) / 4;
      const maxBytes = 5 * 1024 * 1024; // 5MB
      if (approxBytes > maxBytes) {
        throw new BadRequestException('Image file size exceeds the 5MB limit');
      }
    }

    if (!this.configured) {
      this.logger.warn('Cloudinary not configured — storing image as-is (dev only)');
      return source;
    }

    const options: Record<string, unknown> = {
      folder,
      resource_type: 'image',
      transformation: [
        { width: 400, height: 400, crop: 'fill', gravity: 'face' },
        { quality: 'auto', fetch_format: 'auto' },
      ],
    };
    if (publicId) options.public_id = publicId;

    const result: UploadApiResponse = await cloudinary.uploader.upload(source, options);
    this.logger.log(`Uploaded to Cloudinary: ${result.public_id}`);
    return result.secure_url;
  }

  /**
   * Delete a Cloudinary asset by its full secure URL.
   */
  async deleteByUrl(secureUrl: string): Promise<void> {
    if (!this.configured) return;
    try {
      const match = secureUrl.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-z]+)?$/);
      if (!match) return;
      await cloudinary.uploader.destroy(match[1]);
      this.logger.log(`Deleted from Cloudinary: ${match[1]}`);
    } catch (err) {
      this.logger.warn(`Failed to delete Cloudinary asset: ${err}`);
    }
  }

  /** Returns true if the string looks like a base64 data URI. */
  static isBase64(str: string): boolean {
    return typeof str === 'string' && str.startsWith('data:');
  }
}
