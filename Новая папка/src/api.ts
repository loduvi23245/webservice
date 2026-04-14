import type { Car, CarCreate, DaySlots, ServiceType, Appointment, Promotion, UserProfile } from './types'

const BASE = import.meta.env.VITE_API_URL || ''

function getInitData(): string {
  return window.Telegram?.WebApp?.initData || 'debug'
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Telegram-Init-Data': getInitData(),
      ...options.headers,
    },
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: 'Request failed' }))
    throw new Error(err.detail || 'Request failed')
  }
  if (res.status === 204) return undefined as T
  return res.json()
}

// Cars
export const getCars = () => request<Car[]>('/api/cars/')
export const createCar = (data: CarCreate) =>
  request<Car>('/api/cars/', { method: 'POST', body: JSON.stringify(data) })
export const updateCar = (id: number, data: Partial<CarCreate>) =>
  request<Car>(`/api/cars/${id}`, { method: 'PUT', body: JSON.stringify(data) })
export const deleteCar = (id: number) =>
  request<void>(`/api/cars/${id}`, { method: 'DELETE' })

// Appointments
export const getServices = () => request<ServiceType[]>('/api/appointments/services')
export const getWeeklySlots = () => request<DaySlots[]>('/api/appointments/slots')
export const createAppointment = (data: { car_id: number; service_type_id: number; slot_id: number; notes?: string }) =>
  request<Appointment>('/api/appointments/', { method: 'POST', body: JSON.stringify(data) })
export const cancelAppointment = (id: number) =>
  request<void>(`/api/appointments/${id}`, { method: 'DELETE' })

// History
export const getHistory = (carId?: number) =>
  request<Appointment[]>(`/api/history/${carId ? `?car_id=${carId}` : ''}`)

// Promotions & Profile
export const getPromotions = () => request<Promotion[]>('/api/promotions/')
export const getProfile = () => request<UserProfile>('/api/promotions/profile')
