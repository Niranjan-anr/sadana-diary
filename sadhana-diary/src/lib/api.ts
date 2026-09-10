import { supabase } from './supabase';

// Get or create today's sadhana log for the logged-in user
export async function getTodayLog(userId: string) {
  const today = new Date().toISOString().split('T')[0];

  let { data, error } = await supabase
    .from('daily_logs')
    .select('*')
    .eq('user_id', userId)
    .eq('log_date', today)
    .single();

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

export async function updateJapaRounds(userId: string, rounds: number) {
  const today = new Date().toISOString().split('T')[0];
  await supabase
    .from('daily_logs')
    .update({ japa_rounds: rounds })
    .eq('user_id', userId)
    .eq('log_date', today);
}

export async function updateField(userId: string, field: 'wake_time' | 'sleep_time', value: string) {
  const today = new Date().toISOString().split('T')[0];
  await supabase
    .from('daily_logs')
    .update({ [field]: value })
    .eq('user_id', userId)
    .eq('log_date', today);
}

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

// Fetch user profile data (Name, Theme, Role) — FIXED: was two chained
// .select() calls, and the second one was silently overwriting the first,
// dropping `role` every time.
export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('full_name, theme, role')
    .eq('id', userId)
    .single();

  if (error) return null;
  return data;
}

export async function updateUserProfile(userId: string, updates: { full_name?: string; theme?: string }) {
  await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId);
}

export async function getSadhakaTarget(userId: string) {
  const { data } = await supabase
    .from('sadhaka_targets')
    .select('min_rounds, min_reading_seconds, min_hearing_seconds')
    .eq('sadhaka_id', userId)
    .maybeSingle();
  return data;
}

export async function getTodayReport(userId: string) {
  const today = new Date().toISOString().split('T')[0];
  const { data } = await supabase
    .from('daily_reports')
    .select('id')
    .eq('sadhaka_id', userId)
    .eq('report_date', today)
    .maybeSingle();
  return data;
}

export async function submitDailyReport(
  userId: string,
  report: {
    wake_time: string | null;
    sleep_time: string | null;
    japa_rounds: number;
    reading_seconds: number;
    hearing_seconds: number;
    target_rounds: number;
    target_reading_seconds: number;
    target_hearing_seconds: number;
    submitted_by: 'manual' | 'auto_midnight';
  }
) {
  const today = new Date().toISOString().split('T')[0];
  const { error } = await supabase.from('daily_reports').insert({
    sadhaka_id: userId,
    report_date: today,
    ...report,
  });
  if (error) throw error;
}

export async function getMentorSadhakas(mentorId: string) {
  const today = new Date().toISOString().split('T')[0];

  const { data: sadhakas } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('mentor_id', mentorId);

  if (!sadhakas) return [];

  const { data: targets } = await supabase
    .from('sadhaka_targets')
    .select('sadhaka_id, min_rounds, min_reading_seconds, min_hearing_seconds')
    .in('sadhaka_id', sadhakas.map(s => s.id));

  const { data: reports } = await supabase
    .from('daily_reports')
    .select('sadhaka_id, japa_rounds, target_rounds, reading_seconds, target_reading_seconds, hearing_seconds, target_hearing_seconds')
    .eq('report_date', today)
    .in('sadhaka_id', sadhakas.map(s => s.id));

  return sadhakas.map((s) => {
    const target = targets?.find(t => t.sadhaka_id === s.id);
    const report = reports?.find(r => r.sadhaka_id === s.id);
    const targetRounds = report?.target_rounds ?? target?.min_rounds ?? 16;
    const completion_pct = report ? computeCompletionPct(report) : null;
    return {
      sadhaka_id: s.id,
      full_name: s.full_name || 'Unnamed',
      has_report_today: !!report,
      japa_rounds: report?.japa_rounds ?? 0,
      target_rounds: targetRounds,
      reading_seconds: report?.reading_seconds ?? 0,
      target_reading_seconds: report?.target_reading_seconds ?? target?.min_reading_seconds ?? 0,
      hearing_seconds: report?.hearing_seconds ?? 0,
      target_hearing_seconds: report?.target_hearing_seconds ?? target?.min_hearing_seconds ?? 0,
      completion_pct,
    };
  });
}

function computeCompletionPct(r: {
  japa_rounds: number; target_rounds: number;
  reading_seconds: number; target_reading_seconds: number;
  hearing_seconds: number; target_hearing_seconds: number;
}) {
  const parts: number[] = [];
  if (r.target_rounds > 0) parts.push(r.japa_rounds / r.target_rounds);
  if (r.target_reading_seconds > 0) parts.push(r.reading_seconds / r.target_reading_seconds);
  if (r.target_hearing_seconds > 0) parts.push(r.hearing_seconds / r.target_hearing_seconds);
  if (parts.length === 0) return 0;
  return parts.reduce((a, b) => a + b, 0) / parts.length;
}

export async function updateSadhakaTarget(
  sadhakaId: string,
  target: { min_rounds: number; min_reading_seconds: number; min_hearing_seconds: number }
) {
  const { error } = await supabase
    .from('sadhaka_targets')
    .upsert({ sadhaka_id: sadhakaId, ...target }, { onConflict: 'sadhaka_id' });
  if (error) throw error;
}

export async function getMyMentorCode(userId: string) {
  const { data } = await supabase
    .from('profiles')
    .select('mentor_code')
    .eq('id', userId)
    .maybeSingle();
  return data?.mentor_code ?? null;
}

export async function generateMentorCode(mentorId: string) {
  const code = Math.random().toString(36).slice(2, 8).toUpperCase();
  const { error } = await supabase
    .from('profiles')
    .update({ mentor_code: code })
    .eq('id', mentorId);
  if (error) throw error;
  return code;
}

export async function joinMentorByCode(sadhakaId: string, code: string) {
  const { data, error } = await supabase.rpc('find_mentor_by_code', {
    code: code.trim().toUpperCase(),
  });
  if (error) throw error;

  const mentor = data?.[0];
  if (!mentor) throw new Error('No mentor found with that code. Double check it and try again.');

  const { error: updateErr } = await supabase
    .from('profiles')
    .update({ mentor_id: mentor.id })
    .eq('id', sadhakaId);
  if (updateErr) throw updateErr;

  return mentor.full_name as string;
}