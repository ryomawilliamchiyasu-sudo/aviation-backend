import React, { useEffect, useState } from 'react';
import { SafeAreaView, Text, StyleSheet, Button } from 'react-native';
import { BACKEND_URL } from './config';

type Metar = { raw_text?: string } | Record<string, unknown>;

export default function App() {
	const [status, setStatus] = useState('Waiting...');
	const [loadingStatus, setLoadingStatus] = useState(false);
	const [metarData, setMetarData] = useState<Metar[] | Metar | null>(null);
	const [loadingMetar, setLoadingMetar] = useState(false);

	const testAPI = async () => {
		setLoadingStatus(true);
		try {
			const response = await fetch(`${BACKEND_URL}/test`);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const data = await response.json();
			setStatus(JSON.stringify(data));
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			setStatus(`Error: ${message}`);
		} finally {
			setLoadingStatus(false);
		}
	};

	const fetchMETAR = async (station: string = 'CYYZ') => {
		setLoadingMetar(true);
		try {
			const response = await fetch(`${BACKEND_URL}/api/weather/metar/${station}`);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}
			const data = await response.json();
			setMetarData(data.data || data);
		} catch (error) {
			const message = error instanceof Error ? error.message : String(error);
			setMetarData({ error: message });
		} finally {
			setLoadingMetar(false);
		}
	};

	const formatMetar = (report: Metar) => {
		if (typeof report === 'object' && report !== null && 'raw_text' in report) {
			const raw = (report as { raw_text?: unknown }).raw_text;
			if (typeof raw === 'string' && raw.length > 0) {
				return raw;
			}
		}
		return JSON.stringify(report);
	};

	useEffect(() => {
		testAPI();
		fetchMETAR();
	}, []);

	return (
		<SafeAreaView style={styles.container}>
			<Text style={styles.title}>API Test Status</Text>
			<Text style={styles.status}>{status}</Text>

			<Text style={styles.title}>Live METAR</Text>
			{loadingMetar ? (
				<Text style={styles.status}>Loading...</Text>
			) : metarData ? (
				Array.isArray(metarData) ? (
					metarData.map((report, index) => (
						<Text key={index} style={styles.status}>
							{formatMetar(report)}
						</Text>
					))
				) : (
					<Text style={styles.status}>{formatMetar(metarData)}</Text>
				)
			) : (
				<Text style={styles.status}>No METAR data available</Text>
			)}

			<Button
				title={loadingMetar ? 'Loading...' : 'Refresh METAR'}
				onPress={() => fetchMETAR()}
				disabled={loadingMetar}
			/>

			<Button
				title={loadingStatus ? 'Loading...' : 'Test API Again'}
				onPress={testAPI}
				disabled={loadingStatus}
			/>
		</SafeAreaView>
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
	status: {
		fontSize: 16,
		color: '#A3B4C5',
		marginBottom: 16,
		textAlign: 'center',
	},
});
