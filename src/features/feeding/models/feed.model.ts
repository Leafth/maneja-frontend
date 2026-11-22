export type FeedSyncStatus =
  | 'synced'
  | 'pending_create'
  | 'pending_update'
  | 'pending_delete';

export type FeedAlertLevel = 'critical' | 'urgency' | 'attention' | 'info';

export interface Feed {
  localId: string;
  accountId: string;
  remoteId: string | null;

  name: string;

  initialStockScaled: number | null;
  remoteStockScaled: number | null;
  projectedStockScaled: number;

  dailyRequiredScaled: number | null;
  daysRemaining: number | null;
  alertLevel: FeedAlertLevel | null;

  syncStatus: FeedSyncStatus;

  localCreatedAt: string;
  localUpdatedAt: string;

  remoteCreatedAt: string | null;
  remoteUpdatedAt: string | null;

  lastSyncedAt: string | null;
  lastSyncError: string | null;

  locallyDeletedAt: string | null;
}
