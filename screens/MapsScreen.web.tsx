import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { BACKEND_URL } from '../config';

export default function MapsScreen() {
  const [airports, setAirports] = useState([]);

  useEffect(() => {
    fetch(`${BACKEND_URL}/airports`)
      .then((res) => res.json())
      .then(setAirports)
      .catch(console.error);
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Airports (Web View)</Text>
      {airports.map((a: any) => (
        <Text key={a.id}>
          {a.code} — {a.name}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
});