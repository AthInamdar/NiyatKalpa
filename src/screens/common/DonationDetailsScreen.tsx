import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Image,
  Linking,
  StatusBar,
} from 'react-native';
import { getDonation } from '../../services/donation';
import { useAuth } from '../../context/AuthContext';
import Toast from 'react-native-toast-message';
import { formatDistance } from '../../services/location';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

/**
 * DonationDetailsScreen Component
 * Shows detailed information about a specific donation
 */
export default function DonationDetailsScreen({ route, navigation }: any) {
  const { donationId } = route.params;
  const { user } = useAuth();
  const [donation, setDonation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDonation();
  }, [donationId]);

  const loadDonation = async () => {
    try {
      const data = await getDonation(donationId);
      if (data) {
        setDonation(data);
      } else {
        Toast.show({
          type: 'error',
          text1: 'Donation Not Found',
          text2: 'This donation may have been removed',
        });
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error loading donation:', error);
      Toast.show({
        type: 'error',
        text1: 'Error Loading Details',
        text2: 'Please try again',
      });
    } finally {
      setLoading(false);
    }
  };

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

  const handleRequestMedicine = () => {
    Toast.show({
      type: 'info',
      text1: 'Request Feature',
      text2: 'Direct request functionality coming soon',
    });
  };

  const handleContactDonor = () => {
    if (donation?.donorPhone) {
      Linking.openURL(`tel:${donation.donorPhone}`);
    } else {
      Toast.show({
        type: 'info',
        text1: 'No Contact Info',
        text2: 'Contact information not available',
      });
    }
  };

  const handleGetDirections = () => {
    if (donation?.geo) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${donation.geo.lat},${donation.geo.lng}`;
      Linking.openURL(url);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-secondary-50 items-center justify-center">
        <ActivityIndicator size="large" color="#0d9488" />
        <Text className="text-secondary-500 mt-4 font-medium">Loading donation details...</Text>
      </View>
    );
  }

  if (!donation) {
    return (
      <View className="flex-1 bg-secondary-50 items-center justify-center p-6">
        <View className="w-24 h-24 bg-red-50 rounded-full items-center justify-center mb-6">
          <Ionicons name="alert-circle-outline" size={48} color="#dc2626" />
        </View>
        <Text className="text-xl font-bold text-secondary-900 mb-2">
          Donation Not Found
        </Text>
        <TouchableOpacity
          className="bg-primary-600 rounded-xl px-8 py-3 mt-4 shadow-lg shadow-primary-500/30"
          onPress={() => navigation.goBack()}
        >
          <Text className="text-white font-bold">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-secondary-50">
      <StatusBar barStyle="light-content" />

      {/* Header Background */}
      <View className="absolute top-0 w-full h-[30%] bg-primary-700 rounded-b-[40px] overflow-hidden z-0">
        <LinearGradient
          colors={['#0f766e', '#14b8a6']}
          style={{ width: '100%', height: '100%', position: 'absolute' }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </View>

      <SafeAreaView className="flex-1">
        {/* Header Content */}
        <View className="px-6 pt-4 pb-2 flex-row items-center justify-between z-10">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 bg-white/20 rounded-full items-center justify-center backdrop-blur-md"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-lg font-bold text-white tracking-tight">
            Donation Details
          </Text>
          <View className="w-10" />
        </View>

        <ScrollView style={{ flex: 1, marginTop: 16 }} showsVerticalScrollIndicator={false}>
          {/* Images */}
          <View className="px-6 mb-6">
            {donation.photos && donation.photos.length > 0 ? (
              <View className="relative shadow-xl shadow-blue-900/20 rounded-3xl overflow-hidden bg-white">
                <Image
                  source={{ uri: donation.photos[0] }}
                  className="w-full h-64"
                  resizeMode="cover"
                />
                {donation.photos.length > 1 && (
                  <View className="absolute bottom-4 right-4 bg-black/60 px-3 py-1.5 rounded-full backdrop-blur-md">
                    <Text className="text-white text-xs font-bold">
                      +{donation.photos.length - 1} more
                    </Text>
                  </View>
                )}
                <View className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/50">
                  <Text className="text-emerald-700 text-xs font-bold uppercase tracking-wide">
                    {donation.status || 'Available'}
                  </Text>
                </View>
              </View>
            ) : (
              <View className="w-full h-64 bg-white rounded-3xl items-center justify-center shadow-lg shadow-blue-900/10">
                <Ionicons name="image-outline" size={64} color="#cbd5e1" />
                <Text className="text-secondary-400 mt-2 font-medium">No Image Available</Text>
              </View>
            )}
          </View>

          {/* Main Content */}
          <View className="bg-white rounded-t-[40px] px-6 py-8 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
            {/* Medicine Name & Expiry */}
            <View className="mb-8">
              <Text className="text-3xl font-bold text-secondary-900 mb-2">
                {donation.title || donation.name || "Medicine Name"}
              </Text>

              <View className={`flex-row items-center self-start px-3 py-1.5 rounded-lg ${getDaysUntilExpiry(donation.expiryDate).includes('Expired') ? 'bg-red-50' : 'bg-orange-50'
                }`}>
                <Ionicons name="time-outline" size={16} color={
                  getDaysUntilExpiry(donation.expiryDate).includes('Expired') ? '#dc2626' : '#ea580c'
                } style={{ marginRight: 6 }} />
                <Text className={`text-sm font-bold ${getExpiryColor(donation.expiryDate)}`}>
                  {getDaysUntilExpiry(donation.expiryDate)}
                </Text>
                <Text className="text-secondary-400 text-xs ml-2 font-medium">
                  (Exp: {donation.expiryDate?.toDate?.()?.toLocaleDateString() || 'Unknown'})
                </Text>
              </View>
            </View>

            {/* Details Grid */}
            <View className="mb-8">
              <Text className="text-lg font-bold text-secondary-900 mb-4 flex-row items-center">
                💊 Medicine Details
              </Text>

              <View className="flex-row flex-wrap bg-secondary-50 rounded-2xl p-4 border border-secondary-100">
                <View className="w-1/2 mb-4 pr-2">
                  <Text className="text-xs text-secondary-400 font-bold uppercase tracking-wider mb-1">Manufacturer</Text>
                  <Text className="text-sm text-secondary-800 font-semibold">
                    {donation.manufacturer || 'N/A'}
                  </Text>
                </View>
                <View className="w-1/2 mb-4 pl-2">
                  <Text className="text-xs text-secondary-400 font-bold uppercase tracking-wider mb-1">Batch Number</Text>
                  <Text className="text-sm text-secondary-800 font-semibold">
                    {donation.batchNo || 'N/A'}
                  </Text>
                </View>
                <View className="w-1/2 pr-2">
                  <Text className="text-xs text-secondary-400 font-bold uppercase tracking-wider mb-1">Quantity</Text>
                  <Text className="text-sm text-secondary-800 font-semibold">
                    {donation.quantity} units
                  </Text>
                </View>
                <View className="w-1/2 pl-2">
                  <Text className="text-xs text-secondary-400 font-bold uppercase tracking-wider mb-1">Urgency</Text>
                  <Text className={`text-sm font-bold ${donation.urgency === 'high' ? 'text-red-600' :
                    donation.urgency === 'medium' ? 'text-orange-600' :
                      'text-blue-600'
                    }`}>
                    {donation.urgency?.toUpperCase() || 'MEDIUM'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Description */}
            {donation.description && (
              <View className="mb-8">
                <Text className="text-lg font-bold text-secondary-900 mb-2">
                  📝 Description
                </Text>
                <Text className="text-secondary-600 leading-6 text-base">
                  {donation.description}
                </Text>
              </View>
            )}

            {/* Donor Information */}
            <View className="mb-8">
              <Text className="text-lg font-bold text-secondary-900 mb-4">
                👤 Donor Information
              </Text>
              <View className="bg-blue-50 rounded-2xl p-5 border border-blue-100">
                <View className="flex-row items-center mb-4">
                  <View className="w-12 h-12 bg-blue-100 rounded-full items-center justify-center mr-3">
                    <Ionicons name="person" size={24} color="#2563eb" />
                  </View>
                  <View>
                    <Text className="text-base text-secondary-900 font-bold">
                      {donation.donorName || 'Anonymous Donor'}
                    </Text>
                    {donation.donorType && (
                      <Text className="text-xs text-blue-600 font-bold uppercase tracking-wide mt-0.5">
                        {donation.donorType}
                      </Text>
                    )}
                  </View>
                </View>

                {donation.geo?.address && (
                  <View className="flex-row items-start bg-white/50 p-3 rounded-xl">
                    <Ionicons name="location" size={18} color="#2563eb" style={{ marginRight: 8, marginTop: 2 }} />
                    <Text className="text-sm text-secondary-700 font-medium flex-1 leading-5">
                      {donation.geo.address}
                    </Text>
                  </View>
                )}
              </View>
            </View>

            {/* Safety Information */}
            <View className="bg-orange-50 rounded-2xl p-5 border border-orange-100 mb-24">
              <Text className="text-orange-800 font-bold mb-3 flex-row items-center">
                ⚠️ Important Safety Information
              </Text>
              <View className="space-y-2">
                <View className="flex-row items-start mb-1">
                  <Text className="text-orange-400 mr-2">•</Text>
                  <Text className="text-orange-800 text-sm flex-1">Always check the medicine condition before accepting</Text>
                </View>
                <View className="flex-row items-start mb-1">
                  <Text className="text-orange-400 mr-2">•</Text>
                  <Text className="text-orange-800 text-sm flex-1">Verify the expiry date and packaging</Text>
                </View>
                <View className="flex-row items-start mb-1">
                  <Text className="text-orange-400 mr-2">•</Text>
                  <Text className="text-orange-800 text-sm flex-1">Consult a healthcare professional before use</Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        {user?.role === 'ngo' && donation.status === 'available' && (
          <View className="absolute bottom-0 left-0 right-0 bg-white border-t border-secondary-100 px-6 py-4 shadow-lg">
            <View className="flex-row gap-3 mb-3">
              <TouchableOpacity
                className="flex-1 bg-secondary-100 rounded-xl py-3.5 items-center flex-row justify-center"
                onPress={handleContactDonor}
              >
                <Ionicons name="call" size={20} color="#334155" style={{ marginRight: 8 }} />
                <Text className="text-secondary-700 font-bold">Contact</Text>
              </TouchableOpacity>
              <TouchableOpacity
                className="flex-1 bg-secondary-100 rounded-xl py-3.5 items-center flex-row justify-center"
                onPress={handleGetDirections}
              >
                <Ionicons name="navigate" size={20} color="#334155" style={{ marginRight: 8 }} />
                <Text className="text-secondary-700 font-bold">Directions</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              className="bg-primary-600 rounded-xl py-4 items-center shadow-lg shadow-primary-500/30"
              onPress={handleRequestMedicine}
            >
              <Text className="text-white font-bold text-lg tracking-wide">Request Medicine</Text>
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    </View>
  );
}
