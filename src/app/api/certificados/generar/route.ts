import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { generarCertificado, eliminarDocumento, type FilaProductoCertificado } from '@/lib/google/docs'
import { extractFileId } from '@/lib/google/drive'
import type { ProductoCertificado } from '@/lib/types'

function fechaHoy(): string {
  const d = new Date()
  const dd = String(d.getDate()).padStart(2, '0')
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  return `${dd}/${mm}/${d.getFullYear()}`
}

export async function POST(request: Request) {
  const supabase = await createClient()
  const { clienteId } = await request.json()

  const { data: cliente, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('id', clienteId)
    .single()

  if (error || !cliente) return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })

  if (cliente.certificado_url) {
    const docId = extractFileId(cliente.certificado_url)
    if (docId) await eliminarDocumento(docId).catch(() => null)
  }

  // Resolver datos de catálogo (registro y plazo) para cada producto del cliente
  const seleccion: ProductoCertificado[] = (cliente.productos_certificado ?? []).filter(
    (p: ProductoCertificado) => p.producto_id,
  )
  const ids = seleccion.map(p => p.producto_id)
  const { data: catalogo } = ids.length
    ? await supabase.from('productos').select('id, nombre_comercial, numero_registro, plazo_seguridad').in('id', ids)
    : { data: [] }

  const filas: FilaProductoCertificado[] = seleccion.map(p => {
    const prod = (catalogo ?? []).find(c => c.id === p.producto_id)
    return {
      producto: prod?.nombre_comercial ?? '',
      registro: prod?.numero_registro ?? '',
      plazo: prod?.plazo_seguridad != null ? String(prod.plazo_seguridad) : '',
      cantidad: p.cantidad ?? '',
      vector: p.vector_diana ?? '',
    }
  })

  const { url } = await generarCertificado(cliente, filas, fechaHoy())

  await supabase.from('clientes').update({ certificado_url: url }).eq('id', clienteId)

  return NextResponse.json({ data: { url } })
}
