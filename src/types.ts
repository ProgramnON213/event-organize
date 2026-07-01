export type Role = 'student' | 'organizer' | 'admin';

export interface AuthAccount {
  id: string;
  email: string;
  passwordHash: string;
  role: Role;
  resetToken?: string;
}

export interface StudentProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
}

export interface OrganizerProfile {
  id: string;
  name: string;
  phone: string;
  email: string;
}

export interface AdminProfile {
  id: string;
  name: string;
}

// Unified user interface for the frontend components
export interface User {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role: Role;
}

export interface Event {
  id: string;
  title: string;
  description: string;
  date: string;
  location: string;
  organizerId: string;
  status: 'pending' | 'approved' | 'rejected';
  maxParticipants: number;
  bannerUrl?: string;
  qrKey?: string;
  qrGeneratedAt?: number;
}

export interface Registration {
  id: string;
  studentId: string;
  eventId: string;
  registeredAt: number;
  checkInTime?: number;
  checkOutTime?: number;
}
