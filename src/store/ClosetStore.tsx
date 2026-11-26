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
import {
  CategoryDef,
  ClothingItem,
  DEFAULT_PREFERENCES,
  Outfit,
  Preferences,
  SEASONS,
} from '../types';
import { makeId } from '../utils/id';

const STORAGE_KEY = 'mycloset:v2';
const LEGACY_KEY = 'mycloset:v1';

interface StoreState {
  name: string;
  categories: CategoryDef[];
  items: ClothingItem[];
  outfits: Outfit[];
  preferences: Preferences;
}

export const DEFAULT_CATEGORIES: CategoryDef[] = [
  { id: 'cat-tops', name: 'Tops', parentId: null },
  { id: 'cat-bottoms', name: 'Bottoms', parentId: null },
  { id: 'cat-dresses', name: 'Dresses', parentId: null },
  { id: 'cat-outerwear', name: 'Outerwear', parentId: null },
  { id: 'cat-shoes', name: 'Shoes', parentId: null },
  { id: 'cat-bags', name: 'Bags', parentId: null },
  { id: 'cat-jewellery', name: 'Jewellery', parentId: null },
  { id: 'cat-accessories', name: 'Accessories', parentId: null },
];

const initialState: StoreState = {
  name: '',
  categories: DEFAULT_CATEGORIES,
  items: [],
  outfits: [],
  preferences: DEFAULT_PREFERENCES,
};

interface StoreValue extends StoreState {
  ready: boolean;
  setName: (name: string) => Promise<void>;
  addCategory: (name: string, parentId: string | null) => Promise<CategoryDef>;
  renameCategory: (id: string, name: string) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  moveCategory: (id: string, direction: -1 | 1) => Promise<void>;
  addItem: (input: Omit<ClothingItem, 'id' | 'createdAt'>) => Promise<ClothingItem>;
  updateItem: (id: string, patch: Partial<ClothingItem>) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  addOutfit: (input: Omit<Outfit, 'id' | 'createdAt'>) => Promise<Outfit>;
  updateOutfit: (id: string, patch: Partial<Outfit>) => Promise<void>;
  removeOutfit: (id: string) => Promise<void>;
  markOutfitWorn: (id: string, date?: number) => Promise<void>;
  setPreferences: (patch: Partial<Preferences>) => Promise<void>;
  importData: (data: Partial<StoreState>) => Promise<void>;
}

const StoreContext = createContext<StoreValue | null>(null);

function normalizeState(raw: Partial<StoreState>): StoreState {
  return {
    name: typeof raw.name === 'string' ? raw.name : '',
    categories: Array.isArray(raw.categories) && raw.categories.length > 0 ? raw.categories : DEFAULT_CATEGORIES,
    items: Array.isArray(raw.items) ? raw.items : [],
    outfits: Array.isArray(raw.outfits) ? raw.outfits : [],
    preferences: { ...DEFAULT_PREFERENCES, ...(raw.preferences ?? {}) },
  };
}

function migrateLegacy(raw: { items?: ClothingItem[]; outfits?: Outfit[] } | null): StoreState | null {
  if (!raw || !Array.isArray(raw.items)) return null;
  const categories = [...DEFAULT_CATEGORIES];
  const items: ClothingItem[] = raw.items.map((item) => {
    const legacyCategory = (item as unknown as { category?: string }).category;
    let categoryId: string | null = null;
    if (legacyCategory) {
      let existing = categories.find(
        (category) => category.parentId === null && category.name === legacyCategory,
      );
      if (!existing) {
        existing = { id: makeId(), name: legacyCategory, parentId: null };
        categories.push(existing);
      }
      categoryId = existing.id;
    }
    return {
      ...item,
      categoryId,
      seasons: item.seasons ?? [...SEASONS],
    };
  });
  const outfits: Outfit[] = (raw.outfits ?? []).map((outfit) => ({
    ...outfit,
    seasons: outfit.seasons ?? [...SEASONS],
  }));
  return normalizeState({ categories, items, outfits });
}

export function ClosetStoreProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [state, setState] = useState<StoreState>(initialState);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(STORAGE_KEY);
        if (!active) return;
        if (raw) {
          setState(normalizeState(JSON.parse(raw)));
        } else {
          const legacyRaw = await AsyncStorage.getItem(LEGACY_KEY);
          if (legacyRaw) {
            const migrated = migrateLegacy(JSON.parse(legacyRaw));
            if (migrated && active) {
              setState(migrated);
              await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));
            }
          }
        }
      } catch {
        // Fall back to a fresh closet on unreadable data.
      } finally {
        if (active) setReady(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const persist = useCallback(async (next: StoreState) => {
    setState(next);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Storage failures are non-fatal for the current session.
    }
  }, []);

  const setName = useCallback(
    async (name: string) => {
      await persist({ ...state, name: name.trim() });
    },
    [state, persist],
  );

  const addCategory = useCallback(
    async (name: string, parentId: string | null) => {
      const category: CategoryDef = { id: makeId(), name: name.trim(), parentId };
      await persist({ ...state, categories: [...state.categories, category] });
      return category;
    },
    [state, persist],
  );

  const renameCategory = useCallback(
    async (id: string, name: string) => {
      await persist({
        ...state,
        categories: state.categories.map((category) =>
          category.id === id ? { ...category, name: name.trim() } : category,
        ),
      });
    },
    [state, persist],
  );

  const deleteCategory = useCallback(
    async (id: string) => {
      const doomed = new Set([id]);
      let grew = true;
      while (grew) {
        grew = false;
        for (const category of state.categories) {
          if (category.parentId && doomed.has(category.parentId) && !doomed.has(category.id)) {
            doomed.add(category.id);
            grew = true;
          }
        }
      }
      await persist({
        ...state,
        categories: state.categories.filter((category) => !doomed.has(category.id)),
        items: state.items.map((item) =>
          item.categoryId && doomed.has(item.categoryId) ? { ...item, categoryId: null } : item,
        ),
      });
    },
    [state, persist],
  );

  const moveCategory = useCallback(
    async (id: string, direction: -1 | 1) => {
      const ordered: CategoryDef[] = [];
      const topLevel = state.categories.filter((category) => category.parentId === null);
      const index = topLevel.findIndex((category) => category.id === id);
      const target = index + direction;
      if (index === -1 || target < 0 || target >= topLevel.length) return;
      const reordered = [...topLevel];
      [reordered[index], reordered[target]] = [reordered[target], reordered[index]];
      for (const category of reordered) {
        ordered.push(category);
        ordered.push(...state.categories.filter((candidate) => candidate.parentId === category.id));
      }
      await persist({ ...state, categories: ordered });
    },
    [state, persist],
  );

  const addItem = useCallback(
    async (input: Omit<ClothingItem, 'id' | 'createdAt'>) => {
      const item: ClothingItem = {
        ...input,
        name: input.name.trim() || 'Untitled piece',
        id: makeId(),
        createdAt: Date.now(),
      };
      await persist({ ...state, items: [item, ...state.items] });
      return item;
    },
    [state, persist],
  );

  const updateItem = useCallback(
    async (id: string, patch: Partial<ClothingItem>) => {
      await persist({
        ...state,
        items: state.items.map((item) => (item.id === id ? { ...item, ...patch } : item)),
      });
    },
    [state, persist],
  );

  const removeItem = useCallback(
    async (id: string) => {
      await persist({
        ...state,
        items: state.items.filter((item) => item.id !== id),
        outfits: state.outfits.map((outfit) => ({
          ...outfit,
          itemIds: outfit.itemIds.filter((itemId) => itemId !== id),
        })),
      });
    },
    [state, persist],
  );

  const addOutfit = useCallback(
    async (input: Omit<Outfit, 'id' | 'createdAt'>) => {
      const outfit: Outfit = {
        ...input,
        name: input.name.trim() || 'Untitled outfit',
        id: makeId(),
        createdAt: Date.now(),
      };
      await persist({ ...state, outfits: [outfit, ...state.outfits] });
      return outfit;
    },
    [state, persist],
  );

  const updateOutfit = useCallback(
    async (id: string, patch: Partial<Outfit>) => {
      await persist({
        ...state,
        outfits: state.outfits.map((outfit) => (outfit.id === id ? { ...outfit, ...patch } : outfit)),
      });
    },
    [state, persist],
  );

  const removeOutfit = useCallback(
    async (id: string) => {
      await persist({ ...state, outfits: state.outfits.filter((outfit) => outfit.id !== id) });
    },
    [state, persist],
  );

  const markOutfitWorn = useCallback(
    async (id: string, date = Date.now()) => {
      await persist({
        ...state,
        outfits: state.outfits.map((outfit) =>
          outfit.id === id
            ? { ...outfit, wornDates: [...(outfit.wornDates ?? []), date] }
            : outfit,
        ),
      });
    },
    [state, persist],
  );

  const setPreferences = useCallback(
    async (patch: Partial<Preferences>) => {
      await persist({ ...state, preferences: { ...state.preferences, ...patch } });
    },
    [state, persist],
  );

  const importData = useCallback(
    async (data: Partial<StoreState>) => {
      const next = normalizeState({
        ...state,
        ...data,
        categories: data.categories?.length ? data.categories : state.categories,
        preferences: { ...state.preferences, ...(data.preferences ?? {}) },
      });
      await persist(next);
    },
    [state, persist],
  );

  const value = useMemo<StoreValue>(
    () => ({
      ...state,
      ready,
      setName,
      addCategory,
      renameCategory,
      deleteCategory,
      moveCategory,
      addItem,
      updateItem,
      removeItem,
      addOutfit,
      updateOutfit,
      removeOutfit,
      markOutfitWorn,
      setPreferences,
      importData,
    }),
    [
      state,
      ready,
      setName,
      addCategory,
      renameCategory,
      deleteCategory,
      moveCategory,
      addItem,
      updateItem,
      removeItem,
      addOutfit,
      updateOutfit,
      removeOutfit,
      markOutfitWorn,
      setPreferences,
      importData,
    ],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useCloset() {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useCloset must be used inside ClosetStoreProvider');
  }
  return context;
}
