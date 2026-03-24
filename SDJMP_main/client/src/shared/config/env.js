const env = {
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api',
  requestTimeout: Number(import.meta.env.VITE_API_TIMEOUT || 15000),
  appName: import.meta.env.VITE_APP_NAME || 'SkillMatch',
  isDevelopment: import.meta.env.DEV,
  enableDevAuth: import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEV_AUTH !== 'false',
  cloudinaryCloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '',
  cloudinaryUploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '',
}

export default env
