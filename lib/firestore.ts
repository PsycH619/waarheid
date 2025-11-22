import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  QueryConstraint,
  DocumentData,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import type {
  User,
  Project,
  Conversation,
  Message,
  Appointment,
  ProjectActivity,
  ContactFormSubmission,
} from '@/types';

// Collection names
export const COLLECTIONS = {
  USERS: 'users',
  PROJECTS: 'projects',
  PROJECT_ACTIVITIES: 'projectActivities',
  CONVERSATIONS: 'conversations',
  MESSAGES: 'messages',
  APPOINTMENTS: 'appointments',
  CONTACT_SUBMISSIONS: 'contactSubmissions',
  AI_CONVERSATIONS: 'aiConversations',
} as const;

// Helper to get server timestamp
export const getServerTimestamp = () => serverTimestamp();

// Generic Firestore helpers
export async function getDocument<T>(collectionName: string, docId: string): Promise<T | null> {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as T;
    }
    return null;
  } catch (error) {
    console.error('Error getting document:', error);
    throw error;
  }
}

export async function getDocuments<T>(
  collectionName: string,
  constraints: QueryConstraint[] = []
): Promise<T[]> {
  try {
    const q = query(collection(db, collectionName), ...constraints);
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];
  } catch (error) {
    console.error('Error getting documents:', error);
    throw error;
  }
}

export async function createDocument<T>(
  collectionName: string,
  data: Omit<T, 'id'>
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error creating document:', error);
    throw error;
  }
}

export async function updateDocument(
  collectionName: string,
  docId: string,
  data: Partial<DocumentData>
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error('Error updating document:', error);
    throw error;
  }
}

export async function deleteDocument(
  collectionName: string,
  docId: string
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error('Error deleting document:', error);
    throw error;
  }
}

// Subscribe to real-time updates
export function subscribeToDocument<T>(
  collectionName: string,
  docId: string,
  callback: (data: T | null) => void
): () => void {
  const docRef = doc(db, collectionName, docId);

  return onSnapshot(docRef, (snapshot) => {
    if (snapshot.exists()) {
      callback({ id: snapshot.id, ...snapshot.data() } as T);
    } else {
      callback(null);
    }
  });
}

export function subscribeToCollection<T>(
  collectionName: string,
  constraints: QueryConstraint[],
  callback: (data: T[]) => void
): () => void {
  const q = query(collection(db, collectionName), ...constraints);

  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as T[];
    callback(data);
  });
}

// Specific collection helpers
export const userService = {
  get: (userId: string) => getDocument<User>(COLLECTIONS.USERS, userId),
  getAll: () => getDocuments<User>(COLLECTIONS.USERS),
  create: (data: Omit<User, 'id'>) => createDocument<User>(COLLECTIONS.USERS, data),
  update: (userId: string, data: Partial<User>) =>
    updateDocument(COLLECTIONS.USERS, userId, data),
};

export const projectService = {
  get: (projectId: string) => getDocument<Project>(COLLECTIONS.PROJECTS, projectId),
  getAll: () => getDocuments<Project>(COLLECTIONS.PROJECTS, [orderBy('createdAt', 'desc')]),
  getByClient: (clientId: string) =>
    getDocuments<Project>(COLLECTIONS.PROJECTS, [
      where('clientId', '==', clientId),
      orderBy('createdAt', 'desc'),
    ]),
  create: (data: Omit<Project, 'id'>) => createDocument<Project>(COLLECTIONS.PROJECTS, data),
  update: (projectId: string, data: Partial<Project>) =>
    updateDocument(COLLECTIONS.PROJECTS, projectId, data),
  delete: (projectId: string) => deleteDocument(COLLECTIONS.PROJECTS, projectId),
};

export const activityService = {
  getByProject: (projectId: string) =>
    getDocuments<ProjectActivity>(COLLECTIONS.PROJECT_ACTIVITIES, [
      where('projectId', '==', projectId),
      orderBy('createdAt', 'desc'),
      limit(50),
    ]),
  create: (data: Omit<ProjectActivity, 'id'>) =>
    createDocument<ProjectActivity>(COLLECTIONS.PROJECT_ACTIVITIES, data),
};

export const conversationService = {
  get: (conversationId: string) =>
    getDocument<Conversation>(COLLECTIONS.CONVERSATIONS, conversationId),
  getAll: () =>
    getDocuments<Conversation>(COLLECTIONS.CONVERSATIONS, [
      orderBy('updatedAt', 'desc'),
    ]),
  getByClient: (clientId: string) =>
    getDocuments<Conversation>(COLLECTIONS.CONVERSATIONS, [
      where('clientId', '==', clientId),
      orderBy('updatedAt', 'desc'),
    ]),
  create: (data: Omit<Conversation, 'id'>) =>
    createDocument<Conversation>(COLLECTIONS.CONVERSATIONS, data),
  update: (conversationId: string, data: Partial<Conversation>) =>
    updateDocument(COLLECTIONS.CONVERSATIONS, conversationId, data),
  subscribe: (conversationId: string, callback: (data: Conversation | null) => void) =>
    subscribeToDocument<Conversation>(COLLECTIONS.CONVERSATIONS, conversationId, callback),
};

export const messageService = {
  getByConversation: (conversationId: string) =>
    getDocuments<Message>(COLLECTIONS.MESSAGES, [
      where('conversationId', '==', conversationId),
      orderBy('createdAt', 'asc'),
    ]),
  create: async (data: Omit<Message, 'id'>) => {
    const messageId = await createDocument<Message>(COLLECTIONS.MESSAGES, data);

    // Update conversation's last message
    await updateDocument(COLLECTIONS.CONVERSATIONS, data.conversationId, {
      lastMessage: data.text,
      lastMessageAt: serverTimestamp(),
    });

    return messageId;
  },
  subscribe: (conversationId: string, callback: (data: Message[]) => void) =>
    subscribeToCollection<Message>(
      COLLECTIONS.MESSAGES,
      [
        where('conversationId', '==', conversationId),
        orderBy('createdAt', 'asc'),
      ],
      callback
    ),
};

export const appointmentService = {
  get: (appointmentId: string) =>
    getDocument<Appointment>(COLLECTIONS.APPOINTMENTS, appointmentId),
  getAll: () =>
    getDocuments<Appointment>(COLLECTIONS.APPOINTMENTS, [
      orderBy('startTime', 'desc'),
    ]),
  getByClient: (clientId: string) =>
    getDocuments<Appointment>(COLLECTIONS.APPOINTMENTS, [
      where('clientId', '==', clientId),
      orderBy('startTime', 'desc'),
    ]),
  getUpcoming: () =>
    getDocuments<Appointment>(COLLECTIONS.APPOINTMENTS, [
      where('startTime', '>=', Timestamp.now()),
      where('status', '==', 'scheduled'),
      orderBy('startTime', 'asc'),
    ]),
  create: (data: Omit<Appointment, 'id'>) =>
    createDocument<Appointment>(COLLECTIONS.APPOINTMENTS, data),
  update: (appointmentId: string, data: Partial<Appointment>) =>
    updateDocument(COLLECTIONS.APPOINTMENTS, appointmentId, data),
  delete: (appointmentId: string) => deleteDocument(COLLECTIONS.APPOINTMENTS, appointmentId),
};

export const contactService = {
  create: (data: Omit<ContactFormSubmission, 'id'>) =>
    createDocument<ContactFormSubmission>(COLLECTIONS.CONTACT_SUBMISSIONS, data),
  getAll: () =>
    getDocuments<ContactFormSubmission>(COLLECTIONS.CONTACT_SUBMISSIONS, [
      orderBy('createdAt', 'desc'),
    ]),
};
