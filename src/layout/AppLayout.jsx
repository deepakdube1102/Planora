import React from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './Navbar'

const AppLayout = () => {
  return (
    <div className="layout" style={{ background: 'var(--bg-product)' }}>
      <Navbar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout
