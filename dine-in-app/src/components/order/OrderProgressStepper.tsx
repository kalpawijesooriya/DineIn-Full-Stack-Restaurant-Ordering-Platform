import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { OrderStatus } from '@/types';
import { Colors, Spacing, FontSize } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';

interface OrderProgressStepperProps {
  currentStatus: OrderStatus;
}

type StepStatus = 'confirmed' | 'preparing' | 'ready' | 'completed';
type StepState = 'completed' | 'current' | 'future';

const steps: Array<{ status: StepStatus; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
  { status: 'confirmed', label: 'Confirmed', icon: 'checkmark-circle-outline' },
  { status: 'preparing', label: 'Preparing', icon: 'flame-outline' },
  { status: 'ready', label: 'Ready', icon: 'checkmark-done-outline' },
  { status: 'completed', label: 'Completed', icon: 'happy-outline' },
];

const stepStateIcon: Record<StepState, keyof typeof Ionicons.glyphMap> = {
  completed: 'checkmark-circle',
  current: 'radio-button-on',
  future: 'radio-button-off',
};

const StepNode = ({ state, icon, label }: { state: StepState; icon: keyof typeof Ionicons.glyphMap; label: string }) => {
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (state === 'current') {
      const animation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 0.4, duration: 700, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1, duration: 700, useNativeDriver: true }),
        ])
      );
      animation.start();
      return () => animation.stop();
    }

    pulseAnim.setValue(1);
  }, [pulseAnim, state]);

  const tint = state === 'completed' ? Colors.success : state === 'current' ? Colors.primary : Colors.disabled;

  return (
    <View style={styles.stepContainer}>
      <Animated.View
        style={[
          styles.circle,
          state === 'current' && styles.currentCircle,
          { borderColor: tint },
          state === 'current' && { opacity: pulseAnim },
        ]}
      >
        <Ionicons name={stepStateIcon[state]} size={state === 'current' ? 22 : 20} color={tint} />
      </Animated.View>
      <View style={styles.labelRow}>
        <Ionicons name={icon} size={14} color={tint} />
        <Text style={[styles.label, { color: tint }]}>{label}</Text>
      </View>
    </View>
  );
};

export function OrderProgressStepper({ currentStatus }: OrderProgressStepperProps) {
  const currentStepIndex = steps.findIndex((step) => step.status === currentStatus);

  return (
    <View style={styles.container}>
      {steps.map((step, index) => {
        const state: StepState =
          currentStepIndex > index ? 'completed' : currentStepIndex === index ? 'current' : 'future';

        const connectorColor = index < currentStepIndex ? Colors.success : Colors.disabled;

        return (
          <React.Fragment key={step.status}>
            <StepNode state={state} icon={step.icon} label={step.label} />
            {index < steps.length - 1 && <View style={[styles.connector, { backgroundColor: connectorColor }]} />}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    width: '100%',
  },
  stepContainer: {
    alignItems: 'center',
    minWidth: 64,
  },
  circle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.background,
  },
  currentCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  connector: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    marginTop: 14,
    marginHorizontal: Spacing.xs,
  },
  labelRow: {
    marginTop: Spacing.xs,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  label: {
    fontSize: FontSize.xs,
    fontWeight: '600',
    textAlign: 'center',
  },
});