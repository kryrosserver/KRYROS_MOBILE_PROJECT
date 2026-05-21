import * as sharp from 'sharp';

export async function compressImage(dataUrl: string, width = 800, height = 800, quality = 70): Promise<string> {
  try {
    if (!dataUrl || !dataUrl.startsWith('data:image')) return dataUrl;

    const parts = dataUrl.split(';base64,');
    if (parts.length !== 2) return dataUrl;

    const buffer = Buffer.from(parts[1], 'base64');
    const compressed = await sharp(buffer)
      .resize(width, height, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality })
      .toBuffer();

    return `data:image/jpeg;base64,${compressed.toString('base64')}`;
  } catch {
    return dataUrl;
  }
}

export async function compressBuffer(
  buffer: Buffer,
  width = 800,
  height = 800,
  quality = 70,
): Promise<{ dataUrl: string }> {
  try {
    const compressed = await sharp(buffer)
      .resize(width, height, { fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality })
      .toBuffer();

    return { dataUrl: `data:image/jpeg;base64,${compressed.toString('base64')}` };
  } catch {
    return { dataUrl: `data:image/jpeg;base64,${buffer.toString('base64')}` };
  }
}
