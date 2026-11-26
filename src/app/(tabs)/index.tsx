import { useMemo, useState } from 'react';
import {
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCloset } from '../../context/ClosetContext';
import { CATEGORIES, Category } from '../../types';
import { theme, typography } from '../../theme';

type Filter = 'All' | Category;

const FILTERS: Filter[] = ['All', ...CATEGORIES];

export default function ClosetScreen() {
  const { items } = useCloset();
  const [filter, setFilter] = useState<Filter>('All');

  const filtered = useMemo(
    () =>
      filter === 'All' ? items : items.filter((item) => item.category === filter),
    [items, filter],
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={typography.title}>My Closet</Text>
        <Link href="/add-item" asChild>
          <Pressable style={styles.addButton} hitSlop={8}>
            <Ionicons name="add" size={22} color={theme.onPrimary} />
          </Pressable>
        </Link>
      </View>

      <View style={styles.filters}>
        <FlatList
          horizontal
          data={FILTERS}
          keyExtractor={(option) => option}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filtersContent}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => setFilter(item)}
              style={[styles.chip, filter === item && styles.chipActive]}
            >
              <Text
                style={[
                  styles.chipText,
                  filter === item && styles.chipTextActive,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          )}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        numColumns={3}
        columnWrapperStyle={styles.row}
        contentContainerStyle={styles.grid}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="shirt-outline" size={48} color={theme.border} />
            <Text style={styles.emptyTitle}>
              {items.length === 0
                ? 'Your closet is empty'
                : 'Nothing in this category yet'}
            </Text>
            <Text style={styles.emptySubtitle}>
              Add your first piece and start building outfits.
            </Text>
            <Link href="/add-item" asChild>
              <Pressable style={styles.emptyButton}>
                <Text style={styles.emptyButtonText}>Add an item</Text>
              </Pressable>
            </Link>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => router.push(`/item/${item.id}`)}
          >
            <Image source={{ uri: item.uri }} style={styles.cardImage} />
            {item.favorite && (
              <View style={styles.favoriteBadge}>
                <Ionicons name="heart" size={12} color="#E0574F" />
              </View>
            )}
            <Text style={styles.cardName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.cardCategory}>{item.category}</Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing,
    paddingTop: 8,
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filters: {
    marginTop: 12,
  },
  filtersContent: {
    paddingHorizontal: theme.spacing,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: theme.chip,
  },
  chipActive: {
    backgroundColor: theme.primary,
  },
  chipText: {
    fontSize: 13,
    color: theme.text,
    fontWeight: '500',
  },
  chipTextActive: {
    color: theme.onPrimary,
  },
  grid: {
    paddingHorizontal: theme.spacing,
    paddingBottom: 24,
  },
  row: {
    gap: 10,
    marginBottom: 16,
  },
  card: {
    flex: 1,
    backgroundColor: theme.card,
    borderRadius: theme.radius,
    padding: 8,
    borderWidth: 1,
    borderColor: theme.border,
  },
  cardImage: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 10,
    backgroundColor: theme.chip,
  },
  favoriteBadge: {
    position: 'absolute',
    top: 14,
    right: 14,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: theme.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardName: {
    ...typography.body,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 8,
  },
  cardCategory: {
    ...typography.subtitle,
    fontSize: 11,
    marginTop: 2,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 80,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    ...typography.body,
    fontWeight: '600',
    marginTop: 16,
  },
  emptySubtitle: {
    ...typography.subtitle,
    textAlign: 'center',
    marginTop: 6,
  },
  emptyButton: {
    marginTop: 20,
    backgroundColor: theme.primary,
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  emptyButtonText: {
    ...typography.button,
    color: theme.onPrimary,
  },
});
