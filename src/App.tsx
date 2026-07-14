import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import StudentDashboard from './components/StudentDashboard';
import OrganizerDashboard from './components/OrganizerDashboard';
import AdminDashboard from './components/AdminDashboard';
import AuthPage from './components/AuthPage';
import MailInboxSimulator from './components/MailInboxSimulator';
import DevBackendConsole from './components/DevBackendConsole';
import type { User } from './types';
import { initializeStorage, getCurrentUser, setCurrentUser, KEYS, getUserById } from './utils/storage';

function App() {
  const [currentUser, setCurrentUserLocal] = useState<User | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    initializeStorage();
    setCurrentUserLocal(getCurrentUser());
    setIsInitializing(false);

    // Sync logged-in user state reactively on profile/role updates
    const handleStorageChange = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (
        customEvent.detail?.key === KEYS.CURRENT_USER ||
        customEvent.detail?.key === KEYS.AUTH ||
        customEvent.detail?.key === KEYS.STUDENT_PROFILES ||
        customEvent.detail?.key === KEYS.ORGANIZER_PROFILES ||
        customEvent.detail?.key === KEYS.ADMIN_PROFILES
      ) {
        const current = getCurrentUser();
        if (current) {
          const updated = getUserById(current.id);
          if (updated) {
            setCurrentUserLocal(updated);
            localStorage.setItem(KEYS.CURRENT_USER, JSON.stringify(updated));
          } else {
            setCurrentUserLocal(null);
            setCurrentUser(null);
          }
        } else {
          setCurrentUserLocal(null);
        }
      }
    };

    window.addEventListener('hcmut_storage_change', handleStorageChange);
    return () => {
      window.removeEventListener('hcmut_storage_change', handleStorageChange);
    };
  }, []);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentUserLocal(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentUserLocal(null);
  };

  if (isInitializing) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;

  if (!currentUser) {
    return (
      <>
        <AuthPage onLogin={handleLogin} />
        <MailInboxSimulator />
        <DevBackendConsole />
      </>
    );
  }

  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <Navbar currentUser={currentUser} onLogout={handleLogout} />
        
        <main className="container" style={{ padding: '2rem 1.5rem', paddingBottom: '6rem' }}>
          <Routes>
            <Route path="/" element={
              currentUser.role === 'student' ? <StudentDashboard user={currentUser} /> :
              currentUser.role === 'organizer' ? <OrganizerDashboard user={currentUser} /> :
              <AdminDashboard user={currentUser} />
            } />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        
        <MailInboxSimulator />
        <DevBackendConsole />
      </div>
    </Router>
  );
}

export default App;
