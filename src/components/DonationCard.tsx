import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Donation } from '../config/types';

interface DonationCardProps {
  donation: Donation;
  onPress?: () => void;
  showStatus?: boolean;
}

const DonationCard: React.FC<DonationCardProps> = ({ donation, onPress, showStatus = true }) => {
  const daysToExpiry = Math.floor(
    (donation.expiryDate.toMillis() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-success-500';
      case 'matched': return 'bg-primary-500';
      case 'confirmed': return 'bg-purple-500';
      case 'in_transit': return 'bg-warning-500';
      case 'delivered': return 'bg-success-600';
      case 'cancelled': return 'bg-danger-500';
      default: return 'bg-secondary-500';
    }
  };

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case 'high': return 'bg-danger-500';
      case 'medium': return 'bg-warning-500';
      case 'low': return 'bg-success-500';
      default: return 'bg-secondary-500';
    }
  };

  return (
    <TouchableOpacity
      className="bg-white rounded-2xl mb-4 overflow-hidden shadow-md border border-secondary-100"
      onPress={onPress}
      activeOpacity={0.9}
    >
      {/* Image Section */}
      <View className="relative h-40 bg-secondary-50">
        {donation.photos && donation.photos.length > 0 ? (
          <Image
            source={{ uri: donation.photos[0] }}
            className="w-full h-full"
            resizeMode="cover"
          />
        ) : (
          <View className="w-full h-full items-center justify-center">
            <Ionicons name="medical" size={48} color="#9ca3af" />
          </View>
        )}

        {/* Status Badge Overlay */}
        {showStatus && (
          <View className={`absolute top-3 right-3 px-3 py-1.5 rounded-full ${getStatusColor(donation.status)} shadow-sm`}>
            <Text className="text-xs font-bold text-white capitalize tracking-wide">
              {donation.status.replace('_', ' ')}
            </Text>
          </View>
        )}
      </View>

      {/* Content Section */}
      <View className="p-5">
        <View className="flex-row justify-between items-start mb-1">
          <Text className="text-lg font-bold text-secondary-900 flex-1 mr-2" numberOfLines={1}>
            {donation.name}
          </Text>
          {donation.urgency && (
            <View className={`px-2 py-1 rounded-md ${getUrgencyColor(donation.urgency)}`}>
              <Text className="text-[10px] font-bold text-white uppercase tracking-wider">
                {donation.urgency}
              </Text>
            </View>
          )}
        </View>

        <Text className="text-sm text-secondary-500 font-medium mb-4" numberOfLines={1}>
          {donation.manufacturer}
        </Text>

        {/* Info Grid */}
        <View className="flex-row flex-wrap gap-3 mb-4">
          <View className="flex-row items-center bg-secondary-50 px-2.5 py-1.5 rounded-lg border border-secondary-100">
            <Ionicons name="cube-outline" size={14} className="text-secondary-500" />
            <Text className="text-xs font-medium text-secondary-600 ml-1.5">
              Qty: {donation.quantity}
            </Text>
          </View>

          <View className={`flex-row items-center px-2.5 py-1.5 rounded-lg border ${daysToExpiry > 30 ? 'bg-success-50 border-success-100' : 'bg-warning-50 border-warning-100'}`}>
            <Ionicons name="calendar-outline" size={14} className={daysToExpiry > 30 ? "text-success-600" : "text-warning-600"} />
            <Text className={`text-xs font-medium ml-1.5 ${daysToExpiry > 30 ? "text-success-700" : "text-warning-700"}`}>
              {daysToExpiry > 0 ? `${daysToExpiry}d left` : 'Expired'}
            </Text>
          </View>
        </View>

        {/* Footer */}
        <View className="pt-3 border-t border-secondary-100 flex-row items-center justify-between">
          <View className="flex-row items-center flex-1 mr-4">
            <View className="w-6 h-6 rounded-full bg-primary-100 items-center justify-center mr-2">
              <Ionicons name="business" size={12} className="text-primary-600" />
            </View>
            <Text className="text-xs text-secondary-600 font-medium" numberOfLines={1}>
              {donation.donorName}
            </Text>
          </View>

          {donation.geo.address && (
            <View className="flex-row items-center max-w-[45%]">
              <Ionicons name="location-outline" size={14} className="text-secondary-400 mr-1" />
              <Text className="text-xs text-secondary-500" numberOfLines={1}>
                {donation.geo.address}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

export default DonationCard;
