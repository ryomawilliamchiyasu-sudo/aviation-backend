import React, { useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { Colors } from '../theme/colors';
import { BACKEND_URL } from '../config';

export default function AIAssistScreen() {
  const [transcription, setTranscription] = useState('');

  const getMockTranscription = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/ai/transcribe`, {
        method: 'POST',
      });
      const data = await response.json();
      setTranscription(data.transcription);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>AI Assist</Text>
      <Button title="Get AI Transcription" onPress={getMockTranscription} />
      {transcription ? (
        <Text style={styles.text}>Transcription: {transcription}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 10 },
  title: { color: Colors.primaryText, fontSize: 24, fontWeight: '600', marginBottom: 10 },
  text: { color: Colors.secondaryText, fontSize: 14, marginTop: 10 },
});