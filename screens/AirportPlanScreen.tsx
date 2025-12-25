import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '../theme/colors';
import Card from '../components/Card';
import { BACKEND_URL } from '../config';

export default function AirportPlanScreen() {
  const [airportData, setAirportData] = useState<any>(null);

  useEffect(() => {
    fetch(`${BACKEND_URL}/airport?code=CYYZ`)
      .then((res) => res.json())
      .then((data) => setAirportData(data))
      .catch((err) => console.error(err));
  }, []);

  if (!airportData) return <Text>Loading airport info...</Text>;

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>{airportData.name}</Text>
      <Card>
        <Text style={styles.text}>Location: {airportData.location}</Text>
      </Card>

      <Text style={styles.subTitle}>Runways:</Text>
      {airportData.runways.map((r: any) => (
        <Card key={r.id}>
          <Text style={styles.text}>{r.heading} - {r.length} - {r.surface}</Text>
        </Card>
      ))}

      <Text style={styles.subTitle}>Frequencies:</Text>
      {airportData.frequencies.map((f: any, index: number) => (
        <Card key={index}>
          <Text style={styles.text}>{f.type}: {f.freq}</Text>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 10 },
  title: { color: Colors.primaryText, fontSize: 24, fontWeight: '600', marginBottom: 10 },
  subTitle: { color: Colors.primaryText, fontSize: 18, marginTop: 10, marginBottom: 5 },
  text: { color: Colors.secondaryText, fontSize: 14 },
});