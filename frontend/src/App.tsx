import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import BookingPage from './pages/BookingPage'
import CarsPage from './pages/CarsPage'
import HistoryPage from './pages/HistoryPage'
import PromosPage from './pages/PromosPage'

const tabs = [
  { path: '/', label: 'Запись', icon: <CalendarIcon /> },
  { path: '/cars', label: 'Авто', icon: <CarIcon /> },
  { path: '/history', label: 'История', icon: <HistoryIcon /> },
  { path: '/promos', label: 'Акции', icon: <PromoIcon /> },
]

export default function App() {
  const navigate = useNavigate()
  const { pathname } = useLocation()

  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<BookingPage />} />
        <Route path="/cars" element={<CarsPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/promos" element={<PromosPage />} />
      </Routes>

      <nav className="nav">
        {tabs.map((tab) => (
          <button
            key={tab.path}
            className={`nav-item ${pathname === tab.path ? 'active' : ''}`}
            onClick={() => navigate(tab.path)}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>
    </div>
  )
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function CarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 17h14M5 17a2 2 0 01-2-2V9a2 2 0 012-2h1l2-3h8l2 3h1a2 2 0 012 2v6a2 2 0 01-2 2M5 17v2m14-2v2" />
      <circle cx="7.5" cy="14" r="1.5" />
      <circle cx="16.5" cy="14" r="1.5" />
    </svg>
  )
}

function HistoryIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12,6 12,12 16,14" />
    </svg>
  )
}

function PromoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
    </svg>
  )
}
