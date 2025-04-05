import ImageKit from 'imagekit';

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY as string,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY as string,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT as string,
});

export async function uploadFile(file: File): Promise<{ url: string }> {
  const MAX_FILE_SIZE = 5 * 1024 * 1024;

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File ${file.name} exceeds 5MB limit`);
  }

  const buffer = Buffer.from(await file.arrayBuffer());
  return imagekit.upload({
    file: buffer,
    fileName: file.name,
  });
}