import React, { useEffect, useMemo, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
} from 'react-native';
import { theme } from './src/theme';
import type { Product, Sale, Prescription, DashboardSummary } from './src/types';

const fallbackProducts: Product[] = [
  { id: 'prod-1', name: 'Paracetamol 500 mg', category: 'Analgesic', stock: 45, unitPrice: 5.5 },
  { id: 'prod-2', name: 'Amoxicillin 250mg', category: 'Antibiotic', stock: 8, unitPrice: 18 },
  { id: 'prod-3', name: 'Vitamin C Gummies', category: 'Supplement', stock: 120, unitPrice: 12.5 },
  { id: 'prod-4', name: 'Insulin Pen', category: 'Diabetes', stock: 5, unitPrice: 32 },
];

const fallbackSales: Sale[] = [
  { id: 'sale-1', productName: 'Paracetamol 500 mg', quantity: 2, total: 11, cashier: 'Ali', soldAt: 'Today' },
  { id: 'sale-2', productName: 'Vitamin C Gummies', quantity: 1, total: 12.5, cashier: 'Sara', soldAt: 'Today' },
];

const fallbackPrescriptions: Prescription[] = [
  { id: 'rx-1', patientName: 'Omar Khalid', medicationName: 'Amoxicillin 250mg', status: 'pending' },
  { id: 'rx-2', patientName: 'Nader Hassan', medicationName: 'Insulin Pen', status: 'approved' },
];

const fallbackSummary: DashboardSummary = {
  totalProducts: fallbackProducts.length,
  lowStockProducts: 2,
  salesToday: 2,
  revenueToday: 23.5,
  pendingPrescriptions: 1,
};

export default function App() {
  const [summary, setSummary] = useState<DashboardSummary>(fallbackSummary);
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [sales, setSales] = useState<Sale[]>(fallbackSales);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>(fallbackPrescriptions);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const response = await fetch('http://10.0.2.2:4000/api/dashboard');
        if (!response.ok) {
          throw new Error('API error');
        }

        const data = await response.json();
        if (data.summary) {
          setSummary(data.summary);
        }

        if (data.products) {
          setProducts(data.products);
        }

        if (data.recentSales) {
          setSales(data.recentSales);
        }

        if (data.prescriptions) {
          setPrescriptions(data.prescriptions);
        }
      } catch (error) {
        console.log('Using local fallback data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const lowStock = useMemo(
    () => products.filter((product) => product.stock < 10),
    [products],
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
          <Text style={styles.loadingText}>Loading pharmacy dashboard...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.eyebrow}>Pharmacy</Text>
              <Text style={styles.title}>CarePlus Pharmacy</Text>
            </View>
            <TouchableOpacity style={styles.primaryButton}>
              <Text style={styles.primaryText}>New Sale</Text>
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
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionText}>Inventory</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionText}>Prescriptions</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
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
      )}
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
