import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface PromptState {
  systemPrompt: string;
  setSystemPrompt: (prompt: string) => void;
  resetPrompt: () => void;
  getDefaultPrompt: () => string;
}

const DEFAULT_PROMPT = "You are a helpful assistant.";

export const usePromptStore = create<PromptState>()(
  persist(
    (set, get) => ({
      systemPrompt: DEFAULT_PROMPT,
      
      setSystemPrompt: (prompt: string) => {
        set({ systemPrompt: prompt.trim() });
      },
      
      resetPrompt: () => {
        set({ systemPrompt: DEFAULT_PROMPT });
      },
      
      getDefaultPrompt: () => DEFAULT_PROMPT,
    }),
    {
      name: 'mobile-prompt-storage',
      partialize: (state) => ({
        systemPrompt: state.systemPrompt,
      }),
    }
  )
);
