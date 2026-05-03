import { google } from 'googleapis'
import { getOAuth2Client } from './auth'

interface EmailOptions {
  to: string
  subject: string
  body: string
  pdfUrl?: string
}

export async function sendEmail({ to, subject, body, pdfUrl }: EmailOptions): Promise<void> {
  const gmail = google.gmail({ version: 'v1', auth: getOAuth2Client() })

  const enlace = pdfUrl
    ? `\n\nPuede descargar el parte de trabajo en el siguiente enlace:\n${pdfUrl}`
    : ''

  const mensaje = `${body}${enlace}`

  const raw = [
    `To: ${to}`,
    `Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: base64',
    '',
    Buffer.from(mensaje).toString('base64'),
  ].join('\r\n')

  const encoded = Buffer.from(raw).toString('base64url')

  await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw: encoded },
  })
}
