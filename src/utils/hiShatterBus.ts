export interface HiShatterHandle {
  start: (durationMs: number) => void;
  stop: () => void;
}

let activeHandle: HiShatterHandle | null = null;

export function registerHiShatter(handle: HiShatterHandle | null) {
  activeHandle = handle;
}

export function getHiShatter(): HiShatterHandle | null {
  return activeHandle;
}
