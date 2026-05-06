import { useMemo } from 'react';

export function useAnimationState({ speed, isCatching, isCelebrating }) {
  return useMemo(() => {
    if (isCelebrating) return 'celebrate';
    if (isCatching) return 'catch';
    if (speed > 0.02) return 'run';
    return 'idle';
  }, [speed, isCatching, isCelebrating]);
}
