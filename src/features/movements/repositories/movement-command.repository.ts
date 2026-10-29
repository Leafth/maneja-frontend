import * as Crypto from 'expo-crypto';

import { movementCommandLocalDataSource } from '../data/movement-command-local-data-source';
import type { MovementCommand } from '../models';

interface CreateMovementCommandInput {
  accountId: string;

  groupLocalId: string;

  originTerrainLocalId: string | null;
  destinationTerrainLocalId: string;
}

async function create(input: {
  accountId: string;
  groupLocalId: string;
  destinationTerrainLocalId: string;
}): Promise<MovementCommand> {
  return movementCommandLocalDataSource.createOptimistic({
    localId: Crypto.randomUUID(),
    accountId: input.accountId,
    groupLocalId: input.groupLocalId,
    destinationTerrainLocalId: input.destinationTerrainLocalId,
    now: new Date().toISOString(),
  });
}

async function findQueued(accountId: string): Promise<MovementCommand[]> {
  return movementCommandLocalDataSource.findQueued(accountId);
}

async function markSending(localId: string): Promise<void> {
  await movementCommandLocalDataSource.updateDispatchState(localId, 'sending');
}

async function markQueued(localId: string, error?: string): Promise<void> {
  await movementCommandLocalDataSource.updateDispatchState(
    localId,
    'queued',
    error ?? null,
  );
}

async function markUncertain(localId: string, error: string): Promise<void> {
  await movementCommandLocalDataSource.updateDispatchState(
    localId,
    'uncertain',
    error,
  );
}

async function markRejected(localId: string, error: string): Promise<void> {
  await movementCommandLocalDataSource.updateDispatchState(
    localId,
    'rejected',
    error,
  );
}

async function markConfirmed(
  localId: string,
  data: {
    remoteId: string;
    remoteStartedAt: string;
  },
): Promise<void> {
  await movementCommandLocalDataSource.markConfirmed(localId, data);
}

async function recoverInterrupted(accountId: string): Promise<void> {
  await movementCommandLocalDataSource.markSendingAsUncertain(accountId);
}

export const movementCommandRepository = {
  create,

  findQueued,

  markSending,
  markQueued,
  markUncertain,
  markRejected,
  markConfirmed,

  recoverInterrupted,
};
