const assert = require('node:assert/strict');
const { test } = require('node:test');
const { sessionHarness } = require('./session-protection-harness.cjs');

test('beginSession starts a valid generation', (t) => {
  const { sessionLifecycle: session } = sessionHarness(t);
  const previous = session.getGeneration();
  session.beginSession();

  assert.notEqual(session.getGeneration(), previous);
  assert.equal(session.isCurrent(session.getGeneration()), true);
  assert.equal(session.isLoggingOut(), false);
});

test('beginLogout invalidates the generation and blocks work during and after logout', (t) => {
  const { sessionLifecycle: session } = sessionHarness(t);
  session.beginSession();
  const origin = session.getGeneration();
  session.beginLogout();

  assert.notEqual(session.getGeneration(), origin);
  assert.equal(session.isCurrent(origin), false);
  assert.equal(session.isCurrent(session.getGeneration()), false);
  assert.equal(session.isLoggingOut(), true);

  session.finishLogout();
  assert.equal(session.isCurrent(session.getGeneration()), false);
});

test('a new session is valid and never revalidates work from before logout', (t) => {
  const { sessionLifecycle: session } = sessionHarness(t);
  session.beginSession();
  const oldGeneration = session.getGeneration();
  session.beginLogout();
  const logoutGeneration = session.getGeneration();
  session.finishLogout();
  session.beginSession();

  assert.equal(session.isCurrent(oldGeneration), false);
  assert.equal(session.isCurrent(logoutGeneration), false);
  assert.equal(session.isCurrent(session.getGeneration()), true);
});
