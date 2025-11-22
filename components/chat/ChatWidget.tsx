'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/hooks/useAuth';
import { conversationService, messageService } from '@/lib/firestore';
import type { Conversation, Message } from '@/types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { MessageSquare, X, Send } from 'lucide-react';
import { formatTime } from '@/utils/formatters';

export default function ChatWidget() {
  const { userData } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && userData) {
      loadOrCreateConversation();
    }
  }, [isOpen, userData]);

  useEffect(() => {
    if (conversation) {
      const unsubscribe = messageService.subscribe(conversation.id, setMessages);
      return () => unsubscribe();
    }
  }, [conversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadOrCreateConversation = async () => {
    if (!userData) return;

    try {
      // Get or create a conversation for this client
      const conversations = await conversationService.getByClient(userData.id);

      if (conversations.length > 0) {
        const activeConv = conversations.find((c) => !c.isClosed) || conversations[0];
        setConversation(activeConv);
      } else {
        // Create new conversation
        const convId = await conversationService.create({
          clientId: userData.id,
          isClosed: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        const newConv = await conversationService.get(convId);
        setConversation(newConv);
      }
    } catch (error) {
      console.error('Error loading conversation:', error);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !conversation || !userData) return;

    setLoading(true);
    try {
      await messageService.create({
        conversationId: conversation.id,
        senderId: userData.id,
        senderName: userData.name,
        senderType: 'client',
        text: newMessage.trim(),
        createdAt: new Date(),
      });
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary-600 text-white rounded-full shadow-lg hover:bg-primary-700 transition-colors flex items-center justify-center z-50"
      >
        <MessageSquare className="h-6 w-6" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-white rounded-lg shadow-2xl flex flex-col z-50 border border-gray-200">
      {/* Header */}
      <div className="bg-primary-600 text-white p-4 rounded-t-lg flex items-center justify-between">
        <div className="flex items-center">
          <MessageSquare className="h-5 w-5 mr-2" />
          <h3 className="font-semibold">Support Chat</h3>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white hover:text-gray-200"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <p>No messages yet. Start a conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isOwnMessage = message.senderId === userData?.id;
            return (
              <div
                key={message.id}
                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] rounded-lg p-3 ${
                    isOwnMessage
                      ? 'bg-primary-600 text-white'
                      : message.senderType === 'ai'
                      ? 'bg-purple-100 text-gray-900'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  {!isOwnMessage && (
                    <p className="text-xs font-semibold mb-1">
                      {message.senderType === 'ai' ? 'AI Assistant' : message.senderName}
                    </p>
                  )}
                  <p className="text-sm">{message.text}</p>
                  <p
                    className={`text-xs mt-1 ${
                      isOwnMessage ? 'text-primary-100' : 'text-gray-500'
                    }`}
                  >
                    {formatTime(message.createdAt)}
                  </p>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type your message..."
            disabled={loading}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
          />
          <Button type="submit" disabled={loading || !newMessage.trim()} size="sm">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  );
}
