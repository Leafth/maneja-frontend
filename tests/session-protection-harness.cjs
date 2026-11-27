const { AxiosError, default: axios } = require('axios');
const { harness } = require('./feeding-harness.cjs');

const lifecycleFile = 'src/infrastructure/auth/session-lifecycle.ts';
const interceptorFile = 'src/infrastructure/api/api-interceptors.ts';
const syncFile = 'src/infrastructure/sync/sync-orchestrator.ts';

function sessionHarness(test, dependencies = {}) {
  const fixture = harness(dependencies);
  test.after(() => fixture.close());
  const { sessionLifecycle } = fixture.load(lifecycleFile);
  return { ...fixture, sessionLifecycle };
}

function deferred() {
  let resolve;
  let reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}

function blockCall() {
  const started = deferred();
  const result = deferred();
  return {
    started: started.promise,
    resolve: result.resolve,
    reject: result.reject,
    run(value) {
      started.resolve(value);
      return result.promise;
    },
  };
}

function syncMocks(test) {
  const stages = [];
  const service = (name, ...methods) => Object.fromEntries(methods.map((method) => {
    const stage = test.mock.fn(async () => {});
    stages.push([name + '.' + method, stage]);
    return [method, stage];
  }));
  const animalGroups = service('animalGroups', 'sync', 'pullRemote');
  const verifyFeedingGroups = test.mock.fn(async () => {});
  stages.push(['verifyFeedingGroups', verifyFeedingGroups]);
  const isConnected = test.mock.fn(async () => true);
  const emit = test.mock.fn();

  return {
    animalGroups, verifyFeedingGroups, stages, isConnected, emit,
    dependencies: {
      '@/features/animal-groups/services/animal-group-sync.service': { animalGroupSyncService: animalGroups },
      '@/features/feeding/services/feed-requirement-sync.service': {
        feedRequirementSyncService: service('feedRequirements', 'sync', 'pull'),
      },
      '@/features/feeding/services/feed-stock-sync.service': { feedStockSyncService: service('feedStock', 'sync') },
      '@/features/feeding/services/feed-sync.service': { feedSyncService: service('feeds', 'syncUpserts', 'syncDeletes', 'pull') },
      '@/features/feeding/services/feeding-stock-history.service': { feedingStockHistoryService: service('stockHistory', 'pull') },
      '@/features/feeding/services/feeding-sync-context': { verifyFeedingGroups },
      '@/features/feeding/services/feeding-sync.service': { feedingSyncService: service('feedings', 'pull') },
      '@/features/movements/repositories/movement-command.repository': {
        movementCommandRepository: service('movementCommands', 'recoverInterrupted'),
      },
      '@/features/movements/services': { occupationSyncService: service('occupations', 'pull') },
      '@/features/movements/services/movement-sync.service': { movementSyncService: service('movements', 'sync') },
      '@/features/terrains/services/terrain-sync.service': { terrainSyncService: service('terrains', 'sync', 'pull') },
      '../network/network.service': { networkService: { isConnected } },
      './sync-events': { syncEvents: { emit } },
    },
  };
}

const oldSession = { accessToken: 'old-access', refreshToken: 'old-refresh' };
const freshSession = { accessToken: 'fresh-access', refreshToken: 'fresh-refresh' };
const refreshedTokens = { access_token: 'renewed-access', refresh_token: 'renewed-refresh' };

function response(config, data) {
  return { config, data, status: 200, statusText: 'OK', headers: {} };
}

function unauthorized(config) {
  return new AxiosError('Unauthorized', AxiosError.ERR_BAD_REQUEST, config, undefined, {
    ...response(config), status: 401, statusText: 'Unauthorized',
  });
}

function authMocks(test) {
  const credentials = new Map();
  const secureStore = {
    getItemAsync: test.mock.fn(async (key) => credentials.get(key) ?? null),
    setItemAsync: test.mock.fn(async (key, value) => { credentials.set(key, value); }),
    deleteItemAsync: test.mock.fn(async (key) => { credentials.delete(key); }),
  };
  const unexpectedRequest = async (config) => {
    throw new Error(`Unexpected request: ${config.method} ${config.url}`);
  };
  const request = test.mock.fn(unexpectedRequest);
  const refresh = test.mock.fn(unexpectedRequest);
  const api = axios.create({ adapter: request });
  const refreshApi = axios.create({ adapter: refresh });
  const clients = { api, refreshApi };

  return {
    api, request, refresh, secureStore,
    dependencies: {
      'expo-secure-store': secureStore,
      './api-client': clients,
      '@/infrastructure/api': clients,
    },
  };
}

async function startAuth(fixture, session = oldSession) {
  const interceptors = fixture.load(interceptorFile);
  const { authTokenStorage } = fixture.load('src/infrastructure/storage/index.ts');
  fixture.sessionLifecycle.beginSession();
  await authTokenStorage.saveSession(session);
  return { ...interceptors, authTokenStorage };
}

module.exports = {
  sessionHarness, blockCall, syncMocks, syncFile,
  authMocks, startAuth, oldSession, freshSession, refreshedTokens, response, unauthorized,
};
