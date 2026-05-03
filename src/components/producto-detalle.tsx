'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import TextField from '@mui/material/TextField'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import Divider from '@mui/material/Divider'
import Chip from '@mui/material/Chip'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import SaveIcon from '@mui/icons-material/Save'
import NumbersIcon from '@mui/icons-material/Numbers'
import TimerIcon from '@mui/icons-material/Timer'
import BiotechIcon from '@mui/icons-material/Biotech'
import UploadFileIcon from '@mui/icons-material/UploadFile'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import CircularProgress from '@mui/material/CircularProgress'
import type { Producto } from '@/lib/types'

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2, py: 0.5 }}>
      <Typography variant="caption" color="text.disabled" sx={{ minWidth: 130, pt: 0.3 }}>
        {label}
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Box>
  )
}

const emptyForm = (p: Producto) => ({
  nombre_comercial: p.nombre_comercial,
  numero_registro: p.numero_registro ?? '',
  plazo_seguridad: p.plazo_seguridad?.toString() ?? '',
  principios_activos: p.principios_activos ?? '',
})

function FichaUpload({ productoId, tipo, url, onUploaded }: {
  productoId: string
  tipo: 'tecnica' | 'seguridad'
  url: string | null
  onUploaded: (updated: Producto) => void
}) {
  const [uploading, setUploading] = useState(false)
  const label = tipo === 'tecnica' ? 'Ficha técnica' : 'Ficha de seguridad'

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('tipo', tipo)
    const res = await fetch(`/api/productos/${productoId}/fichas`, { method: 'POST', body: fd })
    const { data } = await res.json()
    if (data) onUploaded(data)
    setUploading(false)
    e.target.value = ''
  }

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', py: 1 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Typography variant="body2" color={url ? 'text.primary' : 'text.disabled'}>{label}</Typography>
        {url && (
          <IconButton size="small" component="a" href={url} target="_blank" rel="noopener noreferrer" sx={{ color: 'primary.main' }}>
            <OpenInNewIcon fontSize="small" />
          </IconButton>
        )}
      </Box>
      <Button
        component="label"
        size="small"
        variant={url ? 'outlined' : 'contained'}
        startIcon={uploading ? <CircularProgress size={14} color="inherit" /> : <UploadFileIcon />}
        disabled={uploading}
        sx={{ minWidth: 110 }}
      >
        {uploading ? 'Subiendo...' : url ? 'Reemplazar' : 'Subir PDF'}
        <input type="file" accept="application/pdf" hidden onChange={handleFile} />
      </Button>
    </Box>
  )
}

export default function ProductoDetalle({ producto: inicial }: { producto: Producto }) {
  const router = useRouter()
  const [producto, setProducto] = useState(inicial)
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const [form, setForm] = useState(emptyForm(inicial))
  const [saving, setSaving] = useState(false)

  function openEdit() { setForm(emptyForm(producto)); setEditOpen(true) }

  async function handleSave() {
    if (!form.nombre_comercial.trim()) return
    setSaving(true)
    const payload = {
      nombre_comercial: form.nombre_comercial,
      numero_registro: form.numero_registro || null,
      plazo_seguridad: form.plazo_seguridad ? parseInt(form.plazo_seguridad) : null,
      principios_activos: form.principios_activos || null,
    }
    const res = await fetch(`/api/productos/${producto.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const { data } = await res.json()
    if (data) setProducto(data)
    setSaving(false)
    setEditOpen(false)
  }

  async function handleDelete() {
    await fetch(`/api/productos/${producto.id}`, { method: 'DELETE' })
    router.push('/productos')
    router.refresh()
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
          <IconButton component={Link} href="/productos" size="small"><ArrowBackIcon /></IconButton>
          <Typography variant="h6" noWrap>{producto.nombre_comercial}</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton size="small" onClick={openEdit}><EditIcon fontSize="small" /></IconButton>
          <IconButton size="small" onClick={() => setDeleteOpen(true)} sx={{ color: 'error.light' }}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Ficha */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ pt: '20px !important' }}>
          {producto.numero_registro && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <NumbersIcon fontSize="small" sx={{ color: 'text.disabled' }} />
              <Box>
                <Typography variant="caption" color="text.disabled">Nº de registro</Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{producto.numero_registro}</Typography>
              </Box>
            </Box>
          )}

          {producto.plazo_seguridad && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
              <TimerIcon fontSize="small" sx={{ color: 'text.disabled' }} />
              <Box>
                <Typography variant="caption" color="text.disabled">Plazo de seguridad</Typography>
                <Typography variant="body2">{producto.plazo_seguridad} horas</Typography>
              </Box>
            </Box>
          )}

          {producto.principios_activos && (
            <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.5, mb: 2 }}>
              <BiotechIcon fontSize="small" sx={{ color: 'text.disabled', mt: 0.3 }} />
              <Box>
                <Typography variant="caption" color="text.disabled">Principios activos</Typography>
                <Typography variant="body2">{producto.principios_activos}</Typography>
              </Box>
            </Box>
          )}

          {!producto.numero_registro && !producto.plazo_seguridad && !producto.principios_activos && (
            <Typography variant="body2" color="text.disabled" align="center" sx={{ py: 2 }}>
              Sin datos adicionales registrados
            </Typography>
          )}
        </CardContent>
      </Card>

      {/* Fichas */}
      <Card sx={{ mb: 2 }}>
        <Box sx={{ px: 2, py: 1.25, bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'divider' }}>
          <Typography variant="overline" color="text.secondary" sx={{ fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>
            Fichas del producto
          </Typography>
        </Box>
        <CardContent sx={{ pt: '8px !important', pb: '8px !important' }}>
          <FichaUpload productoId={producto.id} tipo="tecnica" url={producto.ficha_tecnica_url} onUploaded={setProducto} />
          <Divider />
          <FichaUpload productoId={producto.id} tipo="seguridad" url={producto.ficha_seguridad_url} onUploaded={setProducto} />
        </CardContent>
      </Card>

      {/* Chips resumen */}
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        {producto.numero_registro && (
          <Chip label={`Reg. ${producto.numero_registro}`} size="small" variant="outlined" />
        )}
        {producto.plazo_seguridad && (
          <Chip label={`Plazo: ${producto.plazo_seguridad}h`} size="small" variant="outlined" color="warning" />
        )}
      </Box>

      {/* Dialog editar */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} fullWidth maxWidth="xs">
        <DialogTitle>Editar producto</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px !important' }}>
          <TextField label="Nombre comercial *" fullWidth value={form.nombre_comercial} onChange={e => setForm(p => ({ ...p, nombre_comercial: e.target.value }))} />
          <TextField label="Nº de registro" fullWidth value={form.numero_registro} onChange={e => setForm(p => ({ ...p, numero_registro: e.target.value }))} placeholder="ES-00000" />
          <TextField label="Plazo de seguridad (horas)" type="number" fullWidth value={form.plazo_seguridad} onChange={e => setForm(p => ({ ...p, plazo_seguridad: e.target.value }))} />
          <TextField label="Principios activos" fullWidth value={form.principios_activos} onChange={e => setForm(p => ({ ...p, principios_activos: e.target.value }))} placeholder="Alfa-cipermetrina 10%" />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setEditOpen(false)} color="inherit">Cancelar</Button>
          <Button variant="contained" onClick={handleSave} disabled={saving} startIcon={<SaveIcon />}>
            {saving ? 'Guardando...' : 'Guardar'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog confirmar borrado */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>¿Eliminar producto?</DialogTitle>
        <DialogContent>
          <DialogContentText>Se eliminará &ldquo;{producto.nombre_comercial}&rdquo; del catálogo.</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setDeleteOpen(false)} color="inherit">Cancelar</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Eliminar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
