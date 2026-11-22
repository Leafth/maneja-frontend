import type { Occupation } from '@/features/movements/models';

import type { Terrain, TerrainStateDetails } from '../models';

const DAY_MS = 24 * 60 * 60 * 1000;

function elapsedDaysSince(date: string): number {
  const timestamp = Date.parse(date);

  if (Number.isNaN(timestamp)) {
    return 0;
  }

  return Math.max(0, Math.floor((Date.now() - timestamp) / DAY_MS));
}

function toGroupRef(occupation: Occupation) {
  return {
    localId: occupation.groupLocalId,
    remoteId: occupation.groupRemoteId,
    name: occupation.groupName,
  };
}

function toFinishedOccupation(occupation: Occupation) {
  if (!occupation.endedAt) {
    return null;
  }

  return {
    localId: occupation.localId,
    remoteId: occupation.remoteId,
    startedAt: occupation.startedAt,
    endedAt: occupation.endedAt,
  };
}

export function buildLocalTerrainStateDetails(
  terrain: Terrain,
  occupations: Occupation[],
): TerrainStateDetails {
  const sorted = [...occupations].sort((a, b) =>
    b.startedAt.localeCompare(a.startedAt),
  );

  const activeOccupation = sorted.find((occupation) => !occupation.endedAt);
  const lastFinishedOccupation = sorted.find(
    (occupation) => occupation.endedAt,
  );

  switch (terrain.status) {
    case 'occupied':
      return {
        status: 'occupied',
        currentGroup: activeOccupation ? toGroupRef(activeOccupation) : null,
        enteredAt: activeOccupation?.startedAt ?? null,
      };

    case 'resting': {
      const elapsed = lastFinishedOccupation?.endedAt
        ? elapsedDaysSince(lastFinishedOccupation.endedAt)
        : 0;

      return {
        status: 'resting',
        remainingRestDays: Math.max(terrain.restDays - elapsed, 0),
        lastGroup: lastFinishedOccupation
          ? toGroupRef(lastFinishedOccupation)
          : null,
        lastOccupation: lastFinishedOccupation
          ? toFinishedOccupation(lastFinishedOccupation)
          : null,
      };
    }

    case 'available': {
      const daysFree = lastFinishedOccupation?.endedAt
        ? elapsedDaysSince(lastFinishedOccupation.endedAt)
        : 0;

      return {
        status: 'available',
        daysFree,
        lastGroup: lastFinishedOccupation
          ? toGroupRef(lastFinishedOccupation)
          : null,
        lastOccupation: lastFinishedOccupation
          ? toFinishedOccupation(lastFinishedOccupation)
          : null,
      };
    }
  }
}
