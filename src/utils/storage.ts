import type { AuthAccount, StudentProfile, OrganizerProfile, AdminProfile, User, Event, Registration, Role } from '../types';
import { MOCK_AUTH, MOCK_STUDENTS, MOCK_ORGANIZERS, MOCK_ADMINS, MOCK_EVENTS, MOCK_REGISTRATIONS } from './mockData';

export const KEYS = {
  AUTH: 'hcmut_auth',
  STUDENT_PROFILES: 'hcmut_student_profiles',
  ORGANIZER_PROFILES: 'hcmut_organizer_profiles',
  ADMIN_PROFILES: 'hcmut_admin_profiles',
  EVENTS: 'hcmut_events',
  REGISTRATIONS: 'hcmut_registrations',
  CURRENT_USER: 'hcmut_current_user',
  INBOX: 'hcmut_inbox'
};

// Utilities
export async function hashPassword(password: string): Promise<string> {
  const msgUint8 = new TextEncoder().encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
}

// In-memory cache layer to prevent repeated expensive localStorage reads/parses
interface StorageCache {
  auths?: AuthAccount[];
  students?: StudentProfile[];
  organizers?: OrganizerProfile[];
  admins?: AdminProfile[];
  events?: Event[];
  registrations?: Registration[];
  currentUser?: User | null;
  inbox?: SimulatedEmail[];
}

let cache: StorageCache = {};

export const invalidateCaches = () => {
  cache = {};
};

// Sync cache across tabs
if (typeof window !== 'undefined') {
  window.addEventListener('storage', () => {
    invalidateCaches();
  });
}

// Helper to notify other components of changes reactively
const notifyChange = (key: string) => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('hcmut_storage_change', { detail: { key } }));
  }
};

// Data Initializer
export const initializeStorage = () => {
  if (!localStorage.getItem(KEYS.AUTH)) localStorage.setItem(KEYS.AUTH, JSON.stringify(MOCK_AUTH));
  if (!localStorage.getItem(KEYS.STUDENT_PROFILES)) localStorage.setItem(KEYS.STUDENT_PROFILES, JSON.stringify(MOCK_STUDENTS));
  if (!localStorage.getItem(KEYS.ORGANIZER_PROFILES)) localStorage.setItem(KEYS.ORGANIZER_PROFILES, JSON.stringify(MOCK_ORGANIZERS));
  if (!localStorage.getItem(KEYS.ADMIN_PROFILES)) localStorage.setItem(KEYS.ADMIN_PROFILES, JSON.stringify(MOCK_ADMINS));
  if (!localStorage.getItem(KEYS.EVENTS)) localStorage.setItem(KEYS.EVENTS, JSON.stringify(MOCK_EVENTS));
  if (!localStorage.getItem(KEYS.REGISTRATIONS)) localStorage.setItem(KEYS.REGISTRATIONS, JSON.stringify(MOCK_REGISTRATIONS));
  if (!localStorage.getItem(KEYS.INBOX)) localStorage.setItem(KEYS.INBOX, JSON.stringify([]));
  invalidateCaches();
};

// Getters & Setters
export const getAuths = (): AuthAccount[] => {
  if (!cache.auths) {
    cache.auths = JSON.parse(localStorage.getItem(KEYS.AUTH) || '[]');
  }
  return cache.auths!;
};
const saveAuths = (auths: AuthAccount[]) => {
  localStorage.setItem(KEYS.AUTH, JSON.stringify(auths));
  cache.auths = auths;
  notifyChange(KEYS.AUTH);
};

export const getStudentProfiles = (): StudentProfile[] => {
  if (!cache.students) {
    cache.students = JSON.parse(localStorage.getItem(KEYS.STUDENT_PROFILES) || '[]');
  }
  return cache.students!;
};
const saveStudentProfiles = (p: StudentProfile[]) => {
  localStorage.setItem(KEYS.STUDENT_PROFILES, JSON.stringify(p));
  cache.students = p;
  notifyChange(KEYS.STUDENT_PROFILES);
};

export const getOrganizerProfiles = (): OrganizerProfile[] => {
  if (!cache.organizers) {
    cache.organizers = JSON.parse(localStorage.getItem(KEYS.ORGANIZER_PROFILES) || '[]');
  }
  return cache.organizers!;
};
const saveOrganizerProfiles = (p: OrganizerProfile[]) => {
  localStorage.setItem(KEYS.ORGANIZER_PROFILES, JSON.stringify(p));
  cache.organizers = p;
  notifyChange(KEYS.ORGANIZER_PROFILES);
};

export const getAdminProfiles = (): AdminProfile[] => {
  if (!cache.admins) {
    cache.admins = JSON.parse(localStorage.getItem(KEYS.ADMIN_PROFILES) || '[]');
  }
  return cache.admins!;
};
const saveAdminProfiles = (p: AdminProfile[]) => {
  localStorage.setItem(KEYS.ADMIN_PROFILES, JSON.stringify(p));
  cache.admins = p;
  notifyChange(KEYS.ADMIN_PROFILES);
};

export const getCurrentUser = (): User | null => {
  if (cache.currentUser === undefined) {
    cache.currentUser = JSON.parse(localStorage.getItem(KEYS.CURRENT_USER) || 'null');
  }
  return cache.currentUser || null;
};
export const setCurrentUser = (user: User | null) => {
  localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));
  cache.currentUser = user;
  notifyChange(KEYS.CURRENT_USER);
};

// Unified User Fetcher
export const getUserById = (id: string): User | null => {
  const auths = getAuths();
  const auth = auths.find(a => a.id === id);
  if (!auth) return null;

  if (auth.role === 'student') {
    const p = getStudentProfiles().find(s => s.id === id);
    return p ? { id: p.id, name: p.name, email: p.email, phone: p.phone, role: 'student' } : null;
  }
  if (auth.role === 'organizer') {
    const p = getOrganizerProfiles().find(s => s.id === id);
    return p ? { id: p.id, name: p.name, email: p.email, phone: p.phone, role: 'organizer' } : null;
  }
  if (auth.role === 'admin') {
    const p = getAdminProfiles().find(s => s.id === id);
    return p ? { id: p.id, name: p.name, role: 'admin' } : null; // Admin profile has no email or phone
  }
  return null;
};

// Optimized to run in O(N) by mapping in-memory rather than parsing LocalStorage O(N^2) times
export const getUsers = (): User[] => {
  const auths = getAuths();
  const students = getStudentProfiles();
  const organizers = getOrganizerProfiles();
  const admins = getAdminProfiles();

  const studentMap = new Map(students.map(s => [s.id, s]));
  const organizerMap = new Map(organizers.map(o => [o.id, o]));
  const adminMap = new Map(admins.map(a => [a.id, a]));

  return auths.map(auth => {
    if (auth.role === 'student') {
      const p = studentMap.get(auth.id);
      return p ? { id: p.id, name: p.name, email: p.email, phone: p.phone, role: 'student' as Role } as User : null;
    }
    if (auth.role === 'organizer') {
      const p = organizerMap.get(auth.id);
      return p ? { id: p.id, name: p.name, email: p.email, phone: p.phone, role: 'organizer' as Role } as User : null;
    }
    if (auth.role === 'admin') {
      const p = adminMap.get(auth.id);
      return p ? { id: p.id, name: p.name, role: 'admin' as Role } as User : null;
    }
    return null;
  }).filter((u): u is User => u !== null);
};

export const registerUser = (name: string, email: string, phone: string, passwordHash: string): boolean => {
  const auths = getAuths();
  if (auths.find(a => a.email === email)) return false; // Email exists
  
  const id = `u-${Date.now()}`;
  auths.push({ id, email, passwordHash, role: 'student' });
  saveAuths(auths);
  
  const students = getStudentProfiles();
  students.push({ id, name, email, phone });
  saveStudentProfiles(students);
  return true;
};

export const generateResetToken = (email: string): string | null => {
  const auths = getAuths();
  const index = auths.findIndex(a => a.email === email);
  if (index === -1) return null;
  
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  const token = Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
  
  auths[index].resetToken = token;
  saveAuths(auths);
  return token;
};

export const updatePassword = (resetToken: string, newPasswordHash: string): boolean => {
  const auths = getAuths();
  const index = auths.findIndex(a => a.resetToken === resetToken);
  if (index === -1) return false;
  
  auths[index].passwordHash = newPasswordHash;
  auths[index].resetToken = undefined; // Token dies out after use
  saveAuths(auths);
  return true;
};

// Backend Role Management
export const grantRole = (userId: string, newRole: Role, additionalData?: { name?: string, phone?: string, email?: string }) => {
  const auths = getAuths();
  const authIndex = auths.findIndex(a => a.id === userId);
  if (authIndex === -1) return;
  
  const oldRole = auths[authIndex].role;

  // We must extract name, phone, email from the old profile if available to copy over
  let name = additionalData?.name || 'Unknown User';
  let phone = additionalData?.phone || '';
  let email = additionalData?.email || auths[authIndex].email;

  const user = getUserById(userId);
  if (user) {
    if (!additionalData?.name) name = user.name;
    if (!additionalData?.phone && user.phone) phone = user.phone;
    if (!additionalData?.email && user.email) email = user.email;
  }

  auths[authIndex].role = newRole;
  saveAuths(auths);

  // Remove old profile
  if (oldRole === 'student') saveStudentProfiles(getStudentProfiles().filter(p => p.id !== userId));
  if (oldRole === 'organizer') saveOrganizerProfiles(getOrganizerProfiles().filter(p => p.id !== userId));
  if (oldRole === 'admin') saveAdminProfiles(getAdminProfiles().filter(p => p.id !== userId));

  // Add new profile according to strict structures
  if (newRole === 'student') {
    saveStudentProfiles([...getStudentProfiles(), { id: userId, name, phone, email }]);
  } else if (newRole === 'organizer') {
    saveOrganizerProfiles([...getOrganizerProfiles(), { id: userId, name, phone, email }]);
  } else if (newRole === 'admin') {
    saveAdminProfiles([...getAdminProfiles(), { id: userId, name }]);
  }
};

// Simulated Email
export interface SimulatedEmail {
  id: string;
  to: string;
  subject: string;
  body: string;
  timestamp: number;
}
export const getInbox = (): SimulatedEmail[] => {
  if (!cache.inbox) {
    cache.inbox = JSON.parse(localStorage.getItem(KEYS.INBOX) || '[]');
  }
  return cache.inbox!;
};
export const sendSimulatedEmail = (to: string, subject: string, body: string) => {
  const inbox = getInbox();
  const newInbox = [{ id: `mail-${Date.now()}`, to, subject, body, timestamp: Date.now() }, ...inbox];
  localStorage.setItem(KEYS.INBOX, JSON.stringify(newInbox));
  cache.inbox = newInbox;
  notifyChange(KEYS.INBOX);
};

// Events
export const getEvents = (): Event[] => {
  if (!cache.events) {
    cache.events = JSON.parse(localStorage.getItem(KEYS.EVENTS) || '[]');
  }
  return cache.events!;
};
export const saveEvents = (events: Event[]) => {
  localStorage.setItem(KEYS.EVENTS, JSON.stringify(events));
  cache.events = events;
  notifyChange(KEYS.EVENTS);
};

export const createEvent = (event: Omit<Event, 'id' | 'status'>) => {
  const events = getEvents();
  const newEvent: Event = { ...event, id: `e-${Date.now()}`, status: 'pending' };
  saveEvents([...events, newEvent]);
  return newEvent;
};

export const updateEventStatus = (eventId: string, status: 'approved' | 'rejected') => {
  const events = getEvents();
  const index = events.findIndex(e => e.id === eventId);
  if (index !== -1) {
    events[index].status = status;
    saveEvents(events);
  }
};

export const refreshEventQr = (eventId: string) => {
  const events = getEvents();
  const index = events.findIndex(e => e.id === eventId);
  if (index !== -1) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const array = new Uint32Array(6);
    crypto.getRandomValues(array);
    const key = Array.from(array, val => chars[val % chars.length]).join('');
    
    events[index].qrKey = key;
    events[index].qrGeneratedAt = Date.now();
    saveEvents(events);
    return key;
  }
  return null;
};

export const updateEvent = (eventId: string, updatedFields: Partial<Omit<Event, 'id' | 'organizerId'>>) => {
  const events = getEvents();
  const index = events.findIndex(e => e.id === eventId);
  if (index !== -1) {
    events[index] = { ...events[index], ...updatedFields, status: 'pending' };
    saveEvents(events);
  }
};

// Registrations
export const getRegistrations = (): Registration[] => {
  if (!cache.registrations) {
    cache.registrations = JSON.parse(localStorage.getItem(KEYS.REGISTRATIONS) || '[]');
  }
  return cache.registrations!;
};
export const saveRegistrations = (registrations: Registration[]) => {
  localStorage.setItem(KEYS.REGISTRATIONS, JSON.stringify(registrations));
  cache.registrations = registrations;
  notifyChange(KEYS.REGISTRATIONS);
};

export const registerForEvent = (studentId: string, eventId: string) => {
  const regs = getRegistrations();
  if (regs.find(r => r.studentId === studentId && r.eventId === eventId)) return;
  saveRegistrations([...regs, { id: `r-${Date.now()}`, studentId, eventId, registeredAt: Date.now() }]);
};

export const checkInStudent = (studentId: string, eventId: string, providedQrKey: string): boolean => {
  const events = getEvents();
  const event = events.find(e => e.id === eventId);
  if (!event || event.qrKey !== providedQrKey) return false;

  const regs = getRegistrations();
  const regIndex = regs.findIndex(r => r.studentId === studentId && r.eventId === eventId);
  if (regIndex !== -1) {
    regs[regIndex].checkInTime = Date.now();
    saveRegistrations(regs);
    return true;
  }
  return false;
};

export const checkOutStudent = (studentId: string, eventId: string, providedQrKey: string): boolean => {
  const events = getEvents();
  const event = events.find(e => e.id === eventId);
  if (!event || event.qrKey !== providedQrKey) return false;

  const regs = getRegistrations();
  const regIndex = regs.findIndex(r => r.studentId === studentId && r.eventId === eventId);
  if (regIndex !== -1 && regs[regIndex].checkInTime) {
    regs[regIndex].checkOutTime = Date.now();
    saveRegistrations(regs);
    return true;
  }
  return false;
};

