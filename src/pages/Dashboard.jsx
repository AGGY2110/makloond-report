import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { TrendingUp, TrendingDown, ShoppingBag, Users, Eye, DollarSign, Zap, Package } from 'lucide-react';

function fmtRp(n) { return 'Rp ' + new Intl.NumberFormat('id-ID', { notation: 'compact', maximumFractionDigits: 1 }).format(n || 0); }
function fmtFull(n) { return 'Rp ' + new Intl.NumberFormat('id-ID').format(n || 0); }
function fmt(n) { return new Intl.NumberFormat('id-ID', { notation: 'compact', maximumFractionDigits: 1 }).format(n || 0); }

function MetricCard({ label, value, icon: Icon, trend, color, sub }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1rem 1.25rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
        <div style={{ background: color + '20', borderRadius: 7, padding: '4px 6px' }}><Icon size={13} color={color} /></div>
      </div>
      <div style={{ fontSize: 20, fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>}
      {trend !== undefined && trend !== null && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, marginTop: 4 }}>
          {trend >= 0 ? <TrendingUp size={11} color="#10b981" /> : <TrendingDown size={11} color="#ef4444" />}
          <span style={{ color: trend >= 0 ? '#10b981' : '#ef4444', fontWeight: 700 }}>{trend >= 0 ? '+' : ''}{trend.toFixed(1)}%</span>
          <span style={{ color: 'var(--text-muted)' }}>vs kemarin</span>
        </div>
      )}
    </div>
  );
}

function PlatformCompare({ reports }) {
  const latest = reports[reports.length - 1];
  if (!latest) return null;
  const tt = latest.tiktok || {};
  const sp = latest.shopee || {};
  const lv = latest.live || {};

  const rows = [
    { label: 'GMV', tiktok: tt.gmv_total || 0, shopee: sp.gmv_total || 0, fmt: fmtRp },
    { label: 'Spending Ads', tiktok: tt.spending_ads || 0, shopee: sp.spending_ads || 0, fmt: fmtRp },
    { label: 'ROI', tiktok: tt.spending_ads > 0 ? +((tt.gmv_total||0)/tt.spending_ads).toFixed(2) : 0, shopee: sp.spending_ads > 0 ? +((sp.gmv_total||0)/sp.spending_ads).toFixed(2) : 0, fmt: v => v+'x' },
    { label: 'Traffic', tiktok: tt.traffic || 0, shopee: sp.traffic || 0, fmt: fmt },
    { label: 'Konversi', tiktok: tt.konversi || 0, shopee: sp.konversi || 0, fmt: fmt },
    { label: 'Conv. Rate', tiktok: tt.traffic > 0 ? +((tt.konversi||0)/tt.traffic*100).toFixed(2) : 0, shopee: sp.traffic > 0 ? +((sp.konversi||0)/sp.traffic*100).toFixed(2) : 0, fmt: v => v+'%' },
    { label: 'Avg. Belanja', tiktok: tt.konversi > 0 ? Math.round((tt.gmv_total||0)/tt.konversi) : 0, shopee: sp.konversi > 0 ? Math.round((sp.gmv_total||0)/sp.konversi) : 0, fmt: fmtRp },
  ];

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem' }}>
      <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Perbandingan TikTok vs Shopee (Hari Terakhir)</h3>
      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--text-muted)', fontWeight: 600, fontSize: 11, borderBottom: '1px solid var(--border)' }}>Metrik</th>
            <th style={{ textAlign: 'right', padding: '6px 8px', color: '#010101', fontWeight: 700, fontSize: 12, borderBottom: '1px solid var(--border)', background: '#01010108', borderRadius: '4px 4px 0 0' }}>
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 5 }}>
                <span style={{ width: 14, height: 14, borderRadius: 3, background: '#010101', display: 'inline-block' }}></span> TikTok
              </span>
            </th>
            <th style={{ textAlign: 'right', padding: '6px 8px', color: '#ee4d2d', fontWeight: 700, fontSize: 12, borderBottom: '1px solid var(--border)', background: '#ee4d2d08' }}>
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 5 }}>
                <span style={{ width: 14, height: 14, borderRadius: 3, background: '#ee4d2d', display: 'inline-block' }}></span> Shopee
              </span>
            </th>
            <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--text-muted)', fontWeight: 600, fontSize: 11, borderBottom: '1px solid var(--border)' }}>Unggul</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => {
            const winner = row.tiktok > row.shopee ? 'tiktok' : row.shopee > row.tiktok ? 'shopee' : 'tie';
            return (
              <tr key={i} style={{ borderBottom: '1px solid var(--border)' }}>
                <td style={{ padding: '8px', color: 'var(--text-muted)', fontSize: 12 }}>{row.label}</td>
                <td style={{ padding: '8px', textAlign: 'right', fontWeight: winner === 'tiktok' ? 700 : 400, color: winner === 'tiktok' ? '#010101' : 'var(--text-primary)' }}>
                  {row.fmt(row.tiktok)}
                </td>
                <td style={{ padding: '8px', textAlign: 'right', fontWeight: winner === 'shopee' ? 700 : 400, color: winner === 'shopee' ? '#ee4d2d' : 'var(--text-primary)' }}>
                  {row.fmt(row.shopee)}
                </td>
                <td style={{ padding: '8px', textAlign: 'right' }}>
                  {winner === 'tiktok' && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: '#01010115', color: '#010101', fontWeight: 600 }}>TikTok</span>}
                  {winner === 'shopee' && <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: '#ee4d2d15', color: '#ee4d2d', fontWeight: 600 }}>Shopee</span>}
                  {winner === 'tie' && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>—</span>}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default function Dashboard() {
  const { getFilteredReports, selectedBrand, BRAND_LABELS, BRAND_COLORS, BRAND_PLATFORMS, setCurrentPage, setEditingReport, dateRange, setDateRange } = useApp();
  const reports = getFilteredReports(selectedBrand);
  const latest = reports[reports.length - 1];
  const prev = reports[reports.length - 2];
  const platforms = BRAND_PLATFORMS[selectedBrand] || ['tiktok'];
  const brandColor = BRAND_COLORS[selectedBrand];

  const chartData = useMemo(() => reports.map(r => ({
    date: r.date.slice(5),
    'GMV TikTok': r.tiktok?.gmv_total || 0,
    'GMV Shopee': r.shopee?.gmv_total || 0,
    'GMV Live': r.live?.gmv || 0,
    'GMV Meta': r.meta?.omset || 0,
    'Spend TikTok': r.tiktok?.spending_ads || 0,
    'Spend Shopee': r.shopee?.spending_ads || 0,
    'ROI TikTok': r.tiktok?.spending_ads > 0 ? +((r.tiktok?.gmv_total||0)/r.tiktok?.spending_ads).toFixed(2) : 0,
    'ROI Shopee': r.shopee?.spending_ads > 0 ? +((r.shopee?.gmv_total||0)/r.shopee?.spending_ads).toFixed(2) : 0,
    'Traffic TikTok': r.tiktok?.traffic || 0,
    'Traffic Shopee': r.shopee?.traffic || 0,
    'KOL': r.kol?.total_invited || 0,
  })), [reports]);

  const totalGMV = (latest?.tiktok?.gmv_total || 0) + (latest?.shopee?.gmv_total || 0) + (latest?.live?.gmv || 0) + (latest?.meta?.omset || 0);
  const prevGMV = (prev?.tiktok?.gmv_total || 0) + (prev?.shopee?.gmv_total || 0) + (prev?.live?.gmv || 0) + (prev?.meta?.omset || 0);
  const totalSpend = (latest?.tiktok?.spending_ads || 0) + (latest?.shopee?.spending_ads || 0) + (latest?.live?.spending_ads || 0) + (latest?.meta?.spending_ads || 0);
  const prevSpend = (prev?.tiktok?.spending_ads || 0) + (prev?.shopee?.spending_ads || 0) + (prev?.live?.spending_ads || 0) + (prev?.meta?.spending_ads || 0);
  const totalROI = totalSpend > 0 ? (totalGMV / totalSpend).toFixed(2) : '-';

  const trend = (cur, prv) => prv > 0 ? ((cur - prv) / prv * 100) : null;

  const topProds = useMemo(() => {
    const all = {};
    reports.forEach(r => {
      ['tiktok', 'shopee'].forEach(plat => {
        (r[plat]?.produk_terjual || []).forEach(p => {
          const key = `${p.nama}__${plat}`;
          if (!all[key]) all[key] = { nama: p.nama, platform: plat, qty: 0, rupiah: 0 };
          all[key].qty += p.qty || 0;
          all[key].rupiah += p.rupiah || 0;
        });
      });
    });
    return Object.values(all).sort((a, b) => b.rupiah - a.rupiah).slice(0, 6);
  }, [reports]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Date filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Filter tanggal:</span>
        <input type="date" value={dateRange.from} onChange={e => setDateRange(p => ({ ...p, from: e.target.value }))} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 12 }} />
        <span style={{ color: 'var(--text-muted)' }}>s/d</span>
        <input type="date" value={dateRange.to} onChange={e => setDateRange(p => ({ ...p, to: e.target.value }))} style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 12 }} />
        {(dateRange.from || dateRange.to) && <button onClick={() => setDateRange({ from: '', to: '' })} style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 12, cursor: 'pointer' }}>Reset</button>}
        <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>{reports.length} laporan</span>
      </div>

      {reports.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
          <Package size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>Belum ada data</p>
          <p style={{ marginBottom: 20 }}>Mulai input laporan harian untuk {BRAND_LABELS[selectedBrand]}</p>
          <button onClick={() => setCurrentPage('input')} style={{ padding: '10px 24px', borderRadius: 10, background: brandColor, color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: 14 }}>+ Tambah Laporan</button>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 10 }}>
            <MetricCard label="Total GMV" value={fmtRp(totalGMV)} icon={DollarSign} color={brandColor} trend={trend(totalGMV, prevGMV)} sub="Semua platform" />
            <MetricCard label="Total Spending" value={fmtRp(totalSpend)} icon={Zap} color="#f97316" trend={trend(totalSpend, prevSpend)} />
            <MetricCard label="Total ROI" value={totalROI + 'x'} icon={TrendingUp} color="#10b981" sub="GMV / Spending" />
            {platforms.includes('tiktok') && <MetricCard label="GMV TikTok" value={fmtRp(latest?.tiktok?.gmv_total)} icon={ShoppingBag} color="#010101" trend={trend(latest?.tiktok?.gmv_total, prev?.tiktok?.gmv_total)} sub={`ROI ${latest?.tiktok?.spending_ads > 0 ? ((latest?.tiktok?.gmv_total||0)/latest?.tiktok?.spending_ads).toFixed(1) : '-'}x`} />}
            {platforms.includes('shopee') && <MetricCard label="GMV Shopee" value={fmtRp(latest?.shopee?.gmv_total)} icon={ShoppingBag} color="#ee4d2d" trend={trend(latest?.shopee?.gmv_total, prev?.shopee?.gmv_total)} sub={`ROI ${latest?.shopee?.spending_ads > 0 ? ((latest?.shopee?.gmv_total||0)/latest?.shopee?.spending_ads).toFixed(1) : '-'}x`} />}
            {platforms.includes('tiktok') && <MetricCard label="GMV Live" value={fmtRp(latest?.live?.gmv)} icon={Eye} color="#06b6d4" trend={trend(latest?.live?.gmv, prev?.live?.gmv)} sub={`ROI ${latest?.live?.spending_ads > 0 ? ((latest?.live?.gmv||0)/latest?.live?.spending_ads).toFixed(1) : '-'}x`} />}
            {platforms.includes('meta') && <MetricCard label="Omset Meta" value={fmtRp(latest?.meta?.omset)} icon={DollarSign} color="#1877f2" sub={`${latest?.meta?.closing || 0} closing`} />}
            <MetricCard label="KOL Diundang" value={fmt(latest?.kol?.total_invited)} icon={Users} color="#ec4899" trend={trend(latest?.kol?.total_invited, prev?.kol?.total_invited)} />
          </div>

          {/* Platform mini summary */}
          {platforms.includes('tiktok') && platforms.includes('shopee') && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px', borderLeft: '3px solid #010101' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#010101', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 14, height: 14, borderRadius: 3, background: '#010101', display: 'inline-block' }}></span> TikTok Shop
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[
                    ['GMV', fmtRp(latest?.tiktok?.gmv_total)],
                    ['Spending', fmtRp(latest?.tiktok?.spending_ads)],
                    ['ROI', (latest?.tiktok?.spending_ads > 0 ? ((latest?.tiktok?.gmv_total||0)/latest?.tiktok?.spending_ads).toFixed(2) : '-') + 'x'],
                    ['Traffic', fmt(latest?.tiktok?.traffic)],
                    ['Konversi', fmt(latest?.tiktok?.konversi)],
                    ['Affiliasi GMV', fmtRp(latest?.tiktok?.gmv_affiliate)],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 1 }}>{k}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '14px', borderLeft: '3px solid #ee4d2d' }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#ee4d2d', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ width: 14, height: 14, borderRadius: 3, background: '#ee4d2d', display: 'inline-block' }}></span> Shopee
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                  {[
                    ['GMV', fmtRp(latest?.shopee?.gmv_total)],
                    ['Spending', fmtRp(latest?.shopee?.spending_ads)],
                    ['ROI', (latest?.shopee?.spending_ads > 0 ? ((latest?.shopee?.gmv_total||0)/latest?.shopee?.spending_ads).toFixed(2) : '-') + 'x'],
                    ['Traffic', fmt(latest?.shopee?.traffic)],
                    ['Konversi', fmt(latest?.shopee?.konversi)],
                    ['Flash Sale', fmtRp(latest?.shopee?.gmv_flash_sale)],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginBottom: 1 }}>{k}</div>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{v}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* GMV Trend Chart */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem' }}>
            <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Tren GMV per Platform</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickFormatter={v => fmtRp(v)} />
                <Tooltip formatter={(v, n) => [fmtFull(v), n]} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 11 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {platforms.includes('tiktok') && <Line type="monotone" dataKey="GMV TikTok" stroke="#010101" strokeWidth={2.5} dot={{ r: 3 }} />}
                {platforms.includes('shopee') && <Line type="monotone" dataKey="GMV Shopee" stroke="#ee4d2d" strokeWidth={2.5} dot={{ r: 3 }} />}
                {platforms.includes('tiktok') && <Line type="monotone" dataKey="GMV Live" stroke="#06b6d4" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 2 }} />}
                {platforms.includes('meta') && <Line type="monotone" dataKey="GMV Meta" stroke="#1877f2" strokeWidth={2} dot={{ r: 3 }} />}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* ROI Comparison */}
          {platforms.includes('tiktok') && platforms.includes('shopee') && (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem' }}>
                <h3 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>ROI Harian per Platform</h3>
                <ResponsiveContainer width="100%" height={160}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} />
                    <YAxis tick={{ fontSize: 9, fill: 'var(--text-muted)' }} tickFormatter={v => v + 'x'} />
                    <Tooltip formatter={(v, n) => [v + 'x', n]} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 11 }} />
                    <Line type="monotone" dataKey="ROI TikTok" stroke="#010101" strokeWidth={2} dot={{ r: 2 }} />
                    <Line type="monotone" dataKey="ROI Shopee" stroke="#ee4d2d" strokeWidth={2} dot={{ r: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem' }}>
                <h3 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Traffic Harian per Platform</h3>
                <ResponsiveContainer width="100%" height={160}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                    <XAxis dataKey="date" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} />
                    <YAxis tick={{ fontSize: 9, fill: 'var(--text-muted)' }} tickFormatter={v => fmt(v)} />
                    <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 11 }} />
                    <Bar dataKey="Traffic TikTok" fill="#010101" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="Traffic Shopee" fill="#ee4d2d" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Tabel perbandingan */}
          {platforms.includes('tiktok') && platforms.includes('shopee') && <PlatformCompare reports={reports} />}

          {/* Top products */}
          {topProds.length > 0 && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem' }}>
              <h3 style={{ margin: '0 0 14px', fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Produk Terlaris (Semua Periode & Platform)</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {topProds.map((p, i) => {
                  const pct = topProds[0].rupiah > 0 ? (p.rupiah / topProds[0].rupiah * 100) : 0;
                  const pc = p.platform === 'tiktok' ? '#010101' : '#ee4d2d';
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 18, fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textAlign: 'center' }}>{i + 1}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 4, background: pc + '18', color: pc, fontWeight: 700 }}>{p.platform === 'tiktok' ? 'TT' : 'SP'}</span>
                            <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{p.nama}</span>
                          </div>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{fmt(p.qty)} pcs · {fmtRp(p.rupiah)}</span>
                        </div>
                        <div style={{ height: 4, background: 'var(--border)', borderRadius: 4 }}>
                          <div style={{ height: '100%', width: pct + '%', background: pc, borderRadius: 4 }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Riwayat */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Riwayat Laporan</h3>
              <button onClick={() => { setEditingReport(null); setCurrentPage('input'); }} style={{ padding: '7px 16px', borderRadius: 8, background: brandColor, color: '#fff', border: 'none', fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>+ Tambah</button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[...reports].reverse().slice(0, 10).map((r, i) => {
                const gmv = (r.tiktok?.gmv_total || 0) + (r.shopee?.gmv_total || 0) + (r.live?.gmv || 0) + (r.meta?.omset || 0);
                const spend = (r.tiktok?.spending_ads || 0) + (r.shopee?.spending_ads || 0) + (r.live?.spending_ads || 0) + (r.meta?.spending_ads || 0);
                const roi = spend > 0 ? (gmv / spend).toFixed(1) : '-';
                return (
                  <div key={i} onClick={() => { setEditingReport(r); setCurrentPage('input'); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', borderRadius: 8, cursor: 'pointer', background: 'var(--bg-hover)' }}>
                    <div style={{ width: 34, height: 34, borderRadius: 8, background: brandColor + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: brandColor }}>
                      {r.date.slice(8)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>{r.date}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        GMV {fmtRp(gmv)} · ROI {roi}x
                        {r.tiktok?.gmv_total ? ` · TT ${fmtRp(r.tiktok.gmv_total)}` : ''}
                        {r.shopee?.gmv_total ? ` · SP ${fmtRp(r.shopee.gmv_total)}` : ''}
                      </div>
                    </div>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Edit →</span>
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
