'use client';
import { useEffect, useState } from 'react';
import { api } from '../api';
import Icon from '../Icons';
import { MiniCountdown } from '../Countdown';
import { Avatar } from '../ProfileCard';
import { Empty, Spinner } from '../ui';
import { useAdmin } from './ctx';

export default function Overview() {
  const { openKey, openUser, offset } = useAdmin();
  const [s, setS] = useState(null);
  const [err, setErr] = useState('');
  useEffect(() => { api('/api/admin/stats').then(setS).catch((e) => setErr(e.message)); }, []);
  if (err) return <div className="chk-err"><Icon n="alert" size={16} />{err}</div>;
  if (!s) return <div className="loading"><Spinner size={22} /></div>;

  const tiles = [
    ['key', 'คีย์ทั้งหมด', s.total, ''], ['shieldCheck', 'ใช้งานได้', s.active, 'ok'], ['timer', 'ยังไม่เริ่มใช้', s.unused, ''],
    ['clock', 'หมดอายุ', s.expired, 'bad'], ['ban', 'ถูกระงับ', s.revoked, 'bad'], ['users', 'ผู้ใช้ล็อกอิน', s.users, ''],
  ];
  const max = Math.max(1, ...s.daily.map((d) => d.n));
  return (
    <div className="ov">
      <div className="tiles tiles-6">
        {tiles.map(([ic, l, v, tone]) => (
          <div key={l} className={`tile tile-ic ${tone ? 'tile-' + tone : ''}`}><Icon n={ic} size={18} /><span>{l}</span><b>{v.toLocaleString('th-TH')}</b></div>
        ))}
      </div>
      <div className="ov-grid">
        <section className="card">
          <h3>คีย์ที่ออก 14 วันล่าสุด</h3>
          <div className="bars" role="img" aria-label="กราฟจำนวนคีย์ที่ออกต่อวัน">
            {s.daily.map((d) => (
              <div key={d.day} className="bar" title={`${d.day}: ${d.n} คีย์`}>
                <span style={{ height: `${Math.max(4, (d.n / max) * 100)}%` }} data-z={d.n === 0 ? '1' : undefined} />
                <i>{d.day.slice(8)}</i>
              </div>
            ))}
          </div>
        </section>
        <section className="card">
          <h3>ใกล้หมดอายุใน 7 วัน</h3>
          {s.expiring.length === 0 ? <Empty icon="shieldCheck" title="ยังไม่มีคีย์ที่ใกล้หมดอายุ" /> : (
            <ul className="mini-list">
              {s.expiring.map((k) => (
                <li key={k.id}>
                  <button className="row-btn" onClick={() => openKey(k.id)}><code>{k.key}</code><MiniCountdown status={k.status} expiresAt={k.expires_at} duration={k.duration_seconds} offset={offset} /></button>
                  {k.owner && <button className="owner" onClick={() => openUser(k.owner.id)}><Avatar p={k.owner} size={22} /><span>{k.owner.name}</span></button>}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
