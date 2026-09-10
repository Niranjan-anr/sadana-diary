import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { getUserProfile } from './lib/api';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Japa from './pages/Japa';
import Reading from './pages/Reading';
import Hearing from './pages/Hearing';
import { Home, CircleDashed, BookOpen, Headphones, Calendar, User, LogOut, Users } from 'lucide-react';
import Profile from './pages/Profile';
import History from './pages/History';
import MentorDashboard from './pages/mentor/MentorDashboard';
import { useSadhanaStore, applyThemeToDocument } from './store/useSadhanaStore';
import './index.css';

function SadhakaNavigation() {
  const location = useLocation();
  return (
    <nav className="nav-bar">
      <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
        <Home size={22} /><span>Home</span>
      </Link>
      <Link to="/japa" className={`nav-item ${location.pathname === '/japa' ? 'active' : ''}`}>
        <CircleDashed size={22} /><span>Japa</span>
      </Link>
      <Link to="/profile" className={`nav-item ${location.pathname === '/profile' ? 'active' : ''}`}>
        <User size={22} /><span>Profile</span>
      </Link>
      <Link to="/reading" className={`nav-item ${location.pathname === '/reading' ? 'active' : ''}`}>
        <BookOpen size={22} /><span>Read</span>
      </Link>
      <Link to="/hearing" className={`nav-item ${location.pathname === '/hearing' ? 'active' : ''}`}>
        <Headphones size={22} /><span>Hear</span>
      </Link>
      <Link to="/history" className={`nav-item ${location.pathname === '/history' ? 'active' : ''}`}>
        <Calendar size={22} /><span>History</span>
      </Link>
      <button onClick={() => supabase.auth.signOut()} className="nav-item nav-item-btn">
        <LogOut size={22} /><span>Sign Out</span>
      </button>
    </nav>
  );
}

function MentorNavigation() {
  const location = useLocation();
  return (
    <nav className="nav-bar">
      <Link to="/" className={`nav-item ${location.pathname === '/' ? 'active' : ''}`}>
        <Users size={22} /><span>Sadhakas</span>
      </Link>
      <button onClick={() => supabase.auth.signOut()} className="nav-item nav-item-btn">
        <LogOut size={22} /><span>Sign Out</span>
      </button>
    </nav>
  );
}

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [role, setRole] = useState<'sadhaka' | 'mentor' | null>(null);
  const [loadingRole, setLoadingRole] = useState(true);

  useEffect(() => {
    applyThemeToDocument(useSadhanaStore.getState().theme);

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        const profile = await getUserProfile(session.user.id);
        setRole((profile?.role as 'sadhaka' | 'mentor') ?? 'sadhaka');
      }
      setLoadingRole(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session);
      if (session?.user) {
        const profile = await getUserProfile(session.user.id);
        setRole((profile?.role as 'sadhaka' | 'mentor') ?? 'sadhaka');
      } else {
        setRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!session) {
    return (
      <div className="sadhana-container">
        <Auth />
      </div>
    );
  }

  if (loadingRole) {
    return (
      <div className="sadhana-container">
        <div className="empty-state">Loading...</div>
      </div>
    );
  }

  if (role === 'mentor') {
    return (
      <BrowserRouter>
        <div className="sadhana-container">
          <Routes>
            <Route path="/" element={<MentorDashboard />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
          <MentorNavigation />
        </div>
      </BrowserRouter>
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
        <SadhakaNavigation />
      </div>
    </BrowserRouter>
  );
}