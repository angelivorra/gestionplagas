import { google } from 'googleapis'
import { getOAuth2Client } from './auth'

const TEMPLATE_ID = process.env.CONTRATO_TEMPLATE_ID!
const CONTRATOS_FOLDER_ID = process.env.CONTRATOS_FOLDER_ID!

const CERTIFICADO_TEMPLATE_ID = process.env.CERTIFICADO_TEMPLATE_ID!
const CERTIFICADOS_FOLDER_ID = process.env.CERTIFICADOS_FOLDER_ID!

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

  // Copiar a raíz primero, luego mover a la carpeta destino
  const { data: copia } = await drive.files.copy({
    fileId: TEMPLATE_ID,
    requestBody: { name: cliente.nombre_comercial },
    fields: 'id, parents',
  })

  const docId = copia.id!
  const parentesActuales = (copia.parents ?? []).join(',')

  await drive.files.update({
    fileId: docId,
    addParents: CONTRATOS_FOLDER_ID,
    removeParents: parentesActuales,
    fields: 'id',
  })

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

export async function generarCertificado(cliente: {
  nombre_comercial: string
  nombre: string | null
  dni: string | null
  direccion: string | null
  fecha_inicio_contrato: string | null
  fecha_vencimiento_contrato: string | null
  periodicidad: string | null
  importe_contrato: number | null
  importe_actuacion_requerimiento: number | null
  actuacion_texto: string | null
  importe_traslado: number | null
}): Promise<{ docId: string; url: string }> {
  const auth = getOAuth2Client()
  const drive = google.drive({ version: 'v3', auth })
  const docs = google.docs({ version: 'v1', auth })

  // Copiar a raíz primero, luego mover a la carpeta destino
  const { data: copia } = await drive.files.copy({
    fileId: CERTIFICADO_TEMPLATE_ID,
    requestBody: { name: `Certificado - ${cliente.nombre_comercial}` },
    fields: 'id, parents',
  })

  const docId = copia.id!
  const parentesActuales = (copia.parents ?? []).join(',')

  await drive.files.update({
    fileId: docId,
    addParents: CERTIFICADOS_FOLDER_ID,
    removeParents: parentesActuales,
    fields: 'id',
  })

  const variables: Record<string, string> = {
    '{{RAZON_SOCIAL}}': cliente.nombre_comercial,
    '{{NOMBRE}}': cliente.nombre ?? '',
    '{{NIF}}': cliente.dni ?? '',
    '{{DIRECCION}}': cliente.direccion ?? '',
    '{{INICIO}}': formatDate(cliente.fecha_inicio_contrato),
    '{{VENCIMIENTO}}': formatDate(cliente.fecha_vencimiento_contrato),
    '{{PERIODICIDAD}}': cliente.periodicidad ?? '',
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

export async function eliminarDocumento(docId: string): Promise<void> {
  const drive = google.drive({ version: 'v3', auth: getOAuth2Client() })
  await drive.files.delete({ fileId: docId })
}
