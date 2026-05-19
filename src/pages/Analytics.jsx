import React from 'react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { 
  TrendingUp, 
  Users, 
  MousePointer2, 
  Share2, 
  Filter,
  Download,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react'

const Analytics = () => {
  const engagementData = [
    { name: 'Image', value: 4500, color: 'var(--accent-gold)' },
    { name: 'Video', value: 7200, color: '#1A1A1A' },
    { name: 'Carousel', value: 3800, color: '#D4AF37' },
    { name: 'Story', value: 2100, color: '#E2E2E2' },
  ]

  const growthData = [
    { date: '01 May', followers: 12000 },
    { date: '05 May', followers: 12400 },
    { date: '10 May', followers: 13100 },
    { date: '15 May', followers: 13800 },
    { date: '20 May', followers: 14200 },
    { date: '25 May', followers: 15600 },
    { date: '30 May', followers: 16800 },
  ]

  const COLORS = ['#BE8755', '#1A1A1A', '#D4AF37', '#E2E2E2']

  return (
    <div className="analytics-wrapper">
      {/* Glassmorphic Coming Soon Overlay */}
      <div className="coming-soon-overlay">
        <div className="coming-soon-content">
          <div className="coming-soon-badge">FEATURE RESERVED</div>
          <h2>Performance Analytics</h2>
          <p>We are currently training our predictive modeling engines. Premium, granular insights will launch in the next release cycle.</p>
          <button className="btn-gold" style={{ marginTop: '16px', pointerEvents: 'none' }}>Coming Soon</button>
        </div>
      </div>

      <header className="analytics-header">
        <div>
          <h1 style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>Performance Analytics</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>Granular insights into your digital footprint and audience behavior.</p>
        </div>
        <div className="analytics-header-actions">
          <button className="btn-minimal">
            <Filter size={16} /> Filter
          </button>
          <button className="btn-gold">
            <Download size={16} /> Export Data
          </button>
        </div>
      </header>

      {/* Primary Metrics */}
      <div className="metrics-grid">
        {[
          { label: 'Total Engagement', value: '42.8k', trend: '+14.2%', up: true, icon: MousePointer2 },
          { label: 'Net Growth', value: '4,812', trend: '+22.5%', up: true, icon: Users },
          { label: 'Avg. Share Rate', value: '3.1%', trend: '-2.4%', up: false, icon: Share2 },
        ].map((m, i) => (
          <div key={i} className="product-card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#F9F8F6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--accent-gold)' }}>
                <m.icon size={20} />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', fontWeight: 600, color: m.up ? '#10B981' : '#EF4444' }}>
                {m.up ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                {m.trend}
              </div>
            </div>
            <span style={{ fontSize: '14px', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>{m.label}</span>
            <span style={{ fontSize: '28px', fontWeight: 700, fontFamily: "'Outfit', sans-serif" }}>{m.value}</span>
          </div>
        ))}
      </div>

      {/* Main Charts */}
      <div className="charts-grid">
        
        {/* Growth Trend */}
        <div className="product-card">
          <h3 style={{ fontSize: '18px', marginBottom: '24px' }}>Audience Growth</h3>
          <div style={{ height: '350px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0F0F0" />
                <XAxis 
                   dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{ fontSize: 11, fill: '#999' }}
                  dy={10}
                />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#999' }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: 'var(--shadow-hover)' }}
                />
                <Bar dataKey="followers" fill="var(--accent-gold)" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Content Type Split */}
        <div className="product-card">
          <h3 style={{ fontSize: '18px', marginBottom: '24px' }}>Content Performance</h3>
          <div style={{ height: '280px', position: 'relative' }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={engagementData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {engagementData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center' }}>
              <span style={{ fontSize: '24px', fontWeight: 700, display: 'block' }}>82%</span>
              <span style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Efficiency</span>
            </div>
          </div>
          <div style={{ marginTop: '24px' }}>
            {engagementData.map((d, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '2px', background: d.color }}></div>
                  <span style={{ fontSize: '13px', fontWeight: 500 }}>{d.name}</span>
                </div>
                <span style={{ fontSize: '13px', fontWeight: 600 }}>{Math.round((d.value / 17600) * 100)}%</span>
              </div>
            ))}
          </div>
        </div>

      </div>

      <style jsx="true">{`
        .analytics-wrapper {
          max-width: 1200px;
          margin: 0 auto;
          position: relative;
          height: calc(100vh - 120px);
          overflow: hidden;
        }

        .analytics-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 40px;
        }

        .analytics-header-actions {
          display: flex;
          gap: 12px;
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

        .metrics-grid {
          display: grid; 
          grid-template-columns: repeat(3, 1fr); 
          gap: 24px; 
          margin-bottom: 32px;
        }

        .charts-grid {
          display: grid; 
          grid-template-columns: 1.8fr 1.2fr; 
          gap: 24px;
        }

        @media (max-width: 1024px) {
          .charts-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 768px) {
          .analytics-wrapper { 
            padding: 80px 20px 40px; 
            height: calc(100vh - 120px);
            overflow: hidden;
            box-sizing: border-box;
          }
          .analytics-header { flex-direction: column; align-items: flex-start !important; gap: 24px; }
          .analytics-header-actions { width: 100%; display: flex; gap: 12px; }
          .analytics-header-actions button { flex: 1; justify-content: center; }
          .metrics-grid { grid-template-columns: 1fr; }
          .coming-soon-content {
            padding: 24px;
            margin: 20px;
          }
        }

        @media (max-width: 375px) {
          h1 { font-size: 24px !important; }
          .product-card span { font-size: 22px !important; }
        }
      `}</style>
    </div>
  )
}

export default Analytics
