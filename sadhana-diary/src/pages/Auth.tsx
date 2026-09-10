import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Eye, EyeOff, Sparkles } from 'lucide-react';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
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
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName.trim() } },
      });
      if (error) {
        alert(error.message);
      } else if (data.user) {
        alert('Account created successfully!');
      }
    }

    setLoading(false);
  };

  return (
    <div className="page fade-in auth-wrap">
      <div className="auth-logo">
        <Sparkles size={30} color="white" />
      </div>

      <h2 className="page-title" style={{ fontSize: '1.6rem' }}>Sadhana Diary</h2>
      <p className="page-subtitle" style={{ marginBottom: '30px' }}>
        Sign in to track your daily offerings to Krishna.
      </p>

      <form onSubmit={handleAuth} className="auth-form">
        {!isLogin && (
          <input
            type="text"
            placeholder="Full Name / Spiritual Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="input"
          />
        )}
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
  );
}