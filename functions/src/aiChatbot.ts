import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import OpenAI from 'openai';

// Initialize OpenAI (you can also use Gemini/Anthropic)
const openai = new OpenAI({
  apiKey: functions.config().openai?.key || process.env.OPENAI_API_KEY,
});

interface AIChatRequest {
  message: string;
  userId: string;
  conversationHistory?: Array<{ role: string; content: string }>;
}

/**
 * AI Chatbot Cloud Function
 * Provides AI-powered support to clients
 */
export const aiChatbot = functions.https.onCall(
  async (data: AIChatRequest, context) => {
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

      // Build context-aware system message
      const systemMessage = `You are a helpful AI assistant for MarketPro, a marketing agency.
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

      // Build messages array for OpenAI
      const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
        { role: 'system', content: systemMessage },
        ...conversationHistory.map((msg: any) => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        })),
        { role: 'user', content: message },
      ];

      // Call OpenAI API
      const completion = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages,
        temperature: 0.7,
        max_tokens: 500,
      });

      const aiResponse = completion.choices[0]?.message?.content ||
        'I apologize, but I encountered an error. Please try again or contact support.';

      // Log the conversation to Firestore for analysis
      await admin.firestore().collection('aiConversations').add({
        userId,
        userMessage: message,
        aiResponse,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        model: 'gpt-3.5-turbo',
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
