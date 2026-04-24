'use client'

import { useState, useEffect, useRef } from 'react'
import Box from '@mui/material/Box'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CircularProgress from '@mui/material/CircularProgress'
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera'
import CloseIcon from '@mui/icons-material/Close'
import type { VisitaFoto } from '@/lib/types'

interface Props {
  visitaId: string
  disabled?: boolean
}

export default function FotosGrid({ visitaId, disabled }: Props) {
  const [fotos, setFotos] = useState<VisitaFoto[]>([])
  const [uploading, setUploading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetch(`/api/visitas/${visitaId}/fotos`)
      .then(r => r.json())
      .then(({ data }) => setFotos(data ?? []))
  }, [visitaId])

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files ?? [])
    if (!files.length) return
    setUploading(true)
    for (const file of files) {
      const formData = new FormData()
      formData.append('foto', file)
      const res = await fetch(`/api/visitas/${visitaId}/fotos`, { method: 'POST', body: formData })
      const { data } = await res.json()
      if (data) setFotos(prev => [...prev, data])
    }
    setUploading(false)
    if (inputRef.current) inputRef.current.value = ''
  }

  async function handleDelete(foto: VisitaFoto) {
    await fetch(`/api/visitas/${visitaId}/fotos?fotoId=${foto.id}`, { method: 'DELETE' })
    setFotos(prev => prev.filter(f => f.id !== foto.id))
  }

  return (
    <Box>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
        {fotos.map(foto => (
          <Box
            key={foto.id}
            sx={{ position: 'relative', aspectRatio: '1', borderRadius: 2, overflow: 'hidden', bgcolor: 'grey.100' }}
          >
            <img src={foto.foto_url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            {!disabled && (
              <IconButton
                size="small"
                onClick={() => handleDelete(foto)}
                sx={{
                  position: 'absolute', top: 4, right: 4,
                  bgcolor: 'rgba(0,0,0,0.55)', color: 'white',
                  width: 24, height: 24,
                  '&:hover': { bgcolor: 'rgba(0,0,0,0.75)' },
                }}
              >
                <CloseIcon sx={{ fontSize: 14 }} />
              </IconButton>
            )}
          </Box>
        ))}

        {!disabled && (
          <Box
            component="button"
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            sx={{
              aspectRatio: '1', borderRadius: 2,
              border: '2px dashed', borderColor: 'divider',
              bgcolor: 'transparent', cursor: 'pointer',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: 0.5,
              color: 'text.disabled',
              transition: 'border-color 0.2s, color 0.2s',
              '&:hover': { borderColor: 'primary.main', color: 'primary.main' },
            }}
          >
            {uploading ? (
              <CircularProgress size={20} />
            ) : (
              <>
                <PhotoCameraIcon />
                <Typography variant="caption">Añadir</Typography>
              </>
            )}
          </Box>
        )}
      </Box>

      {fotos.length === 0 && disabled && (
        <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
          Sin fotos
        </Typography>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        capture="environment"
        multiple
        style={{ display: 'none' }}
        onChange={handleFile}
      />
    </Box>
  )
}
