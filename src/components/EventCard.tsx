import type { Event } from '../types';
import { Calendar, MapPin, Users } from 'lucide-react';

interface EventCardProps {
  event: Event;
  actions?: React.ReactNode;
}

const EventCard: React.FC<EventCardProps> = ({ event, actions }) => {
  return (
    <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
      {event.bannerUrl ? (
        <img 
          src={event.bannerUrl} 
          alt={event.title} 
          style={{ width: '100%', height: 160, objectFit: 'cover' }}
        />
      ) : (
        <div style={{ width: '100%', height: 160, backgroundColor: 'var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
          No Image
        </div>
      )}
      
      <div style={{ padding: '1.5rem', flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
          <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--hcmut-blue-dark)', margin: 0 }}>
            {event.title}
          </h3>
          <span className={`badge badge-${event.status}`}>
            {event.status}
          </span>
        </div>
        
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {event.description}
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: 'auto', marginBottom: '1.5rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Calendar size={16} />
            <span>{new Date(event.date).toLocaleString()}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MapPin size={16} />
            <span>{event.location}</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Users size={16} />
            <span>Capacity: {event.maxParticipants}</span>
          </div>
        </div>

        {actions && (
          <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', marginTop: 'auto' }}>
            {actions}
          </div>
        )}
      </div>
    </div>
  );
};

export default EventCard;
