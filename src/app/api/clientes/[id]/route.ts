import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const [clienteRes, visitasRes, docsRes] = await Promise.all([
    supabase.from('clientes').select('*').eq('id', id).single(),
    supabase.from('visitas').select('id, fecha_tratamiento, tipo_servicio, estado, created_at').eq('cliente_id', id).order('created_at', { ascending: false }),
    supabase.from('cliente_documentos').select('*').eq('cliente_id', id).order('fecha', { ascending: false }),
  ])
  if (clienteRes.error) return NextResponse.json({ error: clienteRes.error.message }, { status: 404 })
  return NextResponse.json({ data: { ...clienteRes.data, visitas: visitasRes.data ?? [], documentos: docsRes.data ?? [] } })
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const body = await request.json()
  const { data, error } = await supabase.from('clientes').update(body).eq('id', id).select().single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { error } = await supabase.from('clientes').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
