import React from 'react'
import { format, addHours, startOfDay, isSameHour, isSameDay } from 'date-fns'
import { useDroppable } from '@dnd-kit/core'
import CalendarPostCard from './CalendarPostCard'

const TimeGrid = ({ days, posts, onCellClick, onEditPost, onDeletePost }) => {
  const hours = Array.from({ length: 14 }, (_, i) => i + 8) // 8 AM to 9 PM

  return (
    <div className="time-grid-container">
      <div className="cal-time-axis">
        <div className="axis-spacer" />
        {hours.map(hour => (
          <div key={hour} className="hour-label">
            {hour > 12 ? `${hour - 12} PM` : hour === 12 ? '12 PM' : `${hour} AM`}
          </div>
        ))}
      </div>

      <div className="grid-columns">
        {days.map(day => (
          <div key={day.toISOString()} className="grid-column">
            <div className="column-header">
               <p className="day-name">{format(day, 'EEE')}</p>
               <p className={`day-number ${isSameDay(day, new Date()) ? 'today' : ''}`}>{format(day, 'd')}</p>
            </div>
            <div className="hour-cells">
              {hours.map(hour => (
                <HourCell 
                  key={`${day.toISOString()}__${hour}`}
                  day={day}
                  hour={hour}
                  posts={posts.filter(p => {
                    const pDate = new Date(p.scheduled_at)
                    return isSameDay(pDate, day) && pDate.getHours() === hour
                  })}
                  onCellClick={onCellClick}
                  onEditPost={onEditPost}
                  onDeletePost={onDeletePost}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      <style jsx="true">{`
        .time-grid-container {
          display: flex;
          height: 100%;
          overflow-y: auto;
          background: white;
        }

        .cal-time-axis {
          width: 80px;
          border-right: 1px solid rgba(0,0,0,0.05);
          background: #FDFCFB;
          display: flex;
          flex-direction: column;
        }

        .axis-spacer { 
          height: 70px; 
          border-bottom: 1px solid rgba(0,0,0,0.05); 
          box-sizing: border-box;
          flex-shrink: 0;
        }

        .hour-label {
          height: 100px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 11px;
          font-weight: 700;
          color: #9CA3AF;
          border-bottom: 1px solid transparent;
          box-sizing: border-box;
          flex-shrink: 0;
        }

        .grid-columns {
          display: flex;
          flex: 1;
        }

        .grid-column {
          flex: 1;
          border-right: 1px solid rgba(0,0,0,0.05);
          min-width: 150px;
        }

        .column-header {
          height: 70px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border-bottom: 1px solid rgba(0,0,0,0.05);
          background: #FDFCFB;
          box-sizing: border-box;
          flex-shrink: 0;
        }

        .day-name { font-size: 11px; font-weight: 700; color: #9CA3AF; text-transform: uppercase; margin-bottom: 4px; }
        .day-number { 
          font-size: 18px; font-weight: 800; color: #1A1A1A; 
          width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; border-radius: 50%;
        }
        .day-number.today { background: var(--accent-gold); color: white; }

        .hour-cells { position: relative; }
      `}</style>
    </div>
  )
}

const HourCell = ({ day, hour, posts, onCellClick, onEditPost, onDeletePost }) => {
  const cellId = `${day.toISOString()}__${hour}`
  const { isOver, setNodeRef } = useDroppable({ id: cellId })

  return (
    <div 
      ref={setNodeRef}
      className={`hour-cell ${isOver ? 'drag-over' : ''}`}
      onClick={() => {
        const d = new Date(day)
        d.setHours(hour, 0, 0, 0)
        onCellClick(d)
      }}
    >
      {posts.map(post => (
        <CalendarPostCard 
          key={post.id}
          post={post}
          onEdit={onEditPost}
          onDelete={onDeletePost}
          onClick={(e) => {
            e.stopPropagation()
            onEditPost(post)
          }}
        />
      ))}

      <style jsx="true">{`
        .hour-cell {
          height: 100px;
          border-bottom: 1px solid rgba(0,0,0,0.02);
          padding: 6px;
          transition: background 0.2s;
          box-sizing: border-box;
        }
        .hour-cell:hover { background: rgba(0,0,0,0.01); }
        .hour-cell.drag-over { background: var(--accent-gold-glow) !important; }
      `}</style>
    </div>
  )
}

export default TimeGrid
