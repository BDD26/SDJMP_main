import env from '@/shared/config/env'

function ensureCloudinaryConfig() {
  if (!env.cloudinaryCloudName || !env.cloudinaryUploadPreset) {
    throw new Error('Cloudinary upload is not configured')
  }
}

export async function uploadResumeAsset(file, { publicId, fileName } = {}) {
  // Try Cloudinary first
  try {
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
      storageProvider: 'cloudinary',
    }
  } catch (error) {
    // Fallback to local upload
    console.warn('Cloudinary upload failed, using local fallback:', error.message)
    
    const formData = new FormData()
    formData.append('file', file, fileName || file?.name)
    formData.append('name', fileName || file?.name || 'resume.pdf')
    
    const response = await fetch(`${env.apiBaseUrl}/upload/resume`, {
      method: 'POST',
      body: formData,
      credentials: 'include'
    })
    
    if (!response.ok) {
      const error = await response.json()
      throw new Error(error?.error || 'Local upload failed')
    }
    
    const result = await response.json()
    const serverBaseUrl = String(env.apiBaseUrl || '').replace(/\/api\/?$/i, '')
    return {
      fileUrl: `${serverBaseUrl}${result.resume.fileUrl}`,
      filePublicId: result.resume.filePublicId,
      bytes: result.resume.data?.size || file.size,
      originalFilename: fileName || file?.name || 'resume',
      format: fileName?.split('.').pop() || 'pdf',
      resourceType: 'raw',
      storageProvider: 'local',
    }
  }
}
