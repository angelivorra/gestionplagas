/**
 * Script one-time para obtener el refresh token de Google.
 *
 * Uso:
 *   1. En Google Cloud Console → Credenciales → tu cliente OAuth:
 *      Añade http://localhost:3333 en "URIs de redireccionamiento autorizados"
 *   2. node scripts/get-google-token.mjs
 *   3. Se abrirá el navegador automáticamente (o abre la URL manualmente)
 *   4. Autoriza la app con la cuenta de Google de SACEBA
 *   5. El script captura el código solo y muestra el refresh_token
 */

import { google } from 'googleapis'
import * as http from 'http'

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const REDIRECT_URI = 'http://localhost:3333'
const PORT = 3333

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('ERROR: Define GOOGLE_CLIENT_ID y GOOGLE_CLIENT_SECRET en el entorno.')
  console.error('Ejemplo:')
  console.error('  $env:GOOGLE_CLIENT_ID="tu-client-id"')
  console.error('  $env:GOOGLE_CLIENT_SECRET="tu-client-secret"')
  console.error('  node scripts/get-google-token.mjs')
  process.exit(1)
}

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/gmail.send',
  ],
  prompt: 'consent',
})

console.log('\n=== OBTENER REFRESH TOKEN DE GOOGLE ===\n')
console.log('Abre esta URL en el navegador:\n')
console.log(authUrl)
console.log('\nEsperando autorización en http://localhost:3333 ...\n')

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`)
  const code = url.searchParams.get('code')
  const error = url.searchParams.get('error')

  if (error) {
    res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' })
    res.end(`<h2>Error: ${error}</h2><p>Puedes cerrar esta pestaña.</p>`)
    server.close()
    process.exit(1)
  }

  if (!code) {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    res.end('<p>Esperando...</p>')
    return
  }

  try {
    const { tokens } = await oauth2Client.getToken(code)
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    res.end('<h2>✓ Autorización completada</h2><p>Puedes cerrar esta pestaña y volver a la terminal.</p>')
    server.close()

    console.log('=== TOKEN OBTENIDO ===\n')
    console.log('Añade estas líneas a tu .env.local y a las variables de entorno de Vercel:\n')
    console.log(`GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}`)
    console.log('\n¡Listo!')
  } catch (err) {
    res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' })
    res.end(`<h2>Error al obtener token</h2><pre>${err.message}</pre>`)
    server.close()
    console.error('Error:', err.message)
    process.exit(1)
  }
})

server.listen(PORT, () => {})
