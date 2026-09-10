import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Eye, EyeOff } from 'lucide-react';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

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
        alert('Hare Krishna! 🙏\n\nAccount created successfully! Please go to the Profile tab to update your name and set your theme.');
      }
    }

    setLoading(false);
  };

  return (
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

      <button type="button" onClick={() => setIsLogin(!isLogin)} className="auth-switch">
        {isLogin ? 'New devotee? Create an account' : 'Already have an account? Sign in'}
      </button>
    </div>
  );
}