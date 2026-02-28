import React, { useEffect } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useActor } from '../hooks/useActor';
import { useQueryClient, useQuery } from '@tanstack/react-query';
import { Shield, Loader2 } from 'lucide-react';

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { identity, login, loginStatus } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();
  const isAuthenticated = !!identity;
  const principalStr = identity?.getPrincipal().toString() ?? 'anonymous';

  // Use React Query to cache admin status, scoped to the current principal
  const {
    data: isAdmin,
    isLoading: adminLoading,
    isFetched: adminFetched,
    refetch: refetchAdmin,
  } = useQuery<boolean>({
    queryKey: ['isAdmin', principalStr],
    queryFn: async () => {
      if (!actor) return false;
      try {
        return await actor.checkAdminStatus();
      } catch {
        return false;
      }
    },
    enabled: !!actor && !actorFetching && isAuthenticated,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false,
  });

  // Re-check admin status whenever the actor changes (e.g., after login)
  useEffect(() => {
    if (actor && !actorFetching && isAuthenticated) {
      refetchAdmin();
    }
  }, [actor, actorFetching, isAuthenticated, refetchAdmin]);

  // Invalidate admin status on logout
  useEffect(() => {
    if (!isAuthenticated) {
      queryClient.invalidateQueries({ queryKey: ['isAdmin'] });
    }
  }, [isAuthenticated, queryClient]);

  const isLoggingIn = loginStatus === 'logging-in';

  // Show loading while actor is initializing or admin status is being checked
  const isLoading = actorFetching || (isAuthenticated && adminLoading && !adminFetched);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Verifying access...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-6 max-w-sm text-center p-8">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
            <Shield className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Admin Access Required</h2>
            <p className="text-muted-foreground text-sm">
              You need to log in with your admin account to access this area.
            </p>
          </div>
          <button
            onClick={() => {
              try {
                login();
              } catch {
                // login() is void; errors surface via loginStatus
              }
            }}
            disabled={isLoggingIn}
            className="w-full px-6 py-3 rounded-lg bg-primary text-primary-foreground font-medium hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Logging in...
              </>
            ) : (
              'Log In'
            )}
          </button>
        </div>
      </div>
    );
  }

  // Authenticated but admin status not yet confirmed — show loading
  if (!adminFetched) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-10 h-10 animate-spin text-primary" />
          <p className="text-muted-foreground text-sm">Checking admin privileges...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="flex flex-col items-center gap-6 max-w-sm text-center p-8">
          <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <Shield className="w-8 h-8 text-destructive" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Access Denied</h2>
            <p className="text-muted-foreground text-sm">
              Your account does not have admin privileges. Please contact the administrator.
            </p>
          </div>
          <p className="text-xs text-muted-foreground font-mono bg-muted px-3 py-1 rounded">
            {principalStr.slice(0, 20)}...
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
