'use client';
import { useCallback, useEffect, useState } from 'react';
import { api, fmtDate } from '../api';
import Icon from '../Icons';
import Countdown from '../Countdown';
import { Avatar, RobloxChip } from '../ProfileCard';
import { CopyBtn, Modal, Spinner, StatusBadge, useToast } from '../ui';
import Confirm from './Confirm';
import { ACTION_TH, ACTION_TONE, useAdmin } from './ctx';

export default function KeyDetail({ id, onClose, onChanged }) {
  const toast = useToast();
  const { openUser, offset } = useAdmin();
  const [d, setD] = useState(null);
  const [days, setDays] = useState('7');
  const [owner, setOwner] = useState('');
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [del, setDel] = useState(false);

  const load = useCallback(async () => {
    try { const r = await api(`/api/admin/keys/${id}`); setD(r); setOwner(r.key.discord_id || ''); setNote(r.key.note || ''); }
    catch (e) { toast(e.message, 'err'); onClose(); }
  }, [id, toast, onClose]);
  useEffect(() => { load(); }, [load]);

  const act = async (a, body, msg) => {
    setBusy(true);
    try {
      const r = await api(`/api/admin/keys/${id}/${a}`, 'PUT', body);
      toast(r.key ? `คีย์ใหม่: ${r.key}` : msg || 'สำเร็จ');
      await load(); onChanged?.();
    } catch (e) { toast(e.message, 'err'); }
    setBusy(false);
  };
  const remove = async () => {
    setBusy(true);
    try { await api(`/api/admin/keys/${id}`, 'DELETE'); toast('ลบคีย์แล้ว'); onChanged?.(); onClose(); } catch (e) { toast(e.message, 'err'); }
    setBusy(false);
  };

  const k = d?.key;
  return (
    <Modal open onClose={onClose} title="รายละเอียดคีย์" wide>
      {!k ? <div className="loading"><Spinner size={22} /></div> : (
        <div className="kd">
          <div className="kd-top">
            <div>
              <div className="pass-label">{k.label || 'คีย์'}</div>
              <div className="pass-key allow-select">{k.key}</div>
              <div className="kd-tools"><StatusBadge status={k.status} /><CopyBtn text={k.key} /></div>
            </div>
            <Countdown status={k.status} expiresAt={k.expires_at} duration={k.duration_seconds} offset={offset} />
          </div>

          <div className="kd-cols">
            <section>
              <h4>ข้อมูล</h4>
              <dl className="pass-meta">
                <div><dt>เริ่มใช้งาน</dt><dd>{k.activated_at ? fmtDate(k.activated_at) : 'ยังไม่เริ่ม'}</dd></div>
                <div><dt>หมดอายุ</dt><dd>{k.lifetime ? 'ไม่มีวันหมดอายุ' : k.expires_at ? fmtDate(k.expires_at) : 'หลังใช้ครั้งแรก'}</dd></div>
                <div><dt>HWID</dt><dd className="hw"><Icon n="cpu" size={14} />{k.hwid ? <code className="allow-select">{k.hwid}</code> : <span className="dim">{k.hwid_locked ? 'ยังไม่ผูก' : 'ไม่ล็อกเครื่อง'}</span>}</dd></div>
                <div><dt>รีเซ็ต HWID / รีคีย์</dt><dd>{k.hwid_resets} / {k.rekeys} ครั้ง</dd></div>
                <div><dt>ใช้งานล่าสุด</dt><dd>{k.last_check_at ? fmtDate(k.last_check_at) : '—'}{k.last_ip ? ` · ${k.last_ip}` : ''}</dd></div>
                <div><dt>จำนวนครั้งที่ตรวจ</dt><dd>{k.uses.toLocaleString('th-TH')}</dd></div>
                <div><dt>สร้างโดย</dt><dd>{k.created_by || '—'} · {fmtDate(k.created_at)}</dd></div>
              </dl>
              {k.roblox && <><h4>โปรไฟล์ Roblox</h4><RobloxChip r={k.roblox} /></>}
              <h4>เจ้าของ (Discord)</h4>
              {k.owner ? (
                <button className="owner owner-lg" onClick={() => openUser(k.owner.id)}><Avatar p={k.owner} size={40} /><span><b>{k.owner.name}</b><small>ID {k.owner.id} · ดูโปรไฟล์</small></span></button>
              ) : <p className="dim">ยังไม่มีเจ้าของ</p>}
              <div className="inline-form">
                <input className="input mono" value={owner} onChange={(e) => setOwner(e.target.value.trim())} placeholder="Discord ID (เว้นว่าง = ปลดเจ้าของ)" />
                <button className="btn btn-sm" disabled={busy} onClick={() => act('assign', { discordId: owner }, 'เปลี่ยนเจ้าของแล้ว')}>บันทึก</button>
              </div>
              <h4>โน้ต</h4>
              <div className="inline-form">
                <input className="input" value={note} maxLength={200} onChange={(e) => setNote(e.target.value)} />
                <button className="btn btn-sm" disabled={busy} onClick={() => act('note', { note }, 'บันทึกโน้ตแล้ว')}>บันทึก</button>
              </div>
            </section>

            <section>
              <h4>จัดการ</h4>
              <div className="kd-act">
                <button className="btn" disabled={busy || !k.hwid} onClick={() => act('reset-hwid', null, 'รีเซ็ต HWID แล้ว')}><Icon n="refresh" size={16} />รีเซ็ต HWID</button>
                <button className="btn" disabled={busy} onClick={() => act('reset-hwid-quota', null, 'รีเซ็ต HWID และคืนโควต้าแล้ว')}><Icon n="gift" size={16} />รีเซ็ต + คืนโควต้า</button>
                <button className="btn" disabled={busy} onClick={() => act('rekey', null)}><Icon n="shuffle" size={16} />รีคีย์</button>
                <button className={`btn ${k.status === 'revoked' ? '' : 'btn-warn'}`} disabled={busy} onClick={() => act(k.status === 'revoked' ? 'unrevoke' : 'revoke', null, k.status === 'revoked' ? 'ปลดระงับแล้ว' : 'ระงับแล้ว')}><Icon n="ban" size={16} />{k.status === 'revoked' ? 'ปลดระงับ' : 'ระงับ'}</button>
                <button className="btn btn-danger" disabled={busy} onClick={() => setDel(true)}><Icon n="trash" size={16} />ลบคีย์</button>
              </div>
              {!k.lifetime && (
                <div className="inline-form">
                  <input className="input" type="number" step="0.5" value={days} onChange={(e) => setDays(e.target.value)} aria-label="จำนวนวัน" />
                  <button className="btn btn-sm" disabled={busy || !Number(days)} onClick={() => act('extend', { days: Number(days) }, 'ปรับเวลาแล้ว')}><Icon n="clock" size={15} />เพิ่ม/ลดเวลา (วัน)</button>
                </div>
              )}
              <h4>ประวัติ</h4>
              <ol className="tl tl-sm">
                {d.logs.length === 0 && <li className="dim">ยังไม่มีประวัติ</li>}
                {d.logs.map((l) => (
                  <li key={l.id} className={`tl-i tl-${ACTION_TONE[l.action] || 'idle'}`}>
                    <div className="tl-h"><b>{ACTION_TH[l.action] || l.action}</b><time>{fmtDate(l.at)}</time></div>
                    <div className="tl-b"><span>{l.detail}</span></div><small className="dim">{l.actor}{l.ip ? ` · ${l.ip}` : ''}</small>
                  </li>
                ))}
              </ol>
            </section>
          </div>
        </div>
      )}
      <Confirm open={del} danger yes="ลบถาวร" busy={busy} onNo={() => setDel(false)} onYes={remove} title="ลบคีย์นี้?"><p>ลบแล้วกู้คืนไม่ได้ สคริปต์ที่ใช้คีย์นี้จะตรวจไม่ผ่านทันที</p></Confirm>
    </Modal>
  );
}
