// app/(tabs)/airport-plan.tsx
import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { BACKEND_URL } from '../../config';

export default function AirportPlan() {
  const [code, setCode] = useState('CYYZ');
  const [airportData, setAirportData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchAirport = async () => {
    if (!code.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      console.log('Fetching from:', `${BACKEND_URL}/airport?code=${code.toUpperCase()}`);
      const response = await fetch(`${BACKEND_URL}/airport?code=${code.toUpperCase()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setAirportData(data);
      console.log('Airport data received:', data);
    } catch (err: any) {
      console.error('Error fetching airport:', err);
      setError(err.message || 'Failed to fetch airport data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Airport Information</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={code}
          onChangeText={setCode}
          placeholder="Enter ICAO code (e.g., CYYZ, KJFK)"
          autoCapitalize="characters"
          maxLength={4}
        />
        <TouchableOpacity 
          style={styles.button} 
          onPress={fetchAirport}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Loading...' : 'Get Airport'}
          </Text>
        </TouchableOpacity>
      </View>

      {loading && <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />}
      
      {error && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>❌ {error}</Text>
          <Text style={styles.helpText}>Make sure backend is running at {BACKEND_URL}</Text>
        </View>
      )}

      {airportData && !loading && (
        <View style={styles.dataContainer}>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{airportData.name}</Text>
            <Text style={styles.cardSubtitle}>{airportData.code} • {airportData.location}</Text>
          </View>

          {airportData.runways && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Runways</Text>
              {airportData.runways.map((runway: any, index: number) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.listItemTitle}>{runway.heading}</Text>
                  <Text style={styles.listItemText}>{runway.length} • {runway.surface}</Text>
                </View>
              ))}
            </View>
          )}

          {airportData.frequencies && (
            <View style={styles.card}>
              <Text style={styles.sectionTitle}>Frequencies</Text>
              {airportData.frequencies.map((freq: any, index: number) => (
                <View key={index} style={styles.listItem}>
                  <Text style={styles.listItemTitle}>{freq.type}</Text>
                  <Text style={styles.listItemText}>{freq.freq}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      )}

      <View style={styles.infoContainer}>
        <Text style={styles.infoText}>Backend: {BACKEND_URL}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: { 
    fontSize: 28, 
    fontWeight: 'bold', 
    marginBottom: 20,
    textAlign: 'center',
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
    gap: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: 'white',
  },
  button: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  loader: {
    marginVertical: 20,
  },
  errorContainer: {
    backgroundColor: '#ffe6e6',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  errorText: {
    color: '#cc0000',
    fontSize: 16,
    marginBottom: 5,
  },
  helpText: {
    color: '#666',
    fontSize: 12,
  },
  dataContainer: {
    marginBottom: 20,
  },
  card: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  cardSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#007AFF',
  },
  listItem: {
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  listItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  listItemText: {
    fontSize: 14,
    color: '#666',
  },
  infoContainer: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#e8e8e8',
    borderRadius: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
});
