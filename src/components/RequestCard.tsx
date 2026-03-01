import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MedicineRequest } from '../config/types';
import { formatDistanceToNow } from '../utils/date';

interface RequestCardProps {
  request: MedicineRequest;
  onPress?: () => void;
  showStatus?: boolean;
}

const RequestCard: React.FC<RequestCardProps> = ({ request, onPress, showStatus = true }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return '#10b981';
      case 'fulfilled': return '#059669';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#10b981';
      default: return '#6b7280';
    }
  };

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'alert-circle';
      case 'medium': return 'alert-circle-outline';
      case 'low': return 'information-circle-outline';
      default: return 'help-circle-outline';
    }
  };

  return (
    <TouchableOpacity 
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons 
            name={getUrgencyIcon(request.urgency || 'medium')} 
            size={24} 
            color={getUrgencyColor(request.urgency || 'medium')} 
          />
          <Text style={styles.medicineName} numberOfLines={1}>
            {request.title}
          </Text>
        </View>
        
        {showStatus && (
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(request.status) }]}>
            <Text style={styles.statusText}>{request.status}</Text>
          </View>
        )}
      </View>

      <View style={styles.content}>
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Ionicons name="cube-outline" size={16} color="#6b7280" />
            <Text style={styles.infoText}>Quantity: {request.quantityNeeded}</Text>
          </View>
          
          <View style={[styles.urgencyBadge, { backgroundColor: getUrgencyColor(request.urgency || 'medium') }]}>
            <Text style={styles.urgencyText}>{request.urgency || 'medium'} priority</Text>
          </View>
        </View>

        <View style={styles.reasonContainer}>
          <Text style={styles.reasonLabel}>Reason:</Text>
          <Text style={styles.reasonText} numberOfLines={2}>
            {request.reason}
          </Text>
        </View>

        <View style={styles.footer}>
          <View style={styles.ngoInfo}>
            <Ionicons name="heart-outline" size={16} color="#3b82f6" />
            <Text style={styles.ngoName} numberOfLines={1}>{request.ngoName}</Text>
          </View>
          
          {request.geo.address && (
            <View style={styles.locationInfo}>
              <Ionicons name="location-outline" size={14} color="#6b7280" />
              <Text style={styles.locationText} numberOfLines={1}>
                {request.geo.address}
              </Text>
            </View>
          )}

          <Text style={styles.timeText}>
            {formatDistanceToNow(request.createdAt)}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  medicineName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1f2937',
    marginLeft: 8,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
    textTransform: 'capitalize',
  },
  content: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoText: {
    fontSize: 14,
    color: '#4b5563',
    marginLeft: 6,
    fontWeight: '500',
  },
  urgencyBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  urgencyText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#ffffff',
    textTransform: 'uppercase',
  },
  reasonContainer: {
    backgroundColor: '#f9fafb',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#3b82f6',
  },
  reasonLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 4,
    textTransform: 'uppercase',
  },
  reasonText: {
    fontSize: 14,
    color: '#374151',
    lineHeight: 20,
  },
  footer: {
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 12,
    gap: 6,
  },
  ngoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ngoName: {
    fontSize: 14,
    color: '#3b82f6',
    marginLeft: 6,
    fontWeight: '500',
    flex: 1,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: '#6b7280',
    marginLeft: 6,
    flex: 1,
  },
  timeText: {
    fontSize: 12,
    color: '#9ca3af',
    fontStyle: 'italic',
  },
});

export default RequestCard;
