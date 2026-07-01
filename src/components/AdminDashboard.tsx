import { useState, useEffect } from 'react';
import type { User, Event } from '../types';
import { getEvents, updateEventStatus } from '../utils/storage';
import EventCard from './EventCard';

const AdminDashboard = (_props: { user: User }) => {
  const [events, setEvents] = useState<Event[]>([]);

  const loadEvents = () => {
    setEvents(getEvents());
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const handleApprove = (eventId: string) => {
    updateEventStatus(eventId, 'approved');
    loadEvents();
  };

  const handleReject = (eventId: string) => {
    updateEventStatus(eventId, 'rejected');
    loadEvents();
  };

  const pendingEvents = events.filter(e => e.status === 'pending');
  const allOtherEvents = events.filter(e => e.status !== 'pending');

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>Admin Dashboard</h2>
      
      <section style={{ marginBottom: '3rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--warning)' }}>
          Pending Approvals ({pendingEvents.length})
        </h3>
        
        {pendingEvents.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>No pending events to approve.</p>
        ) : (
          <div className="grid-cols-auto">
            {pendingEvents.map(event => (
              <EventCard 
                key={event.id} 
                event={event} 
                actions={
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-success" style={{ flex: 1 }} onClick={() => handleApprove(event.id)}>Approve</button>
                    <button className="btn btn-danger" style={{ flex: 1 }} onClick={() => handleReject(event.id)}>Reject</button>
                  </div>
                }
              />
            ))}
          </div>
        )}
      </section>

      <section>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>
          All Events History
        </h3>
        <div className="grid-cols-auto">
          {allOtherEvents.map(event => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
