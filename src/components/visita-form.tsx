'use client'

import { useState, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Chip from '@mui/material/Chip'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import CircularProgress from '@mui/material/CircularProgress'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import Autocomplete from '@mui/material/Autocomplete'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import DeleteIcon from '@mui/icons-material/Delete'
import SaveIcon from '@mui/icons-material/Save'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import EmailIcon from '@mui/icons-material/Email'
import DownloadIcon from '@mui/icons-material/Download'
import AddIcon from '@mui/icons-material/Add'
import CreatableCombobox from '@/components/creatable-combobox'
import ClienteSearchSelect from '@/components/cliente-search-select'
import FotosGrid from '@/components/fotos-grid'
import GeolocalizacionBtn from '@/components/geolocalizacion-btn'
import SignaturePad from '@/components/signature-pad'
import type { Visita, Producto, ServicioAplicado, ProductoAplicado } from '@/lib/types'

interface Props {
  visitaId: string
  initialData: Visita & { clientes?: { nombre_comercial: string; correo_electronico: string | null } | null }
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card sx={{ mb: 2 }}>
      <Box sx={{ px: 2, py: 1.25, bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'divider' }}>
        <Typography variant="overline" color="text.secondary" sx={{ fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>
          {title}
        </Typography>
      </Box>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
        {children}
      </CardContent>
    </Card>
  )
}

function LugarMultiSelect({ categoria, selected, onChange, disabled }: {
  categoria: string
  selected: string[]
  onChange: (v: string[]) => void
  disabled?: boolean
}) {
  const [opciones, setOpciones] = useState<{ id: string; valor: string }[]>([])
  const [loaded, setLoaded] = useState(false)
  const [newVal, setNewVal] = useState('')

  if (!loaded) {
    fetch('/api/opciones/lugar_actuacion')
      .then(r => r.json())
      .then(({ data }) => {
        setOpciones((data ?? []).filter((o: { categoria: string }) => o.categoria === categoria))
        setLoaded(true)
      })
  }

  function toggle(valor: string) {
    if (disabled) return
    onChange(selected.includes(valor) ? selected.filter(v => v !== valor) : [...selected, valor])
  }

  async function handleCreate() {
    if (!newVal.trim() || disabled) return
    const res = await fetch('/api/opciones/lugar_actuacion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ valor: newVal.trim(), categoria }),
    })
    const { data } = await res.json()
    if (data) {
      setOpciones(prev => [...prev, data])
      onChange([...selected, data.valor])
      setNewVal('')
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: disabled ? 0 : 1.5 }}>
        {opciones.map(o => (
          <Chip
            key={o.id}
            label={o.valor}
            onClick={() => toggle(o.valor)}
            disabled={disabled}
            variant={selected.includes(o.valor) ? 'filled' : 'outlined'}
            color={selected.includes(o.valor) ? 'primary' : 'default'}
            size="small"
            sx={{ cursor: disabled ? 'default' : 'pointer' }}
          />
        ))}
      </Box>
      {!disabled && (
        <Box sx={{ display: 'flex', gap: 1 }}>
          <TextField
            size="small"
            placeholder="Añadir lugar..."
            value={newVal}
            onChange={e => setNewVal(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleCreate() } }}
            sx={{ flex: 1 }}
          />
          <Button variant="outlined" size="small" onClick={handleCreate} startIcon={<AddIcon />}>
            Añadir
          </Button>
        </Box>
      )}
    </Box>
  )
}

function ProductoSelect({ value, onChange, disabled }: { value: string; onChange: (v: string) => void; disabled?: boolean }) {
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
      disabled={disabled}
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

function newProducto(): ProductoAplicado {
  return { id: crypto.randomUUID(), producto_id: '', cantidad: '', plazo_seguridad: '', lugares_viviendas: [], lugares_hosteleria: [] }
}

function newServicio(): ServicioAplicado {
  return { id: crypto.randomUUID(), tipo: '', productos: [newProducto()] }
}

function ProductoBlock({ item, onChange, onDelete, disabled }: {
  item: ProductoAplicado
  onChange: (u: ProductoAplicado) => void
  onDelete: () => void
  disabled?: boolean
}) {
  const upd = (patch: Partial<ProductoAplicado>) => onChange({ ...item, ...patch })
  return (
    <Box sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 1.5, p: 1.5, mb: 1.5 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 600, textTransform: 'uppercase', fontSize: 10 }}>Producto</Typography>
        {!disabled && <IconButton size="small" onClick={onDelete} sx={{ color: 'error.light' }}><DeleteIcon fontSize="small" /></IconButton>}
      </Box>
      <ProductoSelect value={item.producto_id} onChange={producto_id => upd({ producto_id })} disabled={disabled} />
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, mt: 1.5 }}>
        <TextField size="small" label="Cantidad" placeholder="Ej: 250ml" value={item.cantidad} onChange={e => upd({ cantidad: e.target.value })} disabled={disabled} />
        <TextField size="small" label="Plazo de seguridad" placeholder="Ej: 4 horas" value={item.plazo_seguridad} onChange={e => upd({ plazo_seguridad: e.target.value })} disabled={disabled} />
      </Box>
      <Box sx={{ mt: 1.5 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>Viviendas / Comunidades</Typography>
        <LugarMultiSelect categoria="Viviendas/Comunidades" selected={item.lugares_viviendas} onChange={lugares_viviendas => upd({ lugares_viviendas })} disabled={disabled} />
      </Box>
      <Box sx={{ mt: 1.5 }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.75 }}>Hostelería</Typography>
        <LugarMultiSelect categoria="Hostelería" selected={item.lugares_hosteleria} onChange={lugares_hosteleria => upd({ lugares_hosteleria })} disabled={disabled} />
      </Box>
    </Box>
  )
}

function ServicioBlock({ servicio, index, onChange, onDelete, disabled }: {
  servicio: ServicioAplicado
  index: number
  onChange: (u: ServicioAplicado) => void
  onDelete: () => void
  disabled?: boolean
}) {
  function addProducto() { onChange({ ...servicio, productos: [...servicio.productos, newProducto()] }) }
  function removeProducto(id: string) { onChange({ ...servicio, productos: servicio.productos.filter(p => p.id !== id) }) }
  function updateProducto(id: string, u: ProductoAplicado) { onChange({ ...servicio, productos: servicio.productos.map(p => p.id === id ? u : p) }) }

  return (
    <Card sx={{ mb: 2 }}>
      <Box sx={{ px: 2, py: 1.25, bgcolor: 'grey.50', borderBottom: '1px solid', borderColor: 'divider', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="overline" color="text.secondary" sx={{ fontSize: 10, fontWeight: 700, letterSpacing: 1 }}>
          Tipo de servicio {index + 1}
        </Typography>
        {!disabled && <IconButton size="small" onClick={onDelete} sx={{ color: 'error.light' }}><DeleteIcon fontSize="small" /></IconButton>}
      </Box>
      <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 0, pt: '16px !important' }}>
        <Box sx={{ mb: 2 }}>
          <CreatableCombobox tabla="tipo_servicio" value={servicio.tipo} onChange={tipo => onChange({ ...servicio, tipo })} placeholder="Seleccionar tipo..." disabled={disabled} />
        </Box>
        {servicio.productos.map(p => (
          <ProductoBlock key={p.id} item={p} onChange={u => updateProducto(p.id, u)} onDelete={() => removeProducto(p.id)} disabled={disabled} />
        ))}
        {!disabled && (
          <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={addProducto} sx={{ mt: 0.5 }}>
            Añadir producto
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

export default function VisitaForm({ visitaId, initialData }: Props) {
  const router = useRouter()
  const [data, setData] = useState(initialData)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [generatingPdf, setGeneratingPdf] = useState(false)
  const [confirmClose, setConfirmClose] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const firmaTecnicoRef = useRef<{ getDataURL: () => string; isEmpty: () => boolean } | null>(null)
  const firmaClienteRef = useRef<{ getDataURL: () => string; isEmpty: () => boolean } | null>(null)

  const update = useCallback((field: string, value: unknown) => {
    setData(prev => ({ ...prev, [field]: value }))
    setSaved(false)
  }, [])

  const servicios: ServicioAplicado[] = (data.servicios as ServicioAplicado[] | null) ?? []
  function addServicio() { update('servicios', [...servicios, newServicio()]) }
  function removeServicio(id: string) { update('servicios', servicios.filter(s => s.id !== id)) }
  function updateServicio(id: string, u: ServicioAplicado) { update('servicios', servicios.map(s => s.id === id ? u : s)) }

  async function save(nuevoEstado?: 'borrador' | 'cerrado') {
    setSaving(true)
    const payload: Partial<Visita> = { ...data }
    if (nuevoEstado) payload.estado = nuevoEstado
    if (nuevoEstado === 'cerrado') {
      if (firmaTecnicoRef.current && !firmaTecnicoRef.current.isEmpty()) payload.firma_tecnico_url = firmaTecnicoRef.current.getDataURL()
      if (firmaClienteRef.current && !firmaClienteRef.current.isEmpty()) payload.firma_cliente_url = firmaClienteRef.current.getDataURL()
    }
    delete (payload as Record<string, unknown>).clientes
    delete (payload as Record<string, unknown>).id
    delete (payload as Record<string, unknown>).created_at
    const res = await fetch(`/api/visitas/${visitaId}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
    const { data: updated } = await res.json()
    setSaving(false)
    if (updated) {
      setData(prev => ({ ...prev, ...updated }))
    } else if (nuevoEstado) {
      setData(prev => ({ ...prev, estado: nuevoEstado }))
    }
    setSaved(true)

    if (nuevoEstado === 'cerrado') {
      setGeneratingPdf(true)
      try {
        const pdfRes = await fetch(`/api/pdf/${visitaId}`, { method: 'POST' })
        const { pdf_url } = await pdfRes.json()
        if (pdf_url) setData(prev => ({ ...prev, pdf_url }))
      } finally {
        setGeneratingPdf(false)
      }
    }
  }

  const [sendingEmail, setSendingEmail] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const [emailError, setEmailError] = useState<string | null>(null)

  async function handleDelete() {
    await fetch(`/api/visitas/${visitaId}`, { method: 'DELETE' })
    router.push('/visitas')
    router.refresh()
  }

  async function handleSendEmail() {
    setSendingEmail(true)
    try {
      const res = await fetch(`/api/email/${visitaId}`, { method: 'POST' })
      const json = await res.json()
      if (!res.ok) {
        setEmailError(json.error ?? 'Error al enviar el correo')
      } else {
        setEmailSent(true)
      }
    } catch {
      setEmailError('Error de conexión al enviar el correo')
    } finally {
      setSendingEmail(false)
    }
  }

  const cerrado = data.estado === 'cerrado'

  return (
    <Box sx={{ pb: '144px' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
          <IconButton component={Link} href="/visitas" size="small"><ArrowBackIcon /></IconButton>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" noWrap sx={{ fontSize: 16 }}>
              {data.clientes?.nombre_comercial ?? 'Nueva visita'}
            </Typography>
            <Chip
              label={cerrado ? 'Cerrado' : 'Activo'}
              size="small"
              sx={{
                height: 20, fontSize: 11, fontWeight: 600, border: 'none',
                bgcolor: cerrado ? 'grey.100' : '#fef3c7',
                color: cerrado ? 'text.secondary' : '#b45309',
              }}
            />
          </Box>
        </Box>
        {!cerrado && (
          <IconButton size="small" onClick={() => setConfirmDelete(true)} sx={{ color: 'error.light' }}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      <Section title="Datos básicos">
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>Cliente</Typography>
          <ClienteSearchSelect value={data.cliente_id ?? ''} onChange={(id) => update('cliente_id', id)} disabled={cerrado} />
        </Box>
        <TextField
          label="Fecha del tratamiento"
          type="date"
          fullWidth
          value={data.fecha_tratamiento}
          onChange={e => update('fecha_tratamiento', e.target.value)}
          disabled={cerrado}
          slotProps={{ inputLabel: { shrink: true } }}
        />
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
          <TextField label="Hora inicio" type="time" fullWidth value={data.hora_inicio ?? ''} onChange={e => update('hora_inicio', e.target.value)} disabled={cerrado} slotProps={{ inputLabel: { shrink: true } }} />
          <TextField label="Hora fin" type="time" fullWidth value={data.hora_fin ?? ''} onChange={e => update('hora_fin', e.target.value)} disabled={cerrado} slotProps={{ inputLabel: { shrink: true } }} />
        </Box>
      </Section>

      <Section title="Servicio">
        <Box>
          <Typography variant="caption" color="text.secondary" sx={{ mb: 0.5, display: 'block' }}>Descripción del servicio</Typography>
          <CreatableCombobox tabla="descripcion_servicio" value={data.descripcion_servicio ?? ''} onChange={v => update('descripcion_servicio', v)} placeholder="Seleccionar..." allowDelete disabled={cerrado} />
        </Box>
      </Section>

      {servicios.map((s, i) => (
        <ServicioBlock key={s.id} servicio={s} index={i} onChange={u => updateServicio(s.id, u)} onDelete={() => removeServicio(s.id)} disabled={cerrado} />
      ))}

      {!cerrado && (
        <Box sx={{ mb: 2 }}>
          <Button variant="outlined" fullWidth startIcon={<AddIcon />} onClick={addServicio}>
            Añadir tipo de servicio
          </Button>
        </Box>
      )}

      <Section title="Observaciones">
        <TextField label="Observaciones" fullWidth multiline rows={3} placeholder="Observaciones del tratamiento..." value={data.observaciones ?? ''} onChange={e => update('observaciones', e.target.value)} disabled={cerrado} />
      </Section>

      <Section title="Ubicación">
        <GeolocalizacionBtn
          latitud={data.latitud} longitud={data.longitud} direccionGeo={data.direccion_geo}
          onCapture={(lat, lon, dir) => { setData(prev => ({ ...prev, latitud: lat, longitud: lon, direccion_geo: dir })); setSaved(false) }}
          disabled={cerrado}
        />
      </Section>

      <Section title="Fotos">
        <FotosGrid visitaId={visitaId} disabled={cerrado} />
      </Section>

      {!cerrado && (
        <Section title="Firmas">
          <SignaturePad ref={firmaTecnicoRef} label="Responsable aplicador" />
          <TextField label="Nombre del cliente" fullWidth placeholder="Nombre del cliente que firma" value={data.nombre_cliente_firma ?? ''} onChange={e => update('nombre_cliente_firma', e.target.value)} />
          <SignaturePad ref={firmaClienteRef} label="Firma cliente" />
        </Section>
      )}

      {cerrado && (data.firma_tecnico_url || data.firma_cliente_url) && (
        <Section title="Firmas">
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            {data.firma_tecnico_url && (
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>Técnico</Typography>
                <img src={data.firma_tecnico_url} alt="Firma técnico" style={{ border: '1px solid #e5e7eb', borderRadius: 8, width: '100%' }} />
              </Box>
            )}
            {data.firma_cliente_url && (
              <Box>
                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
                  Cliente{data.nombre_cliente_firma ? ` — ${data.nombre_cliente_firma}` : ''}
                </Typography>
                <img src={data.firma_cliente_url} alt="Firma cliente" style={{ border: '1px solid #e5e7eb', borderRadius: 8, width: '100%' }} />
              </Box>
            )}
          </Box>
        </Section>
      )}

      {/* Barra de acciones fija — encima del bottom nav (64px) */}
      <AppBar
        position="fixed"
        color="default"
        elevation={0}
        sx={{
          top: 'auto', bottom: 64,
          borderTop: '1px solid', borderColor: 'divider',
          bgcolor: 'background.paper',
          maxWidth: 600, left: '50%', transform: 'translateX(-50%)',
          width: '100%',
        }}
      >
        <Toolbar sx={{ gap: 1, px: 2, minHeight: '60px !important' }}>
          {!cerrado && (
            <>
              <Button
                variant="outlined"
                sx={{ flex: 1 }}
                onClick={() => save()}
                disabled={saving}
                startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
              >
                {saving ? 'Guardando...' : saved ? 'Guardado' : 'Borrador'}
              </Button>
              <Button
                variant="contained"
                sx={{ flex: 1 }}
                onClick={() => setConfirmClose(true)}
                startIcon={<CheckCircleIcon />}
              >
                Cerrar PDT
              </Button>
            </>
          )}
          {cerrado && (
            <>
              <Button
                variant="outlined"
                color="warning"
                sx={{ flex: 1 }}
                onClick={() => save('borrador')}
                disabled={saving || generatingPdf}
              >
                {saving ? 'Reabriendo...' : 'Reabrir'}
              </Button>
              <Button
                variant="outlined"
                sx={{ flex: 1 }}
                href={`/api/pdf/${visitaId}`}
                target="_blank"
                rel="noopener noreferrer"
                disabled={generatingPdf}
                startIcon={generatingPdf ? <CircularProgress size={14} color="inherit" /> : <DownloadIcon />}
              >
                {generatingPdf ? 'PDF...' : 'PDF'}
              </Button>
              <Button
                variant="contained"
                sx={{ flex: 1 }}
                onClick={handleSendEmail}
                disabled={generatingPdf || sendingEmail}
                startIcon={sendingEmail ? <CircularProgress size={14} color="inherit" /> : <EmailIcon />}
              >
                {sendingEmail ? 'Enviando...' : emailSent ? 'Enviado' : 'Enviar'}
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      {/* Confirmar cerrar PDT */}
      <Dialog open={confirmClose} onClose={() => setConfirmClose(false)}>
        <DialogTitle>¿Cerrar el parte de trabajo?</DialogTitle>
        <DialogContent>
          <DialogContentText>El PDT quedará cerrado y no podrá editarse. Se guardarán las firmas actuales.</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setConfirmClose(false)} color="inherit">Cancelar</Button>
          <Button variant="contained" onClick={() => { setConfirmClose(false); save('cerrado') }}>Cerrar PDT</Button>
        </DialogActions>
      </Dialog>

      {/* Confirmar eliminar visita */}
      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <DialogTitle>¿Eliminar visita?</DialogTitle>
        <DialogContent>
          <DialogContentText>Esta acción no se puede deshacer.</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setConfirmDelete(false)} color="inherit">Cancelar</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Eliminar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={!!emailError}
        autoHideDuration={6000}
        onClose={() => setEmailError(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert severity="error" onClose={() => setEmailError(null)} sx={{ width: '100%' }}>
          {emailError}
        </Alert>
      </Snackbar>
    </Box>
  )
}
