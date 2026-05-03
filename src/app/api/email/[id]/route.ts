import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { renderToBuffer } from '@react-pdf/renderer'
import type { DocumentProps } from '@react-pdf/renderer'
import PDTDocument from '@/lib/pdf/pdt-document'
import { sendEmail } from '@/lib/google/gmail'
import type { Visita, Cliente, Producto, ServicioAplicado } from '@/lib/types'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: raw, error } = await supabase
    .from('visitas')
    .select('*, clientes(*)')
    .eq('id', id)
    .single()

  if (error || !raw) return NextResponse.json({ error: 'Visita no encontrada' }, { status: 404 })

  const row = raw as Visita & { clientes: Cliente | null }
  const cliente = row.clientes
  const email = cliente?.correo_electronico
  if (!email) return NextResponse.json({ error: 'El cliente no tiene email' }, { status: 400 })

  const servicios = (row.servicios as ServicioAplicado[] | null) ?? []
  const productoIds = [...new Set(servicios.flatMap(s => s.productos.map(p => p.producto_id).filter(Boolean)))]
  let productosMap: Record<string, Producto> = {}
  if (productoIds.length > 0) {
    const { data: prods } = await supabase.from('productos').select('*').in('id', productoIds)
    productosMap = Object.fromEntries((prods ?? []).map(p => [p.id, p]))
  }

  const partNum = id.slice(-8).toUpperCase()
  const element = React.createElement(PDTDocument, { visita: row, cliente, productosMap, partNum }) as React.ReactElement<DocumentProps>
  const buffer = await renderToBuffer(element)

  const empresa = (cliente?.nombre_comercial ?? 'PDT').replace(/[^a-zA-Z0-9 ]/g, '').trim().replace(/\s+/g, '-')
  const filename = `PDT-${empresa}-${row.fecha_tratamiento}.pdf`

  try {
    await sendEmail({
      to: email,
      subject: `Parte de Trabajo - ${cliente?.nombre_comercial} - ${row.fecha_tratamiento}`,
      body: `Estimado/a cliente,\n\nLe remitimos el parte de trabajo correspondiente al servicio de control de plagas realizado el ${row.fecha_tratamiento}.\n\nQuedamos a su disposición para cualquier consulta.\n\nAtentamente,\nSACEBA Control de Plagas`,
      pdfUrl: row.pdf_url ?? undefined,
      pdfBuffer: Buffer.from(buffer),
      pdfFilename: filename,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error desconocido'
    console.error('Error enviando email:', message)
    return NextResponse.json({ error: `No se pudo enviar el correo: ${message}` }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
