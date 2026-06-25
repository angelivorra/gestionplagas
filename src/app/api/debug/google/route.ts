import { NextResponse } from 'next/server'
import { google } from 'googleapis'
import { getOAuth2Client } from '@/lib/google/auth'

// TEMPORAL: diagnóstico de la cuenta de Google y acceso a plantilla/carpeta.
// Borrar tras depurar.
export async function GET() {
  const auth = getOAuth2Client()
  const drive = google.drive({ version: 'v3', auth })

  const out: Record<string, unknown> = {}

  try {
    const { data } = await drive.about.get({ fields: 'user(emailAddress,displayName)' })
    out.cuenta = data.user?.emailAddress ?? null
  } catch (e) {
    out.cuenta = `ERROR: ${e instanceof Error ? e.message : e}`
  }

  async function check(id: string | undefined) {
    if (!id) return 'SIN_ID'
    try {
      const { data } = await drive.files.get({ fileId: id, fields: 'id,name,owners(emailAddress)', supportsAllDrives: true })
      return { name: data.name, owners: data.owners?.map(o => o.emailAddress) }
    } catch (e) {
      return `ERROR: ${e instanceof Error ? e.message : e}`
    }
  }

  out.plantilla_certificado = await check(process.env.CERTIFICADO_TEMPLATE_ID)
  out.carpeta_certificados = await check(process.env.CERTIFICADOS_FOLDER_ID)
  out.plantilla_contrato = await check(process.env.CONTRATO_TEMPLATE_ID)
  out.carpeta_contratos = await check(process.env.CONTRATOS_FOLDER_ID)

  return NextResponse.json(out)
}
