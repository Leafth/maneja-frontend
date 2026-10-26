import { create } from 'zustand';

import type { FeedType } from '../models/feed-stock.model';

interface FeedStockState {
  types: FeedType[];
  addType: (name: string, initialKg: number) => void;
  addEntry: (id: string, quantityKg: number) => void;
  addExit: (id: string, quantityKg: number) => void;
}

export const useFeedStock = create<FeedStockState>((set) => ({
  types: [
    { id: 'soja', name: 'Soja', availableKg: 180, coverageDays: 14, consumingGroups: 2 },
  ],
  addType: (name, initialKg) =>
    set((state) => ({
      types: [
        ...state.types,
        { id: String(Date.now()), name: name.trim(), availableKg: initialKg, coverageDays: 0, consumingGroups: 0 },
      ],
    })),
  addEntry: (id, quantityKg) =>
    set((state) => ({
      types: state.types.map((type) =>
        type.id === id ? { ...type, availableKg: type.availableKg + quantityKg } : type,
      ),
    })),
  addExit: (id, quantityKg) =>
    set((state) => ({
      types: state.types.map((type) =>
        type.id === id ? { ...type, availableKg: type.availableKg - quantityKg } : type,
      ),
    })),
}));
