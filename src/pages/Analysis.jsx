import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis } from 'recharts';
import { TrendingUp, TrendingDown, AlertCircle, CheckCircle, Lightbulb } from 'lucide-react';

function fmtRp(n) { return 'Rp ' + new Intl.NumberFormat('id-ID', { notation: 'compact', maximumFractionDigits: 1 }).format(n || 0); }

function Insight({ type, text }) {
  const cfg = {
    good: { icon: CheckCircle, color: '#10b981', bg: '#10b98115' },
    bad: { icon: AlertCircle, color: '#ef4444', bg: '#ef444415' },
    tip: { icon: Lightbulb, color: '#f59e0b', bg: '#f59e0b15' },
    info: { icon: TrendingUp, color: '#3b82f6', bg: '#3b82f615' }
  }[type] || cfg.info;
  const Icon = cfg.icon;
  return (
    <div style={{ display: 'flex', gap: 10, padding: '12px 14px', borderRadius: 10, background: cfg.bg, border: `1px solid ${cfg.color}30` }}>
      <Icon size={16} color={cfg.color} style={{ flexShrink: 0, marginTop: 2 }} />
      <span style={{ fontSize: 13, color: 'var(--text-primary)', lineHeight: 1.5 }}>{text}</span>
    </div>
  );
}

export default function Analysis() {
  const { getFilteredReports, selectedBrand, BRAND_LABELS, BRAND_COLORS, BRANDS } = useApp();

  const reports = getFilteredReports(selectedBrand);
  const brandColor = BRAND_COLORS[selectedBrand];

  const compareData = useMemo(() => {
    if (reports.length < 2) return [];
    return reports.slice(-7).map((r, i, arr) => {
      const prev = arr[i - 1];
      const gmv = (r.marketplace?.gmv_total || 0) + (r.live?.gmv || 0);
      const prevGmv = prev ? (prev.marketplace?.gmv_total || 0) + (prev.live?.gmv || 0) : null;
      return {
        date: r.date.slice(5),
        GMV: gmv,
        'Prev GMV': prevGmv,
        ROI: r.marketplace?.spending_ads > 0 ? +((r.marketplace?.gmv_total || 0) / r.marketplace.spending_ads).toFixed(2) : 0,
        Traffic: r.marketplace?.traffic || 0,
        KOL: r.kol?.total_invited || 0,
      };
    });
  }, [reports]);

  // Day-to-day comparison (last 2 days)
  const today = reports[reports.length - 1];
  const yesterday = reports[reports.length - 2];

  const insights = useMemo(() => {
    const list = [];
    if (!today) return list;
    const todayGMV = (today.marketplace?.gmv_total || 0) + (today.live?.gmv || 0);
    const ystGMV = yesterday ? (yesterday.marketplace?.gmv_total || 0) + (yesterday.live?.gmv || 0) : null;
    const roi = today.marketplace?.spending_ads > 0 ? todayGMV / today.marketplace.spending_ads : null;

    if (ystGMV !== null) {
      const diff = todayGMV - ystGMV;
      const pct = ystGMV > 0 ? ((diff / ystGMV) * 100).toFixed(1) : null;
      if (diff > 0) list.push({ type: 'good', text: `GMV naik ${pct}% dibanding kemarin (${fmtRp(todayGMV)} vs ${fmtRp(ystGMV)})` });
      else if (diff < 0) list.push({ type: 'bad', text: `GMV turun ${Math.abs(pct)}% dibanding kemarin (${fmtRp(todayGMV)} vs ${fmtRp(ystGMV)})` });
    }

    if (roi !== null) {
      if (roi >= 3) list.push({ type: 'good', text: `ROI iklan sangat baik: ${roi.toFixed(2)}x. Setiap Rp 1 spending menghasilkan Rp ${roi.toFixed(2)}` });
      else if (roi >= 1.5) list.push({ type: 'info', text: `ROI iklan cukup baik: ${roi.toFixed(2)}x. Pertimbangkan scale up budget yang efisien.` });
      else if (roi < 1) list.push({ type: 'bad', text: `ROI iklan di bawah 1x (${roi.toFixed(2)}x). Spending melebihi GMV. Evaluasi targeting iklan.` });
    }

    const totalKol = today.kol?.total_invited || 0;
    const kolSent = today.kol?.affiliates_sent?.length || 0;
    if (totalKol > 0) {
      const ratio = ((kolSent / totalKol) * 100).toFixed(0);
      if (kolSent / totalKol > 0.5) list.push({ type: 'good', text: `Conversion rate KOL baik: ${ratio}% dari ${totalKol} undangan berhasil dikirim produk.` });
      else list.push({ type: 'tip', text: `Hanya ${ratio}% dari ${totalKol} undangan KOL yang dikirim produk. Coba tingkatkan follow-up atau seleksi awal.` });
    }

    const traffic = today.marketplace?.traffic || 0;
    const konversi = today.marketplace?.konversi || 0;
    if (traffic > 0) {
      const cr = ((konversi / traffic) * 100).toFixed(2);
      if (+cr >= 3) list.push({ type: 'good', text: `Conversion rate toko bagus: ${cr}% (${konversi} dari ${traffic} pengunjung beli).` });
      else if (+cr < 1) list.push({ type: 'bad', text: `Conversion rate rendah: ${cr}% dari ${traffic} traffic. Perlu review halaman produk, foto, harga, dan review.` });
    }

    const komplain = today.cs_marketplace?.komplain?.length || 0;
    const resi = today.cs_marketplace?.resi_dicetak || 0;
    if (resi > 0 && komplain > 0) {
      const rate = ((komplain / resi) * 100).toFixed(1);
      if (+rate > 5) list.push({ type: 'bad', text: `Tingkat komplain tinggi: ${rate}% (${komplain} dari ${resi} order). Perlu ditangani segera.` });
      else list.push({ type: 'good', text: `Tingkat komplain terkontrol: ${rate}% dari total order.` });
    }

    const liveROI = today.live?.spending_ads > 0 ? (today.live?.gmv || 0) / today.live.spending_ads : null;
    if (liveROI !== null) {
      if (liveROI >= 2) list.push({ type: 'good', text: `Live streaming efisien dengan ROI ${liveROI.toFixed(2)}x.` });
      else if (liveROI < 1) list.push({ type: 'tip', text: `Live ROI ${liveROI.toFixed(2)}x. Optimalkan waktu live, produk yang dipromosikan, atau kurangi spending ads live.` });
    }

    const closing = today.cs_wa?.closing?.length || 0;
    const masuk = today.cs_wa?.customer_masuk_meta || 0;
    if (masuk > 0) {
      const cr = ((closing / masuk) * 100).toFixed(1);
      list.push({ type: cr >= 20 ? 'good' : 'tip', text: `CS WA: ${cr}% closing rate dari leads Meta (${closing} closing dari ${masuk} leads masuk).` });
    }

    if (list.length === 0) list.push({ type: 'info', text: 'Tambahkan lebih banyak data untuk mendapatkan analisis yang lebih detail.' });
    return list;
  }, [today, yesterday]);

  // Multi-brand comparison
  const { getFilteredReports: getAllReports, BRAND_LABELS: BL, BRAND_COLORS: BC } = useApp();
  const multiCompare = useMemo(() => {
    return BRANDS.map(brand => {
      const reps = getAllReports(brand);
      const last = reps[reps.length - 1];
      if (!last) return { brand: BL[brand], gmv: 0, roi: 0, kol: 0, color: BC[brand] };
      const gmv = (last.marketplace?.gmv_total || 0) + (last.live?.gmv || 0);
      const spend = (last.marketplace?.spending_ads || 0) + (last.live?.spending_ads || 0);
      return { brand: BL[brand], GMV: gmv, ROI: spend > 0 ? +(gmv / spend).toFixed(2) : 0, KOL: last.kol?.total_invited || 0, color: BC[brand] };
    });
  }, [BRANDS, getAllReports, BL, BC]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Analisis — {BRAND_LABELS[selectedBrand]}</h2>

      {/* Insights */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem' }}>
        <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Insight Otomatis (Data Terbaru)</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {insights.map((ins, i) => <Insight key={i} {...ins} />)}
        </div>
      </div>

      {/* Day to day comparison */}
      {compareData.length >= 2 && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem' }}>
          <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Perbandingan GMV Harian (7 Hari Terakhir)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={compareData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
              <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickFormatter={v => 'Rp' + (v / 1e6).toFixed(1) + 'jt'} />
              <Tooltip formatter={(v) => fmtRp(v)} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="GMV" fill={brandColor} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Multi-brand comparison */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem' }}>
        <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Perbandingan Semua Brand (Data Terbaru)</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 16 }}>
          {multiCompare.map((b, i) => (
            <div key={i} style={{ background: 'var(--bg-hover)', borderRadius: 10, padding: '12px 14px', borderLeft: `3px solid ${b.color}` }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: b.color, marginBottom: 6 }}>{b.brand}</div>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{fmtRp(b.GMV)}</div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>ROI {b.ROI}x · KOL {b.KOL}</div>
            </div>
          ))}
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <BarChart data={multiCompare} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
            <XAxis dataKey="brand" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
            <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickFormatter={v => 'Rp' + (v / 1e6).toFixed(1) + 'jt'} />
            <Tooltip formatter={(v) => fmtRp(v)} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
            <Bar dataKey="GMV" radius={[4, 4, 0, 0]}>
              {multiCompare.map((entry, i) => (
                <rect key={i} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Afiliasi performance */}
      {today?.kol?.affiliates_sent?.length > 0 && (
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem' }}>
          <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Performa Afiliasi (Laporan Terbaru)</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  {['Nama', 'Akun', 'Produk', 'Follower', 'GMV', 'Biaya', 'ROI'].map(h => (
                    <th key={h} style={{ padding: '8px 10px', textAlign: 'left', color: 'var(--text-muted)', fontWeight: 600, fontSize: 11, whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {today.kol.affiliates_sent.map((a, i) => {
                  const totalCost = (a.total_biaya || 0) + (a.biaya_endorse || 0);
                  const roi = totalCost > 0 ? (a.gmv / totalCost).toFixed(2) : '-';
                  return (
                    <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '8px 10px', color: 'var(--text-primary)', fontWeight: 600 }}>{a.nama}</td>
                      <td style={{ padding: '8px 10px', color: brandColor }}>{a.akun}</td>
                      <td style={{ padding: '8px 10px', color: 'var(--text-muted)' }}>{a.produk}</td>
                      <td style={{ padding: '8px 10px', color: 'var(--text-muted)' }}>{a.follower?.toLocaleString('id-ID')}</td>
                      <td style={{ padding: '8px 10px', color: '#10b981', fontWeight: 600 }}>{fmtRp(a.gmv)}</td>
                      <td style={{ padding: '8px 10px', color: 'var(--text-muted)' }}>{fmtRp(totalCost)}</td>
                      <td style={{ padding: '8px 10px', fontWeight: 700, color: roi >= 2 ? '#10b981' : roi < 1 ? '#ef4444' : 'var(--text-primary)' }}>{roi}x</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
