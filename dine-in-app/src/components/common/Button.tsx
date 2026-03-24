import React from 'react';
import { Pressable, Text, StyleSheet, ActivityIndicator, ViewStyle, TextStyle } from 'react-native';
import { Colors, Spacing, BorderRadius, FontSize } from '@/constants/theme';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'text';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
}

export const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
  style,
}) => {
  const getContainerStyle = (): ViewStyle => {
    switch (variant) {
      case 'outline':
        return styles.outline;
      case 'text':
        return styles.textVariant;
      case 'primary':
      default:
        return styles.primary;
    }
  };

  const getTextStyle = (): TextStyle => {
    switch (variant) {
      case 'outline':
      case 'text':
        return styles.textOutlineOrTextVariant;
      case 'primary':
      default:
        return styles.textPrimary;
    }
  };

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.container,
        getContainerStyle(),
        disabled && styles.disabled,
        pressed && !disabled && !loading && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' ? Colors.textLight : Colors.primary} />
      ) : (
        <Text style={[styles.text, getTextStyle(), disabled && styles.textDisabled]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  primary: {
    backgroundColor: Colors.primary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  textVariant: {
    backgroundColor: 'transparent',
  },
  disabled: {
    backgroundColor: Colors.disabled,
    borderColor: Colors.disabled,
    opacity: 0.6,
  },
  pressed: {
    opacity: 0.8,
  },
  text: {
    fontSize: FontSize.md,
    fontWeight: '600',
  },
  textPrimary: {
    color: Colors.textLight,
  },
  textOutlineOrTextVariant: {
    color: Colors.primary,
  },
  textDisabled: {
    color: Colors.textLight,
  },
});
