import { getBySlug } from './data'

/**
 * Returns the external link for a document's download button. With the CMS switched off there is no counter;
 * src/cms/download.ts also increments `downloadCount` once the CMS is re-enabled.
 */
export async function resolveDownload(slug: string): Promise<string | null> {
  const doc = await getBySlug('documents', slug, 'vi')
  return doc?.externalUrl ?? null
}
