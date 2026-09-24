'use client'

import { Button } from '@payloadcms/ui'
import { useSearchParams } from 'next/navigation'

/** Downloads the contact list as .xlsx, keeping whatever filters are active in the list view. */
export function ExportContacts() {
  const searchParams = useSearchParams()
  const params = new URLSearchParams()
  for (const [key, value] of searchParams.entries()) {
    if (key.startsWith('where')) params.append(key, value)
  }
  const query = params.toString()

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--base)' }}>
      <Button
        el="anchor"
        url={`/api/contact-submissions/export${query ? `?${query}` : ''}`}
        buttonStyle="secondary"
        size="small"
      >
        Xuất Excel
      </Button>
    </div>
  )
}
