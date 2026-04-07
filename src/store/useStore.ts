import { create } from 'zustand';
import { createMMKV } from 'react-native-mmkv';

export const storage = createMMKV({
  id: 'qr-generator-scanner-app',
  encryptionKey: 'qr-secure-key-123',
  encryptionType: 'AES-256',
  readOnly: false,
  compareBeforeSet: false,
});

export type HistoryItem = {
  id: string;
  source: 'scan' | 'create';
  qrType: string;
  rawData: string;
  parsedData?: any;
  createdAt: number;
  isFavorite: boolean;
};

interface AppState {
  history: HistoryItem[];
  addHistoryItem: (
    item: Omit<HistoryItem, 'id' | 'createdAt' | 'isFavorite'>,
  ) => void;
  toggleFavorite: (id: string) => void;
  deleteHistoryItem: (id: string) => void;
  clearHistory: () => void;
}

export const useStore = create<AppState>((set, get) => {
  const savedHistory = storage.getString('history');
  const initialHistory: HistoryItem[] = savedHistory
    ? JSON.parse(savedHistory)
    : [];

  return {
    history: initialHistory,
    addHistoryItem: item => {
      const newItem: HistoryItem = {
        ...item,
        id: Date.now().toString(),
        createdAt: Date.now(),
        isFavorite: false,
      };
      const newHistory = [newItem, ...get().history];

      set({ history: newHistory });
      storage.set('history', JSON.stringify(newHistory));
    },

    toggleFavorite: id => {
      const newHistory = get().history.map(item =>
        item.id === id ? { ...item, isFavorite: !item.isFavorite } : item,
      );

      set({ history: newHistory });
      storage.set('history', JSON.stringify(newHistory));
    },
    deleteHistoryItem: id => {
      const newHistory = get().history.filter(item => item.id !== id);

      set({ history: newHistory });
      storage.set('history', JSON.stringify(newHistory));
    },
    clearHistory: () => {
      set({ history: [] });
      storage.remove('history');
    },
  };
});
