import { Stack, router } from 'expo-router';
import { TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/theme';

export default function TrackerLayout() {
  return (
    <Stack screenOptions={{ headerStyle: { backgroundColor: Colors.background }, headerTintColor: Colors.primary }}>
      <Stack.Screen
        name="[id]"
        options={{
          title: 'Track Order',
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={{ marginRight: 8 }}>
              <Ionicons name="arrow-back" size={24} color={Colors.primary} />
            </TouchableOpacity>
          ),
        }}
      />
    </Stack>
  );
}