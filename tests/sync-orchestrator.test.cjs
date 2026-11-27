const assert = require('node:assert/strict');
const { test } = require('node:test');
const { sessionHarness, blockCall, syncMocks, syncFile } = require('./session-protection-harness.cjs');

function setup(t) {
  const mocks = syncMocks(t);
  const { load, sessionLifecycle } = sessionHarness(t, mocks.dependencies);
  const { syncOrchestrator } = load(syncFile);
  sessionLifecycle.beginSession();
  return { ...mocks, sync: syncOrchestrator, session: sessionLifecycle };
}

test('a normal round calls every sync stage for the current account', async (t) => {
  const { sync, stages, isConnected, emit } = setup(t);
  await sync.sync('account-1');

  assert.equal(isConnected.mock.callCount(), 1);
  for (const [name, stage] of stages) {
    assert.deepEqual(stage.mock.calls.map((call) => [...call.arguments]), [['account-1']], name);
  }
  assert.deepEqual(emit.mock.calls.slice(-3).map((call) => call.arguments[0]), [
    'feed-requirements', 'feedings', 'feeds',
  ]);
});

test('concurrent requests share one running round and coalesce into one follow-up', async (t) => {
  const { sync, animalGroups, isConnected, stages } = setup(t);
  const firstRound = blockCall();
  animalGroups.sync.mock.mockImplementationOnce(firstRound.run);

  const initial = sync.sync('account-1');
  assert.equal(await firstRound.started, 'account-1');
  const afterMutation = sync.sync();
  const afterAnotherMutation = sync.sync();

  assert.equal(initial, afterMutation);
  assert.equal(initial, afterAnotherMutation);
  assert.equal(isConnected.mock.callCount(), 1);
  assert.equal(animalGroups.sync.mock.callCount(), 1);

  firstRound.resolve();
  await Promise.all([initial, afterMutation, afterAnotherMutation]);

  assert.equal(isConnected.mock.callCount(), 2);
  for (const [name, stage] of stages) {
    assert.deepEqual(stage.mock.calls.map((call) => [...call.arguments]), [
      ['account-1'], ['account-1'],
    ], name);
  }
});

test('logout blocks sync requests and prevents resume until a new session', async (t) => {
  const { sync, session, isConnected } = setup(t);
  session.beginLogout();
  await sync.sync('account-1');
  await sync.suspendAndWait();
  sync.resume();
  session.finishLogout();
  await sync.sync('account-1');
  assert.equal(isConnected.mock.callCount(), 0);

  session.beginSession();
  await sync.sync('account-2');
  assert.equal(isConnected.mock.callCount(), 0);
  sync.resume();
  await sync.sync('account-2');
  assert.equal(isConnected.mock.callCount(), 1);
});

test('suspension stops after the current step without starting later stages or emitting updates', async (t) => {
  const { sync, animalGroups, stages, emit } = setup(t);
  const step = blockCall();
  animalGroups.sync.mock.mockImplementationOnce(step.run);
  const active = sync.sync('account-1');
  await step.started;

  const suspending = sync.suspendAndWait();
  step.resolve();
  await Promise.all([active, suspending]);

  assert.equal(animalGroups.sync.mock.callCount(), 1);
  for (const [name, stage] of stages) {
    if (stage !== animalGroups.sync) assert.equal(stage.mock.callCount(), 0, name);
  }
  assert.equal(emit.mock.callCount(), 0);
});

test('logout discards a round queued before it starts', async (t) => {
  const { sync, session, isConnected } = setup(t);
  const scheduled = sync.sync('account-1');
  session.beginLogout();
  await Promise.all([scheduled, sync.suspendAndWait()]);

  assert.equal(isConnected.mock.callCount(), 0);
});

test('logout discards a queued follow-up and later sync uses only the new account', async (t) => {
  const { sync, session, animalGroups, isConnected } = setup(t);
  const connection = blockCall();
  isConnected.mock.mockImplementationOnce(connection.run);
  const running = sync.sync('account-1');
  await connection.started;
  const followUp = sync.sync();

  session.beginLogout();
  const suspending = sync.suspendAndWait();
  connection.resolve(true);
  await Promise.all([running, followUp, suspending]);
  session.finishLogout();
  assert.equal(isConnected.mock.callCount(), 1);
  assert.equal(animalGroups.sync.mock.callCount(), 0);

  session.beginSession();
  sync.resume();
  await sync.sync();
  assert.equal(isConnected.mock.callCount(), 1);
  await sync.sync('account-2');
  assert.equal(isConnected.mock.callCount(), 2);
  assert.deepEqual(animalGroups.sync.mock.calls.map((call) => [...call.arguments]), [['account-2']]);
});
