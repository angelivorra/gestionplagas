import { google, type docs_v1 } from 'googleapis'
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

export type FilaProductoCertificado = {
  producto: string
  registro: string
  plazo: string
  cantidad: string
  vector: string
}

export async function generarCertificado(
  cliente: {
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
  },
  productos: FilaProductoCertificado[],
  fecha: string,
): Promise<{ docId: string; url: string }> {
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
    '{{FECHA}}': fecha,
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

  await rellenarTablaProductos(docs, docId, productos)

  return { docId, url: `https://docs.google.com/document/d/${docId}/edit` }
}

type DocsClient = ReturnType<typeof google.docs>

function textoCelda(cell: docs_v1.Schema$TableCell | undefined): string {
  let s = ''
  for (const c of cell?.content ?? [])
    for (const e of c.paragraph?.elements ?? [])
      s += e.textRun?.content ?? ''
  return s
}

// Busca la tabla de productos, incluso si está anidada dentro de otra tabla
// (la plantilla envuelve todo en una tabla-marco de una sola celda).
function buscarTabla(elements: docs_v1.Schema$StructuralElement[] | undefined): { startIndex: number; filas: docs_v1.Schema$TableRow[] } | null {
  for (const el of elements ?? []) {
    const filas = el.table?.tableRows
    if (!filas) continue
    if (textoCelda(filas[0]?.tableCells?.[0]).includes('Producto Utilizado')) {
      return { startIndex: el.startIndex!, filas }
    }
    for (const row of filas)
      for (const cell of row.tableCells ?? []) {
        const found = buscarTabla(cell.content)
        if (found) return found
      }
  }
  return null
}

function localizarTablaProductos(doc: docs_v1.Schema$Document) {
  return buscarTabla(doc.body?.content)
}

// Rellena la tabla "Diagnosis y Productos Aplicados": una fila por producto.
// La plantilla trae cabecera + 1 fila vacía; insertamos las filas extra necesarias.
async function rellenarTablaProductos(docs: DocsClient, documentId: string, productos: FilaProductoCertificado[]) {
  if (productos.length === 0) return

  let doc = (await docs.documents.get({ documentId })).data
  let tabla = localizarTablaProductos(doc)
  if (!tabla) return

  const filasDatos = tabla.filas.length - 1 // sin cabecera
  const aAniadir = Math.max(0, productos.length - filasDatos)

  if (aAniadir > 0) {
    const requests = Array.from({ length: aAniadir }, (_, i) => ({
      insertTableRow: {
        tableCellLocation: {
          tableStartLocation: { index: tabla!.startIndex },
          rowIndex: filasDatos + i, // última fila de datos (cabecera = 0)
          columnIndex: 0,
        },
        insertBelow: true,
      },
    }))
    await docs.documents.batchUpdate({ documentId, requestBody: { requests } })
    doc = (await docs.documents.get({ documentId })).data
    tabla = localizarTablaProductos(doc)
    if (!tabla) return
  }

  // Insertar texto de atrás hacia delante para que los índices no se desplacen
  const inserts: { index: number; text: string }[] = []
  productos.forEach((p, r) => {
    const fila = tabla!.filas[r + 1] // saltar cabecera
    const cells = fila?.tableCells
    if (!cells) return
    const valores = [p.producto, p.registro, p.plazo, p.cantidad, p.vector]
    cells.forEach((cell, c) => {
      const index = cell.content?.[0]?.startIndex
      const text = valores[c] ?? ''
      if (index != null && text) inserts.push({ index, text })
    })
  })
  inserts.sort((a, b) => b.index - a.index)

  if (inserts.length > 0) {
    await docs.documents.batchUpdate({
      documentId,
      requestBody: {
        requests: inserts.map(i => ({ insertText: { location: { index: i.index }, text: i.text } })),
      },
    })
  }
}

export async function eliminarDocumento(docId: string): Promise<void> {
  const drive = google.drive({ version: 'v3', auth: getOAuth2Client() })
  await drive.files.delete({ fileId: docId })
}
