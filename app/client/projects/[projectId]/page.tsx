'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import DashboardLayout from '@/components/layout/DashboardLayout';
import Card, { CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';
import { projectService, activityService, messageService, conversationService } from '@/lib/firestore';
import { useAuth } from '@/lib/hooks/useAuth';
import type { Project, ProjectActivity, Message } from '@/types';
import { formatDate, formatCurrency, formatRelativeTime } from '@/utils/formatters';
import {
  ArrowLeft,
  Calendar,
  DollarSign,
  FileText,
  MessageSquare,
  Activity,
  Send,
} from 'lucide-react';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function ClientProjectDetailPage() {
  const params = useParams();
  const projectId = params.projectId as string;
  const { userData } = useAuth();

  const [project, setProject] = useState<Project | null>(null);
  const [activities, setActivities] = useState<ProjectActivity[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    if (projectId) {
      loadProjectData();
    }
  }, [projectId]);

  const loadProjectData = async () => {
    try {
      const [projectData, activitiesData] = await Promise.all([
        projectService.get(projectId),
        activityService.getByProject(projectId),
      ]);

      setProject(projectData);
      setActivities(activitiesData);

      // Load or create conversation for this project
      if (userData) {
        const conversations = await conversationService.getByClient(userData.id);
        const projectConversation = conversations.find(
          (c) => c.projectId === projectId && !c.isClosed
        );

        if (projectConversation) {
          setConversationId(projectConversation.id);
          loadMessages(projectConversation.id);
        }
      }
    } catch (error) {
      console.error('Error loading project:', error);
      toast.error('Failed to load project details');
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = (convId: string) => {
    const unsubscribe = messageService.subscribe(convId, (msgs) => {
      setMessages(msgs);
    });

    return unsubscribe;
  };

  const createConversation = async () => {
    if (!userData) return null;

    try {
      const convId = await conversationService.create({
        clientId: userData.id,
        projectId,
        isClosed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      setConversationId(convId);
      loadMessages(convId);
      return convId;
    } catch (error) {
      console.error('Error creating conversation:', error);
      toast.error('Failed to start conversation');
      return null;
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || !userData) return;

    let convId = conversationId;

    // Create conversation if it doesn't exist
    if (!convId) {
      convId = await createConversation();
      if (!convId) return;
    }

    setSendingMessage(true);

    try {
      await messageService.create({
        conversationId: convId,
        senderId: userData.id,
        senderName: userData.name,
        senderType: 'client',
        text: newMessage.trim(),
        createdAt: new Date(),
      });

      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in_progress':
        return 'info';
      case 'on_hold':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'created':
      case 'updated':
        return <FileText className="h-4 w-4" />;
      case 'status_change':
        return <Activity className="h-4 w-4" />;
      case 'comment':
        return <MessageSquare className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <ProtectedRoute requiredRole="client">
        <DashboardLayout role="client">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  if (!project) {
    return (
      <ProtectedRoute requiredRole="client">
        <DashboardLayout role="client">
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-500">Project not found</p>
              <Link href="/client/projects">
                <Button variant="outline" className="mt-4">
                  Back to Projects
                </Button>
              </Link>
            </div>
          </Card>
        </DashboardLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredRole="client">
      <DashboardLayout role="client">
        <div className="space-y-6">
          {/* Header */}
          <div>
            <Link
              href="/client/projects"
              className="inline-flex items-center text-primary-600 hover:text-primary-700 mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Link>

            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{project.title}</h1>
                <p className="text-gray-600 mt-2">{project.description}</p>
              </div>
              <Badge variant={getStatusBadgeVariant(project.status)}>
                {project.status.replace('_', ' ')}
              </Badge>
            </div>
          </div>

          {/* Project Info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {project.budget && (
              <Card>
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-green-100 text-green-600 mr-4">
                    <DollarSign className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Budget</p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatCurrency(project.budget)}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            {project.deadline && (
              <Card>
                <div className="flex items-center">
                  <div className="p-3 rounded-lg bg-blue-100 text-blue-600 mr-4">
                    <Calendar className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Deadline</p>
                    <p className="text-xl font-bold text-gray-900">
                      {formatDate(project.deadline)}
                    </p>
                  </div>
                </div>
              </Card>
            )}

            <Card>
              <div className="flex items-center">
                <div className="p-3 rounded-lg bg-purple-100 text-purple-600 mr-4">
                  <Activity className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Last Updated</p>
                  <p className="text-lg font-bold text-gray-900">
                    {formatRelativeTime(project.updatedAt)}
                  </p>
                </div>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Activity Timeline */}
            <Card>
              <CardHeader>
                <CardTitle>Activity Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                {activities.length === 0 ? (
                  <p className="text-gray-500 text-sm">No activity yet</p>
                ) : (
                  <div className="space-y-4">
                    {activities.map((activity) => (
                      <div key={activity.id} className="flex gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary-100 text-primary-600 flex items-center justify-center">
                          {getActivityIcon(activity.type)}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm text-gray-900">{activity.message}</p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatRelativeTime(activity.createdAt)}
                            {activity.userName && ` • ${activity.userName}`}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Project Chat */}
            <Card>
              <CardHeader>
                <CardTitle>Project Discussion</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Messages */}
                  <div className="h-64 overflow-y-auto border border-gray-200 rounded-lg p-4 space-y-3">
                    {messages.length === 0 ? (
                      <p className="text-gray-500 text-sm text-center">
                        No messages yet. Start the conversation!
                      </p>
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
                                  : 'bg-gray-100 text-gray-900'
                              }`}
                            >
                              {!isOwnMessage && (
                                <p className="text-xs font-semibold mb-1">
                                  {message.senderName}
                                </p>
                              )}
                              <p className="text-sm">{message.text}</p>
                              <p
                                className={`text-xs mt-1 ${
                                  isOwnMessage ? 'text-primary-100' : 'text-gray-500'
                                }`}
                              >
                                {formatRelativeTime(message.createdAt)}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>

                  {/* Message Input */}
                  <form onSubmit={handleSendMessage} className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      disabled={sendingMessage}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-sm"
                    />
                    <Button type="submit" disabled={sendingMessage || !newMessage.trim()}>
                      <Send className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}
