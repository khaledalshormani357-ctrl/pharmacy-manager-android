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

type Prescription = {
  id: string;
  patientName: string;
  doctorName: string;
  medicationName: string;
  status: 'pending' | 'approved' | 'dispensed';
  quantity: number;
};

type NavProp = NativeStackNavigationProp<RootStackParamList, 'Prescriptions'>;

export default function PrescriptionsScreen() {
  const navigation = useNavigation<NavProp>();
  const [items, setItems] = useState<Prescription[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const res = await fetch('http://10.0.2.2:4000/api/prescriptions', {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error('Unable to load prescriptions');
      const data = await res.json();
      setItems(data);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to load prescriptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const updateStatus = async (id: string, status: 'pending' | 'approved' | 'dispensed') => {
    try {
      const token = await AsyncStorage.getItem('authToken');
      const res = await fetch(`http://10.0.2.2:4000/api/prescriptions/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Status update failed');
      }
      await load();
    } catch (err: any) {
      Alert.alert('Update failed', err.message || 'Unknown error');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Prescriptions</Text>
        <View style={{ width: 48 }} />
      </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.container}>
          {items.map((item) => (
            <View key={item.id} style={styles.card}>
              <Text style={styles.patient}>{item.patientName}</Text>
              <Text style={styles.meta}>Doctor: {item.doctorName}</Text>
              <Text style={styles.meta}>Medication: {item.medicationName}</Text>
              <Text style={styles.meta}>Qty: {item.quantity}</Text>

              <View style={styles.statusRow}>
                <Text style={styles.badge}>{item.status}</Text>
                <View style={styles.actionRow}>
                  {['pending', 'approved', 'dispensed'].map((opt) => (
                    <TouchableOpacity
                      key={opt}
                      style={[
                        styles.statusButton,
                        item.status === opt && styles.statusButtonActive,
                      ]}
                      onPress={() => updateStatus(item.id, opt as 'pending' | 'approved' | 'dispensed')}
                    >
                      <Text style={styles.statusText}>{opt}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
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
  },
  patient: { fontSize: 17, fontWeight: '800' },
  meta: { color: '#69758c', marginTop: 4 },
  statusRow: { marginTop: 12 },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: '#edf6ff',
    color: theme.primary,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 999,
    fontWeight: '700',
    overflow: 'hidden',
  },
  actionRow: {
    flexDirection: 'row',
    marginTop: 10,
    flexWrap: 'wrap',
  },
  statusButton: {
    backgroundColor: '#eef2f7',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
  },
  statusButtonActive: {
    backgroundColor: theme.primary,
  },
  statusText: {
    color: '#111827',
    textTransform: 'capitalize',
    fontWeight: '700',
  },
});
