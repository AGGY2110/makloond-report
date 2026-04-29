import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

const BRANDS = ['zonanyam', 'sentral_basreng', 'ngaciin', 'paberik101'];
const BRAND_LABELS = {
  zonanyam: 'Zona Nyam',
  sentral_basreng: 'Sentral Basreng',
  ngaciin: 'Ngaciin',
  paberik101: 'Paberik 101'
};
const BRAND_COLORS = {
  zonanyam: '#f97316',
  sentral_basreng: '#8b5cf6',
  ngaciin: '#06b6d4',
  paberik101: '#10b981'
};

const INITIAL_REPORT = {
  date: new Date().toISOString().split('T')[0],
  brand: 'zonanyam',
  kol: {
    total_invited: 0,
    affiliates_sent: [],
    manual_affiliates: []
  },
  marketplace: {
    spending_ads: 0,
    gmv_total: 0,
    gmv_affiliate: 0,
    gmv_konten_pribadi: 0,
    gmv_live: 0,
    gmv_shop_lain: 0,
    traffic: 0,
    konversi: 0,
    konten_tayang_gmv: 0,
    produk_terjual: []
  },
  live: {
    gmv: 0,
    spending_ads: 0,
    penonton: 0,
    konversi: 0
  },
  konten: {
    posts: []
  },
  cs_marketplace: {
    resi_dicetak: 0,
    komplain: [],
    recall_customer: 0
  },
  cs_wa: {
    customer_masuk_meta: 0,
    closing: [],
    customer_lama: 0,
    omset: 0,
    reseller_join_zonanyam: 0,
    reseller_join_basreng: 0
  }
};

function loadData() {
  try {
    const raw = localStorage.getItem('marketing_reports');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveData(reports) {
  localStorage.setItem('marketing_reports', JSON.stringify(reports));
}

export function AppProvider({ children }) {
  const [reports, setReports] = useState(loadData);
  const [selectedBrand, setSelectedBrand] = useState('zonanyam');
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [editingReport, setEditingReport] = useState(null);
  const [dateRange, setDateRange] = useState({ from: '', to: '' });

  useEffect(() => { saveData(reports); }, [reports]);

  const addReport = (report) => {
    setReports(prev => {
      const exists = prev.findIndex(r => r.date === report.date && r.brand === report.brand);
      if (exists >= 0) {
        const updated = [...prev];
        updated[exists] = report;
        return updated;
      }
      return [...prev, report];
    });
  };

  const deleteReport = (date, brand) => {
    setReports(prev => prev.filter(r => !(r.date === date && r.brand === brand)));
  };

  const getReportsByBrand = (brand) => reports.filter(r => r.brand === brand).sort((a, b) => new Date(a.date) - new Date(b.date));

  const getFilteredReports = (brand) => {
    let data = getReportsByBrand(brand);
    if (dateRange.from) data = data.filter(r => r.date >= dateRange.from);
    if (dateRange.to) data = data.filter(r => r.date <= dateRange.to);
    return data;
  };

  return (
    <AppContext.Provider value={{
      reports, addReport, deleteReport, selectedBrand, setSelectedBrand,
      currentPage, setCurrentPage, editingReport, setEditingReport,
      dateRange, setDateRange, getReportsByBrand, getFilteredReports,
      BRANDS, BRAND_LABELS, BRAND_COLORS, INITIAL_REPORT
    }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
