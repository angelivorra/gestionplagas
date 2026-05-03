import { google } from 'googleapis'
import { getOAuth2Client } from './auth'

interface EmailOptions {
  to: string
  subject: string
  body: string
  pdfUrl?: string
  pdfBuffer?: Buffer
  pdfFilename?: string
}

export async function sendEmail({ to, subject, body, pdfUrl, pdfBuffer, pdfFilename }: EmailOptions): Promise<void> {
  const gmail = google.gmail({ version: 'v1', auth: getOAuth2Client() })

  const enlace = pdfUrl
    ? `\n\nTambién puede ver el parte en línea:\n${pdfUrl}`
    : ''
  const mensaje = `${body}${enlace}`

  const boundary = 'saceba_boundary_' + Date.now()

  const parts: string[] = []

  if (pdfBuffer && pdfFilename) {
    parts.push(
      `--${boundary}`,
      'Content-Type: text/plain; charset=UTF-8',
      'Content-Transfer-Encoding: base64',
      '',
      Buffer.from(mensaje).toString('base64'),
      '',
      `--${boundary}`,
      `Content-Type: application/pdf; name="${pdfFilename}"`,
      'Content-Transfer-Encoding: base64',
      `Content-Disposition: attachment; filename="${pdfFilename}"`,
      '',
      pdfBuffer.toString('base64'),
      '',
      `--${boundary}--`,
    )
  } else {
    parts.push(
      `--${boundary}`,
      'Content-Type: text/plain; charset=UTF-8',
      'Content-Transfer-Encoding: base64',
      '',
      Buffer.from(mensaje).toString('base64'),
      '',
      `--${boundary}--`,
    )
  }

  const raw = [
    `To: ${to}`,
    `Subject: =?UTF-8?B?${Buffer.from(subject).toString('base64')}?=`,
    'MIME-Version: 1.0',
    `Content-Type: multipart/mixed; boundary="${boundary}"`,
    '',
    ...parts,
  ].join('\r\n')

  const encoded = Buffer.from(raw).toString('base64url')

  await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw: encoded },
  })
}
