import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

/**
 * Trigger when a new user is created via Firebase Auth
 * This ensures user data is properly initialized
 */
export const onUserCreated = functions.auth.user().onCreate(async (user: functions.auth.UserRecord) => {
  try {
    const { uid, email, displayName } = user;

    // Check if user document already exists
    const userDoc = await admin.firestore().collection('users').doc(uid).get();

    if (!userDoc.exists) {
      // Create user document with default data
      await admin.firestore().collection('users').doc(uid).set({
        id: uid,
        email: email || '',
        name: displayName || 'User',
        role: 'client', // Default role
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });

      console.log(`Created user document for ${uid}`);
    }

    return null;
  } catch (error) {
    console.error('Error in onUserCreated:', error);
    return null;
  }
});
