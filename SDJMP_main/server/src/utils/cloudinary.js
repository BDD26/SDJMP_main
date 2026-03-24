import crypto from 'node:crypto'
import env from '../config/env.js'

function hasCloudinaryConfig() {
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
