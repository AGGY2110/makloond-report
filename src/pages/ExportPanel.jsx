import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { exportReportsToCSV, downloadCSV, sendToGoogleSheets } from '../utils/exportUtils';
import { Download, FileSpreadsheet, Link, CheckCircle, AlertCircle, Copy, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

const APPS_SCRIPT_CODE = `// ================================================
// GOOGLE APPS SCRIPT — Paste di script.google.com
// ================================================
function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheetName = data.brand || 'Data';
    
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
      // Header row
      sheet.appendRow([
        'Tanggal','Brand','KOL Invited','KOL Sent',
        'MP Spending','MP GMV','MP Traffic','MP Konversi',
        'Live GMV','Live Spending','Live Penonton',
        'Total GMV','Total Spending','Total ROI',
        'CS Closing','CS Omset','Resi','Komplain'
      ]);
      sheet.getRange(1,1,1,18).setFontWeight('bold').setBackground('#4a86e8').setFontColor('#ffffff');
    }
    
    // Cek duplikat berdasarkan tanggal + brand
    const lastRow = sheet.getLastRow();
    const dates = lastRow > 1 ? sheet.getRange(2,1,lastRow-1,1).getValues().flat() : [];
    
    data.rows.forEach(row => {
      const idx = dates.indexOf(row.tanggal);
      const rowData = [
        row.tanggal, row.brand, row.kol_invited, row.kol_sent,
        row.mp_spending, row.mp_gmv, row.mp_traffic, row.mp_konversi,
        row.live_gmv, row.live_spending, row.live_penonton,
        row.total_gmv, row.total_spending, row.total_roi,
        row.cs_closing, row.cs_omset, row.resi, row.komplain
      ];
      if (idx >= 0) {
        sheet.getRange(idx + 2, 1, 1, rowData.length).setValues([rowData]);
      } else {
        sheet.appendRow(rowData);
        dates.push(row.tanggal);
      }
    });
    
    return ContentService.createTextOutput(JSON.stringify({status:'ok'})).setMimeType(ContentService.MimeType.JSON);
  } catch(err) {
    return ContentService.createTextOutput(JSON.stringify({status:'error',message:err.toString()})).setMimeType(ContentService.MimeType.JSON);
  }
}`;

function CopyBtn({ text }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button onClick={copy} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '5px 12px', borderRadius: 7, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 12 }}>
      {copied ? <CheckCircle size={12} color="#10b981" /> : <Copy size={12} />}
      {copied ? 'Tersalin!' : 'Salin Kode'}
    </button>
  );
}

export default function ExportPanel() {
  const { getFilteredReports, selectedBrand, BRAND_LABELS, BRAND_COLORS, BRANDS } = useApp();
  const [sheetsUrl, setSheetsUrl] = useState(() => localStorage.getItem('sheets_url_' + selectedBrand) || '');
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);
  const [exportBrand, setExportBrand] = useState(selectedBrand);
  const [showScript, setShowScript] = useState(false);
  const brandColor = BRAND_COLORS[selectedBrand];

  const handleDownloadCSV = (type) => {
    const reports = getFilteredReports(exportBrand);
    if (reports.length === 0) { alert('Tidak ada data untuk diexport.'); return; }
    const csv = exportReportsToCSV(reports, BRAND_LABELS[exportBrand]);
    const date = new Date().toISOString().split('T')[0];
    const map = { summary: 'Ringkasan', kol_detail: 'KOL_Detail', closing_detail: 'Closing_WA', produk_detail: 'Produk_Terjual' };
    downloadCSV(csv[type], `${BRAND_LABELS[exportBrand]}_${map[type]}_${date}.csv`);
  };

  const handleAllBrandsCSV = () => {
    BRANDS.forEach(brand => {
      const reports = getFilteredReports(brand);
      if (reports.length === 0) return;
      const csv = exportReportsToCSV(reports, BRAND_LABELS[brand]);
      const date = new Date().toISOString().split('T')[0];
      setTimeout(() => downloadCSV(csv.summary, `${BRAND_LABELS[brand]}_Ringkasan_${date}.csv`), BRANDS.indexOf(brand) * 300);
    });
  };

  const handleSyncSheets = async () => {
    if (!sheetsUrl) { setSyncStatus({ ok: false, msg: 'Masukkan URL Apps Script terlebih dahulu.' }); return; }
    const reports = getFilteredReports(exportBrand);
    if (reports.length === 0) { setSyncStatus({ ok: false, msg: 'Tidak ada data untuk disinkronkan.' }); return; }
    setSyncing(true);
    setSyncStatus(null);
    try {
      await sendToGoogleSheets(sheetsUrl, reports, BRAND_LABELS[exportBrand]);
      localStorage.setItem('sheets_url_' + exportBrand, sheetsUrl);
      setSyncStatus({ ok: true, msg: `Berhasil! ${reports.length} laporan dikirim ke Google Sheets.` });
    } catch (err) {
      setSyncStatus({ ok: false, msg: err.message });
    } finally {
      setSyncing(false);
    }
  };

  const inp = { padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: 13, width: '100%' };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Export & Sinkronisasi Data</h2>

      {/* Brand selector */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>Pilih Brand untuk Export</label>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {BRANDS.map(b => (
            <button key={b} onClick={() => setExportBrand(b)}
              style={{ padding: '6px 14px', borderRadius: 20, border: '1px solid', fontSize: 13, cursor: 'pointer', transition: 'all 0.15s',
                borderColor: exportBrand === b ? BRAND_COLORS[b] : 'var(--border)',
                background: exportBrand === b ? BRAND_COLORS[b] + '20' : 'transparent',
                color: exportBrand === b ? BRAND_COLORS[b] : 'var(--text-muted)',
                fontWeight: exportBrand === b ? 700 : 500
              }}>
              {BRAND_LABELS[b]}
            </button>
          ))}
        </div>
      </div>

      {/* CSV Download */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#10b98120', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Download size={16} color="#10b981" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>Download CSV</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Bisa dibuka di Excel, Google Sheets, atau Numbers</div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 8 }}>
          {[
            { type: 'summary', label: '📊 Ringkasan Harian', desc: 'Semua KPI per hari' },
            { type: 'kol_detail', label: '🎯 Detail Afiliasi KOL', desc: 'Data per afiliasi' },
            { type: 'closing_detail', label: '💬 Data Closing WA', desc: 'Data customer closing' },
            { type: 'produk_detail', label: '📦 Produk Terjual', desc: 'Detail produk per hari' },
          ].map(({ type, label, desc }) => (
            <button key={type} onClick={() => handleDownloadCSV(type)}
              style={{ display: 'flex', flexDirection: 'column', gap: 2, padding: '12px 14px', borderRadius: 10, border: '1px solid var(--border)', background: 'var(--bg-hover)', cursor: 'pointer', textAlign: 'left', transition: 'border-color 0.15s' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = '#10b981'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border)'}>
              <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{label}</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{desc}</span>
            </button>
          ))}
        </div>
        <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid var(--border)' }}>
          <button onClick={handleAllBrandsCSV}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)', cursor: 'pointer', fontSize: 13 }}>
            <Download size={14} /> Download Semua Brand Sekaligus
          </button>
        </div>
      </div>

      {/* Google Sheets */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{ width: 32, height: 32, borderRadius: 8, background: '#4a86e820', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <FileSpreadsheet size={16} color="#4a86e8" />
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text-primary)' }}>Sinkronisasi ke Google Sheets</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Data otomatis masuk ke spreadsheet Google kamu</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>URL Apps Script Web App</label>
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={sheetsUrl} onChange={e => setSheetsUrl(e.target.value)} placeholder="https://script.google.com/macros/s/XXXX/exec" style={{ ...inp, flex: 1 }} />
              <button onClick={handleSyncSheets} disabled={syncing}
                style={{ padding: '9px 18px', borderRadius: 8, background: syncing ? 'var(--border)' : '#4a86e8', color: '#fff', border: 'none', fontWeight: 700, cursor: syncing ? 'not-allowed' : 'pointer', fontSize: 13, whiteSpace: 'nowrap' }}>
                {syncing ? '⏳ Mengirim...' : '🔄 Sinkron'}
              </button>
            </div>
          </div>

          {syncStatus && (
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '10px 12px', borderRadius: 8, background: syncStatus.ok ? '#10b98115' : '#ef444415', border: `1px solid ${syncStatus.ok ? '#10b98140' : '#ef444440'}` }}>
              {syncStatus.ok ? <CheckCircle size={15} color="#10b981" style={{ flexShrink: 0, marginTop: 1 }} /> : <AlertCircle size={15} color="#ef4444" style={{ flexShrink: 0, marginTop: 1 }} />}
              <span style={{ fontSize: 13, color: syncStatus.ok ? '#10b981' : '#ef4444' }}>{syncStatus.msg}</span>
            </div>
          )}
        </div>

        {/* Setup guide */}
        <div style={{ marginTop: 14, borderTop: '1px solid var(--border)', paddingTop: 14 }}>
          <button onClick={() => setShowScript(!showScript)}
            style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'transparent', border: 'none', color: '#4a86e8', cursor: 'pointer', fontSize: 13, fontWeight: 600, padding: 0 }}>
            {showScript ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            {showScript ? 'Sembunyikan' : 'Tampilkan'} Cara Setup Google Sheets (5 menit)
          </button>

          {showScript && (
            <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { step: '1', title: 'Buat Google Spreadsheet baru', desc: 'Buka sheets.google.com → klik "+ Blank". Beri nama misal "MakloondReport".' },
                { step: '2', title: 'Buka Apps Script', desc: 'Di spreadsheet, klik menu Extensions → Apps Script. Tab baru akan terbuka.' },
                { step: '3', title: 'Paste kode berikut', desc: 'Hapus semua isi kode yang ada, lalu paste kode di bawah ini:' },
                { step: '4', title: 'Deploy sebagai Web App', desc: 'Klik Deploy → New Deployment → pilih type "Web app". Isi: Execute as = "Me", Who has access = "Anyone". Klik Deploy → salin URL yang muncul.' },
                { step: '5', title: 'Paste URL di atas', desc: 'Tempel URL tadi ke kolom "URL Apps Script Web App" di atas, lalu klik Sinkron.' },
              ].map(({ step, title, desc }) => (
                <div key={step} style={{ display: 'flex', gap: 12 }}>
                  <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#4a86e8', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, flexShrink: 0, marginTop: 2 }}>{step}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 3 }}>{title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{desc}</div>
                    {step === '3' && (
                      <div style={{ marginTop: 10 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Google Apps Script Code:</span>
                          <CopyBtn text={APPS_SCRIPT_CODE} />
                        </div>
                        <pre style={{ background: 'var(--bg-hover)', borderRadius: 8, padding: 12, fontSize: 10, overflowX: 'auto', color: 'var(--text-muted)', lineHeight: 1.6, maxHeight: 220, border: '1px solid var(--border)' }}>
                          {APPS_SCRIPT_CODE}
                        </pre>
                      </div>
                    )}
                    {step === '4' && (
                      <a href="https://script.google.com" target="_blank" rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 6, fontSize: 12, color: '#4a86e8', textDecoration: 'none' }}>
                        <ExternalLink size={11} /> Buka script.google.com
                      </a>
                    )}
                  </div>
                </div>
              ))}

              <div style={{ padding: '10px 12px', borderRadius: 8, background: '#f59e0b15', border: '1px solid #f59e0b40', fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.6 }}>
                💡 <strong>Tips:</strong> Setiap brand akan punya tab/sheet sendiri di spreadsheet yang sama. Sinkronisasi bisa dilakukan kapan saja — data yang sudah ada akan diupdate, bukan duplikat.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: '12px 14px', borderRadius: 10, background: 'var(--bg-hover)', border: '1px solid var(--border)', fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.7 }}>
        📌 <strong style={{ color: 'var(--text-primary)' }}>Catatan:</strong> CSV bisa langsung dibuka di Excel atau di-import ke Google Sheets lewat File → Import. Sinkronisasi otomatis ke Google Sheets memerlukan setup Apps Script sekali saja (gratis).
      </div>
    </div>
  );
}
