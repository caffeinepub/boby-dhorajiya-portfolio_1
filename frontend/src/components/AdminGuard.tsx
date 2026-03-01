import React from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useQuery } from '@tanstack/react-query';
import { useActor } from '../hooks/useActor';
import { Loader2, ShieldAlert } from 'lucide-react';

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { identity, login, loginStatus, isInitializing } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const {
    data: isAdmin,
    isLoading: adminLoading,
  } = useQuery<boolean>({
    queryKey: ['isAdmin', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor) return false;
      return actor.isCallerAdmin();
    },
    enabled: !!actor && !actorFetching && isAuthenticated,
    retry: false,
  });

  if (isInitializing || actorFetching || (isAuthenticated && adminLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-6 max-w-sm text-center px-4">
          <div className="p-4 rounded-full bg-primary/10">
            <ShieldAlert className="h-12 w-12 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Admin Access Required</h2>
            <p className="text-muted-foreground text-sm">
              Please log in with your Internet Identity to access the admin panel.
            </p>
          </div>
          <button
            onClick={() => login()}
            disabled={isLoggingIn}
            className="w-full px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              'Login with Internet Identity'
            )}
          </button>
        </div>
      </div>
    );
  }

  if (isAdmin === false) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-6 max-w-sm text-center px-4">
          <div className="p-4 rounded-full bg-destructive/10">
            <ShieldAlert className="h-12 w-12 text-destructive" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2>
            <p className="text-muted-foreground text-sm">
              Your account does not have admin privileges. Please contact the site administrator.
            </p>
          </div>
          <p className="text-xs text-muted-foreground break-all">
            Principal: {identity?.getPrincipal().toString()}
          </p>
        </div>
      </div>
    );
  }

  if (isAdmin) {
    return <>{children}</>;
  }

  return null;
}
