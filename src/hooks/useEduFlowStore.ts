import { useState, useEffect } from 'react';
import { store, EduFlowState } from '../services/storage';

export function useEduFlowStore(): {
  state: EduFlowState;
  store: typeof store;
} {
  const [state, setState] = useState<EduFlowState>(store.getState());

  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      setState(store.getState());
    });
    return unsubscribe;
  }, []);

  return { state, store };
}
