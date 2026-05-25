import { google } from 'googleapis'
import { getOAuth2Client } from './auth'

const TEMPLATE_ID = '1kfklIF_EM9pX_220h5FCJrCi7nQHGPayWvMHK30BDco'
const CONTRATOS_FOLDER_ID = '1Uq-7nHyVTbgqDpD5H9UT2jZk1T2n0_dy'

function formatDate(iso: string | null): string {
  if (!iso) return ''
  const [y, m, d] = iso.split('-')
  return `${d}/${m}/${y}`
}

function formatEuros(value: number | null): string {
  if (value == null) return ''
  return value.toFixed(2).replace('.', ',') + ' €'
}

export async function generarContrato(cliente: {
  nombre_comercial: string
  nombre: string | null
  dni: string | null
  direccion: string | null
  fecha_inicio_contrato: string | null
  fecha_vencimiento_contrato: string | null
  importe_contrato: number | null
  importe_actuacion_requerimiento: number | null
  actuacion_texto: string | null
  importe_traslado: number | null
}): Promise<{ docId: string; url: string }> {
  const auth = getOAuth2Client()
  const drive = google.drive({ version: 'v3', auth })
  const docs = google.docs({ version: 'v1', auth })

  const { data: copia } = await drive.files.copy({
    fileId: TEMPLATE_ID,
    requestBody: {
      name: `Contrato - ${cliente.nombre_comercial}`,
      parents: [CONTRATOS_FOLDER_ID],
    },
    fields: 'id',
  })

  const docId = copia.id!

  const variables: Record<string, string> = {
    '{{RAZON_SOCIAL}}': cliente.nombre_comercial,
    '{{NOMBRE}}': cliente.nombre ?? '',
    '{{NIF}}': cliente.dni ?? '',
    '{{DIRECCION}}': cliente.direccion ?? '',
    '{{INICIO}}': formatDate(cliente.fecha_inicio_contrato),
    '{{VENCIMIENTO}}': formatDate(cliente.fecha_vencimiento_contrato),
    '{{PRECIO}}': formatEuros(cliente.importe_contrato),
    '{{PRECIO_ACTUACION}}': formatEuros(cliente.importe_actuacion_requerimiento),
    '{{ACTUACION}}': cliente.actuacion_texto ?? '',
    '{{PORTES}}': formatEuros(cliente.importe_traslado),
  }

  await docs.documents.batchUpdate({
    documentId: docId,
    requestBody: {
      requests: Object.entries(variables).map(([from, to]) => ({
        replaceAllText: {
          containsText: { text: from, matchCase: true },
          replaceText: to,
        },
      })),
    },
  })

  return { docId, url: `https://docs.google.com/document/d/${docId}/edit` }
}
