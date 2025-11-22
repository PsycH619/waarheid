'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Send, Bot, User } from 'lucide-react';
import { httpsCallable } from 'firebase/functions';
import { functions } from '@/lib/firebase';
import toast from 'react-hot-toast';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function AIAssistantPage() {
  const { userData } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Hello! I\'m your AI marketing assistant. How can I help you today?',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!input.trim() || !userData) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message to chat
    const newMessages: ChatMessage[] = [
      ...messages,
      { role: 'user', content: userMessage },
    ];
    setMessages(newMessages);

    setLoading(true);

    try {
      // Call AI chatbot Cloud Function
      const aiChatbot = httpsCallable(functions, 'aiChatbot');
      const response = await aiChatbot({
        message: userMessage,
        userId: userData.id,
        conversationHistory: messages.slice(-5), // Send last 5 messages for context
      });

      const data = response.data as { success: boolean; response: string; error?: string };

      if (data.success) {
        setMessages([
          ...newMessages,
          { role: 'assistant', content: data.response },
        ]);
      } else {
        toast.error(data.error || 'AI assistant is unavailable');
        setMessages([
          ...newMessages,
          {
            role: 'assistant',
            content: 'I\'m sorry, I\'m having trouble responding right now. Please try using the support chat instead.',
          },
        ]);
      }
    } catch (error: any) {
      console.error('Error calling AI chatbot:', error);
      toast.error('Failed to get AI response');
      setMessages([
        ...newMessages,
        {
          role: 'assistant',
          content: 'I apologize, but I encountered an error. Please try again or use the support chat.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute requiredRole="client">
      <DashboardLayout role="client">
        <div className="max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Bot className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <CardTitle>AI Marketing Assistant</CardTitle>
                  <p className="text-sm text-gray-500 mt-1">
                    Get instant answers about marketing strategies and your projects
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {/* Chat Messages */}
              <div className="space-y-4 mb-6 h-[500px] overflow-y-auto">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`flex gap-3 ${
                      message.role === 'user' ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    {message.role === 'assistant' && (
                      <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <Bot className="h-4 w-4 text-purple-600" />
                      </div>
                    )}
                    <div
                      className={`max-w-[70%] rounded-lg p-4 ${
                        message.role === 'user'
                          ? 'bg-primary-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    </div>
                    {message.role === 'user' && (
                      <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-primary-600" />
                      </div>
                    )}
                  </div>
                ))}

                {loading && (
                  <div className="flex gap-3 justify-start">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <Bot className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="bg-gray-100 rounded-lg p-4">
                      <div className="flex gap-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Input Form */}
              <form onSubmit={handleSend} className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything about marketing..."
                  disabled={loading}
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50"
                />
                <Button
                  type="submit"
                  disabled={loading || !input.trim()}
                  size="lg"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </form>

              {/* Suggested Questions */}
              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-2">Suggested questions:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    'What marketing services do you offer?',
                    'How can I improve my social media presence?',
                    'What are my current projects?',
                  ].map((question, index) => (
                    <button
                      key={index}
                      onClick={() => setInput(question)}
                      disabled={loading}
                      className="text-xs px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-700 transition-colors disabled:opacity-50"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
