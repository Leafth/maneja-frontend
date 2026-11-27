let generation = 0;
let loggingOut = false;

export const sessionLifecycle = {
  getGeneration: () => generation,

  isCurrent: (origin: number) => !loggingOut && origin === generation,

  isLoggingOut: () => loggingOut,

  beginLogout() {
    loggingOut = true;
    generation += 1;
  },

  finishLogout() {
    loggingOut = true;
  },

  beginSession() {
    generation += 1;
    loggingOut = false;
  },
};
