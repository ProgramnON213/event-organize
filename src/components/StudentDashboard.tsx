import { useState, useEffect } from 'react';
import type { User, Event, Registration } from '../types';
import { getEvents, getRegistrations, registerForEvent, checkInStudent, checkOutStudent } from '../utils/storage';
import EventCard from './EventCard';

interface Props {
  user: User;
}

const StudentDashboard: React.FC<Props> = ({ user }) => {
  const [events, setEvents] = useState<Event[]>([]);
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  
  // Scanner Modal State
  const [scanModalOpen, setScanModalOpen] = useState(false);
  const [scanTargetEventId, setScanTargetEventId] = useState<string | null>(null);
  const [scanType, setScanType] = useState<'checkin' | 'checkout' | null>(null);
  const [scannedKey, setScannedKey] = useState('');
  const [scanError, setScanError] = useState('');

  const loadData = () => {
    setEvents(getEvents().filter(e => e.status === 'approved'));
    setRegistrations(getRegistrations().filter(r => r.studentId === user.id));
  };

  useEffect(() => {
    loadData();
  }, [user.id]);

  const handleRegister = (eventId: string) => {
    registerForEvent(user.id, eventId);
    loadData();
    alert('Successfully registered!');
  };

  const openScanner = (eventId: string, type: 'checkin' | 'checkout') => {
    setScanTargetEventId(eventId);
    setScanType(type);
    setScannedKey('');
    setScanError('');
    setScanModalOpen(true);
  };

  const handleScanSubmit = () => {
    if (!scanTargetEventId || !scanType) return;
    
    let success = false;
    if (scanType === 'checkin') {
      success = checkInStudent(user.id, scanTargetEventId, scannedKey);
    } else {
      success = checkOutStudent(user.id, scanTargetEventId, scannedKey);
    }

    if (success) {
      alert(`Successfully ${scanType === 'checkin' ? 'checked in' : 'checked out'}!`);
      setScanModalOpen(false);
      loadData();
    } else {
      setScanError('Invalid QR Code. Please make sure you are scanning the current active QR code at the event.');
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '1.5rem' }}>Student Dashboard</h2>

      <section style={{ marginBottom: '3rem' }}>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--hcmut-blue-light)' }}>
          My Registrations
        </h3>
        
        {registrations.length === 0 ? (
          <p style={{ color: 'var(--text-muted)' }}>You haven't registered for any events yet.</p>
        ) : (
          <div className="grid-cols-auto">
            {registrations.map(reg => {
              const event = events.find(e => e.id === reg.eventId);
              if (!event) return null;

              const isCheckedIn = !!reg.checkInTime;
              const isCheckedOut = !!reg.checkOutTime;

              return (
                <EventCard 
                  key={event.id} 
                  event={event} 
                  actions={
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>
                        Status: 
                        {!isCheckedIn && <span style={{ color: 'var(--warning)', marginLeft: '0.5rem' }}>Registered</span>}
                        {isCheckedIn && !isCheckedOut && <span style={{ color: 'var(--success)', marginLeft: '0.5rem' }}>Checked In</span>}
                        {isCheckedOut && <span style={{ color: 'var(--text-muted)', marginLeft: '0.5rem' }}>Checked Out</span>}
                      </div>
                      
                      {!isCheckedIn && (
                        <button className="btn btn-primary" onClick={() => openScanner(event.id, 'checkin')}>
                          Scan to Check-In
                        </button>
                      )}
                      {isCheckedIn && !isCheckedOut && (
                        <button className="btn btn-secondary" onClick={() => openScanner(event.id, 'checkout')}>
                          Scan to Check-Out
                        </button>
                      )}
                    </div>
                  }
                />
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>
          Available Events
        </h3>
        <div className="grid-cols-auto">
          {events
            .filter(e => !registrations.find(r => r.eventId === e.id))
            .map(event => (
              <EventCard 
                key={event.id} 
                event={event} 
                actions={
                  <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => handleRegister(event.id)}>
                    Register Now
                  </button>
                }
              />
          ))}
        </div>
      </section>

      {/* QR Scanner Modal Simulator */}
      {scanModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>
              Simulate QR Scan ({scanType === 'checkin' ? 'Check In' : 'Check Out'})
            </h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
              In a real environment, this would open your camera. For this simulation, enter the secret token displayed on the organizer's screen.
            </p>
            
            {scanError && (
              <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
                {scanError}
              </div>
            )}

            <div className="form-group">
              <label>Secret Token</label>
              <input 
                type="text" 
                className="input" 
                value={scannedKey} 
                onChange={e => setScannedKey(e.target.value)} 
                placeholder="Enter the code shown on the screen"
                autoFocus
              />
            </div>
            
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button className="btn btn-secondary" onClick={() => setScanModalOpen(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleScanSubmit}>Submit Scan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentDashboard;
