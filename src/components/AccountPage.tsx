import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Eye, EyeSlash } from '@phosphor-icons/react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { authErrorMessage, clearPasswordLink, hasPasswordLink, type PasswordLinkKind } from '../lib/auth';
import { navigate } from '../lib/navigation';

export type AccountMode = 'login' | 'forgot' | 'invite' | 'recovery';

export function AccountPage({ mode, session, callbackError, linkKind }: {
  mode: AccountMode;
  session: Session | null;
  callbackError: string | null;
  linkKind: PasswordLinkKind | null;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [loginSucceeded, setLoginSucceeded] = useState(false);
  const isPasswordSetup = mode === 'invite' || mode === 'recovery';
  const passwordUpdated = mode === 'login' && new URLSearchParams(window.location.search).get('password') === 'updated';
  const hasActiveSession = mode === 'login' && Boolean(session) && !passwordUpdated;
  const validLink = isPasswordSetup && Boolean(session && (linkKind === mode || hasPasswordLink(session, mode)));
  const message = error || callbackError || (isPasswordSetup && !validLink ? 'Tautan tidak berlaku atau sudah digunakan. Minta undangan baru dari ECC atau gunakan Lupa kata sandi.' : null);
  const title = { login: 'Selamat datang kembali.', forgot: 'Lupa kata sandi?', invite: 'Mulai perjalananmu.', recovery: 'Buat kata sandi baru.' }[mode];
  const description = { login: 'Login dengan akun yang diundang oleh ECC untuk melanjutkan perjalananmu.', forgot: 'Masukkan email akunmu. Kami akan mengirim tautan untuk membuat kata sandi baru.', invite: 'Undanganmu sudah dikonfirmasi. Buat kata sandi untuk mengaktifkan akses Future Quest.', recovery: 'Pilih kata sandi baru untuk mengamankan akunmu.' }[mode];

  useEffect(() => { if (loginSucceeded && session) navigate('/play', true); }, [loginSucceeded, session]);

  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (busy || !supabase) return;
    setError(null);
    if (isPasswordSetup && password !== confirmation) { setError('Kedua kata sandi belum sama. Periksa kembali.'); return; }
    if (isPasswordSetup && !validLink) return;
    setBusy(true);
    try {
      if (mode === 'login') {
        const result = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (result.error) throw result.error;
        if (!result.data.session) throw new Error('Missing session');
        setLoginSucceeded(true); // The route guard must see the restored session before entering /play.
      } else if (mode === 'forgot') {
        const result = await supabase.auth.resetPasswordForEmail(email.trim(), { redirectTo: `${window.location.origin}/auth/reset-password` });
        if (result.error) throw result.error;
        setSent(true);
      } else {
        const result = await supabase.auth.updateUser({ password });
        if (result.error) throw result.error;
        clearPasswordLink();
        if (mode === 'invite') navigate('/play', true);
        else {
          const logout = await supabase.auth.signOut({ scope: 'local' });
          if (logout.error) throw logout.error;
          navigate('/login?password=updated', true);
        }
      }
    } catch (cause) { setError(authErrorMessage(cause)); }
    finally { setBusy(false); }
  };

  return <main className="account-layout"><div className="account-art" aria-hidden="true" /><section className="account-panel">
    <a className="back-link" href="/"><ArrowLeft size={17} /> Beranda</a><h1>{title}</h1><p>{description}</p>
    {!supabase && <div className="account-note" role="status">Login belum tersedia. Coba demo atau hubungi tim program ECC untuk akses akun.</div>}
    {message && <div className="account-feedback account-error" role="alert">{message}</div>}
    {passwordUpdated && <div className="account-feedback" role="status">Kata sandi sudah diperbarui. Login dengan kata sandi barumu.</div>}
    {hasActiveSession ? <div className="account-feedback" role="status"><p>Kamu sudah login. Lanjutkan perjalanan dari akun yang sedang aktif.</p><a className="entry-button entry-primary" href="/play">Lanjutkan perjalanan</a></div> : sent ? <div className="account-feedback" role="status"><strong>Periksa emailmu.</strong><p>Jika email terdaftar, tautan reset akan dikirim. Periksa juga folder spam. Kamu bisa kembali login setelah mengganti kata sandi.</p><a className="entry-button entry-secondary" href="/login">Kembali login</a></div> : <form className="account-form" onSubmit={submit}>
      {!isPasswordSetup && <label htmlFor="account-email">Email<input id="account-email" type="email" name="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} placeholder="nama@email.com" disabled={busy} /></label>}
      {mode !== 'forgot' && <label htmlFor="account-password">{isPasswordSetup ? 'Kata sandi baru' : 'Kata sandi'}<div className="password-input"><input id="account-password" type={showPassword ? 'text' : 'password'} name="password" autoComplete={isPasswordSetup ? 'new-password' : 'current-password'} minLength={isPasswordSetup ? 12 : undefined} required value={password} onChange={e => setPassword(e.target.value)} disabled={busy || (isPasswordSetup && !validLink)} /><button type="button" aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'} aria-pressed={showPassword} onClick={() => setShowPassword(value => !value)}>{showPassword ? <EyeSlash size={19} /> : <Eye size={19} />}</button></div>{isPasswordSetup && <small>Minimal 12 karakter. Gunakan kata sandi yang belum kamu pakai di layanan lain.</small>}</label>}
      {isPasswordSetup && <label htmlFor="account-confirmation">Ulangi kata sandi<input id="account-confirmation" name="confirmation" type={showPassword ? 'text' : 'password'} autoComplete="new-password" minLength={12} required value={confirmation} onChange={e => setConfirmation(e.target.value)} disabled={busy || !validLink} /></label>}
      {mode === 'login' && <a className="forgot-link" href="/forgot-password">Lupa kata sandi?</a>}
      <button className="entry-button entry-primary" type="submit" disabled={!supabase || busy || (isPasswordSetup && !validLink)}>{busy ? 'Memproses…' : mode === 'login' ? 'Login' : mode === 'forgot' ? 'Kirim tautan reset' : 'Simpan kata sandi'}{!busy && <ArrowRight size={18} />}</button>
    </form>}
    {isPasswordSetup && !validLink && <a className="forgot-link" href="/forgot-password">Minta tautan reset</a>}
    <p className="account-help">Belum menerima undangan? Hubungi tim program ECC.</p><a className="back-link" href="/demo">Jelajahi demo tanpa akun <ArrowRight size={15} /></a>
  </section></main>;
}
