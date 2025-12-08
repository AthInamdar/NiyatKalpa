import {
  collection,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  Timestamp,
  limit,
} from 'firebase/firestore';
import { db } from './firebase';
import { User, Donation, MedicineRequest, DonationMatch } from '../config/types';

/**
 * Verify a user (donor or NGO)
 */
export const verifyUser = async (uid: string, verified: boolean) => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { verified });
  console.log(`✅ User ${uid} verification status updated to: ${verified}`);
};

/**
 * Get all unverified users
 */
export const getUnverifiedUsers = async (): Promise<User[]> => {
  const usersRef = collection(db, 'users');
  const q = query(
    usersRef,
    where('verified', '==', false),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data() as User);
};

/**
 * Get all users by role
 */
export const getUsersByRole = async (role: 'donor' | 'ngo' | 'admin'): Promise<User[]> => {
  const usersRef = collection(db, 'users');
  const q = query(
    usersRef,
    where('role', '==', role),
    orderBy('createdAt', 'desc')
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => doc.data() as User);
};

/**
 * Get platform statistics
 */
export const getPlatformStats = async () => {
  try {
    // Get counts for different collections
    const [donationsSnap, requestsSnap, matchesSnap, usersSnap] = await Promise.all([
      getDocs(collection(db, 'donations')),
      getDocs(collection(db, 'requests')),
      getDocs(collection(db, 'matches')),
      getDocs(collection(db, 'users')),
    ]);

    const donations = donationsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Donation));
    const requests = requestsSnap.docs.map(doc => ({ ...doc.data(), id: doc.id } as MedicineRequest));
    const matches = matchesSnap.docs.map(doc => ({ ...doc.data(), id: doc.id } as DonationMatch));
    const users = usersSnap.docs.map(doc => doc.data() as User);

    // Calculate statistics
    const stats = {
      totalDonations: donations.length,
      availableDonations: donations.filter(d => d.status === 'available').length,
      completedDonations: donations.filter(d => d.status === 'delivered').length,
      totalRequests: requests.length,
      openRequests: requests.filter(r => r.status === 'open').length,
      fulfilledRequests: requests.filter(r => r.status === 'fulfilled').length,
      totalMatches: matches.length,
      confirmedMatches: matches.filter(m => m.status === 'both_confirmed').length,
      totalUsers: users.length,
      totalDonors: users.filter(u => u.role === 'donor').length,
      totalNGOs: users.filter(u => u.role === 'ngo').length,
      verifiedUsers: users.filter(u => u.verified).length,
      unverifiedUsers: users.filter(u => !u.verified).length,
    };

    return stats;
  } catch (error) {
    console.error('Error fetching platform stats:', error);
    throw error;
  }
};

/**
 * Get recent activity (for admin dashboard)
 */
export const getRecentActivity = async (limitCount: number = 20) => {
  try {
    const [donationsSnap, requestsSnap, matchesSnap] = await Promise.all([
      getDocs(query(collection(db, 'donations'), orderBy('createdAt', 'desc'), limit(limitCount))),
      getDocs(query(collection(db, 'requests'), orderBy('createdAt', 'desc'), limit(limitCount))),
      getDocs(query(collection(db, 'matches'), orderBy('createdAt', 'desc'), limit(limitCount))),
    ]);

    const activities: Array<{
      type: 'donation' | 'request' | 'match';
      id: string;
      timestamp: Timestamp;
      data: any;
    }> = [];

    donationsSnap.docs.forEach(doc => {
      activities.push({
        type: 'donation',
        id: doc.id,
        timestamp: doc.data().createdAt,
        data: doc.data(),
      });
    });

    requestsSnap.docs.forEach(doc => {
      activities.push({
        type: 'request',
        id: doc.id,
        timestamp: doc.data().createdAt,
        data: doc.data(),
      });
    });

    matchesSnap.docs.forEach(doc => {
      activities.push({
        type: 'match',
        id: doc.id,
        timestamp: doc.data().createdAt,
        data: doc.data(),
      });
    });

    // Sort by timestamp
    activities.sort((a, b) => b.timestamp.toMillis() - a.timestamp.toMillis());

    return activities.slice(0, limitCount);
  } catch (error) {
    console.error('Error fetching recent activity:', error);
    throw error;
  }
};

/**
 * Generate donation report
 */
export const generateDonationReport = async (startDate: Date, endDate: Date) => {
  const donationsRef = collection(db, 'donations');
  const q = query(
    donationsRef,
    where('createdAt', '>=', Timestamp.fromDate(startDate)),
    where('createdAt', '<=', Timestamp.fromDate(endDate)),
    orderBy('createdAt', 'desc')
  );

  const querySnapshot = await getDocs(q);
  const donations = querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Donation));

  // Calculate report metrics
  const report = {
    period: {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    },
    totalDonations: donations.length,
    totalQuantity: donations.reduce((sum, d) => sum + d.quantity, 0),
    byStatus: {
      available: donations.filter(d => d.status === 'available').length,
      matched: donations.filter(d => d.status === 'matched').length,
      confirmed: donations.filter(d => d.status === 'confirmed').length,
      in_transit: donations.filter(d => d.status === 'in_transit').length,
      delivered: donations.filter(d => d.status === 'delivered').length,
      cancelled: donations.filter(d => d.status === 'cancelled').length,
    },
    byUrgency: {
      low: donations.filter(d => d.urgency === 'low').length,
      medium: donations.filter(d => d.urgency === 'medium').length,
      high: donations.filter(d => d.urgency === 'high').length,
    },
    topDonors: getTopDonors(donations),
    donations,
  };

  return report;
};

/**
 * Helper: Get top donors from donations list
 */
const getTopDonors = (donations: Donation[]) => {
  const donorCounts: Record<string, { name: string; count: number }> = {};

  donations.forEach(donation => {
    if (!donorCounts[donation.donorId]) {
      donorCounts[donation.donorId] = {
        name: donation.donorName,
        count: 0,
      };
    }
    donorCounts[donation.donorId].count++;
  });

  return Object.entries(donorCounts)
    .map(([id, data]) => ({ donorId: id, ...data }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
};

/**
 * Get user details for admin review
 */
export const getUserDetails = async (uid: string): Promise<User | null> => {
  const userRef = doc(db, 'users', uid);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? userSnap.data() as User : null;
};

/**
 * Update user role (admin only)
 */
export const updateUserRole = async (uid: string, role: 'donor' | 'ngo' | 'admin') => {
  const userRef = doc(db, 'users', uid);
  await updateDoc(userRef, { role });
  console.log(`✅ User ${uid} role updated to: ${role}`);
};
