import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { CustomizationGroup as CustomizationGroupType } from '@/types';
import { Colors, Spacing, FontSize, BorderRadius } from '@/constants/theme';

interface CustomizationGroupProps {
  group: CustomizationGroupType;
  selectedOptionIds: string[];
  onSelectionChange: (groupId: string, optionIds: string[]) => void;
}

export default function CustomizationGroup({ group, selectedOptionIds, onSelectionChange }: CustomizationGroupProps) {
  const isMaxReached = group.maxSelections > 1 && selectedOptionIds.length >= group.maxSelections;

  const handleToggle = (optionId: string) => {
    if (group.maxSelections === 1) {
      onSelectionChange(group.id, [optionId]);
      return;
    }

    const isSelected = selectedOptionIds.includes(optionId);
    if (isSelected) {
      onSelectionChange(group.id, selectedOptionIds.filter(id => id !== optionId));
    } else if (!isMaxReached) {
      onSelectionChange(group.id, [...selectedOptionIds, optionId]);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{group.name}</Text>
        {group.required && <Text style={styles.required}>(Required)</Text>}
      </View>
      {group.options.map((option) => {
        const isSelected = selectedOptionIds.includes(option.id);
        const isDisabled = !isSelected && isMaxReached && group.maxSelections > 1;

        return (
          <Pressable
            key={option.id}
            style={[styles.optionRow, isDisabled && styles.disabledRow]}
            onPress={() => handleToggle(option.id)}
            disabled={isDisabled}
          >
            <View style={styles.optionContent}>
              <View style={[
                group.maxSelections === 1 ? styles.radio : styles.checkbox,
                isSelected && styles.selectedIndicator
              ]}>
                {isSelected && group.maxSelections > 1 && <View style={styles.checkMark} />}
                {isSelected && group.maxSelections === 1 && <View style={styles.radioInner} />}
              </View>
              <Text style={[styles.optionName, isDisabled && styles.disabledText]}>{option.name}</Text>
            </View>
            {option.priceAdjustment > 0 && (
              <Text style={[styles.priceAdjustment, isDisabled && styles.disabledText]}>
                +${option.priceAdjustment.toFixed(2)}
              </Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: Spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  title: {
    fontSize: FontSize.lg,
    fontWeight: 'bold',
    color: Colors.text,
  },
  required: {
    fontSize: FontSize.sm,
    color: Colors.primary,
    marginLeft: Spacing.sm,
  },
  optionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    paddingHorizontal: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    backgroundColor: Colors.background,
  },
  disabledRow: {
    opacity: 0.5,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    marginRight: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radio: {
    width: 24,
    height: 24,
    borderWidth: 2,
    borderColor: Colors.border,
    borderRadius: BorderRadius.full,
    marginRight: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedIndicator: {
    borderColor: Colors.primary,
  },
  checkMark: {
    width: 12,
    height: 12,
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  radioInner: {
    width: 12,
    height: 12,
    backgroundColor: Colors.primary,
    borderRadius: 6,
  },
  optionName: {
    fontSize: FontSize.md,
    color: Colors.text,
  },
  priceAdjustment: {
    fontSize: FontSize.md,
    color: Colors.textSecondary,
  },
  disabledText: {
    color: Colors.disabled,
  },
});
