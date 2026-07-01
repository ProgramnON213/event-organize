import React, { useState } from 'react';
import { getAuths, grantRole } from '../utils/storage';
import { Settings, X } from 'lucide-react';
import type { Role } from '../types';

const DevBackendConsole: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  
  const [selectedUserId, setSelectedUserId] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role>('student');
  const [, setRefresh] = useState(0); // to force re-render

  const auths = getAuths();

  const handleGrantRole = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;
    
    // Call the backend method
    grantRole(selectedUserId, selectedRole);
    alert(`Successfully granted ${selectedRole} role to user ${selectedUserId}!`);
    setRefresh(r => r + 1);
  };

  if (!isOpen) {
    return (
      <button 
        onClick={() => setIsOpen(true)}
        style={{
          position: 'fixed',
          bottom: '2rem',
          left: '2rem',
          backgroundColor: '#333',
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
        title="Developer Backend Console"
      >
        <Settings size={24} />
      </button>
    );
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: '2rem',
      left: '2rem',
      width: '400px',
      maxHeight: '500px',
      backgroundColor: 'white',
      borderRadius: '1rem',
      boxShadow: '0 20px 25px -5px rgba(0,0,0,0.2)',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000,
      overflow: 'hidden',
      border: '2px solid #333'
    }}>
      <div style={{ 
        backgroundColor: '#333', 
        color: 'white', 
        padding: '1rem', 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Settings size={18} />
          <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 600 }}>Backend Console</h3>
        </div>
        <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer' }}>
          <X size={18} />
        </button>
      </div>

      <div style={{ padding: '1rem', overflowY: 'auto' }}>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
          Use this console to execute the <strong>grantRole()</strong> backend method. This simulates an admin or system process granting elevated permissions.
        </p>

        <form onSubmit={handleGrantRole} style={{ backgroundColor: 'var(--bg-color)', padding: '1rem', borderRadius: '0.5rem' }}>
          <div className="form-group">
            <label>Select User (AuthAccount)</label>
            <select 
              required 
              className="input" 
              value={selectedUserId} 
              onChange={e => setSelectedUserId(e.target.value)}
            >
              <option value="">-- Choose User --</option>
              {auths.map(a => (
                <option key={a.id} value={a.id}>
                  {a.email} (Current: {a.role})
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Grant Role</label>
            <select 
              required 
              className="input" 
              value={selectedRole} 
              onChange={e => setSelectedRole(e.target.value as Role)}
            >
              <option value="student">Student</option>
              <option value="organizer">Organizer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          
          <button type="submit" className="btn" style={{ width: '100%', backgroundColor: '#333', color: 'white' }}>
            Execute grantRole()
          </button>
        </form>

        <div style={{ marginTop: '1.5rem' }}>
          <h4 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.5rem' }}>Current Auth Database ({auths.length})</h4>
          <div style={{ fontSize: '0.75rem', backgroundColor: '#f1f5f9', padding: '0.5rem', borderRadius: '0.25rem', overflowX: 'auto', whiteSpace: 'pre' }}>
            {JSON.stringify(auths.map(a => ({ id: a.id, email: a.email, role: a.role })), null, 2)}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DevBackendConsole;
