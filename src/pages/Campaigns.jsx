import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Megaphone, 
  Plus, 
  MoreVertical, 
  Calendar, 
  TrendingUp, 
  ArrowUpRight,
  Target,
  Zap,
  Users,
  Eye,
  CheckCircle2,
  Clock
} from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import CampaignModal from '../components/campaigns/CampaignModal'
import CampaignDetailsDrawer from '../components/campaigns/CampaignDetailsDrawer'

const Campaigns = () => {
  const { campaigns } = useAppStore()
  const [activeTab, setActiveTab] = useState('active')
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const [selectedCampaign, setSelectedCampaign] = useState(null)

  const filteredCampaigns = campaigns.filter(c => {
    return c.status === activeTab
  })

  const openNewCampaign = () => {
    setSelectedCampaign(null)
    setIsModalOpen(true)
  }

  const openEditCampaign = (campaign) => {
    setSelectedCampaign(campaign)
    setIsModalOpen(true)
  }

  const openCampaignDetails = (campaign) => {
    setSelectedCampaign(campaign)
    setIsDrawerOpen(true)
  }

  return (
    <div className="campaigns-page">
      <header className="page-header-premium">
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="header-badge"><Megaphone size={14} /> GROWTH MODULE</div>
          <h1>Marketing Campaigns</h1>
          <p>Group your content, track objectives, and scale your brand voice.</p>
        </motion.div>
        <button className="btn-gold-lg" onClick={openNewCampaign}>
          <Plus size={18} />
          <span>New Campaign</span>
        </button>
      </header>

      <div className="campaign-tabs-pill">
        {['active', 'completed', 'archived'].map(tab => (
          <button 
            key={tab}
            className={`campaign-tab-item ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="campaigns-grid">
        <AnimatePresence mode="popLayout">
          {filteredCampaigns.map((campaign, idx) => (
            <motion.div 
              key={campaign.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ delay: idx * 0.05 }}
              className="campaign-card-premium"
            >
              <div className="c-card-head">
                <div className="c-tag" style={{ background: `${campaign.color}15`, color: campaign.color }}>
                  <Target size={12} />
                  <span>Objective: {campaign.objective || 'Not specified'}</span>
                </div>
                <button className="icon-btn-min" onClick={() => openEditCampaign(campaign)}>
                  <MoreVertical size={16} />
                </button>
              </div>

              <div className="c-card-body">
                <div className="c-title-grp">
                   <div className="c-icon-box" style={{ background: campaign.color }}>
                     <Megaphone size={20} color="white" />
                   </div>
                   <div>
                     <h3>{campaign.title}</h3>
                     <p>Q2 Marketing Push • Ends June 30</p>
                   </div>
                </div>

                <div className="c-progress-section">
                  <div className="progress-label">
                    <span>Campaign Progress</span>
                    <span>65%</span>
                  </div>
                  <div className="progress-bar-bg">
                    <div className="progress-bar-fill" style={{ width: '65%', background: campaign.color }} />
                  </div>
                </div>

                <div className="c-stats-grid">
                  <div className="cs-item">
                    <span className="cs-label">Posts</span>
                    <span className="cs-val">{campaign.postsCount}</span>
                  </div>
                  <div className="cs-item">
                    <span className="cs-label">Reach</span>
                    <span className="cs-val">12.4K</span>
                  </div>
                  <div className="cs-item">
                    <span className="cs-label">Eng.</span>
                    <span className="cs-val">4.2%</span>
                  </div>
                </div>
              </div>

              <div className="c-card-footer">
                <div className="platform-avatars">
                  {['IG', 'TK', 'LI'].map((p, i) => (
                    <div key={i} className="p-mini-circle">{p}</div>
                  ))}
                </div>
                <button className="btn-view-details" onClick={() => openCampaignDetails(campaign)}>
                  View Details <ArrowUpRight size={14} />
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <motion.div 
          className="campaign-card-add"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={openNewCampaign}
        >
          <div className="add-content">
            <div className="add-icon-circle"><Plus size={24} /></div>
            <h3>Create New Campaign</h3>
            <p>Start grouping your content for better tracking.</p>
          </div>
        </motion.div>
      </div>

      <CampaignModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        campaign={selectedCampaign} 
      />

      <CampaignDetailsDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        campaign={selectedCampaign}
        onEdit={(camp) => {
          setSelectedCampaign(camp)
          setIsModalOpen(true)
        }}
      />

      <style jsx="true">{`
        .campaigns-page {
          padding: 32px 64px;
          max-width: 1440px;
          margin: 0 auto;
        }

        .page-header-premium {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 40px;
        }

        .header-badge {
          background: var(--accent-gold-glow);
          color: var(--accent-gold);
          font-size: 10px;
          font-weight: 800;
          padding: 4px 10px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 12px;
          width: fit-content;
        }

        .page-header-premium h1 { font-size: 32px; font-weight: 700; margin-bottom: 8px; color: #1A1A1A; }
        .page-header-premium p { color: #6B6B6B; font-size: 16px; }

        .btn-gold-lg {
          background: var(--gold-gradient);
          color: white;
          border: none;
          padding: 14px 28px;
          border-radius: 16px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          box-shadow: 0 10px 20px rgba(190, 135, 85, 0.15);
          transition: all 0.3s;
        }
        .btn-gold-lg:hover { transform: translateY(-2px); box-shadow: 0 15px 30px rgba(190, 135, 85, 0.25); }

        .campaign-tabs-pill {
          display: flex;
          background: #F9F8F6;
          padding: 4px;
          border-radius: 14px;
          width: fit-content;
          gap: 4px;
          margin-bottom: 32px;
        }

        .campaign-tab-item {
          padding: 10px 24px;
          border-radius: 10px;
          border: none;
          background: transparent;
          font-size: 14px;
          font-weight: 600;
          color: #6B6B6B;
          cursor: pointer;
          transition: 0.2s;
        }

        .campaign-tab-item.active {
          background: white;
          color: #1A1A1A;
          box-shadow: 0 4px 12px rgba(0,0,0,0.04);
        }

        .campaigns-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 24px;
        }

        @media (max-width: 1024px) {
          .campaigns-grid { grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); }
        }

        @media (max-width: 768px) {
          .campaigns-page { padding: 24px 16px 40px; }
          .page-header-premium { flex-direction: column; align-items: flex-start; gap: 20px; margin-bottom: 24px; }
          .btn-gold-lg { width: 100%; justify-content: center; padding: 14px; font-size: 15px; }
          .campaigns-grid { grid-template-columns: 1fr; gap: 16px; }
          .campaign-tabs-pill { width: 100%; display: flex; justify-content: space-between; padding: 4px; border-radius: 12px; background: #F9F8F6; margin-bottom: 24px; }
          .campaign-tab-item { flex: 1; text-align: center; padding: 10px 0; font-size: 13px; }
          .campaign-card-premium { padding: 20px; border-radius: 24px; }
        }

        @media (max-width: 375px) {
          .page-header-premium h1 { font-size: 26px; }
          .campaign-card-premium { padding: 20px; }
          .c-title-grp h3 { font-size: 16px; }
        }

        .campaign-card-premium {
          background: white;
          border: 1px solid rgba(0,0,0,0.06);
          border-radius: 28px;
          padding: 24px;
          transition: all 0.3s;
        }
        .campaign-card-premium:hover { transform: translateY(-4px); box-shadow: 0 20px 40px rgba(0,0,0,0.04); }

        .c-card-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .c-tag { display: flex; align-items: center; gap: 6px; padding: 4px 10px; border-radius: 8px; font-size: 10px; font-weight: 700; }
        .icon-btn-min { background: transparent; border: none; color: #9CA3AF; cursor: pointer; }

        .c-title-grp { display: flex; align-items: center; gap: 16px; margin-bottom: 24px; }
        .c-icon-box { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; box-shadow: 0 8px 16px rgba(0,0,0,0.1); }
        .c-title-grp h3 { font-size: 18px; font-weight: 700; color: #1A1A1A; margin-bottom: 4px; }
        .c-title-grp p { font-size: 12px; color: #9CA3AF; font-weight: 500; }

        .c-progress-section { margin-bottom: 24px; }
        .progress-label { display: flex; justify-content: space-between; font-size: 11px; font-weight: 700; color: #1A1A1A; margin-bottom: 8px; }
        .progress-bar-bg { height: 6px; background: #F3F4F6; border-radius: 4px; overflow: hidden; }
        .progress-bar-fill { height: 100%; border-radius: 4px; transition: width 1s ease-out; }

        .c-stats-grid { display: grid; grid-template-columns: repeat(3, 1fr); padding: 0; background: transparent; margin-bottom: 24px; }
        .cs-item { text-align: center; border-right: 1px solid rgba(0,0,0,0.06); }
        .cs-item:last-child { border-right: none; }
        .cs-label { font-size: 9px; font-weight: 700; color: #6B6B6B; text-transform: uppercase; display: block; margin-bottom: 6px; letter-spacing: 0.05em; }
        .cs-val { font-size: 16px; font-weight: 800; color: #1A1A1A; }

        .c-card-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(0,0,0,0.04); padding-top: 20px; }
        .platform-avatars { display: flex; }
        .p-mini-circle { width: 24px; height: 24px; border-radius: 50%; background: #F3F4F6; border: 2px solid white; display: flex; align-items: center; justify-content: center; font-size: 8px; font-weight: 800; color: #6B6B6B; margin-left: -8px; }
        .p-mini-circle:first-child { margin-left: 0; }

        .btn-view-details { background: transparent; border: none; color: var(--accent-gold); font-size: 13px; font-weight: 700; display: flex; align-items: center; gap: 6px; cursor: pointer; }

        .campaign-card-add { border: 2px dashed rgba(0,0,0,0.06); border-radius: 28px; display: flex; align-items: center; justify-content: center; cursor: pointer; min-height: 300px; }
        .add-content { text-align: center; padding: 40px; }
        .add-icon-circle { width: 56px; height: 56px; background: #F9F8F6; color: #BE8755; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; }
        .add-content h3 { font-size: 18px; font-weight: 700; color: #1A1A1A; margin-bottom: 8px; }
        .add-content p { font-size: 13px; color: #6B6B6B; }
      `}</style>
    </div>
  )
}

export default Campaigns
