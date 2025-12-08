import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  RefreshControl,
  StatusBar,
} from 'react-native';
import Toast from 'react-native-toast-message';
import { getUnverifiedUsers, verifyUser } from '../../services/admin';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

/**
 * VerifyUsersScreen Component
 * Admin screen to verify pending user registrations
 */
export default function VerifyUsersScreen({ navigation }: any) {
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  useEffect(() => {
    loadPendingUsers();
  }, []);

  const loadPendingUsers = async () => {
    try {
      const users = await getUnverifiedUsers();
      setPendingUsers(users);
    } catch (error) {
      console.error('Error loading pending users:', error);
      Toast.show({
        type: 'error',
        text1: 'Error Loading Users',
        text2: 'Please try again',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadPendingUsers();
  };

  const handleApprove = async (userId: string) => {
    setActionLoading(userId);
    try {
      await verifyUser(userId, true);

      Toast.show({
        type: 'success',
        text1: 'User Approved',
        text2: 'User has been verified successfully',
      });

      // Remove from pending list
      setPendingUsers((prev) => prev.filter((u) => u.uid !== userId));
    } catch (error: any) {
      console.error('Approval error:', error);
      Toast.show({
        type: 'error',
        text1: 'Approval Failed',
        text2: error.message || 'Something went wrong',
      });
    } finally {
      setActionLoading(null);
    }
  };

  const handleReject = async (userId: string) => {
    setActionLoading(userId);
    try {
      // Keep user but mark as not verified (reject)
      await verifyUser(userId, false);

      Toast.show({
        type: 'success',
        text1: 'User Rejected',
        text2: 'User registration has been rejected',
      });

      setPendingUsers((prev) => prev.filter((u) => u.uid !== userId));
    } catch (error: any) {
      console.error('Rejection error:', error);
      Toast.show({
        type: 'error',
        text1: 'Rejection Failed',
        text2: error.message || 'Something went wrong',
      });
    } finally {
      setActionLoading(null);
    }
  };

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
        <View className="px-6 pt-4 pb-6 flex-row items-center">
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            className="w-10 h-10 bg-white/20 rounded-full items-center justify-center backdrop-blur-md mr-4"
          >
            <Ionicons name="arrow-back" size={24} color="white" />
          </TouchableOpacity>
          <Text className="text-2xl font-bold text-white tracking-tight">
            Verify Users
          </Text>
        </View>

        {loading ? (
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#2563eb" />
            <Text className="text-secondary-500 mt-4 font-medium">Loading pending users...</Text>
          </View>
        ) : (
          <ScrollView
            className="flex-1 px-6"
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#2563eb" />
            }
            showsVerticalScrollIndicator={false}
          >
            {pendingUsers.length === 0 ? (
              <View className="bg-white rounded-3xl p-8 items-center shadow-sm border border-secondary-100 mt-4">
                <View className="w-24 h-24 bg-emerald-50 rounded-full items-center justify-center mb-6">
                  <Text className="text-5xl">✅</Text>
                </View>
                <Text className="text-xl font-bold text-secondary-900 mb-2">
                  All Caught Up!
                </Text>
                <Text className="text-secondary-500 text-center leading-6">
                  No pending user verifications at the moment. Great job!
                </Text>
              </View>
            ) : (
              <View className="pb-24">
                <Text className="text-secondary-500 font-medium mb-4 ml-1">
                  {pendingUsers.length} Pending Verification{pendingUsers.length !== 1 ? 's' : ''}
                </Text>

                {pendingUsers.map((user) => (
                  <View
                    key={user.uid}
                    className="bg-white rounded-2xl p-5 mb-4 shadow-sm border border-secondary-100"
                  >
                    <View className="flex-row items-start justify-between mb-4">
                      <View className="flex-1 mr-4">
                        <Text className="text-lg font-bold text-secondary-900 mb-1">
                          {user.name || user.displayName || 'Unnamed User'}
                        </Text>
                        <Text className="text-sm text-secondary-500 font-medium mb-2">
                          {user.email}
                        </Text>
                        <View className="bg-blue-50 self-start px-3 py-1 rounded-lg border border-blue-100">
                          <Text className="text-blue-700 text-xs font-bold uppercase tracking-wide">
                            {user.role}
                          </Text>
                        </View>
                      </View>
                      <View className="w-10 h-10 bg-secondary-50 rounded-full items-center justify-center">
                        <Ionicons name="person" size={20} color="#64748b" />
                      </View>
                    </View>

                    <View className="h-[1px] bg-secondary-100 mb-4" />

                    <View className="flex-row gap-3">
                      <TouchableOpacity
                        className="flex-1 bg-red-50 py-3 rounded-xl border border-red-100 items-center justify-center"
                        onPress={() => handleReject(user.uid)}
                        disabled={actionLoading === user.uid}
                      >
                        {actionLoading === user.uid ? (
                          <ActivityIndicator size="small" color="#dc2626" />
                        ) : (
                          <Text className="text-red-700 font-bold">Reject</Text>
                        )}
                      </TouchableOpacity>

                      <TouchableOpacity
                        className="flex-1 bg-emerald-600 py-3 rounded-xl shadow-lg shadow-emerald-500/20 items-center justify-center"
                        onPress={() => handleApprove(user.uid)}
                        disabled={actionLoading === user.uid}
                      >
                        {actionLoading === user.uid ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <Text className="text-white font-bold">Approve</Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>
        )}
      </SafeAreaView>
    </View>
  );
}
