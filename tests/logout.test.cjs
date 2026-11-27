const assert = require('node:assert/strict');
const { test } = require('node:test');
const { createStore } = require('zustand/vanilla');
const {
  sessionHarness, blockCall, syncMocks, syncFile, authMocks, startAuth,
  oldSession, refreshedTokens, response, unauthorized,
} = require('./session-protection-harness.cjs');

async function setup(t) {
  const auth = authMocks(t);
  const sync = syncMocks(t);
  const cancelQueries = t.mock.fn(async () => {});
  const clear = t.mock.fn();
  const replace = t.mock.fn();
  const mutate = t.mock.fn((mutationFn) => mutationFn());
  const hookFile = 'src/features/auth/hooks/use-logout.ts';
  let store;
  const fixture = sessionHarness(t, {
    ...auth.dependencies,
    ...sync.dependencies,
    '@tanstack/react-query': {
      useQueryClient: () => ({ cancelQueries, clear }),
      useMutation: ({ mutationFn }) => ({ mutateAsync: () => mutate(mutationFn), isPending: false }),
    },
    'expo-router': { useRouter: () => ({ replace }) },
    zustand: {
      create: (initializer) => {
        store = createStore(initializer);
        return (selector) => selector(store.getState());
      },
    },
    '@/features/auth/hooks': { useLogout: () => fixture.load(hookFile).useLogout() },
    '@/features/auth/stores': { useAuthStore: (selector) => selector(store.getState()) },
  });
  const { authTokenStorage } = await startAuth(fixture);
  fixture.load('src/features/auth/stores/auth.store.ts');
  const { syncOrchestrator } = fixture.load(syncFile);
  const { useLogoutViewModel } = fixture.load('src/features/auth/viewmodels/use-logout.view-model.ts');
  const { logout } = useLogoutViewModel();
  store.getState().authenticate({ id: 'account-1', name: 'User', email: 'user@example.test' });

  return {
    ...fixture, ...auth, ...sync, authTokenStorage, syncOrchestrator, logout, mutate,
    cancelQueries, clear, replace, getAuthState: store.getState,
  };
}

test('logout waits for running sync and refresh before attempting remote revocation', async (t) => {
  const h = await setup(t);
  const syncStep = blockCall();
  const refreshRequest = blockCall();
  const revocation = blockCall();
  h.animalGroups.sync.mock.mockImplementationOnce(syncStep.run);
  h.request.mock.mockImplementationOnce(async (config) => { throw unauthorized(config); });
  h.refresh.mock.mockImplementationOnce(refreshRequest.run);
  h.request.mock.mockImplementationOnce(revocation.run, 1);

  const syncing = h.syncOrchestrator.sync('account-1');
  await syncStep.started;
  const protectedRequest = assert.rejects(h.api.get('/protected'), /sessão encerrada ou alterada/);
  const config = await refreshRequest.started;
  const logout = h.logout();
  assert.equal(h.sessionLifecycle.isLoggingOut(), true);
  await h.syncOrchestrator.sync('account-1');
  assert.equal(h.mutate.mock.callCount(), 0);
  assert.equal(h.secureStore.deleteItemAsync.mock.callCount(), 0);
  assert.equal(h.getAuthState().status, 'authenticated');

  syncStep.resolve();
  await syncing;
  // Let logout continue from the sync barrier while refresh is still blocked.
  await Promise.resolve();
  assert.equal(h.verifyFeedingGroups.mock.callCount(), 0);
  assert.equal(h.mutate.mock.callCount(), 0);
  assert.equal(h.secureStore.deleteItemAsync.mock.callCount(), 0);

  refreshRequest.resolve(response(config, refreshedTokens));
  const remote = await revocation.started;
  assert.equal(remote.method, 'delete');
  assert.equal(remote.url, '/auth/logout');
  assert.equal(remote.headers.get('Authorization'), `Bearer ${oldSession.accessToken}`);
  assert.equal(h.secureStore.deleteItemAsync.mock.callCount(), 0);
  assert.equal(await h.authTokenStorage.getRefreshToken(), oldSession.refreshToken);
  assert.equal(h.cancelQueries.mock.callCount(), 0);
  assert.equal(h.getAuthState().status, 'authenticated');

  revocation.resolve(response(remote));
  await Promise.all([logout, protectedRequest]);
  assert.equal(h.authTokenStorage.getAccessToken(), null);
  assert.equal(await h.authTokenStorage.getRefreshToken(), null);
  assert.equal(h.getAuthState().status, 'unauthenticated');
  assert.equal(h.getAuthState().user, null);
  assert.equal(h.clear.mock.callCount(), 1);
  assert.deepEqual(h.replace.mock.calls.map((call) => [...call.arguments]), [['/']]);
});

test('remote revocation failure still clears local authentication and preserves pending SQLite data', async (t) => {
  const h = await setup(t);
  const { migrateDatabase } = h.load('src/infrastructure/database/migrations/migrate.ts');
  await migrateDatabase(h.db);
  h.native.exec(`
    INSERT INTO animal_groups (
      local_id, account_id, name, animal_count, sync_status, local_created_at, local_updated_at
    ) VALUES ('offline-group', 'account-1', 'Offline group', 3, 'pending_create', 'now', 'now')
  `);
  const pendingGroups = h.native.prepare("SELECT * FROM animal_groups WHERE sync_status = 'pending_create'");
  const beforeLogout = pendingGroups.all();
  assert.equal(beforeLogout.length, 1);

  h.request.mock.mockImplementationOnce(async (config) => { throw unauthorized(config); });
  const origin = h.sessionLifecycle.getGeneration();
  await h.logout();

  assert.equal(h.request.mock.callCount(), 1);
  const [remote] = h.request.mock.calls[0].arguments;
  assert.equal(remote.method, 'delete');
  assert.equal(remote.url, '/auth/logout');
  assert.equal(h.refresh.mock.callCount(), 0);
  assert.equal(h.cancelQueries.mock.callCount(), 1);
  assert.equal(h.secureStore.deleteItemAsync.mock.callCount(), 1);
  assert.equal(h.authTokenStorage.getAccessToken(), null);
  assert.equal(await h.authTokenStorage.getRefreshToken(), null);
  assert.equal(h.getAuthState().status, 'unauthenticated');
  assert.equal(h.getAuthState().user, null);
  assert.equal(h.sessionLifecycle.isCurrent(origin), false);
  assert.equal(h.clear.mock.callCount(), 1);
  assert.deepEqual(h.replace.mock.calls.map((call) => [...call.arguments]), [['/']]);
  assert.deepEqual(pendingGroups.all(), beforeLogout);
});
