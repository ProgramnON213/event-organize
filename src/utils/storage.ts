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

// Data Initializer
export const initializeStorage = () => {
  if (!localStorage.getItem(KEYS.AUTH)) localStorage.setItem(KEYS.AUTH, JSON.stringify(MOCK_AUTH));
  if (!localStorage.getItem(KEYS.STUDENT_PROFILES)) localStorage.setItem(KEYS.STUDENT_PROFILES, JSON.stringify(MOCK_STUDENTS));
  if (!localStorage.getItem(KEYS.ORGANIZER_PROFILES)) localStorage.setItem(KEYS.ORGANIZER_PROFILES, JSON.stringify(MOCK_ORGANIZERS));
  if (!localStorage.getItem(KEYS.ADMIN_PROFILES)) localStorage.setItem(KEYS.ADMIN_PROFILES, JSON.stringify(MOCK_ADMINS));
  if (!localStorage.getItem(KEYS.EVENTS)) localStorage.setItem(KEYS.EVENTS, JSON.stringify(MOCK_EVENTS));
  if (!localStorage.getItem(KEYS.REGISTRATIONS)) localStorage.setItem(KEYS.REGISTRATIONS, JSON.stringify(MOCK_REGISTRATIONS));
  if (!localStorage.getItem(KEYS.INBOX)) localStorage.setItem(KEYS.INBOX, JSON.stringify([]));
};

// Getters & Setters
export const getAuths = (): AuthAccount[] => JSON.parse(localStorage.getItem(KEYS.AUTH) || '[]');
const saveAuths = (auths: AuthAccount[]) => localStorage.setItem(KEYS.AUTH, JSON.stringify(auths));

export const getStudentProfiles = (): StudentProfile[] => JSON.parse(localStorage.getItem(KEYS.STUDENT_PROFILES) || '[]');
const saveStudentProfiles = (p: StudentProfile[]) => localStorage.setItem(KEYS.STUDENT_PROFILES, JSON.stringify(p));

export const getOrganizerProfiles = (): OrganizerProfile[] => JSON.parse(localStorage.getItem(KEYS.ORGANIZER_PROFILES) || '[]');
const saveOrganizerProfiles = (p: OrganizerProfile[]) => localStorage.setItem(KEYS.ORGANIZER_PROFILES, JSON.stringify(p));

export const getAdminProfiles = (): AdminProfile[] => JSON.parse(localStorage.getItem(KEYS.ADMIN_PROFILES) || '[]');
const saveAdminProfiles = (p: AdminProfile[]) => localStorage.setItem(KEYS.ADMIN_PROFILES, JSON.stringify(p));

export const getCurrentUser = (): User | null => JSON.parse(localStorage.getItem(KEYS.CURRENT_USER) || 'null');
export const setCurrentUser = (user: User | null) => localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));

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

export const getUsers = (): User[] => {
  const auths = getAuths();
  return auths.map(a => getUserById(a.id)).filter(u => u !== null) as User[];
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
  
  const token = Math.random().toString(36).substring(2) + Date.now().toString(36);
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
  auths[authIndex].role = newRole;
  saveAuths(auths);

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
export const getInbox = (): SimulatedEmail[] => JSON.parse(localStorage.getItem(KEYS.INBOX) || '[]');
export const sendSimulatedEmail = (to: string, subject: string, body: string) => {
  const inbox = getInbox();
  inbox.unshift({ id: `mail-${Date.now()}`, to, subject, body, timestamp: Date.now() });
  localStorage.setItem(KEYS.INBOX, JSON.stringify(inbox));
};

// Events
export const getEvents = (): Event[] => JSON.parse(localStorage.getItem(KEYS.EVENTS) || '[]');
export const saveEvents = (events: Event[]) => localStorage.setItem(KEYS.EVENTS, JSON.stringify(events));

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
    events[index].qrKey = Math.random().toString(36).substring(2, 8).toUpperCase();
    events[index].qrGeneratedAt = Date.now();
    saveEvents(events);
    return events[index].qrKey;
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
export const getRegistrations = (): Registration[] => JSON.parse(localStorage.getItem(KEYS.REGISTRATIONS) || '[]');
export const saveRegistrations = (registrations: Registration[]) => localStorage.setItem(KEYS.REGISTRATIONS, JSON.stringify(registrations));

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

