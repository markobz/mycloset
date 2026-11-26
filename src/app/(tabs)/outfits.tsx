import { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Chip, EmptyState, ItemThumb, PageHeader, Screen } from '../../components/ui';
import { theme, typography } from '../../theme';
import { useCloset } from '../../store/ClosetStore';
import { Outfit, SEASONS, Season } from '../../types';

type Filter = 'all' | 'favorites' | Season;

export default function MyOutfitsScreen() {
  const { outfits, items, updateOutfit } = useCloset();
  const [filter, setFilter] = useState<Filter>('all');

  const itemById = useMemo(() => new Map(items.map((item) => [item.id, item])), [items]);

  const filtered = useMemo(() => {
    return outfits.filter((outfit) => {
      if (filter === 'favorites' && !outfit.favorite) return false;
      if (filter !== 'all' && filter !== 'favorites') {
        const season = filter as Season;
        if (outfit.seasons.length > 0 && !outfit.seasons.includes(season)) return false;
      }
      return true;
    });
  }, [outfits, filter]);

  const lastWorn = (outfit: Outfit) => {
    const dates = outfit.wornDates ?? [];
    if (dates.length === 0) return null;
    const latest = Math.max(...dates);
    return new Date(latest).toLocaleDateString(undefined, { day: 'numeric', month: 'short' });
  };

  return (
    <Screen>
      <FlatList
        data={filtered}
        keyExtractor={(outfit) => outfit.id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 24 }}
        ListHeaderComponent={
          <View>
            <PageHeader
              title="My Outfits"
              subtitle="Every look you saved, ready to wear again."
            />
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              <Chip label="All" active={filter === 'all'} onPress={() => setFilter('all')} />
              <Chip
                label="♥ Favourites"
                active={filter === 'favorites'}
                gold
                onPress={() => setFilter('favorites')}
              />
              {SEASONS.map((season) => (
                <Chip
                  key={season}
                  label={season}
                  active={filter === season}
                  onPress={() => setFilter(filter === season ? 'all' : season)}
                />
              ))}
            </View>
          </View>
        }
        ListEmptyComponent={
          <View>
            <EmptyState
              icon="albums-outline"
              title="No outfits yet"
              subtitle="Let your stylist create looks for you in the Style tab, or build one yourself."
            />
            <Pressable style={styles.buildButton} onPress={() => router.push('/create-outfit')}>
              <Text style={[typography.button, { color: theme.gold }]}>Build an outfit myself</Text>
            </Pressable>
          </View>
        }
        renderItem={({ item }) => {
          const worn = lastWorn(item);
          return (
            <Pressable style={styles.card} onPress={() => router.push(`/outfit/${item.id}`)}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Text style={[typography.heading, { flex: 1 }]} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Pressable
                    hitSlop={10}
                    onPress={() => {
                      void updateOutfit(item.id, { favorite: !item.favorite });
                    }}
                  >
                    <Ionicons
                      name={item.favorite ? 'heart' : 'heart-outline'}
                      size={20}
                      color={item.favorite ? theme.gold : theme.muted}
                    />
                  </Pressable>
                </View>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                  {item.itemIds.map((itemId) => {
                    const wardrobeItem = itemById.get(itemId);
                    return <ItemThumb key={itemId} uri={wardrobeItem?.uri} size={56} />;
                  })}
                </View>
                <Text style={[typography.muted, { marginTop: 10 }]}>
                  {[
                    item.seasons.length > 0 ? item.seasons.join(', ') : null,
                    item.occasion,
                    worn ? `Last worn ${worn}` : null,
                  ]
                    .filter(Boolean)
                    .join(' · ') || 'No details yet'}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={18} color={theme.beige} />
            </Pressable>
          );
        }}
      />
      <Pressable style={styles.fab} onPress={() => router.push('/create-outfit')}>
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </Pressable>
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: theme.radius,
    padding: 16,
    marginBottom: 14,
  },
  buildButton: {
    alignItems: 'center',
    paddingVertical: 14,
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
