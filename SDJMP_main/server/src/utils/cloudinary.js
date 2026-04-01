import crypto from 'node:crypto'
import fs from 'node:fs'
import env from '../config/env.js'

export function hasCloudinaryConfig() {
  return Boolean(
    env.cloudinaryCloudName &&
      env.cloudinaryApiKey &&
      env.cloudinaryApiSecret
  )
}

function signCloudinaryParams(params) {
  const sorted = Object.entries(params)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join('&')

  return crypto
    .createHash('sha1')
    .update(`${sorted}${env.cloudinaryApiSecret}`)
    .digest('hex')
}

export async function uploadCloudinaryImage(filePath, { folder, publicId } = {}) {
  if (!hasCloudinaryConfig()) {
    throw new Error('Cloudinary is not configured')
  }

  const formData = new FormData()
  formData.append('file', fs.createReadStream(filePath))
  if (folder) {
    formData.append('folder', folder)
  }
  if (publicId) {
    formData.append('public_id', publicId)
  }

  const timestamp = Math.floor(Date.now() / 1000)
  formData.append('timestamp', String(timestamp))

  const paramsForSignature = { timestamp }
  if (folder) paramsForSignature.folder = folder
  if (publicId) paramsForSignature.public_id = publicId

  const signature = signCloudinaryParams(paramsForSignature)
  formData.append('api_key', env.cloudinaryApiKey)
  formData.append('signature', signature)

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${env.cloudinaryCloudName}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  )

  const payload = await response.json()
  if (!response.ok) {
    throw new Error(payload?.error?.message || `Cloudinary upload failed with status ${response.status}`)
  }

  return payload
}

export async function destroyCloudinaryRawAsset(publicId) {
  if (!publicId || !hasCloudinaryConfig()) {
    return false
  }

  const timestamp = Math.floor(Date.now() / 1000)
  const signature = signCloudinaryParams({
    public_id: publicId,
    resource_type: 'raw',
    timestamp,
  })

  const formData = new URLSearchParams({
    public_id: publicId,
    resource_type: 'raw',
    timestamp: String(timestamp),
    api_key: env.cloudinaryApiKey,
    signature,
  })

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${env.cloudinaryCloudName}/raw/destroy`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: formData.toString(),
    }
  )

  if (!response.ok) {
    const payload = await response.text()
    throw new Error(`Cloudinary destroy failed: ${payload}`)
  }

  return true
}
