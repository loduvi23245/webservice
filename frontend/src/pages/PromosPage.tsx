import { useState, useEffect } from 'react'
import type { Promotion, UserProfile } from '../types'
import { getPromotions, getProfile } from '../api'

export default function PromosPage() {
  const [promos, setPromos] = useState<Promotion[]>([])
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getPromotions(), getProfile()])
      .then(([p, u]) => { setPromos(p); setProfile(u) })
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <div className="loading">Загрузка...</div>

  return (
    <div className="page">
      <h1 className="page-title">Акции</h1>

      {/* Personal discount banner */}
      {profile && profile.discount_percent > 0 && (
        <div className="discount-banner">
          <div className="discount-value">-{profile.discount_percent}%</div>
          <div>
            <div style={{ fontWeight: 600 }}>Ваша персональная скидка</div>
            <div style={{ fontSize: 13, opacity: 0.85 }}>
              Применяется ко всем услугам автоматически
            </div>
          </div>
        </div>
      )}

      {promos.length === 0 ? (
        <div className="empty">
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎁</div>
          <div>Нет активных акций</div>
          <p className="card-subtitle" style={{ marginTop: 8 }}>
            Следите за обновлениями — скоро появятся новые предложения
          </p>
        </div>
      ) : (
        promos.map((promo) => (
          <div key={promo.id} className="promo-card">
            <div className="card-title">{promo.title}</div>
            {promo.description && (
              <div className="card-subtitle">{promo.description}</div>
            )}
            {promo.discount_percent && (
              <div className="promo-discount">-{promo.discount_percent}%</div>
            )}
          </div>
        ))
      )}
    </div>
  )
}
