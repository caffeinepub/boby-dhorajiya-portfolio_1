import React from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { Loader2 } from 'lucide-react';

export default function LoginButton() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      // Clear all cached data including admin status on logout
      queryClient.clear();
    } else {
      try {
        await login();
        // Invalidate admin status so it re-checks with the new identity
        queryClient.invalidateQueries({ queryKey: ['isAdmin'] });
        queryClient.invalidateQueries({ queryKey: ['actor'] });
      } catch (error: unknown) {
        const err = error as Error;
        console.error('Login error:', err);
        if (err.message === 'User is already authenticated') {
          await clear();
          setTimeout(() => login(), 300);
        }
      }
    }
  };

  return (
    <button
      onClick={handleAuth}
      disabled={isLoggingIn}
      className={`px-5 py-2 rounded-lg transition-colors font-medium text-sm flex items-center gap-2 ${
        isAuthenticated
          ? 'bg-muted hover:bg-muted/80 text-foreground'
          : 'bg-primary hover:bg-primary/90 text-primary-foreground'
      } disabled:opacity-50`}
    >
      {isLoggingIn && <Loader2 className="w-4 h-4 animate-spin" />}
      {isLoggingIn ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login'}
    </button>
  );
}
