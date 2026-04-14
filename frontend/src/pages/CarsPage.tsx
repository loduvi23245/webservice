import { useState, useEffect } from 'react'
import type { Car, CarCreate } from '../types'
import { getCars, createCar, updateCar, deleteCar } from '../api'

export default function CarsPage() {
  const [cars, setCars] = useState<Car[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingCar, setEditingCar] = useState<Car | null>(null)
  const [form, setForm] = useState<CarCreate>({ brand: '', model: '' })

  const load = () => {
    setLoading(true)
    getCars().then(setCars).finally(() => setLoading(false))
  }

  useEffect(() => { load() }, [])

  const openAdd = () => {
    setEditingCar(null)
    setForm({ brand: '', model: '', year: null, plate_number: '', vin: '' })
    setShowForm(true)
  }

  const openEdit = (car: Car) => {
    setEditingCar(car)
    setForm({
      brand: car.brand,
      model: car.model,
      year: car.year,
      plate_number: car.plate_number || '',
      vin: car.vin || '',
    })
    setShowForm(true)
  }

  const handleSave = async () => {
    if (!form.brand.trim() || !form.model.trim()) return

    const data: CarCreate = {
      brand: form.brand.trim(),
      model: form.model.trim(),
      year: form.year || null,
      plate_number: form.plate_number?.trim() || null,
      vin: form.vin?.trim() || null,
    }

    try {
      if (editingCar) {
        await updateCar(editingCar.id, data)
      } else {
        await createCar(data)
      }
      setShowForm(false)
      load()
      window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred('success')
    } catch {
      window.Telegram?.WebApp?.showAlert('Ошибка сохранения')
    }
  }

  const handleDelete = (car: Car) => {
    window.Telegram?.WebApp?.showConfirm(
      `Удалить ${car.brand} ${car.model}?`,
      async (ok) => {
        if (ok) {
          await deleteCar(car.id)
          load()
        }
      }
    )
  }

  if (loading) return <div className="loading">Загрузка...</div>

  return (
    <div className="page">
      <h1 className="page-title">Мои авто</h1>

      {cars.length === 0 && !showForm && (
        <div className="empty">
          <div style={{ fontSize: 48, marginBottom: 12 }}>🚗</div>
          <div>Нет сохранённых автомобилей</div>
          <p className="card-subtitle" style={{ marginTop: 8 }}>
            Добавьте авто, чтобы не вводить данные каждый раз
          </p>
        </div>
      )}

      {cars.map((car) => (
        <div key={car.id} className="card">
          <div className="card-title">{car.brand} {car.model}</div>
          <div className="card-subtitle">
            {car.year && `${car.year} г. `}
            {car.plate_number && `• ${car.plate_number} `}
            {car.vin && `• VIN: ${car.vin}`}
          </div>
          <div className="action-row">
            <button className="btn btn-secondary btn-small" onClick={() => openEdit(car)}>
              Изменить
            </button>
            <button className="btn btn-danger btn-small" onClick={() => handleDelete(car)}>
              Удалить
            </button>
          </div>
        </div>
      ))}

      {!showForm && (
        <button className="btn" onClick={openAdd} style={{ marginTop: 12 }}>
          + Добавить автомобиль
        </button>
      )}

      {/* Modal Form */}
      {showForm && (
        <div className="modal-overlay" onClick={() => setShowForm(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-title">
              {editingCar ? 'Редактировать авто' : 'Новый автомобиль'}
            </div>

            <div className="form-group">
              <label className="form-label">Марка *</label>
              <input
                className="form-input"
                placeholder="Toyota"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Модель *</label>
              <input
                className="form-input"
                placeholder="Camry"
                value={form.model}
                onChange={(e) => setForm({ ...form, model: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Год выпуска</label>
              <input
                className="form-input"
                type="number"
                placeholder="2020"
                value={form.year || ''}
                onChange={(e) => setForm({ ...form, year: e.target.value ? parseInt(e.target.value) : null })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Госномер</label>
              <input
                className="form-input"
                placeholder="А000АА777"
                value={form.plate_number || ''}
                onChange={(e) => setForm({ ...form, plate_number: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">VIN</label>
              <input
                className="form-input"
                placeholder="JTDKN3DU5A0..."
                maxLength={17}
                value={form.vin || ''}
                onChange={(e) => setForm({ ...form, vin: e.target.value })}
              />
            </div>

            <div className="action-row">
              <button className="btn btn-secondary" onClick={() => setShowForm(false)} style={{ flex: 1 }}>
                Отмена
              </button>
              <button
                className="btn"
                onClick={handleSave}
                disabled={!form.brand.trim() || !form.model.trim()}
                style={{ flex: 2 }}
              >
                Сохранить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
