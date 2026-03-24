import React, { useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMenu } from '@/hooks/useMenu';
import CategoryBar from '@/components/menu/CategoryBar';
import MenuItemCard from '@/components/menu/MenuItemCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/theme';
import type { MenuItem } from '@/types';

export default function MenuScreen() {
  const { categories, items, loading, error, getItemsByCategory } = useMenu();
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [searchText, setSearchText] = useState<string>('');

  const filteredItems = useMemo(() => {
    const categoryItems = selectedCategoryId ? getItemsByCategory(selectedCategoryId) : items;
    const normalizedSearch = searchText.trim().toLowerCase();

    if (!normalizedSearch) {
      return categoryItems;
    }

    return categoryItems.filter((item) => item.name.toLowerCase().includes(normalizedSearch));
  }, [selectedCategoryId, getItemsByCategory, items, searchText]);

  const renderItem = ({ item }: { item: MenuItem }) => {
    return (
      <MenuItemCard
        item={item}
        onPress={() => router.push(`/menu/item/${item.id}`)}
      />
    );
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color={Colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          value={searchText}
          onChangeText={setSearchText}
          placeholder="Search menu items"
          placeholderTextColor={Colors.textSecondary}
          style={styles.searchInput}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <CategoryBar
        categories={categories}
        selectedId={selectedCategoryId}
        onSelect={setSelectedCategoryId}
      />

      {error ? (
        <View style={styles.centerMessage}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : (
        <FlatList
          data={filteredItems}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.centerMessage}>
              <Text style={styles.emptyText}>No matching items found.</Text>
            </View>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: Spacing.md,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: Spacing.sm,
  },
  searchIcon: {
    marginRight: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.md,
    color: Colors.text,
    paddingVertical: Spacing.sm,
  },
  listContent: {
    paddingBottom: Spacing.xl,
  },
  centerMessage: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.lg,
    alignItems: 'center',
  },
  errorText: {
    color: Colors.error,
    fontSize: FontSize.md,
  },
  emptyText: {
    color: Colors.textSecondary,
    fontSize: FontSize.md,
  },
});
