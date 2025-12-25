import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Colors } from '../theme/colors';
import Card from '../components/Card';
import { BACKEND_URL } from '../config';

export default function WeatherScreen() {
  const [weatherData, setWeatherData] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${BACKEND_URL}/weather?station=CYYZ`)
      .then((res) => res.json())
      .then((data) => setWeatherData(data))
      .catch((err) => console.error(err));
  }, []);

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Weather</Text>
      {weatherData.map((item, index) => (
        <Card key={index}>
          <Text style={styles.text}>{item.type}: {item.report}</Text>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 10 },
  title: { color: Colors.primaryText, fontSize: 24, fontWeight: '600', marginBottom: 10 },
  text: { color: Colors.secondaryText, fontSize: 14 },
});