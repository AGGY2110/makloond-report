import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Trash2, ChevronDown, ChevronUp, Save, Check } from 'lucide-react';

const inp = { padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: 13, width: '100%', boxSizing: 'border-box' };
const lbl = { fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 4, display: 'block', textTransform: 'uppercase', letterSpacing: '0.04em' };

function Field({ l, children }) {
  return <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}><span style={lbl}>{l}</span>{children}</div>;
}

function AutoCalc({ label, value, color = '#8b5cf6' }) {
  return (
    <div style={{ background: 'var(--bg-hover)', borderRadius: 8, padding: '10px 14px' }}>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 2 }}>{label} (otomatis)</div>
      <div style={{ fontSize: 16, fontWeight: 700, color }}>{value}</div>
    </div>
  );
}

function Section({ title, color, icon, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, overflow: 'hidden' }}>
      <button onClick={() => setOpen(!open)} style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', background: 'transparent', border: 'none', cursor: 'pointer', textAlign: 'left' }}>
        <div style={{ width: 28, height: 28, borderRadius: 7, background: color + '25', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15 }}>{icon}</div>
        <span style={{ flex: 1, fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>{title}</span>
        {open ? <ChevronUp size={16} color="var(--text-muted)" /> : <ChevronDown size={16} color="var(--text-muted)" />}
      </button>
      {open && (
        <div style={{ padding: '0 18px 18px', display: 'flex', flexDirection: 'column', gap: 16, borderTop: '1px solid var(--border)' }}>
          <div style={{ paddingTop: 16 }}>{children}</div>
        </div>
      )}
    </div>
  );
}

function Grid({ cols = 2, children }) {
  return <div style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 12 }}>{children}</div>;
}

function PlatformTab({ tabs, active, onChange, colors }) {
  return (
    <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
      {tabs.map(t => (
        <button key={t.id} onClick={() => onChange(t.id)} style={{
          padding: '6px 16px', borderRadius: 20, border: '1px solid',
          borderColor: active === t.id ? colors[t.id] : 'var(--border)',
          background: active === t.id ? colors[t.id] + '18' : 'transparent',
          color: active === t.id ? colors[t.id] : 'var(--text-muted)',
          fontWeight: active === t.id ? 700 : 500, fontSize: 13, cursor: 'pointer'
        }}>{t.label}</button>
      ))}
    </div>
  );
}

export default function InputForm() {
  const { addReport, editingReport, setEditingReport, selectedBrand, BRAND_LABELS, BRAND_COLORS, BRAND_PLATFORMS, INITIAL_REPORT, setCurrentPage } = useApp();
  const [form, setForm] = useState(() => editingReport || { ...JSON.parse(JSON.stringify(INITIAL_REPORT)), brand: selectedBrand, date: new Date().toISOString().split('T')[0] });
  const [saved, setSaved] = useState(false);
  const [mpTab, setMpTab] = useState('tiktok');

  useEffect(() => { if (editingReport) setForm(editingReport); }, [editingReport]);

  const platforms = BRAND_PLATFORMS[selectedBrand] || ['tiktok'];

  const set = (path, value) => {
    setForm(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      const keys = path.split('.');
      let cur = copy;
      for (let i = 0; i < keys.length - 1; i++) cur = cur[keys[i]] = cur[keys[i]] || {};
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

  // KOL helpers
  const addAffiliate = () => set('kol.affiliates_sent', [...(form.kol?.affiliates_sent || []), { nama: '', akun: '', produk: '', hpp: 0, total_biaya: 0, biaya_endorse: 0, follower: 0, gmv: 0, views_avg: 0, target_upload: '' }]);
  const removeAffiliate = i => set('kol.affiliates_sent', form.kol.affiliates_sent.filter((_, idx) => idx !== i));
  const setAffiliate = (i, k, v) => { const arr = [...form.kol.affiliates_sent]; arr[i] = { ...arr[i], [k]: v }; set('kol.affiliates_sent', arr); };

  const addManual = () => set('kol.manual_affiliates', [...(form.kol?.manual_affiliates || []), { nama: '', akun: '', no_tlp: '', gmv: 0, views_avg: 0, link: '' }]);
  const removeManual = i => set('kol.manual_affiliates', form.kol.manual_affiliates.filter((_, idx) => idx !== i));
  const setManual = (i, k, v) => { const arr = [...form.kol.manual_affiliates]; arr[i] = { ...arr[i], [k]: v }; set('kol.manual_affiliates', arr); };

  // Produk terjual helpers per platform
  const addProduk = (plat) => set(`${plat}.produk_terjual`, [...(form[plat]?.produk_terjual || []), { nama: '', qty: 0, rupiah: 0 }]);
  const removeProduk = (plat, i) => set(`${plat}.produk_terjual`, form[plat].produk_terjual.filter((_, idx) => idx !== i));
  const setProduk = (plat, i, k, v) => { const arr = [...form[plat].produk_terjual]; arr[i] = { ...arr[i], [k]: v }; set(`${plat}.produk_terjual`, arr); };

  // Konten
  const addKonten = () => set('konten.posts', [...(form.konten?.posts || []), { jam: '', jenis: '', link: '', platform: mpTab }]);
  const removeKonten = i => set('konten.posts', form.konten.posts.filter((_, idx) => idx !== i));
  const setKonten = (i, k, v) => { const arr = [...form.konten.posts]; arr[i] = { ...arr[i], [k]: v }; set('konten.posts', arr); };

  // Komplain
  const addKomplain = () => set('cs_marketplace.komplain', [...(form.cs_marketplace?.komplain || []), { id: '', platform: 'tiktok', keterangan: '' }]);
  const removeKomplain = i => set('cs_marketplace.komplain', form.cs_marketplace.komplain.filter((_, idx) => idx !== i));
  const setKomplain = (i, k, v) => { const arr = [...form.cs_marketplace.komplain]; arr[i] = { ...arr[i], [k]: v }; set('cs_marketplace.komplain', arr); };

  // Closing WA
  const addClosing = () => set('cs_wa.closing', [...(form.cs_wa?.closing || []), { nama: '', alamat: '', no_tlp: '', akun: '', produk: '' }]);
  const removeClosing = i => set('cs_wa.closing', form.cs_wa.closing.filter((_, idx) => idx !== i));
  const setClosing = (i, k, v) => { const arr = [...form.cs_wa.closing]; arr[i] = { ...arr[i], [k]: v }; set('cs_wa.closing', arr); };

  // Kalkulasi otomatis
  const tt = form.tiktok || {};
  const sp = form.shopee || {};
  const mt = form.meta || {};
  const lv = form.live || {};

  const tiktok_rata = tt.konversi > 0 ? Math.round((tt.gmv_total || 0) / tt.konversi) : 0;
  const tiktok_roi = tt.spending_ads > 0 ? ((tt.gmv_total || 0) / tt.spending_ads).toFixed(2) : 0;
  const shopee_rata = sp.konversi > 0 ? Math.round((sp.gmv_total || 0) / sp.konversi) : 0;
  const shopee_roi = sp.spending_ads > 0 ? ((sp.gmv_total || 0) / sp.spending_ads).toFixed(2) : 0;
  const meta_cpl = mt.leads_masuk > 0 ? Math.round((mt.spending_ads || 0) / mt.leads_masuk) : 0;
  const meta_cpc = mt.closing > 0 ? Math.round((mt.spending_ads || 0) / mt.closing) : 0;
  const meta_cr = mt.leads_masuk > 0 ? ((mt.closing / mt.leads_masuk) * 100).toFixed(1) : 0;
  const live_roi = lv.spending_ads > 0 ? ((lv.gmv || 0) / lv.spending_ads).toFixed(2) : 0;
  const live_cr = lv.penonton > 0 ? (((lv.konversi || 0) / lv.penonton) * 100).toFixed(2) : 0;

  const platformColors = { tiktok: '#010101', shopee: '#ee4d2d', meta: '#1877f2' };
  const mpTabs = platforms.filter(p => p !== 'meta').map(p => ({ id: p, label: p === 'tiktok' ? 'TikTok Shop' : 'Shopee' }));

  const SaveBtn = ({ bottom }) => (
    <button onClick={handleSave} style={{
      padding: bottom ? '14px' : '12px 28px', borderRadius: bottom ? 12 : 10,
      background: saved ? '#10b981' : brandColor, color: '#fff', border: 'none',
      fontWeight: 700, cursor: 'pointer', fontSize: bottom ? 16 : 15,
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: bottom ? '100%' : 'auto'
    }}>
      {saved ? <><Check size={16} /> Tersimpan!</> : <><Save size={16} /> Simpan Laporan</>}
    </button>
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 4 }}>
            Brand: <strong style={{ color: brandColor }}>{BRAND_LABELS[selectedBrand]}</strong>
            {' · '}Platform: {platforms.map(p => <span key={p} style={{ marginLeft: 4, padding: '1px 7px', borderRadius: 4, background: platformColors[p] + '20', color: platformColors[p], fontSize: 11, fontWeight: 700 }}>{p.toUpperCase()}</span>)}
          </div>
          <Field l="Tanggal Laporan">
            <input type="date" value={form.date} onChange={e => set('date', e.target.value)} style={{ ...inp, width: 180 }} />
          </Field>
        </div>
        <SaveBtn />
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
            <span style={lbl}>Daftar Afiliasi yang Dikirim Produk</span>
            <button onClick={addAffiliate} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 7, border: '1px solid #ec4899', color: '#ec4899', background: 'transparent', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
              <Plus size={12} /> Tambah
            </button>
          </div>
          {(form.kol?.affiliates_sent || []).map((a, i) => (
            <div key={i} style={{ background: 'var(--bg-hover)', borderRadius: 10, padding: 14, marginBottom: 10, position: 'relative' }}>
              <button onClick={() => removeAffiliate(i)} style={{ position: 'absolute', top: 10, right: 10, background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={14} /></button>
              <div style={{ fontWeight: 700, fontSize: 12, color: '#ec4899', marginBottom: 10 }}>Afiliasi #{i + 1}</div>
              <Grid cols={2}>
                <Field l="Nama"><input value={a.nama} onChange={e => setAffiliate(i, 'nama', e.target.value)} style={inp} placeholder="Nama" /></Field>
                <Field l="Nama Akun"><input value={a.akun} onChange={e => setAffiliate(i, 'akun', e.target.value)} style={inp} placeholder="@akun" /></Field>
                <Field l="Produk Dikirim"><input value={a.produk} onChange={e => setAffiliate(i, 'produk', e.target.value)} style={inp} placeholder="Nama produk" /></Field>
                <Field l="HPP Produk (Rp)"><input type="number" value={a.hpp || ''} onChange={e => setAffiliate(i, 'hpp', +e.target.value)} style={inp} placeholder="0" /></Field>
                <Field l="Total Biaya Produk (Rp)"><input type="number" value={a.total_biaya || ''} onChange={e => setAffiliate(i, 'total_biaya', +e.target.value)} style={inp} placeholder="0" /></Field>
                <Field l="Biaya Endorse (Rp)"><input type="number" value={a.biaya_endorse || ''} onChange={e => setAffiliate(i, 'biaya_endorse', +e.target.value)} style={inp} placeholder="0" /></Field>
                <Field l="Jumlah Follower"><input type="number" value={a.follower || ''} onChange={e => setAffiliate(i, 'follower', +e.target.value)} style={inp} placeholder="0" /></Field>
                <Field l="GMV Afiliasi (Rp)"><input type="number" value={a.gmv || ''} onChange={e => setAffiliate(i, 'gmv', +e.target.value)} style={inp} placeholder="0" /></Field>
                <Field l="Avg Views 12 VT"><input type="number" value={a.views_avg || ''} onChange={e => setAffiliate(i, 'views_avg', +e.target.value)} style={inp} placeholder="0" /></Field>
                <Field l="Target Upload"><input type="date" value={a.target_upload} onChange={e => setAffiliate(i, 'target_upload', e.target.value)} style={inp} /></Field>
              </Grid>
            </div>
          ))}
        </div>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={lbl}>Afiliasi Manual Dihubungi</span>
            <button onClick={addManual} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 7, border: '1px solid #ec4899', color: '#ec4899', background: 'transparent', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
              <Plus size={12} /> Tambah
            </button>
          </div>
          {(form.kol?.manual_affiliates || []).map((m, i) => (
            <div key={i} style={{ background: 'var(--bg-hover)', borderRadius: 10, padding: 14, marginBottom: 10, position: 'relative' }}>
              <button onClick={() => removeManual(i)} style={{ position: 'absolute', top: 10, right: 10, background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444' }}><Trash2 size={14} /></button>
              <Grid cols={2}>
                <Field l="Nama"><input value={m.nama} onChange={e => setManual(i, 'nama', e.target.value)} style={inp} placeholder="Nama" /></Field>
                <Field l="Nama Akun"><input value={m.akun} onChange={e => setManual(i, 'akun', e.target.value)} style={inp} placeholder="@akun" /></Field>
                <Field l="No. Telepon"><input value={m.no_tlp} onChange={e => setManual(i, 'no_tlp', e.target.value)} style={inp} placeholder="08xxx" /></Field>
                <Field l="GMV (Rp)"><input type="number" value={m.gmv || ''} onChange={e => setManual(i, 'gmv', +e.target.value)} style={inp} placeholder="0" /></Field>
                <Field l="Avg Views 12 VT"><input type="number" value={m.views_avg || ''} onChange={e => setManual(i, 'views_avg', +e.target.value)} style={inp} placeholder="0" /></Field>
                <Field l="Link Akun"><input value={m.link} onChange={e => setManual(i, 'link', e.target.value)} style={inp} placeholder="https://" /></Field>
              </Grid>
            </div>
          ))}
        </div>
      </Section>

      {/* TIM MARKETPLACE - TikTok & Shopee */}
      {platforms.some(p => ['tiktok', 'shopee'].includes(p)) && (
        <Section title="Tim Marketplace" color="#8b5cf6" icon="🛒" defaultOpen>
          {mpTabs.length > 1 && (
            <PlatformTab tabs={mpTabs} active={mpTab} onChange={setMpTab} colors={platformColors} />
          )}

          {/* TIKTOK */}
          {(mpTab === 'tiktok' || mpTabs.length === 1 && platforms.includes('tiktok')) && platforms.includes('tiktok') && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <div style={{ width: 20, height: 20, borderRadius: 5, background: '#010101', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff', fontWeight: 800 }}>T</div>
                <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>TikTok Shop</span>
              </div>
              <Grid cols={2}>
                <Field l="Spending Iklan (Rp)"><input type="number" value={tt.spending_ads || ''} onChange={e => set('tiktok.spending_ads', +e.target.value)} style={inp} placeholder="0" /></Field>
                <Field l="GMV Total (Rp)"><input type="number" value={tt.gmv_total || ''} onChange={e => set('tiktok.gmv_total', +e.target.value)} style={inp} placeholder="0" /></Field>
                <Field l="GMV dari Afiliasi (Rp)"><input type="number" value={tt.gmv_affiliate || ''} onChange={e => set('tiktok.gmv_affiliate', +e.target.value)} style={inp} placeholder="0" /></Field>
                <Field l="GMV dari Konten Pribadi (Rp)"><input type="number" value={tt.gmv_konten_pribadi || ''} onChange={e => set('tiktok.gmv_konten_pribadi', +e.target.value)} style={inp} placeholder="0" /></Field>
                <Field l="GMV dari Live (Rp)"><input type="number" value={tt.gmv_live || ''} onChange={e => set('tiktok.gmv_live', +e.target.value)} style={inp} placeholder="0" /></Field>
                <Field l="GMV dari Shop Lain (Rp)"><input type="number" value={tt.gmv_shop_lain || ''} onChange={e => set('tiktok.gmv_shop_lain', +e.target.value)} style={inp} placeholder="0" /></Field>
                <Field l="Traffic (Pengunjung)"><input type="number" value={tt.traffic || ''} onChange={e => set('tiktok.traffic', +e.target.value)} style={inp} placeholder="0" /></Field>
                <Field l="Konversi (Pembeli)"><input type="number" value={tt.konversi || ''} onChange={e => set('tiktok.konversi', +e.target.value)} style={inp} placeholder="0" /></Field>
                <Field l="Konten Tayang Menghasilkan GMV"><input type="number" value={tt.konten_tayang_gmv || ''} onChange={e => set('tiktok.konten_tayang_gmv', +e.target.value)} style={inp} placeholder="0" /></Field>
              </Grid>
              <Grid cols={2} style={{ marginTop: 12 }}>
                <AutoCalc label="Rata-rata Belanja" value={`Rp ${tiktok_rata.toLocaleString('id-ID')}`} color="#010101" />
                <AutoCalc label="ROI TikTok" value={`${tiktok_roi}x`} color="#010101" />
              </Grid>
              <div style={{ marginTop: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={lbl}>Produk Terjual di TikTok</span>
                  <button onClick={() => addProduk('tiktok')} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 7, border: '1px solid #010101', color: '#010101', background: 'transparent', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                    <Plus size={12} /> Tambah
                  </button>
                </div>
                {(tt.produk_terjual || []).map((p, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 140px 32px', gap: 8, marginBottom: 8, alignItems: 'end' }}>
                    <Field l={i === 0 ? 'Nama Produk' : ''}><input value={p.nama} onChange={e => setProduk('tiktok', i, 'nama', e.target.value)} style={inp} placeholder="Nama produk" /></Field>
                    <Field l={i === 0 ? 'Pesanan' : ''}><input type="number" value={p.qty || ''} onChange={e => setProduk('tiktok', i, 'qty', +e.target.value)} style={inp} placeholder="0" /></Field>
                    <Field l={i === 0 ? 'Nilai (Rp)' : ''}><input type="number" value={p.rupiah || ''} onChange={e => setProduk('tiktok', i, 'rupiah', +e.target.value)} style={inp} placeholder="0" /></Field>
                    <button onClick={() => removeProduk('tiktok', i)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '8px 0' }}><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* SHOPEE */}
          {mpTab === 'shopee' && platforms.includes('shopee') && (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                <div style={{ width: 20, height: 20, borderRadius: 5, background: '#ee4d2d', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff', fontWeight: 800 }}>S</div>
                <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--text-primary)' }}>Shopee</span>
              </div>
              <Grid cols={2}>
                <Field l="Spending Iklan (Rp)"><input type="number" value={sp.spending_ads || ''} onChange={e => set('shopee.spending_ads', +e.target.value)} style={inp} placeholder="0" /></Field>
                <Field l="GMV Total (Rp)"><input type="number" value={sp.gmv_total || ''} onChange={e => set('shopee.gmv_total', +e.target.value)} style={inp} placeholder="0" /></Field>
                <Field l="GMV dari Afiliasi (Rp)"><input type="number" value={sp.gmv_affiliate || ''} onChange={e => set('shopee.gmv_affiliate', +e.target.value)} style={inp} placeholder="0" /></Field>
                <Field l="GMV dari Flash Sale (Rp)"><input type="number" value={sp.gmv_flash_sale || ''} onChange={e => set('shopee.gmv_flash_sale', +e.target.value)} style={inp} placeholder="0" /></Field>
                <Field l="GMV dari Voucher (Rp)"><input type="number" value={sp.gmv_voucher || ''} onChange={e => set('shopee.gmv_voucher', +e.target.value)} style={inp} placeholder="0" /></Field>
                <Field l="GMV Organik (Rp)"><input type="number" value={sp.gmv_organik || ''} onChange={e => set('shopee.gmv_organik', +e.target.value)} style={inp} placeholder="0" /></Field>
                <Field l="Traffic (Pengunjung)"><input type="number" value={sp.traffic || ''} onChange={e => set('shopee.traffic', +e.target.value)} style={inp} placeholder="0" /></Field>
                <Field l="Konversi (Pembeli)"><input type="number" value={sp.konversi || ''} onChange={e => set('shopee.konversi', +e.target.value)} style={inp} placeholder="0" /></Field>
              </Grid>
              <Grid cols={2} style={{ marginTop: 12 }}>
                <AutoCalc label="Rata-rata Belanja" value={`Rp ${shopee_rata.toLocaleString('id-ID')}`} color="#ee4d2d" />
                <AutoCalc label="ROI Shopee" value={`${shopee_roi}x`} color="#ee4d2d" />
              </Grid>
              <div style={{ marginTop: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                  <span style={lbl}>Produk Terjual di Shopee</span>
                  <button onClick={() => addProduk('shopee')} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 7, border: '1px solid #ee4d2d', color: '#ee4d2d', background: 'transparent', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                    <Plus size={12} /> Tambah
                  </button>
                </div>
                {(sp.produk_terjual || []).map((p, i) => (
                  <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr 100px 140px 32px', gap: 8, marginBottom: 8, alignItems: 'end' }}>
                    <Field l={i === 0 ? 'Nama Produk' : ''}><input value={p.nama} onChange={e => setProduk('shopee', i, 'nama', e.target.value)} style={inp} placeholder="Nama produk" /></Field>
                    <Field l={i === 0 ? 'Pesanan' : ''}><input type="number" value={p.qty || ''} onChange={e => setProduk('shopee', i, 'qty', +e.target.value)} style={inp} placeholder="0" /></Field>
                    <Field l={i === 0 ? 'Nilai (Rp)' : ''}><input type="number" value={p.rupiah || ''} onChange={e => setProduk('shopee', i, 'rupiah', +e.target.value)} style={inp} placeholder="0" /></Field>
                    <button onClick={() => removeProduk('shopee', i)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '8px 0' }}><Trash2 size={14} /></button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Section>
      )}

      {/* META */}
      {platforms.includes('meta') && (
        <Section title="Meta Ads" color="#1877f2" icon="📘">
          <Grid cols={2}>
            <Field l="Spending Meta Ads (Rp)"><input type="number" value={mt.spending_ads || ''} onChange={e => set('meta.spending_ads', +e.target.value)} style={inp} placeholder="0" /></Field>
            <Field l="Leads Masuk"><input type="number" value={mt.leads_masuk || ''} onChange={e => set('meta.leads_masuk', +e.target.value)} style={inp} placeholder="0" /></Field>
            <Field l="Closing (Pembeli)"><input type="number" value={mt.closing || ''} onChange={e => set('meta.closing', +e.target.value)} style={inp} placeholder="0" /></Field>
            <Field l="Omset dari Meta (Rp)"><input type="number" value={mt.omset || ''} onChange={e => set('meta.omset', +e.target.value)} style={inp} placeholder="0" /></Field>
          </Grid>
          <Grid cols={3} style={{ marginTop: 12 }}>
            <AutoCalc label="Cost Per Lead" value={`Rp ${meta_cpl.toLocaleString('id-ID')}`} color="#1877f2" />
            <AutoCalc label="Cost Per Closing" value={`Rp ${meta_cpc.toLocaleString('id-ID')}`} color="#1877f2" />
            <AutoCalc label="Closing Rate" value={`${meta_cr}%`} color="#1877f2" />
          </Grid>
        </Section>
      )}

      {/* TIM LIVE */}
      {platforms.some(p => ['tiktok', 'shopee'].includes(p)) && (
        <Section title="Tim Live" color="#06b6d4" icon="📡">
          <Grid cols={2}>
            <Field l="GMV Live (Rp)"><input type="number" value={lv.gmv || ''} onChange={e => set('live.gmv', +e.target.value)} style={inp} placeholder="0" /></Field>
            <Field l="Spending Ads Live (Rp)"><input type="number" value={lv.spending_ads || ''} onChange={e => set('live.spending_ads', +e.target.value)} style={inp} placeholder="0" /></Field>
            <Field l="Jumlah Penonton"><input type="number" value={lv.penonton || ''} onChange={e => set('live.penonton', +e.target.value)} style={inp} placeholder="0" /></Field>
            <Field l="Konversi (Pembeli dari Live)"><input type="number" value={lv.konversi || ''} onChange={e => set('live.konversi', +e.target.value)} style={inp} placeholder="0" /></Field>
          </Grid>
          <Grid cols={2} style={{ marginTop: 12 }}>
            <AutoCalc label="ROI Live" value={`${live_roi}x`} color="#06b6d4" />
            <AutoCalc label="% Konversi dari Penonton" value={`${live_cr}%`} color="#06b6d4" />
          </Grid>
        </Section>
      )}

      {/* TIM KONTEN */}
      <Section title="Tim Konten" color="#f97316" icon="🎬">
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={lbl}>Konten Dipost ({form.konten?.posts?.length || 0})</span>
            <button onClick={addKonten} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 7, border: '1px solid #f97316', color: '#f97316', background: 'transparent', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
              <Plus size={12} /> Tambah
            </button>
          </div>
          {(form.konten?.posts || []).map((k, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '100px 120px 130px 1fr 32px', gap: 8, marginBottom: 8, alignItems: 'end' }}>
              <Field l={i === 0 ? 'Platform' : ''}>
                <select value={k.platform || 'tiktok'} onChange={e => setKonten(i, 'platform', e.target.value)} style={inp}>
                  {platforms.map(p => <option key={p} value={p}>{p === 'tiktok' ? 'TikTok' : p === 'shopee' ? 'Shopee' : 'Meta'}</option>)}
                </select>
              </Field>
              <Field l={i === 0 ? 'Jam Post' : ''}><input type="time" value={k.jam} onChange={e => setKonten(i, 'jam', e.target.value)} style={inp} /></Field>
              <Field l={i === 0 ? 'Jenis Konten' : ''}>
                <select value={k.jenis} onChange={e => setKonten(i, 'jenis', e.target.value)} style={inp}>
                  <option value="">Pilih jenis</option>
                  <option>Review Produk</option><option>Tutorial</option><option>Unboxing</option>
                  <option>Testimonial</option><option>Promo/Diskon</option><option>Edukasi</option>
                  <option>Entertainment</option><option>Behind The Scenes</option><option>Lainnya</option>
                </select>
              </Field>
              <Field l={i === 0 ? 'Link Konten' : ''}><input value={k.link} onChange={e => setKonten(i, 'link', e.target.value)} style={inp} placeholder="https://..." /></Field>
              <button onClick={() => removeKonten(i)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#ef4444', padding: '8px 0' }}><Trash2 size={14} /></button>
            </div>
          ))}
        </div>
      </Section>

      {/* CS MARKETPLACE */}
      <Section title="Tim CS Marketplace" color="#10b981" icon="📦">
        <Grid cols={2}>
          {platforms.includes('tiktok') && <Field l="Resi Dicetak TikTok"><input type="number" value={form.cs_marketplace?.tiktok_resi || ''} onChange={e => set('cs_marketplace.tiktok_resi', +e.target.value)} style={inp} placeholder="0" /></Field>}
          {platforms.includes('shopee') && <Field l="Resi Dicetak Shopee"><input type="number" value={form.cs_marketplace?.shopee_resi || ''} onChange={e => set('cs_marketplace.shopee_resi', +e.target.value)} style={inp} placeholder="0" /></Field>}
          <Field l="Recall Customer"><input type="number" value={form.cs_marketplace?.recall_customer || ''} onChange={e => set('cs_marketplace.recall_customer', +e.target.value)} style={inp} placeholder="0" /></Field>
        </Grid>
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
            <span style={lbl}>Komplain Masuk ({form.cs_marketplace?.komplain?.length || 0})</span>
            <button onClick={addKomplain} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 7, border: '1px solid #10b981', color: '#10b981', background: 'transparent', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
              <Plus size={12} /> Tambah
            </button>
          </div>
          {(form.cs_marketplace?.komplain || []).map((k, i) => (
            <div key={i} style={{ display: 'grid', gridTemplateColumns: '100px 120px 1fr 32px', gap: 8, marginBottom: 8, alignItems: 'end' }}>
              <Field l={i === 0 ? 'Platform' : ''}>
                <select value={k.platform || 'tiktok'} onChange={e => setKomplain(i, 'platform', e.target.value)} style={inp}>
                  {platforms.map(p => <option key={p} value={p}>{p === 'tiktok' ? 'TikTok' : p === 'shopee' ? 'Shopee' : 'Meta'}</option>)}
                </select>
              </Field>
              <Field l={i === 0 ? 'ID Komplain' : ''}><input value={k.id} onChange={e => setKomplain(i, 'id', e.target.value)} style={inp} placeholder="ID-001" /></Field>
              <Field l={i === 0 ? 'Keterangan' : ''}><input value={k.keterangan} onChange={e => setKomplain(i, 'keterangan', e.target.value)} style={inp} placeholder="Deskripsi" /></Field>
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
            <span style={lbl}>Data Closing ({form.cs_wa?.closing?.length || 0} customer)</span>
            <button onClick={addClosing} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '6px 12px', borderRadius: 7, border: '1px solid #22c55e', color: '#22c55e', background: 'transparent', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
              <Plus size={12} /> Tambah
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
                <Field l="Alamat"><input value={c.alamat} onChange={e => setClosing(i, 'alamat', e.target.value)} style={inp} placeholder="Alamat pengiriman" /></Field>
              </Grid>
            </div>
          ))}
        </div>
      </Section>

      <SaveBtn bottom />
    </div>
  );
}
