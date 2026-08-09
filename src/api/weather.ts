import { apiFetch } from './client'

export interface WeatherData {
  temp: number
  condition: string
  description: string
  humidity: number
}

export function getCurrentWeather(lat: number, lon: number) {
  return apiFetch<WeatherData>(`/weather/current?lat=${lat}&lon=${lon}`)
}