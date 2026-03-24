import React from 'react';
import { ScrollView, Text, Pressable, StyleSheet, View } from 'react-native';
import { Category } from '@/types';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/theme';

interface CategoryBarProps {
  categories: Category[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

export default function CategoryBar({ categories, selectedId, onSelect }: CategoryBarProps) {
  return (
    <View style={styles.wrapper}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.container}
      >
        <Pressable
          style={[styles.pill, selectedId === null ? styles.pillSelected : styles.pillUnselected]}
          onPress={() => onSelect(null)}
        >
          <Text style={[styles.text, selectedId === null ? styles.textSelected : styles.textUnselected]}>All</Text>
        </Pressable>
        {categories.map((category) => (
          <Pressable
            key={category.id}
            style={[styles.pill, selectedId === category.id ? styles.pillSelected : styles.pillUnselected]}
            onPress={() => onSelect(category.id)}
          >
            <Text style={[styles.text, selectedId === category.id ? styles.textSelected : styles.textUnselected]}>
              {category.name}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    height: 52,
  },
  container: {
    height: 52,
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  pill: {
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.sm,
  },
  pillSelected: {
    backgroundColor: Colors.primary,
  },
  pillUnselected: {
    backgroundColor: Colors.surface,
  },
  text: {
    fontSize: FontSize.sm,
    lineHeight: FontSize.sm + 4,
  },
  textSelected: {
    color: Colors.textLight,
    fontWeight: '600',
  },
  textUnselected: {
    color: Colors.text,
    fontWeight: '600',
  },
});
