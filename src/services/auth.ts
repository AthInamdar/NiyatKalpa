import { createUserWithEmailAndPassword, User as FirebaseUser } from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User, Location } from '../config/types';

export interface UserProfile {
  uid: string;
  email: string;
  role: 'donor' | 'ngo' | 'admin' | 'pharmacist';
  name: string | null; // Changed from displayName to match Firestore rules
  location: Location | null;
  organizationType?: string;
  registrationNumber?: string;
  verified?: boolean;
  createdAt: any;
}

/**
 * Signs up a new user and automatically creates their Firestore profile document
 */
export async function signUpAndCreateProfile(
  email: string,
  password: string,
  role: 'donor' | 'ngo' | 'admin' | 'pharmacist' = 'donor'
): Promise<string> {
  try {
    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Create Firestore profile document
    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email || email,
      role,
      name: null, // Changed from displayName to match Firestore rules
      location: null,
      createdAt: serverTimestamp()
    };

    // Save to Firestore at /users/{uid}
    await setDoc(doc(db, 'users', user.uid), userProfile);

    return user.uid;
  } catch (error) {
    console.error('Error in signUpAndCreateProfile:', error);
    throw error;
  }
}

/**
 * Fetches the current user's profile from Firestore
 */
export async function getMyProfile(uid: string): Promise<UserProfile | null> {
  try {
    const docRef = doc(db, 'users', uid);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data() as UserProfile;
    } else {
      console.log('No user profile found for uid:', uid);
      return null;
    }
  } catch (error) {
    console.error('Error fetching user profile:', error);
    throw error;
  }
}

/**
 * Updates the current user's profile in Firestore
 */
export async function updateMyProfile(uid: string, updates: Partial<UserProfile>): Promise<void> {
  try {
    const docRef = doc(db, 'users', uid);
    await setDoc(docRef, updates, { merge: true });
  } catch (error) {
    console.error('Error updating user profile:', error);
    throw error;
  }
}
