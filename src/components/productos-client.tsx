'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Fab from '@mui/material/Fab'
import SearchIcon from '@mui/icons-material/Search'
import ClearIcon from '@mui/icons-material/Clear'
import AddIcon from '@mui/icons-material/Add'
import ScienceIcon from '@mui/icons-material/Science'
import type { Producto } from '@/lib/types'

const emptyForm = { nombre_comercial: '', numero_registro: '', plazo_seguridad: '', principios_activos: '' }

export default function ProductosClient({ initialProductos }: { initialProductos: Producto[] }) {
  const [productos, setProductos] = useState<Producto[]>(initialProductos)
  const [search, setSearch] = useState('')
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [saving, setSaving] = useState(false)

  const filtered = useMemo(() => {
    if (!search.trim()) return productos
    const q = search.toLowerCase()
    return productos.filter(p =>
      p.nombre_comercial.toLowerCase().includes(q) ||
      p.numero_registro?.toLowerCase().includes(q) ||
      p.principios_activos?.toLowerCase().includes(q)
    )
  }, [productos, search])

  async function handleSave() {
    if (!form.nombre_comercial.trim()) return
    setSaving(true)
    const payload = {
      nombre_comercial: form.nombre_comercial,
      numero_registro: form.numero_registro || null,
      plazo_seguridad: form.plazo_seguridad ? parseInt(form.plazo_seguridad) : null,
      principios_activos: form.principios_activos || null,
    }
    const res = await fetch('/api/productos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const { data } = await res.json()
    if (data) setProductos(prev => [...prev, data].sort((a, b) => a.nombre_comercial.localeCompare(b.nombre_comercial)))
    setSaving(false)
    setOpen(false)
    setForm(emptyForm)
  }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2.5 }}>Productos</Typography>

      <TextField
        fullWidth
        placeholder="Buscar producto..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        slotProps={{
          input: {
            startAdornment: <InputAdornment position="start"><SearchIcon fontSize="small" color="disabled" /></InputAdornment>,
            endAdornment: search ? (
              <InputAdornment position="end">
                <IconButton size="small" onClick={() => setSearch('')}><ClearIcon fontSize="small" /></IconButton>
              </InputAdornment>
            ) : null,
          }
        }}
        sx={{ mb: 2 }}
      />

      {filtered.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.disabled' }}>
          <ScienceIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
          <Typography variant="body2">{search ? 'Sin resultados' : 'Sin productos registrados'}</Typography>
        </Box>
      ) : (
        filtered.map(p => (
          <Card key={p.id} sx={{ mb: 1.5 }}>
            <CardActionArea component={Link} href={`/productos/${p.id}`}>
              <CardContent sx={{ py: '12px !important' }}>
                <Typography variant="subtitle2" noWrap>{p.nombre_comercial}</Typography>
                <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap', mt: 0.3 }}>
                  {p.numero_registro && <Typography variant="caption" color="text.secondary">Reg. {p.numero_registro}</Typography>}
                  {p.plazo_seguridad && <Typography variant="caption" color="text.secondary">Plazo: {p.plazo_seguridad}h</Typography>}
                  {p.principios_activos && <Typography variant="caption" color="text.secondary" noWrap>{p.principios_activos}</Typography>}
                </Box>
              </CardContent>
            </CardActionArea>
          </Card>
        ))
      )}

      {/* FAB */}
      <Fab color="primary" onClick={() => { setForm(emptyForm); setOpen(true) }} sx={{ position: 'fixed', bottom: 80, right: 16, borderRadius: 4 }} aria-label="Nuevo producto">
        <AddIcon />
      </Fab>

      {/* Dialog crear */}
      <Dialog open={open} fullWidth maxWidth="xs" onClose={() => setOpen(false)}>
        <DialogTitle>Nuevo producto</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
          <TextField label="Nombre comercial *" fullWidth value={form.nombre_comercial} onChange={e => setForm(p => ({ ...p, nombre_comercial: e.target.value }))} placeholder="Ej: Fendona SC" />
          <TextField label="Nº de registro" fullWidth value={form.numero_registro} onChange={e => setForm(p => ({ ...p, numero_registro: e.target.value }))} placeholder="ES-00000" />
          <TextField label="Plazo de seguridad (horas)" type="number" fullWidth value={form.plazo_seguridad} onChange={e => setForm(p => ({ ...p, plazo_seguridad: e.target.value }))} placeholder="4" />
          <TextField label="Principios activos" fullWidth value={form.principios_activos} onChange={e => setForm(p => ({ ...p, principios_activos: e.target.value }))} placeholder="Alfa-cipermetrina 10%" />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setOpen(false)} color="inherit">Cancelar</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? 'Guardando...' : 'Crear producto'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
