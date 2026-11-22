import type { SQLiteDatabase } from 'expo-sqlite';

export async function preserveDeletedParents(database: SQLiteDatabase) {
  await database.execAsync(`
    ALTER TABLE animal_groups ADD COLUMN locally_deleted_at TEXT;
    ALTER TABLE terrains ADD COLUMN locally_deleted_at TEXT;

    -- Preserve confirmed history; only unresolved operations prevent deletion.
    DROP TRIGGER IF EXISTS protect_feeding_group;
    CREATE TRIGGER protect_feeding_group BEFORE UPDATE OF sync_status ON animal_groups
    WHEN NEW.sync_status = 'pending_delete' AND OLD.sync_status != 'pending_delete' AND (
      EXISTS (SELECT 1 FROM feed_requirements WHERE group_local_id = NEW.local_id
        AND sync_status != 'synced' AND locally_deleted_at IS NULL) OR
      EXISTS (SELECT 1 FROM feeding_records WHERE group_local_id = NEW.local_id
        AND dispatch_state IN ('queued', 'sending', 'uncertain')) OR
      EXISTS (SELECT 1 FROM movement_commands WHERE group_local_id = NEW.local_id
        AND dispatch_state IN ('queued', 'sending', 'uncertain'))
    ) BEGIN
      SELECT RAISE(ABORT, 'Sincronize as operações pendentes do grupo antes de excluí-lo.');
    END;

    CREATE TRIGGER protect_pending_terrain BEFORE UPDATE OF sync_status ON terrains
    WHEN NEW.sync_status = 'pending_delete' AND OLD.sync_status != 'pending_delete' AND EXISTS (
      SELECT 1 FROM movement_commands
      WHERE (origin_terrain_local_id = NEW.local_id OR destination_terrain_local_id = NEW.local_id)
        AND dispatch_state IN ('queued', 'sending', 'uncertain')
    ) BEGIN
      SELECT RAISE(ABORT, 'Sincronize as movimentações pendentes do terreno antes de excluí-lo.');
    END;
  `);
}
