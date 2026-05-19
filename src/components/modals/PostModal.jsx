import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Sparkles, 
  Image as ImageIcon, 
  Calendar as CalendarIcon, 
  Clock, 
  Hash, 
  Type, 
  Check,
  Zap,
  Layout,
  Globe,
  Plus,
  Target
} from 'lucide-react'
import { Instagram, Twitter, Linkedin, Facebook, Tiktok, Youtube } from '../ui/BrandIcons'
import { useAppStore } from '../../store/useAppStore'

const PostModal = ({ isOpen, onClose, post, initialDate, onSave }) => {
  const { campaigns } = useAppStore()

  // Helper to convert a Date/ISO string to local ISO string (YYYY-MM-DDTHH:mm) for datetime-local input
  const toLocalISOString = (dateOrStr) => {
    if (!dateOrStr) return ''
    const date = new Date(dateOrStr)
    if (isNaN(date.getTime())) return ''
    const offsetMs = date.getTimezoneOffset() * 60 * 1000
    const localDate = new Date(date.getTime() - offsetMs)
    return localDate.toISOString().slice(0, 16)
  }

  // Helper to parse local YYYY-MM-DDTHH:mm string into a local Date object securely
  const parseLocalISOString = (str) => {
    if (!str) return new Date()
    const [datePart, timePart] = str.split('T')
    if (!datePart || !timePart) return new Date(str)
    const [year, month, day] = datePart.split('-').map(Number)
    const [hour, minute] = timePart.split(':').map(Number)
    return new Date(year, month - 1, day, hour, minute)
  }
  
  const [formData, setFormData] = useState(post || {
    title: '',
    caption: '',
    platform: 'instagram',
    type: 'Post',
    status: 'scheduled',
    scheduled_at: initialDate ? initialDate.toISOString() : new Date().toISOString(),
    campaignId: '',
    media: null
  })

  useEffect(() => {
    if (isOpen) {
      setFormData(post || {
        title: '',
        caption: '',
        platform: 'instagram',
        type: 'Post',
        status: 'scheduled',
        scheduled_at: initialDate ? initialDate.toISOString() : new Date().toISOString(),
        campaignId: '',
        media: null
      })
    }
  }, [post, initialDate, isOpen])

  const [aiGenerating, setAiGenerating] = useState(false)

  const platforms = [
    { id: 'instagram', name: 'Instagram', icon: Instagram, color: '#E1306C' },
    { id: 'tiktok', name: 'TikTok', icon: Tiktok, color: '#000000' },
    { id: 'linkedin', name: 'LinkedIn', icon: Linkedin, color: '#0077B5' },
    { id: 'twitter', name: 'Twitter', icon: Twitter, color: '#1DA1F2' },
    { id: 'youtube', name: 'YouTube', icon: Youtube, color: '#FF0000' }
  ]

  const handleAiSuggest = () => {
    setAiGenerating(true)
    setTimeout(() => {
      setFormData(prev => ({
        ...prev,
        caption: prev.caption + "\n\n✨ Content generated with Planora AI! #productivity #creator"
      }))
      setAiGenerating(false)
    }, 1500)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave(formData)
    onClose()
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="modal-overlay" onClick={onClose}>
        <motion.div 
          className="modal-container-premium"
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          onClick={(e) => e.stopPropagation()}
        >
          <header className="modal-header">
            <div className="header-title">
              <div className="icon-badge">
                <Plus size={20} />
              </div>
              <h2>{post ? 'Edit Scheduled Post' : 'Create New Post'}</h2>
            </div>
            <button className="close-btn" onClick={onClose}><X size={20} /></button>
          </header>

          <form onSubmit={handleSubmit} className="modal-form-grid">
            {/* Left Column: Content */}
            <div className="form-col-left">
              <div className="form-section">
                <label><Type size={14} /> Post Title</label>
                <input 
                  type="text" 
                  placeholder="E.g. Monday Motivation Reel" 
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  required
                />
              </div>

              <div className="form-section">
                <div className="label-row">
                  <label><Type size={14} /> Caption</label>
                  <button type="button" className="ai-btn-sm" onClick={handleAiSuggest} disabled={aiGenerating}>
                    {aiGenerating ? <Sparkles size={12} className="spin" /> : <Sparkles size={12} />}
                    AI Suggest
                  </button>
                </div>
                <textarea 
                  placeholder="What's on your mind?"
                  value={formData.caption}
                  onChange={(e) => setFormData({...formData, caption: e.target.value})}
                  rows={6}
                />
              </div>

              <div className="form-section">
                <label><ImageIcon size={14} /> Media</label>
                <div className="media-upload-zone">
                  {formData.media ? (
                    <div className="media-preview-wrap">
                       <img src={formData.media} alt="Preview" />
                       <button type="button" className="remove-media" onClick={() => setFormData({...formData, media: null})}><X size={14} /></button>
                    </div>
                  ) : (
                    <div className="upload-placeholder">
                      <ImageIcon size={24} />
                      <p>Click or drag to upload media</p>
                      <span>Supports JPG, PNG, MP4 (Max 100MB)</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column: Settings */}
            <div className="form-col-right">
              <div className="form-section">
                <label>Publishing Channel</label>
                <div className="platform-grid">
                  {platforms.map(p => (
                    <button 
                      key={p.id}
                      type="button"
                      className={`platform-btn ${formData.platform === p.id ? 'active' : ''}`}
                      onClick={() => setFormData({...formData, platform: p.id, color: p.color})}
                      style={{ '--p-color': p.color }}
                    >
                      <p.icon size={18} />
                      <span>{p.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-section">
                <label><CalendarIcon size={14} /> Schedule Date & Time</label>
                <div className="datetime-input-group">
                  <input 
                    type="datetime-local" 
                    value={toLocalISOString(formData.scheduled_at)}
                    onChange={(e) => {
                      const val = e.target.value
                      if (val) {
                        const localDate = parseLocalISOString(val)
                        setFormData({...formData, scheduled_at: localDate.toISOString()})
                      }
                    }}
                  />
                </div>
              </div>

              <div className="form-section">
                <label><Target size={14} /> Campaign</label>
                <select 
                  className="campaign-select"
                  value={formData.campaignId}
                  onChange={(e) => setFormData({...formData, campaignId: e.target.value})}
                >
                  <option value="">No Campaign</option>
                  {campaigns.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>

              <div className="form-section">
                <label>Status</label>
                <div className="status-selector">
                  {['draft', 'scheduled', 'pending', 'published'].map(s => (
                    <button 
                      key={s}
                      type="button"
                      className={`status-btn ${formData.status === s ? 'active' : ''}`}
                      onClick={() => setFormData({...formData, status: s})}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <footer className="modal-footer">
              <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
              <button type="submit" className="btn-gold-action">
                {post ? 'Update Schedule' : 'Schedule Post'}
              </button>
            </footer>
          </form>

      <style jsx="true">{`
        .modal-overlay {
          position: fixed;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(0, 0, 0, 0.3);
          backdrop-filter: blur(8px);
          z-index: 2000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .modal-container-premium {
          background: #FFFFFF;
          width: 100%;
          max-width: 900px;
          border-radius: 28px;
          box-shadow: 0 30px 60px rgba(0, 0, 0, 0.15);
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .modal-header {
          padding: 24px 32px;
          border-bottom: 1px solid rgba(0,0,0,0.05);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .header-title {
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .icon-badge {
          width: 40px;
          height: 40px;
          background: var(--accent-gold-glow);
          color: var(--accent-gold);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .header-title h2 {
          font-size: 20px;
          font-weight: 700;
          color: #1A1A1A;
        }

        .close-btn {
          background: #F9F8F6;
          border: none;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #666;
          transition: all 0.2s;
        }

        .close-btn:hover { background: #F0EEEA; color: #1A1A1A; }

        .modal-form-grid {
          padding: 32px;
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 40px;
        }

        @media (max-width: 768px) {
          .modal-overlay {
            padding: 16px;
            align-items: center;
            justify-content: center;
          }
          .modal-container-premium {
            max-height: 85vh;
            display: flex;
            flex-direction: column;
            border-radius: 24px;
            overflow: hidden;
          }
          .modal-header {
            padding: 16px 20px;
            flex-shrink: 0;
          }
          .modal-form-grid {
            grid-template-columns: 1fr;
            padding: 20px;
            gap: 20px;
            overflow-y: auto;
            flex: 1;
            display: flex;
            flex-direction: column;
            -webkit-overflow-scrolling: touch;
          }
          .form-col-left, .form-col-right {
            width: 100%;
            display: flex;
            flex-direction: column;
            gap: 16px;
          }
          .platform-grid {
            grid-template-columns: repeat(2, 1fr) !important;
            gap: 8px;
          }
          .modal-footer {
            grid-column: span 1;
            position: sticky;
            bottom: -20px;
            background: #FFFFFF;
            padding: 14px 20px;
            margin: 12px -20px -20px -20px;
            border-top: 1px solid rgba(0,0,0,0.06);
            display: flex;
            flex-direction: row !important;
            gap: 12px;
            z-index: 10;
            box-shadow: 0 -8px 24px rgba(0,0,0,0.02);
          }
          .btn-cancel, .btn-gold-action {
            margin: 0 !important;
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 44px;
            font-size: 13.5px;
            padding: 0 12px;
            border-radius: 12px;
          }
          .btn-gold-action {
            flex: 1.2;
          }
        }

        @media (max-width: 480px) {
          .modal-overlay {
            padding: 10px;
          }
          .modal-container-premium {
            max-height: 90vh;
          }
          .modal-header {
            padding: 14px 16px;
          }
          .header-title h2 {
            font-size: 17px;
          }
          .modal-form-grid {
            padding: 16px;
            gap: 16px;
          }
          input[type="text"], textarea, input[type="datetime-local"], .campaign-select {
            padding: 10px 12px;
            font-size: 13px;
            border-radius: 10px;
          }
          .form-section {
            margin-bottom: 12px;
          }
          .form-section label {
            font-size: 12px;
            margin-bottom: 6px;
          }
          .media-upload-zone {
            min-height: 120px;
            border-radius: 14px;
          }
          .upload-placeholder p {
            font-size: 12.5px;
          }
          .upload-placeholder span {
            font-size: 10px;
          }
          .platform-btn {
            padding: 10px;
            gap: 8px;
            border-radius: 10px;
          }
          .platform-btn span {
            font-size: 12px;
          }
          .status-btn {
            padding: 6px;
            font-size: 10px;
            border-radius: 6px;
          }
        }

        .form-section {
          margin-bottom: 24px;
        }

        .form-section label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 13px;
          font-weight: 700;
          color: #1A1A1A;
          margin-bottom: 10px;
        }

        .label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }

        .label-row label { margin-bottom: 0; }

        .ai-btn-sm {
          background: var(--accent-gold-glow);
          color: var(--accent-gold);
          border: none;
          padding: 6px 12px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .ai-btn-sm:hover { filter: brightness(0.95); }

        input[type="text"], textarea, input[type="datetime-local"], .campaign-select {
          width: 100%;
          padding: 14px 16px;
          border: 1px solid rgba(0,0,0,0.06);
          border-radius: 14px;
          background: #FDFCFB;
          font-size: 14px;
          outline: none;
          transition: border-color 0.2s;
        }

        input:focus, textarea:focus, .campaign-select:focus { border-color: var(--accent-gold); }

        .media-upload-zone {
          border: 2px dashed rgba(0,0,0,0.06);
          border-radius: 18px;
          min-height: 180px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #FDFCFB;
          cursor: pointer;
          overflow: hidden;
        }

        .upload-placeholder {
          text-align: center;
          color: #9CA3AF;
        }

        .upload-placeholder p { font-size: 14px; font-weight: 600; color: #1A1A1A; margin: 8px 0 4px; }
        .upload-placeholder span { font-size: 11px; }

        .media-preview-wrap {
          width: 100%;
          height: 100%;
          position: relative;
        }

        .media-preview-wrap img { width: 100%; height: 100%; object-fit: cover; }

        .remove-media {
          position: absolute;
          top: 10px; right: 10px;
          background: rgba(0,0,0,0.5);
          color: white;
          border: none;
          width: 24px; height: 24px;
          border-radius: 50%;
          cursor: pointer;
        }

        .platform-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 10px;
        }

        .platform-btn {
          padding: 12px;
          border-radius: 14px;
          border: 1px solid rgba(0,0,0,0.06);
          background: white;
          display: flex;
          align-items: center;
          gap: 12px;
          cursor: pointer;
          transition: all 0.2s;
          color: #666;
        }

        .platform-btn span { font-size: 13px; font-weight: 600; }

        .platform-btn.active {
          border-color: var(--p-color);
          background: rgba(0,0,0,0.02);
          color: #1A1A1A;
        }

        .status-selector {
          display: flex;
          background: #F9F8F6;
          padding: 4px;
          border-radius: 12px;
          gap: 4px;
          overflow-x: auto;
        }

        .status-btn {
          flex: 1;
          border: none;
          padding: 8px;
          border-radius: 8px;
          font-size: 11px;
          font-weight: 700;
          text-transform: capitalize;
          background: transparent;
          color: #666;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .status-btn.active {
          background: white;
          color: #1A1A1A;
          box-shadow: 0 4px 10px rgba(0,0,0,0.04);
        }

        .modal-footer {
          grid-column: span 2;
          display: flex;
          justify-content: flex-end;
          gap: 16px;
          padding-top: 20px;
          border-top: 1px solid rgba(0,0,0,0.05);
        }

        .btn-cancel {
          padding: 12px 24px;
          border-radius: 12px;
          border: 1px solid rgba(0,0,0,0.06);
          background: white;
          font-weight: 600;
          cursor: pointer;
        }

        .btn-gold-action {
          padding: 12px 32px;
          border-radius: 12px;
          border: none;
          background: var(--gold-gradient);
          color: white;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 10px;
          cursor: pointer;
          box-shadow: 0 10px 20px rgba(190, 135, 85, 0.2);
        }

        .spin { animation: rotate 2s linear infinite; }
        @keyframes rotate { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default PostModal
