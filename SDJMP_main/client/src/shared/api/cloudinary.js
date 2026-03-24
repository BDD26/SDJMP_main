import env from '@/shared/config/env'

function ensureCloudinaryConfig() {
  if (!env.cloudinaryCloudName || !env.cloudinaryUploadPreset) {
    throw new Error('Cloudinary upload is not configured')
  }
}

export async function uploadResumeAsset(file, { publicId, fileName } = {}) {
  ensureCloudinaryConfig()

  const formData = new FormData()
  formData.append('file', file, fileName || file?.name || 'resume.pdf')
  formData.append('upload_preset', env.cloudinaryUploadPreset)
  formData.append('folder', 'skillmatch/resumes')

  if (publicId) {
    formData.append('public_id', publicId)
  }

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${env.cloudinaryCloudName}/raw/upload`,
    {
      method: 'POST',
      body: formData,
    }
  )

  const payload = await response.json()

  if (!response.ok) {
    throw new Error(payload?.error?.message || 'Cloudinary upload failed')
  }

  return {
    fileUrl: payload.secure_url || payload.url || '',
    filePublicId: payload.public_id || '',
    bytes: payload.bytes || 0,
    originalFilename: payload.original_filename || fileName || file?.name || 'resume',
    format: payload.format || '',
    resourceType: payload.resource_type || 'raw',
  }
}
