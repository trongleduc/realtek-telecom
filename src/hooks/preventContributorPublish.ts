import { APIError, type CollectionBeforeChangeHook } from 'payload'

import { hasRole } from '@/access'

export const preventContributorPublish: CollectionBeforeChangeHook = ({ data, req }) => {
  if (hasRole(req.user, 'contributor') && data._status === 'published') {
    throw new APIError('Cộng tác viên chỉ được lưu bản nháp. Biên tập viên sẽ duyệt và xuất bản.', 403, null, true)
  }
  return data
}
