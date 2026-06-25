'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import TextField from '@mui/material/TextField'
import MenuItem from '@mui/material/MenuItem'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Autocomplete from '@mui/material/Autocomplete'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import SaveIcon from '@mui/icons-material/Save'
import AddIcon from '@mui/icons-material/Add'
import DeleteIcon from '@mui/icons-material/Delete'
import Alert from '@mui/material/Alert'
import type { Cliente, Producto, ProductoCertificado } from '@/lib/types'

const MAX_PRODUCTOS = 5

function ProductoSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const [productos, setProductos] = useState<Producto[]>([])
  const [loaded, setLoaded] = useState(false)

  if (!loaded) {
    fetch('/api/productos').then(r => r.json()).then(({ data }) => { setProductos(data ?? []); setLoaded(true) })
  }

  const selected = productos.find(p => p.id === value) ?? null

  return (
    <Autocomplete
      options={productos}
      getOptionLabel={p => p.nombre_comercial}
      value={selected}
      onChange={(_, p) => onChange(p?.id ?? '')}
      noOptionsText="Sin productos"
      renderInput={params => <TextField {...params} placeholder="Buscar producto..." size="small" />}
      renderOption={(props, p) => (
        <li {...props} key={p.id}>
          <Box>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>{p.nombre_comercial}</Typography>
            {p.numero_registro && <Typography variant="caption" color="text.secondary">Reg. {p.numero_registro}</Typography>}
          </Box>
        </li>
      )}
    />
  )
}

function newProductoCertificado(): ProductoCertificado {
  return { id: crypto.randomUUID(), producto_id: '', cantidad: '', vector_diana: '' }
}

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
    periodicidad: cliente?.periodicidad ?? '',
    importe_contrato: cliente?.importe_contrato?.toString() ?? '',
    importe_actuacion_requerimiento: cliente?.importe_actuacion_requerimiento?.toString() ?? '',
    actuacion_texto: cliente?.actuacion_texto ?? '',
    importe_traslado: cliente?.importe_traslado?.toString() ?? '',
  })
  const [productos, setProductos] = useState<ProductoCertificado[]>(cliente?.productos_certificado ?? [])

  function update(field: string, value: string) {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  function addProducto() {
    setProductos(prev => prev.length < MAX_PRODUCTOS ? [...prev, newProductoCertificado()] : prev)
  }
  function updateProducto(id: string, patch: Partial<ProductoCertificado>) {
    setProductos(prev => prev.map(p => p.id === id ? { ...p, ...patch } : p))
  }
  function removeProducto(id: string) {
    setProductos(prev => prev.filter(p => p.id !== id))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    const payload: Record<string, unknown> = Object.fromEntries(Object.entries(form).map(([k, v]) => [k, v || null]))
    payload.nombre_comercial = form.nombre_comercial
    payload.productos_certificado = productos.filter(p => p.producto_id)

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
            select
            label="Periodicidad"
            fullWidth
            value={form.periodicidad}
            onChange={e => update('periodicidad', e.target.value)}
          >
            <MenuItem value="">Sin especificar</MenuItem>
            <MenuItem value="Semestral">Semestral</MenuItem>
            <MenuItem value="Cuatrimestral">Cuatrimestral</MenuItem>
            <MenuItem value="Trimestral">Trimestral</MenuItem>
            <MenuItem value="Bimestral">Bimestral</MenuItem>
            <MenuItem value="Mensual">Mensual</MenuItem>
          </TextField>
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

      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '20px !important' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="subtitle2" color="text.secondary">Productos (certificado)</Typography>
            <Typography variant="caption" color="text.disabled">{productos.length}/{MAX_PRODUCTOS}</Typography>
          </Box>

          {productos.length === 0 && (
            <Typography variant="body2" color="text.disabled">Sin productos. Añade hasta {MAX_PRODUCTOS}.</Typography>
          )}

          {productos.map((p, i) => (
            <Box key={p.id} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5, p: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: 10 }}>
                  Producto {i + 1}
                </Typography>
                <IconButton size="small" onClick={() => removeProducto(p.id)} sx={{ color: 'error.light' }}>
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </Box>
              <ProductoSelect value={p.producto_id} onChange={producto_id => updateProducto(p.id, { producto_id })} />
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mt: 1.5 }}>
                <TextField size="small" label="Cantidad" placeholder="Ej: 250 ml" value={p.cantidad} onChange={e => updateProducto(p.id, { cantidad: e.target.value })} />
                <TextField size="small" label="Vector diana" placeholder="Ej: Cucarachas" value={p.vector_diana} onChange={e => updateProducto(p.id, { vector_diana: e.target.value })} />
              </Box>
            </Box>
          ))}

          {productos.length < MAX_PRODUCTOS && (
            <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={addProducto} sx={{ alignSelf: 'flex-start' }}>
              Añadir producto
            </Button>
          )}
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
