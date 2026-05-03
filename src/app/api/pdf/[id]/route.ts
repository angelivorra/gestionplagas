import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import type { DocumentProps } from '@react-pdf/renderer'
import PDTDocument from '@/lib/pdf/pdt-document'
import type { Visita, Cliente, Producto, ServicioAplicado } from '@/lib/types'
import { getOrCreateFolder, uploadToDrive, makePublic } from '@/lib/google/drive'
import { sendEmail } from '@/lib/google/gmail'

type Row = Visita & { clientes: Cliente | null }

async function buildPdf(id: string) {
  const supabase = await createClient()
  const { data: raw, error } = await supabase
    .from('visitas')
    .select('*, clientes(*)')
    .eq('id', id)
    .single()

  if (error || !raw) return null

  const row = raw as Row
  const cliente = row.clientes ?? null
  const partNum = id.slice(-8).toUpperCase()

  const servicios = (row.servicios as ServicioAplicado[] | null) ?? []
  const productoIds = [...new Set(servicios.flatMap(s => s.productos.map(p => p.producto_id).filter(Boolean)))]

  let productosMap: Record<string, Producto> = {}
  if (productoIds.length > 0) {
    const { data: prods } = await supabase.from('productos').select('*').in('id', productoIds)
    productosMap = Object.fromEntries((prods ?? []).map(p => [p.id, p]))
  }

  const element = React.createElement(
    PDTDocument,
    { visita: row, cliente, productosMap, partNum },
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

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params

  const result = await buildPdf(id)
  if (!result) return NextResponse.json({ error: 'Visita no encontrada' }, { status: 404 })

  const { buffer, row } = result
  const supabase = await createClient()

  let fileId: string
  let webViewLink: string

  try {
    const sacebaFolder = await getOrCreateFolder('SACEBA')
    const pdfsFolder = await getOrCreateFolder('PDFs', sacebaFolder)
    const uploaded = await uploadToDrive(Buffer.from(buffer), pdfFilename(row), 'application/pdf', pdfsFolder)
    fileId = uploaded.id
    webViewLink = uploaded.webViewLink
    await makePublic(fileId)
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[PDF] Error subiendo a Drive:', msg)
    return NextResponse.json({ error: `Error subiendo a Drive: ${msg}` }, { status: 500 })
  }

  const pdf_url = webViewLink

  const { data: updated, error: updateError } = await supabase
    .from('visitas')
    .update({ pdf_url })
    .eq('id', id)
    .select()
    .single()

  if (updateError) return NextResponse.json({ error: updateError.message }, { status: 500 })

  const email = row.clientes?.correo_electronico
  if (email) {
    const cliente = row.clientes?.nombre_comercial ?? ''
    const fecha = row.fecha_tratamiento
    console.log('[PDF] Enviando email a:', email)
    try {
      await sendEmail({
        to: email,
        subject: `Parte de Trabajo - ${cliente} - ${fecha}`,
        body: `Estimado/a cliente,\n\nLe remitimos el parte de trabajo correspondiente al servicio de control de plagas realizado el ${fecha}.\n\nQuedamos a su disposición para cualquier consulta.\n\nAtentamente,\nSACEBA Control de Plagas`,
        pdfUrl: pdf_url,
        pdfBuffer: Buffer.from(buffer),
        pdfFilename: pdfFilename(row),
      })
      console.log('[PDF] Email enviado correctamente')
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      console.error('[PDF] Error enviando email:', msg)
    }
  } else {
    console.log('[PDF] Cliente sin email, no se envía correo')
  }

  return NextResponse.json({ data: updated, pdf_url })
}
