import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { theme } from '../theme';
import type { DashboardSummary } from '../types';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Reports'>;

export default function ReportsScreen() {
  const navigation = useNavigation<NavProp>();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSummary = async () => {
      try {
        const token = await AsyncStorage.getItem('authToken');
        const res = await fetch('http://10.0.2.2:4000/api/reports/summary', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });

        if (res.ok) {
          const json = await res.json();
          setSummary(json.summary);
        }
      } catch (err) {
        console.log('Failed to fetch reports', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Reports</Text>
        <View style={{ width: 48 }} />
      </View>

      {loading || !summary ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.grid}>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Revenue</Text>
              <Text style={styles.cardValue}>${Number(summary.revenueToday).toFixed(2)}</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Sales</Text>
              <Text style={styles.cardValue}>{summary.salesToday}</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Low Stock</Text>
              <Text style={styles.cardValue}>{summary.lowStockProducts}</Text>
            </View>
            <View style={styles.card}>
              <Text style={styles.cardLabel}>Pending Rx</Text>
              <Text style={styles.cardValue}>{summary.pendingPrescriptions}</Text>
            </View>
          </View>

          <View style={styles.summaryBox}>
            <Text style={styles.summaryTitle}>Operational Summary</Text>
            <Text style={styles.summaryText}>Inventory health is currently stable. The pharmacy has {summary.totalProducts} products registered, with {summary.lowStockProducts} low-stock alerts and {summary.pendingPrescriptions} pending prescriptions.</Text>
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f5f7fb' },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  backText: { color: theme.primary, fontWeight: '700' },
  title: { fontSize: 22, fontWeight: '800' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { padding: 16, paddingBottom: 40 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  cardLabel: { color: '#69758c', fontSize: 12 },
  cardValue: { marginTop: 8, fontSize: 24, fontWeight: '800' },
  summaryBox: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  summaryTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  summaryText: { color: '#4b5563', lineHeight: 22 },
});
