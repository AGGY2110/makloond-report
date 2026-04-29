// ============================================================
// EXPORT UTILITIES
// 1. Download as CSV
// 2. Send to Google Sheets via Apps Script Web App URL
// ============================================================

// ---- CSV Export ----

function escapeCSV(val) {
  if (val === null || val === undefined) return '';
  const str = String(val);
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function rowToCSV(row) {
  return row.map(escapeCSV).join(',');
}

export function exportReportsToCSV(reports, brandLabel) {
  const rows = [];

  // Header
  rows.push(rowToCSV([
    'Tanggal', 'Brand',
    // KOL
    'KOL_Total_Invited', 'KOL_Affiliat_Dikirim', 'KOL_Manual_Dihubungi',
    'KOL_Total_Biaya_Endorse', 'KOL_Total_Biaya_Produk',
    // Marketplace
    'MP_Spending_Ads', 'MP_GMV_Total', 'MP_GMV_Affiliat', 'MP_GMV_Konten_Pribadi',
    'MP_GMV_Live', 'MP_GMV_Shop_Lain', 'MP_Traffic', 'MP_Konversi',
    'MP_Rata_Belanja', 'MP_ROI', 'MP_Konten_Tayang_GMV',
    // Live
    'Live_GMV', 'Live_Spending_Ads', 'Live_Penonton', 'Live_Konversi',
    'Live_ROI', 'Live_Pct_Konversi',
    // Konten
    'Konten_Jumlah_Post',
    // CS Marketplace
    'CS_MP_Resi_Dicetak', 'CS_MP_Jumlah_Komplain', 'CS_MP_Recall_Customer',
    // CS WA
    'CS_WA_Customer_Meta', 'CS_WA_Closing', 'CS_WA_Customer_Lama',
    'CS_WA_Omset', 'CS_WA_Reseller_Zonanyam', 'CS_WA_Reseller_Basreng',
    // Combined
    'Total_GMV', 'Total_Spending', 'Total_ROI'
  ]));

  reports.forEach(r => {
    const mp = r.marketplace || {};
    const live = r.live || {};
    const kol = r.kol || {};
    const cs_mp = r.cs_marketplace || {};
    const cs_wa = r.cs_wa || {};
    const konten = r.konten || {};

    const mp_roi = mp.spending_ads > 0 ? (mp.gmv_total / mp.spending_ads).toFixed(2) : 0;
    const mp_rata = mp.konversi > 0 ? Math.round(mp.gmv_total / mp.konversi) : 0;
    const live_roi = live.spending_ads > 0 ? (live.gmv / live.spending_ads).toFixed(2) : 0;
    const live_pct = live.penonton > 0 ? ((live.konversi / live.penonton) * 100).toFixed(2) : 0;
    const total_gmv = (mp.gmv_total || 0) + (live.gmv || 0);
    const total_spend = (mp.spending_ads || 0) + (live.spending_ads || 0);
    const total_roi = total_spend > 0 ? (total_gmv / total_spend).toFixed(2) : 0;
    const total_endorse = (kol.affiliates_sent || []).reduce((s, a) => s + (a.biaya_endorse || 0), 0);
    const total_produk_cost = (kol.affiliates_sent || []).reduce((s, a) => s + (a.total_biaya || 0), 0);

    rows.push(rowToCSV([
      r.date, brandLabel,
      kol.total_invited || 0,
      (kol.affiliates_sent || []).length,
      (kol.manual_affiliates || []).length,
      total_endorse, total_produk_cost,
      mp.spending_ads || 0, mp.gmv_total || 0,
      mp.gmv_affiliate || 0, mp.gmv_konten_pribadi || 0,
      mp.gmv_live || 0, mp.gmv_shop_lain || 0,
      mp.traffic || 0, mp.konversi || 0,
      mp_rata, mp_roi, mp.konten_tayang_gmv || 0,
      live.gmv || 0, live.spending_ads || 0, live.penonton || 0, live.konversi || 0,
      live_roi, live_pct,
      (konten.posts || []).length,
      cs_mp.resi_dicetak || 0,
      (cs_mp.komplain || []).length,
      cs_mp.recall_customer || 0,
      cs_wa.customer_masuk_meta || 0,
      (cs_wa.closing || []).length,
      cs_wa.customer_lama || 0,
      cs_wa.omset || 0,
      cs_wa.reseller_join_zonanyam || 0,
      cs_wa.reseller_join_basreng || 0,
      total_gmv, total_spend, total_roi
    ]));
  });

  // KOL detail sheet
  const kolRows = [rowToCSV(['Tanggal', 'Brand', 'Nama', 'Akun', 'Produk', 'HPP', 'Total_Biaya_Produk', 'Biaya_Endorse', 'Follower', 'GMV', 'Avg_Views', 'Target_Upload'])];
  reports.forEach(r => {
    (r.kol?.affiliates_sent || []).forEach(a => {
      kolRows.push(rowToCSV([r.date, brandLabel, a.nama, a.akun, a.produk, a.hpp || 0, a.total_biaya || 0, a.biaya_endorse || 0, a.follower || 0, a.gmv || 0, a.views_avg || 0, a.target_upload || '']));
    });
  });

  // Closing WA detail sheet
  const closingRows = [rowToCSV(['Tanggal', 'Brand', 'Nama', 'No_Tlp', 'Akun', 'Produk', 'Alamat'])];
  reports.forEach(r => {
    (r.cs_wa?.closing || []).forEach(c => {
      closingRows.push(rowToCSV([r.date, brandLabel, c.nama, c.no_tlp, c.akun, c.produk, c.alamat]));
    });
  });

  // Produk terjual detail
  const produkRows = [rowToCSV(['Tanggal', 'Brand', 'Nama_Produk', 'Qty_Pesanan', 'Nilai_Rupiah'])];
  reports.forEach(r => {
    (r.marketplace?.produk_terjual || []).forEach(p => {
      produkRows.push(rowToCSV([r.date, brandLabel, p.nama, p.qty || 0, p.rupiah || 0]));
    });
  });

  return {
    summary: rows.join('\n'),
    kol_detail: kolRows.join('\n'),
    closing_detail: closingRows.join('\n'),
    produk_detail: produkRows.join('\n')
  };
}

export function downloadCSV(content, filename) {
  const BOM = '\uFEFF'; // UTF-8 BOM agar Excel baca benar
  const blob = new Blob([BOM + content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ---- Google Sheets via Apps Script ----
// User perlu buat Apps Script Web App sendiri (gratis)
// Instruksi ada di komponen ExportPanel

export async function sendToGoogleSheets(sheetsUrl, reports, brandLabel) {
  if (!sheetsUrl || !sheetsUrl.startsWith('https://script.google.com')) {
    throw new Error('URL Apps Script tidak valid. Harus dimulai dengan https://script.google.com');
  }

  const payload = reports.map(r => {
    const mp = r.marketplace || {};
    const live = r.live || {};
    const kol = r.kol || {};
    const cs_mp = r.cs_marketplace || {};
    const cs_wa = r.cs_wa || {};
    const total_gmv = (mp.gmv_total || 0) + (live.gmv || 0);
    const total_spend = (mp.spending_ads || 0) + (live.spending_ads || 0);
    return {
      tanggal: r.date,
      brand: brandLabel,
      kol_invited: kol.total_invited || 0,
      kol_sent: (kol.affiliates_sent || []).length,
      mp_spending: mp.spending_ads || 0,
      mp_gmv: mp.gmv_total || 0,
      mp_traffic: mp.traffic || 0,
      mp_konversi: mp.konversi || 0,
      live_gmv: live.gmv || 0,
      live_spending: live.spending_ads || 0,
      live_penonton: live.penonton || 0,
      total_gmv,
      total_spending: total_spend,
      total_roi: total_spend > 0 ? +(total_gmv / total_spend).toFixed(2) : 0,
      cs_closing: (cs_wa.closing || []).length,
      cs_omset: cs_wa.omset || 0,
      resi: cs_mp.resi_dicetak || 0,
      komplain: (cs_mp.komplain || []).length,
    };
  });

  const response = await fetch(sheetsUrl, {
    method: 'POST',
    mode: 'no-cors', // Apps Script tidak support CORS sempurna
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({ brand: brandLabel, rows: payload })
  });

  // no-cors = response opaque, kita assume sukses jika tidak error
  return true;
}
