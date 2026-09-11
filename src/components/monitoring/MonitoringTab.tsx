import { useState } from 'react';
import { Card, Badge, Button, Select, Textarea, BottomSheet } from '../common';
import type { MonitoringEntry, MonitoringStatus } from '../../types';
import { MONITORING_LABEL, formatDateShort } from '../../utils/format';
import { MONITORING_STATUSES } from '../../constants';
import { monitoringApi } from '../../services/domainApi';
import { useToast } from '../../contexts/ToastContext';
import { ApiError } from '../../services/api';

const STATUS_COLOR: Record<string, 'emerald' | 'amber' | 'red' | 'ink'> = {
  AKTIF: 'emerald',
  PERLU_PERHATIAN: 'amber',
  KURANG_AKTIF: 'amber',
  TIDAK_AKTIF: 'red'
};

export function MonitoringTab({
  memberId,
  entries,
  canWrite,
  onSaved
}: {
  memberId: string;
  entries: MonitoringEntry[];
  canWrite: boolean;
  onSaved: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<MonitoringStatus>('AKTIF');
  const [catatan, setCatatan] = useState('');
  const [tindakLanjut, setTindakLanjut] = useState('');
  const [saving, setSaving] = useState(false);
  const { showToast } = useToast();

  async function handleSave() {
    setSaving(true);
    try {
      await monitoringApi.create({ member_id: memberId, status, catatan, tindak_lanjut: tindakLanjut });
      showToast('Catatan monitoring disimpan');
      setOpen(false);
      setCatatan('');
      setTindakLanjut('');
      onSaved();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Gagal menyimpan monitoring', 'error');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-2">
      {canWrite && (
        <Button variant="secondary" fullWidth onClick={() => setOpen(true)}>
          + Catatan Monitoring Baru
        </Button>
      )}
      {entries.length === 0 && (
        <Card><p className="text-ios-subhead text-surface-muted text-center py-4">Belum ada histori monitoring.</p></Card>
      )}
      {entries.map((m) => (
        <Card key={m.monitoring_id}>
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-ios-caption text-surface-muted">{formatDateShort(m.tanggal)}</span>
            <Badge color={STATUS_COLOR[m.status] || 'ink'}>{MONITORING_LABEL[m.status]}</Badge>
          </div>
          {m.catatan && <p className="text-ios-subhead text-surface-text mb-1">{m.catatan}</p>}
          {m.tindak_lanjut && <p className="text-ios-footnote text-surface-muted">Tindak lanjut: {m.tindak_lanjut}</p>}
        </Card>
      ))}

      <BottomSheet open={open} onClose={() => setOpen(false)} title="Catatan Monitoring">
        <Select label="Status Pembinaan" value={status} onChange={(e) => setStatus(e.target.value as MonitoringStatus)}>
          {MONITORING_STATUSES.map((s) => <option key={s} value={s}>{MONITORING_LABEL[s]}</option>)}
        </Select>
        <Textarea label="Catatan" value={catatan} onChange={(e) => setCatatan(e.target.value)} placeholder="Ceritakan kondisi jamaah..." />
        <Textarea label="Tindak Lanjut" value={tindakLanjut} onChange={(e) => setTindakLanjut(e.target.value)} placeholder="Langkah yang akan/sudah dilakukan..." />
        <Button fullWidth onClick={handleSave} disabled={saving}>{saving ? 'Menyimpan...' : 'Simpan'}</Button>
      </BottomSheet>
    </div>
  );
}
