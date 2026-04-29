import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { exportReportsToCSV, downloadCSV, sendToGoogleSheets } from '../utils/exportUtils';
import { Download, Sheet, ChevronDown, ChevronUp, CheckCircle, AlertCircle, Loader, ExternalLink, Copy, Check } from 'lucide-react';

const APPS_SCRIPT_CODE = `// Google Apps Script — Paste ini di script.google.com
// Kemudian Deploy sebagai Web App (lihat panduan di bawah)

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    const sheetName = data.brand || 'Data';
    
    let sheet = ss.getSheetByName(sheetName);
    if (!sheet) {
      sheet = ss.insertSheet(sheetName);
    }
    
    const headers = [
      'Tanggal','Brand','KOL_Invited','KOL_Sent',
      'MP_Spending','MP_GMV','MP_Traffic','MP_Konversi',
      'Live_GMV','Live_Spending','Live_Penonton',
      'Total_GMV','Total_Spending','Total_ROI',
      'CS_Closing','CS_Omset','Resi','Komplain'
    ];
    
    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
    
    data.rows.forEach(row => {
      const existing = sheet.getDataRange().getValues();
      const dateCol = 0;
      const dupIdx = existing.findIndex((r, i) => i > 0 && r[dateCol] === row.tanggal);
      
      const rowArr = [
        row.tanggal, row.brand, row.kol_invited, row.kol_sent,
        row.mp_spending, row.mp_gmv, row.mp_traffic, row.mp_konversi,
        row.live_gmv, row.live_spending, row.live_penonton,
        row.total_gmv, row.total_spending, row.total_roi,
        row.cs_closing, row.cs_omset, row.resi, row.komplain
      ];
      
      if (dupIdx >= 0) {
        sheet.getRange(dupIdx + 1, 1, 1, rowArr.length).setValues([rowArr]);
      } else {
        sheet.appendRow(rowArr);
      }
    });
    
    sheet.autoResizeColumns(1, headers.length);
    
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'ok', rows: data.rows.length }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: 'error', message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}`;

function CodeBlock({ code }) {
  const [copied, setCopied] = useState(false);
  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div style={{ position: 'relative', background: 'var(--bg-hover)', borderRadius: 8, border: '1px solid var(--border)' }}>
      <button onClick={copy} style={{
        position: 'absolute', top: 8, right: 8, padding: '4px 10px', borderRadius: 6,
        border: '1px solid var(--border)', background: 'var(--bg-card)', cursor: 'pointer',
        fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: 4
      }}>
        {copied ? <><Check size={10} color="#10b981" /> Disalin!</> : <><Copy size={10} /> Salin Kode</>}
      </button>
      <pre style={{ margin: 0, padding: '12px 14px', fontSize: 11, lineHeight: 1.6, color: 'var(--text-primary)', overflowX: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word', maxHeight: 200 }}>
        {code}
      </pre>
    </div>
  );
}

function Step({ num, text, sub }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
      <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: '#fff', flexShrink: 0, marginTop: 1 }}>{num}</div>
      <div>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: sub ? 2 : 0 }}>{text}</div>
        {sub && <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>{sub}</div>}
      </div>
    </div>
  );
}

export default function ExportPanel() {
  const { getFilteredReports, getReportsByBrand, selectedBrand, BRAND_LABELS, BRAND_COLORS, BRANDS } = useApp();
  const [showGuide, setShowGuide] = useState(false);
  const [sheetsUrl, setSheetsUrl] = useState(() => localStorage.getItem('sheets_url_' + selectedBrand) || '');
  const [sending, setSending] = useState(false);
  const [sendStatus, setSendStatus] = useState(null); // null | 'ok' | 'error'
  const [sendMsg, setSendMsg] = useState('');
  const [exportScope, setExportScope] = useState('brand'); // 'brand' | 'all' | 'filtered'

  const brandColor = BRAND_COLORS[selectedBrand];
  const reports = exportScope === 'filtered' ? getFilteredReports(selectedBrand) : getReportsByBrand(selectedBrand);

  const saveUrl = (url) => {
    setSheetsUrl(url);
    localStorage.setItem('sheets_url_' + selectedBrand, url);
  };

  const handleDownloadSummary = () => {
    const { summary } = exportReportsToCSV(reports, BRAND_LABELS[selectedBrand]);
    downloadCSV(summary, `${selectedBrand}_summary_${new Date().toISOString().slice(0,10)}.csv`);
  };

  const handleDownloadKOL = () => {
    const { kol_detail } = exportReportsToCSV(reports, BRAND_LABELS[selectedBrand]);
    downloadCSV(kol_detail, `${selectedBrand}_kol_detail_${new Date().toISOString().slice(0,10)}.csv`);
  };

  const handleDownloadClosing = () => {
    const { closing_detail } = exportReportsToCSV(reports, BRAND_LABELS[selectedBrand]);
    downloadCSV(closing_detail, `${selectedBrand}_closing_wa_${new Date().toISOString().slice(0,10)}.csv`);
  };

  const handleDownloadProduk = () => {
    const { produk_detail } = exportReportsToCSV(reports, BRAND_LABELS[selectedBrand]);
    downloadCSV(produk_detail, `${selectedBrand}_produk_terjual_${new Date().toISOString().slice(0,10)}.csv`);
  };

  const handleDownloadAll = () => {
    BRANDS.forEach(brand => {
      const reps = getReportsByBrand(brand);
      if (reps.length === 0) return;
      const { summary } = exportReportsToCSV(reps, BRAND_LABELS[brand]);
      downloadCSV(summary, `${brand}_all_${new Date().toISOString().slice(0,10)}.csv`);
    });
  };

  const handleSendSheets = async () => {
    if (!sheetsUrl) { setSendStatus('error'); setSendMsg('Masukkan URL Apps Script dulu.'); return; }
    setSending(true); setSendStatus(null); setSendMsg('');
    try {
      await sendToGoogleSheets(sheetsUrl, reports, BRAND_LABELS[selectedBrand]);
      setSendStatus('ok');
      setSendMsg(`Berhasil kirim ${reports.length} laporan ke Google Sheets!`);
    } catch (err) {
      setSendStatus('error');
      setSendMsg('Gagal: ' + err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Export & Sinkronisasi Data</h2>

      {/* Scope selector */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 10 }}>Pilih Data yang Diekspor</div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {[['brand', `Semua laporan ${BRAND_LABELS[selectedBrand]}`], ['filtered', 'Sesuai filter tanggal aktif']].map(([val, lbl]) => (
            <button key={val} onClick={() => setExportScope(val)} style={{
              padding: '7px 14px', borderRadius: 20, border: '1px solid',
              borderColor: exportScope === val ? brandColor : 'var(--border)',
              background: exportScope === val ? brandColor + '15' : 'transparent',
              color: exportScope === val ? brandColor : 'var(--text-muted)',
              fontWeight: exportScope === val ? 700 : 500, fontSize: 13, cursor: 'pointer'
            }}>{lbl}</button>
          ))}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 8 }}>
          {reports.length} laporan akan diekspor
        </div>
      </div>

      {/* Download CSV */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Download size={16} color={brandColor} />
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Download sebagai CSV</h3>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.5 }}>
          File CSV langsung bisa dibuka di Excel, Google Sheets, atau Numbers. Data dipisah menjadi beberapa sheet sesuai kategori.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10 }}>
          {[
            { label: 'Summary Lengkap', sub: 'Semua metrik per hari', fn: handleDownloadSummary, color: brandColor },
            { label: 'Detail KOL & Afiliasi', sub: 'Data per afiliasi + biaya', fn: handleDownloadKOL, color: '#ec4899' },
            { label: 'Detail Closing WA', sub: 'Data customer closing', fn: handleDownloadClosing, color: '#22c55e' },
            { label: 'Detail Produk Terjual', sub: 'Per produk per hari', fn: handleDownloadProduk, color: '#8b5cf6' },
          ].map((btn, i) => (
            <button key={i} onClick={btn.fn} disabled={reports.length === 0}
              style={{
                padding: '12px 14px', borderRadius: 10, border: `1px solid ${btn.color}40`,
                background: btn.color + '10', color: reports.length === 0 ? 'var(--text-muted)' : btn.color,
                cursor: reports.length === 0 ? 'not-allowed' : 'pointer',
                display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 3, textAlign: 'left',
                opacity: reports.length === 0 ? 0.5 : 1
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Download size={13} />
                <span style={{ fontWeight: 700, fontSize: 13 }}>{btn.label}</span>
              </div>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{btn.sub}</span>
            </button>
          ))}
        </div>

        <div style={{ borderTop: '1px solid var(--border)', marginTop: 14, paddingTop: 14 }}>
          <button onClick={handleDownloadAll}
            style={{ padding: '9px 18px', borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-primary)', fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Download size={14} />
            Download Semua Brand Sekaligus
          </button>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>Mengunduh 4 file CSV terpisah untuk semua brand yang memiliki data.</div>
        </div>
      </div>

      {/* Google Sheets */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 12, padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <div style={{ width: 18, height: 18, background: '#0f9d58', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, color: '#fff' }}>G</div>
          <h3 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Kirim ke Google Sheets (Otomatis)</h3>
        </div>
        <p style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 14, lineHeight: 1.5 }}>
          Data langsung masuk ke Google Sheets milik kamu. Sekali setup, bisa dipakai terus. Gratis menggunakan Google Apps Script.
        </p>

        <div style={{ marginBottom: 12 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            URL Apps Script Web App — {BRAND_LABELS[selectedBrand]}
          </label>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={sheetsUrl}
              onChange={e => saveUrl(e.target.value)}
              placeholder="https://script.google.com/macros/s/..."
              style={{ flex: 1, padding: '9px 12px', borderRadius: 8, border: '1px solid var(--border)', background: 'var(--bg-input)', color: 'var(--text-primary)', fontSize: 13 }}
            />
            <button onClick={handleSendSheets} disabled={sending || reports.length === 0}
              style={{
                padding: '9px 18px', borderRadius: 8, border: 'none',
                background: sending ? 'var(--bg-hover)' : '#0f9d58', color: '#fff',
                fontWeight: 700, fontSize: 13, cursor: sending ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
                opacity: reports.length === 0 ? 0.5 : 1
              }}>
              {sending ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Mengirim...</> : 'Kirim ke Sheets'}
            </button>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 5 }}>URL ini disimpan otomatis di browser kamu per brand.</div>
        </div>

        {sendStatus && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 8,
            background: sendStatus === 'ok' ? '#10b98115' : '#ef444415',
            border: `1px solid ${sendStatus === 'ok' ? '#10b98140' : '#ef444440'}`,
            fontSize: 13, color: sendStatus === 'ok' ? '#10b981' : '#ef4444', marginBottom: 8
          }}>
            {sendStatus === 'ok' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
            {sendMsg}
          </div>
        )}

        {/* Setup guide */}
        <button onClick={() => setShowGuide(!showGuide)} style={{
          display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', borderRadius: 8,
          border: '1px solid var(--border)', background: 'transparent', color: 'var(--text-muted)',
          fontSize: 13, cursor: 'pointer', fontWeight: 500, width: '100%', justifyContent: 'space-between'
        }}>
          <span>📖 Panduan Setup Google Sheets (sekali saja, 5 menit)</span>
          {showGuide ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showGuide && (
          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div style={{ background: 'var(--bg-hover)', borderRadius: 10, padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 12 }}>
              <Step num="1" text="Buat Google Spreadsheet baru"
                sub="Buka sheets.google.com → klik + Spreadsheet Baru. Beri nama misal 'Laporan Marketing Makloond'." />
              <Step num="2" text="Buka Apps Script"
                sub="Di spreadsheet, klik menu Extensions → Apps Script. Tab baru akan terbuka." />
              <Step num="3" text="Paste kode di bawah ini" sub="Hapus semua kode yang ada, lalu paste kode ini:" />
              <CodeBlock code={APPS_SCRIPT_CODE} />
              <Step num="4" text="Simpan & Deploy"
                sub="Klik ikon Save (💾) → lalu klik Deploy → New Deployment. Pilih Type: Web App. Set 'Who has access' ke Anyone. Klik Deploy." />
              <Step num="5" text="Salin URL Web App"
                sub="Setelah deploy, kamu dapat URL seperti: https://script.google.com/macros/s/ABC.../exec — copy URL ini." />
              <Step num="6" text="Paste URL di kolom atas" sub="Tempel URL tadi ke kolom 'URL Apps Script' di atas, lalu klik Kirim ke Sheets." />
              <div style={{ display: 'flex', gap: 8, padding: '10px 14px', borderRadius: 8, background: '#f59e0b15', border: '1px solid #f59e0b40' }}>
                <span style={{ fontSize: 16 }}>💡</span>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                  Setiap brand sebaiknya punya tab Google Sheet sendiri. Kode ini sudah otomatis buat tab baru berdasarkan nama brand. Jika data sudah ada untuk tanggal yang sama, akan otomatis diupdate (tidak duplikat).
                </div>
              </div>
              <a href="https://docs.google.com/spreadsheets" target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 12, color: '#0f9d58', fontWeight: 600 }}>
                <ExternalLink size={12} /> Buka Google Sheets
              </a>
            </div>
          </div>
        )}
      </div>

      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
