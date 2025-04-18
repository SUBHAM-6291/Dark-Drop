import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import CredentialsProvider from 'next-auth/providers/credentials';
import { UserModel } from '@/app/Backend/models/UserModel';
import { connectDB } from '@/app/Backend/DB/DB';
import { hashPassword, comparePassword } from '@/app/Backend/lib/auth/auth';
import { TokenPayload } from '../lib/auth/Types/authtoken';

declare module 'next-auth' {
  interface User extends TokenPayload {
    name?: string | null;
  }

  interface Session {
    user: TokenPayload & { name?: string | null };
  }
}

declare module 'next-auth/jwt' {
  interface JWT extends TokenPayload { }
}

export const authOptions: NextAuthOptions = {

  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || (() => { throw new Error('GOOGLE_CLIENT_ID is missing'); })(),
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || (() => { throw new Error('GOOGLE_CLIENT_SECRET is missing'); })(),
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
          if (user) throw new Error('User already exists with this email');

          const hashedPassword = await hashPassword(password);
          user = await UserModel.create({
            email,
            username,
            password: hashedPassword,
          });
        } else {
          if (!password) throw new Error('Password is required for signin');
          if (!user) throw new Error('User not found');
          if (!user.password || !(await comparePassword(password, user.password))) {
            throw new Error('Invalid email or password');
          }
        }

        return {
          id: user._id.toString(),
          username: user.username,
          email: user.email ?? null,
          name: user.name ?? null,
        };
      },
    }),
  ],

  secret: process.env.NEXTAUTH_SECRET || (() => { throw new Error('NEXTAUTH_SECRET is missing'); })(),

  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',

  },

  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60,
  },

  callbacks: {


    async signIn({ user, account, profile }) {

      if (account?.provider === "google" && profile) {

        if (!profile.email) throw new Error('Google account email is required');

        await connectDB();

        const email = profile.email;
        let baseUsername = email.split('@')[0] || `user_${Date.now()}`;
        let username = baseUsername;


        const existingUser = await UserModel.findOne({ email })

        if (existingUser) {
          return true;
        } else {
          const details = {
            username: username,
            email: profile.email,
          }

          await UserModel.create(details);

          return true;
        }
      }

      return true;
    },

    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.username = user.username;
        token.email = user.email ?? null;
      }
      return token;
    },

    async session({ session, token }) {
      session.user = {
        id: token.id,
        username: token.username,
        email: token.email ?? null,
        name: session.user.name ?? null,
      };
      return session;
    },
  },
};