import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ClothingItem, Outfit } from '../types';
import { makeId } from '../utils/id';

const STORAGE_KEY = 'mycloset:v1';

interface ClosetContextValue {
  loading: boolean;
  items: ClothingItem[];
  outfits: Outfit[];
  addItem: (
    input: Pick<ClothingItem, 'name' | 'category' | 'color' | 'uri'>,
  ) => Promise<ClothingItem>;
  removeItem: (id: string) => Promise<void>;
  toggleFavorite: (id: string) => Promise<void>;
  addOutfit: (
    input: Pick<Outfit, 'name' | 'occasion' | 'itemIds'>,
  ) => Promise<Outfit>;
  removeOutfit: (id: string) => Promise<void>;
}

const ClosetContext = createContext<ClosetContextValue | null>(null);

interface PersistedState {
  items: ClothingItem[];
  outfits: Outfit[];
}

export function ClosetProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<ClothingItem[]>([]);
  const [outfits, setOutfits] = useState<Outfit[]>([]);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!active) return;
        if (raw) {
          const parsed = JSON.parse(raw) as Partial<PersistedState>;
          setItems(parsed.items ?? []);
          setOutfits(parsed.outfits ?? []);
        }
      } catch {
        // Corrupt or unreadable data: start with an empty closet.
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const persist = useCallback(async (next: PersistedState) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Storage write failures are non-fatal for the current session.
    }
  }, []);

  const addItem = useCallback<ClosetContextValue['addItem']>(
    async (input) => {
      const item: ClothingItem = {
        ...input,
        name: input.name.trim() || 'Untitled item',
        favorite: false,
        id: makeId(),
        createdAt: Date.now(),
      };
      setItems((prev) => [item, ...prev]);
      await persist({ items: [item, ...items], outfits });
      return item;
    },
    [items, outfits, persist],
  );

  const removeItem = useCallback<ClosetContextValue['removeItem']>(
    async (id) => {
      const remaining = items.filter((item) => item.id !== id);
      const nextOutfits = outfits.map((outfit) => ({
        ...outfit,
        itemIds: outfit.itemIds.filter((itemId) => itemId !== id),
      }));
      setItems(remaining);
      setOutfits(nextOutfits);
      await persist({ items: remaining, outfits: nextOutfits });
    },
    [items, outfits, persist],
  );

  const toggleFavorite = useCallback<ClosetContextValue['toggleFavorite']>(
    async (id) => {
      const next = items.map((item) =>
        item.id === id ? { ...item, favorite: !item.favorite } : item,
      );
      setItems(next);
      await persist({ items: next, outfits });
    },
    [items, outfits, persist],
  );

  const addOutfit = useCallback<ClosetContextValue['addOutfit']>(
    async (input) => {
      const outfit: Outfit = {
        ...input,
        name: input.name.trim() || 'Untitled outfit',
        id: makeId(),
        createdAt: Date.now(),
      };
      const next = [outfit, ...outfits];
      setOutfits(next);
      await persist({ items, outfits: next });
      return outfit;
    },
    [items, outfits, persist],
  );

  const removeOutfit = useCallback<ClosetContextValue['removeOutfit']>(
    async (id) => {
      const next = outfits.filter((outfit) => outfit.id !== id);
      setOutfits(next);
      await persist({ items, outfits: next });
    },
    [items, outfits, persist],
  );

  const value = useMemo(
    () => ({
      loading,
      items,
      outfits,
      addItem,
      removeItem,
      toggleFavorite,
      addOutfit,
      removeOutfit,
    }),
    [
      loading,
      items,
      outfits,
      addItem,
      removeItem,
      toggleFavorite,
      addOutfit,
      removeOutfit,
    ],
  );

  return <ClosetContext.Provider value={value}>{children}</ClosetContext.Provider>;
}

export function useCloset() {
  const context = useContext(ClosetContext);
  if (!context) {
    throw new Error('useCloset must be used inside a ClosetProvider');
  }
  return context;
}
