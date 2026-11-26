export const CATEGORIES = [
  'Tops',
  'Bottoms',
  'Dresses',
  'Outerwear',
  'Shoes',
  'Accessories',
] as const;

export type Category = (typeof CATEGORIES)[number];

export interface ClothingItem {
  id: string;
  name: string;
  category: Category;
  color: string;
  uri: string;
  favorite: boolean;
  createdAt: number;
}

export interface Outfit {
  id: string;
  name: string;
  occasion: string;
  itemIds: string[];
  createdAt: number;
}
