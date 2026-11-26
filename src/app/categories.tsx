import { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Input, PrimaryButton, Screen } from '../components/ui';
import { theme, typography } from '../theme';
import { useCloset } from '../store/ClosetStore';

export default function CategoriesScreen() {
  const {
    categories,
    items,
    addCategory,
    renameCategory,
    deleteCategory,
    moveCategory,
  } = useCloset();
  const [newName, setNewName] = useState('');
  const [newParent, setNewParent] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState('');
  const [addingSubFor, setAddingSubFor] = useState<string | null>(null);
  const [subDraft, setSubDraft] = useState('');

  const countFor = useMemo(() => {
    const map = new Map<string, number>();
    for (const category of categories) map.set(category.id, 0);
    for (const item of items) {
      if (item.categoryId && map.has(item.categoryId)) {
        map.set(item.categoryId, (map.get(item.categoryId) ?? 0) + 1);
      }
    }
    return map;
  }, [categories, items]);

  const topLevel = categories.filter((category) => category.parentId === null);
  const subsFor = (parentId: string) => categories.filter((category) => category.parentId === parentId);

  const create = async () => {
    if (!newName.trim()) return;
    await addCategory(newName, newParent);
    setNewName('');
    setNewParent(null);
  };

  const confirmDelete = (id: string, label: string) => {
    const subCount = subsFor(id).length;
    const itemCount = countFor.get(id) ?? 0;
    Alert.alert(
      `Delete "${label}"?`,
      subCount > 0
        ? 'Its subcategories will be deleted too. Items inside will become uncategorised.'
        : itemCount > 0
          ? `${itemCount} ${itemCount === 1 ? 'item' : 'items'} inside will become uncategorised.`
          : 'This category is empty.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            void deleteCategory(id);
          },
        },
      ],
    );
  };

  const CategoryRow = ({ id, name, sub }: { id: string; name: string; sub: boolean }) => {
    if (editingId === id) {
      return (
        <View style={[styles.row, sub && styles.subRow]}>
          <View style={{ flex: 1 }}>
            <Input value={editDraft} onChangeText={setEditDraft} autoFocus />
          </View>
          <Text
            style={styles.rowAction}
            onPress={() => {
              if (editDraft.trim()) {
                void renameCategory(id, editDraft);
              }
              setEditingId(null);
            }}
          >
            Save
          </Text>
          <Text
            style={[styles.rowAction, { color: theme.muted }]}
            onPress={() => setEditingId(null)}
          >
            Cancel
          </Text>
        </View>
      );
    }
    return (
      <View style={[styles.row, sub && styles.subRow]}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.rowTitle, sub && { fontSize: 14 }]}>{name}</Text>
          <Text style={typography.muted}>{countFor.get(id) ?? 0} items</Text>
        </View>
        {!sub ? (
          <>
            <Pressable hitSlop={8} onPress={() => void moveCategory(id, -1)}>
              <Ionicons name="arrow-up" size={18} color={theme.muted} />
            </Pressable>
            <Pressable hitSlop={8} onPress={() => void moveCategory(id, 1)}>
              <Ionicons name="arrow-down" size={18} color={theme.muted} />
            </Pressable>
            <Pressable
              hitSlop={8}
              onPress={() => {
                setAddingSubFor(addingSubFor === id ? null : id);
                setSubDraft('');
              }}
            >
              <Ionicons name="add" size={18} color={theme.gold} />
            </Pressable>
          </>
        ) : null}
        <Pressable
          hitSlop={8}
          onPress={() => {
            setEditingId(id);
            setEditDraft(name);
          }}
        >
          <Ionicons name="pencil-outline" size={17} color={theme.muted} />
        </Pressable>
        <Pressable hitSlop={8} onPress={() => confirmDelete(id, name)}>
          <Ionicons name="trash-outline" size={17} color={theme.danger} />
        </Pressable>
      </View>
    );
  };

  return (
    <Screen>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
        {topLevel.map((category) => (
          <View key={category.id} style={styles.group}>
            <CategoryRow id={category.id} name={category.name} sub={false} />
            {subsFor(category.id).map((sub) => (
              <CategoryRow key={sub.id} id={sub.id} name={sub.name} sub />
            ))}
            {addingSubFor === category.id ? (
              <View style={[styles.row, styles.subRow]}>
                <View style={{ flex: 1 }}>
                  <Input
                    value={subDraft}
                    onChangeText={setSubDraft}
                    placeholder={`New subcategory of ${category.name}`}
                    autoFocus
                    onSubmitEditing={() => {
                      if (subDraft.trim()) {
                        void addCategory(subDraft, category.id);
                      }
                      setSubDraft('');
                      setAddingSubFor(null);
                    }}
                  />
                </View>
                <Text
                  style={styles.rowAction}
                  onPress={() => {
                    if (subDraft.trim()) {
                      void addCategory(subDraft, category.id);
                    }
                    setSubDraft('');
                    setAddingSubFor(null);
                  }}
                >
                  Add
                </Text>
              </View>
            ) : null}
          </View>
        ))}

        <View style={{ marginTop: 8 }}>
          <Text style={[typography.heading, { marginBottom: 12 }]}>New category</Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
            <Text
              style={[
                styles.parentPick,
                newParent === null && styles.parentPickActive,
              ]}
              onPress={() => setNewParent(null)}
            >
              Top level
            </Text>
            {topLevel.map((category) => (
              <Text
                key={category.id}
                style={[
                  styles.parentPick,
                  newParent === category.id && styles.parentPickActive,
                ]}
                onPress={() => setNewParent(category.id)}
              >
                In {category.name}
              </Text>
            ))}
          </View>
          <Input
            value={newName}
            onChangeText={setNewName}
            placeholder="e.g. Knitwear, Evening bags…"
          />
          <View style={{ marginTop: 12 }}>
            <PrimaryButton label="Add category" disabled={!newName.trim()} onPress={() => void create()} />
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  group: {
    backgroundColor: theme.card,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: theme.radius,
    paddingHorizontal: 14,
    paddingVertical: 4,
    marginBottom: 14,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  subRow: {
    paddingLeft: 16,
    borderBottomWidth: 0,
  },
  rowTitle: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.ink,
  },
  rowAction: {
    color: theme.gold,
    fontSize: 13,
    fontWeight: '600',
  },
  parentPick: {
    fontSize: 13,
    color: theme.muted,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: theme.border,
    overflow: 'hidden',
  },
  parentPickActive: {
    color: theme.gold,
    borderColor: theme.gold,
    backgroundColor: theme.goldSoft,
  },
});
