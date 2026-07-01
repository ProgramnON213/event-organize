import type { User, Event, Registration } from '../types';

export const MOCK_USERS: User[] = [
  {
    id: 'u-student-1',
    name: 'Nguyen Van A',
    email: 'studentA@hcmut.edu.vn',
    role: 'student'
  },
  {
    id: 'u-student-2',
    name: 'Tran Thi B',
    email: 'studentB@hcmut.edu.vn',
    role: 'student'
  },
  {
    id: 'u-organizer-1',
    name: 'CSE Faculty',
    email: 'cse@hcmut.edu.vn',
    role: 'organizer'
  },
  {
    id: 'u-admin-1',
    name: 'Student Affairs',
    email: 'ctsv@hcmut.edu.vn',
    role: 'admin'
  }
];

export const MOCK_EVENTS: Event[] = [
  {
    id: 'e-1',
    title: 'BK Innovation 2026',
    description: 'Annual innovation competition for HCMUT students. Join us to showcase your startup ideas!',
    date: '2026-08-15T08:00',
    location: 'A5 Hall, HCMUT Di An Campus',
    organizerId: 'u-organizer-1',
    status: 'approved',
    maxParticipants: 500,
    bannerUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80',
    qrKey: 'bk-innovation-secret-123',
    qrGeneratedAt: Date.now()
  },
  {
    id: 'e-2',
    title: 'Web Development Workshop',
    description: 'Learn modern web development with React and Vite.',
    date: '2026-07-20T14:00',
    location: 'H6 Building, Lab 601',
    organizerId: 'u-organizer-1',
    status: 'pending',
    maxParticipants: 50,
    bannerUrl: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=800&q=80'
  }
];

export const MOCK_REGISTRATIONS: Registration[] = [
  {
    id: 'r-1',
    studentId: 'u-student-1',
    eventId: 'e-1',
    registeredAt: Date.now() - 1000000
  }
];
