"use client"

import { useState, useCallback } from "react"

export interface Location {
  latitude: number
  longitude: number
}

export function useLocation() {
  const [location, setLocation] = useState<Location | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getLocation = useCallback(async () => {
    setLoading(true)
    setError(null)

    if (!navigator.geolocation) {
      setError("Geolocation tidak tersedia di browser ini")
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
        setLoading(false)
      },
      (err) => {
        setError(err.message)
        setLoading(false)
      },
    )
  }, [])

  return { location, loading, error, getLocation }
}
