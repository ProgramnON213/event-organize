import React from 'react';
import type { User } from '../types';
import { MOCK_USERS } from '../utils/mockData';
import { setCurrentUser as saveCurrentUserToStorage } from '../utils/storage';
import { User as UserIcon } from 'lucide-react';

interface NavbarProps {
  currentUser: User;
  onUserSwitch: (user: User) => void;
}

const Navbar: React.FC<NavbarProps> = ({ currentUser, onUserSwitch }) => {
  const handleSwitch = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedUser = MOCK_USERS.find(u => u.id === e.target.value);
    if (selectedUser) {
      saveCurrentUserToStorage(selectedUser);
      onUserSwitch(selectedUser);
    }
  };

  return (
    <nav className="navbar">
      <div className="container">
        <div className="brand">
          <div style={{ width: 40, height: 40, borderRadius: '50%', backgroundColor: 'var(--hcmut-blue-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white' }}>
            <span style={{ fontWeight: 800 }}>BK</span>
          </div>
          <span>HCMUT Event Organizer</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)' }}>
            <UserIcon size={18} />
            <span style={{ fontSize: '0.875rem', fontWeight: 500 }}>{currentUser.name} ({currentUser.role})</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Switch Role:</span>
            <select 
              value={currentUser.id} 
              onChange={handleSwitch}
              className="input"
              style={{ width: 'auto', padding: '0.25rem 2rem 0.25rem 0.5rem', fontSize: '0.875rem' }}
            >
              {MOCK_USERS.map(u => (
                <option key={u.id} value={u.id}>{u.role.toUpperCase()} - {u.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
