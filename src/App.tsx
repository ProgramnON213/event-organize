import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import StudentDashboard from './components/StudentDashboard';
import OrganizerDashboard from './components/OrganizerDashboard';
import AdminDashboard from './components/AdminDashboard';
import type { User } from './types';
import { initializeStorage, getCurrentUser } from './utils/storage';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    initializeStorage();
    setCurrentUser(getCurrentUser());
  }, []);

  const handleUserSwitch = (user: User) => {
    setCurrentUser(user);
    // Reload to simulate fresh state for new user
    window.location.reload(); 
  };

  if (!currentUser) return <div>Loading...</div>;

  return (
    <Router>
      <div className="min-h-screen bg-slate-50">
        <Navbar currentUser={currentUser} onUserSwitch={handleUserSwitch} />
        
        <main className="container" style={{ padding: '2rem 1.5rem' }}>
          <Routes>
            <Route path="/" element={
              currentUser.role === 'student' ? <StudentDashboard user={currentUser} /> :
              currentUser.role === 'organizer' ? <OrganizerDashboard user={currentUser} /> :
              <AdminDashboard user={currentUser} />
            } />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
