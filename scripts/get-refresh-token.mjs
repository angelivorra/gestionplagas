import { createServer } from 'http'
import { google } from 'googleapis'

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET
const REDIRECT_URI = 'http://localhost:3001/callback'

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI)

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: [
    'https://www.googleapis.com/auth/drive',
    'https://www.googleapis.com/auth/documents',
  ],
})

console.log('\nAbre esta URL en el navegador:\n')
console.log(authUrl)
console.log('\nEsperando autorización...\n')

const server = createServer(async (req, res) => {
  const url = new URL(req.url, REDIRECT_URI)
  const code = url.searchParams.get('code')
  if (!code) { res.end('Sin código'); return }

  const { tokens } = await oauth2Client.getToken(code)
  res.end('<h2>✓ Autorizado. Puedes cerrar esta pestaña.</h2>')
  server.close()

  console.log('\n✓ GOOGLE_REFRESH_TOKEN:\n')
  console.log(tokens.refresh_token)
  console.log('\nActualiza esta variable en Vercel.\n')
}).listen(3001)
