import { useEffect, useState } from "react";

/** Simulates a network round-trip so skeleton states are visible in the scaffold. */
export function useFakeLoading(delay = 900, deps: unknown[] = []) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const t = setTimeout(() => setLoading(false), delay);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return loading;
}
