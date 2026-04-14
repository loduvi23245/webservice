export interface Car {
  id: number
  brand: string
  model: string
  year: number | null
  plate_number: string | null
  vin: string | null
}

export interface CarCreate {
  brand: string
  model: string
  year?: number | null
  plate_number?: string | null
  vin?: string | null
}

export interface ServiceType {
  id: number
  name: string
  duration_minutes: number
  base_price: number
  description: string | null
}

export interface TimeSlot {
  id: number
  date: string
  time: string
  is_available: boolean
}

export interface DaySlots {
  date: string
  slots: TimeSlot[]
  available_count: number
}

export interface Appointment {
  id: number
  status: string
  notes: string | null
  created_at: string
  car: Car
  service_type: ServiceType
  slot: TimeSlot
  details: VisitDetail | null
}

export interface VisitDetail {
  work_description: string | null
  parts_used: string | null
  final_price: number | null
}

export interface Promotion {
  id: number
  title: string
  description: string | null
  discount_percent: number | null
  valid_from: string | null
  valid_until: string | null
  image_url: string | null
}

export interface UserProfile {
  id: number
  telegram_id: number
  username: string | null
  first_name: string | null
  last_name: string | null
  discount_percent: number
}
