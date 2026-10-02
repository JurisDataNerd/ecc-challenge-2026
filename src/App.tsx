import { lazy, Suspense, useEffect, useState } from 'react';
import { ArrowRight, ArrowLeft, MapTrifold, Hammer, PresentationChart, MapPin, EnvelopeSimple } from '@phosphor-icons/react';
import { AccountPage, type AccountMode } from './components/AccountPage';
import { authErrorMessage, useAuth } from './lib/auth';
import { supabase } from './lib/supabase';
import { navigate, useLocation } from './lib/navigation';

const ProgramApp = lazy(() => import('./ProgramApp'));

export function Brand({ linked = true }: { linked?: boolean } = {}) {
  const content = <><img src="/assets/ecc-logo.png" width="38" height="38" alt="" /><span>Future Quest<small>ECC · SIAP IMPACT 2026</small></span></>;
  return linked ? <a className="fq-brand" href="/" aria-label="Future Quest, beranda">{content}</a> : <div className="fq-brand">{content}</div>;
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
  if (isDemo || isParticipant) return <div className={`experience-program ${/^\/(demo|play)\/stage\/[123]$/.test(path) ? 'is-playing' : ''}`}>
    <div className="experience-session"><a href="/" aria-label="Kembali ke beranda"><ArrowLeft size={15} /> Beranda</a><span>{isDemo ? 'Mode demo · progres simulasi' : `${auth.session?.user.email} ? progres simulasi`}</span>{isDemo ? <a href={auth.session ? "/play" : "/login"}>{auth.session ? "Lanjutkan perjalanan" : "Login peserta"}</a> : <button onClick={logout} disabled={loggingOut}>{loggingOut ? 'Keluar…' : 'Logout'}</button>}</div>
    {logoutError && <div className="session-error" role="alert">{logoutError}</div>}
    <div className="experience-program-body"><Suspense fallback={<div className="experience-loading" role="status">Menyiapkan ekspedisi…</div>}><ProgramApp key={isDemo ? 'demo' : auth.session!.user.id} mode={isDemo ? 'demo' : 'participant'} participantId={isDemo ? undefined : auth.session!.user.id} /></Suspense></div>
  </div>;
  const accountMode: AccountMode | null = path === '/login' ? 'login' : path === '/forgot-password' ? 'forgot' : path === '/auth/accept-invite' ? 'invite' : path === '/auth/reset-password' || path === '/auth/callback' ? 'recovery' : null;
  if (accountMode) return <div className="public-experience"><header className="public-nav"><Brand /><a href="/demo">Coba demo</a></header>{auth.loading ? <div className="account-loading" role="status">Memeriksa akun…</div> : <AccountPage key={accountMode} mode={accountMode} session={auth.session} callbackError={auth.error} linkKind={auth.linkKind} />}</div>;
  if (path !== '/') return <div className="public-experience"><header className="public-nav"><Brand /></header><main className="missing-page"><h1>Jalur ini belum ditemukan.</h1><p>Kembali ke beranda untuk login atau mencoba ekspedisi.</p><a className="entry-button entry-primary" href="/">Ke beranda</a></main></div>;
  return <div className="public-experience">
    <a className="skip-link" href="#journey">Langsung ke konten</a>
    <header className="public-nav"><Brand /><nav aria-label="Navigasi utama"><a href="#stages">Tentang perjalanan</a><a className="entry-button entry-secondary" href={auth.session ? "/play" : "/login"}>{auth.session ? "Lanjutkan perjalanan" : "Login"}</a></nav></header>
    <main id="journey">
      <section className="landing-hero">
        <div className="hero-copy"><p className="program-name">Program SIAP IMPACT 2026</p><h1>Perjalanan belajar yang bisa kamu jelajahi.</h1><p className="hero-description">Temukan masalah, bangun solusi, lalu ceritakan dampaknya. Future Quest membawa perjalanan bootcamp-mu ke dalam dunia yang bisa kamu mainkan.</p><div className="entry-actions"><a className="entry-button entry-primary" href="/demo">Coba demo <ArrowRight size={18} /></a><a className="entry-button entry-secondary" href={auth.session ? "/play" : "/login"}>{auth.session ? "Lanjutkan perjalanan" : "Login peserta"}</a></div><p className="entry-caption">Demo terbuka untuk semua. Akun peserta melalui undangan ECC.</p></div>
        <figure className="hero-landscape"><img src="/assets/landing/ecc_future_quest_keyart.png" width="1000" height="600" alt="ECC Future Quest - The Journey of Impact Key Visual" /></figure>
      </section>
      <section className="landing-stages" id="stages" aria-labelledby="stage-heading"><div className="stage-intro"><h2>Tiga stage. Satu perjalanan milikmu.</h2><p>Bergerak di peta, temukan papan misi, dan kerjakan tantangan sesuai jalur programmu. Kembali ke peta ekspedisi kapan pun untuk berpindah stage.</p></div><ol className="landing-route">
        <li><MapTrifold size={28} weight="duotone" /><div><span className="pixel-label">L1 · Discover</span><h3>Mulai dari rasa ingin tahu.</h3><p>Amati pengalaman nyata dan temukan masalah yang layak diselesaikan.</p></div></li>
        <li><Hammer size={28} weight="duotone" /><div><span className="pixel-label">L2 · Build</span><h3>Wujudkan idemu.</h3><p>Bangun prototipe, uji dengan pengguna, dan pelajari hasilnya.</p></div></li>
        <li><PresentationChart size={28} weight="duotone" /><div><span className="pixel-label">L3 · Pitch</span><h3>Ceritakan hasil perjalanan.</h3><p>Sempurnakan solusi dan siapkan presentasi finalmu.</p></div></li>
      </ol></section>
      <section className="landing-invitation"><div><h2>Sudah menjadi peserta?</h2><p>Gunakan undangan ECC untuk mengaktifkan akun, lalu lanjutkan ekspedisimu.</p></div><a className="entry-button entry-secondary" href={auth.session ? "/play" : "/login"}>{auth.session ? "Lanjutkan perjalanan" : "Login peserta"}</a></section>
    </main>
    <footer className="public-footer">
      <div className="footer-main">
        <div className="footer-about"><Brand linked={false} /><p>Future Quest adalah perjalanan belajar interaktif dalam program SIAP IMPACT 2026. Jelajahi stage, kerjakan tantangan, dan bangun dampakmu.</p></div>
        <nav aria-label="Navigasi Future Quest"><h2>Future Quest</h2><a href="#journey">Tentang</a><a href="#stages">Tiga stage</a><a href="/demo">Coba demo</a></nav>
        <nav aria-label="Ekosistem ECC"><h2>Ekosistem ECC</h2><a href="https://ecc.co.id/">Situs ECC</a><a href="https://ecc.co.id/products/opa">Career Match Engine</a><a href="https://ecc.co.id/products/oas">Online Assessment &amp; Selection</a></nav>
        <div className="footer-contact"><h2>Kontak</h2><p><MapPin size={18} aria-hidden="true" /><span><strong>Gedung PDIN, Yogyakarta</strong><br /><span className="footer-address-detail">Lantai 2, Jl. C. Simanjuntak No. 19, Terban, Daerah Istimewa Yogyakarta 55223, Indonesia</span></span></p><a href="mailto:business@ecc.co.id"><EnvelopeSimple size={18} aria-hidden="true" />business@ecc.co.id</a></div>
      </div>
      <div className="footer-bottom"><span>© 2026 PT Engineering Career Center. Seluruh hak dilindungi.</span><div className="footer-social" aria-label="Media sosial ECC"><a href="https://www.instagram.com/ecc.co.id" aria-label="Instagram ECC"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><rect width="20" height="20" x="2" y="2" rx="5" /><path d="M16 11.37A4 4 0 1 1 12.63 8A4 4 0 0 1 16 11.37m1.5-4.87h.01" /></svg></a><a href="https://id.linkedin.com/company/ecccoid" aria-label="LinkedIn ECC"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2a2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6M2 9h4v12H2z" /><circle cx="4" cy="4" r="2" /></svg></a><a href="https://www.facebook.com/ecccoid" aria-label="Facebook ECC"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" /></svg></a><a href="https://www.youtube.com/channel/UCpZ8jpedlSssDIbT9344N6Q" aria-label="YouTube ECC"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M2.5 17a24.1 24.1 0 0 1 0-10a2 2 0 0 1 1.4-1.4a49.6 49.6 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.1 24.1 0 0 1 0 10a2 2 0 0 1-1.4 1.4a49.6 49.6 0 0 1-16.2 0A2 2 0 0 1 2.5 17" /><path d="m10 15l5-3l-5-3z" /></svg></a></div></div>
    </footer>
  </div>;
}
