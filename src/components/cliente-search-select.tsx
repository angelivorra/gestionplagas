'use client'

import { useState, useEffect, useCallback } from 'react'
import Autocomplete from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import Typography from '@mui/material/Typography'
import type { Cliente } from '@/lib/types'

interface Props {
  value: string
  onChange: (clienteId: string, cliente?: Cliente) => void
  placeholder?: string
  disabled?: boolean
}

export default function ClienteSearchSelect({ value, onChange, placeholder = 'Seleccionar cliente...', disabled }: Props) {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [inputValue, setInputValue] = useState('')

  const fetchClientes = useCallback(async (q: string) => {
    const res = await fetch(`/api/clientes${q ? `?q=${encodeURIComponent(q)}` : ''}`)
    const { data } = await res.json()
    setClientes(data ?? [])
  }, [])

  useEffect(() => { fetchClientes('') }, [fetchClientes])
  useEffect(() => {
    const timer = setTimeout(() => fetchClientes(inputValue), 300)
    return () => clearTimeout(timer)
  }, [inputValue, fetchClientes])

  const selected = clientes.find(c => c.id === value) ?? null

  return (
    <Autocomplete
      options={clientes}
      getOptionLabel={c => c.nombre_comercial}
      value={selected}
      inputValue={inputValue}
      onInputChange={(_, v) => setInputValue(v)}
      onChange={(_, c) => onChange(c?.id ?? '', c ?? undefined)}
      disabled={disabled}
      filterOptions={x => x}
      noOptionsText="Sin clientes"
      renderInput={params => (
        <TextField {...params} placeholder={placeholder} size="small" />
      )}
      renderOption={(props, c) => (
        <li {...props} key={c.id}>
          <div>
            <Typography variant="body2" sx={{ fontWeight: 500 }}>{c.nombre_comercial}</Typography>
            {c.nombre && <Typography variant="caption" color="text.secondary">{c.nombre}</Typography>}
          </div>
        </li>
      )}
    />
  )
}
