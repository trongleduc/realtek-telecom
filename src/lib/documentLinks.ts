/** Hosts a document download link may point to (SRS FR-S2). */
const ALLOWED_HOSTS = ['drive.google.com', 'docs.google.com', 'onedrive.live.com', '1drv.ms']
const ALLOWED_SUFFIXES = ['.sharepoint.com']

export function isAllowedDocumentUrl(value: string): boolean {
  let url: URL
  try {
    url = new URL(value)
  } catch {
    return false
  }
  if (url.protocol !== 'https:') return false
  const host = url.hostname.toLowerCase()
  return ALLOWED_HOSTS.includes(host) || ALLOWED_SUFFIXES.some((suffix) => host.endsWith(suffix))
}
