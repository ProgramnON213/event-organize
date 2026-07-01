import React, { useState, useEffect } from 'react';
import { getInbox } from '../utils/storage';
import type { SimulatedEmail } from '../utils/storage';
import { Mail, X } from 'lucide-react';

const MailInboxSimulator: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [emails, setEmails] = useState<SimulatedEmail[]>([]);

  // Periodically check for new mock emails
  useEffect(() => {
    const interval = setInterval(() => {
      setEmails(getInbox());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '2rem',
          right: '2rem',
          backgroundColor: 'var(--hcmut-blue-dark)',
          color: 'white',
          borderRadius: '50%',
          width: '56px',
          height: '56px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.3)',
          border: 'none',
          cursor: 'pointer',
          zIndex: 1000
        }}
      >
        <Mail size={24} />
        {emails.length > 0 && (
          <span style={{
            position: 'absolute',
            top: 0,
            right: 0,
            backgroundColor: 'var(--error)',
            color: 'white',
            borderRadius: '50%',
            width: '20px',
            height: '20px',
            fontSize: '0.75rem',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {emails.length}
          </span>
        )}
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '2rem',
      right: '2rem',
      width: '350px',
      maxHeight: '500px',
      backgroundColor: 'white',
      borderRadius: '1rem',
      boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000,
      overflow: 'hidden'
    }}>
      <div style={{ 
        backgroundColor: 'var(--hcmut-blue-dark)', 
        color: 'white', 
        padding: '1rem', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Mail size={18} />
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Mock Inbox</h3>
        </div>
        <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
          <X size={18} />
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '1rem', backgroundColor: 'var(--bg-color)' }}>
        {emails.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '2rem' }}>
            No emails received yet.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {emails.map(email => (
              <div key={email.id} style={{ backgroundColor: 'white', padding: '1rem', borderRadius: '0.5rem', border: '1px solid var(--border-color)' }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
                  To: {email.to} | {new Date(email.timestamp).toLocaleTimeString()}
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: '0.5rem', color: 'var(--text-main)' }}>
                  {email.subject}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-main)', lineHeight: 1.5 }}>
                  {/* Safely render links by splitting */}
                  {email.body.split(/(https?:\/\/[^\s]+|#[^\s]+)/g).map((part, i) => {
                    if (part.startsWith('http') || part.startsWith('#')) {
                      return <a key={i} href={part} onClick={() => setIsOpen(false)} style={{ color: 'var(--hcmut-blue-light)', textDecoration: 'underline' }}>{part}</a>;
                    }
                    return <span key={i}>{part}</span>;
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MailInboxSimulator;
