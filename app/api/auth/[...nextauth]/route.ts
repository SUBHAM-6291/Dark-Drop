import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { UserModel } from '@/app/Backend/models/UserModel';
import { connectDB } from '@/app/Backend/DB/DB';
import { hashPassword, comparePassword } from '@/app/Backend/lib/auth/auth';

declare module 'next-auth' {
  interface User {
    id: string;
    username: string;
    email: string;
    name: string | null;
  }

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
    email: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
      authorization: { params: { prompt: 'consent', access_type: 'offline' } },
    }),
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        username: { label: 'Username', type: 'text' },
        action: { label: 'Action', type: 'hidden' },
      },
      async authorize(credentials) {
        await connectDB();
        const { email, password, username, action } = credentials || {};

        if (!email) throw new Error('Email is required');

        let user = await UserModel.findOne({ email }).select('+password');

        if (action === 'signup') {
          if (!username) throw new Error('Username is required for signup');
          if (!password) throw new Error('Password is required for signup');
          if (user) throw new Error('User already exists');

          const hashedPassword = await hashPassword(password);
          user = await UserModel.create({
            email,
            username,
            password: hashedPassword,
          });
        } else {
          if (!password) throw new Error('Password is required');
          if (!user || !user.password || !(await comparePassword(password, user.password))) {
            throw new Error('Invalid credentials');
          }
        }

        return {
          id: user._id.toString(),
          email: user.email,
          username: user.username,
          name: user.name ?? null,
        };
      },
    }),
  ],
  secret: process.env.NEXTAUTH_SECRET,
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        await connectDB();
        let dbUser = await UserModel.findOne({ email: user.email });
        if (!dbUser) {
          dbUser = await UserModel.create({
            email: user.email,
            username: user.email?.split('@')[0] || `user_${Date.now()}`,
            name: user.name,
          });
        }
        user.id = dbUser._id.toString();
        user.username = dbUser.username;
      }
      return true;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.email = user.email;
      }
      return token;
    },
    async session({ session, token }) {
      session.user = {
        id: token.id,
        username: token.username,
        email: token.email,
        name: session.user.name ?? null,
      };
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