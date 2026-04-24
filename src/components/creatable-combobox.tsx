'use client'

import { useState, useEffect, useRef } from 'react'
import Autocomplete, { createFilterOptions } from '@mui/material/Autocomplete'
import TextField from '@mui/material/TextField'
import type { OpcionLista } from '@/lib/types'

interface Props {
  tabla: string
  categoria?: string
  placeholder?: string
  value: string
  onChange: (value: string) => void
  allowDelete?: boolean
  disabled?: boolean
}

type Option = { valor: string; id?: string; inputValue?: string }

const filter = createFilterOptions<Option>()

export default function CreatableCombobox({ tabla, categoria, placeholder = 'Seleccionar...', value, onChange, disabled }: Props) {
  const [opciones, setOpciones] = useState<Option[]>([])
  const fetched = useRef(false)

  useEffect(() => {
    if (fetched.current) return
    fetched.current = true
    fetch(`/api/opciones/${tabla}`)
      .then(r => r.json())
      .then(({ data }) => {
        const list: OpcionLista[] = categoria
          ? (data ?? []).filter((o: OpcionLista) => o.categoria === categoria)
          : (data ?? [])
        setOpciones(list.map(o => ({ valor: o.valor, id: o.id })))
      })
  }, [tabla, categoria])

  const selected: Option | null = value ? { valor: value } : null

  async function handleCreate(inputValue: string) {
    const res = await fetch(`/api/opciones/${tabla}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ valor: inputValue.trim(), categoria: categoria ?? null }),
    })
    const { data } = await res.json()
    if (data) {
      setOpciones(prev => [...prev, { valor: data.valor, id: data.id }])
      onChange(data.valor)
    }
  }

  return (
    <Autocomplete
      value={selected}
      onChange={async (_, newValue) => {
        if (!newValue) { onChange(''); return }
        if (typeof newValue === 'string') { onChange(newValue); return }
        if (newValue.inputValue) {
          await handleCreate(newValue.inputValue)
        } else {
          onChange(newValue.valor)
        }
      }}
      filterOptions={(options, params) => {
        const filtered = filter(options, params)
        const { inputValue } = params
        const isExisting = options.some(o => inputValue.toLowerCase() === o.valor.toLowerCase())
        if (inputValue !== '' && !isExisting) {
          filtered.push({ inputValue, valor: `Crear "${inputValue}"` })
        }
        return filtered
      }}
      options={opciones}
      getOptionLabel={o => {
        if (typeof o === 'string') return o
        if (o.inputValue) return o.inputValue
        return o.valor
      }}
      selectOnFocus
      clearOnBlur
      handleHomeEndKeys
      freeSolo
      disabled={disabled}
      renderInput={params => <TextField {...params} placeholder={placeholder} size="small" />}
      renderOption={(props, option) => <li {...props} key={option.id ?? option.valor}>{option.valor}</li>}
    />
  )
}
