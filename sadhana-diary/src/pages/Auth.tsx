import { useState } from 'react';
import { supabase } from '../lib/supabase';
import { updateUserProfile } from '../lib/api';

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);

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
        // Save the devotee's name into their profile
        await updateUserProfile(data.user.id, { full_name: fullName });
        alert('Account created successfully!');
      }
    }
    
    setLoading(false);
  };

  return (
    <div style={{ padding: '40px 20px', textAlign: 'center' }}>
      <h2 className="header-title">Sadhana Diary</h2>
      <p style={{ color: '#6b7280', marginBottom: '30px' }}>Sign in to track your daily offerings to Krishna.</p>
      
      <form onSubmit={handleAuth} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {!isLogin && (
          <input 
            type="text" 
            placeholder="Full Name / Spiritual Name" 
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '1rem' }}
          />
        )}
        <input 
          type="email" 
          placeholder="Email address" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '1rem' }}
        />
        <input 
          type="password" 
          placeholder="Password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: '12px', borderRadius: '8px', border: '1px solid #ccc', fontSize: '1rem' }}
        />
        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            padding: '14px', 
            background: 'var(--primary, #f97316)', 
            color: 'white', 
            border: 'none', 
            borderRadius: '8px', 
            fontWeight: 'bold', 
            cursor: 'pointer', 
            fontSize: '1rem',
            boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
          }}
        >
          {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
        </button>
      </form>
      
      <button 
        onClick={() => setIsLogin(!isLogin)} 
        style={{ marginTop: '20px', background: 'none', border: 'none', color: 'var(--primary, #f97316)', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold' }}
      >
        {isLogin ? 'New devotee? Create an account' : 'Already have an account? Sign in'}
      </button>
    </div>
  );
}