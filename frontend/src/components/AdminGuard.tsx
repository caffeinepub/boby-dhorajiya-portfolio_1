import React, { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { useIsCallerAdmin, useClaimAdmin } from '../hooks/useQueries';
import { useActor } from '../hooks/useActor';
import { useQueryClient } from '@tanstack/react-query';
import { Shield, Lock, Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import LoginButton from './LoginButton';
import type { ClaimAdminResult } from '../backend';

interface AdminGuardProps {
  children: React.ReactNode;
}

export default function AdminGuard({ children }: AdminGuardProps) {
  const { identity, isInitializing } = useInternetIdentity();
  const { isFetching: actorFetching } = useActor();
  const isAuthenticated = !!identity;
  const queryClient = useQueryClient();

  const {
    data: isAdmin,
    isLoading: adminLoading,
    isFetching: adminFetching,
    refetch: refetchAdmin,
  } = useIsCallerAdmin();

  const claimAdminMutation = useClaimAdmin();
  const [claimStatus, setClaimStatus] = useState<'idle' | 'already-exists' | 'anonymous'>('idle');

  const handleClaimAdmin = async () => {
    setClaimStatus('idle');
    try {
      const result: ClaimAdminResult = await claimAdminMutation.mutateAsync();

      if (result.__kind__ === 'adminClaimed') {
        toast.success('Admin access granted! Welcome to the admin panel.');
        // Invalidate and force refetch admin status
        await queryClient.invalidateQueries({ queryKey: ['isAdmin'] });
        await refetchAdmin();
      } else if (result.__kind__ === 'adminAlreadyExists') {
        setClaimStatus('already-exists');
        toast.error('An admin is already registered. You are not authorized.');
      } else if (result.__kind__ === 'anonymousPrincipal') {
        setClaimStatus('anonymous');
        toast.error('You must be logged in to claim admin access.');
      }
    } catch (error: unknown) {
      const message = (error as Error)?.message ?? '';
      if (message.toLowerCase().includes('already') || message.toLowerCase().includes('registered')) {
        setClaimStatus('already-exists');
        toast.error('An admin is already registered.');
      } else {
        toast.error('Failed to claim admin access. Please try again.');
      }
    }
  };

  // Show loading while:
  // 1. Internet Identity is initializing
  // 2. Actor is being created/fetched
  // 3. Admin status query is loading or fetching
  const isCheckingAccess =
    isInitializing ||
    actorFetching ||
    adminLoading ||
    adminFetching;

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

  // Not logged in — show login prompt
  if (!isAuthenticated) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="text-center space-y-6 max-w-md">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center mx-auto">
            <Lock className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold mb-2">Admin Access Required</h2>
            <p className="text-muted-foreground">Please log in to access the admin panel.</p>
          </div>
          <LoginButton />
        </div>
      </div>
    );
  }

  // Logged in but not admin
  if (!isAdmin) {
    const isClaiming = claimAdminMutation.isPending;

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

          {claimStatus === 'already-exists' ? (
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
            <LoginButton />
          </div>
        </div>
      </div>
    );
  }

  // Verified admin — render children
  return <>{children}</>;
}
