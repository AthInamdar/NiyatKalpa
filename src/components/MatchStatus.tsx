import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { DonationMatch } from '../config/types';

interface MatchStatusProps {
  match: DonationMatch;
  compact?: boolean;
}

const MatchStatus: React.FC<MatchStatusProps> = ({ match, compact = false }) => {
  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'pending':
        return {
          color: '#f59e0b',
          icon: 'time-outline' as const,
          label: 'Pending Confirmation',
          description: 'Waiting for both parties to confirm',
        };
      case 'donor_confirmed':
        return {
          color: '#3b82f6',
          icon: 'checkmark-circle-outline' as const,
          label: 'Donor Confirmed',
          description: 'Waiting for NGO confirmation',
        };
      case 'ngo_confirmed':
        return {
          color: '#3b82f6',
          icon: 'checkmark-circle-outline' as const,
          label: 'NGO Confirmed',
          description: 'Waiting for donor confirmation',
        };
      case 'both_confirmed':
        return {
          color: '#10b981',
          icon: 'checkmark-done-circle' as const,
          label: 'Match Confirmed',
          description: 'Both parties confirmed. Connection established!',
        };
      case 'rejected':
        return {
          color: '#ef4444',
          icon: 'close-circle-outline' as const,
          label: 'Match Rejected',
          description: 'This match was not accepted',
        };
      default:
        return {
          color: '#6b7280',
          icon: 'help-circle-outline' as const,
          label: 'Unknown Status',
          description: '',
        };
    }
  };

  const statusInfo = getStatusInfo(match.status);

  if (compact) {
    return (
      <View style={styles.compactContainer}>
        <Ionicons name={statusInfo.icon} size={20} color={statusInfo.color} />
        <Text style={[styles.compactLabel, { color: statusInfo.color }]}>
          {statusInfo.label}
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={[styles.iconContainer, { backgroundColor: `${statusInfo.color}20` }]}>
        <Ionicons name={statusInfo.icon} size={32} color={statusInfo.color} />
      </View>
      
      <View style={styles.content}>
        <Text style={[styles.label, { color: statusInfo.color }]}>
          {statusInfo.label}
        </Text>
        <Text style={styles.description}>{statusInfo.description}</Text>
      </View>

      {/* Match Score */}
      <View style={styles.scoreContainer}>
        <Text style={styles.scoreLabel}>Match Score</Text>
        <View style={styles.scoreBar}>
          <View 
            style={[
              styles.scoreProgress, 
              { 
                width: `${match.matchScore}%`,
                backgroundColor: match.matchScore >= 70 ? '#10b981' : match.matchScore >= 50 ? '#f59e0b' : '#ef4444'
              }
            ]} 
          />
        </View>
        <Text style={styles.scoreValue}>{match.matchScore}%</Text>
      </View>

      {/* Confirmation Status */}
      <View style={styles.confirmationRow}>
        <View style={styles.confirmationItem}>
          <Ionicons 
            name={match.donorConfirmed ? 'checkmark-circle' : 'ellipse-outline'} 
            size={20} 
            color={match.donorConfirmed ? '#10b981' : '#d1d5db'} 
          />
          <Text style={[styles.confirmationText, match.donorConfirmed && styles.confirmedText]}>
            Donor
          </Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.confirmationItem}>
          <Ionicons 
            name={match.ngoConfirmed ? 'checkmark-circle' : 'ellipse-outline'} 
            size={20} 
            color={match.ngoConfirmed ? '#10b981' : '#d1d5db'} 
          />
          <Text style={[styles.confirmationText, match.ngoConfirmed && styles.confirmedText]}>
            NGO
          </Text>
        </View>
      </View>

      {/* Distance Info */}
      <View style={styles.distanceContainer}>
        <Ionicons name="navigate-outline" size={16} color="#6b7280" />
        <Text style={styles.distanceText}>
          {match.distance.toFixed(1)} km apart
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    marginBottom: 12,
  },
  content: {
    alignItems: 'center',
    marginBottom: 16,
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
  scoreContainer: {
    marginBottom: 16,
  },
  scoreLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6b7280',
    marginBottom: 8,
    textTransform: 'uppercase',
  },
  scoreBar: {
    height: 8,
    backgroundColor: '#e5e7eb',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 4,
  },
  scoreProgress: {
    height: '100%',
    borderRadius: 4,
  },
  scoreValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    textAlign: 'right',
  },
  confirmationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#e5e7eb',
    marginBottom: 12,
  },
  confirmationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  confirmationText: {
    fontSize: 14,
    color: '#9ca3af',
    fontWeight: '500',
  },
  confirmedText: {
    color: '#10b981',
  },
  divider: {
    width: 1,
    height: 24,
    backgroundColor: '#e5e7eb',
  },
  distanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  distanceText: {
    fontSize: 13,
    color: '#6b7280',
  },
  compactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  compactLabel: {
    fontSize: 13,
    fontWeight: '600',
  },
});

export default MatchStatus;
