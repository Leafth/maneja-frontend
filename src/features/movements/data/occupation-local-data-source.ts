import { withDatabase } from '@/infrastructure/database/database';

import type { Occupation } from '../models';

interface OccupationRow {
  local_id: string;
  remote_id: string | null;
  account_id: string;

  group_local_id: string | null;
  group_remote_id: string | null;
  group_name: string;

  terrain_local_id: string | null;
  terrain_remote_id: string | null;
  terrain_name: string;

  started_at: string;
  ended_at: string | null;

  movement_command_local_id: string | null;
  source: Occupation['source'];
}

function toModel(row: OccupationRow): Occupation {
  return {
    localId: row.local_id,
    remoteId: row.remote_id,
    accountId: row.account_id,

    groupLocalId: row.group_local_id,
    groupRemoteId: row.group_remote_id,
    groupName: row.group_name,

    terrainLocalId: row.terrain_local_id,
    terrainRemoteId: row.terrain_remote_id,
    terrainName: row.terrain_name,

    startedAt: row.started_at,
    endedAt: row.ended_at,

    movementCommandLocalId: row.movement_command_local_id,
    source: row.source,
  };
}

async function findByGroupLocalId(localId: string): Promise<Occupation[]> {
  const rows = await withDatabase((database) =>
    database.getAllAsync<OccupationRow>(
      `
        SELECT *
        FROM occupations
        WHERE group_local_id = ?
        ORDER BY started_at DESC
      `,
      [localId],
    ),
  );

  return rows.map(toModel);
}

async function findByTerrainLocalId(localId: string): Promise<Occupation[]> {
  const rows = await withDatabase((database) =>
    database.getAllAsync<OccupationRow>(
      `
        SELECT *
        FROM occupations
        WHERE terrain_local_id = ?
        ORDER BY started_at DESC
      `,
      [localId],
    ),
  );

  return rows.map(toModel);
}

async function findAll(): Promise<Occupation[]> {
  const rows = await withDatabase((database) =>
    database.getAllAsync<OccupationRow>(`
      SELECT *
      FROM occupations
      ORDER BY started_at DESC
    `),
  );

  return rows.map(toModel);
}

async function upsertRemote(occupation: Occupation): Promise<void> {
  await withDatabase(async (database) => {
    const optimistic = occupation.remoteId
      ? await database.getFirstAsync<OccupationRow>(
          `
            SELECT *
            FROM occupations
            WHERE account_id = ?
              AND remote_id = ?
            LIMIT 1
          `,
          [occupation.accountId, occupation.remoteId],
        )
      : null;

    const localCandidate =
      optimistic ??
      (occupation.groupLocalId && occupation.terrainRemoteId
        ? await database.getFirstAsync<OccupationRow>(
            `
              SELECT *
              FROM occupations
              WHERE remote_id IS NULL
                AND group_local_id = ?
                AND terrain_remote_id = ?
                AND ended_at IS NULL
              ORDER BY started_at DESC
              LIMIT 1
            `,
            [occupation.groupLocalId, occupation.terrainRemoteId],
          )
        : null);

    if (localCandidate) {
      await database.runAsync(
        `
          UPDATE occupations
          SET
            remote_id = ?,
            group_local_id = ?,
            group_remote_id = ?,
            group_name = ?,
            terrain_local_id = ?,
            terrain_remote_id = ?,
            terrain_name = ?,
            started_at = ?,
            ended_at = ?,
            source = 'remote'
          WHERE local_id = ?
        `,
        [
          occupation.remoteId,
          occupation.groupLocalId,
          occupation.groupRemoteId,
          occupation.groupName,
          occupation.terrainLocalId,
          occupation.terrainRemoteId,
          occupation.terrainName,
          occupation.startedAt,
          occupation.endedAt,
          localCandidate.local_id,
        ],
      );

      if (localCandidate.movement_command_local_id && occupation.remoteId) {
        const now = new Date().toISOString();

        await database.runAsync(
          `
            UPDATE movement_commands
            SET
              remote_id = ?,
              sync_status = 'synced',
              dispatch_state = 'confirmed',
              remote_started_at = ?,
              local_updated_at = ?,
              last_synced_at = ?,
              last_sync_error = NULL
            WHERE local_id = ?
          `,
          [
            occupation.remoteId,
            occupation.startedAt,
            now,
            now,
            localCandidate.movement_command_local_id,
          ],
        );
      }

      return;
    }

    await database.runAsync(
      `
        INSERT INTO occupations (
          local_id,
          remote_id,
          account_id,
          group_local_id,
          group_remote_id,
          group_name,
          terrain_local_id,
          terrain_remote_id,
          terrain_name,
          started_at,
          ended_at,
          movement_command_local_id,
          source
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(local_id) DO UPDATE SET
          remote_id = excluded.remote_id,
          group_local_id = excluded.group_local_id,
          group_remote_id = excluded.group_remote_id,
          group_name = excluded.group_name,
          terrain_local_id = excluded.terrain_local_id,
          terrain_remote_id = excluded.terrain_remote_id,
          terrain_name = excluded.terrain_name,
          started_at = excluded.started_at,
          ended_at = excluded.ended_at,
          source = excluded.source
      `,
      [
        occupation.localId,
        occupation.remoteId,
        occupation.accountId,
        occupation.groupLocalId,
        occupation.groupRemoteId,
        occupation.groupName,
        occupation.terrainLocalId,
        occupation.terrainRemoteId,
        occupation.terrainName,
        occupation.startedAt,
        occupation.endedAt,
        occupation.movementCommandLocalId,
        occupation.source,
      ],
    );
  });
}

async function markCommandConfirmed(
  movementCommandLocalId: string,
  data: { remoteId: string; startedAt: string },
): Promise<void> {
  await withDatabase((database) =>
    database.runAsync(
      `
        UPDATE occupations
        SET
          remote_id = ?,
          started_at = ?,
          source = 'remote'
        WHERE movement_command_local_id = ?
      `,
      [data.remoteId, data.startedAt, movementCommandLocalId],
    ),
  );
}

async function deleteByMovementCommandLocalId(localId: string): Promise<void> {
  await withDatabase((database) =>
    database.runAsync(
      `
        DELETE FROM occupations
        WHERE movement_command_local_id = ?
      `,
      [localId],
    ),
  );
}

export const occupationLocalDataSource = {
  findAll,
  findByGroupLocalId,
  findByTerrainLocalId,
  upsertRemote,
  markCommandConfirmed,
  deleteByMovementCommandLocalId,
};
