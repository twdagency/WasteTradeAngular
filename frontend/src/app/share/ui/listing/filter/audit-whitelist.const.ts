interface AuditRule {
  method: string;
  action: string;
  description: string;
}

export const AUDIT_WHITELIST: AuditRule[] = [
  { method: 'GET', action: '/audit-trails/export', description: 'Export audit logs' },
  { method: 'POST', action: '/company-documents', description: 'Upload company document' },
  { method: 'POST', action: '/company-documents/me', description: 'Upload my company document' },
  { method: 'POST', action: '/company-locations', description: 'Add new company location' },
  { method: 'GET', action: '/company-locations/{id}', description: 'View specific company location' },
  { method: 'PATCH', action: '/companies/{id}', description: 'Edit company' },
  { method: 'POST', action: '/listing-requests', description: 'Submit listing request' },
  { method: 'POST', action: '/listings', description: 'Create listing' },
  { method: 'DELETE', action: '/listings/{id}', description: 'Delete listing' },
  { method: 'PATCH', action: '/listings/{id}', description: 'Edit listing' },
  { method: 'GET', action: '/listings/admin/companies', description: 'Admin view listings by companies' },
  { method: 'POST', action: '/login', description: 'Log in' },
  { method: 'GET', action: '/logout', description: 'Log out' },
  { method: 'POST', action: '/offers', description: 'Create offer' },
  { method: 'PATCH', action: '/offers/{id}/accept', description: 'Accept offer' },
  { method: 'PATCH', action: '/offers/{id}/reject', description: 'Reject offer' },
  { method: 'PATCH', action: '/offers/admin/{id}/accept', description: 'Approve offer' },
  { method: 'PATCH', action: '/offers/admin/{id}/reject', description: 'Reject offer' },
  { method: 'PATCH', action: '/users/admin/{id}/approve', description: 'Approve user registration' },
  { method: 'PATCH', action: '/users/me', description: 'Update my profile' },
];
