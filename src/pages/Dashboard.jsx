import React, { useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, TrendingDown, ShoppingBag, Users, Eye, DollarSign, Zap, Package } from 'lucide-react';

function fmt(n) { return new Intl.NumberFormat('id-ID', { notation: 'compact', maximumFractionDigits: 1 }).format(n || 0); }
function fmtRp(n) { return 'Rp ' + new Intl.NumberFormat('id-ID', { notation: 'compact', maximumFractionDigits: 1 }).format(n || 0); }
function fmtFull(n) { return 'Rp ' + new Intl.NumberFormat('id-ID').format(n || 0); }

function MetricCard({ label, value, icon: Icon, trend, color, sub }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
        <div style={{ background: color + '20', borderRadius: 8, padding: '4px 6px' }}>
          <Icon size={14} color={color} />
        </div>
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{sub}</div>}
      {trend !== undefined && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12 }}>
          {trend >= 0 ? <TrendingUp size={12} color="#10b981" /> : <TrendingDown size={12} color="#ef4444" />}
          <span style={{ color: trend >= 0 ? '#10b981' : '#ef4444', fontWeight: 600 }}>
            {trend >= 0 ? '+' : ''}{trend.toFixed(1)}%
          </span>
          <span style={{ color: 'var(--text-muted)' }}>vs kemarin</span>
        </div>
      )}
    </div>
  );
}

function calcTrend(cur, prev) {
  if (!prev || prev === 0) return null;
  return ((cur - prev) / prev) * 100;
}

export default function Dashboard() {
  const { getFilteredReports, selectedBrand, BRAND_LABELS, BRAND_COLORS, setCurrentPage, setEditingReport, dateRange, setDateRange } = useApp();
  const reports = getFilteredReports(selectedBrand);
  const latest = reports[reports.length - 1];
  const prev = reports[reports.length - 2];

  const chartData = useMemo(() => reports.map(r => ({
    date: r.date.slice(5),
    GMV: (r.marketplace?.gmv_total || 0) + (r.live?.gmv || 0),
    'Spending Ads': (r.marketplace?.spending_ads || 0) + (r.live?.spending_ads || 0),
    Traffic: r.marketplace?.traffic || 0,
    Konversi: r.marketplace?.konversi || 0,
    ROI: r.marketplace?.spending_ads > 0 ? ((r.marketplace?.gmv_total || 0) / r.marketplace?.spending_ads).toFixed(2) : 0,
    'KOL Invited': r.kol?.total_invited || 0,
    'Affiliat Dikirim': r.kol?.affiliates_sent?.length || 0
  })), [reports]);

  const gmvBreakdown = useMemo(() => {
    if (!latest) return [];
    const mp = latest.marketplace || {};
    return [
      { name: 'Affiliate', value: mp.gmv_affiliate || 0, color: '#f97316' },
      { name: 'Konten Pribadi', value: mp.gmv_konten_pribadi || 0, color: '#8b5cf6' },
      { name: 'Live', value: mp.gmv_live || 0, color: '#06b6d4' },
      { name: 'Shop Lain', value: mp.gmv_shop_lain || 0, color: '#10b981' }
    ].filter(x => x.value > 0);
  }, [latest]);

  const topProducts = useMemo(() => {
    const allProds = {};
    reports.forEach(r => {
      (r.marketplace?.produk_terjual || []).forEach(p => {
        if (!allProds[p.nama]) allProds[p.nama] = { nama: p.nama, qty: 0, rupiah: 0 };
        allProds[p.nama].qty += Number(p.qty || 0);
        allProds[p.nama].rupiah += Number(p.rupiah || 0);
      });
    });
    return Object.values(allProds).sort((a, b) => b.rupiah - a.rupiah).slice(0, 6);
  }, [reports]);

  const latestGMV = (latest?.marketplace?.gmv_total || 0) + (latest?.live?.gmv || 0);
  const prevGMV = (prev?.marketplace?.gmv_total || 0) + (prev?.live?.gmv || 0);
  const latestSpend = (latest?.marketplace?.spending_ads || 0) + (latest?.live?.spending_ads || 0);
  const prevSpend = (prev?.marketplace?.spending_ads || 0) + (prev?.live?.spending_ads || 0);
  const roi = latestSpend > 0 ? (latestGMV / latestSpend).toFixed(2) : '-';
  const prevRoi = (prev?.marketplace?.spending_ads || 0) + (prev?.live?.spending_ads || 0);

  const brandColor = BRAND_COLORS[selectedBrand];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Date filter */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span style={{ fontSize: 13, color: 'var(--text-muted)', fontWeight: 500 }}>Filter tanggal:</span>
        <input type="date" value={dateRange.from} onChange={e => setDateRange(p => ({ ...p, from: e.target.value }))}
          style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 13 }} />
        <span style={{ color: 'var(--text-muted)' }}>s/d</span>
        <input type="date" value={dateRange.to} onChange={e => setDateRange(p => ({ ...p, to: e.target.value }))}
          style={{ padding: '6px 10px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-card)', color: 'var(--text-primary)', fontSize: 13 }} />
        {(dateRange.from || dateRange.to) && (
          <button onClick={() => setDateRange({ from: '', to: '' })}
            style={{ padding: '6px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', fontSize: 13, cursor: 'pointer' }}>
            Reset
          </button>
        )}
        <span style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--text-muted)' }}>{reports.length} laporan</span>
      </div>

      {reports.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', color: 'var(--text-muted)' }}>
          <Package size={48} style={{ margin: '0 auto 16px', opacity: 0.3 }} />
          <p style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>Belum ada data</p>
          <p style={{ marginBottom: 20 }}>Mulai dengan menambahkan laporan harian untuk {BRAND_LABELS[selectedBrand]}</p>
          <button onClick={() => setCurrentPage('input')}
            style={{ padding: '10px 24px', borderRadius: 10, background: brandColor, color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: 14 }}>
            + Tambah Laporan
          </button>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
            <MetricCard label="Total GMV" value={fmtRp(latestGMV)} icon={DollarSign} color={brandColor} trend={calcTrend(latestGMV, prevGMV)} sub={`Marketplace + Live`} />
            <MetricCard label="Spending Ads" value={fmtRp(latestSpend)} icon={Zap} color="#f97316" trend={calcTrend(latestSpend, prevSpend)} />
            <MetricCard label="ROI" value={roi + 'x'} icon={TrendingUp} color="#10b981" sub="GMV / Spending" />
            <MetricCard label="Traffic" value={fmt(latest?.marketplace?.traffic)} icon={Eye} color="#8b5cf6" trend={calcTrend(latest?.marketplace?.traffic, prev?.marketplace?.traffic)} />
            <MetricCard label="Konversi" value={fmt(latest?.marketplace?.konversi)} icon={ShoppingBag} color="#06b6d4" trend={calcTrend(latest?.marketplace?.konversi, prev?.marketplace?.konversi)} />
            <MetricCard label="KOL Diundang" value={fmt(latest?.kol?.total_invited)} icon={Users} color="#ec4899" trend={calcTrend(latest?.kol?.total_invited, prev?.kol?.total_invited)} />
          </div>

          {/* GMV Chart */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Tren GMV vs Spending Ads</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 11, fill: 'var(--text-muted)' }} tickFormatter={v => fmt(v)} />
                <Tooltip formatter={(v, n) => [fmtFull(v), n]} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="GMV" stroke={brandColor} strokeWidth={2.5} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="Spending Ads" stroke="#f97316" strokeWidth={2} strokeDasharray="4 4" dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            {/* Traffic & Konversi */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Traffic & Konversi</h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} tickFormatter={v => fmt(v)} />
                  <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="Traffic" fill="#8b5cf6" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Konversi" fill="#06b6d4" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* GMV Breakdown pie */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Sumber GMV (Hari Terakhir)</h3>
              {gmvBreakdown.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={130}>
                    <PieChart>
                      <Pie data={gmvBreakdown} cx="50%" cy="50%" innerRadius={35} outerRadius={55} dataKey="value" paddingAngle={3}>
                        {gmvBreakdown.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                      </Pie>
                      <Tooltip formatter={(v) => fmtFull(v)} contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 12px', marginTop: 8 }}>
                    {gmvBreakdown.map((d, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11 }}>
                        <div style={{ width: 8, height: 8, borderRadius: 2, background: d.color }} />
                        <span style={{ color: 'var(--text-muted)' }}>{d.name}</span>
                        <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{fmtRp(d.value)}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : <div style={{ color: 'var(--text-muted)', fontSize: 13, textAlign: 'center', padding: '40px 0' }}>Belum ada data</div>}
            </div>
          </div>

          {/* Top Products */}
          {topProducts.length > 0 && (
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem' }}>
              <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Produk Terlaris (Semua Periode)</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {topProducts.map((p, i) => {
                  const maxRp = topProducts[0].rupiah;
                  const pct = maxRp > 0 ? (p.rupiah / maxRp) * 100 : 0;
                  return (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ width: 20, fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textAlign: 'center' }}>{i + 1}</div>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{p.nama}</span>
                          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{fmt(p.qty)} pcs · {fmtRp(p.rupiah)}</span>
                        </div>
                        <div style={{ height: 4, background: 'var(--border)', borderRadius: 4, overflow: 'hidden' }}>
                          <div style={{ height: '100%', width: pct + '%', background: brandColor, borderRadius: 4, transition: 'width 0.6s ease' }} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* KOL Trend */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem' }}>
            <h3 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Aktivitas KOL</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={chartData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} />
                <Tooltip contentStyle={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="KOL Invited" fill="#ec4899" radius={[3, 3, 0, 0]} />
                <Bar dataKey="Affiliat Dikirim" fill={brandColor} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Recent reports list */}
          <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h3 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Riwayat Laporan</h3>
              <button onClick={() => setCurrentPage('input')}
                style={{ padding: '7px 16px', borderRadius: 8, background: brandColor, color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', fontSize: 13 }}>
                + Tambah
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[...reports].reverse().slice(0, 10).map((r, i) => {
                const gmv = (r.marketplace?.gmv_total || 0) + (r.live?.gmv || 0);
                const spend = (r.marketplace?.spending_ads || 0) + (r.live?.spending_ads || 0);
                const roi = spend > 0 ? (gmv / spend).toFixed(1) : '-';
                return (
                  <div key={i} onClick={() => { setEditingReport(r); setCurrentPage('input'); }}
                    style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px', borderRadius: 8, cursor: 'pointer', background: 'var(--bg-hover)', transition: 'background 0.15s' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--bg-hover2)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'var(--bg-hover)'}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: brandColor + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: brandColor }}>
                      {r.date.slice(8)}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{r.date}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                        GMV {fmtRp(gmv)} · ROI {roi}x · KOL {r.kol?.total_invited || 0}
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Edit →</div>
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
