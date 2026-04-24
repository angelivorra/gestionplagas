'use client'

import { useState } from 'react'
import Button from '@mui/material/Button'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'

interface Props {
  latitud: number | null
  longitud: number | null
  direccionGeo: string | null
  onCapture: (lat: number, lon: number, dir: string | null) => void
  disabled?: boolean
}

export default function GeolocalizacionBtn({ latitud, longitud, direccionGeo, onCapture, disabled }: Props) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  function capturar() {
    if (!navigator.geolocation) { setError('Tu dispositivo no soporta geolocalización'); return }
    setLoading(true)
    setError(null)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude
        const lon = pos.coords.longitude
        let dir: string | null = null
        try {
          const res = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`)
          const json = await res.json()
          dir = json.display_name ?? null
        } catch {}
        onCapture(lat, lon, dir)
        setLoading(false)
      },
      (err) => {
        setLoading(false)
        setError(err.code === 1 ? 'Permisos de ubicación denegados' : 'No se pudo obtener la ubicación')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  const mapsUrl = latitud && longitud ? `https://www.google.com/maps?q=${latitud},${longitud}` : null

  if (latitud && longitud) {
    return (
      <Box sx={{ bgcolor: '#f0fdf4', border: '1px solid', borderColor: '#86efac', borderRadius: 3, p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'primary.dark' }}>
            <LocationOnIcon fontSize="small" />
            <Typography variant="body2" sx={{ fontWeight: 600 }}>Ubicación capturada</Typography>
          </Box>
          <Button
            href={mapsUrl!}
            target="_blank"
            rel="noopener noreferrer"
            size="small"
            endIcon={<OpenInNewIcon sx={{ fontSize: '12px !important' }} />}
            sx={{ fontSize: 11, color: 'primary.main', minWidth: 0, p: 0.5 }}
          >
            Ver Maps
          </Button>
        </Box>
        {direccionGeo && (
          <Typography variant="caption" color="primary.dark" sx={{ display: 'block', mb: 0.5, lineClamp: 2 }}>
            {direccionGeo}
          </Typography>
        )}
        <Typography variant="caption" sx={{ fontFamily: 'monospace', color: 'primary.main' }}>
          {latitud.toFixed(6)}, {longitud.toFixed(6)}
        </Typography>
        {!disabled && (
          <Button size="small" onClick={capturar} sx={{ display: 'block', fontSize: 11, mt: 0.5, p: 0, color: 'primary.main' }}>
            Actualizar ubicación
          </Button>
        )}
      </Box>
    )
  }

  return (
    <Box>
      <Button
        variant="outlined"
        fullWidth
        onClick={capturar}
        disabled={loading || disabled}
        startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <LocationOnIcon />}
      >
        {loading ? 'Obteniendo ubicación...' : 'Capturar ubicación actual'}
      </Button>
      {error && <Typography variant="caption" color="error" sx={{ mt: 0.5, display: 'block' }}>{error}</Typography>}
    </Box>
  )
}
