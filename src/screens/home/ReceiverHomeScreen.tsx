import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Image,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { collection, query, where, getDocs, limit, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AppLogo } from '../../components/common/AppLogo';

/**
 * ReceiverHomeScreen Component
 * Home screen for NGOs/Receivers with quick actions
 */
export default function ReceiverHomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const [donations, setDonations] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchDonations = async () => {
      try {
        const donationsRef = collection(db, 'donations');
        const q = query(
          donationsRef,
          where('status', '==', 'available'),
          orderBy('createdAt', 'desc'),
          limit(3)
        );
        const querySnapshot = await getDocs(q);
        const donationsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDonations(donationsList);
      } catch (error) {
        console.error('Error fetching nearby donations:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchDonations();
  }, []);

  const quickActions = [
    {
      title: 'Request Medicine',
      description: 'Submit a new request',
      icon: 'add-circle',
      onPress: () => navigation.navigate('RequestMedicine'),
      color: 'bg-primary-50',
      iconColor: '#0d9488',
      enabled: true,
    },
    {
      title: 'Available Donations',
      description: 'Browse nearby medicines',
      icon: 'search',
      onPress: () => navigation.navigate('AvailableDonations'),
      color: 'bg-emerald-50',
      iconColor: '#059669',
      enabled: true,
    },
    {
      title: 'Map View',
      description: 'Find donors nearby',
      icon: 'map',
      onPress: () => navigation.navigate('Map'),
      color: 'bg-indigo-50',
      iconColor: '#4f46e5',
      enabled: true,
    },
    {
      title: 'My Requests',
      description: 'View your requests',
      icon: 'list',
      onPress: () => navigation.navigate('MyRequests'),
      color: 'bg-orange-50',
      iconColor: '#ea580c',
      enabled: true,
    },
    {
      title: 'AI Vaidya',
      description: 'Get help and guidance',
      icon: 'chatbubbles',
      onPress: () => navigation.navigate('AIVaidya'),
      color: 'bg-teal-100',
      iconColor: '#0d9488',
      enabled: true,
    },
  ];

  return (
    <View className="flex-1 bg-secondary-50">
      <StatusBar barStyle="light-content" />

      {/* Header Background */}
      <View className="absolute top-0 w-full h-[30%] bg-primary-700 rounded-b-[40px] overflow-hidden">
        <LinearGradient
          colors={['#0f766e', '#14b8a6']}
          style={{ width: '100%', height: '100%', position: 'absolute' }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full" />
        <View className="absolute top-20 -left-10 w-20 h-20 bg-white/10 rounded-full" />
      </View>

      <SafeAreaView className="flex-1">
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {/* Header Content */}
          <View className="px-6 pt-6 pb-8">
            <View className="flex-row justify-between items-center mb-6">
              <View>
                <Text className="text-primary-100 text-base font-medium mb-1">
                  Welcome Back,
                </Text>
                <Text className="text-white text-2xl font-bold tracking-tight">
                  {user?.name || 'Receiver'} 👋
                </Text>
              </View>
              <View className="flex-row items-center gap-3">
                <AppLogo size={40} />
                <TouchableOpacity className="w-10 h-10 bg-white/20 rounded-full items-center justify-center backdrop-blur-md">
                  <Ionicons name="notifications-outline" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Stats Overview */}
            <View className="flex-row justify-between mt-2">
              <View className="flex-1 bg-white/10 backdrop-blur-md p-4 rounded-2xl mr-2 border border-white/20">
                <View className="flex-row items-center mb-2">
                  <View className="w-8 h-8 bg-white/20 rounded-full items-center justify-center mr-2">
                    <Ionicons name="time-outline" size={16} color="white" />
                  </View>
                  <Text className="text-primary-50 text-xs font-medium">Active Requests</Text>
                </View>
                <Text className="text-white text-2xl font-bold">0</Text>
              </View>
              <View className="flex-1 bg-white/10 backdrop-blur-md p-4 rounded-2xl ml-2 border border-white/20">
                <View className="flex-row items-center mb-2">
                  <View className="w-8 h-8 bg-white/20 rounded-full items-center justify-center mr-2">
                    <Ionicons name="checkmark-circle-outline" size={16} color="white" />
                  </View>
                  <Text className="text-primary-50 text-xs font-medium">Fulfilled</Text>
                </View>
                <Text className="text-white text-2xl font-bold">0</Text>
              </View>
            </View>
          </View>

          {/* Main Content */}
          <View className="px-6 pb-24">
            {/* Quick Actions Grid */}
            <Text className="text-lg font-bold text-secondary-900 mb-4">
              Quick Actions
            </Text>
            <View className="flex-row flex-wrap justify-between mb-8">
              {quickActions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  className={`w-[48%] bg-white rounded-2xl p-4 mb-4 shadow-sm border border-secondary-100 ${!action.enabled ? 'opacity-50' : ''
                    }`}
                  onPress={action.enabled ? action.onPress : undefined}
                  disabled={!action.enabled}
                  activeOpacity={0.7}
                >
                  <View
                    className={`${action.color} w-12 h-12 rounded-xl items-center justify-center mb-3`}
                  >
                    <Ionicons name={action.icon as any} size={24} color={action.iconColor} />
                  </View>
                  <Text className="text-base font-bold text-secondary-900 mb-1">
                    {action.title}
                  </Text>
                  <Text className="text-xs text-secondary-500 font-medium leading-4">
                    {action.description}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Nearby Donations Section */}
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold text-secondary-900">
                Nearby Donations
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate('AvailableDonations')}>
                <Text className="text-primary-600 font-semibold text-sm">See All</Text>
              </TouchableOpacity>
            </View>

            <View className="mb-8">
              {loading ? (
                <View className="bg-white rounded-2xl p-8 items-center justify-center border border-secondary-100 min-h-[160px]">
                  <ActivityIndicator color="#0d9488" />
                </View>
              ) : donations.length > 0 ? (
                donations.map((item, index) => (
                  <TouchableOpacity
                    key={item.id || index}
                    className="bg-white rounded-2xl p-4 mb-3 shadow-sm border border-secondary-100 flex-row items-center"
                    onPress={() => navigation.navigate('DonationDetails', { donationId: item.id })}
                    activeOpacity={0.7}
                  >
                    <View className="w-14 h-14 bg-primary-50 rounded-xl items-center justify-center mr-4">
                      {item.photos && item.photos.length > 0 ? (
                        <Image source={{ uri: item.photos[0] }} className="w-14 h-14 rounded-xl" />
                      ) : (
                        <Ionicons name="medkit-outline" size={28} color="#0d9488" />
                      )}
                    </View>
                    <View className="flex-1">
                      <Text className="text-secondary-900 font-bold text-base" numberOfLines={1}>
                        {item.title || item.name || 'Medicine Name'}
                      </Text>
                      <View className="flex-row items-center mt-1">
                        <Text className="text-secondary-500 text-xs mr-2">{item.category || 'Medicine'}</Text>
                        <View className="w-1 h-1 bg-secondary-300 rounded-full mr-2" />
                        <Text className="text-primary-600 text-xs font-semibold">{item.quantity} units</Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
                  </TouchableOpacity>
                ))
              ) : (
                <View className="bg-white rounded-2xl p-8 shadow-sm border border-secondary-100 items-center justify-center min-h-[160px]">
                  <View className="w-16 h-16 bg-secondary-50 rounded-full items-center justify-center mb-3">
                    <Ionicons name="location-outline" size={32} color="#94a3b8" />
                  </View>
                  <Text className="text-secondary-500 font-medium text-center mb-1">
                    No donations nearby
                  </Text>
                  <Text className="text-secondary-400 text-xs text-center max-w-[200px]">
                    Check back later or submit a request
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
