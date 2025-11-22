import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(
  functions.config().gemini?.key || process.env.GEMINI_API_KEY || ''
);

interface AIChatRequest {
  message: string;
  userId: string;
  conversationHistory?: Array<{ role: string; content: string }>;
}

/**
 * AI Chatbot Cloud Function
 * Provides AI-powered support to clients using Google Gemini
 */
export const aiChatbot = functions.https.onCall(
  async (data: AIChatRequest, context: functions.https.CallableContext) => {
    // Verify authentication
    if (!context.auth) {
      throw new functions.https.HttpsError(
        'unauthenticated',
        'User must be authenticated to use AI chatbot'
      );
    }

    const { message, userId, conversationHistory = [] } = data;

    if (!message) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Message is required'
      );
    }

    try {
      // Get user data for context
      const userDoc = await admin
        .firestore()
        .collection('users')
        .doc(userId)
        .get();

      const userData = userDoc.data();

      // Get user's projects for context
      const projectsSnapshot = await admin
        .firestore()
        .collection('projects')
        .where('clientId', '==', userId)
        .get();

      const projects = projectsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Build context-aware system instruction
      const systemInstruction = `You are a helpful AI assistant for MarketPro, a marketing agency.
You are assisting ${userData?.name || 'a client'} who is a client of our agency.
${
  projects.length > 0
    ? `They have ${projects.length} project(s) with us: ${projects
      .map((p: any) => p.title)
      .join(', ')}.`
    : 'They are a new client exploring our services.'
}

Your role is to:
1. Answer questions about marketing strategies and our services
2. Help with project-related queries
3. Provide general support and guidance
4. Be friendly, professional, and helpful

If you need specific account details or want to make changes, politely ask the user to contact their account manager or use the support chat.`;

      // Build conversation history for Gemini
      // Gemini requires history to start with 'user', so filter accordingly
      const chatHistory = conversationHistory
        .map((msg: any) => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        }))
        .filter((msg, index, arr) => {
          // Remove first message if it's from model (Gemini requirement)
          if (index === 0 && msg.role === 'model') return false;
          return true;
        });

      // Initialize Gemini model
      const model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash-lite',
        systemInstruction,
      });

      // Start chat with history
      const chat = model.startChat({
        history: chatHistory,
      });

      // Send message and get response
      const result = await chat.sendMessage(message);
      const aiResponse = result.response.text() ||
        'I apologize, but I encountered an error. Please try again or contact support.';

      // Log the conversation to Firestore for analysis
      await admin.firestore().collection('aiConversations').add({
        userId,
        userMessage: message,
        aiResponse,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        model: 'gemini-2.5-flash-lite',
      });

      return {
        success: true,
        response: aiResponse,
      };
    } catch (error: any) {
      console.error('AI Chatbot Error:', error);

      // Return a graceful error message
      return {
        success: false,
        response: 'I apologize, but I\'m having trouble processing your request right now. Please try using the support chat to speak with our team directly.',
        error: error.message,
      };
    }
  }
);
