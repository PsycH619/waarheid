import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  User as FirebaseUser,
  updateProfile,
} from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import type { User, UserRole } from '@/types';
import { COLLECTIONS } from './firestore';

/**
 * Creates or updates a user document in Firestore
 * This is a critical function that ensures every Firebase Auth user has a corresponding Firestore document
 */
export async function ensureUserDocument(
  firebaseUser: FirebaseUser,
  additionalData?: Partial<User>
): Promise<User> {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, firebaseUser.uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      // User document exists, return it
      return { id: userDoc.id, ...userDoc.data() } as User;
    }

    // User document doesn't exist, create it
    const newUserData: any = {
      email: firebaseUser.email || '',
      name: firebaseUser.displayName || additionalData?.name || 'User',
      role: additionalData?.role || 'client',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      ...additionalData,
    };

    await setDoc(userRef, newUserData);

    console.log('✅ User document created in Firestore:', firebaseUser.uid);

    return { id: firebaseUser.uid, ...newUserData } as User;
  } catch (error) {
    console.error('❌ Error ensuring user document:', error);
    throw error;
  }
}

export async function signUp(
  email: string,
  password: string,
  name: string,
  role: UserRole = 'client',
  additionalData?: Partial<User>
) {
  try {
    // Step 1: Create auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const { user } = userCredential;

    // Step 2: Update display name
    await updateProfile(user, { displayName: name });

    // Step 3: Create Firestore document with retry logic
    let retries = 3;
    let userDoc = null;

    while (retries > 0 && !userDoc) {
      try {
        userDoc = await ensureUserDocument(user, {
          name,
          role,
          ...additionalData,
        });
        break;
      } catch (error) {
        retries--;
        if (retries === 0) throw error;
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    console.log('✅ User registration complete:', user.uid);
    return user;
  } catch (error: any) {
    console.error('❌ Sign up error:', error);
    throw new Error(error.message || 'Failed to sign up');
  }
}

export async function signIn(email: string, password: string) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const { user } = userCredential;

    // Ensure user document exists (safety net for existing users)
    await ensureUserDocument(user);

    return user;
  } catch (error: any) {
    console.error('❌ Sign in error:', error);
    throw new Error(error.message || 'Failed to sign in');
  }
}

export async function signOut() {
  try {
    await firebaseSignOut(auth);
  } catch (error: any) {
    console.error('Sign out error:', error);
    throw new Error(error.message || 'Failed to sign out');
  }
}

export async function getUserData(userId: string): Promise<User | null> {
  try {
    const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userId));

    if (userDoc.exists()) {
      return { id: userDoc.id, ...userDoc.data() } as User;
    }

    console.warn('⚠️ User document not found for:', userId);
    return null;
  } catch (error) {
    console.error('❌ Error getting user data:', error);
    return null;
  }
}

export async function getUserRole(userId: string): Promise<UserRole | null> {
  const userData = await getUserData(userId);
  return userData?.role || null;
}

export function onAuthChange(callback: (user: FirebaseUser | null) => void) {
  return onAuthStateChanged(auth, callback);
}

export async function isAdmin(userId: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role === 'admin';
}

export async function isClient(userId: string): Promise<boolean> {
  const role = await getUserRole(userId);
  return role === 'client';
}

/**
 * Updates user role - Admin only
 */
export async function updateUserRole(userId: string, newRole: UserRole): Promise<void> {
  try {
    const userRef = doc(db, COLLECTIONS.USERS, userId);
    await setDoc(userRef, { role: newRole, updatedAt: serverTimestamp() }, { merge: true });
    console.log('✅ User role updated:', userId, newRole);
  } catch (error) {
    console.error('❌ Error updating user role:', error);
    throw error;
  }
}
