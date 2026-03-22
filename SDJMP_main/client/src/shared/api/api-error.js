import axios from 'axios'

export class ApiError extends Error {
  constructor({
    message = 'Something went wrong',
    status = 0,
    code = 'REQUEST_FAILED',
    fieldErrors = {},
    details = null,
  } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
    this.fieldErrors = fieldErrors
    this.details = details
  }
}

export function normalizeApiError(error) {
  if (error instanceof ApiError) {
    return error
  }

  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data || {}
    return new ApiError({
      message: responseData.message || error.message || 'Request failed',
      status: error.response?.status || 0,
      code: responseData.code || error.code || 'REQUEST_FAILED',
      fieldErrors:
        responseData.fieldErrors ||
        responseData.errors ||
        responseData.details?.fields ||
        {},
      details: responseData.details || responseData,
    })
  }

  return new ApiError({
    message: error?.message || 'Unexpected error',
    details: error,
  })
}
