import React from 'react'
import { motion } from 'framer-motion'
import { MoreHorizontal, Clock, Trash2, Edit2, Play, FileText, Image as ImageIcon } from 'lucide-react'
import { format } from 'date-fns'
import { Instagram, Twitter, Linkedin, Facebook } from '../ui/BrandIcons'
import { useDraggable } from '@dnd-kit/core'

const CalendarPostCard = ({ post, onClick, onDelete, onEdit }) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: post.id.toString(),
  })

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
    zIndex: isDragging ? 1000 : 1,
    opacity: isDragging ? 0.6 : 1,
  } : undefined

  const platforms = {
    instagram: { icon: Instagram, color: '#E1306C' },
    twitter: { icon: Twitter, color: '#1DA1F2' },
    linkedin: { icon: Linkedin, color: '#0077B5' },
    youtube: { icon: Play, color: '#FF0000' },
    facebook: { icon: Facebook, color: '#1877F2' }
  }

  const platform = platforms[post.platform] || { icon: ImageIcon, color: '#666' }
  const time = format(new Date(post.scheduled_at), 'h:mm a')

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      {...listeners} 
      {...attributes}
      className="post-card-draggable"
      onClick={onClick}
    >
      <motion.div 
        className={`calendar-post-card ${post.status}`}
        initial={{ opacity: 0, y: 5 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
      >
        <div className="card-top">
          <div className="platform-tag" style={{ background: `${platform.color}15`, color: platform.color }}>
            <platform.icon size={12} />
          </div>
          <div className="status-dot" style={{ background: post.status === 'published' ? '#10B981' : '#F59E0B' }} />
        </div>

        <div className="card-content">
          <h4 className="post-title">{post.title}</h4>
          <div className="post-meta">
            <div className="meta-item">
              <Clock size={10} />
              <span>{time}</span>
            </div>
            {post.campaign && (
              <div className="meta-item campaign">
                <span>{post.campaign}</span>
              </div>
            )}
          </div>
        </div>

        {post.media && (
          <div className="post-thumbnail">
            <img src={post.media} alt="" />
          </div>
        )}

        <div className="card-actions">
           <button onClick={(e) => { e.stopPropagation(); onEdit(post); }} className="action-btn-sm"><Edit2 size={12} /></button>
           <button onClick={(e) => { e.stopPropagation(); onDelete(post.id); }} className="action-btn-sm delete"><Trash2 size={12} /></button>
        </div>
      </motion.div>

      <style jsx="true">{`
        .post-card-draggable {
          cursor: grab;
          margin-bottom: 8px;
          touch-action: none;
        }

        .post-card-draggable:active { cursor: grabbing; }

        .calendar-post-card {
          background: #FFFFFF;
          border: 1px solid rgba(0,0,0,0.06);
          border-radius: 14px;
          padding: 10px;
          position: relative;
          box-shadow: 0 4px 12px rgba(0,0,0,0.03);
          transition: all 0.2s;
          overflow: hidden;
        }

        .calendar-post-card:hover {
          border-color: var(--accent-gold);
          box-shadow: 0 8px 24px rgba(0,0,0,0.06);
        }

        .calendar-post-card:hover .card-actions {
          opacity: 1;
          transform: translateY(0);
        }

        .card-top {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 8px;
        }

        .platform-tag {
          width: 24px;
          height: 24px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .status-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
        }

        .post-title {
          font-size: 11px;
          font-weight: 700;
          color: #1A1A1A;
          margin-bottom: 6px;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
          line-height: 1.4;
        }

        .post-meta {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }

        .meta-item {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 9px;
          font-weight: 600;
          color: #9CA3AF;
        }

        .meta-item.campaign {
          background: #F9F8F6;
          color: #6B6B6B;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .post-thumbnail {
          margin-top: 8px;
          border-radius: 8px;
          overflow: hidden;
          height: 60px;
          background: #F9F8F6;
        }

        .post-thumbnail img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .card-actions {
          position: absolute;
          top: 0; left: 0; right: 0; bottom: 0;
          background: rgba(255,255,255,0.9);
          backdrop-filter: blur(2px);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          opacity: 0;
          transform: translateY(5px);
          transition: all 0.2s;
        }

        .action-btn-sm {
          background: white;
          border: 1px solid rgba(0,0,0,0.06);
          width: 28px;
          height: 28px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          color: #666;
          transition: all 0.2s;
        }

        .action-btn-sm:hover {
          color: var(--accent-gold);
          border-color: var(--accent-gold);
          transform: scale(1.1);
        }

        .action-btn-sm.delete:hover {
          color: #EF4444;
          border-color: #EF4444;
        }
      `}</style>
    </div>
  )
}

export default CalendarPostCard
