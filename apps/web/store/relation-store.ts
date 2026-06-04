/**
 * Relation Store
 * Zustand store for relation graph state
 */

import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type { RelationNode } from '@pebble/types';
import {
  listRelations,
  createRelation,
  updateRelation,
  deleteRelation,
} from '@/lib/frontend/relation-client';

export interface RelationState {
  nodes: RelationNode[];
  selectedNodeId: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface RelationActions {
  loadNodes: () => Promise<void>;
  addNode: (data: {
    name: string;
    tags?: string[];
    relationshipType?: string;
    对方特点?: string;
    期望结果?: string;
    情境补充?: string;
  }) => Promise<RelationNode>;
  editNode: (id: string, data: {
    name?: string;
    tags?: string[];
    relationshipType?: string;
    对方特点?: string;
    期望结果?: string;
    情境补充?: string;
  }) => Promise<void>;
  removeNode: (id: string) => Promise<void>;
  selectNode: (id: string | null) => void;
  clearError: () => void;
}

export type RelationStore = RelationState & RelationActions;

const initialState: RelationState = {
  nodes: [],
  selectedNodeId: null,
  isLoading: false,
  error: null,
};

function sortRelationNodes(nodes: RelationNode[]): RelationNode[] {
  return [...nodes].sort((a, b) => a.position - b.position || a.createdAt.localeCompare(b.createdAt));
}

export const useRelationStore = create<RelationStore>()(
  immer((set) => ({
    ...initialState,

    loadNodes: async () => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const nodes = await listRelations();
        set((state) => {
          state.nodes = sortRelationNodes(nodes);
          state.isLoading = false;
        });
      } catch (error) {
        set((state) => {
          state.isLoading = false;
          state.error = error instanceof Error ? error.message : '加载失败';
        });
      }
    },

    addNode: async (data) => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const node = await createRelation(data);
        set((state) => {
          state.nodes = sortRelationNodes([...state.nodes, node]);
          state.isLoading = false;
        });
        return node;
      } catch (error) {
        set((state) => {
          state.isLoading = false;
          state.error = error instanceof Error ? error.message : '创建失败';
        });
        throw error;
      }
    },

    editNode: async (id, data) => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        const updated = await updateRelation(id, data);
        set((state) => {
          const index = state.nodes.findIndex((n) => n.id === id);
          if (index !== -1) {
            state.nodes[index] = updated;
            state.nodes = sortRelationNodes(state.nodes);
          }
          state.isLoading = false;
        });
      } catch (error) {
        set((state) => {
          state.isLoading = false;
          state.error = error instanceof Error ? error.message : '更新失败';
        });
        throw error;
      }
    },

    removeNode: async (id) => {
      set((state) => {
        state.isLoading = true;
        state.error = null;
      });

      try {
        await deleteRelation(id);
        set((state) => {
          state.nodes = state.nodes.filter((n) => n.id !== id);
          if (state.selectedNodeId === id) {
            state.selectedNodeId = null;
          }
          state.isLoading = false;
        });
      } catch (error) {
        set((state) => {
          state.isLoading = false;
          state.error = error instanceof Error ? error.message : '删除失败';
        });
        throw error;
      }
    },

    selectNode: (id) => {
      set((state) => {
        state.selectedNodeId = id;
      });
    },

    clearError: () => {
      set((state) => {
        state.error = null;
      });
    },
  }))
);
