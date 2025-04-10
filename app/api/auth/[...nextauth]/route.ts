import NextAuth from 'next-auth';
import { authOptions } from '@/app/Backend/nextauth/nextauth';

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };