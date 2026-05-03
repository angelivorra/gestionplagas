import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(_req: Request, { params }: { params: Promise<{ tabla: string }> }) {
  const { tabla } = await params
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('opciones_lista')
    .select('*')
    .eq('tabla', tabla)
    .order('orden')
    .order('valor')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(request: Request, { params }: { params: Promise<{ tabla: string }> }) {
  const { tabla } = await params
  const supabase = await createClient()
  const { valor, categoria } = await request.json()
  if (!valor?.trim()) return NextResponse.json({ error: 'Valor requerido' }, { status: 400 })

  const query = supabase
    .from('opciones_lista')
    .select('*')
    .eq('tabla', tabla)
    .eq('valor', valor.trim())

  if (categoria) query.eq('categoria', categoria)
  else query.is('categoria', null)

  const { data: existing } = await query.maybeSingle()
  if (existing) return NextResponse.json({ data: existing })

  const { data, error } = await supabase
    .from('opciones_lista')
    .insert({ tabla, valor: valor.trim(), categoria: categoria ?? null })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}

export async function DELETE(request: Request, { params }: { params: Promise<{ tabla: string }> }) {
  const { tabla } = await params
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  const { error } = await supabase.from('opciones_lista').delete().eq('id', id).eq('tabla', tabla)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
