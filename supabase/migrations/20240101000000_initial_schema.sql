-- ================================================================
-- SACEBA - Esquema base de datos
-- Ejecutar en Supabase SQL Editor (Dashboard > SQL Editor)
-- ================================================================

-- Clientes
CREATE TABLE clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_comercial VARCHAR(150) NOT NULL,
  nombre VARCHAR(100),
  dni VARCHAR(20) UNIQUE,
  direccion TEXT,
  correo_electronico VARCHAR(255),
  plano_url VARCHAR(255),
  observaciones TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tablas auxiliares dinámicas
CREATE TABLE opciones_lista (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tabla VARCHAR(50) NOT NULL,
  categoria VARCHAR(100),
  valor VARCHAR(150) NOT NULL,
  orden INT DEFAULT 0
);

-- Productos
CREATE TABLE productos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre_comercial VARCHAR(150) NOT NULL,
  numero_registro VARCHAR(50) UNIQUE,
  plazo_seguridad INT,
  principios_activos TEXT,
  ficha_tecnica_url VARCHAR(255),
  ficha_seguridad_url VARCHAR(255)
);

-- Visitas (PDTs)
CREATE TABLE visitas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clientes(id) ON DELETE SET NULL,
  fecha_tratamiento DATE NOT NULL DEFAULT CURRENT_DATE,
  descripcion_servicio VARCHAR(150),
  tipo_servicio VARCHAR(150),
  producto_id UUID REFERENCES productos(id) ON DELETE SET NULL,
  cantidad VARCHAR(50),
  lugar_actuacion JSONB DEFAULT '[]',
  plazo_seguridad VARCHAR(100),
  observaciones TEXT,
  hora_inicio TIME,
  hora_fin TIME,
  latitud DECIMAL(10, 8),
  longitud DECIMAL(11, 8),
  direccion_geo TEXT,
  firma_tecnico_url VARCHAR(255),
  firma_cliente_url VARCHAR(255),
  nombre_cliente_firma VARCHAR(100),
  estado VARCHAR(20) DEFAULT 'borrador',
  pdf_url VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Fotos de visitas
CREATE TABLE visita_fotos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  visita_id UUID REFERENCES visitas(id) ON DELETE CASCADE,
  foto_url VARCHAR(255) NOT NULL,
  descripcion VARCHAR(200),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Historial documentos del cliente
CREATE TABLE cliente_documentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id UUID REFERENCES clientes(id) ON DELETE CASCADE,
  visita_id UUID REFERENCES visitas(id) ON DELETE SET NULL,
  tipo_documento VARCHAR(100),
  archivo_url VARCHAR(255),
  fecha TIMESTAMPTZ DEFAULT now()
);

-- ================================================================
-- Row Level Security (RLS)
-- ================================================================
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE opciones_lista ENABLE ROW LEVEL SECURITY;
ALTER TABLE productos ENABLE ROW LEVEL SECURITY;
ALTER TABLE visitas ENABLE ROW LEVEL SECURITY;
ALTER TABLE visita_fotos ENABLE ROW LEVEL SECURITY;
ALTER TABLE cliente_documentos ENABLE ROW LEVEL SECURITY;

-- Políticas: solo usuarios autenticados pueden leer/escribir
CREATE POLICY "auth_all" ON clientes FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON opciones_lista FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON productos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON visitas FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON visita_fotos FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "auth_all" ON cliente_documentos FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ================================================================
-- Datos iniciales (opciones_lista)
-- ================================================================
INSERT INTO opciones_lista (tabla, categoria, valor, orden) VALUES
  ('descripcion_servicio', null, 'Revisión', 1),
  ('descripcion_servicio', null, 'Tratamiento inicial', 2),
  ('descripcion_servicio', null, 'Actualización de refuerzo', 3),
  ('tipo_servicio', null, 'Desinsectación', 1),
  ('tipo_servicio', null, 'Desratización', 2),
  ('tipo_servicio', null, 'Desinfección', 3),
  ('tipo_servicio', null, 'Muestreo de aguas', 4),
  ('lugar_actuacion', 'Viviendas/Comunidades', 'Falso techo', 1),
  ('lugar_actuacion', 'Viviendas/Comunidades', 'Perímetro', 2),
  ('lugar_actuacion', 'Viviendas/Comunidades', 'Arqueta', 3),
  ('lugar_actuacion', 'Viviendas/Comunidades', 'Desagüe', 4),
  ('lugar_actuacion', 'Hostelería', 'Cocina', 1),
  ('lugar_actuacion', 'Hostelería', 'Barra', 2),
  ('lugar_actuacion', 'Hostelería', 'Almacén', 3);

-- ================================================================
-- Storage buckets (ejecutar desde Dashboard > Storage o con service role)
-- ================================================================
-- Crear manualmente en Supabase Dashboard > Storage:
--   Bucket "pdfs"    → público: no
--   Bucket "firmas"  → público: no
--   Bucket "fotos"   → público: no
--   Bucket "planos"  → público: no
