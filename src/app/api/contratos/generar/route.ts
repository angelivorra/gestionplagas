import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { generarContrato, eliminarDocumento } from '@/lib/google/docs'
import { extractFileId } from '@/lib/google/drive'

export async function POST(request: Request) {
  const supabase = await createClient()
  const { clienteId } = await request.json()

  const { data: cliente, error } = await supabase
    .from('clientes')
    .select('*')
    .eq('id', clienteId)
    .single()

  if (error || !cliente) return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 })

  if (cliente.contrato_url) {
    const docId = extractFileId(cliente.contrato_url)
    if (docId) await eliminarDocumento(docId).catch(() => null)
  }

  const { url } = await generarContrato(cliente)

  await supabase.from('clientes').update({ contrato_url: url }).eq('id', clienteId)

  return NextResponse.json({ data: { url } })
}
