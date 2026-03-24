import React, { useEffect, useMemo, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { getMenuItemById } from '@/api/menuApi';
import { useCartStore } from '@/store/cartStore';
import { MenuImage } from '@/components/common/MenuImage';
import { QuantityStepper } from '@/components/common/QuantityStepper';
import CustomizationGroup from '@/components/menu/CustomizationGroup';
import { Button } from '@/components/common/Button';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/theme';
import { formatCurrency } from '@/hooks/useFormatCurrency';
import type { MenuItem } from '@/types';

export default function MenuItemDetailScreen() {
  const params = useLocalSearchParams<{ id?: string | string[] }>();
  const menuItemId = Array.isArray(params.id) ? params.id[0] : params.id;

  const [menuItem, setMenuItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCustomizations, setSelectedCustomizations] = useState<Record<string, string[]>>({});
  const [specialInstructions, setSpecialInstructions] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  useEffect(() => {
    let isMounted = true;

    const loadMenuItem = async () => {
      if (!menuItemId) {
        setError('Missing menu item id');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const fetchedItem = await getMenuItemById(menuItemId);

        if (!isMounted) {
          return;
        }

        setMenuItem(fetchedItem);
      } catch (err) {
        if (!isMounted) {
          return;
        }

        setError(err instanceof Error ? err.message : 'Failed to load menu item');
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void loadMenuItem();

    return () => {
      isMounted = false;
    };
  }, [menuItemId]);

  const handleSelectionChange = (groupId: string, optionIds: string[]) => {
    setSelectedCustomizations((prev) => ({
      ...prev,
      [groupId]: optionIds,
    }));
  };

  const isRequiredSelectionComplete = useMemo(() => {
    if (!menuItem) {
      return false;
    }

    return menuItem.customizationGroups
      .filter((group) => group.required)
      .every((group) => (selectedCustomizations[group.id] ?? []).length > 0);
  }, [menuItem, selectedCustomizations]);

  const perItemPrice = useMemo(() => {
    if (!menuItem) {
      return 0;
    }

    const customizationTotal = Object.entries(selectedCustomizations).reduce((groupAcc, [groupId, optionIds]) => {
      const group = menuItem.customizationGroups.find((customizationGroup) => customizationGroup.id === groupId);
      if (!group) {
        return groupAcc;
      }

      const optionsTotal = optionIds.reduce((optionAcc, optionId) => {
        const option = group.options.find((customizationOption) => customizationOption.id === optionId);
        return optionAcc + (option?.priceAdjustment ?? 0);
      }, 0);

      return groupAcc + optionsTotal;
    }, 0);

    return menuItem.price + customizationTotal;
  }, [menuItem, selectedCustomizations]);

  const totalPrice = useMemo(() => perItemPrice * quantity, [perItemPrice, quantity]);

  const canAddToCart = Boolean(menuItem && menuItem.isAvailable && isRequiredSelectionComplete);

  const handleAddToCart = () => {
    if (!menuItem || !canAddToCart) {
      return;
    }

    useCartStore.getState().addItem(menuItem, quantity, selectedCustomizations, specialInstructions.trim());
    router.back();
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !menuItem) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error ?? 'Menu item not found'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <MenuImage uri={menuItem.imageUrl} height={250} borderRadius={0} />

        <View style={styles.contentSection}>
          <Text style={styles.name}>{menuItem.name}</Text>
          <Text style={styles.description}>{menuItem.description}</Text>
          <Text style={styles.basePrice}>Base Price: {formatCurrency(menuItem.price)}</Text>

          {!menuItem.isAvailable && <Text style={styles.unavailable}>Currently Unavailable</Text>}

          {menuItem.customizationGroups.map((group) => (
            <CustomizationGroup
              key={group.id}
              group={group}
              selectedOptionIds={selectedCustomizations[group.id] ?? []}
              onSelectionChange={handleSelectionChange}
            />
          ))}

          <View style={styles.instructionsContainer}>
            <Text style={styles.instructionsLabel}>Special Instructions</Text>
            <TextInput
              value={specialInstructions}
              onChangeText={setSpecialInstructions}
              placeholder="Any special requests?"
              placeholderTextColor={Colors.textSecondary}
              multiline
              numberOfLines={4}
              style={styles.instructionsInput}
              textAlignVertical="top"
            />
          </View>

          <View style={styles.quantityRow}>
            <Text style={styles.quantityLabel}>Quantity</Text>
            <QuantityStepper
              quantity={quantity}
              onIncrement={() => setQuantity((prev) => prev + 1)}
              onDecrement={() => setQuantity((prev) => Math.max(1, prev - 1))}
              min={1}
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          title={`Add to Cart - ${formatCurrency(totalPrice)}`}
          onPress={handleAddToCart}
          disabled={!canAddToCart}
          style={styles.addButton}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    backgroundColor: Colors.background,
  },
  errorText: {
    color: Colors.error,
    fontSize: FontSize.md,
    textAlign: 'center',
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  contentSection: {
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
  },
  name: {
    fontSize: FontSize.xxxl,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  description: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  basePrice: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.primary,
    marginBottom: Spacing.md,
  },
  unavailable: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.error,
    marginBottom: Spacing.md,
  },
  instructionsContainer: {
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  instructionsLabel: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  instructionsInput: {
    minHeight: 100,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: FontSize.md,
    color: Colors.text,
    backgroundColor: Colors.background,
  },
  quantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  quantityLabel: {
    fontSize: FontSize.lg,
    fontWeight: '600',
    color: Colors.text,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.background,
  },
  addButton: {
    width: '100%',
  },
});
