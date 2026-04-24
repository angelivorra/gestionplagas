'use client'

import { useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import IconButton from '@mui/material/IconButton'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemText from '@mui/material/ListItemText'
import Divider from '@mui/material/Divider'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import DeleteIcon from '@mui/icons-material/Delete'
import AddIcon from '@mui/icons-material/Add'
import type { OpcionLista } from '@/lib/types'

const TABLAS = [
  { key: 'descripcion_servicio', label: 'Descripción servicio' },
  { key: 'tipo_servicio', label: 'Tipo de servicio' },
  { key: 'lugar_actuacion', label: 'Lugar de actuación' },
]

const CATEGORIAS_LUGAR = ['Viviendas/Comunidades', 'Hostelería']

interface Props {
  inicial: Record<string, OpcionLista[]>
}

export default function AjustesClient({ inicial }: Props) {
  const [tab, setTab] = useState(0)
  const [opciones, setOpciones] = useState<Record<string, OpcionLista[]>>(inicial)
  const [newVal, setNewVal] = useState('')
  const [newCat, setNewCat] = useState('')
  const [adding, setAdding] = useState(false)

  const tablaKey = TABLAS[tab].key
  const esLugar = tablaKey === 'lugar_actuacion'
  const lista = opciones[tablaKey] ?? []

  function handleTabChange(_: React.SyntheticEvent, v: number) {
    setTab(v)
    setNewVal('')
    setNewCat('')
  }

  async function handleAdd() {
    const val = newVal.trim()
    if (!val) return
    setAdding(true)
    const res = await fetch(`/api/opciones/${tablaKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ valor: val, categoria: esLugar ? (newCat || null) : null }),
    })
    const { data } = await res.json()
    if (data) {
      setOpciones(prev => ({
        ...prev,
        [tablaKey]: [...(prev[tablaKey] ?? []), data].sort((a, b) => a.valor.localeCompare(b.valor)),
      }))
    }
    setNewVal('')
    setNewCat('')
    setAdding(false)
  }

  async function handleDelete(id: string) {
    await fetch(`/api/opciones/${tablaKey}?id=${id}`, { method: 'DELETE' })
    setOpciones(prev => ({
      ...prev,
      [tablaKey]: (prev[tablaKey] ?? []).filter(o => o.id !== id),
    }))
  }

  const sinCategoria = esLugar ? lista.filter(o => !o.categoria) : []
  const agrupado: Record<string, OpcionLista[]> = esLugar
    ? CATEGORIAS_LUGAR.reduce<Record<string, OpcionLista[]>>((acc, cat) => {
        acc[cat] = lista.filter(o => o.categoria === cat)
        return acc
      }, sinCategoria.length > 0 ? { 'Sin categoría': sinCategoria } : {})
    : { todas: lista }

  return (
    <Box>
      <Typography variant="h5" sx={{ mb: 2.5 }}>Configuración</Typography>

      <Tabs value={tab} onChange={handleTabChange} variant="fullWidth" sx={{ mb: 2, bgcolor: 'background.paper', borderRadius: 3, p: 0.5 }}>
        {TABLAS.map(t => (
          <Tab key={t.key} label={t.label} sx={{ fontSize: 12, borderRadius: 2.5, minHeight: 40, '&.Mui-selected': { bgcolor: 'primary.main', color: '#fff' } }} />
        ))}
      </Tabs>

      {/* Añadir nuevo valor */}
      <Card sx={{ mb: 2 }}>
        <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Typography variant="subtitle2" color="text.secondary">Añadir valor</Typography>
          {esLugar && (
            <FormControl fullWidth size="small">
              <InputLabel>Categoría (opcional)</InputLabel>
              <Select
                value={newCat}
                label="Categoría (opcional)"
                onChange={e => setNewCat(e.target.value)}
              >
                <MenuItem value=""><em>Sin categoría</em></MenuItem>
                {CATEGORIAS_LUGAR.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
              </Select>
            </FormControl>
          )}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <TextField
              fullWidth
              size="small"
              placeholder="Nuevo valor..."
              value={newVal}
              onChange={e => setNewVal(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAdd()}
            />
            <Button
              variant="contained"
              onClick={handleAdd}
              disabled={adding || !newVal.trim()}
              startIcon={<AddIcon />}
              sx={{ whiteSpace: 'nowrap' }}
            >
              Añadir
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Lista agrupada */}
      {Object.entries(agrupado).map(([grupo, items]) => {
        if (esLugar && grupo === 'Sin categoría' && items.length === 0) return null
        if (!esLugar && items.length === 0) return (
          <Box key="empty" sx={{ textAlign: 'center', py: 4, color: 'text.disabled' }}>
            <Typography variant="body2">Sin valores registrados</Typography>
          </Box>
        )
        return (
          <Box key={grupo} sx={{ mb: 2 }}>
            {esLugar && grupo !== 'Sin categoría' && items.length > 0 && (
              <Typography variant="caption" color="text.secondary" sx={{ px: 0.5, mb: 0.5, display: 'block', fontWeight: 600 }}>
                {grupo}
              </Typography>
            )}
            {items.length > 0 && (
              <Card>
                <List disablePadding>
                  {items.map((o, i) => (
                    <Box key={o.id}>
                      {i > 0 && <Divider component="li" />}
                      <ListItem
                        secondaryAction={
                          <IconButton edge="end" size="small" onClick={() => handleDelete(o.id)} sx={{ color: 'error.light' }}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        }
                      >
                        <ListItemText primary={o.valor} slotProps={{ primary: { variant: 'body2' } }} />
                      </ListItem>
                    </Box>
                  ))}
                </List>
              </Card>
            )}
          </Box>
        )
      })}
    </Box>
  )
}
