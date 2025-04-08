import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { uploadFile } from "../../imagekit/files";

interface EnhancedRequest extends NextRequest {
  imageUrls?: string[];
}

const JWT_SECRET = process.env.JWT_SECRET as string;

export async function imagekitmiddleware(request: EnhancedRequest) {
  try {
    const authCookie = request.cookies.get("authorization");

    if (!authCookie) {
      return NextResponse.redirect(new URL("/signup", request.url), { status: 401 });
    }

    const token = authCookie.value;
    const decoded = jwt.verify(token, JWT_SECRET);
    console.log("Verified JWT payload:", decoded);

    const formData = await request.formData();
    const files = formData.getAll('file') as File[];

    if (!files.length || files.length > 5) {
      return NextResponse.json(
        { error: files.length ? 'Max 5 files allowed' : 'No files uploaded' },
        { status: 400 }
      );
    }

    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif'];
    const MAX_SIZE = 5 * 1024 * 1024;

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json({ error: `Invalid type: ${file.name}` }, { status: 400 });
      }
      if (file.size > MAX_SIZE) {
        return NextResponse.json({ error: `File ${file.name} too large` }, { status: 400 });
      }
    }

  request.imageUrls = (await Promise.all(files.map(uploadFile))).map((file) => file.url);
return NextResponse.json ({
    success:true,
    imageUrls: request.imageUrls,
    filecount:files.length
});
 
  } catch (error: any) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return NextResponse.json({ error: "Unauthorized or Invalid Token" }, { status: 401 });
    }
    return NextResponse.json({ error: 'Failed to process files' }, { status: 500 });
  }
}

export const config = { matcher: '/api/dashboard' };