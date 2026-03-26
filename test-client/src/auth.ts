import NextAuth from 'next-auth';
import type { NextAuthConfig } from 'next-auth';

const config: NextAuthConfig = {
  providers: [
    {
      id: 'kapustin',
      name: 'Kapustin ID',
      type: 'oauth',
      authorization: {
        url: 'http://localhost:3001/oauth/authorize',
        params: { scope: 'openid profile email' },
      },
      token: 'http://localhost:3001/oauth/token',
      userinfo: 'http://localhost:3001/oauth/userinfo',
      clientId: 'kapustin-team',
      clientSecret: 'test-secret',
      checks: ['pkce', 'state'],
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.name,
          email: profile.email,
          image: profile.picture,
        };
      },
    },
  ],
  callbacks: {
    authorized({ auth }) {
      return !!auth?.user;
    },
  },
  pages: {
    signIn: '/',
  },
};

export const { handlers, signIn, signOut, auth } = NextAuth(config);
