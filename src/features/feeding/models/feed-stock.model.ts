export interface FeedType {
  id: string;
  name: string;
  availableKg: number;
  coverageDays: number;
  consumingGroups: number;
}

export type StockMovementKind = 'entry' | 'exit';
