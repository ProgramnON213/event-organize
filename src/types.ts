export type Role = 'student' | 'organizer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
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
  qrKey?: string; // Random key to ensure physical presence
  qrGeneratedAt?: number; // Timestamp when QR was last generated
}

export interface Registration {
  id: string;
  studentId: string;
  eventId: string;
  registeredAt: number;
  checkInTime?: number;
  checkOutTime?: number;
}
