import { NextRequest, NextResponse } from 'next/server';
import multer from 'multer';
import ImageKit from 'imagekit';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
});

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY as string,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY as string,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT as string,
});

export async function imagekitMiddleware(request: NextRequest) {
  const files = await new Promise<any[]>((resolve, reject) => {
    upload.array('file', 5)(request as any, {} as any, (error) => {
      if (error) reject(error);
      resolve((request as any).files || []);
    });
  });

  if (!files.length) {
    return NextResponse.json({ error: 'No files!' }, { status: 400 });
  }

  const uploadedFiles = await Promise.all(
    files.map(file =>
      imagekit.upload({
        file: file.buffer,
        fileName: file.originalname,
      })
    )
  );

  (request as any).imageUrls = uploadedFiles.map(file => file.url);
  return NextResponse.next();
}