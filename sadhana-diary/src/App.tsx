import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { supabase } from './lib/supabase';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Japa from './pages/Japa';
import Reading from './pages/Reading';
import Hearing from './pages/Hearing';
import { Home, CircleDashed, BookOpen, Headphones, Calendar, User,LogOut } from 'lucide-react';
import Profile from './pages/Profile';
import History from './pages/History';
import './index.css';
import { useSadhanaStore, applyThemeToDocument } from './store/useSadhanaStore';


function Navigation() {
  const location = useLocation();
  
  return (
    <nav className="nav-bar">
      <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
        <Home size={24} />
        <span>Home</span>
      </Link>
      <Link to="/japa" className={`nav-item ${location.pathname === '/japa' ? 'active' : ''}`}>
        <CircleDashed size={24} />
        <span>Japa</span>
      </Link>
      <Link to="/profile" className={`nav-item ${location.pathname === '/profile' ? 'active' : ''}`}>
        <User size={24} />
        <span>Profile</span>
      </Link>
      <Link to="/reading" className={`nav-item ${location.pathname === '/reading' ? 'active' : ''}`}>
        <BookOpen size={24} />
        <span>Read</span>
      </Link>
      <Link to="/hearing" className={`nav-item ${location.pathname === '/hearing' ? 'active' : ''}`}>
        <Headphones size={24} />
        <span>Hear</span>
      </Link>
      <Link to="/history" className={`nav-item ${location.pathname === '/history' ? 'active' : ''}`}>
        <Calendar size={24} />
        <span>History</span>
      </Link>
      <button 
        onClick={() => supabase.auth.signOut()} 
        className="nav-item" 
        style={{ border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
      >
        <LogOut size={24} />
        <span>Sign Out</span>
      </button>
    </nav>
  );
}

export default function App() {
  const [session, setSession] = useState<any>(null);

  useEffect(() => {
    // Check active session on initial load
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    // Listen for login/logout events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
  applyThemeToDocument(useSadhanaStore.getState().theme);
}, []);
  // Block access to the main app if not logged in
  if (!session) {
    return (
      <div className="sadhana-container">
        <Auth />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="sadhana-container">
        <Routes>
          <Route path="/history" element={<History />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/" element={<Dashboard />} />
          <Route path="/japa" element={<Japa />} />
          <Route path="/reading" element={<Reading />} />
          <Route path="/hearing" element={<Hearing />} />
        </Routes>
        <Navigation />
      </div>
    </BrowserRouter>
  );
}