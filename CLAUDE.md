# SACEBA - Gestión de Plagas

App web para empresa de control de plagas. Gestiona visitas (PDTs), clientes y productos.

## Stack
- **Next.js 14** App Router + TypeScript
- **Supabase**: PostgreSQL + Auth (Google OAuth) + Storage
- **Tailwind CSS** + **shadcn/ui**
- **@react-pdf/renderer** (generación PDF)
- **react-signature-canvas** (firmas)
- Hosting: **Vercel** (gratuito)

## Comandos
```bash
npm run dev       # desarrollo (http://localhost:3000)
npm run build     # build producción
npm run lint      # linting
```

## Variables de entorno (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```

## Estructura clave
```
src/app/
  (auth)/login/          ← Login Google
  (app)/
    visitas/             ← PANTALLA PRINCIPAL: gestor visitas
    visitas/[id]/        ← Ficha visita / formulario PDT
    clientes/            ← CRUD clientes
    productos/           ← CRUD productos
src/components/
  CreatableCombobox      ← Dropdown con opción "crear nuevo" (guarda en opciones_lista)
  SignatureCanvas        ← Firma táctil (react-signature-canvas)
  GeolocalizacionBtn     ← navigator.geolocation → guarda lat/lon
  FotosGrid              ← Subida fotos cámara → Supabase Storage
src/lib/
  supabase/              ← cliente Supabase (browser + server)
  pdf/                   ← PDFDocument con @react-pdf/renderer
```

## Base de datos (tablas principales)
| Tabla | Propósito |
|-------|-----------|
| `clientes` | Nombre comercial, nombre, DNI, dirección, email, plano_url |
| `visitas` | PDT: cliente_id, fecha, servicios, producto, geolocalizacion, firmas, estado, pdf_url |
| `visita_fotos` | Fotos adjuntas a una visita (foto_url, visita_id) |
| `productos` | Catálogo de productos con nº registro y plazo seguridad |
| `opciones_lista` | Tablas auxiliares dinámicas: tabla + categoria + valor |
| `cliente_documentos` | Historial de PDFs por cliente |

## Tablas auxiliares dinámicas
`opciones_lista.tabla` puede ser: `descripcion_servicio`, `tipo_servicio`, `lugar_actuacion`
`opciones_lista.categoria` para lugar_actuacion: `Viviendas/Comunidades`, `Hostelería`, null

El componente `CreatableCombobox` llama a `POST /api/opciones/[tabla]` para añadir valores nuevos al vuelo.

## Flujo principal
1. Login Google → `/visitas` (tabs: Activas / Todas)
2. Nueva visita → seleccionar cliente → formulario PDT
3. Guardar borrador en cualquier momento
4. Cerrar PDT → genera PDF → sube a Storage → historial cliente
5. Descargar PDF + botón "Abrir Gmail" (abre compose con to/subject pre-relleno)

## Convenciones
- Idioma UI: **español**
- Formularios: react-hook-form + zod
- API routes en `src/app/api/` devuelven `{ data, error }`
- Storage buckets: `pdfs`, `firmas`, `fotos`, `planos`
- Sin comentarios en código salvo WHY no obvio
- Mobile-first: la app se usa principalmente desde móvil/tablet en campo
