# SACEBA - Gestión de Plagas

App web para empresa de control de plagas. Gestiona visitas (PDTs), clientes y productos.

## Stack
- **Next.js 16** App Router + TypeScript + React 19
- **Supabase**: PostgreSQL + Auth (Google OAuth) + Storage
- **MUI (@mui/material)** + Emotion (no Tailwind/shadcn)
- **@react-pdf/renderer** (generación PDF)
- **react-signature-canvas** (firmas)
- **googleapis**: Google Docs / Drive / Gmail (contratos y envío)
- Hosting: **Vercel** (gratuito)

## Comandos
```bash
npm run dev       # desarrollo (http://localhost:3000)
npm run build     # build producción
npm run start     # servir build de producción
```

## Variables de entorno (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
GOOGLE_CLIENT_ID=          # OAuth + Google APIs (Docs/Drive/Gmail)
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=
ALLOWED_EMAIL=             # email autorizado para entrar
CONTRATO_TEMPLATE_ID=      # Google Doc plantilla de contrato
CONTRATOS_FOLDER_ID=       # carpeta Drive destino de contratos
CERTIFICADO_TEMPLATE_ID=   # Google Doc plantilla de certificado
CERTIFICADOS_FOLDER_ID=    # carpeta Drive destino de certificados
```

## Estructura clave
```
src/
  app/
    (auth)/login/            ← Login Google OAuth
    (app)/                   ← Zona autenticada (layout con nav)
      visitas/               ← PANTALLA PRINCIPAL: gestor de visitas (PDTs)
        nueva/               ← Alta de visita
        [id]/                ← Ficha / formulario PDT
      clientes/              ← CRUD clientes (lista, nuevo, [id], [id]/editar)
      productos/             ← CRUD productos (lista, [id])
      ajustes/               ← Ajustes de la app
    api/                     ← API routes ({ data, error })
      auth/callback/         ← Callback OAuth
      visitas/               ← CRUD visitas + [id]/fotos
      clientes/              ← CRUD clientes
      productos/             ← CRUD productos + [id]/fichas
      opciones/[tabla]/      ← Alta de valores en tablas auxiliares dinámicas
      contratos/generar/     ← Genera contrato (Google Docs) → Drive
      pdf/[id]/              ← Genera/sirve PDF de la visita
      email/[id]/            ← Envío de email (Gmail)
  components/                ← Componentes cliente
    visita-form              ← Formulario PDT (núcleo)
    creatable-combobox       ← Dropdown con "crear nuevo" (→ opciones_lista)
    signature-pad            ← Firma táctil (react-signature-canvas)
    geolocalizacion-btn      ← navigator.geolocation → lat/lon
    fotos-grid               ← Subida fotos cámara → Supabase Storage
    cliente-*/producto-*/visitas-list/nav/page-container/theme-registry
  lib/
    supabase/                ← cliente Supabase (client.ts browser + server.ts)
    pdf/pdt-document.tsx     ← Documento PDF del parte (PDT)
    google/                  ← auth, docs, drive, gmail (googleapis)
    types.ts, utils.ts
  proxy.ts                   ← Middleware/proxy
supabase/schema.sql          ← Esquema de base de datos
scripts/                     ← gen_parte.py, get-google-token / get-refresh-token (mjs)
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
