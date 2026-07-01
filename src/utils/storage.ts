import type { User, Event, Registration } from '../types';
import { MOCK_USERS, MOCK_EVENTS, MOCK_REGISTRATIONS } from './mockData';

const KEYS = {
  USERS: 'hcmut_users',
  EVENTS: 'hcmut_events',
  REGISTRATIONS: 'hcmut_registrations',
  CURRENT_USER: 'hcmut_current_user'
};

// Initialize default data if empty
export const initializeStorage = () => {
  if (!localStorage.getItem(KEYS.USERS)) {
    localStorage.setItem(KEYS.USERS, JSON.stringify(MOCK_USERS));
  }
  if (!localStorage.getItem(KEYS.EVENTS)) {
    localStorage.setItem(KEYS.EVENTS, JSON.stringify(MOCK_EVENTS));
  }
  if (!localStorage.getItem(KEYS.REGISTRATIONS)) {
    localStorage.setItem(KEYS.REGISTRATIONS, JSON.stringify(MOCK_REGISTRATIONS));
  }
  if (!localStorage.getItem(KEYS.CURRENT_USER)) {
    localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(MOCK_USERS[0]));
  }
};

// Users
export const getUsers = (): User[] => JSON.parse(localStorage.getItem(KEYS.USERS) || '[]');
export const getCurrentUser = (): User => JSON.parse(localStorage.getItem(KEYS.CURRENT_USER) || 'null');
export const setCurrentUser = (user: User) => localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(user));

// Events
export const getEvents = (): Event[] => JSON.parse(localStorage.getItem(KEYS.EVENTS) || '[]');
export const saveEvents = (events: Event[]) => localStorage.setItem(KEYS.EVENTS, JSON.stringify(events));

export const createEvent = (event: Omit<Event, 'id' | 'status'>) => {
  const events = getEvents();
  const newEvent: Event = {
    ...event,
    id: `e-${Date.now()}`,
    status: 'pending'
  };
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
    // Generate a new random QR key (e.g. 6 chars hex)
    events[index].qrKey = Math.random().toString(36).substring(2, 8).toUpperCase();
    events[index].qrGeneratedAt = Date.now();
    saveEvents(events);
    return events[index].qrKey;
  }
  return null;
};

// Registrations
export const getRegistrations = (): Registration[] => JSON.parse(localStorage.getItem(KEYS.REGISTRATIONS) || '[]');
export const saveRegistrations = (registrations: Registration[]) => localStorage.setItem(KEYS.REGISTRATIONS, JSON.stringify(registrations));

export const registerForEvent = (studentId: string, eventId: string) => {
  const regs = getRegistrations();
  if (regs.find(r => r.studentId === studentId && r.eventId === eventId)) return; // Already registered
  const newReg: Registration = {
    id: `r-${Date.now()}`,
    studentId,
    eventId,
    registeredAt: Date.now()
  };
  saveRegistrations([...regs, newReg]);
};

export const unregisterFromEvent = (studentId: string, eventId: string) => {
  const regs = getRegistrations();
  saveRegistrations(regs.filter(r => !(r.studentId === studentId && r.eventId === eventId)));
};

export const checkInStudent = (studentId: string, eventId: string, providedQrKey: string): boolean => {
  const events = getEvents();
  const event = events.find(e => e.id === eventId);
  if (!event || event.qrKey !== providedQrKey) {
    return false; // Invalid QR code
  }

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
  if (!event || event.qrKey !== providedQrKey) {
    return false; // Invalid QR code
  }

  const regs = getRegistrations();
  const regIndex = regs.findIndex(r => r.studentId === studentId && r.eventId === eventId);
  if (regIndex !== -1 && regs[regIndex].checkInTime) {
    regs[regIndex].checkOutTime = Date.now();
    saveRegistrations(regs);
    return true;
  }
  return false;
};

export const updateEvent = (eventId: string, updatedFields: Partial<Omit<Event, 'id' | 'organizerId'>>) => {
  const events = getEvents();
  const index = events.findIndex(e => e.id === eventId);
  if (index !== -1) {
    events[index] = {
      ...events[index],
      ...updatedFields,
      status: 'pending' // Reset to pending for re-approval
    };
    saveEvents(events);
  }
};

