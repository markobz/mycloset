import { useState } from 'react';
import { View } from 'react-native';
import { Preferences, STYLE_TAGS, StyleTag } from '../types';
import { Chip, Field, Input, SeasonChips } from './ui';
import { useCloset } from '../store/ClosetStore';

const COLOR_SUGGESTIONS = [
  'Ivory',
  'Cream',
  'Beige',
  'Camel',
  'White',
  'Black',
  'Grey',
  'Navy',
  'Blue',
  'Emerald',
  'Burgundy',
  'Blush',
  'Gold',
];

const LOOK_OPTIONS: { label: string; value: Preferences['lookStyle'] }[] = [
  { label: 'Casual', value: 'casual' },
  { label: 'Elegant', value: 'elegant' },
  { label: 'Both', value: 'both' },
];

const OCCASION_OPTIONS: { label: string; value: Preferences['occasion'] }[] = [
  { label: 'Everyday', value: 'everyday' },
  { label: 'Special', value: 'special' },
  { label: 'Both', value: 'both' },
];

export function PreferencesEditor() {
  const { preferences, setPreferences } = useCloset();
  const [colorDraft, setColorDraft] = useState('');

  const toggle = <T,>(list: T[], value: T): T[] =>
    list.includes(value) ? list.filter((entry) => entry !== value) : [...list, value];

  const addCustomColor = () => {
    const value = colorDraft.trim();
    if (!value) return;
    if (!preferences.favoriteColors.some((color) => color.toLowerCase() === value.toLowerCase())) {
      setPreferences({ favoriteColors: [...preferences.favoriteColors, value] });
    }
    setColorDraft('');
  };

  return (
    <View>
      <Field label="Favourite colours">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 10 }}>
          {preferences.favoriteColors.map((color) => (
            <Chip
              key={color}
              label={`${color}  ✕`}
              active
              gold
              onPress={() =>
                setPreferences({
                  favoriteColors: preferences.favoriteColors.filter((entry) => entry !== color),
                })
              }
            />
          ))}
        </View>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {COLOR_SUGGESTIONS.filter(
            (color) =>
              !preferences.favoriteColors.some(
                (entry) => entry.toLowerCase() === color.toLowerCase(),
              ),
          ).map((color) => (
            <Chip key={color} label={color} onPress={() => setPreferences({ favoriteColors: [...preferences.favoriteColors, color] })} />
          ))}
        </View>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
          <View style={{ flex: 1 }}>
            <Input
              value={colorDraft}
              onChangeText={setColorDraft}
              placeholder="Add your own colour…"
              onSubmitEditing={addCustomColor}
              returnKeyType="done"
            />
          </View>
        </View>
      </Field>

      <Field label="Favourite styles">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {STYLE_TAGS.map((tag: StyleTag) => (
            <Chip
              key={tag}
              label={tag}
              active={preferences.favoriteStyles.includes(tag)}
              onPress={() => setPreferences({ favoriteStyles: toggle(preferences.favoriteStyles, tag) })}
            />
          ))}
        </View>
      </Field>

      <Field label="Favourite seasons">
        <SeasonChips
          selected={preferences.favoriteSeasons}
          onToggle={(season) => setPreferences({ favoriteSeasons: toggle(preferences.favoriteSeasons, season) })}
        />
      </Field>

      <Field label="Preferred looks">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {LOOK_OPTIONS.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              active={preferences.lookStyle === option.value}
              onPress={() => setPreferences({ lookStyle: option.value })}
            />
          ))}
        </View>
      </Field>

      <Field label="Occasion">
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
          {OCCASION_OPTIONS.map((option) => (
            <Chip
              key={option.value}
              label={option.label}
              active={preferences.occasion === option.value}
              onPress={() => setPreferences({ occasion: option.value })}
            />
          ))}
        </View>
      </Field>
    </View>
  );
}
