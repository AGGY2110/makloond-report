import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Trash2, ChevronDown, ChevronUp, Save, Check } from 'lucide-react';

const inp = { padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: 13, width: '100%', boxSizing: 'border-box' };
const label = { fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' };

function Field({ l, children }) {
  return <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}><span style={label}>{l}</span>{children}</div>;
}

function Section({ title, color, icon, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ background: 'var(--bg-card)', border: `1px solid var(--border)`, borderRadius: 12, overflow: 'hidden' }}>
      <button onClick={() => setOpen(!open)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        <div style={{ width: 28, height: 28, borderRadius: 7, background: color + '25', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>{icon}</div>
        <span style={{ flex: 1, fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{title}</span>
        {open ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
      </button>
      {open && <div style={{ padding: '0 18px 18px', display: 'flex', flexDirection: 'column', gap: 16, borderTop: '1px solid var(--border)' }}><div style={{ paddingTop: 16 }}>{children}</div></div>}
    </div>
  );
}

function Grid({ cols = 2, children }) {
  return <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 12 }}>{children}</div>;
}

export default function InputForm() {
  const { addReport, editingReport, setEditingReport, selectedBrand, BRAND_LABELS, BRAND_COLORS, INITIAL_REPORT, setCurrentPage } = useApp();
  const [form, setForm] = useState(() => editingReport || { ...INITIAL_REPORT, brand: selectedBrand, date: new Date().toISOString().split('T')[0] });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (editingReport) setForm(editingReport);
  }, [editingReport]);

  const set = (path, value) => {
    setForm(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let cur = copy;
      for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]];
      cur[keys[keys.length - 1]] = value;
      return copy;
    });
  };

  const handleSave = () => {
    addReport(form);
    setSaved(true);
    setEditingReport(null);
    setTimeout(() => { setSaved(false); setCurrentPage('dashboard'); }, 1200);
  };

  const brandColor = BRAND_COLORS[selectedBrand];

  // KOL affiliate helpers
  const addAffiliate = () => set('kol.affiliates_sent', [...(form.kol?.affiliates_sent || []), { nama: '', akun: '', produk: '', hpp: 0, total_biaya: 0, biaya_endorse: 0, follower: 0, gmv: 0, views_avg: 0, target_upload: '' }]);
  const removeAffiliate = (i) => set('kol.affiliates_sent', form.kol.affiliates_sent.filter((_, idx) => idx !== i));
  const setAffiliate = (i, k, v) => { const arr = [...form.kol.affiliates_sent]; arr[i] = { ...arr[i], [k]: v }; set('kol.affiliates_sent', arr); };

  const addManual = () => set('kol.manual_affiliates', [...(form.kol?.manual_affiliates || []), { nama: '', akun: '', no_tlp: '', gmv: 0, views_avg: 0, link: '' }]);
  const removeManual = (i) => set('kol.manual_affiliates', form.kol.manual_affiliates.filter((_, idx) => idx !== i));
  const setManual = (i, k, v) => { const arr = [...form.kol.manual_affiliates]; arr[i] = { ...arr[i], [k]: v }; set('kol.manual_affiliates', arr); };

  // Produk terjual helpers
  const addProduk = () => set('marketplace.produk_terjual', [...(form.marketplace?.produk_terjual || []), { nama: '', qty: 0, rupiah: 0 }]);
  const removeProduk = (i) => set('marketplace.produk_terjual', form.marketplace.produk_terjual.filter((_, idx) => idx !== i));
  const setProduk = (i, k, v) => { const arr = [...form.marketplace.produk_terjual]; arr[i] = { ...arr[i], [k]: v }; set('marketplace.produk_terjual', arr); };

  // Konten helpers
  const addKonten = () => set('konten.posts', [...(form.konten?.posts || []), { jam: '', jenis: '', link: '' }]);
  const removeKonten = (i) => set('konten.posts', form.konten.posts.filter((_, idx) => idx !== i));
  const setKonten = (i, k, v) => { const arr = [...form.konten.posts]; arr[i] = { ...arr[i], [k]: v }; set('konten.posts', arr); };

  // Komplain helpers
  const addKomplain = () => set('cs_marketplace.komplain', [...(form.cs_marketplace?.komplain || []), { id: '', keterangan: '' }]);
  const removeKomplain = (i) => set('cs_marketplace.komplain', form.cs_marketplace.komplain.filter((_, idx) => idx !== i));
  const setKomplain = (i, k, v) => { const arr = [...form.cs_marketplace.komplain]; arr[i] = { ...arr[i], [k]: v }; set('cs_marketplace.komplain', arr); };

  // Closing CS WA helpers
  const addClosing = () => set('cs_wa.closing', [...(form.cs_wa?.closing || []), { nama: '', alamat: '', no_tlp: '', akun: '', produk: '' }]);
  const removeClosing = (i) => set('cs_wa.closing', form.cs_wa.closing.filter((_, idx) => idx !== i));
  const setClosing = (i, k, v) => { const arr = [...form.cs_wa.closing]; arr[i] = { ...arr[i], [k]: v }; set('cs_wa.closing', arr); };

  const rata_belanja = form.marketplace?.konversi > 0 ? Math.round((form.marketplace?.gmv_total || 0) / form.marketplace.konversi) : 0;
  const roi_mp = form.marketplace?.spending_ads > 0 ? ((form.marketplace?.gmv_total || 0) / form.marketplace.spending_ads).toFixed(2) : 0;
  const roi_live = form.live?.spending_ads > 0 ? ((form.live?.gmv || 0) / form.live.spending_ads).toFixed(2) : 0;
  const konversi_live = form.live?.penonton > 0 ? (((form.live?.konversi || form.live?.gmv || 0) / form.live.penonton) * 100).toFixed(2) : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>Brand: <strong style={{ color: brandColor }}>{BRAND_LABELS[selectedBrand]}</strong></div>
          <Field l="Tanggal Laporan">
            <input type="date" value={form.date} onChange={e => set('date', e.target.value)} style={{ ...inp, width: 180 }} />
          </Field>
        </div>
        <button onClick={handleSave}
          style={{ padding: '12px 28px', borderRadius: 10, background: saved ? '#10b981' : brandColor, color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', gap: 8, transition: 'background 0.3s' }}>
          {saved ? <><Check size={16} /> Tersimpan!</> : <><Save size={16} /> Simpan Laporan</>}
        </button>
      </div>

      {/* TIM KOL */}
      <Section title="Tim KOL" color="#ec4899" icon="🎯" defaultOpen={true}>
        <Grid cols={2}>
          <Field l="Total Afiliasi Diundang / Invitation">
            <input type="number" value={form.kol?.total_invited || ''} onChange={e => set('kol.total_invited', +e.target.value)} style={inp} placeholder="0" />
          </Field>
          <Field l="Jumlah Afiliasi Dikirim Produk">
            <input type="number" value={form.kol?.affiliates_sent?.length || 0} readOnly style={{ ...inp, background: 'var(--bg-hover)', cursor: 'not-allowed' }} />
          </Field>
        </Grid>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={label}>Daftar Afiliasi yang Dikirim Produk</span>
            <button onClick={addAffiliate} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 7, border: '1px solid #ec4899', color: '#ec4899', background: 'transparent', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
              <Plus size={12} /> Tambah
            </button>
          </div>
          {(form.kol?.affiliates_sent || []).map((a, i) => (
            <div key={i} style={{ background: 'var(--bg-hover)', borderRadius: 10, padding: 14, marginBottom: 10, position: 'relative' }}>
              <button onClick={() => removeAffiliate(i)} style={{ position: 'absolute', top: 10, right: 10, background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={14} /></button>
              <div style={{ fontWeight: 700, fontSize: 12, color: '#ec4899', marginBottom: 10 }}>Afiliasi #{i + 1}</div>
              <Grid cols={2}>
                <Field l="Nama Afiliasi"><input value={a.nama} onChange={e => setAffiliate(i, 'nama', e.target.value)} style={inp} placeholder="Nama" /></Field>
                <Field l="Nama Akun"><input value={a.akun} onChange={e => setAffiliate(i, 'akun', e.target.value)} style={inp} placeholder="@akun" /></Field>
                <Field l="Produk Dikirim"><input value={a.produk} onChange={e => setAffiliate(i, 'produk', e.target.value)} style={inp} placeholder="Nama produk" /></Field>
                <Field l="HPP Produk (Rp)"><input type="number" value={a.hpp || ''} onChange={e => setAffiliate(i, 'hpp', +e.target.value)} style={inp} placeholder="0" /></Field>
                <Field l="Total Biaya Produk (Rp)"><input type="number" value={a.total_biaya || ''} onChange={e => setAffiliate(i, 'total_biaya', +e.target.value)} style={inp} placeholder="0" /></Field>
                <Field l="Biaya Endorse (Rp)"><input type="number" value={a.biaya_endorse || ''} onChange={e => setAffiliate(i, 'biaya_endorse', +e.target.value)} style={inp} placeholder="0" /></Field>
                <Field l="Jumlah Follower"><input type="number" value={a.follower || ''} onChange={e => setAffiliate(i, 'follower', +e.target.value)} style={inp} placeholder="0" /></Field>
                <Field l="GMV Afiliasi (Rp)"><input type="number" value={a.gmv || ''} onChange={e => setAffiliate(i, 'gmv', +e.target.value)} style={inp} placeholder="0" /></Field>
                <Field l="Avg Views 12 VT Terakhir"><input type="number" value={a.views_avg || ''} onChange={e => setAffiliate(i, 'views_avg', +e.target.value)} style={inp} placeholder="0" /></Field>
                <Field l="Target Tgl Upload Konten"><input type="date" value={a.target_upload} onChange={e => setAffiliate(i, 'target_upload', e.target.value)} style={inp} /></Field>
              </Grid>
            </div>
          ))}
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={label}>Afiliasi Manual Dihubungi</span>
            <button onClick={addManual} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 7, border: '1px solid #ec4899', color: '#ec4899', background: 'transparent', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
              <Plus size={12} /> Tambah
            </button>
          </div>
          {(form.kol?.manual_affiliates || []).map((m, i) => (
            <div key={i} style={{ background: 'var(--bg-hover)', borderRadius: 10, padding: 14, marginBottom: 10, position: 'relative' }}>
              <button onClick={() => removeManual(i)} style={{ position: 'absolute', top: 10, right: 10, background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={14} /></button>
              <div style={{ fontWeight: 700, fontSize: 12, color: '#ec4899', marginBottom: 10 }}>Manual #{i + 1}</div>
              <Grid cols={2}>
                <Field l="Nama"><input value={m.nama} onChange={e => setManual(i, 'nama', e.target.value)} style={inp} placeholder="Nama" /></Field>
                <Field l="Nama Akun"><input value={m.akun} onChange={e => setManual(i, 'akun', e.target.value)} style={inp} placeholder="@akun" /></Field>
                <Field l="No. Telepon"><input value={m.no_tlp} onChange={e => setManual(i, 'no_tlp', e.target.value)} style={inp} placeholder="08xxx" /></Field>
                <Field l="GMV (Rp)"><input type="number" value={m.gmv || ''} onChange={e => setManual(i, 'gmv', +e.target.value)} style={inp} placeholder="0" /></Field>
                <Field l="Avg Views 12 VT Terakhir"><input type="number" value={m.views_avg || ''} onChange={e => setManual(i, 'views_avg', +e.target.value)} style={inp} placeholder="0" /></Field>
                <Field l="Link Akun"><input value={m.link} onChange={e => setManual(i, 'link', e.target.value)} style={inp} placeholder="https://" /></Field>
              </Grid>
            </div>
          ))}
        </div>
      </Section>

      {/* TIM MARKETPLACE */}
      <Section title="Tim Marketplace" color="#8b5cf6" icon="🛒">
        <Grid cols={2}>
          <Field l="Spending Iklan (Rp)"><input type="number" value={form.marketplace?.spending_ads || ''} onChange={e => set('marketplace.spending_ads', +e.target.value)} style={inp} placeholder="0" /></Field>
          <Field l="GMV Total (Rp)"><input type="number" value={form.marketplace?.gmv_total || ''} onChange={e => set('marketplace.gmv_total', +e.target.value)} style={inp} placeholder="0" /></Field>
          <Field l="GMV dari Afiliasi (Rp)"><input type="number" value={form.marketplace?.gmv_affiliate || ''} onChange={e => set('marketplace.gmv_affiliate', +e.target.value)} style={inp} placeholder="0" /></Field>
          <Field l="GMV dari Konten Pribadi (Rp)"><input type="number" value={form.marketplace?.gmv_konten_pribadi || ''} onChange={e => set('marketplace.gmv_konten_pribadi', +e.target.value)} style={inp} placeholder="0" /></Field>
          <Field l="GMV dari Live (Rp)"><input type="number" value={form.marketplace?.gmv_live || ''} onChange={e => set('marketplace.gmv_live', +e.target.value)} style={inp} placeholder="0" /></Field>
          <Field l="GMV dari Shop Lain (Rp)"><input type="number" value={form.marketplace?.gmv_shop_lain || ''} onChange={e => set('marketplace.gmv_shop_lain', +e.target.value)} style={inp} placeholder="0" /></Field>
          <Field l="Traffic (Pengunjung)"><input type="number" value={form.marketplace?.traffic || ''} onChange={e => set('marketplace.traffic', +e.target.value)} style={inp} placeholder="0" /></Field>
          <Field l="Konversi (Pembeli)"><input type="number" value={form.marketplace?.konversi || ''} onChange={e => set('marketplace.konversi', +e.target.value)} style={inp} placeholder="0" /></Field>
          <Field l="Konten Tayang Menghasilkan GMV"><input type="number" value={form.marketplace?.konten_tayang_gmv || ''} onChange={e => set('marketplace.konten_tayang_gmv', +e.target.value)} style={inp} placeholder="0" /></Field>
        </Grid>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ background: 'var(--bg-hover)', borderRadius: 8, padding: '10px 14px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>Rata-rata Belanja (otomatis)</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#8b5cf6' }}>Rp {rata_belanja.toLocaleString('id-ID')}</div>
          </div>
          <div style={{ background: 'var(--bg-hover)', borderRadius: 8, padding: '10px 14px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>ROI (otomatis)</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#8b5cf6' }}>{roi_mp}x</div>
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={label}>Produk Terjual</span>
            <button onClick={addProduk} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 7, border: '1px solid #8b5cf6', color: '#8b5cf6', background: 'transparent', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
              <Plus size={12} /> Tambah Produk
            </button>
          </div>
          {(form.marketplace?.produk_terjual || []).map((p, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 140px 32px', gap: 8, marginBottom: 8, alignItems: 'end' }}>
              <Field l={i === 0 ? 'Nama Produk' : ''}><input value={p.nama} onChange={e => setProduk(i, 'nama', e.target.value)} style={inp} placeholder="Nama produk" /></Field>
              <Field l={i === 0 ? 'Pesanan (pcs)' : ''}><input type="number" value={p.qty || ''} onChange={e => setProduk(i, 'qty', +e.target.value)} style={inp} placeholder="0" /></Field>
              <Field l={i === 0 ? 'Nilai (Rp)' : ''}><input type="number" value={p.rupiah || ''} onChange={e => setProduk(i, 'rupiah', +e.target.value)} style={inp} placeholder="0" /></Field>
              <button onClick={() => removeProduk(i)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '8px 0' }}><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      </Section>

      {/* TIM LIVE */}
      <Section title="Tim Live" color="#06b6d4" icon="📡">
        <Grid cols={2}>
          <Field l="GMV Live (Rp)"><input type="number" value={form.live?.gmv || ''} onChange={e => set('live.gmv', +e.target.value)} style={inp} placeholder="0" /></Field>
          <Field l="Spending Ads (Rp)"><input type="number" value={form.live?.spending_ads || ''} onChange={e => set('live.spending_ads', +e.target.value)} style={inp} placeholder="0" /></Field>
          <Field l="Jumlah Penonton"><input type="number" value={form.live?.penonton || ''} onChange={e => set('live.penonton', +e.target.value)} style={inp} placeholder="0" /></Field>
          <Field l="Konversi (Pembeli dari Live)"><input type="number" value={form.live?.konversi || ''} onChange={e => set('live.konversi', +e.target.value)} style={inp} placeholder="0" /></Field>
        </Grid>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          <div style={{ background: 'var(--bg-hover)', borderRadius: 8, padding: '10px 14px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>ROI Live (otomatis)</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#06b6d4' }}>{roi_live}x</div>
          </div>
          <div style={{ background: 'var(--bg-hover)', borderRadius: 8, padding: '10px 14px' }}>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>% Konversi dari Penonton</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#06b6d4' }}>{konversi_live}%</div>
          </div>
        </div>
      </Section>

      {/* TIM KONTEN */}
      <Section title="Tim Konten" color="#f97316" icon="🎬">
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={label}>Konten yang Dipost ({form.konten?.posts?.length || 0} konten)</span>
            <button onClick={addKonten} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 7, border: '1px solid #f97316', color: '#f97316', background: 'transparent', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
              <Plus size={12} /> Tambah Konten
            </button>
          </div>
          {(form.konten?.posts || []).map((k, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '120px 140px 1fr 32px', gap: 8, marginBottom: 8, alignItems: 'end' }}>
              <Field l={i === 0 ? 'Jam Post' : ''}><input type="time" value={k.jam} onChange={e => setKonten(i, 'jam', e.target.value)} style={inp} /></Field>
              <Field l={i === 0 ? 'Jenis Konten' : ''}>
                <select value={k.jenis} onChange={e => setKonten(i, 'jenis', e.target.value)} style={inp}>
                  <option value="">Pilih jenis</option>
                  <option>Review Produk</option><option>Tutorial</option><option>Unboxing</option>
                  <option>Testimonial</option><option>Promo/Diskon</option><option>Edukasi</option>
                  <option>Entertainment</option><option>Behind The Scenes</option><option>Lainnya</option>
                </select>
              </Field>
              <Field l={i === 0 ? 'Link Konten' : ''}><input value={k.link} onChange={e => setKonten(i, 'link', e.target.value)} style={inp} placeholder="https://tiktok.com/..." /></Field>
              <button onClick={() => removeKonten(i)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '8px 0' }}><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      </Section>

      {/* CS MARKETPLACE */}
      <Section title="Tim CS Marketplace" color="#10b981" icon="📦">
        <Grid cols={2}>
          <Field l="Resi Dicetak"><input type="number" value={form.cs_marketplace?.resi_dicetak || ''} onChange={e => set('cs_marketplace.resi_dicetak', +e.target.value)} style={inp} placeholder="0" /></Field>
          <Field l="Recall Customer (Penawaran Produk)"><input type="number" value={form.cs_marketplace?.recall_customer || ''} onChange={e => set('cs_marketplace.recall_customer', +e.target.value)} style={inp} placeholder="0" /></Field>
        </Grid>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={label}>Komplain Masuk ({form.cs_marketplace?.komplain?.length || 0})</span>
            <button onClick={addKomplain} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 7, border: '1px solid #10b981', color: '#10b981', background: 'transparent', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
              <Plus size={12} /> Tambah Komplain
            </button>
          </div>
          {(form.cs_marketplace?.komplain || []).map((k, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '160px 1fr 32px', gap: 8, marginBottom: 8, alignItems: 'end' }}>
              <Field l={i === 0 ? 'ID Komplain' : ''}><input value={k.id} onChange={e => setKomplain(i, 'id', e.target.value)} style={inp} placeholder="ID-001" /></Field>
              <Field l={i === 0 ? 'Keterangan' : ''}><input value={k.keterangan} onChange={e => setKomplain(i, 'keterangan', e.target.value)} style={inp} placeholder="Deskripsi komplain" /></Field>
              <button onClick={() => removeKomplain(i)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '8px 0' }}><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      </Section>

      {/* CS WA */}
      <Section title="Tim CS WhatsApp" color="#22c55e" icon="💬">
        <Grid cols={2}>
          <Field l="Customer Masuk via Meta/Ads"><input type="number" value={form.cs_wa?.customer_masuk_meta || ''} onChange={e => set('cs_wa.customer_masuk_meta', +e.target.value)} style={inp} placeholder="0" /></Field>
          <Field l="Customer Lama yang Masuk"><input type="number" value={form.cs_wa?.customer_lama || ''} onChange={e => set('cs_wa.customer_lama', +e.target.value)} style={inp} placeholder="0" /></Field>
          <Field l="Total Omset WA (Rp)"><input type="number" value={form.cs_wa?.omset || ''} onChange={e => set('cs_wa.omset', +e.target.value)} style={inp} placeholder="0" /></Field>
          <Field l="Reseller Join Zona Nyam"><input type="number" value={form.cs_wa?.reseller_join_zonanyam || ''} onChange={e => set('cs_wa.reseller_join_zonanyam', +e.target.value)} style={inp} placeholder="0" /></Field>
          <Field l="Reseller Join Sentral Basreng"><input type="number" value={form.cs_wa?.reseller_join_basreng || ''} onChange={e => set('cs_wa.reseller_join_basreng', +e.target.value)} style={inp} placeholder="0" /></Field>
        </Grid>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={label}>Data Closing ({form.cs_wa?.closing?.length || 0} customer)</span>
            <button onClick={addClosing} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 7, border: '1px solid #22c55e', color: '#22c55e', background: 'transparent', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
              <Plus size={12} /> Tambah Closing
            </button>
          </div>
          {(form.cs_wa?.closing || []).map((c, i) => (
            <div key={i} style={{ background: 'var(--bg-hover)', borderRadius: 10, padding: 14, marginBottom: 10, position: 'relative' }}>
              <button onClick={() => removeClosing(i)} style={{ position: 'absolute', top: 10, right: 10, background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={14} /></button>
              <div style={{ fontWeight: 700, fontSize: 12, color: '#22c55e', marginBottom: 10 }}>Closing #{i + 1}</div>
              <Grid cols={2}>
                <Field l="Nama Customer"><input value={c.nama} onChange={e => setClosing(i, 'nama', e.target.value)} style={inp} placeholder="Nama" /></Field>
                <Field l="No. Telepon"><input value={c.no_tlp} onChange={e => setClosing(i, 'no_tlp', e.target.value)} style={inp} placeholder="08xxx" /></Field>
                <Field l="Akun/Username"><input value={c.akun} onChange={e => setClosing(i, 'akun', e.target.value)} style={inp} placeholder="@akun" /></Field>
                <Field l="Produk Diminati"><input value={c.produk} onChange={e => setClosing(i, 'produk', e.target.value)} style={inp} placeholder="Nama produk" /></Field>
                <Field l="Alamat" style={{ gridColumn: '1/-1' }}><input value={c.alamat} onChange={e => setClosing(i, 'alamat', e.target.value)} style={inp} placeholder="Alamat pengiriman" /></Field>
              </Grid>
            </div>
          ))}
        </div>
      </Section>

      {/* Save bottom */}
      <button onClick={handleSave}
        style={{ padding: '14px', borderRadius: 12, background: saved ? '#10b981' : brandColor, color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
        {saved ? <><Check size={18} /> Laporan Tersimpan!</> : <><Save size={18} /> Simpan Laporan</>}
      </button>
    </div>
  );
}
