import React, { useState } from 'react';
import { getAuths, getUserById, hashPassword, registerUser, sendSimulatedEmail, updatePassword, generateResetToken } from '../utils/storage';
import type { User } from '../types';

interface AuthPageProps {
  onLogin: (user: User) => void;
}

const AuthPage: React.FC<AuthPageProps> = ({ onLogin }) => {
  const [view, setView] = useState<'login' | 'signup' | 'forgot' | 'reset'>('login');
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const hashed = await hashPassword(password);
    const auths = getAuths();
    const account = auths.find(a => a.email === email && a.passwordHash === hashed);
    
    if (account) {
      const user = getUserById(account.id);
      if (user) {
        onLogin(user);
      } else {
        setError('Profile not found.');
      }
    } else {
      setError('Invalid email or password.');
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const hashed = await hashPassword(password);
    const successReg = registerUser(name, email, phone, hashed);
    
    if (successReg) {
      setSuccess('Account created! Please log in.');
      setView('login');
      // clear fields except email
      setPassword('');
      setName('');
      setPhone('');
    } else {
      setError('Email already exists.');
    }
  };

  const handleForgot = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const token = generateResetToken(email);
    
    if (token) {
      // Simulate sending email
      const resetLink = `#reset-${token}`;
      sendSimulatedEmail(
        email, 
        'Reset Your HCMUT Event Organizer Password', 
        `We received a request to reset your password. Click this link to reset it: ${resetLink}`
      );
      setSuccess('If the email exists, a reset link has been sent. Check your Mock Inbox.');
    } else {
      // For security, don't confirm if email exists or not
      setSuccess('If the email exists, a reset link has been sent. Check your Mock Inbox.');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const hashed = await hashPassword(password);
    const successReset = updatePassword(resetEmail, hashed);
    if (successReset) {
      setSuccess('Password updated successfully. Please log in.');
      setView('login');
      setPassword('');
    } else {
      setError('Error updating password.');
    }
  };

  // Check if we arrived via a reset link
  React.useEffect(() => {
    const hash = window.location.hash;
    if (hash.startsWith('#reset-')) {
      const token = hash.replace('#reset-', '');
      if (token) {
        setResetEmail(token); // reusing resetEmail state to hold the token
        setView('reset');
        window.location.hash = ''; // clear it
      }
    }
  }, []);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-color)' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', backgroundColor: 'var(--hcmut-blue-light)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: 'white', marginBottom: '1rem' }}>
            <span style={{ fontWeight: 800, fontSize: '1.25rem' }}>BK</span>
          </div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--hcmut-blue-dark)' }}>
            HCMUT Events
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
            {view === 'login' && 'Sign in to your account'}
            {view === 'signup' && 'Create a new student account'}
            {view === 'forgot' && 'Reset your password'}
            {view === 'reset' && `Set new password`}
          </p>
        </div>

        {error && <div style={{ padding: '0.75rem', backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</div>}
        {success && <div style={{ padding: '0.75rem', backgroundColor: '#dcfce3', color: '#166534', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>{success}</div>}

        {view === 'login' && (
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>Email</label>
              <input type="email" required className="input" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" required className="input" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Sign In</button>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '1rem', fontSize: '0.875rem' }}>
              <button type="button" onClick={() => { setView('forgot'); setError(''); setSuccess(''); }} style={{ color: 'var(--hcmut-blue-light)', background: 'none', border: 'none', cursor: 'pointer' }}>Forgot password?</button>
              <button type="button" onClick={() => { setView('signup'); setError(''); setSuccess(''); }} style={{ color: 'var(--hcmut-blue-light)', background: 'none', border: 'none', cursor: 'pointer' }}>Sign up</button>
            </div>
          </form>
        )}

        {view === 'signup' && (
          <form onSubmit={handleSignup}>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" required className="input" value={name} onChange={e => setName(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input type="email" required className="input" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input type="tel" required className="input" value={phone} onChange={e => setPhone(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" required className="input" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Create Account</button>
            <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.875rem' }}>
              <button type="button" onClick={() => { setView('login'); setError(''); setSuccess(''); }} style={{ color: 'var(--hcmut-blue-light)', background: 'none', border: 'none', cursor: 'pointer' }}>Back to login</button>
            </div>
          </form>
        )}

        {view === 'forgot' && (
          <form onSubmit={handleForgot}>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" required className="input" value={email} onChange={e => setEmail(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Send Reset Link</button>
            <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.875rem' }}>
              <button type="button" onClick={() => { setView('login'); setError(''); setSuccess(''); }} style={{ color: 'var(--hcmut-blue-light)', background: 'none', border: 'none', cursor: 'pointer' }}>Back to login</button>
            </div>
          </form>
        )}

        {view === 'reset' && (
          <form onSubmit={handleResetPassword}>
            <div className="form-group">
              <label>New Password</label>
              <input type="password" required className="input" value={password} onChange={e => setPassword(e.target.value)} />
            </div>
            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Update Password</button>
            <div style={{ textAlign: 'center', marginTop: '1rem', fontSize: '0.875rem' }}>
              <button type="button" onClick={() => { setView('login'); setError(''); setSuccess(''); }} style={{ color: 'var(--hcmut-blue-light)', background: 'none', border: 'none', cursor: 'pointer' }}>Back to login</button>
            </div>
          </form>
        )}
        
        <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center' }}>
          <p>Mock Accounts (Password: password123)</p>
          <p>studentA@hcmut.edu.vn | cse@hcmut.edu.vn | ctsv@hcmut.edu.vn</p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
