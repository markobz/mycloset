import { CategoryDef, ClothingItem, Preferences, Season } from './types';

export type Role =
  | 'dress'
  | 'top'
  | 'bottom'
  | 'outer'
  | 'shoes'
  | 'bag'
  | 'jewellery'
  | 'accessory'
  | 'other';

export interface OutfitDraft {
  itemIds: string[];
  seasons: Season[];
  name: string;
  explanation: string;
  occasion?: string;
}

const ROLE_KEYWORDS: [RegExp, Role][] = [
  [/dress|gown|jumpsuit|robe/, 'dress'],
  [/blazer|jacket|coat|outerwear|parka|trench/, 'outer'],
  [/shoe|boot|sneaker|heel|sandal|flat|loafer|pump/, 'shoes'],
  [/bag|purse|clutch|tote|handbag/, 'bag'],
  [/jewel|necklace|earring|ring\b|bracelet|watch/, 'jewellery'],
  [/scarf|hat|belt|sunglass|accessor|glove/, 'accessory'],
  [/top|shirt|tee|blouse|sweater|knit|hoodie|jumper|cardigan|camisole/, 'top'],
  [/pant|trouser|jean|skirt|short|bottom|legging/, 'bottom'],
];

const FAMILY_PATTERNS: [RegExp, string][] = [
  [/black/, 'black'],
  [/white|ivory/, 'white'],
  [/grey|gray/, 'grey'],
  [/navy/, 'navy'],
  [/beige|cream|ivory|camel|sand|tan|nude|champagne|taupe/, 'beige'],
  [/brown|chocolate|cognac|espresso|chestnut/, 'brown'],
  [/blue|denim|azure|sky|indigo/, 'blue'],
  [/red|burgundy|wine|scarlet|cherry/, 'red'],
  [/pink|blush|rose|fuchsia/, 'pink'],
  [/green|olive|mint|emerald|khaki|sage/, 'green'],
  [/yellow|mustard|lemon|butter/, 'yellow'],
  [/orange|coral|peach|rust|terracotta/, 'orange'],
  [/purple|lilac|violet|lavender|plum/, 'purple'],
  [/gold/, 'gold'],
  [/silver|metallic/, 'silver'],
];

const NEUTRAL_FAMILIES = new Set(['black', 'white', 'grey', 'beige', 'brown', 'navy', 'gold', 'silver']);

const FAMILY_LABELS: Record<string, string> = {
  black: 'Midnight',
  white: 'Ivory',
  grey: 'Soft Grey',
  navy: 'Marine',
  beige: 'Ivory',
  brown: 'Caramel',
  blue: 'Blue Hour',
  red: 'Scarlet',
  pink: 'Blush',
  green: 'Emerald',
  yellow: 'Golden',
  orange: 'Terracotta',
  purple: 'Lilac',
  gold: 'Golden Hour',
  silver: 'Moonlight',
};

const HUE_ORDER = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink'];

const COLD_SEASONS: Season[] = ['Autumn', 'Winter'];

export function colorFamily(color?: string): string | null {
  if (!color) return null;
  const value = color.toLowerCase();
  for (const [pattern, family] of FAMILY_PATTERNS) {
    if (pattern.test(value)) return family;
  }
  return null;
}

export function roleOf(item: ClothingItem, categories: CategoryDef[]): Role {
  const byId = new Map(categories.map((category) => [category.id, category]));
  const names: string[] = [];
  let current = item.categoryId ? byId.get(item.categoryId) ?? null : null;
  while (current) {
    names.push(current.name);
    current = current.parentId ? byId.get(current.parentId) ?? null : null;
  }
  const haystack = names.join(' ').toLowerCase();
  if (!haystack) return 'other';
  for (const [pattern, role] of ROLE_KEYWORDS) {
    if (pattern.test(haystack)) return role;
  }
  return 'other';
}

function coversSeason(item: ClothingItem, season: Season): boolean {
  return item.seasons.length === 0 || item.seasons.includes(season);
}

function sharedSeasons(items: ClothingItem[]): Season[] {
  if (items.length === 0) return [];
  const first = items[0].seasons.length ? items[0].seasons : (['Spring', 'Summer', 'Autumn', 'Winter'] as Season[]);
  return first.filter((season) => items.every((item) => coversSeason(item, season)));
}

function colorScore(items: ClothingItem[]): number {
  const families = items
    .map((item) => colorFamily(item.color))
    .filter((family): family is string => family !== null);
  const colored = families.filter((family) => !NEUTRAL_FAMILIES.has(family));
  if (colored.length > 2) return 0.2;
  const unique = Array.from(new Set(families));
  if (unique.length <= 1) return 1;
  let score = 0;
  for (let i = 0; i < unique.length; i += 1) {
    for (let j = i + 1; j < unique.length; j += 1) {
      const a = unique[i];
      const b = unique[j];
      if (NEUTRAL_FAMILIES.has(a) || NEUTRAL_FAMILIES.has(b)) {
        score += 1;
        continue;
      }
      const ia = HUE_ORDER.indexOf(a);
      const ib = HUE_ORDER.indexOf(b);
      if (ia === -1 || ib === -1) {
        score += 0.6;
        continue;
      }
      const distance = Math.min(Math.abs(ia - ib), HUE_ORDER.length - Math.abs(ia - ib));
      if (distance <= 1) score += 0.9;
      else if (distance === 3) score += 0.7;
      else score += 0.3;
    }
  }
  const pairs = (unique.length * (unique.length - 1)) / 2;
  return pairs > 0 ? score / pairs : 1;
}

function preferenceScore(items: ClothingItem[], prefs: Preferences): number {
  let score = 0;
  for (const item of items) {
    const family = colorFamily(item.color);
    if (family && prefs.favoriteColors.some((favorite) => favorite.toLowerCase().includes(family))) {
      score += 0.6;
    }
  }
  return score;
}

function eleganceScore(items: ClothingItem[], prefs: Preferences, categories: CategoryDef[]): number {
  if (prefs.lookStyle === 'both') return 0.5;
  const names = items
    .map((item) => {
      const category = categories.find((candidate) => candidate.id === item.categoryId);
      return category ? category.name.toLowerCase() : '';
    })
    .join(' ');
  const elegantHints = /dress|blazer|heel|pump|silk|clutch|jewel/.test(names);
  const casualHints = /sneaker|hoodie|tee|denim|jean|sport/.test(names);
  if (prefs.lookStyle === 'elegant') return elegantHints ? 1 : casualHints ? 0 : 0.5;
  return casualHints ? 1 : elegantHints ? 0 : 0.5;
}

function nameFor(items: ClothingItem[], season?: Season): string {
  const families = items
    .map((item) => colorFamily(item.color))
    .filter((family): family is string => family !== null);
  const colored = families.find((family) => !NEUTRAL_FAMILIES.has(family));
  const base = colored ? FAMILY_LABELS[colored] : FAMILY_LABELS[families[0] ?? 'beige'];
  return season ? `${base} ${season}` : base;
}

function explanationFor(items: ClothingItem[], season?: Season): string {
  const families = items
    .map((item) => colorFamily(item.color))
    .filter((family): family is string => family !== null);
  const neutrals = families.filter((family) => NEUTRAL_FAMILIES.has(family));
  const colored = families.filter((family) => !NEUTRAL_FAMILIES.has(family));
  const parts: string[] = [];
  if (colored.length > 0 && neutrals.length > 0) {
    parts.push(`${FAMILY_LABELS[colored[0]] ?? 'A pop of colour'} balanced with soft neutrals`);
  } else if (colored.length > 1) {
    parts.push(`A playful mix of ${FAMILY_LABELS[colored[0]]?.toLowerCase() ?? 'colour'} tones`);
  } else {
    parts.push('A calm, tonal palette of neutrals');
  }
  if (items.some((item) => roleOf(item, []) === 'outer' || /coat|blazer|jacket/i.test(item.name))) {
    parts.push('layered for cooler days');
  }
  if (season) {
    parts.push(`made for ${season.toLowerCase()}`);
  }
  return parts.join(' — ') + '.';
}

export function generateOutfits(
  items: ClothingItem[],
  categories: CategoryDef[],
  prefs: Preferences,
  options: { season?: Season; count?: number; occasion?: 'everyday' | 'special' | 'both' } = {},
): OutfitDraft[] {
  const count = options.count ?? 6;
  const season = options.season ?? null;
  const roleMap = new Map(items.map((item) => [item.id, roleOf(item, categories)]));

  const byRole = (role: Role, seasons: Season[] = []) =>
    items.filter(
      (item) =>
        roleMap.get(item.id) === role &&
        (seasons.length === 0 || item.seasons.length === 0 || item.seasons.some((s) => seasons.includes(s))),
    );

  const tops = byRole('top');
  const bottoms = byRole('bottom');
  const dresses = byRole('dress');
  const outers = byRole('outer');
  const shoes = byRole('shoes');
  const bags = byRole('bag');
  const jewellery = byRole('jewellery');
  const accessories = byRole('accessory');

  if ((tops.length === 0 || bottoms.length === 0) && dresses.length === 0) return [];
  if (shoes.length === 0) return [];

  const seasonOptions: Season[] = season ? [season] : prefs.favoriteSeasons.length ? prefs.favoriteSeasons : [];
  const occasion = options.occasion && options.occasion !== 'both' ? options.occasion : undefined;

  const pick = <T,>(list: T[]): T => list[Math.floor(Math.random() * list.length)];
  const shuffle = <T,>(list: T[]): T[] => [...list].sort(() => Math.random() - 0.5);

  const drafts: OutfitDraft[] = [];
  const seen = new Set<string>();
  const maxAttempts = 500;

  for (let attempt = 0; attempt < maxAttempts && drafts.length < count; attempt += 1) {
    const useDress = dresses.length > 0 && (tops.length === 0 || bottoms.length === 0 || Math.random() < 0.4);
    const core: ClothingItem[] = [];
    if (useDress) {
      core.push(pick(useDress ? dresses : dresses));
    } else {
      core.push(pick(tops));
      core.push(pick(bottoms));
    }
    core.push(pick(shoes));

    const targetSeasons = seasonOptions.length ? seasonOptions : (['Spring', 'Summer', 'Autumn', 'Winter'] as Season[]);
    const outfitSeasons = sharedSeasons(core).filter((s) => targetSeasons.includes(s));
    if (outfitSeasons.length === 0 && seasonOptions.length > 0) continue;

    const extras: ClothingItem[] = [];
    const cold = outfitSeasons.length > 0 && outfitSeasons.some((s) => COLD_SEASONS.includes(s));
    if (cold && outers.length > 0 && Math.random() < 0.8) {
      const outer = pick(outers);
      if (coversSeason(outer, outfitSeasons[0] ?? 'Spring')) extras.push(outer);
    }
    const finishing = [...bags, ...jewellery, ...accessories];
    const finishingPicks = shuffle(finishing).slice(0, Math.random() < 0.6 ? 2 : 1);
    for (const extra of finishingPicks) {
      if (outfitSeasons.length === 0 || coversSeason(extra, outfitSeasons[0])) extras.push(extra);
    }

    const all = [...core, ...extras];
    const key = all.map((item) => item.id).sort().join('|');
    if (seen.has(key)) continue;

    const score =
      colorScore(all) * 2 +
      preferenceScore(all, prefs) +
      eleganceScore(all, prefs, categories) +
      (occasion === 'special' && (useDress || all.some((i) => roleMap.get(i.id) === 'outer')) ? 0.4 : 0) +
      Math.random() * 0.5;

    seen.add(key);
    drafts.push({
      itemIds: all.map((item) => item.id),
      seasons: outfitSeasons.length > 0 ? outfitSeasons : [],
      name: nameFor(all, outfitSeasons[0]),
      explanation: explanationFor(all, outfitSeasons[0]),
      occasion,
    });
    void score;
  }

  return drafts.slice(0, count);
}
