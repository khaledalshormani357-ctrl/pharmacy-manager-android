import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
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
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Failed to load products');
      }
      const data = await res.json();
      setProducts(data);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (productId: string) => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const res = await fetch(`http://10.0.2.2:4000/api/products/${productId}`, {
        method: 'DELETE',
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Delete failed');
      }
      await loadProducts();
    } catch (err: any) {
      Alert.alert('Delete failed', err.message || 'Unknown error');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Inventory</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddProduct')}
        >
          <Text style={styles.addText}>Add</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.container}>
          {products.length === 0 ? (
            <Text style={styles.emptyText}>No products available.</Text>
          ) : (
            products.map((product) => (
              <View key={product.id} style={styles.card}>
                <View style={styles.cardRow}>
                  <Text style={styles.productName}>{product.name}</Text>
                  <Text style={[styles.stockBadge, product.stock < 10 && styles.stockBadgeWarning]}>{product.stock} left</Text>
                </View>
                <Text style={styles.meta}>{product.category}</Text>
                <Text style={styles.meta}>Barcode: {product.barcode || 'N/A'}</Text>
                <Text style={styles.meta}>Unit Price: ${Number(product.unitPrice).toFixed(2)}</Text>

                <View style={styles.actionsRow}>
                  <TouchableOpacity
                    style={styles.secondaryButton}
                    onPress={() => navigation.navigate('EditProduct', { product })}
                  >
                    <Text style={styles.secondaryText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleDelete(product.id)}
                  >
                    <Text style={styles.deleteText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
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
  addButton: {
    backgroundColor: theme.primary,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addText: { color: '#fff', fontWeight: '700' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  container: { padding: 16, paddingBottom: 40 },
  emptyText: { color: '#69758c', fontSize: 16 },
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
  actionsRow: { flexDirection: 'row', marginTop: 12, justifyContent: 'flex-end' },
  secondaryButton: {
    backgroundColor: '#eaf2ff',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 8,
  },
  secondaryText: { color: theme.primary, fontWeight: '700' },
  deleteButton: {
    backgroundColor: '#fee2e2',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
  },
  deleteText: { color: '#b91c1c', fontWeight: '700' },
});
