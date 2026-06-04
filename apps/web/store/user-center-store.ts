'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { RelationNode } from '@pebble/types';
import { getRelation, RelationError } from '@/lib/frontend/relation-client';

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
          const relation = await getRelation(selectedRelationId);
          set({ selectedRelation: relation });
        } catch (error) {
          if (
            error instanceof RelationError &&
            (error.code === 'UNAUTHORIZED' || error.message === '未登录')
          ) {
            set({ selectedRelationId: null, selectedRelation: null });
            return;
          }
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
