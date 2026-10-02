export type SyncScope = 'animal-groups';

type SyncListener = (scope: SyncScope) => void;

const listeners = new Set<SyncListener>();

function subscribe(listener: SyncListener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

function emit(scope: SyncScope) {
  for (const listener of listeners) {
    listener(scope);
  }
}

export const syncEvents = {
  subscribe,
  emit,
};
