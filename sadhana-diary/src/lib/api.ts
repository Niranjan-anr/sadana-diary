import { supabase } from './supabase';

// Get or create today's sadhana log for the logged-in user
export async function getTodayLog(userId: string) {
  const today = new Date().toISOString().split('T')[0];

  // Try fetching today's row
  let { data, error } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('log_date', today)
    .single();

  // If no row exists for today yet, create one automatically
  if (error || !data) {
    const { data: newData, error: insertError } = await supabase
      .from('daily_logs')
      .insert([{ user_id: userId, log_date: today, japa_rounds: 0 }])
      .select()
      .single();

    if (insertError) {
      console.error('Error creating daily log:', insertError.message);
      return null;
    }
    return newData;
  }

  return data;
}

// Update Japa rounds in Supabase
export async function updateJapaRounds(userId: string, rounds: number) {
  const today = new Date().toISOString().split('T')[0];
  await supabase
    .from('daily_logs')
    .update({ japa_rounds: rounds })
    .eq('user_id', userId)
    .eq('log_date', today);
}

// Update sleep or wake time in Supabase
export async function updateField(userId: string, field: 'wake_time' | 'sleep_time', value: string) {
  const today = new Date().toISOString().split('T')[0];
  await supabase
    .from('daily_logs')
    .update({ [field]: value })
    .eq('user_id', userId)
    .eq('log_date', today);
}

// Save a completed reading or hearing session
export async function saveStudySession(
  userId: string, 
  sessionType: 'reading' | 'hearing', 
  materialTitle: string, 
  durationSeconds: number, 
  notes?: string
) {
  const today = new Date().toISOString().split('T')[0];
  
  const { error } = await supabase
    .from('study_sessions')
    .insert([{
      user_id: userId,
      log_date: today,
      session_type: sessionType,
      material_title: materialTitle,
      duration_seconds: durationSeconds,
      notes: notes || null
    }]);

  if (error) {
    console.error('Error saving study session:', error.message);
    alert('Failed to save session. Please try again.');
  } else {
    alert('Session saved successfully to your Sadhana diary!');
  }
}
// Fetch total reading and hearing seconds for today from study_sessions
export async function getTodayStudyTotals(userId: string) {
  const today = new Date().toISOString().split('T')[0];
  
  const { data, error } = await supabase
    .from('study_sessions')
    .select('session_type, duration_seconds')
    .eq('user_id', userId)
    .eq('log_date', today);

  if (error || !data) {
    return { reading: 0, hearing: 0 };
  }

  let reading = 0;
  let hearing = 0;

  data.forEach((session) => {
    if (session.session_type === 'reading') {
      reading += session.duration_seconds || 0;
    } else if (session.session_type === 'hearing') {
      hearing += session.duration_seconds || 0;
    }
  });

  return { reading, hearing };
}
// Fetch past 7 days of daily logs for analytics
export async function getPastLogs(userId: string) {
  const { data, error } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('user_id', userId)
    .order('log_date', { ascending: false })
    .limit(7);

  if (error) {
    console.error('Error fetching past logs:', error.message);
    return [];
  }
  return data || [];
}
// Fetch user profile data (Name & Theme)
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('full_name, theme')
    .eq('id', userId)
    .single();

  if (error) return null;
  return data;
}

// Update user profile data
export async function updateUserProfile(userId: string, updates: { full_name?: string; theme?: string }) {
  await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);
}