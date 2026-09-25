import { create } from 'zustand';

interface PasswordResetState {
  resetToken: string | null;

  setResetToken: (resetToken: string) => void;
  clearResetToken: () => void;
}

export const usePasswordResetStore = create<PasswordResetState>((set) => ({
  resetToken: null,

  setResetToken: (resetToken) => {
    set({ resetToken });
  },

  clearResetToken: () => {
    set({ resetToken: null });
  },
}));
