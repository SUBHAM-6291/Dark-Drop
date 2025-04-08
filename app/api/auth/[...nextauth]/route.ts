import NextAuth, { NextAuthOptions, User as NextAuthUser, Account, Session } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { UserModel } from '@/app/Backend/models/UserModel';
import { connectDB } from '@/app/Backend/DB/DB';
import bcrypt from 'bcryptjs';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      username: string;
      email: string;
      name: string | null;
    };
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    username: string;
    email?: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      ...(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET ? {} : {
        authorize: async () => { throw new Error('Google credentials not configured'); },
      }),
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            throw new Error('Missing credentials');
          }
          await connectDB();
          const user = await UserModel.findOne({ email: credentials.email }).select('+password');
          if (!user || !user.password) {
            throw new Error('Invalid credentials');
          }
          const isValid = await bcrypt.compare(credentials.password, user.password);
          if (!isValid) {
            throw new Error('Invalid credentials');
          }
          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name ?? null,
            username: user.username,
          };
        } catch (error) {
          console.error('Authorize error:', error);
          return null;
        }
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async signIn({ user, account }: { user: NextAuthUser; account: Account | null }) {
      if (!account?.provider) return false;
      const allowedProviders = ['google', 'credentials'] as const;
      if (!allowedProviders.includes(account.provider as any)) return false;
      try {
        await connectDB();
        let dbUser = await UserModel.findOne({ email: user.email });
        if (!dbUser && account.provider === 'google') {
          dbUser = await UserModel.create({
            email: user.email,
            name: user.name || '',
            username: user.email?.split('@')[0] || `user_${Date.now()}`,
            password: '',
          });
        }
        return true;
      } catch (error) {
        console.error('Sign-in error:', error);
        return false;
      }
    },
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }: { session: Session; token: any }) {
      if (token?.email) {
        await connectDB();
        const dbUser = await UserModel.findOne({ email: token.email });
        if (dbUser) {
          session.user = {
            id: dbUser._id.toString(),
            username: dbUser.username,
            email: dbUser.email,
            name: dbUser.name ?? null,
          };
        }
      }
      return session;
    },
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };