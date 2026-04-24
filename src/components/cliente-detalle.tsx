'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardActionArea from '@mui/material/CardActionArea'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import Chip from '@mui/material/Chip'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogActions from '@mui/material/DialogActions'
import Divider from '@mui/material/Divider'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import EmailIcon from '@mui/icons-material/Email'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import BadgeIcon from '@mui/icons-material/Badge'
import PersonIcon from '@mui/icons-material/Person'
import type { Cliente } from '@/lib/types'
import { formatDate } from '@/lib/utils'

interface Visita { id: string; fecha_tratamiento: string; tipo_servicio: string | null; estado: string }

export default function ClienteDetalle({ cliente, visitas }: { cliente: Cliente; visitas: Visita[] }) {
  const router = useRouter()
  const [confirmDelete, setConfirmDelete] = useState(false)

  async function handleDelete() {
    await fetch(`/api/clientes/${cliente.id}`, { method: 'DELETE' })
    router.push('/clientes')
    router.refresh()
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
          <IconButton component={Link} href="/clientes" size="small"><ArrowBackIcon /></IconButton>
          <Typography variant="h6" noWrap>{cliente.nombre_comercial}</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 0.5 }}>
          <IconButton component={Link} href={`/clientes/${cliente.id}/editar`} size="small"><EditIcon fontSize="small" /></IconButton>
          <IconButton size="small" onClick={() => setConfirmDelete(true)} sx={{ color: 'error.light' }}><DeleteIcon fontSize="small" /></IconButton>
        </Box>
      </Box>

      {/* Datos */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {cliente.nombre && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <PersonIcon fontSize="small" sx={{ color: 'text.disabled' }} />
              <Box>
                <Typography variant="caption" color="text.disabled">Contacto</Typography>
                <Typography variant="body2">{cliente.nombre}</Typography>
              </Box>
            </Box>
          )}
          {cliente.dni && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <BadgeIcon fontSize="small" sx={{ color: 'text.disabled' }} />
              <Box>
                <Typography variant="caption" color="text.disabled">DNI / NIF</Typography>
                <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>{cliente.dni}</Typography>
              </Box>
            </Box>
          )}
          {cliente.direccion && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <LocationOnIcon fontSize="small" sx={{ color: 'text.disabled' }} />
              <Typography variant="body2">{cliente.direccion}</Typography>
            </Box>
          )}
          {cliente.correo_electronico && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <EmailIcon fontSize="small" sx={{ color: 'text.disabled' }} />
              <Typography
                component="a"
                href={`mailto:${cliente.correo_electronico}`}
                variant="body2"
                color="primary.main"
                sx={{ textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
              >
                {cliente.correo_electronico}
              </Typography>
            </Box>
          )}
          {cliente.observaciones && (
            <>
              <Divider />
              <Box>
                <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 0.5 }}>Observaciones</Typography>
                <Typography variant="body2">{cliente.observaciones}</Typography>
              </Box>
            </>
          )}
        </CardContent>
      </Card>

      {/* Nueva visita */}
      <Button
        variant="contained"
        fullWidth
        size="large"
        component={Link}
        href={`/visitas/nueva?clienteId=${cliente.id}`}
        startIcon={<AddIcon />}
        sx={{ mb: 3 }}
      >
        Nueva visita
      </Button>

      {/* Historial */}
      <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
        Historial de visitas ({visitas.length})
      </Typography>

      {visitas.length === 0 ? (
        <Typography variant="body2" color="text.disabled" align="center" sx={{ py: 4 }}>Sin visitas registradas</Typography>
      ) : (
        visitas.map(v => (
          <Card key={v.id} sx={{ mb: 1.5 }}>
            <CardActionArea component={Link} href={`/visitas/${v.id}`}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: '12px !important' }}>
                <CalendarTodayIcon fontSize="small" sx={{ color: 'text.disabled' }} />
                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>{formatDate(v.fecha_tratamiento)}</Typography>
                  {v.tipo_servicio && <Typography variant="caption" color="text.secondary">{v.tipo_servicio}</Typography>}
                </Box>
                <Chip
                  label={v.estado === 'cerrado' ? 'Cerrado' : 'Activo'}
                  size="small"
                  sx={{
                    height: 22, fontSize: 11, fontWeight: 600, border: 'none',
                    bgcolor: v.estado === 'cerrado' ? 'grey.100' : '#fef3c7',
                    color: v.estado === 'cerrado' ? 'text.secondary' : '#b45309',
                  }}
                />
                <ChevronRightIcon fontSize="small" sx={{ color: 'text.disabled' }} />
              </CardContent>
            </CardActionArea>
          </Card>
        ))
      )}

      {/* Confirmar borrado */}
      <Dialog open={confirmDelete} onClose={() => setConfirmDelete(false)}>
        <DialogTitle>¿Eliminar cliente?</DialogTitle>
        <DialogContent>
          <DialogContentText>Se eliminará el cliente y sus datos. Las visitas asociadas quedarán sin cliente asignado.</DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button onClick={() => setConfirmDelete(false)} color="inherit">Cancelar</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Eliminar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
