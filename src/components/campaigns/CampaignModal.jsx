import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Target, Calendar, Droplet, Check } from 'lucide-react'
import { useAppStore } from '../../store/useAppStore'

const CAMPAIGN_COLORS = ['#BE8755', '#10B981', '#8B5CF6', '#3B82F6', '#EC4899', '#F59E0B']
const OBJECTIVES = ['Brand Awareness', 'Sales & Conversion', 'Lead Generation', 'Education', 'Community Growth']

const CampaignModal = ({ isOpen, onClose, campaign = null }) => {
  const { addCampaign, updateCampaign } = useAppStore()
  
  const [formData, setFormData] = useState({
    title: '',
    objective: OBJECTIVES[0],
    startDate: '',
    endDate: '',
    color: CAMPAIGN_COLORS[0],
    status: 'active'
  })

  useEffect(() => {
    if (campaign) {
      setFormData({
        title: campaign.title || '',
        objective: campaign.objective || OBJECTIVES[0],
        startDate: campaign.startDate || '',
        endDate: campaign.endDate || '',
        color: campaign.color || CAMPAIGN_COLORS[0],
        status: campaign.status || 'active'
      })
    } else {
      setFormData({
        title: '',
        objective: OBJECTIVES[0],
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        color: CAMPAIGN_COLORS[0],
        status: 'active'
      })
    }
  }, [campaign, isOpen])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.title) return

    if (campaign) {
      updateCampaign(campaign.id, formData)
    } else {
      addCampaign(formData)
    }
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div 
        className="modal-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div 
          className="modal-content"
          initial={{ y: 50, opacity: 0, scale: 0.95 }}
          animate={{ y: 0, opacity: 1, scale: 1 }}
          exit={{ y: 50, opacity: 0, scale: 0.95 }}
          onClick={e => e.stopPropagation()}
        >
          <div className="modal-header">
            <h2>{campaign ? 'Edit Campaign' : 'Create New Campaign'}</h2>
            <button className="icon-btn" onClick={onClose}><X size={20} /></button>
          </div>

          <form onSubmit={handleSubmit} className="modal-body">
            <div className="form-group">
              <label>Campaign Title</label>
              <input 
                type="text" 
                placeholder="e.g. Summer Launch 2024"
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                autoFocus
                required
              />
            </div>

            <div className="form-group">
              <label>Objective</label>
              <div className="input-with-icon">
                <Target size={16} className="input-icon" />
                <select 
                  value={formData.objective}
                  onChange={e => setFormData({...formData, objective: e.target.value})}
                >
                  {OBJECTIVES.map(obj => <option key={obj} value={obj}>{obj}</option>)}
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Start Date</label>
                <div className="input-with-icon">
                  <Calendar size={16} className="input-icon" />
                  <input 
                    type="date" 
                    value={formData.startDate}
                    onChange={e => setFormData({...formData, startDate: e.target.value})}
                    required
                  />
                </div>
              </div>
              <div className="form-group">
                <label>End Date</label>
                <div className="input-with-icon">
                  <Calendar size={16} className="input-icon" />
                  <input 
                    type="date" 
                    value={formData.endDate}
                    onChange={e => setFormData({...formData, endDate: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Theme Color</label>
              <div className="color-picker-row">
                {CAMPAIGN_COLORS.map(color => (
                  <button
                    key={color}
                    type="button"
                    className={`color-swatch ${formData.color === color ? 'selected' : ''}`}
                    style={{ background: color }}
                    onClick={() => setFormData({...formData, color})}
                  >
                    {formData.color === color && <Check size={14} color="white" />}
                  </button>
                ))}
              </div>
            </div>

            {campaign && (
              <div className="form-group">
                <label>Status</label>
                <select 
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value})}
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="archived">Archived</option>
                </select>
              </div>
            )}

            <div className="modal-footer">
              <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn-primary">
                {campaign ? 'Save Changes' : 'Create Campaign'}
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>

      <style jsx="true">{`
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0,0,0,0.4);
          backdrop-filter: blur(4px);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .modal-content {
          background: white;
          border-radius: 24px;
          width: 100%;
          max-width: 500px;
          box-shadow: 0 24px 48px rgba(0,0,0,0.1);
          overflow: hidden;
          font-family: 'Outfit', sans-serif;
        }
        .modal-header {
          padding: 24px 32px;
          border-bottom: 1px solid rgba(0,0,0,0.05);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .modal-header h2 { font-size: 20px; font-weight: 700; color: #1A1A1A; margin: 0; }
        .icon-btn { background: transparent; border: none; color: #9CA3AF; cursor: pointer; padding: 4px; border-radius: 8px; transition: 0.2s; }
        .icon-btn:hover { background: #F3F4F6; color: #1A1A1A; }
        
        .modal-body { padding: 32px; display: flex; flex-direction: column; gap: 20px; }
        .form-group { display: flex; flex-direction: column; gap: 8px; }
        .form-group label { font-size: 13px; font-weight: 600; color: #4B5563; }
        .form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        
        input[type="text"], input[type="date"], select {
          width: 100%;
          padding: 12px 16px;
          border: 1px solid #E5E7EB;
          border-radius: 12px;
          font-size: 14px;
          font-family: 'Outfit', sans-serif;
          color: #1A1A1A;
          outline: none;
          transition: all 0.2s;
        }
        input:focus, select:focus { border-color: #BE8755; box-shadow: 0 0 0 3px rgba(190, 135, 85, 0.1); }
        
        .input-with-icon { position: relative; }
        .input-icon { position: absolute; left: 14px; top: 50%; transform: translateY(-50%); color: #9CA3AF; pointer-events: none; }
        .input-with-icon input, .input-with-icon select { padding-left: 40px; }
        
        .color-picker-row { display: flex; gap: 12px; }
        .color-swatch { 
          width: 32px; height: 32px; 
          border-radius: 50%; 
          border: none; 
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: transform 0.2s;
        }
        .color-swatch:hover { transform: scale(1.1); }
        .color-swatch.selected { box-shadow: 0 0 0 2px white, 0 0 0 4px #BE8755; }

        .modal-footer {
          margin-top: 12px;
          display: flex;
          justify-content: flex-end;
          gap: 12px;
        }
        .btn-secondary {
          padding: 12px 24px;
          border-radius: 12px;
          border: 1px solid #E5E7EB;
          background: white;
          color: #4B5563;
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s;
        }
        .btn-secondary:hover { background: #F9FAFB; }
        
        .btn-primary {
          padding: 12px 24px;
          border-radius: 12px;
          border: none;
          background: var(--gold-gradient, linear-gradient(135deg, #BE8755 0%, #D4A373 100%));
          color: white;
          font-weight: 600;
          cursor: pointer;
          transition: 0.2s;
          box-shadow: 0 4px 12px rgba(190, 135, 85, 0.2);
        }
        .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(190, 135, 85, 0.3); }

        @media (max-width: 600px) {
          .modal-content { max-height: 90vh; overflow-y: auto; border-radius: 20px; }
          .modal-header { padding: 16px 20px; }
          .modal-body { padding: 20px; gap: 16px; }
          .form-row { grid-template-columns: 1fr; gap: 16px; }
          .color-picker-row { flex-wrap: wrap; }
          .modal-footer { flex-direction: column-reverse; gap: 10px; }
          .btn-secondary, .btn-primary { width: 100%; text-align: center; justify-content: center; }
        }
      `}</style>
    </AnimatePresence>
  )
}

export default CampaignModal
