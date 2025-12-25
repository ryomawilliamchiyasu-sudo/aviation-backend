// app/(tabs)/weather.tsx
import { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, ActivityIndicator } from 'react-native';
import { BACKEND_URL } from '../../config';

export default function Weather() {
  const [station, setStation] = useState('CYYZ');
  const [weatherData, setWeatherData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchWeather = async () => {
    if (!station.trim()) return;
    
    setLoading(true);
    setError('');
    
    try {
      console.log('Fetching from:', `${BACKEND_URL}/weather?station=${station.toUpperCase()}`);
      const response = await fetch(`${BACKEND_URL}/weather?station=${station.toUpperCase()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      setWeatherData(data);
      console.log('Weather data received:', data);
    } catch (err: any) {
      console.error('Error fetching weather:', err);
      setError(err.message || 'Failed to fetch weather data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Aviation Weather</Text>
      
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={station}
          onChangeText={setStation}
          placeholder="Enter ICAO code (e.g., CYYZ, KJFK)"
          autoCapitalize="characters"
          maxLength={4}
        />
        <TouchableOpacity 
          style={styles.button} 
          onPress={fetchWeather}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? 'Loading...' : 'Get Weather'}
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

      {weatherData && !loading && (
        <View style={styles.dataContainer}>
          {Array.isArray(weatherData) ? (
            weatherData.map((item: any, index: number) => (
              <View key={index} style={styles.reportCard}>
                <Text style={styles.reportType}>{item.type || 'REPORT'}</Text>
                <Text style={styles.stationCode}>{item.station || item.icaoId}</Text>
                <Text style={styles.reportText}>{item.report || item.rawOb}</Text>
              </View>
            ))
          ) : (
            <View style={styles.reportCard}>
              <Text style={styles.reportText}>{JSON.stringify(weatherData, null, 2)}</Text>
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
  reportCard: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  reportType: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 5,
  },
  stationCode: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  reportText: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#333',
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
