import { create } from 'zustand';
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

function applyThemeToDocument(themeId: string) {
  const theme = getTheme(themeId);

  document.body.className = `theme-${themeId}`;

  // Accent colors used across the whole app via CSS variables
  document.documentElement.style.setProperty('--primary', theme.color);
  document.documentElement.style.setProperty('--primary-dark', theme.colorDark);

  // Full-page HD background image with a soft white wash so cards stay readable
  document.body.style.backgroundImage =
    `linear-gradient(rgba(255,255,255,0.90), rgba(255,255,255,0.90)), url(${theme.bgImage})`;
  document.body.style.backgroundSize = 'cover';
  document.body.style.backgroundPosition = 'center';
  document.body.style.backgroundAttachment = 'fixed';
  document.body.style.backgroundRepeat = 'no-repeat';
}

export const useSadhanaStore = create<SadhanaState>((set) => ({
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
}));