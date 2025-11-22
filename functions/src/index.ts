import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

// Export all functions
export { aiChatbot } from './aiChatbot';
export { createGoogleMeeting } from './bookingWithMeet';
export { onUserCreated } from './userTriggers';
