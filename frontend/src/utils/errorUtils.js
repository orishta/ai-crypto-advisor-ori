export function extractError(err, fallback) {
  const detail = err.response?.data?.detail
  if (Array.isArray(detail)) {
    return detail.map(d => d.msg?.replace(/^Value error,\s*/i, '')).join(' · ')
  }
  return typeof detail === 'string' ? detail : fallback
}
