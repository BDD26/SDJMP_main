const LOCAL_HOSTNAMES = new Set(['localhost', '127.0.0.1', '0.0.0.0'])

function isLocalHostname(hostname = '') {
  return LOCAL_HOSTNAMES.has(String(hostname || '').toLowerCase())
}

function resolveApiBaseUrl() {
  const configuredApiBaseUrl = String(import.meta.env.VITE_API_BASE_URL || '').trim()

  if (typeof window === 'undefined') {
    return configuredApiBaseUrl || 'http://localhost:5000/api'
  }

  const { origin, hostname } = window.location

  if (!configuredApiBaseUrl) {
    return isLocalHostname(hostname)
      ? 'http://localhost:5000/api'
      : new URL('/api', origin).toString()
  }

  if (configuredApiBaseUrl.startsWith('/')) {
    return configuredApiBaseUrl
  }

  try {
    const configuredUrl = new URL(configuredApiBaseUrl)

    if (isLocalHostname(configuredUrl.hostname) && !isLocalHostname(hostname)) {
      return new URL('/api', origin).toString()
    }
  } catch {
    return configuredApiBaseUrl
  }

  return configuredApiBaseUrl
}

const env = {
  apiBaseUrl: resolveApiBaseUrl(),
  requestTimeout: Number(import.meta.env.VITE_API_TIMEOUT || 15000),
  appName: import.meta.env.VITE_APP_NAME || 'SkillMatch',
  isDevelopment: import.meta.env.DEV,
  enableDevAuth: import.meta.env.DEV && import.meta.env.VITE_ENABLE_DEV_AUTH !== 'false',
  cloudinaryCloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '',
  cloudinaryUploadPreset: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || '',
}

export default env
