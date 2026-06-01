import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  constructor(private configService: ConfigService) {
    cloudinary.config({
      cloud_name: configService.getOrThrow<string>('CLOUDINARY_CLOUD_NAME'),
      api_key: configService.getOrThrow<string>('CLOUDINARY_API_KEY'),
      api_secret: configService.getOrThrow<string>('CLOUDINARY_API_SECRET'),
      secure: true,
    });
  }

  /**
   * Upload a base64-encoded image (data:image/... string) or a URL to Cloudinary.
   * Returns the secure HTTPS URL of the uploaded asset.
   */
  async uploadImage(
    source: string,
    folder: string = 'kryros/avatars',
    publicId?: string,
  ): Promise<string> {
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
   * Extracts the public_id from the URL automatically.
   */
  async deleteByUrl(secureUrl: string): Promise<void> {
    try {
      // Extract public_id: everything after /upload/vXXX/ and before the extension
      const match = secureUrl.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[a-z]+)?$/);
      if (!match) return;
      await cloudinary.uploader.destroy(match[1]);
      this.logger.log(`Deleted from Cloudinary: ${match[1]}`);
    } catch (err) {
      this.logger.warn(`Failed to delete Cloudinary asset: ${err}`);
    }
  }

  /**
   * Returns true if the string looks like a base64 data URI (not a URL).
   */
  static isBase64(str: string): boolean {
    return str.startsWith('data:');
  }
}
