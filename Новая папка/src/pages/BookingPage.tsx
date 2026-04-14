import { useState, useEffect } from 'react'
import type { DaySlots, ServiceType, TimeSlot, Car } from '../types'
import { getWeeklySlots, getServices, getCars, createAppointment } from '../api'

const DAY_NAMES = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб']
const MONTH_NAMES = ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек']

export default function BookingPage() {
  const [step, setStep] = useState(0) // 0: service, 1: calendar+time, 2: car, 3: confirm
  const [days, setDays] = useState<DaySlots[]>([])
  const [services, setServices] = useState<ServiceType[]>([])
  const [cars, setCars] = useState<Car[]>([])
  const [selectedService, setSelectedService] = useState<ServiceType | null>(null)
  const [selectedDay, setSelectedDay] = useState<DaySlots | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null)
  const [selectedCar, setSelectedCar] = useState<Car | null>(null)
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    Promise.all([getServices(), getWeeklySlots(), getCars()])
      .then(([s, d, c]) => {
        setServices(s)
        setDays(d)
        setCars(c)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSubmit = async () => {
    if (!selectedCar || !selectedService || !selectedSlot) return
    setSubmitting(true)
    try {
      await createAppointment({
        car_id: selectedCar.id,
        service_type_id: selectedService.id,
        slot_id: selectedSlot.id,
        notes: notes || undefined,
      })
      setSuccess(true)
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success')
    } catch {
      window.Telegram?.WebApp?.showAlert('Не удалось записаться. Попробуйте снова.')
    } finally {
      setSubmitting(false)
    }
  }

  const reset = () => {
    setStep(0)
    setSelectedService(null)
    setSelectedDay(null)
    setSelectedSlot(null)
    setSelectedCar(null)
    setNotes('')
    setSuccess(false)
    setLoading(true)
    Promise.all([getWeeklySlots(), getCars()])
      .then(([d, c]) => { setDays(d); setCars(c) })
      .finally(() => setLoading(false))
  }

  if (loading) return <div className="loading">Загрузка...</div>

  if (success) {
    return (
      <div className="page" style={{ textAlign: 'center', paddingTop: 60 }}>
        <div style={{ fontSize: 64, marginBottom: 16 }}>✓</div>
        <h2 style={{ marginBottom: 8 }}>Вы записаны!</h2>
        <p className="card-subtitle" style={{ marginBottom: 24 }}>
          {selectedService?.name} — {formatDate(selectedSlot!.date)} в {selectedSlot!.time.slice(0, 5)}
        </p>
        <p className="card-subtitle" style={{ marginBottom: 24 }}>
          {selectedCar?.brand} {selectedCar?.model} {selectedCar?.plate_number && `(${selectedCar.plate_number})`}
        </p>
        <button className="btn" onClick={reset}>Новая запись</button>
      </div>
    )
  }

  return (
    <div className="page">
      <h1 className="page-title">Запись на сервис</h1>

      {/* Steps indicator */}
      <div className="steps">
        {[0, 1, 2, 3].map((s) => (
          <div key={s} className={`step ${s <= step ? 'active' : ''}`} />
        ))}
      </div>

      {/* Step 0: Choose service */}
      {step === 0 && (
        <>
          <div className="section-title">Выберите услугу</div>
          <div className="service-list">
            {services.map((svc) => (
              <div
                key={svc.id}
                className={`service-item ${selectedService?.id === svc.id ? 'selected' : ''}`}
                onClick={() => setSelectedService(svc)}
              >
                <div>
                  <div className="service-name">{svc.name}</div>
                  {svc.description && <div className="service-desc">{svc.description}</div>}
                </div>
                <div className="service-price">{svc.base_price.toLocaleString()} ₽</div>
              </div>
            ))}
          </div>
          <button
            className="btn"
            disabled={!selectedService}
            onClick={() => setStep(1)}
          >
            Далее
          </button>
        </>
      )}

      {/* Step 1: Choose date & time */}
      {step === 1 && (
        <>
          <div className="section-title">Выберите дату</div>
          <div className="calendar">
            {days.map((day) => {
              const d = new Date(day.date)
              const noSlots = day.available_count === 0
              return (
                <div
                  key={day.date}
                  className={`day-card ${selectedDay?.date === day.date ? 'selected' : ''} ${noSlots ? 'no-slots' : ''}`}
                  onClick={() => {
                    if (!noSlots) {
                      setSelectedDay(day)
                      setSelectedSlot(null)
                    }
                  }}
                >
                  <div className="day-name">{DAY_NAMES[d.getDay()]}</div>
                  <div className="day-number">{d.getDate()}</div>
                  <div className="day-slots-count">
                    {noSlots ? '—' : `${day.available_count} сл.`}
                  </div>
                </div>
              )
            })}
          </div>

          {selectedDay && (
            <>
              <div className="section-title">
                Время на {formatDate(selectedDay.date)}
              </div>
              <div className="slots-grid">
                {selectedDay.slots.map((slot) => (
                  <button
                    key={slot.id}
                    className={`slot-btn ${slot.is_available ? 'available' : 'taken'} ${selectedSlot?.id === slot.id ? 'selected' : ''}`}
                    onClick={() => slot.is_available && setSelectedSlot(slot)}
                    disabled={!slot.is_available}
                  >
                    {slot.time.slice(0, 5)}
                  </button>
                ))}
              </div>
            </>
          )}

          <div className="action-row">
            <button className="btn btn-secondary" onClick={() => setStep(0)} style={{ flex: 1 }}>
              Назад
            </button>
            <button
              className="btn"
              disabled={!selectedSlot}
              onClick={() => setStep(2)}
              style={{ flex: 2 }}
            >
              Далее
            </button>
          </div>
        </>
      )}

      {/* Step 2: Choose car */}
      {step === 2 && (
        <>
          <div className="section-title">Выберите автомобиль</div>
          {cars.length === 0 ? (
            <div className="empty">
              <div>Нет сохранённых авто</div>
              <p className="card-subtitle" style={{ marginTop: 8 }}>
                Добавьте автомобиль во вкладке «Авто»
              </p>
            </div>
          ) : (
            <div className="service-list">
              {cars.map((car) => (
                <div
                  key={car.id}
                  className={`service-item ${selectedCar?.id === car.id ? 'selected' : ''}`}
                  onClick={() => setSelectedCar(car)}
                >
                  <div>
                    <div className="service-name">{car.brand} {car.model}</div>
                    <div className="service-desc">
                      {car.year && `${car.year} г.`} {car.plate_number && `• ${car.plate_number}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="action-row">
            <button className="btn btn-secondary" onClick={() => setStep(1)} style={{ flex: 1 }}>
              Назад
            </button>
            <button
              className="btn"
              disabled={!selectedCar}
              onClick={() => setStep(3)}
              style={{ flex: 2 }}
            >
              Далее
            </button>
          </div>
        </>
      )}

      {/* Step 3: Confirm */}
      {step === 3 && (
        <>
          <div className="section-title">Подтверждение</div>
          <div className="card">
            <div className="card-title">{selectedService?.name}</div>
            <div className="card-subtitle">{selectedService?.base_price.toLocaleString()} ₽</div>
          </div>
          <div className="card">
            <div className="card-title">{formatDate(selectedSlot!.date)} в {selectedSlot!.time.slice(0, 5)}</div>
          </div>
          <div className="card">
            <div className="card-title">{selectedCar?.brand} {selectedCar?.model}</div>
            <div className="card-subtitle">
              {selectedCar?.plate_number} {selectedCar?.year && `• ${selectedCar.year} г.`}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Комментарий (необязательно)</label>
            <input
              className="form-input"
              placeholder="Например, стук при повороте..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="action-row">
            <button className="btn btn-secondary" onClick={() => setStep(2)} style={{ flex: 1 }}>
              Назад
            </button>
            <button
              className="btn"
              onClick={handleSubmit}
              disabled={submitting}
              style={{ flex: 2 }}
            >
              {submitting ? 'Записываем...' : 'Записаться'}
            </button>
          </div>
        </>
      )}
    </div>
  )
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getDate()} ${MONTH_NAMES[d.getMonth()]}`
}
