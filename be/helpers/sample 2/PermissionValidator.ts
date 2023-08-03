/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable camelcase */
import getConfig from 'next/config';

// get public runtime settings
const {
  publicRuntimeConfig: { permissions }
} = getConfig();

const pagesPermissions = {
  listDocs: permissions.LIST_DOCUMENTS,
  newDoc: permissions.NEW_DOCUMENT,
  editDoc: permissions.EDIT_DOCUMENT,
  bulkUpload: permissions.MULTIPLE_DOCUMENTS,
  exportHistory: permissions.EXPORT_DOCUMENTS_HISTORY,
  listProds: permissions.LIST_PRODUCTS,
  listUsers: permissions.LIST_USERS,
  newUser: permissions.NEW_USER,
  editUser: permissions.EDIT_USER,
  settings: permissions.CONFIGURE_WEBAPP,
  webAppSettings: permissions.CONFIGURE_WEBAPP,
  apiKeys: permissions.LIST_API_KEYS,
  reports: permissions.LIST_REPORTS
};

export const Permissions = permissions;

export function hasPermission(permission: string, profile: { organizationProfiles: any[] }) {
  if (!profile.organizationProfiles || !profile.organizationProfiles[0]) {
    return false;
  }
  const { rolePermissions } = profile.organizationProfiles[0].role;
  const mapPermissions = rolePermissions.map((r) => r.permission.slug);

  return mapPermissions.includes(permission);
}

export function hasAccess(
  page:
    | 'listDocs'
    | 'newDoc'
    | 'editDoc'
    | 'bulkUpload'
    | 'exportHistory'
    | 'listProds'
    | 'listUsers'
    | 'newUser'
    | 'editUser'
    | 'settings'
    | 'webAppSettings'
    | 'apiKeys'
    | 'reports',
  profile: { organizationProfiles: any[] }
) {
  if (!profile.organizationProfiles || !profile.organizationProfiles[0]) {
    return false;
  }
  const { rolePermissions } = profile.organizationProfiles[0].role;
  const mapPermissions = rolePermissions.map((r) => r.permission.slug);
  const permission = pagesPermissions[page];

  return mapPermissions.includes(permission);
}
