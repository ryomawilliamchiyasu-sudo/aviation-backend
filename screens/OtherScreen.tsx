import { View, Text, StyleSheet, ScrollView } from 'react-native';
import Card from '../components/Card';
import { Colors } from '../theme/colors';

export default function OtherScreen() {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Other</Text>

      <Card>
        <Text style={styles.sectionTitle}>App Settings</Text>
        <Text style={styles.text}>- Choose weather source</Text>
        <Text style={styles.text}>- Choose map source</Text>
        <Text style={styles.text}>- Units (ft/m, knots/kmh)</Text>
      </Card>

      <Card>
        <Text style={styles.sectionTitle}>Miscellaneous</Text>
        <Text style={styles.text}>- About this app</Text>
        <Text style={styles.text}>- Feedback</Text>
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 10 },
  title: { color: Colors.primaryText, fontSize: 24, fontWeight: '600', marginBottom: 10 },
  sectionTitle: { color: Colors.accent, fontSize: 16, fontWeight: '600', marginBottom: 5 },
  text: { color: Colors.primaryText, fontSize: 14, marginBottom: 3 },
});