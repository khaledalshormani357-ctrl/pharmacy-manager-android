import React, { useEffect, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  TouchableOpacity,
  Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import type { RootStackParamList } from '../../App';
import { theme } from '../theme';
import type { Product } from '../types';

type NavProp = NativeStackNavigationProp<RootStackParamList, 'AddProduct'>;
type Route = RouteProp<RootStackParamList, 'AddProduct'>;

export default function AddEditProductScreen() {
  const navigation = useNavigation<NavProp>();
  const route = useRoute<Route>();
  const existing = route.params?.product;

  const [name, setName] = useState(existing?.name ?? '');
  const [category, setCategory] = useState(existing?.category ?? '');
  const [barcode, setBarcode] = useState(existing?.barcode ?? '');
  const [stock, setStock] = useState(String(existing?.stock ?? 0));
  const [unitPrice, setUnitPrice] = useState(String(existing?.unitPrice ?? 0));
  const [costPrice, setCostPrice] = useState(String(existing?.costPrice ?? 0));
  const [expiryDate, setExpiryDate] = useState('');

  useEffect(() => {
    if (existing) {
      setName(existing.name);
      setCategory(existing.category);
      setBarcode(existing.barcode ?? '');
      setStock(String(existing.stock));
      setUnitPrice(String(existing.unitPrice));
      setCostPrice(String(existing.costPrice ?? 0));
    }
  }, [existing]);

  const handleSubmit = async () => {
    if (!name.trim() || !category.trim()) {
      Alert.alert('Validation', 'Name and category are required');
      return;
    }

    try {
      const token = await AsyncStorage.getItem('authToken');
      const method = existing ? 'PUT' : 'POST';
      const url = existing
        ? `http://10.0.2.2:4000/api/products/${existing.id}`
        : 'http://10.0.2.2:4000/api/products';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          name,
          category,
          barcode,
          stock: Number(stock || 0),
          unitPrice: Number(unitPrice || 0),
          costPrice: Number(costPrice || 0),
          expiryDate,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Save failed');
      }

      navigation.goBack();
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Unexpected error');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{existing ? 'Edit Product' : 'Add Product'}</Text>
        <View style={{ width: 50 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        <TextInput style={styles.input} placeholder="Product name" value={name} onChangeText={setName} />
        <TextInput style={styles.input} placeholder="Category" value={category} onChangeText={setCategory} />
        <TextInput style={styles.input} placeholder="Barcode" value={barcode} onChangeText={setBarcode} />
        <TextInput style={styles.input} placeholder="Stock" keyboardType="numeric" value={stock} onChangeText={setStock} />
        <TextInput style={styles.input} placeholder="Unit price" keyboardType="decimal-pad" value={unitPrice} onChangeText={setUnitPrice} />
        <TextInput style={styles.input} placeholder="Cost price" keyboardType="decimal-pad" value={costPrice} onChangeText={setCostPrice} />
        <TextInput style={styles.input} placeholder="Expiry date (YYYY-MM-DD)" value={expiryDate} onChangeText={setExpiryDate} />

        <TouchableOpacity style={styles.saveButton} onPress={handleSubmit}>
          <Text style={styles.saveText}>{existing ? 'Update Product' : 'Create Product'}</Text>
        </TouchableOpacity>
      </ScrollView>
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
  container: { padding: 16, paddingBottom: 40 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e5e7eb',
  },
  saveButton: {
    backgroundColor: theme.primary,
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 6,
  },
  saveText: { color: '#fff', fontWeight: '800' },
});
