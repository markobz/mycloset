export const SEASONS = ['Spring', 'Summer', 'Autumn', 'Winter'] as const;
export type Season = (typeof SEASONS)[number];

export const STYLE_TAGS = [
  'Casual',
  'Elegant',
  'Classic',
  'Boho',
  'Sporty',
  'Streetwear',
  'Romantic',
  'Minimal',
] as const;
export type StyleTag = (typeof STYLE_TAGS)[number];

export interface CategoryDef {
  id: string;
  name: string;
  parentId: string | null;
}

export interface ClothingItem {
  id: string;
  name: string;
  categoryId: string | null;
  color: string;
  seasons: Season[];
  brand?: string;
  notes?: string;
  uri: string;
  originalUri?: string;
  favorite?: boolean;
  createdAt: number;
}

export interface Outfit {
  id: string;
  name: string;
  itemIds: string[];
  seasons: Season[];
  occasion?: string;
  explanation?: string;
  favorite?: boolean;
  notes?: string;
  wornDates?: number[];
  createdAt: number;
}

export interface Preferences {
  favoriteColors: string[];
  favoriteStyles: StyleTag[];
  favoriteSeasons: Season[];
  lookStyle: 'casual' | 'elegant' | 'both';
  occasion: 'everyday' | 'special' | 'both';
}

export const DEFAULT_PREFERENCES: Preferences = {
  favoriteColors: [],
  favoriteStyles: [],
  favoriteSeasons: [],
  lookStyle: 'both',
  occasion: 'both',
};
