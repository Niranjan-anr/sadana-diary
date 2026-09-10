import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Eye, EyeOff, X } from 'lucide-react';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) alert(error.message);
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
      });
      if (error) {
        alert(error.message);
      } else {
        setShowSuccessDialog(true);
      }
    }

    setLoading(false);
  };

  return (
    <>
      <div className="page fade-in auth-wrap">
        <img 
          src="/images/themes/prabhupada.jpg" 
          alt="Srila Prabhupada" 
          className="auth-logo" 
          style={{ 
            width: '80px', 
            height: '80px', 
            borderRadius: '50%', 
            objectFit: 'cover', 
            objectPosition: 'top',
            margin: '0 auto 16px', 
            display: 'block' 
          }} 
        />

        <h2 className="page-title" style={{ fontSize: '1.6rem', textAlign: 'center' }}>Sadhana Diary</h2>
        <p className="page-subtitle" style={{ marginBottom: '30px', textAlign: 'center' }}>
          Sign in to track your daily offerings to Krishna.
        </p>

        <form onSubmit={handleAuth} className="auth-form">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="input"
          />

          <div className="password-wrap">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="input"
              style={{ paddingRight: '44px' }}
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="password-toggle"
            >
              {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
            </button>
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary btn-full" style={{ padding: '15px', marginTop: '6px' }}>
            {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
          </button>
        </form>

        <button onClick={() => setIsLogin(!isLogin)} className="auth-switch">
          {isLogin ? 'New devotee? Create an account' : 'Already have an account? Sign in'}
        </button>
      </div>

      {/* Success Dialog Overlay */}
      {showSuccessDialog && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          zIndex: 1000, padding: '20px', backdropFilter: 'blur(4px)'
        }}>
          <div style={{
            backgroundColor: 'var(--bg-color, #ffffff)',
            color: 'var(--text-color, #333333)',
            padding: '30px 24px',
            borderRadius: '12px',
            position: 'relative',
            maxWidth: '380px',
            width: '100%',
            textAlign: 'center',
            boxShadow: '0 10px 25px rgba(0,0,0,0.2)'
          }}>
            <button 
              onClick={() => setShowSuccessDialog(false)} 
              style={{
                position: 'absolute', top: '12px', right: '12px',
                background: 'transparent', border: 'none', cursor: 'pointer',
                color: 'var(--text-muted, #888)', padding: '4px'
              }}
              aria-label="Close"
            >
              <X size={22} />
            </button>
            <h3 style={{ marginTop: '0', marginBottom: '12px', fontSize: '1.4rem' }}>Hare Krishna! 🙏</h3>
            <p style={{ marginBottom: '24px', lineHeight: '1.5' }}>
              Your account has been created successfully. Once logged in, please go to your <strong>Profile page</strong> to set your name.
            </p>
            <button 
              className="btn btn-primary"
              style={{ width: '100%', padding: '12px' }}
              onClick={() => {
                setShowSuccessDialog(false);
                setIsLogin(true); // Switch to login view
              }}
            >
              Sign In Now
            </button>
          </div>
        </div>
      )}
    </>
  );
}