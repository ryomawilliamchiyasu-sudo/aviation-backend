import { Stack } from 'expo-router';

export default function MapsStack() {
  return (
    <Stack>
      <Stack.Screen name="index" options={{ title: 'Airports' }} />
      <Stack.Screen name="detail" options={{ title: 'Airport Details' }} />
    </Stack>
  );
}
