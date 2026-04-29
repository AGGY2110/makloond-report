import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Dashboard from './pages/Dashboard';
import InputForm from './pages/InputForm';
import Analysis from './pages/Analysis';
import { LayoutDashboard, PlusCircle, BarChart3, Moon, Sun, Menu, X } from 'lucide-react';

const PLATFORM = {
  zonanyam: ['TikTok', 'Shopee'],
  sentral_basreng: ['TikTok', 'Shopee'],
  ngaciin: ['TikTok', 'Shopee'],
  paberik101: ['Meta']
};

function Nav() {
  const { selectedBrand, setSelectedBrand, currentPage, setCurrentPage, BRANDS, BRAND_LABELS, BRAND_COLORS, setEditingReport } = useApp();
  const [menuOpen, setMenuOpen] = useState(false);
  const [dark, setDark] = useState(false);

  const toggleDark = () => {
    setDark(d => !d);
    document.documentElement.setAttribute('data-theme', dark ? 'light' : 'dark');
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'input', label: 'Input Laporan', icon: PlusCircle },
    { id: 'analysis', label: 'Analisis', icon: BarChart3 }
  ];

  const brandColor = BRAND_COLORS[selectedBrand];

  return (
    <nav style={{ background: 'var(--bg-nav)', borderBottom: '1px solid var(--border)', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 16px', display: 'flex', alignItems: 'center', gap: 8, height: 56 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginRight: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: brandColor, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>📊</div>
          <span style={{ fontWeight: 800, fontSize: 14, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>MakloondReport</span>
        </div>

        {/* Brand selector */}
        <div style={{ display: 'flex', gap: 4, overflowX: 'auto', scrollbarWidth: 'none' }}>
          {BRANDS.map(b => (
            <button key={b} onClick={() => { setSelectedBrand(b); setCurrentPage('dashboard'); }}
              style={{
                padding: '5px 12px', borderRadius: 20, border: '1px solid', whiteSpace: 'nowrap',
                borderColor: selectedBrand === b ? BRAND_COLORS[b] : 'var(--border)',
                background: selectedBrand === b ? BRAND_COLORS[b] + '20' : 'transparent',
                color: selectedBrand === b ? BRAND_COLORS[b] : 'var(--text-muted)',
                fontWeight: selectedBrand === b ? 700 : 500, fontSize: 12, cursor: 'pointer',
                transition: 'all 0.15s'
              }}>
              {BRAND_LABELS[b]}
            </button>
          ))}
        </div>

        <div style={{ flex: 1 }} />

        {/* Nav items - desktop */}
        <div style={{ display: 'flex', gap: 2 }}>
          {navItems.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => { setCurrentPage(id); if (id === 'input') setEditingReport(null); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', borderRadius: 8, border: 'none',
                background: currentPage === id ? brandColor + '20' : 'transparent',
                color: currentPage === id ? brandColor : 'var(--text-muted)',
                fontWeight: currentPage === id ? 700 : 500, fontSize: 13, cursor: 'pointer', transition: 'all 0.15s'
              }}>
              <Icon size={15} />
              <span style={{ display: window.innerWidth < 640 ? 'none' : 'inline' }}>{label}</span>
            </button>
          ))}
        </div>

        <button onClick={toggleDark} style={{ width: 32, height: 32, borderRadius: 8, border: '1px solid var(--border)', background: 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: 'var(--text-muted)' }}>
          {dark ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>

      {/* Platform badge */}
      <div style={{ background: brandColor + '12', borderTop: '1px solid ' + brandColor + '30', padding: '3px 16px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', width: '100%', display: 'flex', gap: 6, alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Platform:</span>
          {PLATFORM[selectedBrand].map(p => (
            <span key={p} style={{ fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 4, background: brandColor + '30', color: brandColor }}>
              {p}
            </span>
          ))}
          <span style={{ marginLeft: 'auto', fontSize: 10, color: 'var(--text-muted)' }}>Makloond Group — Tim Marketing</span>
        </div>
      </div>
    </nav>
  );
}

function AppContent() {
  const { currentPage } = useApp();
  return (
    <>
      <Nav />
      <main style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px 60px' }}>
        {currentPage === 'dashboard' && <Dashboard />}
        {currentPage === 'input' && <InputForm />}
        {currentPage === 'analysis' && <Analysis />}
      </main>
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
