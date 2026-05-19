import React, { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import ReactMarkdown from 'react-markdown'
import {
  Sparkles, Send, Copy, RefreshCw, Plus, History, FileText, Layout,
  ChevronDown, MoreHorizontal, Paperclip, Globe, Image as ImageIcon,
  Wand2, Check, Calendar, Save, Zap, MoreVertical, Type, Hash,
  Lightbulb, ArrowRight, TrendingUp, MessageSquare, Trash2,
  Edit2, X, AlertCircle, Mic, ArrowUp
} from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { useChatStore } from '../store/useChatStore'
import { streamChat, analyzeContentScore, suggestHashtags } from '../services/gemini'
import './AIAssistant.css'
import logo from '../assets/logo_golden.png'

const AIAssistant = () => {
  const { user, addPost } = useAppStore()
  const {
    activeChatId, isStreaming,
    getActiveChat, getMessages, getChatList,
    createChat, switchChat, deleteChat, renameChat,
    addMessage, startStreaming, appendToStream, finishStreaming,
    removeLastAssistant, getLastUserMessage,
    isHistoryOpen, setHistoryOpen,
  } = useChatStore()

  const [prompt, setPrompt] = useState('')
  const [copiedId, setCopiedId] = useState(null)
  const [menuOpenId, setMenuOpenId] = useState(null)
  const [renamingId, setRenamingId] = useState(null)
  const [renameValue, setRenameValue] = useState('')
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(240)
  const [isResizing, setIsResizing] = useState(false)
  const [rightSidebarWidth, setRightSidebarWidth] = useState(260)
  const [isResizingRight, setIsResizingRight] = useState(false)

  // -- Sidebar Resize Logic --
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (isResizing) {
        let newWidth = e.clientX
        if (newWidth < 200) newWidth = 200
        if (newWidth > 500) newWidth = 500
        setLeftSidebarWidth(newWidth)
      } else if (isResizingRight) {
        let newWidth = window.innerWidth - e.clientX
        if (newWidth < 220) newWidth = 220
        if (newWidth > 500) newWidth = 500
        setRightSidebarWidth(newWidth)
      }
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      setIsResizingRight(false)
    }

    if (isResizing || isResizingRight) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'col-resize'
      document.body.style.userSelect = 'none'
    } else {
      document.body.style.cursor = 'default'
      document.body.style.userSelect = 'auto'
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'default'
      document.body.style.userSelect = 'auto'
    }
  }, [isResizing, isResizingRight])
  const [activeTab, setActiveTab] = useState('caption')
  const [tone, setTone] = useState('Professional')
  const [platform, setPlatform] = useState('Instagram')
  const [contentType, setContentType] = useState('Caption')

  const [contentScore, setContentScore] = useState({ score: 92, label: 'Excellent', feedback: 'Highly engaging and optimized' })
  const [hashtagSuggestions, setHashtagSuggestions] = useState([
    '#GlowNaturally', '#VitaminCSerum', '#SkincareRoutine', '#RadiantSkin',
    '#HealthySkin', '#SkincareLover', '+8 more'
  ])

  const chatEndRef = useRef(null)
  const textareaRef = useRef(null)
  const messages = getMessages()
  const chatList = getChatList()

  // Auto-initiate a fresh new chat session when opening the assistant for the first time after logging in
  useEffect(() => {
    const { hasAutoCreatedNewChat, createChat } = useChatStore.getState()
    if (!hasAutoCreatedNewChat) {
      createChat()
      useChatStore.setState({ hasAutoCreatedNewChat: true })
    }
  }, [])

  // Scroll to bottom on new messages or streaming
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isStreaming])

  // Auto-resize textarea
  const autoResize = useCallback(() => {
    const ta = textareaRef.current
    if (!ta) return
    ta.style.height = 'auto'
    ta.style.height = Math.min(ta.scrollHeight, 120) + 'px'
  }, [])

  useEffect(() => { autoResize() }, [prompt, autoResize])

  // ── Send message ──
  const handleSend = useCallback(async () => {
    if (!prompt.trim() || isStreaming) return

    const userMsg = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: prompt.trim(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
    addMessage(userMsg)
    setPrompt('')

    // Reset textarea height
    if (textareaRef.current) textareaRef.current.style.height = 'auto'

    const aiMsgId = `ai-${Date.now()}`
    startStreaming(aiMsgId)

    try {
      // Get live messages from store + new user message
      // streamChat handles filtering out errors and role mapping internally
      const liveMessages = [...getMessages(), userMsg]

      const fullText = await streamChat(liveMessages, { tone, platform, contentType }, (chunk) => {
        appendToStream(chunk)
      })

      finishStreaming()

      // Update right panel analytics in background
      analyzeContentScore(fullText, platform).then(setContentScore).catch(() => {})
      suggestHashtags(fullText, platform).then(tags => {
        if (tags.length > 6) setHashtagSuggestions([...tags.slice(0, 6), `+${tags.length - 6} more`])
        else setHashtagSuggestions(tags)
      }).catch(() => {})
    } catch (err) {
      finishStreaming()
      addMessage({
        id: `err-${Date.now()}`,
        role: 'error',
        content: err.message || 'Something went wrong. Please try again.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      })
    }
  }, [prompt, isStreaming, getMessages, tone, platform, contentType, addMessage, startStreaming, appendToStream, finishStreaming])

  // ── Regenerate ──
  const handleRegenerate = useCallback(async () => {
    if (isStreaming) return
    const lastUser = getLastUserMessage()
    if (!lastUser) return

    removeLastAssistant()

    const aiMsgId = `ai-regen-${Date.now()}`
    startStreaming(aiMsgId)

    try {
      // Get live messages after removal — streamChat filters errors internally
      const liveMessages = getMessages().filter(m => m.role === 'user' || m.role === 'assistant')

      const fullText = await streamChat(liveMessages, { tone, platform, contentType }, (chunk) => {
        appendToStream(chunk)
      })

      finishStreaming()
      analyzeContentScore(fullText, platform).then(setContentScore).catch(() => {})
    } catch (err) {
      finishStreaming()
      addMessage({
        id: `err-${Date.now()}`,
        role: 'error',
        content: err.message || 'Regeneration failed.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      })
    }
  }, [isStreaming, getLastUserMessage, removeLastAssistant, getMessages, tone, platform, contentType, startStreaming, appendToStream, finishStreaming, addMessage])

  // ── Copy ──
  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // ── Save as Draft ──
  const handleSaveDraft = (content) => {
    addPost({
      title: content.substring(0, 50) + (content.length > 50 ? '...' : ''),
      platform: platform.toLowerCase(),
      status: 'draft',
      caption: content,
      scheduled_at: new Date().toISOString(),
    })
  }

  // ── New Chat ──
  const handleNewChat = () => {
    createChat()
    setHistoryOpen(false)
  }

  // ── Rename ──
  const startRename = (chatId, currentTitle) => {
    setRenamingId(chatId)
    setRenameValue(currentTitle)
    setMenuOpenId(null)
  }
  const commitRename = () => {
    if (renamingId && renameValue.trim()) {
      renameChat(renamingId, renameValue.trim())
    }
    setRenamingId(null)
    setRenameValue('')
  }

  // ── Suggested prompts ──
  const suggestedPrompts = [
    'Write a Reel script',
    'Instagram carousel idea',
    'Product launch caption',
    'YouTube video idea',
  ]

  const actionCards = [
    { id: 'caption', label: 'Caption', desc: 'Write engaging captions', icon: Sparkles, color: '#FEF3C7' },
    { id: 'hashtags', label: 'Hashtags', desc: 'Find the best hashtags', icon: Hash, color: '#E0F2FE' },
    { id: 'ideas', label: 'Ideas', desc: 'Get content ideas', icon: Lightbulb, color: '#F0FDF4' },
    { id: 'rewrite', label: 'Rewrite', desc: 'Improve your content', icon: RefreshCw, color: '#FEF3C7' },
    { id: 'summarize', label: 'Summarize', desc: 'Summarize long text', icon: FileText, color: '#F5F3FF' },
  ]

  const scoreColor = contentScore.score >= 90 ? '#F59E0B' : contentScore.score >= 70 ? '#10B981' : '#EF4444'
  const circumference = 2 * Math.PI * 34
  const strokeOffset = circumference - (contentScore.score / 100) * circumference

  const hasMessages = messages.length > 0

  return (
    <div className="ai-assistant-root" style={{ 
      '--left-sidebar-width': `${leftSidebarWidth}px`,
      '--right-sidebar-width': `${rightSidebarWidth}px` 
    }}>
      {/* ── MOBILE DRAWER ── */}
      <AnimatePresence>
        {isHistoryOpen && (
          <>
            <motion.div className="mobile-drawer-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setHistoryOpen(false)} />
            <motion.div className="mobile-drawer-content" initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }}>
              <div className="drawer-header">
                <h3>Chats</h3>
                <button className="close-drawer" onClick={() => setHistoryOpen(false)}><X size={18} /></button>
              </div>
              <div className="drawer-body">
                <LeftSidebarContent
                  chatList={chatList} activeChatId={activeChatId} user={user}
                  onNewChat={handleNewChat} onSwitch={(id) => { switchChat(id); setHistoryOpen(false) }}
                  onDelete={deleteChat} onStartRename={startRename}
                  renamingId={renamingId} renameValue={renameValue} setRenameValue={setRenameValue} commitRename={commitRename}
                  menuOpenId={menuOpenId} setMenuOpenId={setMenuOpenId}
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ── LEFT SIDEBAR ── */}
      <aside className="ai-sidebar-left">
        <LeftSidebarContent
          chatList={chatList} activeChatId={activeChatId} user={user}
          onNewChat={handleNewChat} onSwitch={switchChat}
          onDelete={deleteChat} onStartRename={startRename}
          renamingId={renamingId} renameValue={renameValue} setRenameValue={setRenameValue} commitRename={commitRename}
          menuOpenId={menuOpenId} setMenuOpenId={setMenuOpenId}
        />
        <div 
          className={`sidebar-resizer ${isResizing ? 'active' : ''}`}
          onMouseDown={() => setIsResizing(true)}
        />
      </aside>

      {/* ── CENTER WORKSPACE ── */}
      <main className="ai-workspace-center">
        <div className="mobile-action-bar">
          <button className="mobile-action-icon-btn" onClick={handleNewChat} title="New Chat">
            <Plus size={16} />
          </button>
          <button className="mobile-action-icon-btn" onClick={() => setHistoryOpen(true)} title="Previous Chats">
            <History size={16} />
          </button>
        </div>
        <header className="workspace-header">
          <div className="workspace-header-row-container">
            <div className="workspace-header-row">
              <Sparkles size={22} color="#BE8755" className="desktop-header-icon" />
              <div className="mobile-header-icon">
                <img src={logo} alt="Planora" className="mobile-logo-img" />
              </div>
              <h1 className="workspace-title">AI Assistant</h1>
              <h1 className="mobile-workspace-title">planora</h1>
            </div>
          </div>
          <p className="workspace-subtitle">Your creative partner in building powerful content.</p>
          <p className="mobile-workspace-subtitle">Your creative partner in building powerful content and brainstorming ideas.</p>
        </header>

        {/* Action Cards */}
        {!hasMessages && (
          <div className="action-cards-container">
            <div className="action-cards-scroll">
              {actionCards.map(card => (
                <button key={card.id} className={`action-card ${activeTab === card.id ? 'active' : ''}`} onClick={() => setActiveTab(card.id)}>
                  <div className="card-icon">
                    <div className="card-icon-box" style={{ background: card.color }}>
                      <card.icon size={14} color="#92400E" />
                    </div>
                    <span className="card-label">{card.label}</span>
                  </div>
                  <p className="card-desc">{card.desc}</p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Empty state */}
        {!hasMessages && (
          <div className="empty-state">
            <div className="empty-icon">
              <Sparkles size={28} color="#BE8755" />
            </div>
            <h2>What can I help you create?</h2>
            <p>I'm your AI-powered content copilot. Ask me to write captions, generate ideas, rewrite content, or anything else.</p>
            <div className="empty-suggestions">
              {suggestedPrompts.map((p, i) => (
                <button key={i} className="empty-chip" onClick={() => setPrompt(p)}>{p}</button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Messages */}
        <div className="chat-container">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`chat-bubble-row ${msg.role}`}
              >
                {msg.role === 'user' ? (
                  <div className="user-bubble-container">
                    <div className="user-bubble">
                      <div className="user-avatar-small desktop-only">
                        <img src={user.avatar} alt="User" />
                      </div>
                      <div className="bubble-content">
                        <p>{msg.content}</p>
                      </div>
                    </div>
                    <span className="bubble-time">{msg.time}</span>
                  </div>
                ) : msg.role === 'error' ? (
                  <div className="error-bubble">
                    <AlertCircle size={15} color="#DC2626" />
                    <p>{msg.content}</p>
                  </div>
                ) : (
                  <div className="ai-bubble-container">
                    <div className="ai-response-card glass-card">
                    <div className="ai-card-header">
                      <div className="ai-header-left">
                        <div className="ai-logo-small"><Sparkles size={11} color="white" /></div>
                        <span className="ai-header-name">Planora AI</span>
                      </div>
                      {!msg.isStreaming && (
                        <div className="ai-header-actions">
                          <button onClick={() => handleCopy(msg.content, msg.id)} title="Copy">
                            {copiedId === msg.id ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                          </button>
                          <button onClick={handleRegenerate} title="Regenerate"><RefreshCw size={14} /></button>
                          <button title="More"><MoreHorizontal size={14} /></button>
                        </div>
                      )}
                    </div>
                    <div className="ai-card-body">
                      <div className="ai-content markdown-body">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                        {msg.isStreaming && <span className="streaming-cursor" />}
                      </div>
                    </div>
                    {!msg.isStreaming && (
                      <div className="ai-card-footer">
                        <div className="footer-actions">
                          <button className="btn-action-outline" onClick={() => handleCopy(msg.content, msg.id)}>
                            {copiedId === msg.id ? <><Check size={12} color="#10B981" /> <span className="action-btn-text">Copied!</span></> : <><Copy size={12} /> <span className="action-btn-text">Copy</span></>}
                          </button>
                          <button className="btn-action-outline" onClick={handleRegenerate}>
                            <RefreshCw size={12} /> <span className="action-btn-text">Regenerate</span>
                          </button>
                          <button className="btn-action-outline" onClick={() => handleSaveDraft(msg.content)}>
                            <Save size={12} /> <span className="action-btn-text">Save as Draft</span>
                          </button>
                        </div>
                        <button className="btn-action-gold">
                          <Calendar size={12} /> Schedule Post
                        </button>
                      </div>
                    )}
                  </div>
                  </div>
                )}
              </motion.div>
            ))}
          </AnimatePresence>
          <div ref={chatEndRef} />
        </div>

        {/* Prompt Input */}
        <div className="prompt-input-container">
          {hasMessages && (
            <div className="prompt-chips">
              <button className="chip" onClick={() => setPrompt('Write a script')}>Write a script</button>
              <button className="chip" onClick={() => setPrompt('Caption ideas')}>Caption ideas</button>
              <button className="chip" onClick={() => setPrompt('Carousel outline')}>Carousel outline</button>
            </div>
          )}
          <div className="input-wrapper glass-card">
            <textarea
              ref={textareaRef}
              placeholder="Ask anything or type / for suggestions..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  handleSend()
                }
              }}
              rows={1}
            />
            <div className="input-toolbar">
              <div className="toolbar-btns">
                <button className="toolbar-btn"><Paperclip size={18} /></button>
                <button className="toolbar-btn"><ImageIcon size={18} /></button>
                <button className="toolbar-btn"><Mic size={18} /></button>
              </div>
              <button className="btn-send-gold" onClick={handleSend} disabled={isStreaming || !prompt.trim()}>
                <ArrowUp size={18} color="white" />
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* ── RIGHT SIDEBAR ── */}
      <aside className="ai-sidebar-right">
        <div 
          className={`sidebar-resizer-right ${isResizingRight ? 'active' : ''}`}
          onMouseDown={() => setIsResizingRight(true)}
        />
        <div style={{ paddingRight: '8px' }}>
          <span className="section-label">AI TOOLS</span>
          <div className="score-card glass-card">
            <div className="score-card-label">Content Score</div>
            <div className="score-row">
              <div className="score-gauge">
                <svg width="72" height="72" viewBox="0 0 80 80">
                  <circle cx="40" cy="40" r="34" stroke="#F1F1F1" strokeWidth="5" fill="none" />
                  <circle cx="40" cy="40" r="34" stroke={scoreColor} strokeWidth="5" fill="none"
                    strokeDasharray={circumference} strokeDashoffset={strokeOffset} strokeLinecap="round"
                    transform="rotate(-90 40 40)" style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
                </svg>
                <div className="score-val">{contentScore.score}<span>/100</span></div>
              </div>
              <div>
                <div className="score-meta-label" style={{ color: scoreColor }}>{contentScore.label}</div>
                <p className="score-meta-desc">{contentScore.feedback}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="tool-selectors">
          <SelectorRow icon={MessageSquare} label="Tone" value={tone} onChange={setTone}
            options={['Professional', 'Casual', 'Friendly', 'Bold', 'Witty', 'Inspirational']} />
          <SelectorRow icon={Layout} label="Platform" value={platform} onChange={setPlatform}
            options={['Instagram', 'Twitter', 'LinkedIn', 'YouTube', 'TikTok', 'Facebook']} />
          <SelectorRow icon={Type} label="Content Type" value={contentType} onChange={setContentType}
            options={['Caption', 'Reel Script', 'Thread', 'Blog Post', 'Ad Copy']} />
        </div>

        <div>
          <span className="section-label">HASHTAG SUGGESTIONS</span>
          <div className="hashtag-chips">
            {hashtagSuggestions.map((h, i) => (
              <span key={i} className="hashtag-chip" onClick={() => !h.startsWith('+') && navigator.clipboard.writeText(h)}>{h}</span>
            ))}
          </div>
        </div>

        <div>
          <span className="section-label">BEST TIME TO POST</span>
          <div className="time-card glass-card">
            <div className="time-card-header">
              <div className="time-icon-box"><Zap size={14} color="#BE8755" /></div>
              <div>
                <div className="time-label-main">Today, 7:30 PM</div>
                <div className="time-label-sub">Engagement is high at this time</div>
              </div>
            </div>
            <div className="time-chart">
              {[20,30,25,40,35,60,45,80,50,40,30,20].map((h, i) => (
                <div key={i} className={`time-bar ${i === 7 ? 'highlight' : 'normal'}`} style={{ height: `${h}%` }} />
              ))}
            </div>
            <div className="time-axis"><span>12AM</span><span>6AM</span><span>12PM</span><span>6PM</span><span>12AM</span></div>
          </div>
        </div>

        <div className="insight-card">
          <div className="insight-header">
            <Lightbulb size={13} color="#F59E0B" />
            <span className="insight-label">AI INSIGHT</span>
          </div>
          <p className="insight-text">Adding a before/after visual in your next post can increase engagement by 32%.</p>
        </div>
      </aside>
    </div>
  )
}

// ── Selector Row Component ──
const SelectorRow = ({ icon: Icon, label, value, onChange, options }) => (
  <div className="selector-group">
    <div className="selector-left">
      <Icon size={13} color="#BE8755" />
      <span>{label}</span>
    </div>
    <div className="selector-dropdown">
      <select value={value} onChange={e => onChange(e.target.value)}>
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
      <ChevronDown size={11} color="#94A3B8" />
    </div>
  </div>
)

// ── Left Sidebar Content ──
const LeftSidebarContent = ({
  chatList, activeChatId, user,
  onNewChat, onSwitch, onDelete, onStartRename,
  renamingId, renameValue, setRenameValue, commitRename,
  menuOpenId, setMenuOpenId,
}) => (
  <>
    <button className="btn-new-chat" onClick={onNewChat}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Plus size={14} />
        <span>New Chat</span>
      </div>
      <ArrowRight size={14} />
    </button>

    <div className="sidebar-scroll-area">
      <div className="sidebar-section">
        <span className="sidebar-section-label">CONVERSATIONS</span>
        <div className="history-list">
          {chatList.map((chat) => (
            <div key={chat.id} className="history-item-container">
              {renamingId === chat.id ? (
                <input
                  className="rename-input"
                  value={renameValue}
                  onChange={e => setRenameValue(e.target.value)}
                  onBlur={commitRename}
                  onKeyDown={e => { if (e.key === 'Enter') commitRename(); if (e.key === 'Escape') { setRenameValue(''); commitRename() } }}
                  autoFocus
                />
              ) : (
                <button
                  className={`history-item ${chat.id === activeChatId ? 'active' : ''}`}
                  onClick={() => onSwitch(chat.id)}
                >
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                    {chat.title}
                  </span>
                  <span className="time-label">{chat.time}</span>
                </button>
              )}
              <button className="history-more-btn" onClick={e => { e.stopPropagation(); setMenuOpenId(menuOpenId === chat.id ? null : chat.id) }}>
                <MoreHorizontal size={13} />
              </button>

              <AnimatePresence>
                {menuOpenId === chat.id && (
                  <motion.div initial={{ opacity: 0, scale: 0.95, y: -6 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -6 }} className="history-menu">
                    <button className="menu-item" onClick={() => onStartRename(chat.id, chat.title)}><Edit2 size={12} /> Rename</button>
                    <div className="menu-divider" />
                    <button className="menu-item delete" onClick={() => { onDelete(chat.id); setMenuOpenId(null) }}><Trash2 size={12} /> Delete</button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>

      <div className="sidebar-section">
        <span className="sidebar-section-label">SAVED TEMPLATES</span>
        <div className="history-list">
          {[
            { label: 'Product Launch Caption', icon: ImageIcon },
            { label: 'Engagement Boost Caption', icon: TrendingUp },
            { label: 'Reel Script Framework', icon: Wand2 },
            { label: 'Carousel Post Idea', icon: Layout },
          ].map((t, i) => (
            <button key={i} className="template-item">
              <t.icon size={13} style={{ opacity: 0.5 }} />
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>

    <div className="sidebar-bottom">
      <div className="profile-card-bottom">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="avatar-sidebar"><img src={user.avatar} alt="User" /></div>
          <div>
            <div className="profile-name">{user.name}</div>
            <div className="profile-plan">Pro Plan</div>
          </div>
        </div>
        <MoreVertical size={14} color="#94A3B8" style={{ cursor: 'pointer' }} />
      </div>
    </div>
  </>
)

export default AIAssistant
