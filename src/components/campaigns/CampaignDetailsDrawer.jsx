import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Calendar, Target, Edit3, Trash2, Megaphone, CheckCircle2 } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'

const CampaignDetailsDrawer = ({ isOpen, onClose, campaign, onEdit }) => {
  const { deleteCampaign } = useAppStore()

  if (!isOpen || !campaign) return null

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this campaign?')) {
      deleteCampaign(campaign.id)
      onClose()
    }
  }

  return (
    <AnimatePresence>
      <motion.div 
        className="drawer-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div 
          className="drawer-content"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          onClick={e => e.stopPropagation()}
        >
          <div className="drawer-header">
            <div className="header-left">
              <div className="icon-circle" style={{ background: `${campaign.color}20`, color: campaign.color }}>
                <Megaphone size={20} />
              </div>
              <div>
                <h2>{campaign.title}</h2>
                <div className="status-badge" style={{ color: campaign.status === 'active' ? '#10B981' : '#6B6B6B' }}>
                  <CheckCircle2 size={12} /> {campaign.status.toUpperCase()}
                </div>
              </div>
            </div>
            <button className="icon-btn-close" onClick={onClose}><X size={20} /></button>
          </div>

          <div className="drawer-body">
            <div className="details-card">
              <div className="detail-row">
                <Target size={18} className="detail-icon" />
                <div>
                  <span className="detail-label">Objective</span>
                  <span className="detail-value">{campaign.objective || 'Not specified'}</span>
                </div>
              </div>
              <div className="detail-row">
                <Calendar size={18} className="detail-icon" />
                <div>
                  <span className="detail-label">Timeline</span>
                  <span className="detail-value">
                    {campaign.startDate ? new Date(campaign.startDate).toLocaleDateString() : 'N/A'} - 
                    {campaign.endDate ? new Date(campaign.endDate).toLocaleDateString() : 'Ongoing'}
                  </span>
                </div>
              </div>
            </div>

            <div className="stats-section">
              <h3>Campaign Performance</h3>
              <div className="stats-grid">
                <div className="stat-box">
                  <span className="stat-label">Total Posts</span>
                  <span className="stat-val">{campaign.postsCount}</span>
                </div>
                <div className="stat-box">
                  <span className="stat-label">Estimated Reach</span>
                  <span className="stat-val">12.4K</span>
                </div>
                <div className="stat-box">
                  <span className="stat-label">Avg. Engagement</span>
                  <span className="stat-val">4.2%</span>
                </div>
              </div>
            </div>
          </div>

          <div className="drawer-footer">
            <button className="btn-danger" onClick={handleDelete}>
              <Trash2 size={16} /> Delete Campaign
            </button>
            <button className="btn-primary" onClick={() => { onClose(); onEdit(campaign); }}>
              <Edit3 size={16} /> Edit Campaign
            </button>
          </div>
        </motion.div>
      </motion.div>

      <style jsx="true">{`
        .drawer-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.3);
          backdrop-filter: blur(2px);
          z-index: 1000;
          display: flex;
          justify-content: flex-end;
        }
        .drawer-content {
          background: white;
          width: 100%;
          max-width: 450px;
          height: 100vh;
          box-shadow: -10px 0 40px rgba(0,0,0,0.1);
          display: flex;
          flex-direction: column;
          font-family: 'Outfit', sans-serif;
        }
        .drawer-header {
          padding: 24px 32px;
          border-bottom: 1px solid rgba(0,0,0,0.05);
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .header-left { display: flex; gap: 16px; align-items: center; }
        .icon-circle { width: 48px; height: 48px; border-radius: 14px; display: flex; align-items: center; justify-content: center; }
        .drawer-header h2 { font-size: 22px; font-weight: 700; color: #1A1A1A; margin: 0 0 4px 0; }
        .status-badge { display: flex; align-items: center; gap: 4px; font-size: 11px; font-weight: 700; }
        .icon-btn-close { background: transparent; border: none; color: #9CA3AF; cursor: pointer; padding: 4px; border-radius: 8px; transition: 0.2s; }
        .icon-btn-close:hover { background: #F3F4F6; color: #1A1A1A; }
        
        .drawer-body {
          flex: 1;
          padding: 32px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }
        
        .details-card {
          background: #F9FAFB;
          border-radius: 16px;
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }
        .detail-row { display: flex; align-items: center; gap: 16px; }
        .detail-icon { color: #9CA3AF; }
        .detail-label { display: block; font-size: 11px; font-weight: 600; color: #6B7280; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 2px; }
        .detail-value { display: block; font-size: 14px; font-weight: 600; color: #1A1A1A; }
        
        .stats-section h3 { font-size: 14px; font-weight: 700; color: #1A1A1A; margin-bottom: 16px; }
        .stats-grid { display: grid; grid-template-columns: 1fr; gap: 12px; }
        .stat-box { background: white; border: 1px solid #E5E7EB; border-radius: 12px; padding: 16px; display: flex; justify-content: space-between; align-items: center; }
        .stat-label { font-size: 13px; font-weight: 600; color: #4B5563; }
        .stat-val { font-size: 18px; font-weight: 700; color: #1A1A1A; }
        
        .drawer-footer {
          padding: 24px 32px;
          border-top: 1px solid rgba(0,0,0,0.05);
          display: flex;
          justify-content: space-between;
          gap: 16px;
        }
        
        .btn-danger {
          flex: 1;
          padding: 12px;
          border-radius: 12px;
          border: 1px solid #FEE2E2;
          background: #FEF2F2;
          color: #DC2626;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          transition: 0.2s;
        }
        .btn-danger:hover { background: #FEE2E2; }
        
        .btn-primary {
          flex: 1;
          padding: 12px;
          border-radius: 12px;
          border: none;
          background: var(--gold-gradient, linear-gradient(135deg, #BE8755 0%, #D4A373 100%));
          color: white;
          font-weight: 600;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          cursor: pointer;
          transition: 0.2s;
          box-shadow: 0 4px 12px rgba(190, 135, 85, 0.2);
        }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(190, 135, 85, 0.3); }

        @media (max-width: 600px) {
          .drawer-content { max-width: 100%; }
          .drawer-header { padding: 20px; }
          .drawer-body { padding: 20px; gap: 24px; }
          .drawer-footer { flex-direction: column-reverse; padding: 20px; }
        }
      `}</style>
    </AnimatePresence>
  )
}

export default CampaignDetailsDrawer
