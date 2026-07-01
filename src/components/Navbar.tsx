import React from 'react';
import type { User } from '../types';
import { User as UserIcon, LogOut } from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  onLogout: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentUser, onLogout }) => {
  return (
    <nav className="navbar">
      <div className="container" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="brand">
          <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: 'var(--hcmut-blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <span style={{ fontWeight: 800 }}>BK</span>
          </div>
          <span>HCMUT Event Organizer</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'var(--text-main)' }}>
            <div style={{ backgroundColor: 'var(--border-color)', padding: '0.5rem', borderRadius: '50%' }}>
              <UserIcon size={18} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>{currentUser.name}</span>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                {currentUser.role.toUpperCase()}
              </span>
            </div>
          </div>

          <button 
            onClick={onLogout}
            className="btn btn-secondary" 
            style={{ padding: '0.375rem 0.75rem', fontSize: '0.875rem' }}
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
