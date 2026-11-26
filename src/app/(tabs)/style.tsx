import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import {
  Card,
  Chip,
  ItemThumb,
  PageHeader,
  PrimaryButton,
  Screen,
} from '../../components/ui';
import { PreferencesEditor } from '../../components/PreferencesEditor';
import { theme, typography } from '../../theme';
import { useCloset } from '../../store/ClosetStore';
import { generateOutfits, OutfitDraft, roleOf } from '../../stylist';
import { ClothingItem, SEASONS, Season } from '../../types';

function pickRandom<T>(list: T[]): T {
  return list[Math.floor(Math.random() * list.length)];
}

export default function StyleScreen() {
  const { items, categories, preferences, addOutfit } = useCloset();
  const [season, setSeason] = useState<Season | null>(null);
  const [drafts, setDrafts] = useState<OutfitDraft[]>([]);
  const [generating, setGenerating] = useState(false);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  const itemById = useMemo(() => new Map(items.map((item) => [item.id, item])), [items]);
  const roleById = useMemo(
    () => new Map(items.map((item) => [item.id, roleOf(item, categories)])),
    [items, categories],
  );

  const readyToStyle =
    (items.filter((item) => roleById.get(item.id) === 'top').length > 0 &&
      items.filter((item) => roleById.get(item.id) === 'bottom').length > 0) ||
    items.filter((item) => roleById.get(item.id) === 'dress').length > 0;

  const generate = () => {
    setGenerating(true);
    setSavedIds([]);
    setTimeout(() => {
      const results = generateOutfits(items, categories, preferences, {
        season: season ?? undefined,
        count: 6,
      });
      setDrafts(results);
      setGenerating(false);
      if (results.length === 0) {
        Alert.alert(
          'Not enough pieces yet',
          readyToStyle
            ? 'Add a few more pieces (including shoes) so your stylist has options.'
            : 'Your stylist needs at least a top and a bottom — or a dress — plus shoes. Add a few pieces in the Wardrobe tab first.',
        );
      }
    }, 500);
  };

  const replaceItem = (draftIndex: number, itemId: string) => {
    const draft = drafts[draftIndex];
    const role = roleById.get(itemId);
    if (!role || role === 'other') return;
    const used = new Set(draft.itemIds);
    const candidates = items.filter(
      (item) =>
        item.id !== itemId &&
        !used.has(item.id) &&
        roleById.get(item.id) === role &&
        (draft.seasons.length === 0 ||
          item.seasons.length === 0 ||
          item.seasons.some((s) => draft.seasons.includes(s))),
    );
    if (candidates.length === 0) return;
    const pick = pickRandom(candidates);
    setDrafts((previous) =>
      previous.map((entry, index) =>
        index === draftIndex
          ? { ...entry, itemIds: entry.itemIds.map((id) => (id === itemId ? pick.id : id)) }
          : entry,
      ),
    );
  };

  const saveDraft = async (draft: OutfitDraft) => {
    await addOutfit({
      name: draft.name,
      itemIds: draft.itemIds,
      seasons: draft.seasons,
      occasion: draft.occasion,
      explanation: draft.explanation,
    });
    setSavedIds((previous) => [...previous, draft.itemIds.join('|')]);
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
        <PageHeader
          title="Style"
          subtitle="Your personal stylist, working only with the pieces you own."
        />

        <Card style={{ marginBottom: theme.spacing }}>
          <Text style={[typography.muted, { marginBottom: 10, letterSpacing: 0.6, textTransform: 'uppercase', fontSize: 11 }]}>
            Season for these looks
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            <Chip label="Any" active={season === null} onPress={() => setSeason(null)} />
            {SEASONS.map((option) => (
              <Chip
                key={option}
                label={option}
                active={season === option}
                onPress={() => setSeason(season === option ? null : option)}
              />
            ))}
          </View>
          <View style={{ marginTop: 16 }}>
            <PrimaryButton
              label="Create outfits for me"
              busy={generating}
              disabled={!readyToStyle || items.length === 0}
              onPress={generate}
            />
          </View>
          {!readyToStyle && items.length > 0 ? (
            <Text style={[typography.muted, { marginTop: 10, lineHeight: 18 }]}>
              Your stylist needs at least a top and a bottom — or a dress — plus a pair of shoes.
            </Text>
          ) : null}
        </Card>

        {drafts.length > 0 ? (
          <View style={{ gap: 16 }}>
            {drafts.map((draft, index) => {
              const key = draft.itemIds.join('|');
              const saved = savedIds.includes(key);
              return (
                <Card key={`${index}-${key}`}>
                  <Text style={typography.heading}>{draft.name}</Text>
                  {draft.seasons.length > 0 ? (
                    <Text style={[typography.muted, { marginTop: 2 }]}>
                      {draft.occasion ? `${draft.occasion} · ` : ''}
                      {draft.seasons.join(', ')}
                    </Text>
                  ) : null}
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
                    {draft.itemIds.map((itemId) => {
                      const item = itemById.get(itemId) as ClothingItem | undefined;
                      if (!item) return null;
                      return (
                        <View key={itemId} style={{ width: 72 }}>
                          <Pressable onPress={() => replaceItem(index, itemId)}>
                            <ItemThumb uri={item.uri} size={72} />
                          </Pressable>
                          <Text style={styles.thumbName} numberOfLines={1}>
                            {item.name}
                          </Text>
                        </View>
                      );
                    })}
                  </View>
                  <Text style={[typography.muted, { marginTop: 2, fontSize: 11 }]}>
                    Tap a piece to swap it for something similar.
                  </Text>
                  <Text style={[typography.body, { marginTop: 12, lineHeight: 21, color: theme.muted }]}>
                    {draft.explanation}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 10, marginTop: 14 }}>
                    <View style={{ flex: 1 }}>
                      <PrimaryButton
                        label={saved ? 'Saved ✓' : 'Save to My Outfits'}
                        disabled={saved}
                        tone={saved ? 'ink' : 'gold'}
                        onPress={() => {
                          void saveDraft(draft);
                        }}
                      />
                    </View>
                    <Pressable
                      style={styles.squareButton}
                      onPress={() =>
                        router.push({
                          pathname: '/create-outfit',
                          params: { fromDraft: draft.itemIds.join(',') },
                        })
                      }
                    >
                      <Ionicons name="pencil-outline" size={20} color={theme.gold} />
                    </Pressable>
                  </View>
                </Card>
              );
            })}
            {drafts.length > 0 ? (
              <PrimaryButton
                label="Generate new looks"
                tone="ink"
                busy={generating}
                onPress={generate}
              />
            ) : null}
          </View>
        ) : (
          <Card>
            <Text style={[typography.heading, { marginBottom: 12 }]}>Your preferences</Text>
            <Text style={[typography.muted, { marginBottom: 16, lineHeight: 19 }]}>
              Your stylist uses these to make looks that feel like you.
            </Text>
            <PreferencesEditor />
          </Card>
        )}
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  thumbName: {
    fontSize: 11,
    color: theme.muted,
    marginTop: 4,
    textAlign: 'center',
  },
  squareButton: {
    width: 52,
    height: 52,
    borderRadius: theme.radius,
    borderWidth: 1,
    borderColor: theme.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
