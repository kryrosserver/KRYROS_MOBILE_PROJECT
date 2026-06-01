import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

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
      this.logger.warn(
        'Cloudinary credentials not set (CLOUDINARY_CLOUD_NAME / API_KEY / API_SECRET). ' +
        'Avatar uploads will fall back to storing base64 in DB until credentials are added to Render env vars.',
      );
    }
  }

  /**
   * Upload a base64 data URI or public URL to Cloudinary.
   * Falls back to returning the original string if Cloudinary is not configured
   * (so the app keeps working even before credentials are added to Render).
   */
  async uploadImage(
    source: string,
    folder: string = 'kryros/avatars',
    publicId?: string,
  ): Promise<string> {
    if (!this.configured) {
      this.logger.warn('Cloudinary not configured — storing image as-is (add env vars to Render to enable uploads)');
      return source; // graceful degradation: store raw until configured
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
