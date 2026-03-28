'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * RelationNode type - represents a relationship in the system
 * This will be moved to @pebble/types in a later task
 */
export interface RelationNode {
  id: string;
  userId: string;
  name: string;
  description?: string | null;
  tags?: string | null;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

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
