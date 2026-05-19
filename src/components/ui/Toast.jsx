import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertCircle, X } from 'lucide-react'

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000)
    return () => clearTimeout(timer)
  }, [onClose])

  const icons = {
    success: <CheckCircle className="text-emerald-500" size={20} />,
    error: <AlertCircle className="text-rose-500" size={20} />,
    info: <AlertCircle className="text-blue-500" size={20} />
  }

  const backgrounds = {
    success: 'bg-emerald-50/80 border-emerald-100',
    error: 'bg-rose-50/80 border-rose-100',
    info: 'bg-blue-50/80 border-blue-100'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 50, scale: 0.9 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
      className={`fixed bottom-8 right-8 z-[2000] flex items-center gap-3 px-5 py-3.5 rounded-2xl border backdrop-blur-xl shadow-2xl ${backgrounds[type]}`}
    >
      {icons[type]}
      <span className="text-sm font-semibold text-slate-800">{message}</span>
      <button 
        onClick={onClose}
        className="ml-2 p-1 hover:bg-black/5 rounded-full transition-colors"
      >
        <X size={14} className="text-slate-400" />
      </button>
    </motion.div>
  )
}

export const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed bottom-0 right-0 p-8 flex flex-col gap-3 z-[2000] pointer-events-none">
      <AnimatePresence>
        {toasts.map(toast => (
          <div key={toast.id} className="pointer-events-auto">
            <Toast 
              {...toast} 
              onClose={() => removeToast(toast.id)} 
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  )
}

export default Toast
