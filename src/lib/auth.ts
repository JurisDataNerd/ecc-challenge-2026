import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { navigate } from './navigation';

export type PasswordLinkKind = 'invite' | 'recovery';
type AuthState = { loading: boolean; session: Session | null; error: string | null; linkKind: PasswordLinkKind | null };
const LINK_KEY = 'fq:password-link';
let initialization: Promise<AuthState> | null = null;

export function authErrorMessage(error: unknown) {
  const code = typeof error === 'object' && error && 'code' in error ? String(error.code) : '';
  if (code === 'invalid_credentials') return 'Email atau kata sandi tidak sesuai. Periksa kembali lalu coba lagi.';
  if (code === 'email_not_confirmed') return 'Aktifkan akun melalui undangan ECC sebelum login.';
  if (code === 'over_email_send_rate_limit' || code === 'over_request_rate_limit') return 'Terlalu banyak percobaan. Tunggu beberapa menit lalu coba lagi.';
  if (code === 'weak_password' || code === 'same_password') return 'Gunakan kata sandi baru yang lebih kuat dan berbeda dari sebelumnya.';
  if (code === 'otp_expired' || code === 'otp_disabled' || code === 'bad_code_verifier') return 'Tautan sudah tidak berlaku. Minta undangan baru atau gunakan Lupa kata sandi.';
  return 'Permintaan belum berhasil. Periksa koneksi lalu coba lagi.';
}

export function clearPasswordLink() {
  try { sessionStorage.removeItem(LINK_KEY); } catch { /* Session remains managed by Supabase. */ }
}

export function hasPasswordLink(session: Session | null, kind: PasswordLinkKind) {
  if (!session) return false;
  try {
    const saved = JSON.parse(sessionStorage.getItem(LINK_KEY) || 'null');
    return saved?.kind === kind && saved.userId === session.user.id && Date.now() - saved.createdAt < 15 * 60 * 1000;
  } catch { return false; }
}

async function initialize(): Promise<AuthState> {
  const empty: AuthState = { loading: false, session: null, error: null, linkKind: null };
  if (!supabase) return empty;
  const url = new URL(window.location.href);
  const hash = new URLSearchParams(url.hash.slice(1));
  const rawKind = url.searchParams.get('type') || hash.get('type');
  const kind = rawKind === 'invite' || rawKind === 'recovery' ? rawKind : null;
  const hasCallback = url.searchParams.has('token_hash') || url.searchParams.has('code') || hash.has('access_token') || hash.has('error') || url.searchParams.has('error');
  try {
    let session: Session | null = null;
    if (hasCallback) {
      const callbackPath = kind === 'invite' ? '/auth/accept-invite' : kind === 'recovery' ? '/auth/reset-password' : url.pathname;
      navigate(callbackPath, true); // Remove link credentials from URL/referrers before any asynchronous work.
      if (hash.has('error') || url.searchParams.has('error')) return { ...empty, error: 'Tautan sudah tidak berlaku. Minta undangan baru atau gunakan Lupa kata sandi.' };
      let result;
      if (url.searchParams.has('token_hash') && kind) {
        result = await supabase.auth.verifyOtp({ token_hash: url.searchParams.get('token_hash')!, type: kind });
      } else if (hash.get('access_token') && hash.get('refresh_token')) {
        result = await supabase.auth.setSession({ access_token: hash.get('access_token')!, refresh_token: hash.get('refresh_token')! });
      } else if (url.searchParams.get('code')) {
        result = await supabase.auth.exchangeCodeForSession(url.searchParams.get('code')!);
      } else return { ...empty, error: 'Tautan tidak lengkap. Buka kembali tautan dari email ECC.' };
      if (result.error) return { ...empty, error: authErrorMessage(result.error) };
      session = result.data.session;
      const effectiveKind = kind || (url.pathname === '/auth/reset-password' ? 'recovery' : url.pathname === '/auth/accept-invite' ? 'invite' : null);
      if (session && effectiveKind) {
        try { sessionStorage.setItem(LINK_KEY, JSON.stringify({ kind: effectiveKind, userId: session.user.id, createdAt: Date.now() })); } catch { /* The current callback state still permits this form. */ }
        return { ...empty, session, linkKind: effectiveKind };
      }
    } else {
      const result = await supabase.auth.getSession();
      if (result.error) return { ...empty, error: authErrorMessage(result.error) };
      session = result.data.session;
    }
    if (session) {
      const verified = await supabase.auth.getUser();
      if (verified.error || !verified.data.user) {
        await supabase.auth.signOut({ scope: 'local' });
        return { ...empty, error: 'Sesi berakhir. Silakan login kembali.' };
      }
    }
    return { ...empty, session };
  } catch (error) { return { ...empty, error: authErrorMessage(error) }; }
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({ loading: true, session: null, error: null, linkKind: null });
  useEffect(() => {
    let disposed = false;
    let initialized = false;
    initialization ??= initialize(); // One-use invitation/recovery tokens must survive StrictMode's remount.
    void initialization.then(result => { initialized = true; if (!disposed) setState(result); });
    const subscription = supabase?.auth.onAuthStateChange((event, session) => {
      if (!initialized || disposed || event === 'INITIAL_SESSION') return;
      if (event === 'SIGNED_OUT') clearPasswordLink();
      setState(current => ({ ...current, session, error: null, linkKind: event === 'SIGNED_OUT' ? null : current.linkKind }));
    });
    return () => { disposed = true; subscription?.data.subscription.unsubscribe(); };
  }, []);
  return state;
}
