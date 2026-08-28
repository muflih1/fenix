import {useRef} from 'react';

export function useStable<T>(init: () => T) {
  const stableRef = useRef<{value: T}>(null);
  if (stableRef.current == null) {
    stableRef.current = {value: init()};
  }
  return stableRef.current.value;
}
