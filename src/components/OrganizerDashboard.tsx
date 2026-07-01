import { useState, useEffect } from 'react';
import type { User, Event, Registration } from '../types';
import { getEvents, createEvent, updateEvent, refreshEventQr, getRegistrations, getUsers } from '../utils/storage';
import EventCard from './EventCard';
import { QRCodeSVG } from 'qrcode.react';
import { RefreshCw, Users as UsersIcon, Edit } from 'lucide-react';

interface Props {
  user: User;
}

const OrganizerDashboard: React.FC<Props> = ({ user }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  // Create Event Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');
  const [maxParticipants, setMaxParticipants] = useState(100);
  const [bannerUrl, setBannerUrl] = useState('');
  
  // Edit Event Form State
  const [editEventId, setEditEventId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editLocation, setEditLocation] = useState('');
  const [editMaxParticipants, setEditMaxParticipants] = useState(100);
  const [editBannerUrl, setEditBannerUrl] = useState('');

  // QR Modal State
  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [activeQrEvent, setActiveQrEvent] = useState<Event | null>(null);

  // Attendees Modal State
  const [attendeesModalOpen, setAttendeesModalOpen] = useState(false);
  const [activeEventRegistrations, setActiveEventRegistrations] = useState<(Registration & { user: User })[]>([]);

  const loadEvents = () => {
    setEvents(getEvents().filter(e => e.organizerId === user.id));
  };

  useEffect(() => {
    loadEvents();
  }, [user.id]);

  const handleCreateEvent = (e: React.FormEvent) => {
    e.preventDefault();
    createEvent({
      title, 
      description, 
      date, 
      location, 
      maxParticipants, 
      organizerId: user.id,
      bannerUrl: bannerUrl || undefined
    });
    setIsCreateModalOpen(false);
    loadEvents();
    
    // Reset form
    setTitle(''); setDescription(''); setDate(''); setLocation(''); setMaxParticipants(100); setBannerUrl('');
  };

  const openEditModal = (event: Event) => {
    setEditEventId(event.id);
    setEditTitle(event.title);
    setEditDescription(event.description);
    setEditDate(event.date);
    setEditLocation(event.location);
    setEditMaxParticipants(event.maxParticipants);
    setEditBannerUrl(event.bannerUrl || '');
    setIsEditModalOpen(true);
  };

  const handleEditEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editEventId) return;

    updateEvent(editEventId, {
      title: editTitle,
      description: editDescription,
      date: editDate,
      location: editLocation,
      maxParticipants: editMaxParticipants,
      bannerUrl: editBannerUrl || undefined
    });

    setIsEditModalOpen(false);
    loadEvents();
    alert('Event updated and submitted for re-approval.');
  };

  const openQrModal = (event: Event) => {
    setActiveQrEvent(event);
    setQrModalOpen(true);
    if (!event.qrKey) {
      handleRefreshQr(event.id);
    }
  };

  const handleRefreshQr = (eventId: string) => {
    refreshEventQr(eventId);
    loadEvents();
    // Update local state for modal immediately
    const updatedEvents = getEvents();
    setActiveQrEvent(updatedEvents.find(e => e.id === eventId) || null);
  };

  const openAttendeesModal = (eventId: string) => {
    const allRegs = getRegistrations().filter(r => r.eventId === eventId);
    const allUsers = getUsers();
    const enriched = allRegs.map(reg => ({
      ...reg,
      user: allUsers.find(u => u.id === reg.studentId)!
    }));
    setActiveEventRegistrations(enriched);
    setAttendeesModalOpen(true);
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Organizer Dashboard</h2>
        <button className="btn btn-primary" onClick={() => setIsCreateModalOpen(true)}>
          + Create New Event
        </button>
      </div>

      <div className="grid-cols-auto">
        {events.map(event => (
          <EventCard 
            key={event.id} 
            event={event} 
            actions={
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => openAttendeesModal(event.id)}>
                    <UsersIcon size={16} /> Attendees
                  </button>
                  <button className="btn btn-secondary" style={{ flex: 1 }} onClick={() => openEditModal(event)}>
                    <Edit size={16} /> Edit
                  </button>
                </div>
                {event.status === 'approved' && (
                  <button className="btn btn-primary" onClick={() => openQrModal(event)}>
                    Show Check-In QR Code
                  </button>
                )}
              </div>
            }
          />
        ))}
      </div>
      
      {events.length === 0 && (
        <p style={{ color: 'var(--text-muted)' }}>You haven't created any events yet.</p>
      )}

      {/* Create Event Modal */}
      {isCreateModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Create New Event</h3>
            <form onSubmit={handleCreateEvent}>
              <div className="form-group">
                <label>Event Title</label>
                <input required className="input" value={title} onChange={e => setTitle(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea required className="input" rows={3} value={description} onChange={e => setDescription(e.target.value)}></textarea>
              </div>
              <div className="form-group">
                <label>Date & Time</label>
                <input required type="datetime-local" className="input" value={date} onChange={e => setDate(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input required className="input" value={location} onChange={e => setLocation(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Max Capacity</label>
                <input required type="number" min={1} className="input" value={maxParticipants} onChange={e => setMaxParticipants(parseInt(e.target.value))} />
              </div>
              <div className="form-group">
                <label>Event Banner Image URL</label>
                <input type="url" placeholder="https://example.com/image.jpg" className="input" value={bannerUrl} onChange={e => setBannerUrl(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsCreateModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Submit for Approval</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Event Modal */}
      {isEditModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Edit Event</h3>
            <form onSubmit={handleEditEvent}>
              <div className="form-group">
                <label>Event Title</label>
                <input required className="input" value={editTitle} onChange={e => setEditTitle(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea required className="input" rows={3} value={editDescription} onChange={e => setEditDescription(e.target.value)}></textarea>
              </div>
              <div className="form-group">
                <label>Date & Time</label>
                <input required type="datetime-local" className="input" value={editDate} onChange={e => setEditDate(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Location</label>
                <input required className="input" value={editLocation} onChange={e => setEditLocation(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Max Capacity</label>
                <input required type="number" min={1} className="input" value={editMaxParticipants} onChange={e => setEditMaxParticipants(parseInt(e.target.value))} />
              </div>
              <div className="form-group">
                <label>Event Banner Image URL</label>
                <input type="url" placeholder="https://example.com/image.jpg" className="input" value={editBannerUrl} onChange={e => setEditBannerUrl(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {qrModalOpen && activeQrEvent && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Event QR Code</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--error)', marginBottom: '1.5rem', fontWeight: 500 }}>
              To prevent copy-pasting, this code contains a dynamic key. Refresh it periodically.
            </p>
            
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem', padding: '1rem', background: 'white', borderRadius: '1rem' }}>
              <QRCodeSVG value={activeQrEvent.qrKey || ''} size={250} />
            </div>
            
            <p style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '2px', marginBottom: '1.5rem' }}>
              Key: {activeQrEvent.qrKey}
            </p>

            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
              <button className="btn btn-secondary" onClick={() => handleRefreshQr(activeQrEvent.id)}>
                <RefreshCw size={16} /> Regenerate Key
              </button>
              <button className="btn btn-primary" onClick={() => setQrModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Attendees Modal */}
      {attendeesModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Attendees</h3>
            {activeEventRegistrations.length === 0 ? (
              <p>No attendees registered yet.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
                    <th style={{ padding: '0.5rem' }}>Student ID</th>
                    <th style={{ padding: '0.5rem' }}>Name</th>
                    <th style={{ padding: '0.5rem' }}>Contact</th>
                    <th style={{ padding: '0.5rem' }}>Status</th>
                    <th style={{ padding: '0.5rem' }}>Check-in</th>
                    <th style={{ padding: '0.5rem' }}>Check-out</th>
                  </tr>
                </thead>
                <tbody>
                  {activeEventRegistrations.map(reg => (
                    <tr key={reg.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                      <td style={{ padding: '0.5rem' }}>{reg.user.id}</td>
                      <td style={{ padding: '0.5rem' }}>{reg.user.name}</td>
                      <td style={{ padding: '0.5rem' }}>
                        <div>{reg.user.email}</div>
                        {reg.user.phone && <div style={{ color: 'var(--text-muted)' }}>{reg.user.phone}</div>}
                      </td>
                      <td style={{ padding: '0.5rem' }}>
                        {reg.checkOutTime ? 'Finished' : reg.checkInTime ? 'Attending' : 'Registered'}
                      </td>
                      <td style={{ padding: '0.5rem' }}>{reg.checkInTime ? new Date(reg.checkInTime).toLocaleTimeString() : '-'}</td>
                      <td style={{ padding: '0.5rem' }}>{reg.checkOutTime ? new Date(reg.checkOutTime).toLocaleTimeString() : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
            <div style={{ marginTop: '1.5rem', textAlign: 'right' }}>
              <button className="btn btn-primary" onClick={() => setAttendeesModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrganizerDashboard;
