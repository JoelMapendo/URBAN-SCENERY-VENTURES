import { create } from 'zustand';
import { UserOut } from '../types';

interface AuthState {
  token: string | null;
  user: UserOut | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  setAuth: (token: string, user: UserOut) => void;
  updateUser: (updatedUser: Partial<UserOut>) => void;
  setRole: (role: 'admin' | 'buyer') => void;
  logout: () => void;
}

const STORAGE_KEY = 'urban_scenery_auth';

const getInitialState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.token && parsed.user) {
        return {
          token: parsed.token as string,
          user: parsed.user as UserOut,
          isAuthenticated: true,
          isAdmin: parsed.user.role?.toLowerCase() === 'admin',
        };
      }
    }
  } catch (e) {
    console.error('Failed to parse auth from localStorage:', e);
  }
  return {
    token: null,
    user: null,
    isAuthenticated: false,
    isAdmin: false,
  };
};

const initial = getInitialState();

export const useAuthStore = create<AuthState>((set, get) => ({
  token: initial.token,
  user: initial.user,
  isAuthenticated: initial.isAuthenticated,
  isAdmin: initial.isAdmin,

  setAuth: (token: string, user: UserOut) => {
    const isAdmin = user.role?.toLowerCase() === 'admin';
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ token, user }));
    set({
      token,
      user,
      isAuthenticated: true,
      isAdmin,
    });
  },

  updateUser: (updatedUser: Partial<UserOut>) => {
    const currentUser = get().user;
    if (!currentUser) return;
    const merged = { ...currentUser, ...updatedUser };
    const isAdmin = merged.role?.toLowerCase() === 'admin';
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ token: get().token, user: merged })
    );
    set({
      user: merged,
      isAdmin,
    });
  },

  setRole: (role: 'admin' | 'buyer') => {
    const currentUser = get().user;
    const isAdmin = role === 'admin';
    const updatedUser: UserOut = currentUser
      ? { ...currentUser, role, name: isAdmin ? (currentUser.role === 'admin' ? currentUser.name : 'Urban Scenery Admin') : (currentUser.role === 'admin' ? 'Courtney Henry' : currentUser.name), email: isAdmin ? (currentUser.role === 'admin' ? currentUser.email : 'admin@urbanventures.com') : (currentUser.role === 'admin' ? 'courtney.henry@example.com' : currentUser.email) }
      : {
          public_id: isAdmin ? 'usr_admin_001' : 'usr_buyer_001',
          name: isAdmin ? 'Urban Scenery Admin' : 'Courtney Henry',
          email: isAdmin ? 'admin@urbanventures.com' : 'courtney.henry@example.com',
          role,
          created_at: new Date().toISOString(),
        };

    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ token: get().token || 'demo-token', user: updatedUser })
    );
    set({
      token: get().token || 'demo-token',
      user: updatedUser,
      isAuthenticated: true,
      isAdmin,
    });
  },

  logout: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({
      token: null,
      user: null,
      isAuthenticated: false,
      isAdmin: false,
    });
  },
}));
