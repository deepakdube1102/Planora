import React, { useState } from 'react'
import { Sparkles, Image as ImageIcon, Calendar, Clock, Send, Save, Trash2, Camera, Globe, Briefcase, RefreshCw, ChevronDown, ListPlus } from 'lucide-react'
import { usePosts } from '../hooks/usePosts'
import { useAI } from '../hooks/useAI'

const PostEditor = ({ onSave }) => {
  const { createPost, addToQueue, getNextAvailableSlot } = usePosts()
  const { generateContent, loading: aiLoading } = useAI()
  const [loading, setLoading] = useState(false)
  const [showManual, setShowManual] = useState(false)
  const [nextSlot, setNextSlot] = useState(null)
  const [postData, setPostData] = useState({
    title: '',
    content: '',
    platform: 'instagram',
    scheduled_at: '',
    status: 'draft',
    media_url: ''
  })

  React.useEffect(() => {
    getNextAvailableSlot().then(setNextSlot)
  }, [])

  const platforms = [
    { id: 'instagram', icon: Camera, color: '#e1306c' },
    { id: 'twitter', icon: Send, color: '#1da1f2' },
    { id: 'linkedin', icon: Briefcase, color: '#0077b1' },
    { id: 'facebook', icon: Globe, color: '#1877f2' }
  ]

  const handleQueue = async () => {
    if (!postData.title || !postData.content) {
      alert('Please add a title and content first!')
      return
    }
    setLoading(true)
    try {
      await addToQueue(postData)
      onSave?.()
    } catch (err) {
      alert('Queue Error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleManualSchedule = async (e) => {
    e.preventDefault()
    if (!postData.scheduled_at) {
      alert('Please select a date and time!')
      return
    }
    setLoading(true)
    try {
      await createPost({
        ...postData,
        status: 'scheduled'
      })
      onSave?.()
    } catch (err) {
      alert('Error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDraft = async () => {
    setLoading(true)
    try {
      await createPost({
        ...postData,
        status: 'draft',
        scheduled_at: null
      })
      onSave?.()
    } catch (err) {
      alert('Error saving draft: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const generateAICaption = async () => {
    if (!postData.title) {
      alert('Please enter a title first so the AI has context!')
      return
    }
    const content = await generateContent(postData.title, 'caption')
    if (content) setPostData({ ...postData, content })
  }

  return (
    <div className="post-editor-layout">
      <div className="editor-main glass-card">
        <header className="editor-header">
          <div className="header-info">
            <h2>Compose Content</h2>
            {nextSlot && (
              <div className="next-slot-badge">
                <Clock size={12} />
                <span>Next available: <strong>{nextSlot.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}, {nextSlot.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}</strong></span>
              </div>
            )}
          </div>
          <div className="actions">
            <button className="btn-ghost" onClick={handleDraft} disabled={loading}>
              <Save size={18} /> Save Draft
            </button>
            <button className="btn-primary-gradient" onClick={handleQueue} disabled={loading}>
              <ListPlus size={18} /> {loading ? 'Queuing...' : 'Add to Queue'}
            </button>
          </div>
        </header>

        <form className="editor-form">
          <div className="form-content">
            <div className="input-group">
              <label>Campaign Title</label>
              <input 
                className="input-field" 
                placeholder="e.g. Summer Collection Launch"
                value={postData.title}
                onChange={(e) => setPostData({ ...postData, title: e.target.value })}
              />
            </div>

            <div className="input-group">
              <div className="label-with-action">
                <label>Caption</label>
                <button type="button" className="ai-btn" onClick={generateAICaption} disabled={aiLoading}>
                  {aiLoading ? <RefreshCw className="animate-spin" size={14} /> : <Sparkles size={14} />}
                  {aiLoading ? 'Thinking...' : 'AI Assist'}
                </button>
              </div>
              <textarea 
                className="input-field" 
                rows={10}
                placeholder="What do you want to say?"
                value={postData.content}
                onChange={(e) => setPostData({ ...postData, content: e.target.value })}
              />
            </div>

            <div className="media-upload-zone">
              <ImageIcon size={32} className="text-dim" />
              <p className="text-sm">Click to upload media or drag and drop</p>
              <span className="text-xs text-muted">Supports JPG, PNG, MP4 up to 10MB</span>
            </div>
          </div>

          <aside className="editor-sidebar">
            <div className="settings-section">
              <label>Target Platform</label>
              <div className="platform-selector">
                {platforms.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={`platform-btn ${postData.platform === p.id ? 'active' : ''}`}
                    onClick={() => setPostData({ ...postData, platform: p.id })}
                    style={{ '--brand-color': p.color }}
                  >
                    <p.icon size={20} strokeWidth={1.5} />
                  </button>
                ))}
              </div>
            </div>

            <div className="settings-section">
              <button 
                type="button" 
                className="manual-toggle"
                onClick={() => setShowManual(!showManual)}
              >
                <Calendar size={16} /> 
                Manual Scheduling 
                <ChevronDown size={14} className={showManual ? 'rotate-180' : ''} />
              </button>
              
              {showManual && (
                <div className="manual-fields animate-in">
                  <div className="input-group">
                    <label>Schedule Date</label>
                    <input 
                      type="date" 
                      className="input-field"
                      value={postData.scheduled_at ? postData.scheduled_at.split('T')[0] : ''}
                      onChange={(e) => setPostData({ ...postData, scheduled_at: `${e.target.value}T12:00:00` })}
                    />
                  </div>
                  <button className="btn-secondary w-full mt-2" onClick={handleManualSchedule} disabled={loading}>
                    Schedule Manually
                  </button>
                </div>
              )}
            </div>

            <div className="preview-container glass">
              <span className="text-xs font-bold text-muted mb-3 block uppercase tracking-wider">Live Preview</span>
              <div className="mockup-post">
                <div className="mockup-header">
                  <div className="mockup-avatar"></div>
                  <div className="mockup-user">
                    <div className="skeleton-text w-24"></div>
                    <div className="skeleton-text w-16 opacity-50"></div>
                  </div>
                </div>
                <p className="mockup-content">{postData.content || 'Your content will appear here...'}</p>
                <div className="mockup-media"></div>
              </div>
            </div>
          </aside>
        </form>
      </div>

      <style jsx="true">{`
        .post-editor-layout {
          max-width: 1200px;
          margin: 0 auto;
        }

        .editor-main {
          padding: 32px;
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .header-info h2 {
          margin-bottom: 4px;
        }

        .next-slot-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background: #eff6ff;
          color: #1e40af;
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.75rem;
          border: 1px solid #dbeafe;
        }

        .actions {
          display: flex;
          gap: 12px;
        }

        .btn-primary-gradient {
          background: linear-gradient(135deg, #3b82f6, #8b5cf6);
          color: white;
          border: none;
          padding: 10px 24px;
          border-radius: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 8px;
          cursor: pointer;
          transition: var(--transition-smooth);
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.2);
        }

        .btn-primary-gradient:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.3);
        }

        .editor-form {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 40px;
        }

        .form-content {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .label-with-action {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .ai-btn {
          background: #f1f5f9;
          border: 1px solid #e2e8f0;
          padding: 4px 12px;
          border-radius: 100px;
          font-size: 0.75rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .ai-btn:hover {
          background: white;
          border-color: var(--primary);
          color: var(--primary);
        }

        .media-upload-zone {
          height: 200px;
          border: 2px dashed #e2e8f0;
          border-radius: 20px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 12px;
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .media-upload-zone:hover {
          background: #f8fafc;
          border-color: var(--primary);
        }

        .editor-sidebar {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .platform-selector {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
        }

        .platform-btn {
          height: 54px;
          border-radius: 14px;
          border: 1px solid #e2e8f0;
          background: white;
          color: var(--text-dim);
          cursor: pointer;
          transition: var(--transition-smooth);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .platform-btn.active {
          background: var(--brand-color);
          color: white;
          border-color: var(--brand-color);
          box-shadow: 0 4px 12px var(--brand-color);
        }

        .manual-toggle {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 12px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 600;
          color: var(--text-muted);
          cursor: pointer;
        }

        .rotate-180 { transform: rotate(180deg); }

        .mockup-post {
          background: white;
          border-radius: 16px;
          padding: 16px;
          box-shadow: var(--shadow-soft);
        }

        .mockup-header {
          display: flex;
          gap: 12px;
          margin-bottom: 12px;
        }

        .mockup-avatar {
          width: 32px;
          height: 32px;
          background: #f1f5f9;
          border-radius: 50%;
        }

        .skeleton-text {
          height: 8px;
          background: #f1f5f9;
          border-radius: 4px;
          margin-bottom: 6px;
        }

        .mockup-content {
          font-size: 0.85rem;
          line-height: 1.5;
          margin-bottom: 12px;
        }

        .mockup-media {
          height: 160px;
          background: #f8fafc;
          border-radius: 8px;
        }

        .animate-in {
          animation: slideDown 0.3s ease-out;
        }

        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

export default PostEditor
