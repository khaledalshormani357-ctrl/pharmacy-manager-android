import React, { useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { theme } from '../theme';
import type { Product, Sale, Prescription, DashboardSummary } from '../types';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Dashboard'>;

export default function DashboardScreen() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation<NavProp>();

  const loadDashboard = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const res = await fetch('http://10.0.2.2:4000/api/dashboard', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) throw new Error('API error');
      const data = await res.json();
      setSummary(data.summary);
      setProducts(data.products || []);
      setSales(data.recentSales || []);
      setPrescriptions(data.prescriptions || []);
    } catch (err) {
      console.log('Failed to load dashboard, using fallback');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const lowStock = useMemo(() => products.filter((p) => p.stock < 10), [products]);

  const handleLogout = async () => {
    await AsyncStorage.removeItem('authToken');
    navigation.replace('Login');
  };

  if (loading || !summary) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>Loading pharmacy dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.headerRow}>
          <View>
            <Text style={styles.eyebrow}>Pharmacy</Text>
            <Text style={styles.title}>CarePlus Pharmacy</Text>
          </View>
          <TouchableOpacity style={styles.primaryButton} onPress={handleLogout}>
            <Text style={styles.primaryText}>Logout</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Products</Text>
            <Text style={styles.cardValue}>{summary.totalProducts}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Low Stock</Text>
            <Text style={styles.cardValue}>{summary.lowStockProducts}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Sales Today</Text>
            <Text style={styles.cardValue}>{summary.salesToday}</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardLabel}>Revenue</Text>
            <Text style={styles.cardValue}>${summary.revenueToday.toFixed(2)}</Text>
          </View>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
        </View>

        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Products')}>
            <Text style={styles.actionText}>Inventory</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Sale')}>
            <Text style={styles.actionText}>POS</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Reports')}>
            <Text style={styles.actionText}>Reports</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Low stock alerts</Text>
          {lowStock.length === 0 ? (
            <Text style={styles.emptyText}>No low stock items.</Text>
          ) : (
            lowStock.map((item) => (
              <View key={item.id} style={styles.listRow}>
                <View>
                  <Text style={styles.listItemTitle}>{item.name}</Text>
                  <Text style={styles.listItemMeta}>{item.category}</Text>
                </View>
                <Text style={styles.badge}>{item.stock} left</Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Products</Text>
          {products.map((item) => (
            <View key={item.id} style={styles.listRow}>
              <View>
                <Text style={styles.listItemTitle}>{item.name}</Text>
                <Text style={styles.listItemMeta}>{item.category}</Text>
              </View>
              <Text style={styles.price}>${item.unitPrice.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Recent sales</Text>
          {sales.map((sale) => (
            <View key={sale.id} style={styles.listRow}>
              <View>
                <Text style={styles.listItemTitle}>{sale.productName}</Text>
                <Text style={styles.listItemMeta}>{sale.cashier}</Text>
              </View>
              <Text style={styles.price}>${sale.total.toFixed(2)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.panel}>
          <Text style={styles.panelTitle}>Pending prescriptions</Text>
          {prescriptions.map((item) => (
            <View key={item.id} style={styles.listRow}>
              <View>
                <Text style={styles.listItemTitle}>{item.patientName}</Text>
                <Text style={styles.listItemMeta}>{item.medicationName}</Text>
              </View>
              <Text style={styles.badge}>{item.status}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f7fb',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f7fb',
  },
  loadingText: {
    marginTop: 12,
    color: theme.dark,
    fontSize: 16,
  },
  container: {
    padding: 18,
    paddingBottom: 40,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
  },
  eyebrow: {
    color: theme.primary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: theme.dark,
  },
  primaryButton: {
    backgroundColor: theme.primary,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
  },
  primaryText: {
    color: '#fff',
    fontWeight: '700',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  card: {
    width: '48%',
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  cardLabel: {
    color: '#69758c',
    fontSize: 13,
    marginBottom: 8,
  },
  cardValue: {
    fontSize: 22,
    fontWeight: '800',
    color: theme.dark,
  },
  sectionHeader: {
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.dark,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 18,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#eaf2ff',
    paddingVertical: 12,
    borderRadius: 10,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  actionText: {
    color: theme.primary,
    fontWeight: '700',
  },
  panel: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  panelTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: theme.dark,
    marginBottom: 12,
  },
  listRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eef2f7',
  },
  listItemTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: theme.dark,
  },
  listItemMeta: {
    fontSize: 12,
    color: '#7a8699',
    marginTop: 2,
  },
  price: {
    fontWeight: '700',
    color: theme.dark,
  },
  badge: {
    backgroundColor: '#edf6ff',
    color: theme.primary,
    fontWeight: '700',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
    overflow: 'hidden',
    fontSize: 12,
  },
  emptyText: {
    color: '#7a8699',
    fontSize: 14,
  },
});
