import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function MapsScreen() {
	return (
		<View style={styles.container}>
			<Text style={styles.title}>Maps Screen</Text>
			<Text style={styles.subtitle}>Map view placeholder restored. Add MapView when ready.</Text>
		</View>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: '#0A1624',
		padding: 16,
	},
	title: {
		fontSize: 22,
		fontWeight: '700',
		color: '#FFFFFF',
		marginBottom: 8,
	},
	subtitle: {
		fontSize: 16,
		color: '#A3B4C5',
		textAlign: 'center',
	},
});
