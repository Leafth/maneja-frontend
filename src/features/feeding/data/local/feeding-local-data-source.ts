import type { FeedingRecord } from '../../models/feeding-record.model';
import { commonFeedingFields, createFeedingStore } from './feeding-storage';

const fields = { ...commonFeedingFields, quantityScaled: 'quantity_scaled', occurredAt: 'occurred_at', sequenceNumber: 'sequence_number', balanceState: 'balance_state' } satisfies Record<keyof FeedingRecord, string>;
const keys = Object.keys(fields) as (keyof FeedingRecord)[];
export const feedingLocalDataSource = createFeedingStore<FeedingRecord>('feeding_records', fields, model => keys.map(key => model[key]));
