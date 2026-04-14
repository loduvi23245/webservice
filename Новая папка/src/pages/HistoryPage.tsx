import { useState, useEffect } from 'react'
import type { Appointment, Car } from '../types'
import { getHistory, getCars, cancelAppointment } from '../api'

const STATUS_LABELS: Record<string, string> = {
  booked: 'Записан',
  confirmed: 'Подтверждён',
  completed: 'Завершён',
  cancelled: 'Отменён',
}

const MONTH_NAMES = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']

export default function HistoryPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [cars, setCars] = useState<Car[]>([])
  const [filterCarId, setFilterCarId] = useState<number | undefined>()
  const [loading, setLoading] = useState(true)
  const [expandedId, setExpandedId] = useState<number | null>(null)

  const load = (carId?: number) => {
    setLoading(true)
    getHistory(carId).then(setAppointments).finally(() => setLoading(false))
  }

  useEffect(() => {
    Promise.all([getHistory(), getCars()]).then(([h, c]) => {
      setAppointments(h)
      setCars(c)
    }).finally(() => setLoading(false))
  }, [])

  const handleFilter = (carId?: number) => {
    setFilterCarId(carId)
    load(carId)
  }

  const handleCancel = (apt: Appointment) => {
    window.Telegram?.WebApp?.showConfirm(
      'Отменить запись?',
      async (ok) => {
        if (ok) {
          await cancelAppointment(apt.id)
          load(filterCarId)
        }
      }
    )
  }

  if (loading) return <div className="loading">Загрузка...</div>

  return (
    <div className="page">
      <h1 className="page-title">История визитов</h1>

      {/* Filter by car */}
      {cars.length > 1 && (
        <div className="filter-row">
          <button
            className={`filter-pill ${filterCarId === undefined ? 'active' : ''}`}
            onClick={() => handleFilter(undefined)}
          >
            Все
          </button>
          {cars.map((car) => (
            <button
              key={car.id}
              className={`filter-pill ${filterCarId === car.id ? 'active' : ''}`}
              onClick={() => handleFilter(car.id)}
            >
              {car.brand} {car.model}
            </button>
          ))}
        </div>
      )}

      {appointments.length === 0 ? (
        <div className="empty">
          <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
          <div>Нет записей</div>
          <p className="card-subtitle" style={{ marginTop: 8 }}>
            Запишитесь на сервис во вкладке «Запись»
          </p>
        </div>
      ) : (
        appointments.map((apt) => (
          <div key={apt.id} className="card" onClick={() => setExpandedId(expandedId === apt.id ? null : apt.id)}>
            <div className="card-row">
              <div className="card-title">{apt.service_type.name}</div>
              <span className={`badge badge-${apt.status}`}>
                {STATUS_LABELS[apt.status] || apt.status}
              </span>
            </div>
            <div className="card-subtitle">
              {formatDate(apt.slot.date)} в {apt.slot.time.slice(0, 5)} • {apt.car.brand} {apt.car.model}
            </div>
            <div className="card-subtitle" style={{ marginTop: 4 }}>
              {apt.service_type.base_price.toLocaleString()} ₽
            </div>

            {/* Expanded details */}
            {expandedId === apt.id && (
              <div className="detail-section">
                {apt.details ? (
                  <>
                    {apt.details.work_description && (
                      <div className="detail-row">
                        <span className="detail-label">Работы:</span>
                        <span>{apt.details.work_description}</span>
                      </div>
                    )}
                    {apt.details.parts_used && (
                      <div className="detail-row">
                        <span className="detail-label">Запчасти:</span>
                        <span>{apt.details.parts_used}</span>
                      </div>
                    )}
                    {apt.details.final_price != null && (
                      <div className="detail-row">
                        <span className="detail-label">Итого:</span>
                        <span style={{ fontWeight: 700 }}>{apt.details.final_price.toLocaleString()} ₽</span>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="card-subtitle">Детали пока не добавлены</div>
                )}

                {apt.status === 'booked' && (
                  <button
                    className="btn btn-danger btn-small"
                    style={{ marginTop: 10 }}
                    onClick={(e) => { e.stopPropagation(); handleCancel(apt) }}
                  >
                    Отменить запись
                  </button>
                )}
              </div>
            )}
          </div>
        ))
      )}
    </div>
  )
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`
}
