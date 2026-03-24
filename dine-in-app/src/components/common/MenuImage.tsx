import React from 'react';
import { Image, ImageStyle } from 'expo-image';
import { View, StyleSheet } from 'react-native';
import { Colors, BorderRadius } from '@/constants/theme';

interface MenuImageProps {
  uri: string;
  style?: ImageStyle;
  height?: number;
  borderRadius?: number;
}

export const MenuImage: React.FC<MenuImageProps> = ({
  uri,
  style,
  height = 200,
  borderRadius = BorderRadius.md,
}) => {
  return (
    <View style={[styles.container, { height, borderRadius }, style]}>
      <Image
        source={{ uri }}
        style={[styles.image, { borderRadius }]}
        contentFit="cover"
        transition={200}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: Colors.surface,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
