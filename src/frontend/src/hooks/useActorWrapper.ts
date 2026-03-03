import { useActor } from "./useActor";

export function useActorWrapper() {
  const { actor, isFetching } = useActor();

  async function call<T>(fn: () => Promise<T>): Promise<T> {
    if (!actor) throw new Error("Actor not available");
    return fn();
  }

  return { actor, isFetching, call };
}
