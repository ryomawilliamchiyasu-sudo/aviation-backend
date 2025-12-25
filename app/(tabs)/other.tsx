// app/(tabs)/other.tsx
import { View, Text, StyleSheet } from 'react-native';

export default function Other() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Other</Text>
      <Text>Settings and miscellaneous options.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 10 },
});