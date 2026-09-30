import { lazy, Suspense, useEffect, useState } from 'react';
import { Compass, ArrowRight, ArrowLeft, MapTrifold, Hammer, PresentationChart } from '@phosphor-icons/react';
import './experience.css';
import { AccountPage, type AccountMode } from './components/AccountPage';
import { authErrorMessage, useAuth } from './lib/auth';
import { supabase } from './lib/supabase';
import { navigate, useLocation } from './lib/navigation';

const ProgramApp = lazy(() => import('./ProgramApp'));

export function Brand() {
  return <a className="fq-brand" href="/" aria-label="Future Quest, beranda"><Compass size={30} weight="duotone" /><span>Future Quest<small>ECC · SIAP IMPACT 2026</small></span></a>;
}

export default function App() {
  const location = useLocation();
  const path = location.split('?')[0];
  const auth = useAuth();
  const [loggingOut, setLoggingOut] = useState(false);
  const [logoutError, setLogoutError] = useState<string | null>(null);
  const isDemo = path === '/demo' || path.startsWith('/demo/');
  const isParticipant = path === '/play' || path.startsWith('/play/');
  useEffect(() => { if (isParticipant && !auth.loading && !auth.session) navigate('/login', true); }, [isParticipant, auth.loading, auth.session]);
  const logout = async () => {
    if (!supabase || loggingOut) return;
    setLoggingOut(true);
    setLogoutError(null);
    try {
      const { error } = await supabase.auth.signOut({ scope: 'local' });
      if (error) throw error;
      navigate('/login', true);
    } catch (error) { setLogoutError(authErrorMessage(error)); }
    finally { setLoggingOut(false); }
  };
  if (isParticipant && (auth.loading || !auth.session)) return <div className="experience-loading" role="status">Memeriksa sesi…</div>;
  if (isDemo || isParticipant) return <div className="experience-program">
    <div className="experience-session"><a href="/" aria-label="Kembali ke beranda"><ArrowLeft size={15} /> Beranda</a><span>{isDemo ? 'Mode demo · progres simulasi' : auth.session?.user.email}</span>{isDemo ? <a href="/login">Login peserta</a> : <button onClick={logout} disabled={loggingOut}>{loggingOut ? 'Keluar…' : 'Logout'}</button>}</div>
    {logoutError && <div className="session-error" role="alert">{logoutError}</div>}
    <div className="experience-program-body"><Suspense fallback={<div className="experience-loading" role="status">Menyiapkan ekspedisi…</div>}><ProgramApp key={isDemo ? 'demo' : auth.session!.user.id} mode={isDemo ? 'demo' : 'participant'} /></Suspense></div>
  </div>;
  const accountMode: AccountMode | null = path === '/login' ? 'login' : path === '/forgot-password' ? 'forgot' : path === '/auth/accept-invite' ? 'invite' : path === '/auth/reset-password' || path === '/auth/callback' ? 'recovery' : null;
  if (accountMode) return <div className="public-experience"><header className="public-nav"><Brand /><a href="/demo">Coba demo</a></header>{auth.loading ? <div className="account-loading" role="status">Memeriksa akun…</div> : <AccountPage key={accountMode} mode={accountMode} session={auth.session} callbackError={auth.error} linkKind={auth.linkKind} />}</div>;
  if (path !== '/') return <div className="public-experience"><header className="public-nav"><Brand /></header><main className="missing-page"><h1>Jalur ini belum ditemukan.</h1><p>Kembali ke beranda untuk login atau mencoba ekspedisi.</p><a className="entry-button entry-primary" href="/">Ke beranda</a></main></div>;
  return <div className="public-experience">
    <a className="skip-link" href="#journey">Langsung ke konten</a>
    <header className="public-nav"><Brand /><nav aria-label="Navigasi utama"><a href="#stages">Tentang perjalanan</a><a className="entry-button entry-secondary" href="/login">Login</a></nav></header>
    <main id="journey">
      <section className="landing-hero">
        <div className="hero-copy"><p className="program-name">Program SIAP IMPACT 2026</p><h1>Perjalanan belajar yang bisa kamu jelajahi.</h1><p className="hero-description">Temukan masalah, bangun solusi, lalu ceritakan dampaknya. Future Quest membawa perjalanan bootcamp-mu ke dalam dunia yang bisa kamu mainkan.</p><div className="entry-actions"><a className="entry-button entry-primary" href="/demo">Coba demo <ArrowRight size={18} /></a><a className="entry-button entry-secondary" href="/login">Login peserta</a></div><p className="entry-caption">Demo terbuka untuk semua. Akun peserta melalui undangan ECC.</p></div>
        <figure className="hero-landscape"><img src="/assets/mixel/Sample%20640x640.PNG" width="640" height="640" alt="Dunia pixel Future Quest, dengan jalan setapak, taman, dan tempat eksplorasi" /><figcaption><span className="pixel-label">Future Base</span><span>Titik awal perjalananmu</span></figcaption></figure>
      </section>
      <section className="landing-stages" id="stages" aria-labelledby="stage-heading"><div className="stage-intro"><h2>Tiga stage. Satu perjalanan milikmu.</h2><p>Bergerak di peta, temukan papan misi, dan kerjakan tantangan sesuai jalur programmu. Kembali ke peta ekspedisi kapan pun untuk berpindah stage.</p></div><ol className="landing-route">
        <li><MapTrifold size={28} weight="duotone" /><div><span className="pixel-label">L1 · Discover</span><h3>Mulai dari rasa ingin tahu.</h3><p>Amati pengalaman nyata dan temukan masalah yang layak diselesaikan.</p></div></li>
        <li><Hammer size={28} weight="duotone" /><div><span className="pixel-label">L2 · Build</span><h3>Wujudkan idemu.</h3><p>Bangun prototipe, uji dengan pengguna, dan pelajari hasilnya.</p></div></li>
        <li><PresentationChart size={28} weight="duotone" /><div><span className="pixel-label">L3 · Pitch</span><h3>Ceritakan hasil perjalanan.</h3><p>Sempurnakan solusi dan siapkan presentasi finalmu.</p></div></li>
      </ol></section>
      <section className="landing-invitation"><div><h2>Sudah menjadi peserta?</h2><p>Gunakan undangan ECC untuk mengaktifkan akun, lalu lanjutkan ekspedisimu.</p></div><a className="entry-button entry-secondary" href="/login">Login peserta</a></section>
    </main>
    <footer className="public-footer"><span>ECC · SIAP IMPACT 2026</span><span>Professional · Social Impact · Bisnis</span></footer>
  </div>;
}
