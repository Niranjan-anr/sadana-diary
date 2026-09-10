import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { updateUserProfile } from '../lib/api';
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
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        alert(error.message);
      } else if (data.user) {
        await updateUserProfile(data.user.id, { full_name: fullName });
        alert('Account created successfully!');
      }
    }

    setLoading(false);
  };

  return (
    <div className="page fade-in" style={{ textAlign: 'center', paddingTop: '52px' }}>
      <div style={{ width: '64px', height: '64px', borderRadius: '18px', background: 'linear-gradient(135deg, var(--primary), var(--primary-dark))', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 8px 20px rgba(249,115,22,0.3)' }}>
        <Sparkles size={30} color="white" />
      </div>

      <h2 className="page-title" style={{ fontSize: '1.6rem' }}>Sadhana Diary</h2>
      <p className="page-subtitle" style={{ marginBottom: '30px' }}>
        Sign in to track your daily offerings to Krishna.
      </p>

      <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '14px', textAlign: 'left' }}>
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

        <div style={{ position: 'relative' }}>
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
            style={{
              position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', display: 'flex',
              alignItems: 'center', color: 'var(--text-faint)', padding: 0,
            }}
          >
            {showPassword ? <EyeOff size={19} /> : <Eye size={19} />}
          </button>
        </div>

        <button type="submit" disabled={loading} className="btn btn-primary btn-full" style={{ padding: '15px', marginTop: '6px' }}>
          {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
        </button>
      </form>

      <button
        onClick={() => setIsLogin(!isLogin)}
        style={{ marginTop: '22px', background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.88rem', fontWeight: 700 }}
      >
        {isLogin ? 'New devotee? Create an account' : 'Already have an account? Sign in'}
      </button>
    </div>
  );
}