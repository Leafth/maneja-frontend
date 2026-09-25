import { create } from 'zustand';

interface PasswordResetState {
  email: string | null;
  resetToken: string | null;

  setEmail: (email: string) => void;
  setResetToken: (resetToken: string) => void;
  clearPasswordReset: () => void;
}

export const usePasswordResetStore = create<PasswordResetState>((set) => ({
  email: null,
  resetToken: null,

  setEmail: (email) => {
    set({ email });
  },

  setResetToken: (resetToken) => {
    set({ resetToken });
  },

  clearPasswordReset: () => {
    set({
      email: null,
      resetToken: null,
    });
  },
}));
