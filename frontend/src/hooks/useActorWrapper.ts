import { useActor } from './useActor';

/**
 * Safe wrapper around useActor that catches initialization errors
 * and ensures graceful fallback when actor creation fails.
 */
export function useActorWrapper() {
  try {
    const result = useActor();
    return result;
  } catch {
    return {
      actor: null,
      isFetching: false,
    };
  }
}
