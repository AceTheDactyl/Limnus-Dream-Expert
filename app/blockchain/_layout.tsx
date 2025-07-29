import { Stack } from 'expo-router';
import Colors from '@/constants/colors';

export default function BlockchainLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: {
          backgroundColor: Colors.dark.background,
        },
        headerTintColor: Colors.dark.text,
        headerTitleStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Stack.Screen 
        name="foundation" 
        options={{ 
          title: 'Foundation Blocks',
          headerStyle: {
            backgroundColor: Colors.dark.background,
          },
        }} 
      />
      <Stack.Screen 
        name="dreams" 
        options={{ 
          title: 'Dream Blocks',
          headerStyle: {
            backgroundColor: Colors.dark.background,
          },
        }} 
      />
      <Stack.Screen 
        name="consciousness" 
        options={{ 
          title: 'Consciousness Blocks',
          headerStyle: {
            backgroundColor: Colors.dark.background,
          },
        }} 
      />
    </Stack>
  );
}