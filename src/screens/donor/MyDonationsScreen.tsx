import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import Toast from 'react-native-toast-message';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

/**
 * MyDonationsScreen Component
 * Shows donor's donation history
 */
export default function MyDonationsScreen({ navigation }: any) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadDonations = async () => {
    try {
      const donationsRef = collection(db, 'donations');
      const q = query(
        donationsRef,
        where('donorId', '==', user?.uid),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const donationsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setDonations(donationsList);
    } catch (error: any) {
      console.error('Error loading donations:', error);
      Toast.show({
        type: 'error',
        text1: 'Error Loading Donations',
        text2: 'Please try again',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDonations();
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    loadDonations();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-emerald-100 text-emerald-700 border-emerald-200';
      case 'matched':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'confirmed':
        return 'bg-purple-100 text-purple-700 border-purple-200';
      case 'delivered':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-700 border-red-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const renderDonationItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      className="bg-white rounded-2xl p-5 mb-4 mx-6 shadow-sm border border-secondary-100"
      onPress={() => {
        navigation.navigate('DonationDetails', { donationId: item.id });
      }}
      activeOpacity={0.7}
    >
      <View className="flex-row justify-between items-start mb-4">
        <View className="flex-1 mr-4">
          <Text className="text-lg font-bold text-secondary-900 mb-1" numberOfLines={1}>
            {item.name}
          </Text>
          <Text className="text-sm text-secondary-500 font-medium">
            Quantity: {item.quantity} units
          </Text>
        </View>
        <View className={`px-3 py-1.5 rounded-full border ${getStatusColor(item.status)}`}>
          <Text className="text-xs font-bold capitalize tracking-wide">
            {item.status || 'available'}
          </Text>
        </View>
      </View>

      <View className="h-[1px] bg-secondary-100 mb-4" />

      <View className="flex-row justify-between items-center">
        <View className="flex-row items-center">
          <View className="w-8 h-8 bg-secondary-50 rounded-full items-center justify-center mr-2">
            <Ionicons name="barcode-outline" size={16} color="#64748b" />
          </View>
          <View>
            <Text className="text-[10px] text-secondary-400 font-medium uppercase tracking-wider">Batch No</Text>
            <Text className="text-xs text-secondary-700 font-semibold">{item.batchNo}</Text>
          </View>
        </View>

        <View className="flex-row items-center">
          <View className="w-8 h-8 bg-secondary-50 rounded-full items-center justify-center mr-2">
            <Ionicons name="calendar-outline" size={16} color="#64748b" />
          </View>
          <View>
            <Text className="text-[10px] text-secondary-400 font-medium uppercase tracking-wider">Created</Text>
            <Text className="text-xs text-secondary-700 font-semibold">
              {item.createdAt?.toDate().toLocaleDateString() || 'N/A'}
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-secondary-50">
      {/* Header Background */}
      <View className="absolute top-0 w-full h-[25%] bg-blue-600 rounded-b-[40px] overflow-hidden">
        <LinearGradient
          colors={['#2563eb', '#3b82f6']}
          style={{ width: '100%', height: '100%', position: 'absolute' }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
        <View className="absolute top-20 -left-10 w-20 h-20 bg-white/10 rounded-full" />
      </View>

      <View className="flex-1" style={{ paddingTop: insets.top }}>
        {/* Header Content */}
        <View className="px-6 pt-4 pb-2 flex-row items-center mb-4">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 bg-white/20 rounded-full items-center justify-center backdrop-blur-md mr-4"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-white tracking-tight">
            My Donations
          </Text>
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#2563eb" />
            <Text className="text-secondary-500 mt-4 font-medium">Loading donations...</Text>
          </View>
        ) : (
          <FlatList
            data={donations}
            renderItem={renderDonationItem}
            keyExtractor={(item) => item.id}
            contentContainerStyle={{ paddingVertical: 16, paddingBottom: 100 }}
            refreshing={refreshing}
            onRefresh={handleRefresh}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={
              <View className="items-center justify-center py-20 px-6">
                <View className="w-24 h-24 bg-white rounded-full items-center justify-center mb-6 shadow-sm">
                  <Text className="text-5xl">📦</Text>
                </View>
                <Text className="text-xl font-bold text-secondary-900 mb-2 text-center">
                  No Donations Yet
                </Text>
                <Text className="text-secondary-500 text-center leading-6">
                  You haven't made any donations yet.{"\n"}Start by uploading your first medicine donation!
                </Text>
                <TouchableOpacity
                  className="mt-8 bg-emerald-600 px-8 py-3 rounded-xl shadow-lg shadow-emerald-500/30"
                  onPress={() => navigation.navigate('UploadMedicine')}
                >
                  <Text className="text-white font-bold text-base">Donate Now</Text>
                </TouchableOpacity>
              </View>
            }
          />
        )}
      </View>
    </View>
  );
}
