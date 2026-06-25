import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { createClient } from '@supabase/supabase-js'
import { getOAuth2Client } from '@/lib/google/auth'

// TEMPORAL: diagnóstico. Borrar tras depurar.
export async function GET(request: Request) {
  const auth = getOAuth2Client()
  const drive = google.drive({ version: 'v3', auth })
  const params = new URL(request.url).searchParams

  const out: Record<string, unknown> = {}

  try {
    const { data } = await drive.about.get({ fields: 'user(emailAddress)' })
    out.cuenta = data.user?.emailAddress ?? null
  } catch (e) {
    out.cuenta = `ERROR: ${e instanceof Error ? e.message : e}`
  }

  function textoCelda(cell: { content?: { paragraph?: { elements?: { textRun?: { content?: string } }[] } }[] }): string {
    let s = ''
    for (const c of cell.content ?? [])
      for (const e of c.paragraph?.elements ?? []) s += e.textRun?.content ?? ''
    return s.replace(/\s+/g, ' ').trim()
  }

  // ── Estructura de las tablas de un documento ──
  const idDoc = params.get('id')
  if (idDoc) {
    try {
      const docs = google.docs({ version: 'v1', auth })
      const { data: doc } = await docs.documents.get({ documentId: idDoc })
      const tablas: unknown[] = []
      for (const el of doc.body?.content ?? []) {
        if (!el.table) continue
        const filas = el.table.tableRows ?? []
        tablas.push({
          startIndex: el.startIndex,
          filas: filas.length,
          contenido: filas.map(r => (r.tableCells ?? []).map(c => textoCelda(c))),
        })
      }
      out.tablas = tablas
    } catch (e) {
      out.tablas = `ERROR: ${e instanceof Error ? e.message : e}`
    }
  }

  // ── Datos del cliente vía service role (sin RLS) ──
  const supa = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)
  const idCliente = params.get('cliente')
  if (idCliente) {
    const { data } = await supa.from('clientes').select('nombre_comercial, productos_certificado, certificado_url').eq('id', idCliente).single()
    out.cliente = data
  }
  if (params.has('clientes')) {
    const { data } = await supa.from('clientes').select('id, nombre_comercial, productos_certificado')
    out.clientes = (data ?? []).map(c => ({
      id: c.id,
      nombre: c.nombre_comercial,
      nProductos: (c.productos_certificado ?? []).length,
    }))
  }

  out.plantilla_certificado = await check(process.env.CERTIFICADO_TEMPLATE_ID)
  out.carpeta_certificados = await check(process.env.CERTIFICADOS_FOLDER_ID)

  async function check(id: string | undefined) {
    if (!id) return 'SIN_ID'
    try {
      const { data } = await drive.files.get({ fileId: id, fields: 'name,owners(emailAddress)', supportsAllDrives: true })
      return { name: data.name, owners: data.owners?.map(o => o.emailAddress) }
    } catch (e) {
      return `ERROR: ${e instanceof Error ? e.message : e}`
    }
  }

  return NextResponse.json(out)
}
