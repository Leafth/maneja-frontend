import type { FeedRequirement } from '../../models/feed-requirement.model';
import { commonFeedingFields, createFeedingStore } from './feeding-storage';

const fields = { ...commonFeedingFields, quantityPerAnimalScaled: 'quantity_per_animal_scaled', locallyDeletedAt: 'locally_deleted_at' } satisfies Record<keyof FeedRequirement, string>;
const keys = Object.keys(fields) as (keyof FeedRequirement)[];
export const feedRequirementLocalDataSource = createFeedingStore<FeedRequirement>('feed_requirements', fields, model => keys.map(key => model[key]));
