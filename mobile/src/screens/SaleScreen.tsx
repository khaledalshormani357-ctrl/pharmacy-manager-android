import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, FlatList, TextInput, Alert } from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Product } from '../types';
import { theme } from '../theme';

export default function SaleScreen() {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanning, setScanning] = useState(false);
  const [barcode, setBarcode] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState('1');

  useEffect(() => {
    (async () => {
      const { status } = await BarCodeScanner.requestPermissionsAsync();
      setHasPermission(status === 'granted');
    })();

    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await fetch('http://10.0.2.2:4000/api/products');
      const data = await res.json();
      setProducts(data);
    } catch (err) {
      console.log('Failed to load products', err);
    }
  };

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    setBarcode(data);
    setScanning(false);
    const found = products.find((p) => p.barcode === data);
    if (found) setSelectedProduct(found);
    else Alert.alert('Not found', 'Product with this barcode not found');
  };

  const createSale = async () => {
    if (!selectedProduct) return Alert.alert('Select product', 'Please select a product');
    const token = await AsyncStorage.getItem('authToken');
    try {
      const res = await fetch('http://10.0.2.2:4000/api/sales', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: token ? `Bearer ${token}` : '' },
        body: JSON.stringify({ productId: selectedProduct.id, quantity: Number(quantity), cashier: 'Mobile User', prescriptionRequired: false }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Sale failed');
      }
      Alert.alert('Sale recorded');
      setSelectedProduct(null);
      setQuantity('1');
      fetchProducts();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Unknown error');
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>New Sale</Text>
        <TouchableOpacity style={styles.scanButton} onPress={() => setScanning((s) => !s)}>
          <Text style={styles.scanText}>{scanning ? 'Stop' : 'Scan'}</Text>
        </TouchableOpacity>
      </View>

      {scanning && hasPermission ? (
        <View style={{ height: 300 }}>
          <BarCodeScanner onBarCodeScanned={handleBarCodeScanned} style={{ flex: 1 }} />
        </View>
      ) : null}

      <Text style={styles.label}>Scanned barcode: {barcode || '-'}</Text>

      <FlatList data={products} keyExtractor={(i) => i.id} renderItem={({ item }) => (
        <TouchableOpacity style={styles.itemRow} onPress={() => setSelectedProduct(item)}>
          <Text style={styles.itemTitle}>{item.name}</Text>
          <Text style={styles.itemMeta}>{item.stock} in stock</Text>
        </TouchableOpacity>
      )} />

      {selectedProduct && (
        <View style={styles.selectedCard}>
          <Text style={styles.selectedTitle}>{selectedProduct.name}</Text>
          <Text>Price: ${selectedProduct.unitPrice.toFixed(2)}</Text>
          <TextInput style={styles.input} keyboardType="numeric" value={quantity} onChangeText={setQuantity} />
          <TouchableOpacity style={styles.primaryButton} onPress={createSale}>
            <Text style={styles.primaryText}>Confirm Sale</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#f5f7fb' },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  title: { fontSize: 20, fontWeight: '800' },
  scanButton: { backgroundColor: theme.primary, padding: 8, borderRadius: 8 },
  scanText: { color: '#fff', fontWeight: '700' },
  label: { marginVertical: 8, color: '#7a8699' },
  itemRow: { padding: 12, backgroundColor: '#fff', borderRadius: 10, marginBottom: 8 },
  itemTitle: { fontWeight: '700' },
  itemMeta: { color: '#7a8699' },
  selectedCard: { padding: 12, backgroundColor: '#fff', borderRadius: 10, marginTop: 12 },
  selectedTitle: { fontWeight: '800', fontSize: 16 },
  input: { marginTop: 8, backgroundColor: '#eef2f7', padding: 8, borderRadius: 8 },
  primaryButton: { backgroundColor: theme.primary, padding: 12, borderRadius: 10, marginTop: 10, alignItems: 'center' },
  primaryText: { color: '#fff', fontWeight: '800' },
});
