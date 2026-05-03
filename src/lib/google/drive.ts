import { google } from 'googleapis'
import { Readable } from 'stream'
import { getOAuth2Client } from './auth'

function getDrive() {
  return google.drive({ version: 'v3', auth: getOAuth2Client() })
}

export async function getOrCreateFolder(name: string, parentId?: string): Promise<string> {
  const drive = getDrive()
  const query = [
    `name = '${name}'`,
    `mimeType = 'application/vnd.google-apps.folder'`,
    `trashed = false`,
    parentId ? `'${parentId}' in parents` : `'root' in parents`,
  ].join(' and ')

  const { data } = await drive.files.list({ q: query, fields: 'files(id)', pageSize: 1 })
  if (data.files && data.files.length > 0) return data.files[0].id!

  const { data: created } = await drive.files.create({
    requestBody: {
      name,
      mimeType: 'application/vnd.google-apps.folder',
      parents: parentId ? [parentId] : undefined,
    },
    fields: 'id',
  })
  return created.id!
}

export async function uploadToDrive(
  buffer: Buffer | Uint8Array,
  filename: string,
  mimeType: string,
  folderId: string,
): Promise<{ id: string; webViewLink: string }> {
  const drive = getDrive()
  const stream = Readable.from(Buffer.from(buffer))

  const { data } = await drive.files.create({
    requestBody: { name: filename, parents: [folderId] },
    media: { mimeType, body: stream },
    fields: 'id, webViewLink',
  })

  return { id: data.id!, webViewLink: data.webViewLink! }
}

export async function makePublic(fileId: string): Promise<void> {
  const drive = getDrive()
  await drive.permissions.create({
    fileId,
    requestBody: { role: 'reader', type: 'anyone' },
  })
}

export async function deleteFromDrive(fileId: string): Promise<void> {
  const drive = getDrive()
  await drive.files.delete({ fileId })
}

export function extractFileId(webViewLink: string): string | null {
  const match = webViewLink.match(/\/d\/([a-zA-Z0-9_-]+)/)
  return match ? match[1] : null
}
