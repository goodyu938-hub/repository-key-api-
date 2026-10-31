import { redirect } from 'next/navigation';
import { getUser } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import { discordConfigured } from '@/lib/discord';
import Nav from '@/components/Nav';
import Icon from '@/components/Icons';

export const dynamic = 'force-dynamic';

export default async function Home({ searchParams }) {
  const [user, s, sp] = await Promise.all([getUser(), getSettings(), searchParams]);
  if (user) redirect('/dashboard');
  const authError = typeof sp?.auth_error === 'string' ? sp.auth_error.slice(0, 200) : '';
  return (
    <>
      <Nav siteName={s.site_name} />
      <main className="home">
        <section className="hero">
          <div className="hero-logo"><img src="/uploads/logo/logo-640.webp" alt="" width="84" height="84" /></div>
          <h1>{s.site_name}</h1>
          <p>เข้าสู่ระบบด้วย Discord เพื่อผูกคีย์ ดูเวลาที่เหลือ รีเซ็ต HWID และรีคีย์ได้ด้วยตัวเอง</p>
          <div className="hero-cta">
            {authError && <div className="chk-err" role="alert"><Icon n="alert" size={16} />{authError}</div>}
            {discordConfigured() ? (
              <a className="btn btn-discord btn-lg" href="/api/auth/discord"><Icon n="discord" size={20} />เข้าสู่ระบบด้วย Discord</a>
            ) : (
              <span className="chk-err"><Icon n="alert" size={16} />ยังไม่ได้ตั้งค่า Discord Login (ดู .env.example)</span>
            )}
          </div>
          <div className="hero-note">
            <span><Icon n="cpu" size={14} />HWID</span>
            <span><Icon n="shuffle" size={14} />รีคีย์</span>
            <span><Icon n="user" size={14} />โปรไฟล์ Roblox</span>
          </div>
        </section>
      </main>
      <footer className="foot"><span>© {new Date().getFullYear()} {s.site_name}</span></footer>
    </>
  );
}
