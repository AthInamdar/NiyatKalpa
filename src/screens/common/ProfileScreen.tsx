import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { signOut } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { auth, db } from '../../services/firebase';
import { useAuth } from '../../context/AuthContext';
import Toast from 'react-native-toast-message';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { geohashForLocation } from 'geofire-common';

/**
 * ProfileScreen Component
 * User profile and settings
 */
export default function ProfileScreen({ navigation }: any) {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut(auth);
              Toast.show({
                type: 'success',
                text1: 'Logged Out',
                text2: 'See you soon!',
              });
            } catch (error) {
              console.error('Logout error:', error);
              Toast.show({
                type: 'error',
                text1: 'Logout Failed',
                text2: 'Something went wrong',
              });
            }
          },
        },
      ],
      { cancelable: true }
    );
  };

  const updateLocation = async () => {
    if (!user?.uid) return;

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Toast.show({
          type: 'error',
          text1: 'Permission Denied',
          text2: 'Allow location access to update your location.',
        });
        return;
      }

      Toast.show({
        type: 'info',
        text1: 'Updating Location',
        text2: 'Fetching GPS coordinates...',
      });

      const location = await Location.getCurrentPositionAsync({});
      const lat = location.coords.latitude;
      const lng = location.coords.longitude;
      const processGeohash = geohashForLocation([lat, lng]);

      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        'location.lat': lat,
        'location.lng': lng,
        'location.geohash': processGeohash
      });

      Toast.show({
        type: 'success',
        text1: 'Location Updated',
        text2: 'Your location has been updated successfully.',
      });
    } catch (error) {
      console.error('Location update error:', error);
      Toast.show({
        type: 'error',
        text1: 'Update Failed',
        text2: 'Could not update location.',
      });
    }
  };

  const getRoleBadgeColor = (role?: string) => {
    switch (role) {
      case 'donor':
        return 'bg-emerald-100 border-emerald-200';
      case 'ngo':
        return 'bg-blue-100 border-blue-200';
      case 'admin':
        return 'bg-purple-100 border-purple-200';
      default:
        return 'bg-secondary-100 border-secondary-200';
    }
  };

  const getRoleTextColor = (role?: string) => {
    switch (role) {
      case 'donor':
        return 'text-emerald-700';
      case 'ngo':
        return 'text-blue-700';
      case 'admin':
        return 'text-purple-700';
      default:
        return 'text-secondary-700';
    }
  };

  const getRoleLabel = (role?: string) => {
    switch (role) {
      case 'donor':
        return 'Donor';
      case 'ngo':
        return 'Receiver/NGO';
      case 'admin':
        return 'Admin';
      default:
        return 'User';
    }
  };

  return (
    <View className="flex-1 bg-secondary-50">
      {/* Header Background */}
      <View className="absolute top-0 w-full h-[35%] bg-blue-600 rounded-b-[40px] overflow-hidden">
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
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {/* Header Content */}
          <View className="items-center pt-8 pb-6">
            <View className="w-28 h-28 bg-white rounded-full items-center justify-center mb-4 shadow-lg shadow-blue-900/20 border-4 border-white/20">
              <Text className="text-4xl">
                {user?.email?.charAt(0).toUpperCase() || '👤'}
              </Text>
            </View>
            <Text className="text-2xl font-bold text-white mb-1 tracking-tight">
              {user?.name || 'User'}
            </Text>
            <Text className="text-blue-100 mb-4 font-medium">{user?.email}</Text>

            <View
              className={`px-4 py-1.5 rounded-full border ${getRoleBadgeColor(
                user?.role
              )} bg-white/90 backdrop-blur-sm`}
            >
              <Text className={`font-bold text-xs uppercase tracking-wider ${getRoleTextColor(user?.role)}`}>
                {getRoleLabel(user?.role)}
              </Text>
            </View>
          </View>

          <View className="px-6 pb-24">
            {/* Profile Information */}
            <View className="bg-white rounded-3xl p-6 mb-6 shadow-sm border border-secondary-100">
              <Text className="text-lg font-bold text-secondary-900 mb-4 flex-row items-center">
                👤 Profile Information
              </Text>

              <View className="mb-4 border-b border-secondary-50 pb-4">
                <Text className="text-xs font-bold text-secondary-400 uppercase tracking-wider mb-1">Email</Text>
                <Text className="text-base text-secondary-800 font-medium">
                  {user?.email || 'Not set'}
                </Text>
              </View>

              <View className="mb-4 border-b border-secondary-50 pb-4">
                <Text className="text-xs font-bold text-secondary-400 uppercase tracking-wider mb-1">Role</Text>
                <Text className="text-base text-secondary-800 font-medium">
                  {getRoleLabel(user?.role)}
                </Text>
              </View>

              <View>
                <Text className="text-xs font-bold text-secondary-400 uppercase tracking-wider mb-1">
                  Verification Status
                </Text>
                <View className="flex-row items-center mt-1">
                  <View className={`w-2 h-2 rounded-full mr-2 ${user?.verified ? 'bg-emerald-500' : 'bg-orange-500'}`} />
                  <Text
                    className={`text-base font-bold ${user?.verified ? 'text-emerald-600' : 'text-orange-600'
                      }`}
                  >
                    {user?.verified ? 'Verified' : 'Pending Verification'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Settings Options */}
            <View className="bg-white rounded-3xl p-2 mb-6 shadow-sm border border-secondary-100">
              <TouchableOpacity className="flex-row items-center p-4 border-b border-secondary-50">
                <View className="w-10 h-10 bg-blue-50 rounded-full items-center justify-center mr-4">
                  <Ionicons name="person-outline" size={20} color="#2563eb" />
                </View>
                <View className="flex-1">
                  <Text className="text-base text-secondary-900 font-bold">
                    Edit Profile
                  </Text>
                  <Text className="text-xs text-secondary-500">
                    Update your information
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-row items-center p-4 border-b border-secondary-50"
                onPress={updateLocation}
              >
                <View className="w-10 h-10 bg-purple-50 rounded-full items-center justify-center mr-4">
                  <Ionicons name="location-outline" size={20} color="#9333ea" />
                </View>
                <View className="flex-1">
                  <Text className="text-base text-secondary-900 font-bold">
                    Update Location
                  </Text>
                  <Text className="text-xs text-secondary-500">
                    Use current GPS location
                  </Text>
                </View>
                <Ionicons name="refresh-outline" size={20} color="#94a3b8" />
              </TouchableOpacity>

              <TouchableOpacity className="flex-row items-center p-4 border-b border-secondary-50">
                <View className="w-10 h-10 bg-orange-50 rounded-full items-center justify-center mr-4">
                  <Ionicons name="notifications-outline" size={20} color="#ea580c" />
                </View>
                <View className="flex-1">
                  <Text className="text-base text-secondary-900 font-bold">
                    Notifications
                  </Text>
                  <Text className="text-xs text-secondary-500">
                    Manage notification preferences
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
              </TouchableOpacity>

              <TouchableOpacity className="flex-row items-center p-4">
                <View className="w-10 h-10 bg-emerald-50 rounded-full items-center justify-center mr-4">
                  <Ionicons name="information-circle-outline" size={20} color="#059669" />
                </View>
                <View className="flex-1">
                  <Text className="text-base text-secondary-900 font-bold">
                    About NiyatKalpa
                  </Text>
                  <Text className="text-xs text-secondary-500">
                    Version 1.0.0
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#94a3b8" />
              </TouchableOpacity>
            </View>

            {/* Logout Button */}
            <TouchableOpacity
              className="bg-red-50 border border-red-100 rounded-2xl py-4 items-center flex-row justify-center"
              onPress={handleLogout}
            >
              <Ionicons name="log-out-outline" size={20} color="#dc2626" style={{ marginRight: 8 }} />
              <Text className="text-red-600 text-lg font-bold">Logout</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </View>
  );
}
