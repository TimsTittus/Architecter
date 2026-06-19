import { createAuthClient } from 'better-auth/react';

export const authClient = createAuthClient({
  sessionOptions: {
    refetchOnWindowFocus: false,
  },
});

export const { signIn, signOut, useSession } = authClient;
