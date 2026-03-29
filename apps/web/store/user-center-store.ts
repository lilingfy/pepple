'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RelationNode } from '@pebble/types';

/**
 * UserCenterState - state interface for user center global state
 */
interface UserCenterState {
  // 当前选中的关系
  selectedRelationId: string | null;
  selectedRelation: RelationNode | null;

  // 操作
  selectRelation: (relation: RelationNode | null) => void;
  clearSelectedRelation: () => void;
  loadSelectedRelation: () => Promise<void>;
}

export const useUserCenterStore = create<UserCenterState>()(
  persist(
    (set, get) => ({
      selectedRelationId: null,
      selectedRelation: null,

      selectRelation: (relation) => {
        set({
          selectedRelationId: relation?.id ?? null,
          selectedRelation: relation,
        });
      },

      clearSelectedRelation: () => {
        set({ selectedRelationId: null, selectedRelation: null });
      },

      loadSelectedRelation: async () => {
        const { selectedRelationId } = get();
        if (!selectedRelationId) return;

        try {
          const response = await fetch(`/api/relations/${selectedRelationId}`);
          if (response.ok) {
            const relation = await response.json();
            set({ selectedRelation: relation });
          }
        } catch (error) {
          console.error('Failed to load selected relation:', error);
        }
      },
    }),
    {
      name: 'pebble-user-center',
      partialize: (state) => ({ selectedRelationId: state.selectedRelationId }),
    }
  )
);

export type { UserCenterState };
