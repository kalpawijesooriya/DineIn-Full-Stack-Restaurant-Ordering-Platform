import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Image } from 'expo-image';
import { MenuItem } from '@/types';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/theme';

interface MenuItemCardProps {
  item: MenuItem;
  onPress: () => void;
}

export default function MenuItemCard({ item, onPress }: MenuItemCardProps) {
  return (
    <Pressable
      style={styles.card}
      onPress={onPress}
      disabled={!item.isAvailable}
    >
      <Image source={{ uri: item.imageUrl }} style={styles.image} contentFit="cover" />
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.description} numberOfLines={2}>{item.description}</Text>
        <Text style={styles.price}>${item.price.toFixed(2)}</Text>
      </View>
      {!item.isAvailable && (
        <View style={styles.overlay}>
          <Text style={styles.overlayText}>Unavailable</Text>
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    marginHorizontal: Spacing.md,
    marginVertical: Spacing.sm,
    padding: Spacing.sm,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    overflow: 'hidden',
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.sm,
  },
  content: {
    flex: 1,
    marginLeft: Spacing.md,
    justifyContent: 'center',
  },
  title: {
    fontSize: FontSize.md,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  description: {
    fontSize: FontSize.sm,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  price: {
    fontSize: FontSize.md,
    fontWeight: '600',
    color: Colors.primary,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: BorderRadius.md,
    zIndex: 1,
  },
  overlayText: {
    color: Colors.textLight,
    fontSize: FontSize.lg,
    fontWeight: 'bold',
  },
});
