import { useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { BrandHeader, Chip, EmptyState, Screen } from '../../components/ui';
import { theme, typography } from '../../theme';
import { useCloset } from '../../store/ClosetStore';
import { ClothingItem, SEASONS, Season } from '../../types';

type SeasonFilter = Season | null;

export default function WardrobeScreen() {
  const { name, categories, items } = useCloset();
  const [search, setSearch] = useState('');
  const [seasonFilter, setSeasonFilter] = useState<SeasonFilter>(null);
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null);

  const categoryById = useMemo(() => new Map(categories.map((c) => [c.id, c])), [categories]);

  const topLevelCategories = useMemo(
    () => categories.filter((category) => category.parentId === null),
    [categories],
  );

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    return items.filter((item) => {
      if (query) {
        const category = item.categoryId ? categoryById.get(item.categoryId) : null;
        const haystack = [
          item.name,
          item.color,
          item.brand ?? '',
          item.notes ?? '',
          category ? category.name : '',
        ]
          .join(' ')
          .toLowerCase();
        if (!haystack.includes(query)) return false;
      }
      if (favoritesOnly && !item.favorite) return false;
      if (seasonFilter && item.seasons.length > 0 && !item.seasons.includes(seasonFilter)) {
        return false;
      }
      if (categoryFilter) {
        const allowed = new Set<string>([categoryFilter]);
        for (const category of categories) {
          if (category.parentId === categoryFilter) allowed.add(category.id);
        }
        if (!item.categoryId || !allowed.has(item.categoryId)) return false;
      }
      return true;
    });
  }, [items, search, favoritesOnly, seasonFilter, categoryFilter, categories, categoryById]);

  const countFor = (categoryId: string) =>
    items.filter((item) => {
      const ids = new Set<string>([categoryId]);
      for (const category of categories) {
        if (category.parentId === categoryId) ids.add(category.id);
      }
      return item.categoryId !== null && ids.has(item.categoryId);
    }).length;

  const renderItem = ({ item }: { item: ClothingItem }) => {
    const category = item.categoryId ? categoryById.get(item.categoryId) : null;
    return (
      <Pressable style={styles.card} onPress={() => router.push(`/item/${item.id}`)}>
        <View style={styles.imageWrap}>
          {item.uri ? (
            <Image source={{ uri: item.uri }} style={styles.image} resizeMode="cover" />
          ) : (
            <View style={[styles.image, styles.imagePlaceholder]}>
              <Ionicons name="image-outline" size={28} color={theme.beige} />
            </View>
          )}
          {item.favorite ? (
            <View style={styles.favoriteBadge}>
              <Ionicons name="heart" size={12} color="#FFFFFF" />
            </View>
          ) : null}
        </View>
        <Text style={styles.itemName} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={typography.muted} numberOfLines={1}>
          {category ? category.name : item.color || 'Uncategorised'}
        </Text>
      </Pressable>
    );
  };

  return (
    <Screen>
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ gap: 14, paddingHorizontal: theme.spacing }}
        contentContainerStyle={{ paddingBottom: 24 }}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={{ paddingHorizontal: 0 }}>
            <BrandHeader greeting={name ? `Good to see you, ${name}.` : undefined} />

            <View style={styles.searchWrap}>
              <Ionicons name="search" size={16} color={theme.muted} />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search your wardrobe…"
                placeholderTextColor={theme.muted}
                style={styles.searchInput}
              />
            </View>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
              <Chip label="All seasons" active={seasonFilter === null} onPress={() => setSeasonFilter(null)} />
              {SEASONS.map((season) => (
                <Chip
                  key={season}
                  label={season}
                  active={seasonFilter === season}
                  onPress={() => setSeasonFilter(seasonFilter === season ? null : season)}
                />
              ))}
              <Chip
                label="♥ Favourites"
                active={favoritesOnly}
                gold
                onPress={() => setFavoritesOnly(!favoritesOnly)}
              />
            </View>

            <View style={{ marginTop: 12 }}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                <Chip
                  label="All pieces"
                  active={categoryFilter === null}
                  onPress={() => setCategoryFilter(null)}
                />
                {topLevelCategories.map((category) => (
                  <Chip
                    key={category.id}
                    label={`${category.name} · ${countFor(category.id)}`}
                    active={categoryFilter === category.id}
                    onPress={() => setCategoryFilter(categoryFilter === category.id ? null : category.id)}
                  />
                ))}
                <Link href="/categories" asChild>
                  <Pressable style={styles.manageChip}>
                    <Ionicons name="pencil-outline" size={13} color={theme.gold} />
                    <Text style={styles.manageChipText}>Manage</Text>
                  </Pressable>
                </Link>
              </View>
            </View>

            <Text style={[typography.muted, { marginTop: 16, marginBottom: 10 }]}>
              {filtered.length} {filtered.length === 1 ? 'piece' : 'pieces'}
            </Text>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="shirt-outline"
            title="Nothing here yet"
            subtitle="Tap the + button to photograph your first piece. Your wardrobe will grow from there."
          />
        }
        renderItem={renderItem}
      />

      <Pressable style={styles.fab} onPress={() => router.push('/add-item')}>
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  searchWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: theme.ivory,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: theme.ink,
  },
  manageChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.gold,
    borderStyle: 'dashed',
  },
  manageChipText: {
    fontSize: 13,
    color: theme.gold,
  },
  card: {
    flex: 1,
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: theme.radius,
    padding: 10,
    marginBottom: 14,
  },
  imageWrap: {
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: theme.cream,
    aspectRatio: 4 / 5,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  favoriteBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: theme.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemName: {
    fontSize: 15,
    color: theme.ink,
    fontWeight: '500',
    marginTop: 10,
  },
  fab: {
    position: 'absolute',
    right: theme.spacing,
    bottom: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: theme.gold,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
});
