import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Image,
  StatusBar,
} from 'react-native';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import Toast from 'react-native-toast-message';
import { getCurrentLocation, addDistanceToItems, sortByDistance } from '../../services/location';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { Donation } from '../../config/types';

/**
 * AvailableDonationsScreen Component
 * Shows all available medicine donations that receivers can request
 */
export default function AvailableDonationsScreen({ navigation }: any) {
  const { user } = useAuth();
  const [donations, setDonations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [userLocation, setUserLocation] = useState<any>(null);

  /**
   * Load available donations from Firestore
   */
  const loadDonations = async () => {
    try {
      // Get user location
      const location = await getCurrentLocation();
      setUserLocation(location);

      const donationsRef = collection(db, 'donations');
      const q = query(
        donationsRef,
        where('status', '==', 'available'),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      let donationsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Donation[];

      // Filter donations that have location
      donationsList = donationsList.filter(d => d.geo && d.geo.lat && d.geo.lng);

      // Add distance and sort by distance if user location available
      if (location && donationsList.length > 0) {
        // @ts-ignore - addDistanceToItems adds properties that might not be in Donation type strictly
        donationsList = addDistanceToItems(donationsList, location.lat, location.lng);
        donationsList = sortByDistance(donationsList, location.lat, location.lng);
      }

      setDonations(donationsList);
    } catch (error: any) {
      console.error('Error loading donations:', error);

      // If it's an index error, show helpful message
      if (error.code === 'failed-precondition') {
        Toast.show({
          type: 'info',
          text1: 'Setting up database',
          text2: 'Please create Firestore indexes',
        });
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error Loading Donations',
          text2: 'Please try again',
        });
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDonations();
  }, []);

  /**
   * Handle refresh
   */
  const handleRefresh = () => {
    setRefreshing(true);
    loadDonations();
  };

  /**
   * Calculate days until expiry
   */
  const getDaysUntilExpiry = (expiryDate: any) => {
    if (!expiryDate) return 'Unknown';

    const expiry = expiryDate.toDate ? expiryDate.toDate() : new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Expired';
    if (diffDays === 0) return 'Expires today';
    if (diffDays === 1) return '1 day left';
    return `${diffDays} days left`;
  };

  /**
   * Get urgency color
   */
  const getExpiryColor = (expiryDate: any) => {
    if (!expiryDate) return 'text-secondary-500';

    const expiry = expiryDate.toDate ? expiryDate.toDate() : new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'text-red-600';
    if (diffDays <= 30) return 'text-orange-600';
    if (diffDays <= 90) return 'text-yellow-600';
    return 'text-emerald-600';
  };

  /**
   * Handle donation item press
   */
  const handleDonationPress = (donation: any) => {
    navigation.navigate('DonationDetails', { donationId: donation.id });
  };

  /**
   * Render donation item
   */
  const renderDonationItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      className="bg-white rounded-2xl p-4 mb-4 mx-6 shadow-sm border border-secondary-100"
      onPress={() => handleDonationPress(item)}
      activeOpacity={0.8}
    >
      {/* Medicine Image */}
      {item.photos && item.photos.length > 0 ? (
        <Image
          source={{ uri: item.photos[0] }}
          className="w-full h-40 rounded-xl mb-4"
          resizeMode="cover"
        />
      ) : (
        <View className="w-full h-40 rounded-xl mb-4 bg-secondary-50 items-center justify-center">
          <Ionicons name="medkit-outline" size={48} color="#cbd5e1" />
        </View>
      )}

      {/* Medicine Name */}
      <View className="flex-row justify-between items-start mb-2">
        <Text className="text-lg font-bold text-secondary-900 flex-1 mr-2" numberOfLines={1}>
          {item.name || 'Medicine Name'}
        </Text>
        <View className="bg-emerald-50 px-2 py-1 rounded-lg border border-emerald-100">
          <Text className="text-emerald-700 text-xs font-bold">Available</Text>
        </View>
      </View>

      {/* Details Grid */}
      <View className="flex-row flex-wrap mb-3">
        <View className="w-1/2 mb-2 pr-2">
          <Text className="text-xs text-secondary-400 font-medium uppercase tracking-wider mb-0.5">Quantity</Text>
          <Text className="text-sm text-secondary-800 font-semibold">
            {item.quantity || 0} units
          </Text>
        </View>
        <View className="w-1/2 mb-2 pl-2">
          <Text className="text-xs text-secondary-400 font-medium uppercase tracking-wider mb-0.5">Expiry</Text>
          <Text className={`text-sm font-bold ${getExpiryColor(item.expiryDate)}`}>
            {getDaysUntilExpiry(item.expiryDate)}
          </Text>
        </View>
      </View>

      {/* Donor Info & Distance */}
      <View className="border-t border-secondary-100 pt-3 flex-row justify-between items-center">
        <View className="flex-row items-center flex-1 mr-2">
          <View className="w-8 h-8 bg-blue-50 rounded-full items-center justify-center mr-2">
            <Ionicons name="person" size={14} color="#2563eb" />
          </View>
          <View>
            <Text className="text-[10px] text-secondary-400 font-medium uppercase tracking-wider">Donor</Text>
            <Text className="text-xs text-secondary-800 font-semibold" numberOfLines={1}>
              {item.donorName || 'Anonymous'}
            </Text>
          </View>
        </View>

        {item.distanceText && (
          <View className="flex-row items-center bg-secondary-50 px-3 py-1.5 rounded-full">
            <Ionicons name="location-sharp" size={14} color="#2563eb" style={{ marginRight: 4 }} />
            <Text className="text-xs text-blue-700 font-bold">
              {item.distanceText}
            </Text>
          </View>
        )}
      </View>

      {/* Action Button */}
      <TouchableOpacity
        className="bg-blue-600 rounded-xl py-3 mt-4 items-center shadow-lg shadow-blue-500/20"
        onPress={() => {
          Toast.show({
            type: 'info',
            text1: 'Request Feature',
            text2: 'Request functionality coming soon',
          });
        }}
      >
        <Text className="text-white font-bold tracking-wide">Request Medicine</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  /**
   * Render empty state
   */
  const renderEmptyState = () => (
    <View className="flex-1 items-center justify-center px-6 py-12">
      <View className="w-24 h-24 bg-white rounded-full items-center justify-center mb-6 shadow-sm">
        <Text className="text-5xl">📦</Text>
      </View>
      <Text className="text-xl font-bold text-secondary-900 mb-2 text-center">
        No Donations Available
      </Text>
      <Text className="text-secondary-500 text-center mb-8 leading-6">
        There are no medicine donations available nearby at the moment. Check back later!
      </Text>
      <TouchableOpacity
        className="bg-blue-600 rounded-xl px-8 py-3 shadow-lg shadow-blue-500/30"
        onPress={handleRefresh}
      >
        <Text className="text-white font-bold text-base">Refresh List</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View className="flex-1 bg-secondary-50">
      <StatusBar barStyle="light-content" />

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

      <SafeAreaView className="flex-1">
        {/* Header Content */}
        <View className="px-6 pt-4 pb-2 flex-row items-center justify-between mb-4">
          <View className="flex-row items-center">
            <TouchableOpacity
              onPress={() => navigation.goBack()}
              className="w-10 h-10 bg-white/20 rounded-full items-center justify-center backdrop-blur-md mr-4"
            >
              <Ionicons name="arrow-back" size={24} color="white" />
            </TouchableOpacity>
            <View>
              <Text className="text-2xl font-bold text-white tracking-tight">
                Donations
              </Text>
              <Text className="text-blue-100 text-xs font-medium">
                {donations.length} items nearby
              </Text>
            </View>
          </View>

          <TouchableOpacity
            className="w-10 h-10 bg-white/20 rounded-full items-center justify-center backdrop-blur-md"
            onPress={() => navigation.navigate('Map')}
          >
            <Ionicons name="map" size={20} color="white" />
          </TouchableOpacity>
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#2563eb" />
            <Text className="text-secondary-500 mt-4 font-medium">Finding nearby donations...</Text>
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
            ListEmptyComponent={renderEmptyState}
          />
        )}
      </SafeAreaView>
    </View>
  );
}
