'use client';
import { useEffect, useState } from 'react';
import { api } from '../api';
import { Spinner, Switch, useToast } from '../ui';

export default function Settings() {
  const toast = useToast();
  const [s, setS] = useState(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { api('/api/admin/settings').then((r) => setS(r.settings)).catch((e) => toast(e.message, 'err')); }, [toast]);
  if (!s) return <div className="loading"><Spinner size={22} /></div>;
  const set = (k, v) => setS((o) => ({ ...o, [k]: v }));
  const save = async (e) => {
    e.preventDefault();
    setBusy(true);
    try { setS((await api('/api/admin/settings', 'PUT', s)).settings); toast('บันทึกแล้ว'); } catch (er) { toast(er.message, 'err'); }
    setBusy(false);
  };
  const F = ({ k, label, hint, type = 'text', max }) => (
    <label className="field"><span>{label}</span>
      <input className="input" type={type} value={s[k] ?? ''} maxLength={max} min={type === 'number' ? 0 : undefined} onChange={(e) => set(k, e.target.value)} />
      {hint && <small className="hint">{hint}</small>}
    </label>
  );
  return (
    <form className="settings" onSubmit={save}>
      <section className="card">
        <h3>ทั่วไป</h3>
        <F k="site_name" label="ชื่อเว็บ" max={40} />
        <F k="default_prefix" label="คำนำหน้าคีย์เริ่มต้น" hint="A–Z 0–9 ยาว 2–12 ตัว เช่น FLEXOZY" max={12} />
      </section>
      <section className="card">
        <h3>สิทธิ์ที่ผู้ใช้ทำเองได้</h3>
        <Switch checked={s.user_reset_enabled !== '0'} onChange={(v) => set('user_reset_enabled', v ? '1' : '0')} label="ให้ผู้ใช้รีเซ็ต HWID เอง" />
        <Switch checked={s.user_rekey_enabled !== '0'} onChange={(v) => set('user_rekey_enabled', v ? '1' : '0')} label="ให้ผู้ใช้รีคีย์เอง (ออกรหัสใหม่แทนอันเดิม)" />
        <div className="grid3">
          <F k="reset_cooldown_hours" label="ห่างกันอย่างน้อย (ชม.)" type="number" hint="ต่อ 1 ครั้ง · 0 = ไม่หน่วง" />
          <F k="reset_max" label="รีเซ็ต HWID สูงสุด/คีย์" type="number" hint="0 = ไม่จำกัด" />
          <F k="rekey_max" label="รีคีย์สูงสุด/คีย์" type="number" hint="0 = ไม่จำกัด" />
        </div>
        <p className="hint">แอดมินไม่ติดข้อจำกัดนี้ — รีเซ็ตให้ได้เสมอ</p>
      </section>
      <div><button className="btn btn-primary" disabled={busy}>{busy && <Spinner />}บันทึกการตั้งค่า</button></div>
    </form>
  );
}
