import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { getTheme } from '../lib/themes';

interface SadhanaState {
  fullName: string;
  setFullName: (name: string) => void;
  theme: string;
  setTheme: (theme: string) => void;

  japaRounds: number;
  incrementRound: () => void;
  decrementRound: () => void;
  resetRounds: () => void;
  setJapaRounds: (rounds: number) => void;

  readingSeconds: number;
  isReading: boolean;
  toggleTimer: () => void;
  tickTimer: () => void;
  resetTimer: () => void;

  hearingSeconds: number;
  isHearing: boolean;
  toggleHearingTimer: () => void;
  tickHearingTimer: () => void;
  resetHearingTimer: () => void;

  wakeTime: string;
  sleepTime: string;
  setWakeTime: (time: string) => void;
  setSleepTime: (time: string) => void;
}

export function applyThemeToDocument(themeId: string) {
  const theme = getTheme(themeId);

  document.documentElement.style.setProperty('--primary', theme.color);
  document.documentElement.style.setProperty('--primary-dark', theme.colorDark);
  document.documentElement.style.setProperty('--theme-bg-image', `url(${theme.bgImage})`);

  // Keep the mobile browser's status/nav bar in sync — cream, not the raw
  // accent color, so it blends with the card surfaces instead of clashing
  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) meta.setAttribute('content', '#fdfaf5');
}

export const useSadhanaStore = create<SadhanaState>()(
  persist(
    (set) => ({
      fullName: 'Devotee',
      setFullName: (name) => set({ fullName: name }),
      theme: 'default',
      setTheme: (theme) => {
        applyThemeToDocument(theme);
        set({ theme });
      },

      japaRounds: 0,
      incrementRound: () => set((state) => ({ japaRounds: state.japaRounds + 1 })),
      decrementRound: () => set((state) => ({ japaRounds: Math.max(0, state.japaRounds - 1) })),
      resetRounds: () => set({ japaRounds: 0 }),
      setJapaRounds: (rounds) => set({ japaRounds: rounds }),

      readingSeconds: 0,
      isReading: false,
      toggleTimer: () => set((state) => ({ isReading: !state.isReading })),
      tickTimer: () => set((state) => ({ readingSeconds: state.readingSeconds + 1 })),
      resetTimer: () => set({ readingSeconds: 0, isReading: false }),

      hearingSeconds: 0,
      isHearing: false,
      toggleHearingTimer: () => set((state) => ({ isHearing: !state.isHearing })),
      tickHearingTimer: () => set((state) => ({ hearingSeconds: state.hearingSeconds + 1 })),
      resetHearingTimer: () => set({ hearingSeconds: 0, isHearing: false }),

      wakeTime: '',
      sleepTime: '',
      setWakeTime: (time) => set({ wakeTime: time }),
      setSleepTime: (time) => set({ sleepTime: time }),
    }),
    {
      name: 'sadhana-storage',
      partialize: (state) => ({
        fullName: state.fullName,
        theme: state.theme,
        japaRounds: state.japaRounds,
        wakeTime: state.wakeTime,
        sleepTime: state.sleepTime,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) applyThemeToDocument(state.theme);
      },
    }
  )
);