import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useAuth } from '../../context/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { AppLogo } from '../../components/common/AppLogo';

/**
 * AdminHomeScreen Component
 * Dashboard for admins to manage users and donations
 */
export default function AdminHomeScreen({ navigation }: any) {
  const { user } = useAuth();

  const adminActions = [
    {
      title: 'Verify Users',
      description: 'Review pending registrations',
      icon: 'checkmark-done-circle',
      onPress: () => navigation.navigate('VerifyUsers'),
      color: 'bg-emerald-50',
      iconColor: '#059669',
      badge: 0,
      enabled: true,
    },
    {
      title: 'Monitor Donations',
      description: 'Track all donations',
      icon: 'bar-chart',
      onPress: () => { }, // TODO: Create MonitorDonationsScreen
      color: 'bg-blue-50',
      iconColor: '#2563eb',
      enabled: false,
    },
    {
      title: 'Manage Requests',
      description: 'View all requests',
      icon: 'documents',
      onPress: () => { }, // TODO: Create ManageRequestsScreen
      color: 'bg-purple-50',
      iconColor: '#9333ea',
      enabled: false,
    },
    {
      title: 'Analytics',
      description: 'View platform statistics',
      icon: 'stats-chart',
      onPress: () => { }, // TODO: Create AnalyticsScreen
      color: 'bg-orange-50',
      iconColor: '#ea580c',
      enabled: false,
    },
  ];

  return (
    <View className="flex-1 bg-secondary-50">
      <StatusBar barStyle="light-content" />

      {/* Header Background */}
      <View className="absolute top-0 w-full h-[30%] bg-gray-900 rounded-b-[40px] overflow-hidden">
        <LinearGradient
          colors={['#1e293b', '#334155']}
          style={{ width: '100%', height: '100%', position: 'absolute' }}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        <View className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full" />
        <View className="absolute top-20 -left-10 w-20 h-20 bg-white/5 rounded-full" />
      </View>

      <SafeAreaView className="flex-1">
        <ScrollView style={{ flex: 1 }} showsVerticalScrollIndicator={false}>
          {/* Header Content */}
          <View className="px-6 pt-6 pb-8">
            <View className="flex-row justify-between items-center mb-6">
              <View>
                <Text className="text-gray-300 text-base font-medium mb-1">
                  Admin Dashboard
                </Text>
                <Text className="text-white text-2xl font-bold tracking-tight">
                  {user?.displayName || 'Admin'} 🛡️
                </Text>
              </View>
              <View className="flex-row items-center gap-3">
                <AppLogo size={40} />
                <TouchableOpacity className="w-10 h-10 bg-white/10 rounded-full items-center justify-center backdrop-blur-md">
                  <Ionicons name="settings-outline" size={20} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Stats Overview */}
            <View className="flex-row flex-wrap justify-between mt-2">
              <View className="w-[48%] bg-white/10 backdrop-blur-md p-4 rounded-2xl mb-3 border border-white/10">
                <Text className="text-gray-300 text-xs font-medium mb-1">Total Users</Text>
                <Text className="text-white text-2xl font-bold">0</Text>
              </View>
              <View className="w-[48%] bg-white/10 backdrop-blur-md p-4 rounded-2xl mb-3 border border-white/10">
                <Text className="text-orange-300 text-xs font-medium mb-1">Pending</Text>
                <Text className="text-white text-2xl font-bold">0</Text>
              </View>
              <View className="w-[48%] bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                <Text className="text-emerald-300 text-xs font-medium mb-1">Donations</Text>
                <Text className="text-white text-2xl font-bold">0</Text>
              </View>
              <View className="w-[48%] bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/10">
                <Text className="text-blue-300 text-xs font-medium mb-1">Requests</Text>
                <Text className="text-white text-2xl font-bold">0</Text>
              </View>
            </View>
          </View>

          {/* Main Content */}
          <View className="px-6 pb-24">
            {/* Admin Actions Grid */}
            <Text className="text-lg font-bold text-secondary-900 mb-4">
              Management
            </Text>
            <View className="flex-row flex-wrap justify-between mb-8">
              {adminActions.map((action, index) => (
                <TouchableOpacity
                  key={index}
                  className={`w-[48%] bg-white rounded-2xl p-4 mb-4 shadow-sm border border-secondary-100 ${!action.enabled ? 'opacity-50' : ''
                    }`}
                  onPress={action.enabled ? action.onPress : undefined}
                  disabled={!action.enabled}
                  activeOpacity={0.7}
                >
                  <View className="flex-row justify-between items-start mb-3">
                    <View
                      className={`${action.color} w-12 h-12 rounded-xl items-center justify-center`}
                    >
                      <Ionicons name={action.icon as any} size={24} color={action.iconColor} />
                    </View>
                    {action.badge !== undefined && action.badge > 0 && (
                      <View className="bg-red-500 px-2 py-1 rounded-full">
                        <Text className="text-white text-[10px] font-bold">
                          {action.badge}
                        </Text>
                      </View>
                    )}
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

            {/* Recent Activity Section */}
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-lg font-bold text-secondary-900">
                Recent Activity
              </Text>
              <TouchableOpacity>
                <Text className="text-primary-600 font-semibold text-sm">See All</Text>
              </TouchableOpacity>
            </View>

            <View className="bg-white rounded-2xl p-8 shadow-sm border border-secondary-100 items-center justify-center min-h-[160px]">
              <View className="w-16 h-16 bg-secondary-50 rounded-full items-center justify-center mb-3">
                <Ionicons name="time-outline" size={32} color="#94a3b8" />
              </View>
              <Text className="text-secondary-500 font-medium text-center mb-1">
                No recent activity
              </Text>
              <Text className="text-secondary-400 text-xs text-center max-w-[200px]">
                Platform logs will appear here
              </Text>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
