const assert = require('node:assert/strict');
const { test } = require('node:test');
const {
  sessionHarness, blockCall, authMocks, startAuth, oldSession, freshSession,
  refreshedTokens, response, unauthorized,
} = require('./session-protection-harness.cjs');

const closedSession = /sessão encerrada ou alterada/;

async function setup(t) {
  const mocks = authMocks(t);
  const fixture = sessionHarness(t, mocks.dependencies);
  return { ...mocks, ...await startAuth(fixture), session: fixture.sessionLifecycle };
}

test('a protected 401 received during logout cannot start refresh', async (t) => {
  const { api, request, refresh, secureStore, session } = await setup(t);
  const pending = blockCall();
  request.mock.mockImplementationOnce(pending.run);

  const rejected = assert.rejects(api.get('/protected'), closedSession);
  const config = await pending.started;
  session.beginLogout();
  pending.reject(unauthorized(config));
  await rejected;
  await assert.rejects(api.get('/protected'), closedSession);

  assert.equal(request.mock.callCount(), 1);
  assert.equal(refresh.mock.callCount(), 0);
  assert.equal(secureStore.getItemAsync.mock.callCount(), 0);
});

test('a refresh response arriving after logout begins cannot persist tokens or retry', async (t) => {
  const { api, request, refresh, secureStore, authTokenStorage, session } = await setup(t);
  const pending = blockCall();
  request.mock.mockImplementationOnce(async (config) => { throw unauthorized(config); });
  refresh.mock.mockImplementationOnce(pending.run);

  const rejected = assert.rejects(api.get('/protected'), closedSession);
  const config = await pending.started;
  session.beginLogout();
  pending.resolve(response(config, refreshedTokens));
  await rejected;

  assert.equal(request.mock.callCount(), 1);
  assert.equal(secureStore.setItemAsync.mock.callCount(), 1);
  assert.equal(authTokenStorage.getAccessToken(), oldSession.accessToken);
  assert.equal(await authTokenStorage.getRefreshToken(), oldSession.refreshToken);
});

test('a 401 from the old generation cannot refresh or retry under a new session', async (t) => {
  const { api, request, refresh, authTokenStorage, session } = await setup(t);
  const pending = blockCall();
  request.mock.mockImplementationOnce(pending.run);

  const rejected = assert.rejects(api.get('/protected'), closedSession);
  const config = await pending.started;
  session.beginLogout();
  session.finishLogout();
  session.beginSession();
  await authTokenStorage.saveSession(freshSession);
  pending.reject(unauthorized(config));
  await rejected;

  await assert.rejects(api.request(config), closedSession);
  assert.equal(request.mock.callCount(), 1);
  assert.equal(refresh.mock.callCount(), 0);
  assert.equal(authTokenStorage.getAccessToken(), freshSession.accessToken);
});

test('login remains public and the new session can refresh and retry with renewed credentials', async (t) => {
  const { api, request, refresh, authTokenStorage, session } = await setup(t);
  session.beginLogout();
  await authTokenStorage.clear();
  session.finishLogout();
  request.mock.mockImplementationOnce(async (config) => response(config, {
    access_token: freshSession.accessToken, refresh_token: freshSession.refreshToken,
  }));

  const { data } = await api.post('/auth/login');
  assert.equal(request.mock.calls[0].arguments[0].headers.get('Authorization'), undefined);
  session.beginSession();
  await authTokenStorage.saveSession({ accessToken: data.access_token, refreshToken: data.refresh_token });
  request.mock.mockImplementationOnce(async (config) => {
    assert.equal(config.headers.get('Authorization'), 'Bearer fresh-access');
    throw unauthorized(config);
  }, 1);
  request.mock.mockImplementationOnce(async (config) => response(config, { ok: true }), 2);
  refresh.mock.mockImplementationOnce(async (config) => response(config, refreshedTokens));

  assert.deepEqual((await api.get('/protected')).data, { ok: true });
  assert.equal(request.mock.callCount(), 3);
  assert.equal(refresh.mock.callCount(), 1);
  assert.equal(request.mock.calls[2].arguments[0].headers.get('Authorization'), 'Bearer renewed-access');
  assert.deepEqual(JSON.parse(refresh.mock.calls[0].arguments[0].data), { refresh_token: 'fresh-refresh' });
  assert.equal(await authTokenStorage.getRefreshToken(), 'renewed-refresh');
});

test('refresh 401 clears credentials in the current session and does not retry', async (t) => {
  const { api, request, refresh, secureStore, authTokenStorage } = await setup(t);
  request.mock.mockImplementationOnce(async (config) => { throw unauthorized(config); });
  refresh.mock.mockImplementationOnce(async (config) => { throw unauthorized(config); });

  await assert.rejects(api.get('/protected'), (error) =>
    error.response?.status === 401 && error.config?.url === '/auth/refresh',
  );

  assert.equal(refresh.mock.callCount(), 1);
  assert.equal(request.mock.callCount(), 1);
  assert.equal(secureStore.deleteItemAsync.mock.callCount(), 1);
  assert.equal(authTokenStorage.getAccessToken(), null);
  assert.equal(await authTokenStorage.getRefreshToken(), null);
});

test('refresh 401 from a previous generation does not clear new credentials', async (t) => {
  const { api, request, refresh, secureStore, authTokenStorage, session } = await setup(t);
  const pending = blockCall();
  request.mock.mockImplementationOnce(async (config) => { throw unauthorized(config); });
  refresh.mock.mockImplementationOnce(pending.run);

  const rejected = assert.rejects(api.get('/protected'), (error) => error.response?.status === 401);
  const config = await pending.started;
  session.beginLogout();
  session.finishLogout();
  session.beginSession();
  await authTokenStorage.saveSession(freshSession);
  pending.reject(unauthorized(config));
  await rejected;

  assert.equal(request.mock.callCount(), 1);
  assert.equal(secureStore.deleteItemAsync.mock.callCount(), 0);
  assert.equal(authTokenStorage.getAccessToken(), freshSession.accessToken);
  assert.equal(await authTokenStorage.getRefreshToken(), freshSession.refreshToken);
});
