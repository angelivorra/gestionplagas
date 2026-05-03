import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { getOrCreateFolder, uploadToDrive, makePublic } from '@/lib/google/drive'

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const formData = await request.formData()
  const file = formData.get('file') as File
  const tipo = formData.get('tipo') as string

  if (!file) return NextResponse.json({ error: 'No file provided' }, { status: 400 })
  if (tipo !== 'tecnica' && tipo !== 'seguridad') {
    return NextResponse.json({ error: 'tipo debe ser "tecnica" o "seguridad"' }, { status: 400 })
  }

  const { data: producto, error: fetchError } = await supabase
    .from('productos')
    .select('nombre_comercial')
    .eq('id', id)
    .single()

  if (fetchError || !producto) return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })

  const nombreLimpio = producto.nombre_comercial
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .trim()
    .replace(/\s+/g, '-')

  const sacebaId = await getOrCreateFolder('SACEBA')
  const fichasFolder = await getOrCreateFolder('Fichas', sacebaId)
  const productoFolder = await getOrCreateFolder(nombreLimpio, fichasFolder)

  const label = tipo === 'tecnica' ? 'Ficha-Tecnica' : 'Ficha-Seguridad'
  const filename = `${label}-${nombreLimpio}.pdf`
  const buffer = Buffer.from(await file.arrayBuffer())

  const { id: fileId, webViewLink } = await uploadToDrive(buffer, filename, 'application/pdf', productoFolder)
  await makePublic(fileId)

  const campo = tipo === 'tecnica' ? 'ficha_tecnica_url' : 'ficha_seguridad_url'
  const { data, error } = await supabase
    .from('productos')
    .update({ [campo]: webViewLink })
    .eq('id', id)
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ data })
}
