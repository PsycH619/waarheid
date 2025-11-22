import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { google } from 'googleapis';

/**
 * Create Google Meet link for an appointment
 * This function uses Google Calendar API with a service account
 */
export const createGoogleMeeting = functions.https.onCall(
  async (data: { appointmentId: string }, context) => {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated'
      );
    }

    const { appointmentId } = data;

    if (!appointmentId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Appointment ID is required'
      );
    }

    try {
      // Get appointment details
      const appointmentDoc = await admin
        .firestore()
        .collection('appointments')
        .doc(appointmentId)
        .get();

      if (!appointmentDoc.exists) {
        throw new functions.https.HttpsError(
          'not-found',
          'Appointment not found'
        );
      }

      const appointment = appointmentDoc.data();

      if (!appointment) {
        throw new functions.https.HttpsError(
          'internal',
          'Invalid appointment data'
        );
      }

      // Set up Google Calendar API with service account
      // Note: You need to set up a service account in Google Cloud Console
      // and share your calendar with the service account email
      const serviceAccountEmail = functions.config().google?.service_account_email;
      const privateKey = functions.config().google?.private_key?.replace(/\\n/g, '\n');

      if (!serviceAccountEmail || !privateKey) {
        console.error('Google service account credentials not configured');
        // For development/testing, return success without creating Meet link
        return {
          success: false,
          message: 'Google Meet integration not configured. Please set up service account credentials.',
        };
      }

      const auth = new google.auth.JWT({
        email: serviceAccountEmail,
        key: privateKey,
        scopes: ['https://www.googleapis.com/auth/calendar'],
      });

      const calendar = google.calendar({ version: 'v3', auth });

      // Create calendar event with Google Meet
      const event = {
        summary: appointment.title,
        description: appointment.description || 'MarketPro Consultation',
        start: {
          dateTime: appointment.startTime.toDate().toISOString(),
          timeZone: 'America/New_York', // Adjust to your timezone
        },
        end: {
          dateTime: appointment.endTime.toDate().toISOString(),
          timeZone: 'America/New_York',
        },
        attendees: [
          { email: appointment.clientEmail },
          // Add admin/team member emails here if needed
        ],
        conferenceData: {
          createRequest: {
            requestId: appointmentId,
            conferenceSolutionKey: { type: 'hangoutsMeet' },
          },
        },
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 1 day before
            { method: 'popup', minutes: 30 }, // 30 minutes before
          ],
        },
      };

      const calendarResponse = await calendar.events.insert({
        calendarId: 'primary', // Use your calendar ID
        conferenceDataVersion: 1,
        requestBody: event,
        sendUpdates: 'all', // Send email notifications to attendees
      });

      const meetLink = calendarResponse.data.hangoutLink;
      const eventId = calendarResponse.data.id;

      // Update appointment with Google Meet link
      await admin
        .firestore()
        .collection('appointments')
        .doc(appointmentId)
        .update({
          googleMeetLink: meetLink,
          googleEventId: eventId,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      return {
        success: true,
        meetLink,
        eventId,
      };
    } catch (error: any) {
      console.error('Error creating Google Meet:', error);

      // Update appointment with error status but don't fail
      await admin
        .firestore()
        .collection('appointments')
        .doc(appointmentId)
        .update({
          meetLinkError: error.message,
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        });

      throw new functions.https.HttpsError(
        'internal',
        `Failed to create Google Meet link: ${error.message}`
      );
    }
  }
);
