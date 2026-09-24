import type { ServerProps } from 'payload'

/** Dashboard card linking staff to the company CRM (SRS FR-S1). Renders nothing until a CRM URL is configured. */
export async function CrmLink({ payload }: ServerProps) {
  const settings = await payload.findGlobal({ slug: 'site-settings', depth: 0 })
  const url = settings?.crmUrl
  if (!url) return null

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--base)',
        padding: 'calc(var(--base) * 0.8) var(--base)',
        marginBottom: 'calc(var(--base) * 1.5)',
        border: '1px solid var(--theme-elevation-150)',
        borderRadius: 'var(--style-radius-m)',
        background: 'var(--theme-elevation-50)',
      }}
    >
      <div>
        <strong>Hệ thống CRM nội bộ</strong>
        <div style={{ color: 'var(--theme-elevation-600)', fontSize: 13 }}>{url}</div>
      </div>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className="btn btn--style-primary btn--size-small"
        style={{ margin: 0 }}
      >
        Mở CRM
      </a>
    </div>
  )
}
