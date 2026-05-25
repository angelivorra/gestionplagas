'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SaveIcon from '@mui/icons-material/Save'
import Alert from '@mui/material/Alert'
import type { Cliente } from '@/lib/types'

export default function ClienteForm({ cliente }: { cliente?: Cliente }) {
  const router = useRouter()
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [form, setForm] = useState({
    nombre_comercial: cliente?.nombre_comercial ?? '',
    nombre: cliente?.nombre ?? '',
    dni: cliente?.dni ?? '',
    direccion: cliente?.direccion ?? '',
    correo_electronico: cliente?.correo_electronico ?? '',
    observaciones: cliente?.observaciones ?? '',
    fecha_inicio_contrato: cliente?.fecha_inicio_contrato ?? '',
    fecha_vencimiento_contrato: cliente?.fecha_vencimiento_contrato ?? '',
    importe_contrato: cliente?.importe_contrato?.toString() ?? '',
    importe_actuacion_requerimiento: cliente?.importe_actuacion_requerimiento?.toString() ?? '',
    actuacion_texto: cliente?.actuacion_texto ?? '',
    importe_traslado: cliente?.importe_traslado?.toString() ?? '',
  })

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const payload = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v || null]))
    payload.nombre_comercial = form.nombre_comercial

    if (cliente) {
      const res = await fetch(`/api/clientes/${cliente.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const result = await res.json()
      if (result.error) { setSaveError(result.error); setSaving(false); return }
      router.push(`/clientes/${cliente.id}`)
    } else {
      const res = await fetch('/api/clientes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      const { data, error } = await res.json()
      if (error) { setSaveError(error); setSaving(false); return }
      if (data) router.push(`/clientes/${data.id}`)
    }
    router.refresh()
    setSaving(false)
  }

  return (
    <Box component="form" onSubmit={handleSubmit}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
        <IconButton component={Link} href={cliente ? `/clientes/${cliente.id}` : '/clientes'} size="small">
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h6">{cliente ? 'Editar cliente' : 'Nuevo cliente'}</Typography>
      </Box>

      {saveError && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setSaveError(null)}>{saveError}</Alert>}

      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '20px !important' }}>
          <TextField
            required
            label="Nombre comercial"
            fullWidth
            value={form.nombre_comercial}
            onChange={e => update('nombre_comercial', e.target.value)}
            placeholder="Bar Central, Comunidad Mayor 12..."
          />
          <TextField label="Nombre contacto" fullWidth value={form.nombre} onChange={e => update('nombre', e.target.value)} placeholder="Juan García López" />
          <TextField label="DNI / NIF" fullWidth value={form.dni} onChange={e => update('dni', e.target.value)} placeholder="12345678A" />
          <TextField label="Dirección" fullWidth value={form.direccion} onChange={e => update('direccion', e.target.value)} placeholder="C/ Mayor, 49, 30150 La Alberca" />
          <TextField type="email" label="Correo electrónico" fullWidth value={form.correo_electronico} onChange={e => update('correo_electronico', e.target.value)} placeholder="cliente@ejemplo.com" />
          <TextField
            label="Observaciones"
            fullWidth
            multiline
            rows={3}
            value={form.observaciones}
            onChange={e => update('observaciones', e.target.value)}
            placeholder="Notas sobre el cliente, acceso al local..."
          />
        </CardContent>
      </Card>

      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '20px !important' }}>
          <Typography variant="subtitle2" color="text.secondary">Contrato</Typography>
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              type="date"
              label="Inicio contrato"
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              value={form.fecha_inicio_contrato}
              onChange={e => update('fecha_inicio_contrato', e.target.value)}
            />
            <TextField
              type="date"
              label="Vencimiento contrato"
              fullWidth
              slotProps={{ inputLabel: { shrink: true } }}
              value={form.fecha_vencimiento_contrato}
              onChange={e => update('fecha_vencimiento_contrato', e.target.value)}
            />
          </Box>
          <TextField
            type="number"
            label="Importe contrato (€)"
            fullWidth
            slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
            value={form.importe_contrato}
            onChange={e => update('importe_contrato', e.target.value)}
            placeholder="0.00"
          />
          <TextField
            type="number"
            label="Importe actuación requerimiento (€)"
            fullWidth
            slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
            value={form.importe_actuacion_requerimiento}
            onChange={e => update('importe_actuacion_requerimiento', e.target.value)}
            placeholder="0.00"
          />
          <TextField
            label="Actuación (texto libre)"
            fullWidth
            multiline
            rows={2}
            value={form.actuacion_texto}
            onChange={e => update('actuacion_texto', e.target.value)}
            placeholder="Descripción de la actuación contratada..."
          />
          <TextField
            type="number"
            label="Importe traslado (€)"
            fullWidth
            slotProps={{ htmlInput: { min: 0, step: '0.01' } }}
            value={form.importe_traslado}
            onChange={e => update('importe_traslado', e.target.value)}
            placeholder="0.00"
          />
        </CardContent>
      </Card>

      <Button
        type="submit"
        variant="contained"
        fullWidth
        size="large"
        disabled={saving}
        startIcon={<SaveIcon />}
      >
        {saving ? 'Guardando...' : cliente ? 'Guardar cambios' : 'Crear cliente'}
      </Button>
    </Box>
  )
}
