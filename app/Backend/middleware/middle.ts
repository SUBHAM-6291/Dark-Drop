import { NextRequest,NextResponse } from "next/server";
import { RateLimiterMemory } from 'rate-limiter-flexible';
import { verifyToken, isValidEmail, hashPassword, comparePassword, signToken, signRefreshToken, setCookie } from '@/app/Backend/lib/auth/auth';
import helmet from 'helmet';
import multer from 'multer';




const rateLimiter = new RateLimiterMemory({

    points :5, // 5 points
    duration: 60, // per second
})

 export const MulterUpload=multer({
storage: multer.memoryStorage(),
limits:{}
})