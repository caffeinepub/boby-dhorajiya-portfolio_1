import React, { useState, useEffect } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useActor } from '../hooks/useActor';
import { useQueryClient } from '@tanstack/react-query';
import { Shield, Lock, Loader2, ShieldCheck, AlertCircle, LogIn, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { ClaimAdminResult } from '../backend';

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { identity, login, clear, loginStatus, isInitializing } = useInternetIdentity();
  const { actor, isFetching: actorFetching } = useActor();
  const queryClient = useQueryClient();

  const isAuthenticated = !!identity;
  const isLoggingIn = loginStatus === 'logging-in';

  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [adminCheckLoading, setAdminCheckLoading] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimError, setClaimError] = useState<'already-exists' | 'anonymous' | null>(null);

  // Check admin status whenever actor becomes available
  useEffect(() => {
    if (!actor || actorFetching) return;

    let cancelled = false;
    setAdminCheckLoading(true);

    actor.isCallerAdmin()
      .then((result) => {
        if (!cancelled) {
          setIsAdmin(result);
          setAdminCheckLoading(false);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setIsAdmin(false);
          setAdminCheckLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [actor, actorFetching]);

  // Reset admin state when identity changes (logout/login)
  useEffect(() => {
    setIsAdmin(null);
    setClaimError(null);
  }, [identity]);

  const handleLogin = async () => {
    try {
      await login();
      // Invalidate actor query so it re-initializes with the new authenticated identity
      queryClient.invalidateQueries({ queryKey: ['actor'] });
    } catch (error: unknown) {
      const err = error as Error;
      if (err?.message === 'User is already authenticated') {
        await clear();
        setTimeout(() => login(), 300);
      } else {
        toast.error('Login failed. Please try again.');
      }
    }
  };

  const handleLogout = async () => {
    await clear();
    queryClient.clear();
    setIsAdmin(null);
    setClaimError(null);
  };

  const handleClaimAdmin = async () => {
    if (!actor) return;
    setClaimError(null);
    setIsClaiming(true);

    try {
      const result = await actor.claimAdmin();

      if (result === ClaimAdminResult.success) {
        toast.success('Admin access granted! Welcome to the admin panel.');
        // Re-check admin status immediately with the same actor
        setAdminCheckLoading(true);
        try {
          const adminStatus = await actor.isCallerAdmin();
          setIsAdmin(adminStatus);
        } catch {
          setIsAdmin(false);
        }
        setAdminCheckLoading(false);
        queryClient.invalidateQueries({ queryKey: ['isAdmin'] });
      } else if (result === ClaimAdminResult.alreadyClaimed) {
        setClaimError('already-exists');
        toast.error('An admin is already registered. You are not authorized.');
      } else if (result === ClaimAdminResult.notAuthenticated) {
        setClaimError('anonymous');
        toast.error('You must be logged in to claim admin access.');
      }
    } catch (error: unknown) {
      const message = (error as Error)?.message ?? '';
      if (message.toLowerCase().includes('already') || message.toLowerCase().includes('registered')) {
        setClaimError('already-exists');
        toast.error('An admin is already registered.');
      } else {
        toast.error('Failed to claim admin access. Please try again.');
      }
    } finally {
      setIsClaiming(false);
    }
  };

  // Show loading while identity is initializing, actor is being fetched, or admin check is in progress
  const isCheckingAccess = isInitializing || actorFetching || adminCheckLoading || (isAuthenticated && isAdmin === null);

  if (isCheckingAccess) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
          <p className="text-muted-foreground">Verifying access...</p>
        </div>
      </div>
    );
  }

  // Not logged in — show login prompt with inline login button
  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground">Please log in to access the admin panel.</p>
          </div>
          <Button
            onClick={handleLogin}
            disabled={isLoggingIn}
            size="lg"
            className="w-full gap-2"
          >
            {isLoggingIn ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Logging in...
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4" />
                Go to Login
              </>
            )}
          </Button>
        </div>
      </div>
    );
  }

  // Logged in but not admin
  if (!isAdmin) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center space-y-6 max-w-md w-full">
          <div className="w-16 h-16 rounded-2xl bg-destructive/10 border border-destructive/30 flex items-center justify-center mx-auto">
            <Shield className="w-8 h-8 text-destructive" />
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
            <p className="text-muted-foreground">
              You don't have admin privileges to access this area.
            </p>
          </div>

          {claimError === 'already-exists' ? (
            <div className="p-4 rounded-xl bg-destructive/5 border border-destructive/20 flex items-start gap-3 text-sm text-left">
              <AlertCircle className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
              <p className="text-destructive">
                An admin is already registered. Contact the existing admin for access.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-primary/5 border border-primary/20 text-sm text-muted-foreground text-left">
                <p className="font-medium text-foreground mb-1">First time here?</p>
                <p>
                  If no admin has been registered yet, you can claim admin access with your
                  current identity.
                </p>
              </div>
              <Button
                onClick={handleClaimAdmin}
                disabled={isClaiming}
                className="w-full gap-2"
                size="lg"
              >
                {isClaiming ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Claiming Admin Access...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Claim Admin Access
                  </>
                )}
              </Button>
            </div>
          )}

          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground mb-2">Logged in with a different account?</p>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="gap-2"
            >
              <LogOut className="w-4 h-4" />
              Switch Account
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Verified admin — render children
  return <>{children}</>;
}
