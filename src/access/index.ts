import type { Access, FieldAccess, PayloadRequest } from 'payload'

export const roles = ['admin', 'editor', 'contributor'] as const
export type Role = (typeof roles)[number]

type MaybeUser = PayloadRequest['user']

export function hasRole(user: MaybeUser, ...allowed: Role[]): boolean {
  if (!user || user.collection !== 'users') return false
  const role = (user as { role?: Role }).role
  return Boolean(role && allowed.includes(role))
}

export const anyone: Access = () => true

export const isStaff: Access = ({ req: { user } }) => Boolean(user)

export const isAdmin: Access = ({ req: { user } }) => hasRole(user, 'admin')

export const isAdminOrEditor: Access = ({ req: { user } }) => hasRole(user, 'admin', 'editor')

export const isAdminField: FieldAccess = ({ req: { user } }) => hasRole(user, 'admin')

/** Public visitors only see published documents; any logged-in staff sees drafts too. */
export const publishedOrStaff: Access = ({ req: { user } }) => {
  if (user) return true
  return { _status: { equals: 'published' } }
}

/** Admin/editor: everything. Contributor: only documents they created. */
export const ownOrEditor: Access = ({ req: { user } }) => {
  if (hasRole(user, 'admin', 'editor')) return true
  if (hasRole(user, 'contributor')) return { createdBy: { equals: user!.id } }
  return false
}

/** Admin: any user. Others: only themselves. */
export const adminOrSelf: Access = ({ req: { user } }) => {
  if (hasRole(user, 'admin')) return true
  if (user) return { id: { equals: user.id } }
  return false
}

/** For `admin.hidden`, which receives the serialized client user. */
function clientRole(user: unknown): Role | undefined {
  return user && typeof user === 'object' && 'role' in user ? ((user as { role?: Role }).role ?? undefined) : undefined
}
export const hiddenUnlessAdmin = ({ user }: { user: unknown }) => clientRole(user) !== 'admin'
export const hiddenForContributor = ({ user }: { user: unknown }) => {
  const role = clientRole(user)
  return role !== 'admin' && role !== 'editor'
}
