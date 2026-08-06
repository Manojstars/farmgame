import create from 'zustand';

export type Screen =
  | 'splash'
  | 'login'
  | 'signup'
  | 'home'
  | 'farm'
  | 'market'
  | 'contracts'
  | 'shop'
  | 'inventory'
  | 'settings'
  | 'profile';

interface Notification {
  id: string;
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
}

interface UIStore {
  currentScreen: Screen;
  isLoading: boolean;
  notifications: Notification[];
  setCurrentScreen: (screen: Screen) => void;
  setLoading: (loading: boolean) => void;
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useUIStore = create<UIStore>((set) => ({
  currentScreen: 'splash',
  isLoading: false,
  notifications: [],

  setCurrentScreen: (screen: Screen) => {
    set({ currentScreen: screen });
  },

  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  addNotification: (notification: Notification) => {
    const id = notification.id || Date.now().toString();
    set((state) => ({
      notifications: [{ ...notification, id }, ...state.notifications],
    }));

    if (notification.duration) {
      setTimeout(() => {
        set((state) => ({
          notifications: state.notifications.filter((n) => n.id !== id),
        }));
      }, notification.duration);
    }
  },

  removeNotification: (id: string) => {
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
    }));
  },

  clearNotifications: () => {
    set({ notifications: [] });
  },
}));

export default useUIStore;
