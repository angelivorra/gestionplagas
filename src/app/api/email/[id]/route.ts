import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { sendEmail } from '@/lib/google/gmail'

export async function POST(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: visita, error } = await supabase
    .from('visitas')
    .select('fecha_tratamiento, pdf_url, clientes(nombre_comercial, correo_electronico)')
    .eq('id', id)
    .single()

  if (error || !visita) return NextResponse.json({ error: 'Visita no encontrada' }, { status: 404 })

  const cliente = visita.clientes as unknown as { nombre_comercial: string; correo_electronico: string | null } | null
  const email = cliente?.correo_electronico
  if (!email) return NextResponse.json({ error: 'El cliente no tiene email' }, { status: 400 })

  try {
    await sendEmail({
      to: email,
      subject: `Parte de Trabajo - ${cliente?.nombre_comercial} - ${visita.fecha_tratamiento}`,
      body: `Estimado/a cliente,\n\nLe remitimos el parte de trabajo correspondiente al servicio de control de plagas realizado el ${visita.fecha_tratamiento}.\n\nQuedamos a su disposición para cualquier consulta.\n\nAtentamente,\nSACEBA Control de Plagas`,
      pdfUrl: visita.pdf_url ?? undefined,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Error desconocido'
    console.error('Error enviando email:', message)
    return NextResponse.json({ error: `No se pudo enviar el correo: ${message}` }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
