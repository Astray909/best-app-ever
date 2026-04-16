import { useState, useEffect } from 'react'
import { NavLink, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { version } from '../../package.json'
import './Layout.css'

function getInitialTheme(): 'light' | 'dark' | 'system' {
  return (localStorage.getItem('theme') as 'light' | 'dark' | 'system') ?? 'system'
}

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [theme, setTheme] = useState<'light' | 'dark' | 'system'>(getInitialTheme)

  useEffect(() => {
    const root = document.documentElement
    if (theme === 'system') {
      root.removeAttribute('data-theme')
    } else {
      root.setAttribute('data-theme', theme)
    }
    localStorage.setItem('theme', theme)
  }, [theme])

  function cycleTheme() {
    setTheme(t => t === 'system' ? 'light' : t === 'light' ? 'dark' : 'system')
  }

  const themeLabel = theme === 'system' ? '🖥 Auto' : theme === 'light' ? '☀ Light' : '🌙 Dark'
  const { user, signOutUser } = useAuth()

  return (
    <div className={`layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      {/* Top Bar */}
      <header className="topbar">
        <button
          className="sidebar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          aria-label="Toggle sidebar"
        >
          <span /><span /><span />
        </button>
        <span className="topbar-brand">Best App Ever</span>
        <div className="topbar-actions">
          <button className="topbar-btn theme-toggle" onClick={cycleTheme}>{themeLabel}</button>
          {user && <button className="topbar-btn" onClick={signOutUser}>Sign out</button>}
        </div>
      </header>

      {/* Sidebar */}
      <nav className="sidebar">
        <ul>
          <li><NavLink to="/home" end>Home</NavLink></li>
          {user && <>
            <li><NavLink to="/foodIdeas">What to Eat?</NavLink></li>
            <li><NavLink to="/bday">Birthday girl click here</NavLink></li>
          </>}
        </ul>
        <div className="sidebar-version">v{version}</div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
