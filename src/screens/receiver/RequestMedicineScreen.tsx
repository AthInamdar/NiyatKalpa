import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Toast from 'react-native-toast-message';
import { useAuth } from '../../context/AuthContext';
import { createRequest } from '../../services/request';
import { getCurrentLocation } from '../../services/location';
import { geohashForLocation } from 'geofire-common';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

/**
 * RequestMedicineScreen Component
 * Allows receivers/NGOs to submit medicine requests
 */
export default function RequestMedicineScreen({ navigation }: any) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [loading, setLoading] = useState(false);

  // Form fields
  const [medicineName, setMedicineName] = useState('');
  const [category, setCategory] = useState('');
  const [quantity, setQuantity] = useState('');
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high'>('medium');
  const [reason, setReason] = useState('');

  /**
   * Handle form submission
   */
  const handleSubmit = async () => {
    // Validation
    if (!medicineName || !quantity || !reason || !category) {
      Toast.show({
        type: 'error',
        text1: 'Missing Fields',
        text2: 'Please fill in all required fields including category',
      });
      return;
    }

    if (reason.length < 10) {
      Toast.show({
        type: 'error',
        text1: 'Invalid Reason',
        text2: 'Please provide a detailed reason (at least 10 characters)',
      });
      return;
    }

    setLoading(true);
    try {
      // Get user location
      const location = await getCurrentLocation();
      if (!location) {
        Toast.show({
          type: 'error',
          text1: 'Location Required',
          text2: 'Please enable location services',
        });
        setLoading(false);
        return;
      }

      // Submit to Firestore
      await createRequest({
        title: medicineName.trim(), // Changed from medicineName to title per rules
        description: reason.trim(), // Required per rules
        category: category.trim(), // Required per rules
        quantityNeeded: parseInt(quantity), // Changed from quantity to quantityNeeded per rules
        urgency,
        reason: reason.trim(),
        ngoName: user?.name || user?.email || 'Anonymous NGO', // Changed from displayName to name
        geo: {
          lat: location.lat,
          lng: location.lng,
          geohash: geohashForLocation([location.lat, location.lng]),
          address: location.address,
        },
      });

      Toast.show({
        type: 'success',
        text1: 'Request Submitted',
        text2: 'We will notify you when a match is found',
      });

      // Clear form
      setMedicineName('');
      setQuantity('');
      setUrgency('medium');
      setReason('');

      navigation.goBack();
    } catch (error: any) {
      console.error('Request submission error:', error);
      Toast.show({
        type: 'error',
        text1: 'Submission Failed',
        text2: error.message || 'Something went wrong',
      });
    } finally {
      setLoading(false);
    }
  };

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
        <View className="px-6 pt-4 pb-6 flex-row items-center">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 bg-white/20 rounded-full items-center justify-center backdrop-blur-md mr-4"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-white tracking-tight">
            Request Medicine
          </Text>
        </View>

        <ScrollView style={{ flex: 1, paddingHorizontal: 24 }} showsVerticalScrollIndicator={false}>
          <View className="bg-white rounded-3xl p-6 shadow-sm border border-secondary-100 mb-24">
            <Text className="text-lg font-bold text-secondary-900 mb-2">
              📝 Request Details
            </Text>
            <Text className="text-secondary-500 mb-6 text-sm">
              Submit a request for medicines you need. We'll notify you when a match is found.
            </Text>

            {/* Medicine Name */}
            <View className="mb-5">
              <Text className="text-sm font-semibold text-secondary-700 mb-2 ml-1">
                Medicine Name *
              </Text>
              <TextInput
                className="bg-secondary-50 border border-secondary-200 rounded-xl px-4 py-3 text-base text-secondary-900 focus:border-blue-500 focus:bg-white"
                placeholder="e.g., Paracetamol 500mg"
                value={medicineName}
                onChangeText={setMedicineName}
                editable={!loading}
              />
            </View>

            {/* Category */}
            <View className="mb-5">
              <Text className="text-sm font-semibold text-secondary-700 mb-2 ml-1">
                Category *
              </Text>
              <TextInput
                className="bg-secondary-50 border border-secondary-200 rounded-xl px-4 py-3 text-base text-secondary-900 focus:border-blue-500 focus:bg-white"
                placeholder="e.g., Tablet, Syrup, Injection"
                value={category}
                onChangeText={setCategory}
                editable={!loading}
              />
            </View>

            {/* Quantity */}
            <View className="mb-5">
              <Text className="text-sm font-semibold text-secondary-700 mb-2 ml-1">
                Quantity Needed *
              </Text>
              <TextInput
                className="bg-secondary-50 border border-secondary-200 rounded-xl px-4 py-3 text-base text-secondary-900 focus:border-blue-500 focus:bg-white"
                placeholder="e.g., 100"
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
                editable={!loading}
              />
            </View>

            {/* Urgency Level */}
            <View className="mb-5">
              <Text className="text-sm font-semibold text-secondary-700 mb-3 ml-1">
                Urgency Level *
              </Text>
              <View className="flex-row justify-between">
                <TouchableOpacity
                  className={`flex-1 mr-2 py-3 rounded-xl border-2 items-center justify-center ${urgency === 'low'
                    ? 'bg-emerald-50 border-emerald-500'
                    : 'bg-secondary-50 border-secondary-200'
                    }`}
                  onPress={() => setUrgency('low')}
                  disabled={loading}
                >
                  <Text className="text-xl mb-1">🟢</Text>
                  <Text
                    className={`text-xs font-bold ${urgency === 'low' ? 'text-emerald-700' : 'text-secondary-500'
                      }`}
                  >
                    Low
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className={`flex-1 mx-1 py-3 rounded-xl border-2 items-center justify-center ${urgency === 'medium'
                    ? 'bg-orange-50 border-orange-500'
                    : 'bg-secondary-50 border-secondary-200'
                    }`}
                  onPress={() => setUrgency('medium')}
                  disabled={loading}
                >
                  <Text className="text-xl mb-1">🟠</Text>
                  <Text
                    className={`text-xs font-bold ${urgency === 'medium' ? 'text-orange-700' : 'text-secondary-500'
                      }`}
                  >
                    Medium
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  className={`flex-1 ml-2 py-3 rounded-xl border-2 items-center justify-center ${urgency === 'high'
                    ? 'bg-red-50 border-red-500'
                    : 'bg-secondary-50 border-secondary-200'
                    }`}
                  onPress={() => setUrgency('high')}
                  disabled={loading}
                >
                  <Text className="text-xl mb-1">🔴</Text>
                  <Text
                    className={`text-xs font-bold ${urgency === 'high' ? 'text-red-700' : 'text-secondary-500'
                      }`}
                  >
                    High
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Reason */}
            <View className="mb-6">
              <Text className="text-sm font-semibold text-secondary-700 mb-2 ml-1">
                Reason for Request *
              </Text>
              <TextInput
                className="bg-secondary-50 border border-secondary-200 rounded-xl px-4 py-3 text-base text-secondary-900 focus:border-blue-500 focus:bg-white"
                placeholder="Please provide a detailed reason for this request..."
                value={reason}
                onChangeText={setReason}
                multiline
                numberOfLines={6}
                textAlignVertical="top"
                editable={!loading}
              />
              <Text className="text-xs text-secondary-400 mt-1 ml-1">
                Minimum 10 characters
              </Text>
            </View>

            {/* Info Box */}
            <View className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
              <Text className="text-blue-800 font-bold mb-2 flex-row items-center">
                ℹ️ What happens next?
              </Text>
              <Text className="text-blue-700 text-sm leading-5">
                • Your request will be matched with available donations{'\n'}
                • You'll receive notifications when matches are found{'\n'}
                • Admin will verify and approve the match{'\n'}
                • You can coordinate pickup with the donor
              </Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              className={`bg-blue-600 rounded-xl py-4 items-center shadow-lg shadow-blue-500/30 ${loading ? 'opacity-50' : ''
                }`}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white text-lg font-bold tracking-wide">
                  Submit Request
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
