import React from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQueryClient } from '@tanstack/react-query';
import { LogIn, LogOut, Loader2 } from 'lucide-react';

export default function LoginButton() {
  const { login, clear, loginStatus, identity } = useInternetIdentity();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const handleAuth = async () => {
    if (isAuthenticated) {
      await clear();
      queryClient.clear();
    } else {
      try {
        await login();
        // After successful login, invalidate admin status so AdminGuard re-checks
        // with the newly authenticated identity
        queryClient.invalidateQueries({ queryKey: ['isAdmin'] });
        queryClient.invalidateQueries({ queryKey: ['actor'] });
      } catch (error: unknown) {
        const err = error as Error;
        if (err?.message === 'User is already authenticated') {
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
      className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 disabled:opacity-50 ${
        isAuthenticated
          ? 'bg-muted text-muted-foreground hover:bg-muted/80 hover:text-foreground'
          : 'bg-primary text-primary-foreground hover:opacity-90'
      }`}
    >
      {isLoggingIn ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : isAuthenticated ? (
        <LogOut className="w-4 h-4" />
      ) : (
        <LogIn className="w-4 h-4" />
      )}
      {isLoggingIn ? 'Logging in...' : isAuthenticated ? 'Logout' : 'Login'}
    </button>
  );
}
