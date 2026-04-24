'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardContent from '@mui/material/CardContent'
import Chip from '@mui/material/Chip'
import TextField from '@mui/material/TextField'
import InputAdornment from '@mui/material/InputAdornment'
import Fab from '@mui/material/Fab'
import IconButton from '@mui/material/IconButton'
import Avatar from '@mui/material/Avatar'
import SearchIcon from '@mui/icons-material/Search'
import ClearIcon from '@mui/icons-material/Clear'
import AddIcon from '@mui/icons-material/Add'
import AssignmentIcon from '@mui/icons-material/Assignment'
import LocationOnIcon from '@mui/icons-material/LocationOn'
import { formatDate } from '@/lib/utils'
import type { Visita } from '@/lib/types'

type VisitaRow = Visita & { clientes?: { nombre_comercial: string } | null }
type SortKey = 'recent' | 'oldest' | 'client'

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'recent', label: 'Más recientes' },
  { key: 'oldest', label: 'Más antiguas' },
  { key: 'client', label: 'Cliente A-Z' },
]

function VisitaCard({ v }: { v: VisitaRow }) {
  const activa = v.estado !== 'cerrado'
  return (
    <Card sx={{ mb: 1.5 }}>
      <CardActionArea component={Link} href={`/visitas/${v.id}`}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: '14px !important' }}>
          <Avatar
            sx={{
              width: 44, height: 44, borderRadius: 2.5,
              bgcolor: activa ? '#fef3c7' : 'grey.100',
              color: activa ? '#b45309' : 'text.disabled',
            }}
          >
            <AssignmentIcon />
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" noWrap>
              {v.clientes?.nombre_comercial ?? 'Sin cliente'}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {formatDate(v.fecha_tratamiento)}{v.tipo_servicio ? ` · ${v.tipo_servicio}` : ''}
            </Typography>
            {v.latitud && (
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.3, mt: 0.2 }}>
                <LocationOnIcon sx={{ fontSize: 11, color: 'primary.main' }} />
                <Typography variant="caption" color="primary.main" sx={{ fontSize: 10 }}>Ubicación guardada</Typography>
              </Box>
            )}
          </Box>
          <Chip
            label={activa ? 'Activo' : 'Cerrado'}
            size="small"
            sx={{
              bgcolor: activa ? '#fef3c7' : 'grey.100',
              color: activa ? '#b45309' : 'text.secondary',
              fontWeight: 600,
              border: 'none',
              height: 24,
            }}
          />
        </CardContent>
      </CardActionArea>
    </Card>
  )
}

export default function VisitasList({ visitas }: { visitas: VisitaRow[] }) {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortKey>('recent')
  const [tab, setTab] = useState<'activas' | 'todas'>('activas')

  const activasCount = visitas.filter(v => v.estado === 'borrador').length

  const filtered = useMemo(() => {
    let list = tab === 'activas' ? visitas.filter(v => v.estado === 'borrador') : visitas
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(v =>
        v.clientes?.nombre_comercial?.toLowerCase().includes(q) ||
        v.tipo_servicio?.toLowerCase().includes(q) ||
        v.descripcion_servicio?.toLowerCase().includes(q)
      )
    }
    const sorted = [...list]
    if (sort === 'recent') sorted.sort((a, b) => b.fecha_tratamiento.localeCompare(a.fecha_tratamiento))
    if (sort === 'oldest') sorted.sort((a, b) => a.fecha_tratamiento.localeCompare(b.fecha_tratamiento))
    if (sort === 'client') sorted.sort((a, b) =>
      (a.clientes?.nombre_comercial ?? '').localeCompare(b.clientes?.nombre_comercial ?? '')
    )
    return sorted
  }, [visitas, search, sort, tab])

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2.5 }}>Visitas</Typography>

      {/* Buscador */}
      <TextField
        fullWidth
        placeholder="Buscar por cliente o servicio..."
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

      {/* Tabs */}
      <Box sx={{ display: 'flex', bgcolor: 'grey.200', borderRadius: 3, p: 0.5, mb: 2, gap: 0.5 }}>
        {(['activas', 'todas'] as const).map(t => (
          <Box
            key={t}
            component="button"
            type="button"
            onClick={() => setTab(t)}
            sx={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1,
              py: 1.25, borderRadius: 2.5, border: 'none', cursor: 'pointer',
              bgcolor: tab === t ? 'background.paper' : 'transparent',
              boxShadow: tab === t ? '0 1px 4px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.15s',
              fontFamily: 'inherit', fontSize: 14, fontWeight: tab === t ? 600 : 400,
              color: tab === t ? 'text.primary' : 'text.secondary',
            }}
          >
            {t === 'activas' ? 'Activas' : 'Todas'}
            <Chip
              label={t === 'activas' ? activasCount : visitas.length}
              size="small"
              sx={{
                height: 20, fontSize: 11, fontWeight: 700,
                bgcolor: t === 'activas' && tab === 'activas' ? '#fef3c7' : 'grey.300',
                color: t === 'activas' && tab === 'activas' ? '#b45309' : 'text.secondary',
                border: 'none',
              }}
            />
          </Box>
        ))}
      </Box>

      {/* Chips de ordenación */}
      <Box sx={{ display: 'flex', gap: 1, overflowX: 'auto', mb: 2, pb: 0.5 }} className="scrollbar-none">
        {SORTS.map(s => (
          <Chip
            key={s.key}
            label={s.label}
            onClick={() => setSort(s.key)}
            variant={sort === s.key ? 'filled' : 'outlined'}
            color={sort === s.key ? 'primary' : 'default'}
            size="small"
            sx={{ flexShrink: 0, fontWeight: sort === s.key ? 600 : 400 }}
          />
        ))}
      </Box>

      {/* Lista */}
      {filtered.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 8, color: 'text.disabled' }}>
          <AssignmentIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
          <Typography variant="body2">
            {search ? 'Sin resultados' : tab === 'activas' ? 'No hay visitas activas' : 'Sin visitas registradas'}
          </Typography>
        </Box>
      ) : (
        filtered.map(v => <VisitaCard key={v.id} v={v} />)
      )}

      {/* FAB */}
      <Fab
        color="primary"
        component={Link}
        href="/visitas/nueva"
        sx={{ position: 'fixed', bottom: 80, right: 16, borderRadius: 4 }}
        aria-label="Nueva visita"
      >
        <AddIcon />
      </Fab>
    </Box>
  )
}
