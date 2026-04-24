import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('visita_fotos')
    .select('*')
    .eq('visita_id', id)
    .order('created_at')
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const formData = await request.formData()
  const file = formData.get('foto') as File
  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })

  const ext = file.name.split('.').pop()
  const path = `${id}/${Date.now()}.${ext}`
  const { error: uploadError } = await supabase.storage.from('fotos').upload(path, file)
  if (uploadError) return NextResponse.json({ error: uploadError.message }, { status: 500 })

  const { data: { publicUrl } } = supabase.storage.from('fotos').getPublicUrl(path)

  const { data, error } = await supabase
    .from('visita_fotos')
    .insert({ visita_id: id, foto_url: publicUrl })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data }, { status: 201 })
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const fotoId = searchParams.get('fotoId')
  if (!fotoId) return NextResponse.json({ error: 'Missing fotoId' }, { status: 400 })

  const { data: foto } = await supabase.from('visita_fotos').select('foto_url').eq('id', fotoId).single()
  if (foto?.foto_url) {
    const path = foto.foto_url.split('/fotos/')[1]
    await supabase.storage.from('fotos').remove([path])
  }

  const { error } = await supabase.from('visita_fotos').delete().eq('id', fotoId).eq('visita_id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ success: true })
}
