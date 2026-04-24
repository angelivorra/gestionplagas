import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import type { DocumentProps } from '@react-pdf/renderer'
import PDTDocument from '@/lib/pdf/pdt-document'
import type { Visita, Cliente, Producto } from '@/lib/types'

type Row = Visita & { clientes: Cliente | null; productos: Producto | null }

async function buildPdf(id: string) {
  const supabase = await createClient()
  const { data: raw, error } = await supabase
    .from('visitas')
    .select('*, clientes(*), productos(*)')
    .eq('id', id)
    .single()

  if (error || !raw) return null

  const row = raw as Row
  const cliente = row.clientes ?? null
  const producto = row.productos ?? null
  const partNum = id.slice(-8).toUpperCase()

  const element = React.createElement(
    PDTDocument,
    { visita: row, cliente, producto, partNum },
  ) as React.ReactElement<DocumentProps>

  const buffer = await renderToBuffer(element)
  return { buffer, row }
}

function pdfFilename(row: Row) {
  const empresa = (row.clientes?.nombre_comercial ?? 'PDT')
    .replace(/[^a-zA-Z0-9 ]/g, '')
    .trim()
    .replace(/\s+/g, '-')
  return `PDT-${empresa}-${row.fecha_tratamiento}.pdf`
}

// GET → genera y descarga el PDF en el momento (requiere sesión activa)
export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const result = await buildPdf(id)
  if (!result) return NextResponse.json({ error: 'Visita no encontrada' }, { status: 404 })

  const { buffer, row } = result
  return new Response(new Uint8Array(buffer), {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${pdfFilename(row)}"`,
      'Cache-Control': 'no-store',
    },
  })
}

// POST → genera, sube a Storage y guarda pdf_url en la visita
export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const result = await buildPdf(id)
  if (!result) return NextResponse.json({ error: 'Visita no encontrada' }, { status: 404 })

  const { buffer } = result
  const supabase = await createClient()

  const { error: uploadError } = await supabase.storage
    .from('pdfs')
    .upload(`${id}.pdf`, new Uint8Array(buffer), { contentType: 'application/pdf', upsert: true })

  if (uploadError) {
    return NextResponse.json({ error: `Error al subir PDF: ${uploadError.message}` }, { status: 500 })
  }

  const { data: urlData } = supabase.storage.from('pdfs').getPublicUrl(`${id}.pdf`)
  const pdf_url = urlData.publicUrl

  const { data: updated, error: updateError } = await supabase
    .from('visitas')
    .update({ pdf_url })
    .eq('id', id)
    .select()
    .single()

  if (updateError) {
    return NextResponse.json({ error: updateError.message }, { status: 500 })
  }

  return NextResponse.json({ data: updated, pdf_url })
}
