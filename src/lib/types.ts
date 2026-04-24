export type Cliente = {
  id: string
  nombre_comercial: string
  nombre: string | null
  dni: string | null
  direccion: string | null
  correo_electronico: string | null
  plano_url: string | null
  observaciones: string | null
  created_at: string
}

export type Producto = {
  id: string
  nombre_comercial: string
  numero_registro: string | null
  plazo_seguridad: number | null
  principios_activos: string | null
  ficha_tecnica_url: string | null
  ficha_seguridad_url: string | null
}

export type Visita = {
  id: string
  cliente_id: string | null
  fecha_tratamiento: string
  descripcion_servicio: string | null
  tipo_servicio: string | null
  producto_id: string | null
  cantidad: string | null
  lugar_actuacion: string[] | null
  plazo_seguridad: string | null
  observaciones: string | null
  hora_inicio: string | null
  hora_fin: string | null
  latitud: number | null
  longitud: number | null
  direccion_geo: string | null
  firma_tecnico_url: string | null
  firma_cliente_url: string | null
  nombre_cliente_firma: string | null
  estado: 'borrador' | 'cerrado'
  pdf_url: string | null
  created_at: string
  clientes?: Cliente
}

export type VisitaFoto = {
  id: string
  visita_id: string
  foto_url: string
  descripcion: string | null
  created_at: string
}

export type OpcionLista = {
  id: string
  tabla: string
  categoria: string | null
  valor: string
  orden: number
}

export type ClienteDocumento = {
  id: string
  cliente_id: string
  visita_id: string | null
  tipo_documento: string | null
  archivo_url: string | null
  fecha: string
}
