import React from 'react';
import { View, ActivityIndicator, Text } from 'react-native';

/**
 * LoadingScreen Component
 * Full-screen loading indicator
 */
export default function LoadingScreen({ message = 'Loading...' }: { message?: string }) {
  return (
    <View className="flex-1 items-center justify-center bg-white">
      <ActivityIndicator size="large" color="#10b981" />
      <Text className="text-gray-600 mt-4">{message}</Text>
    </View>
  );
}
