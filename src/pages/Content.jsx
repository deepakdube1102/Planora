import React from 'react'
import { 
  Search, 
  Plus, 
  Image as ImageIcon, 
  Video, 
  FileText, 
  MoreVertical,
  Grid,
  List,
  FolderPlus,
  ArrowUpRight
} from 'lucide-react'

const ContentLibrary = () => {
  const assets = [
    { id: 1, name: 'Brand_Lifestyle_01.jpg', type: 'image', size: '2.4 MB', date: '2 days ago', thumb: 'https://images.unsplash.com/photo-1493723843671-1d655e7d98f0?auto=format&fit=crop&q=80&w=200' },
    { id: 2, name: 'Summer_Campaign_Video.mp4', type: 'video', size: '18.1 MB', date: '5 days ago', thumb: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&q=80&w=200' },
    { id: 3, name: 'Product_Demo_Draft.docx', type: 'doc', size: '45 KB', date: '1 week ago', thumb: null },
    { id: 4, name: 'Logo_Pack_Vector.zip', type: 'archive', size: '5.2 MB', date: '2 weeks ago', thumb: null },
    { id: 5, name: 'Editorial_Calendar_Q3.pdf', type: 'pdf', size: '1.1 MB', date: '1 month ago', thumb: null },
    { id: 6, name: 'Studio_Shoot_RAW_04.jpg', type: 'image', size: '8.4 MB', date: '1 month ago', thumb: 'https://images.unsplash.com/photo-1542038784456-1ea8e935640e?auto=format&fit=crop&q=80&w=200' },
  ]

  return (
    <div className="library-wrapper">
      {/* Glassmorphic Coming Soon Overlay */}
      <div className="coming-soon-overlay">
        <div className="coming-soon-content">
          <div className="coming-soon-badge">FEATURE RESERVED</div>
          <h2>Content Vault</h2>
          <p>Your central digital vault for creative assets, templates, and high-conversion copy is currently cooking. Launching very soon!</p>
          <button className="btn-gold-action" style={{ marginTop: '16px', pointerEvents: 'none' }}>Coming Soon</button>
        </div>
      </div>

      <header className="library-header">
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>Content Library</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>Your central vault for all creative assets and campaign drafts.</p>
        </div>
        <div className="header-actions">
          <button className="btn-outline-action">
            <FolderPlus size={16} /> New Folder
          </button>
          <button className="btn-gold-action">
            <Plus size={16} /> Upload Asset
          </button>
        </div>
      </header>

      {/* Filter Bar */}
      <div className="filter-bar-container">
        <div className="filters-scroll">
          <div className="content-tabs-group">
            {['All Assets', 'Images', 'Videos', 'Documents'].map((filter, i) => (
              <button key={i} className={`content-tab-pill ${i === 0 ? 'active' : ''}`}>
                {filter}
              </button>
            ))}
          </div>
        </div>
        <div className="search-view-container">
          <div className="content-search-box">
            <Search size={16} color="#9CA3AF" />
            <input type="text" placeholder="Search assets..." />
          </div>
          <div className="view-toggle-group">
            <button className="view-btn active"><Grid size={16} /></button>
            <button className="view-btn"><List size={16} /></button>
          </div>
        </div>
      </div>

      {/* Asset Grid */}
      <div className="asset-grid">
        {assets.map((asset) => (
          <div key={asset.id} className="product-card asset-card" style={{ padding: '12px' }}>
            <div style={{ 
              width: '100%', height: '160px', borderRadius: '12px', background: '#F9F8F6',
              marginBottom: '16px', overflow: 'hidden', position: 'relative',
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              {asset.thumb ? (
                <img src={asset.thumb} alt={asset.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <FileText size={40} color="var(--text-dim)" strokeWidth={1} />
              )}
              <div className="asset-overlay">
                <button className="asset-action-btn"><ArrowUpRight size={14} /></button>
              </div>
            </div>
            <div style={{ padding: '0 4px 8px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}>
                  {asset.name}
                </h4>
                <MoreVertical size={14} color="var(--text-dim)" style={{ cursor: 'pointer' }} />
              </div>
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center', fontSize: '11px', color: 'var(--text-dim)' }}>
                <span style={{ textTransform: 'uppercase', fontWeight: 700 }}>{asset.type}</span>
                <span>•</span>
                <span>{asset.size}</span>
                <span>•</span>
                <span>{asset.date}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <style jsx="true">{`
        .library-wrapper {
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          height: calc(100vh - 120px);
          overflow: hidden;
        }

        .library-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 40px;
        }

        .coming-soon-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(249, 246, 241, 0.45);
          backdrop-filter: blur(14px);
          -webkit-backdrop-filter: blur(14px);
          z-index: 999;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .coming-soon-content {
          text-align: center;
          max-width: 440px;
          padding: 40px;
          background: rgba(255, 255, 255, 0.85);
          border: 1px solid rgba(190, 135, 85, 0.15);
          border-radius: 24px;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05);
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
          animation: overlayFadeIn 0.5s ease-out;
        }

        .coming-soon-badge {
          background: rgba(190, 135, 85, 0.1);
          color: #BE8755;
          padding: 6px 14px;
          border-radius: 999px;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .coming-soon-content h2 {
          font-size: 26px;
          font-weight: 700;
          color: #1A1A1A;
          margin: 4px 0 0;
          font-family: 'Outfit', sans-serif;
        }

        .coming-soon-content p {
          font-size: 14px;
          color: #64748B;
          line-height: 1.5;
          margin: 0;
        }

        @keyframes overlayFadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .btn-outline-action {
          background: white; border: 1px solid rgba(0,0,0,0.06); padding: 10px 16px; border-radius: 12px;
          font-size: 13px; font-weight: 700; color: #1A1A1A; display: flex; align-items: center; gap: 8px;
          cursor: pointer; transition: 0.2s; box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }
        .btn-outline-action:hover { background: #FDFCFB; border-color: rgba(0,0,0,0.1); transform: translateY(-1px); }

        .btn-gold-action {
          background: var(--gold-gradient, linear-gradient(135deg, #DFB574, #BE8755)); color: white; border: none; padding: 10px 16px;
          border-radius: 12px; font-size: 13px; font-weight: 700; display: flex; align-items: center; gap: 8px;
          cursor: pointer; box-shadow: 0 4px 12px rgba(190, 135, 85, 0.2); transition: 0.2s;
        }
        .btn-gold-action:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(190, 135, 85, 0.3); }

        .filter-bar-container {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          gap: 20px;
        }

        .search-view-container {
          display: flex;
          gap: 16px;
          align-items: center;
        }

        .content-tabs-group {
          background: #F9F8F6; padding: 4px; border-radius: 14px; display: flex; gap: 4px;
          flex-shrink: 0;
          white-space: nowrap;
        }
        .content-tab-pill {
          border: none; padding: 8px 16px; border-radius: 10px; font-size: 13px; font-weight: 600;
          color: #6B6B6B; background: transparent; cursor: pointer; transition: 0.2s;
        }
        .content-tab-pill.active {
          background: white; color: #1A1A1A; box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }

        .content-search-box {
          display: flex; align-items: center; background: white; border: 1px solid rgba(0,0,0,0.06);
          border-radius: 12px; padding: 10px 16px; gap: 10px; width: 260px; transition: 0.2s;
          box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }
        .content-search-box:focus-within { border-color: #BE8755; box-shadow: 0 0 0 3px rgba(190, 135, 85, 0.1); }
        .content-search-box input { border: none; background: transparent; outline: none; font-size: 13px; color: #1A1A1A; width: 100%; }
        .content-search-box input::placeholder { color: #9CA3AF; }

        .view-toggle-group {
          display: flex; background: #F9F8F6; padding: 4px; border-radius: 12px;
        }
        .view-btn {
          border: none; background: transparent; padding: 8px; border-radius: 8px;
          color: #9CA3AF; cursor: pointer; transition: 0.2s; display: flex; align-items: center; justify-content: center;
        }
        .view-btn.active {
          background: white; color: #1A1A1A; box-shadow: 0 2px 4px rgba(0,0,0,0.04);
        }

        .asset-grid {
          display: grid; 
          grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); 
          gap: 24px;
        }

        @media (max-width: 1024px) {
          .asset-grid { grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); }
        }

        @media (max-width: 768px) {
          .library-wrapper { 
            padding: 80px 20px 40px; 
            height: calc(100vh - 120px);
            overflow: hidden;
            box-sizing: border-box;
          }
          .library-header { flex-direction: column; align-items: flex-start !important; gap: 24px; }
          .header-actions { width: 100%; display: flex; gap: 12px; }
          .header-actions button { flex: 1; justify-content: center; }
          
          .filter-bar-container { 
            flex-direction: column; 
            align-items: stretch !important; 
            gap: 16px;
            margin-bottom: 24px;
          }
          .filters-scroll { 
            width: 100%; 
            overflow-x: auto; 
            scrollbar-width: none; 
            display: flex; 
            gap: 8px; 
            padding-bottom: 4px;
          }
          .filters-scroll::-webkit-scrollbar { display: none; }
          
          .search-view-container { 
            width: 100%; 
            justify-content: space-between; 
            gap: 12px;
          }
          .content-search-box {
            flex: 1;
            width: auto;
          }
          
          .asset-grid { grid-template-columns: repeat(2, 1fr); gap: 16px; }
          .coming-soon-content {
            padding: 24px;
            margin: 20px;
          }
        }

        @media (max-width: 375px) {
          .asset-grid { grid-template-columns: 1fr; }
          h1 { font-size: 26px !important; }
        }

        .active-pill {
          background: #FFFFFF !important;
          color: var(--accent-gold) !important;
          border-color: var(--accent-gold) !important;
          box-shadow: 0 4px 12px rgba(0,0,0,0.05);
        }
        .asset-card {
          cursor: pointer;
        }
        .asset-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0.1);
          opacity: 0;
          transition: opacity 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .asset-card:hover .asset-overlay {
          opacity: 1;
        }
        .asset-action-btn {
          width: 36px; height: 36px; border-radius: 50%; border: none;
          background: white; color: var(--text-main); cursor: pointer;
          display: flex; alignItems: center; justifyContent: center;
          box-shadow: 0 4px 12px rgba(0,0,0,0.2);
          transform: translateY(10px);
          transition: transform 0.3s ease;
        }
        .asset-card:hover .asset-action-btn {
          transform: translateY(0);
        }
      `}</style>
    </div>
  )
}

export default ContentLibrary
