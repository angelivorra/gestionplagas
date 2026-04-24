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
import PeopleIcon from '@mui/icons-material/People'
import ChevronRightIcon from '@mui/icons-material/ChevronRight'
import type { Cliente } from '@/lib/types'

type SortKey = 'az' | 'za' | 'recent'

const SORTS: { key: SortKey; label: string }[] = [
  { key: 'az', label: 'Nombre A-Z' },
  { key: 'za', label: 'Nombre Z-A' },
  { key: 'recent', label: 'Más recientes' },
]

function ClienteCard({ c }: { c: Cliente }) {
  const initials = c.nombre_comercial.slice(0, 2).toUpperCase()
  return (
    <Card sx={{ mb: 1.5 }}>
      <CardActionArea component={Link} href={`/clientes/${c.id}`}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, py: '14px !important' }}>
          <Avatar sx={{ width: 44, height: 44, borderRadius: 2.5, bgcolor: 'primary.light', color: 'primary.dark', fontWeight: 700, fontSize: 14 }}>
            {initials}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" noWrap>{c.nombre_comercial}</Typography>
            {c.nombre && <Typography variant="caption" color="text.secondary" noWrap>{c.nombre}</Typography>}
            {c.direccion && (
              <Typography variant="caption" color="text.disabled" noWrap sx={{ display: 'block' }}>
                {c.direccion}
              </Typography>
            )}
          </Box>
          <ChevronRightIcon fontSize="small" sx={{ color: 'text.disabled', flexShrink: 0 }} />
        </CardContent>
      </CardActionArea>
    </Card>
  )
}

export default function ClientesList({ clientes }: { clientes: Cliente[] }) {
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortKey>('az')

  const filtered = useMemo(() => {
    let list = clientes
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(c =>
        c.nombre_comercial.toLowerCase().includes(q) ||
        c.nombre?.toLowerCase().includes(q) ||
        c.direccion?.toLowerCase().includes(q)
      )
    }
    const sorted = [...list]
    if (sort === 'az') sorted.sort((a, b) => a.nombre_comercial.localeCompare(b.nombre_comercial))
    if (sort === 'za') sorted.sort((a, b) => b.nombre_comercial.localeCompare(a.nombre_comercial))
    if (sort === 'recent') sorted.sort((a, b) => b.created_at.localeCompare(a.created_at))
    return sorted
  }, [clientes, search, sort])

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2.5 }}>Clientes</Typography>

      {/* Buscador */}
      <TextField
        fullWidth
        placeholder="Buscar por nombre, contacto o dirección..."
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
          <PeopleIcon sx={{ fontSize: 48, opacity: 0.3, mb: 1 }} />
          <Typography variant="body2">
            {search ? 'Sin resultados' : 'Sin clientes registrados'}
          </Typography>
        </Box>
      ) : (
        filtered.map(c => <ClienteCard key={c.id} c={c} />)
      )}

      {/* FAB */}
      <Fab
        color="primary"
        component={Link}
        href="/clientes/nuevo"
        sx={{ position: 'fixed', bottom: 80, right: 16, borderRadius: 4 }}
        aria-label="Nuevo cliente"
      >
        <AddIcon />
      </Fab>
    </Box>
  )
}
