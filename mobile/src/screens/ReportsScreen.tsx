import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../App';
import { theme } from '../theme';
import type { Product } from '../types';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Products'>;

export default function ProductsScreen() {
  const navigation = useNavigation<NavProp>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const res = await fetch('http://10.0.2.2:4000/api/products', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      const data = await res.json();
      if (res.ok) setProducts(data);
    } catch (err) {
      console.log('Failed to load products', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Inventory</Text>
        <View style={{ width: 48 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.container}>
          {products.map((product) => (
            <View key={product.id} style={styles.card}>
              <View style={styles.cardRow}>
                <Text style={styles.productName}>{product.name}</Text>
                <Text style={[styles.stockBadge, product.stock < 10 && styles.stockBadgeWarning]}>{product.stock} left</Text>
              </View>
              <Text style={styles.meta}>{product.category}</Text>
              <Text style={styles.meta}>Barcode: {product.barcode || 'N/A'}</Text>
              <Text style={styles.meta}>Unit Price: ${product.unitPrice.toFixed(2)}</Text>
            </View>
          ))}
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
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  cardRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  productName: { fontSize: 16, fontWeight: '700' },
  stockBadge: {
    backgroundColor: '#eaf2ff',
    color: theme.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    fontWeight: '700',
    overflow: 'hidden',
  },
  stockBadgeWarning: {
    backgroundColor: '#fff1d6',
    color: '#b7791f',
  },
  meta: { color: '#69758c', marginTop: 6 },
});
