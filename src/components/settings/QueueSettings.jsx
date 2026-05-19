import React, { useState } from 'react'
import { Plus, Trash2, Clock, Calendar, CheckCircle2, MoreHorizontal, ChevronRight } from 'lucide-react'
import { usePosts } from '../hooks/usePosts'
import { supabase } from '../lib/supabase'

const QueueSettings = () => {
  const { queueSlots, fetchQueueSlots } = usePosts()
  const [mode, setMode] = useState('weekly')
  const [newSlot, setNewSlot] = useState({ 
    day_of_week: 1, 
    specific_date: '', 
    posting_time: '10:00' 
  })

  const days = [
    { id: 0, name: 'Sunday' },
    { id: 1, name: 'Monday' },
    { id: 2, name: 'Tuesday' },
    { id: 3, name: 'Wednesday' },
    { id: 4, name: 'Thursday' },
    { id: 5, name: 'Friday' },
    { id: 6, name: 'Saturday' },
  ]

  const handleAddSlot = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      const payload = {
        user_id: user.id,
        posting_time: `${newSlot.posting_time}:00`,
        day_of_week: mode === 'weekly' ? newSlot.day_of_week : null,
        specific_date: mode === 'date' ? newSlot.specific_date : null
      }
      const { error } = await supabase.from('queue_settings').insert([payload])
      if (error) throw error
      fetchQueueSlots()
    } catch (err) {
      alert('Error adding slot: ' + err.message)
    }
  }

  const handleDeleteSlot = async (id) => {
    try {
      const { error } = await supabase.from('queue_settings').delete().eq('id', id)
      if (error) throw error
      fetchQueueSlots()
    } catch (err) {
      alert('Error deleting slot: ' + err.message)
    }
  }

  return (
    <div className="settings-wrapper">
      <header className="settings-header" style={{ marginBottom: '40px' }}>
        <h1 style={{ fontSize: '32px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '8px' }}>Queue Strategy</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '15px' }}>Automate your distribution by defining a consistent posting rhythm.</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '40px' }}>
        
        {/* Left Column: Configuration */}
        <div className="product-card" style={{ padding: '32px', height: 'fit-content' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '24px' }}>Add Posting Slot</h3>
          
          <div style={{ display: 'flex', background: '#F5F5F3', padding: '4px', borderRadius: '12px', marginBottom: '24px' }}>
            <button 
              className={`mode-pill ${mode === 'weekly' ? 'active' : ''}`}
              onClick={() => setMode('weekly')}
            >Weekly</button>
            <button 
              className={`mode-pill ${mode === 'date' ? 'active' : ''}`}
              onClick={() => setMode('date')}
            >One-time</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {mode === 'weekly' ? (
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase' }}>Day of Week</label>
                <select 
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--glass-border)', outline: 'none', background: '#FFFFFF' }}
                  value={newSlot.day_of_week}
                  onChange={(e) => setNewSlot({ ...newSlot, day_of_week: parseInt(e.target.value) })}
                >
                  {days.map(day => (
                    <option key={day.id} value={day.id}>{day.name}</option>
                  ))}
                </select>
              </div>
            ) : (
              <div>
                <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase' }}>Specific Date</label>
                <input 
                  type="date"
                  style={{ width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid var(--glass-border)', outline: 'none' }}
                  value={newSlot.specific_date}
                  onChange={(e) => setNewSlot({ ...newSlot, specific_date: e.target.value })}
                />
              </div>
            )}

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: 'var(--text-dim)', marginBottom: '8px', textTransform: 'uppercase' }}>Preferred Time</label>
              <div style={{ position: 'relative' }}>
                <Clock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input 
                  type="time" 
                  style={{ width: '100%', padding: '12px 12px 12px 36px', borderRadius: '10px', border: '1px solid var(--glass-border)', outline: 'none' }}
                  value={newSlot.posting_time}
                  onChange={(e) => setNewSlot({ ...newSlot, posting_time: e.target.value })}
                />
              </div>
            </div>

            <button className="btn-gold" style={{ width: '100%', marginTop: '12px', justifyContent: 'center' }} onClick={handleAddSlot}>
              <Plus size={18} /> Add to Queue
            </button>
          </div>
        </div>

        {/* Right Column: Visualization */}
        <div className="product-card" style={{ padding: '32px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700 }}>Your Rhythm</h3>
              <p style={{ fontSize: '14px', color: 'var(--text-dim)' }}>Current active distribution slots.</p>
            </div>
            <div style={{ padding: '6px 12px', borderRadius: '100px', background: '#F5F5F3', fontSize: '12px', fontWeight: 700 }}>
              {queueSlots?.length || 0} Total Slots
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
            {/* Weekly Section */}
            <section>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <Calendar size={16} color="var(--accent-gold)" />
                <h4 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Weekly Recurring</h4>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1px', background: 'var(--glass-border)', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--glass-border)' }}>
                {days.map(day => {
                  const daySlots = queueSlots?.filter(s => s.day_of_week === day.id) || []
                  return (
                    <div key={day.id} style={{ display: 'flex', alignItems: 'center', background: 'white', padding: '16px 24px' }}>
                      <span style={{ width: '100px', fontWeight: 700, fontSize: '14px' }}>{day.name}</span>
                      <div style={{ flex: 1, display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                        {daySlots.length > 0 ? daySlots.map(slot => (
                          <div key={slot.id} className="slot-pill">
                            {slot.posting_time.substring(0, 5)}
                            <button className="slot-del-btn" onClick={() => handleDeleteSlot(slot.id)}>×</button>
                          </div>
                        )) : <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontStyle: 'italic' }}>No slots</span>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>

            {/* Date Section */}
            <section>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
                <Clock size={16} color="var(--accent-gold)" />
                <h4 style={{ fontSize: '13px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>One-time Slots</h4>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px' }}>
                {queueSlots?.filter(s => s.specific_date).map(slot => (
                  <div key={slot.id} className="date-slot-item">
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 700 }}>{new Date(slot.specific_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</p>
                      <p style={{ fontSize: '12px', color: 'var(--text-dim)' }}>{slot.posting_time.substring(0, 5)}</p>
                    </div>
                    <button className="del-icon-btn" onClick={() => handleDeleteSlot(slot.id)}>
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {queueSlots?.filter(s => s.specific_date).length === 0 && (
                  <p style={{ fontSize: '13px', color: 'var(--text-dim)', fontStyle: 'italic' }}>No one-time slots scheduled.</p>
                )}
              </div>
            </section>
          </div>
        </div>

      </div>

      <style jsx="true">{`
        .settings-wrapper { max-width: 1200px; margin: 0 auto; }
        .mode-pill {
          flex: 1; padding: 10px; border: none; background: transparent;
          border-radius: 8px; font-size: 13px; font-weight: 600;
          color: var(--text-dim); cursor: pointer; transition: all 0.3s ease;
        }
        .mode-pill.active { background: white; color: var(--accent-gold); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .slot-pill {
          padding: 6px 12px; border-radius: 8px; background: #F9F8F6;
          border: 1px solid var(--glass-border); font-size: 12px; font-weight: 700;
          display: flex; alignItems: center; gap: 8px;
        }
        .slot-del-btn { border: none; background: none; color: #EF4444; cursor: pointer; font-size: 16px; padding: 0; line-height: 1; }
        .date-slot-item {
          padding: 16px; border-radius: 12px; border: 1px solid var(--glass-border);
          display: flex; justifyContent: space-between; alignItems: center;
        }
        .del-icon-btn {
          width: 28px; height: 28px; border-radius: 6px; border: none;
          background: #FFF5F5; color: #EF4444; cursor: pointer;
          display: flex; alignItems: center; justifyContent: center; transition: all 0.2s;
        }
        .del-icon-btn:hover { background: #EF4444; color: white; }
      `}</style>
    </div>
  )
}

export default QueueSettings
