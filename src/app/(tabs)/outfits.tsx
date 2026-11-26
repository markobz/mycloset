import { FlatList, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useCloset } from '../../context/ClosetContext';
import { theme, typography } from '../../theme';

export default function OutfitsScreen() {
  const { outfits, items } = useCloset();

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={typography.title}>Outfits</Text>
        <Link href="/create-outfit" asChild>
          <Pressable style={styles.addButton} hitSlop={8}>
            <Ionicons name="add" size={22} color={theme.onPrimary} />
          </Pressable>
        </Link>
      </View>

      <FlatList
        data={outfits}
        keyExtractor={(outfit) => outfit.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="albums-outline" size={48} color={theme.border} />
            <Text style={styles.emptyTitle}>No outfits yet</Text>
            <Text style={styles.emptySubtitle}>
              Combine pieces from your closet into ready-to-wear outfits.
            </Text>
            <Link href="/create-outfit" asChild>
              <Pressable style={styles.emptyButton}>
                <Text style={styles.emptyButtonText}>Create an outfit</Text>
              </Pressable>
            </Link>
          </View>
        }
        renderItem={({ item }) => {
          const thumbs = item.itemIds
            .map((id) => items.find((clothingItem) => clothingItem.id === id))
            .filter(Boolean);
          return (
            <Pressable
              style={styles.card}
              onPress={() => router.push(`/outfit/${item.id}`)}
            >
              <Text style={styles.cardName}>{item.name}</Text>
              {item.occasion ? (
                <Text style={styles.cardOccasion}>{item.occasion}</Text>
              ) : null}
              <View style={styles.thumbs}>
                {thumbs.length === 0 ? (
                  <Text style={styles.cardOccasion}>
                    {item.itemIds.length} items no longer in your closet
                  </Text>
                ) : (
                  <>
                    {thumbs.slice(0, 4).map((clothingItem) => (
                      <Image
                        key={clothingItem!.id}
                        source={{ uri: clothingItem!.uri }}
                        style={styles.thumb}
                      />
                    ))}
                    {item.itemIds.length > 4 && (
                      <View style={[styles.thumb, styles.moreThumb]}>
                        <Text style={styles.moreText}>
                          +{item.itemIds.length - 4}
                        </Text>
                      </View>
                    )}
                  </>
                )}
              </View>
            </Pressable>
          );
        }}
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
  list: {
    padding: theme.spacing,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: theme.card,
    borderRadius: theme.radius,
    padding: 14,
    borderWidth: 1,
    borderColor: theme.border,
    marginBottom: 12,
  },
  cardName: {
    ...typography.body,
    fontWeight: '600',
  },
  cardOccasion: {
    ...typography.subtitle,
    marginTop: 2,
  },
  thumbs: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  thumb: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: theme.chip,
  },
  moreThumb: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreText: {
    ...typography.subtitle,
    fontSize: 12,
    color: theme.text,
    fontWeight: '600',
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
