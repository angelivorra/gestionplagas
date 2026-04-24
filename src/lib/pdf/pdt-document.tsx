import React from 'react'
import { Document, Page, View, Text, StyleSheet, Image } from '@react-pdf/renderer'
import type { Visita, Cliente, Producto } from '@/lib/types'

const C = {
  green: '#059669',
  greenDark: '#047857',
  greenLight: '#d1fae5',
  dark: '#111827',
  gray: '#6b7280',
  grayLight: '#9ca3af',
  border: '#e5e7eb',
  bg: '#f9fafb',
  white: '#ffffff',
}

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 9,
    color: C.dark,
    paddingTop: 36,
    paddingBottom: 64,
    paddingHorizontal: 44,
    backgroundColor: C.white,
  },

  // ─── Header ───────────────────────────────────────────
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
    paddingBottom: 14,
    borderBottomWidth: 3,
    borderBottomColor: C.green,
  },
  logo: { fontSize: 26, fontFamily: 'Helvetica-Bold', color: C.green },
  logoTagline: { fontSize: 8.5, color: C.gray, marginTop: 2 },
  logoInfo: { fontSize: 7.5, color: C.grayLight, marginTop: 1 },
  titleBlock: { alignItems: 'flex-end' },
  docTitle: { fontSize: 16, fontFamily: 'Helvetica-Bold', color: C.dark, letterSpacing: 0.5 },
  numBadge: {
    backgroundColor: C.green, borderRadius: 4,
    paddingHorizontal: 8, paddingVertical: 3, marginTop: 6, alignSelf: 'flex-end',
  },
  numBadgeText: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: C.white },
  docMeta: { fontSize: 8, color: C.gray, marginTop: 3 },

  // ─── Sections ─────────────────────────────────────────
  section: { marginBottom: 14 },
  sectionBar: {
    backgroundColor: C.greenLight,
    borderLeftWidth: 3, borderLeftColor: C.green,
    paddingHorizontal: 8, paddingVertical: 4,
    borderRadius: 3, marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 7.5, fontFamily: 'Helvetica-Bold',
    color: C.greenDark, textTransform: 'uppercase', letterSpacing: 1,
  },

  // ─── Fields ───────────────────────────────────────────
  row: { flexDirection: 'row', marginBottom: 6 },
  field: { flex: 1, marginRight: 10 },
  fieldLast: { flex: 1 },
  label: { fontSize: 7, color: C.grayLight, marginBottom: 1.5 },
  value: { fontSize: 9, color: C.dark },

  // ─── Table ────────────────────────────────────────────
  tableHead: {
    flexDirection: 'row',
    backgroundColor: C.green,
    paddingVertical: 5, paddingHorizontal: 8,
    borderRadius: 3, marginBottom: 1,
  },
  tableHeadCell: { fontSize: 7.5, fontFamily: 'Helvetica-Bold', color: C.white },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 7, paddingHorizontal: 8,
    backgroundColor: C.bg,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  tableCell: { fontSize: 9, color: C.dark },

  // ─── Chips ────────────────────────────────────────────
  chipsWrap: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
  chip: {
    backgroundColor: C.greenLight, borderRadius: 10,
    paddingHorizontal: 7, paddingVertical: 2,
    marginRight: 4, marginBottom: 4,
  },
  chipText: { fontSize: 7.5, color: C.greenDark },

  // ─── Observaciones ────────────────────────────────────
  obsBox: {
    borderWidth: 1, borderColor: C.border, borderRadius: 4,
    padding: 8, backgroundColor: C.bg,
  },
  obsText: { fontSize: 9, color: C.dark, lineHeight: 1.6 },

  // ─── Firmas ───────────────────────────────────────────
  sigsRow: { flexDirection: 'row' },
  sigBox: {
    flex: 1, borderWidth: 1, borderColor: C.border,
    borderRadius: 4, padding: 8, minHeight: 95,
  },
  sigBoxLeft: { marginRight: 10 },
  sigLabel: { fontSize: 7, color: C.grayLight, marginBottom: 5 },
  sigImg: { width: '100%', height: 60, objectFit: 'contain' },
  sigEmptyLine: { borderBottomWidth: 1, borderBottomColor: C.border, marginTop: 40 },
  sigName: {
    fontSize: 8, color: C.dark, fontFamily: 'Helvetica-Bold',
    borderTopWidth: 1, borderTopColor: C.border,
    marginTop: 6, paddingTop: 4,
  },

  // ─── Footer ───────────────────────────────────────────
  footer: {
    position: 'absolute', bottom: 22, left: 44, right: 44,
    flexDirection: 'row', justifyContent: 'space-between',
    borderTopWidth: 1, borderTopColor: C.border, paddingTop: 7,
  },
  footerText: { fontSize: 7, color: C.grayLight },
})

// ─── helpers ──────────────────────────────────────────────────────────────────

function fmt(date: string) {
  const [y, m, d] = date.split('-')
  return `${d}/${m}/${y}`
}

function SectionBar({ children }: { children: string }) {
  return (
    <View style={s.sectionBar}>
      <Text style={s.sectionTitle}>{children}</Text>
    </View>
  )
}

function Field({ label, value, flex = 1, last = false }: {
  label: string; value?: string | null; flex?: number; last?: boolean
}) {
  if (!value) return null
  return (
    <View style={[last ? s.fieldLast : s.field, { flex }]}>
      <Text style={s.label}>{label.toUpperCase()}</Text>
      <Text style={s.value}>{value}</Text>
    </View>
  )
}

// ─── Document ─────────────────────────────────────────────────────────────────

export interface PDTProps {
  visita: Visita
  cliente: Cliente | null
  producto: Producto | null
  partNum: string
}

export default function PDTDocument({ visita, cliente, producto, partNum }: PDTProps) {
  const horaRango = visita.hora_inicio
    ? `${visita.hora_inicio}${visita.hora_fin ? ` – ${visita.hora_fin}` : ''}`
    : null

  return (
    <Document>
      <Page size="A4" style={s.page}>

        {/* ── Header ── */}
        <View style={s.header}>
          <View>
            <Text style={s.logo}>SACEBA</Text>
            <Text style={s.logoTagline}>Control de Plagas</Text>
            <Text style={s.logoInfo}>NIF: B-00000000</Text>
            <Text style={s.logoInfo}>Tel: 000 000 000</Text>
            <Text style={s.logoInfo}>info@saceba.es</Text>
          </View>
          <View style={s.titleBlock}>
            <Text style={s.docTitle}>PARTE DE TRABAJO</Text>
            <Text style={s.docMeta}>Fecha: {fmt(visita.fecha_tratamiento)}</Text>
            {horaRango && <Text style={s.docMeta}>Hora: {horaRango}</Text>}
            <View style={s.numBadge}>
              <Text style={s.numBadgeText}>PDT-{partNum}</Text>
            </View>
          </View>
        </View>

        {/* ── Datos del cliente ── */}
        {cliente && (
          <View style={s.section}>
            <SectionBar>Datos del cliente</SectionBar>
            <View style={s.row}>
              <Field label="Razón social / Nombre" value={cliente.nombre_comercial} />
              <Field label="Persona de contacto" value={cliente.nombre} last />
            </View>
            <View style={s.row}>
              <Field label="Dirección" value={cliente.direccion} />
              <Field label="NIF / CIF" value={cliente.dni} last flex={0.5} />
            </View>
            <View style={s.row}>
              <Field label="Correo electrónico" value={cliente.correo_electronico} last />
            </View>
          </View>
        )}

        {/* ── Servicio ── */}
        {(visita.descripcion_servicio || visita.tipo_servicio) && (
          <View style={s.section}>
            <SectionBar>Descripción del servicio</SectionBar>
            <View style={s.row}>
              <Field label="Descripción" value={visita.descripcion_servicio} />
              <Field label="Tipo de servicio" value={visita.tipo_servicio} last />
            </View>
          </View>
        )}

        {/* ── Actuación ── */}
        {(producto || (visita.lugar_actuacion && visita.lugar_actuacion.length > 0)) && (
          <View style={s.section}>
            <SectionBar>Actuación</SectionBar>

            {producto && (
              <View style={{ marginBottom: 8 }}>
                <View style={s.tableHead}>
                  <Text style={[s.tableHeadCell, { flex: 2 }]}>Producto</Text>
                  <Text style={[s.tableHeadCell, { flex: 1.5 }]}>Nº Registro</Text>
                  <Text style={[s.tableHeadCell, { flex: 0.8 }]}>Cantidad</Text>
                  <Text style={[s.tableHeadCell, { flex: 1.5 }]}>Plazo de seguridad</Text>
                </View>
                <View style={s.tableRow}>
                  <Text style={[s.tableCell, { flex: 2 }]}>{producto.nombre_comercial}</Text>
                  <Text style={[s.tableCell, { flex: 1.5 }]}>{producto.numero_registro ?? '—'}</Text>
                  <Text style={[s.tableCell, { flex: 0.8 }]}>{visita.cantidad ?? '—'}</Text>
                  <Text style={[s.tableCell, { flex: 1.5 }]}>
                    {visita.plazo_seguridad || (producto.plazo_seguridad ? `${producto.plazo_seguridad} h` : '—')}
                  </Text>
                </View>
              </View>
            )}

            {visita.lugar_actuacion && visita.lugar_actuacion.length > 0 && (
              <View>
                <Text style={[s.label, { marginBottom: 4 }]}>ZONAS DE ACTUACIÓN</Text>
                <View style={s.chipsWrap}>
                  {visita.lugar_actuacion.map((lugar, i) => (
                    <View key={i} style={s.chip}>
                      <Text style={s.chipText}>{lugar}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </View>
        )}

        {/* ── Observaciones ── */}
        {visita.observaciones && (
          <View style={s.section}>
            <SectionBar>Observaciones</SectionBar>
            <View style={s.obsBox}>
              <Text style={s.obsText}>{visita.observaciones}</Text>
            </View>
          </View>
        )}

        {/* ── Ubicación ── */}
        {(visita.direccion_geo || visita.latitud) && (
          <View style={s.section}>
            <SectionBar>Ubicación del servicio</SectionBar>
            {visita.direccion_geo && <Text style={s.value}>{visita.direccion_geo}</Text>}
            {visita.latitud && visita.longitud && (
              <Text style={[s.value, { color: C.grayLight, fontSize: 8, marginTop: 2 }]}>
                GPS: {Number(visita.latitud).toFixed(6)}, {Number(visita.longitud).toFixed(6)}
              </Text>
            )}
          </View>
        )}

        {/* ── Firmas ── */}
        <View style={s.section}>
          <SectionBar>Firmas y conformidad</SectionBar>
          <View style={s.sigsRow}>
            <View style={[s.sigBox, s.sigBoxLeft]}>
              <Text style={s.sigLabel}>RESPONSABLE APLICADOR</Text>
              {visita.firma_tecnico_url
                ? <Image src={visita.firma_tecnico_url} style={s.sigImg} />
                : <View style={s.sigEmptyLine} />
              }
              <Text style={s.sigName}>SACEBA Control de Plagas</Text>
            </View>
            <View style={s.sigBox}>
              <Text style={s.sigLabel}>FIRMA DEL CLIENTE</Text>
              {visita.firma_cliente_url
                ? <Image src={visita.firma_cliente_url} style={s.sigImg} />
                : <View style={s.sigEmptyLine} />
              }
              {visita.nombre_cliente_firma && (
                <Text style={s.sigName}>{visita.nombre_cliente_firma}</Text>
              )}
            </View>
          </View>
        </View>

        {/* ── Footer ── */}
        <View style={s.footer} fixed>
          <Text style={s.footerText}>
            SACEBA Control de Plagas · Documento generado el {new Date().toLocaleDateString('es-ES')}
          </Text>
          <Text
            style={s.footerText}
            render={({ pageNumber, totalPages }) => `Página ${pageNumber} de ${totalPages}`}
          />
        </View>

      </Page>
    </Document>
  )
}
