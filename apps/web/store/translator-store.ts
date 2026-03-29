import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { decode as decodeApi } from '@/lib/frontend/decode-client';
import { useUserCenterStore } from '@/store/user-center-store';
import type { DecodeResponse, TranslatorStatus } from '@/types/translator';

interface TranslatorState {
  inputText: string;
  status: TranslatorStatus;
  result: DecodeResponse | null;
  error: string | null;
}

interface TranslatorActions {
  setInput: (text: string) => void;
  decode: () => Promise<void>;
  clearResult: () => void;
}

type TranslatorStore = TranslatorState & TranslatorActions;

export const useTranslatorStore = create<TranslatorStore>()(
  immer((set, get) => ({
    inputText: '',
    status: 'idle' as TranslatorStatus,
    result: null,
    error: null,

    setInput: (text) => {
      set((state) => { state.inputText = text; });
    },

    decode: async () => {
      const { status, inputText } = get();
      if (status === 'analyzing') return;
      if (inputText.trim().length === 0) {
        set((state) => {
          state.status = 'error';
          state.error = '请先输入需要分析的内容';
        });
        return;
      }

      set((state) => {
        state.status = 'analyzing';
        state.error = null;
        state.result = null;
      });

      try {
        const { selectedRelationId } = useUserCenterStore.getState();
        const result = await decodeApi({
          text: inputText,
          relationId: selectedRelationId ?? undefined,
        });
        set((state) => {
          state.status = 'result';
          state.result = result;
        });
      } catch (error) {
        const message = error instanceof Error ? error.message : '解析失败，请稍后重试';
        set((state) => {
          state.status = 'error';
          state.error = message;
          state.result = null;
        });
      }
    },

    clearResult: () => {
      set((state) => {
        state.status = 'idle';
        state.result = null;
        state.error = null;
      });
    },
  }))
);
