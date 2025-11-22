'use client';

import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import ChatWidget from '@/components/chat/ChatWidget';

export default function ClientChatPage() {
  return (
    <ProtectedRoute requiredRole="client">
      <DashboardLayout role="client">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Support Chat</h1>
          <p className="text-gray-600 mb-8">
            Get help from our support team. We're here to assist you with your projects and answer any questions.
          </p>

          <div className="bg-white rounded-lg shadow-md p-6">
            <p className="text-gray-700">
              Use the chat widget in the bottom right corner to start a conversation with our support team.
            </p>
          </div>
        </div>
        <ChatWidget />
      </DashboardLayout>
    </ProtectedRoute>
  );
}
