import React, { useState } from 'react';
import { View, Text, TextInput, Button, ScrollView, StyleSheet, ActivityIndicator } from 'react-native';
import OpenAI from 'openai';

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY || '';

export default function AIAssist() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAskAI = async () => {
    if (!prompt.trim()) {
      setError('Please enter a question');
      return;
    }

    if (!OPENAI_API_KEY) {
      setError('OpenAI API key not configured. Set EXPO_PUBLIC_OPENAI_API_KEY in .env');
      return;
    }

    setLoading(true);
    setError('');
    setResponse('');

    try {
      const openai = new OpenAI({ apiKey: OPENAI_API_KEY });
      const res = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 500,
      });

      const content = res.choices[0]?.message?.content || 'No response';
      setResponse(content);
      setPrompt('');
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(`Error: ${message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Aviation AI Assist</Text>
      <Text style={styles.subtitle}>Ask aviation-related questions</Text>

      <TextInput
        placeholder="Ask about weather, flight planning, aviation rules..."
        value={prompt}
        onChangeText={(text) => {
          setPrompt(text);
          setError('');
        }}
        multiline
        numberOfLines={4}
        style={styles.input}
        editable={!loading}
      />

      <Button title={loading ? 'Thinking...' : 'Ask AI'} onPress={handleAskAI} disabled={loading} />

      {error && <Text style={styles.error}>{error}</Text>}

      {loading && <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />}

      {response && (
        <View style={styles.responseContainer}>
          <Text style={styles.responseTitle}>Response</Text>
          <Text style={styles.responseText}>{response}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#0A1624',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#A3B4C5',
    marginBottom: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#3A5067',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    color: '#FFFFFF',
    backgroundColor: '#1A2D3F',
    textAlignVertical: 'top',
  },
  loader: {
    marginVertical: 20,
  },
  error: {
    color: '#FF6B6B',
    marginTop: 12,
    padding: 10,
    backgroundColor: '#2D1616',
    borderRadius: 6,
  },
  responseContainer: {
    marginTop: 20,
    padding: 12,
    backgroundColor: '#1A3A4A',
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  responseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
    marginBottom: 8,
  },
  responseText: {
    fontSize: 14,
    color: '#A3B4C5',
    lineHeight: 22,
  },
});