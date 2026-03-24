import React from 'react';
import { TouchableOpacity } from 'react-native';
import { Stack, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

export default function ConfirmationLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: Colors.background },
        headerTintColor: Colors.primary,
      }}
    >
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Order Confirmed',
          headerBackVisible: false,
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.navigate('/(tabs)/orders')} style={{ marginRight: 8 }}>
              <Ionicons name="arrow-back" size={24} color={Colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />
    </Stack>
  );
}
