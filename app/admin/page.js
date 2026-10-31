import { notFound } from 'next/navigation';
import { getUser } from '@/lib/auth';
import { getSettings } from '@/lib/settings';
import { ADMIN_PATH } from '@/lib/adminPath';
import { publicProfile } from '@/lib/discord';
import Nav from '@/components/Nav';
import Admin from '@/components/Admin';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'หลังบ้าน', robots: { index: false, follow: false } };

export default async function AdminPage() {
  const u = await getUser();
  if (!u || u.role !== 'admin') notFound(); // คนทั่วไปเห็นเป็น 404 ไม่รู้ว่ามีหลังบ้าน
  const s = await getSettings();
  return (
    <>
      <Nav user={{ ...publicProfile(u), role: u.role }} siteName={s.site_name} adminPath={ADMIN_PATH} />
      <main className="wrap wrap-wide"><Admin serverTime={Date.now()} /></main>
    </>
  );
}
