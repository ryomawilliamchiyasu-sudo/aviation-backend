import { Tabs } from 'expo-router';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        tabBarActiveTintColor: '#007AFF',
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Home' }} />
      <Tabs.Screen name="ai-assist" options={{ title: 'AI Assist' }} />
      <Tabs.Screen name="maps" options={{ title: 'Maps', headerShown: false }} />
      <Tabs.Screen name="weather" options={{ title: 'Weather' }} />
      <Tabs.Screen name="airport-plan" options={{ title: 'Airport Plan' }} />
      <Tabs.Screen name="other" options={{ title: 'Other' }} />
    </Tabs>
  );
}
